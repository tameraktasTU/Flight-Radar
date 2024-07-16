from flask import Flask, render_template, request, jsonify, send_from_directory
import requests
import math

app = Flask(__name__,)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/get_flights", methods=["POST"])
def get_flights():
    lat = float(request.json["lat"])
    lon = float(request.json["lon"])
    radius = float(request.json["radius"])
    
    # OpenSky API'sine istek gönder
    url = f"https://opensky-network.org/api/states/all?lamin={lat-1}&lomin={lon-1}&lamax={lat+1}&lomax={lon+1}"
    response = requests.get(url)
    data = response.json()
    flight_data = []
    if data["states"]:
        for state in data["states"]:
            flight_lat, flight_lon = state[6], state[5]
            distance = calculate_distance(lat, lon, flight_lat, flight_lon)
            if distance <= radius:
                flight_data.append({
                    "icao24": state[0],
                    "callsign": state[1].strip() if state[1] else "N/A",
                    "origin_country": state[2],
                    "altitude": f"{state[7]}m" if state[7] else "N/A",
                    "velocity": f"{round(float(state[9]) * 3.6, 2)} km/h" if state[9] else "N/A",
                    "true_track": f"{state[10]}°" if state[10] else "N/A",
                    "latitude": state[6],
                    "longitude": state[5],
                    "on_ground": state[8],
                    "vertical_speed": f"{round(float(state[11]) * 196.850394, 2)} fpm" if state[11] else "N/A"
                })
    return jsonify(flight_data)

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Earth's radius in km
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2) * math.sin(dLat/2) + math.cos(math.radians(lat1)) \
        * math.cos(math.radians(lat2)) * math.sin(dLon/2) * math.sin(dLon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = R * c
    return distance

if __name__ == "__main__":
    app.run(debug=True)