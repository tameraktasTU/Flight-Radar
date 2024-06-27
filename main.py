from flask import Flask, render_template_string, request, jsonify, send_from_directory
import requests
import math
import os

app = Flask(__name__, static_folder='.')

# HTML şablonu
INDEX_TEMPLATE = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Çok Dilli Uçuş Takip Uygulaması</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .glass-morphism {
            background: rgba(255, 255, 255, 0.25);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .fancy-table {
            border-collapse: separate;
            border-spacing: 0;
            width: 100%;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .fancy-table th, .fancy-table td {
            padding: 12px 15px;
            text-align: left;
        }
        .fancy-table thead {
            background-color: #8B5CF6;
            color: white;
        }
        .fancy-table tbody tr:nth-child(even) {
            background-color: rgba(255, 255, 255, 0.8);
        }
        .fancy-table tbody tr:nth-child(odd) {
            background-color: rgba(255, 255, 255, 0.6);
        }
    </style>
</head>
<body class="min-h-screen py-6 flex flex-col justify-center sm:py-12">
    <div class="relative py-3 sm:max-w-5xl sm:mx-auto">
        <div class="glass-morphism relative px-4 py-10 shadow-lg sm:rounded-3xl sm:p-20">
            <div class="max-w-5xl mx-auto">
                <div id="logo" class="w-32 h-32 mx-auto mb-4 bg-contain bg-no-repeat bg-center" style="background-image: url('/logo.png');"></div>
                <h1 id="mainTitle" class="text-3xl font-semibold mb-6 text-center text-white">Çok Dilli Uçuş Takip</h1>
                
                <div class="mb-4 text-center">
                    <select id="languageSelect" class="px-4 py-2 rounded-md">
                        <option value="en">🇬🇧 English</option>
                        <option value="ru">🇷🇺 Русский</option>
                        <option value="de">🇩🇪 Deutsch</option>
                        <option value="tr">🇹🇷 Türkçe</option>
                        <option value="es">🇪🇸 Español</option>
                        <option value="fr">🇫🇷 Français</option>
                    </select>
                </div>
                
                <p id="locationLabel" class="mb-4 text-center text-white"></p>
                
                <div class="mb-6">
                    <input type="range" id="radiusSlider" min="10" max="250" value="100" class="w-full">
                    <p class="text-white text-center"><span id="radiusLabel"></span>: <span id="radiusValue">100</span> km</p>
                </div>

                <button id="refreshBtn" class="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    <span id="refreshLabel"></span>
                </button>

                <div class="overflow-x-auto mt-6">
                    <table id="flightTable" class="fancy-table">
                        <thead>
                            <tr>
                                <th>ICAO24</th>
                                <th id="thCallsign"></th>
                                <th id="thCountry"></th>
                                <th id="thAltitude"></th>
                                <th id="thSpeed"></th>
                                <th id="thDirection"></th>
                                <th id="thLatitude"></th>
                                <th id="thLongitude"></th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
                <p id="flightCount" class="mt-4 text-center text-white"></p>
                <button id="downloadBtn" class="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    <span id="downloadLabel"></span>
                </button>
            </div>
        </div>
    </div>

    <script>
    const translations = {
        en: {
            mainTitle: "Multilingual Flight Tracker",
            locationLabel: "Location",
            radiusLabel: "Search Radius",
            refreshLabel: "Refresh Flights",
            downloadLabel: "Download Table as JPG",
            thCallsign: "Callsign",
            thCountry: "Country",
            thAltitude: "Altitude (m)",
            thSpeed: "Speed (km/h)",
            thDirection: "Direction (°)",
            thLatitude: "Latitude",
            thLongitude: "Longitude",
            flightCountLabel: "Total flights found:"
        },
        ru: {
            mainTitle: "Многоязычный трекер полетов",
            locationLabel: "Местоположение",
            radiusLabel: "Радиус поиска",
            refreshLabel: "Обновить рейсы",
            downloadLabel: "Скачать таблицу как JPG",
            thCallsign: "Позывной",
            thCountry: "Страна",
            thAltitude: "Высота (м)",
            thSpeed: "Скорость (км/ч)",
            thDirection: "Направление (°)",
            thLatitude: "Широта",
            thLongitude: "Долгота",
            flightCountLabel: "Всего найдено рейсов:"
        },
        de: {
            mainTitle: "Mehrsprachiger Flugverfolger",
            locationLabel: "Standort",
            radiusLabel: "Suchradius",
            refreshLabel: "Flüge aktualisieren",
            downloadLabel: "Tabelle als JPG herunterladen",
            thCallsign: "Rufzeichen",
            thCountry: "Land",
            thAltitude: "Höhe (m)",
            thSpeed: "Geschwindigkeit (km/h)",
            thDirection: "Richtung (°)",
            thLatitude: "Breite",
            thLongitude: "Länge",
            flightCountLabel: "Insgesamt gefundene Flüge:"
        },
        tr: {
            mainTitle: "Çok Dilli Uçuş Takip",
            locationLabel: "Konum",
            radiusLabel: "Arama Yarıçapı",
            refreshLabel: "Uçuşları Yenile",
            downloadLabel: "Tabloyu JPG olarak İndir",
            thCallsign: "Çağrı Kodu",
            thCountry: "Ülke",
            thAltitude: "Yükseklik (m)",
            thSpeed: "Hız (km/s)",
            thDirection: "Yön (°)",
            thLatitude: "Enlem",
            thLongitude: "Boylam",
            flightCountLabel: "Toplam bulunan uçuş:"
        },
        es: {
            mainTitle: "Rastreador de vuelos multilingüe",
            locationLabel: "Ubicación",
            radiusLabel: "Radio de búsqueda",
            refreshLabel: "Actualizar vuelos",
            downloadLabel: "Descargar tabla como JPG",
            thCallsign: "Indicativo",
            thCountry: "País",
            thAltitude: "Altitud (m)",
            thSpeed: "Velocidad (km/h)",
            thDirection: "Dirección (°)",
            thLatitude: "Latitud",
            thLongitude: "Longitud",
            flightCountLabel: "Total de vuelos encontrados:"
        },
        fr: {
            mainTitle: "Suivi de vol multilingue",
            locationLabel: "Emplacement",
            radiusLabel: "Rayon de recherche",
            refreshLabel: "Actualiser les vols",
            downloadLabel: "Télécharger le tableau en JPG",
            thCallsign: "Indicatif",
            thCountry: "Pays",
            thAltitude: "Altitude (m)",
            thSpeed: "Vitesse (km/h)",
            thDirection: "Direction (°)",
            thLatitude: "Latitude",
            thLongitude: "Longitude",
            flightCountLabel: "Total des vols trouvés:"
        }
    };

    function updateLanguage(lang) {
        document.getElementById('mainTitle').textContent = translations[lang].mainTitle;
        document.getElementById('locationLabel').textContent = translations[lang].locationLabel;
        document.getElementById('radiusLabel').textContent = translations[lang].radiusLabel;
        document.getElementById('refreshLabel').textContent = translations[lang].refreshLabel;
        document.getElementById('downloadLabel').textContent = translations[lang].downloadLabel;
        document.getElementById('thCallsign').textContent = translations[lang].thCallsign;
        document.getElementById('thCountry').textContent = translations[lang].thCountry;
        document.getElementById('thAltitude').textContent = translations[lang].thAltitude;
        document.getElementById('thSpeed').textContent = translations[lang].thSpeed;
        document.getElementById('thDirection').textContent = translations[lang].thDirection;
        document.getElementById('thLatitude').textContent = translations[lang].thLatitude;
        document.getElementById('thLongitude').textContent = translations[lang].thLongitude;
        updateFlightCount();
    }

    document.getElementById('languageSelect').addEventListener('change', function() {
        updateLanguage(this.value);
    });

    const radiusSlider = document.getElementById('radiusSlider');
    const radiusValue = document.getElementById('radiusValue');
    let currentLat, currentLon;

    radiusSlider.oninput = function() {
        radiusValue.textContent = this.value;
    }

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    }

    function showPosition(position) {
        currentLat = position.coords.latitude;
        currentLon = position.coords.longitude;
        getCity(currentLat, currentLon);
        getFlights(currentLat, currentLon);
    }

    function showError(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                alert("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                alert("Location information is unavailable.");
                break;
            case error.TIMEOUT:
                alert("The request to get user location timed out.");
                break;
            case error.UNKNOWN_ERROR:
                alert("An unknown error occurred.");
                break;
        }
    }

    function getCity(lat, lon) {
        axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
            .then(response => {
                const city = response.data.address.city || response.data.address.town || response.data.address.village || 'Unknown City';
                const lang = document.getElementById('languageSelect').value;
                document.getElementById('locationLabel').innerText = `${translations[lang].locationLabel}: ${lat.toFixed(4)}, ${lon.toFixed(4)} (${city})`;
            })
            .catch(error => console.error('Error:', error));
    }

    function getFlights(lat, lon) {
        const radius = radiusSlider.value;
        axios.post('/get_flights', { lat, lon, radius })
            .then(response => {
                const flights = response.data;
                const tableBody = document.querySelector('#flightTable tbody');
                tableBody.innerHTML = '';
                flights.forEach(flight => {
                    const row = `
                        <tr>
                            <td>${flight.icao24}</td>
                            <td>${flight.callsign}</td>
                            <td>${flight.origin_country}</td>
                            <td>${flight.altitude}</td>
                            <td>${flight.velocity}</td>
                            <td>${flight.true_track}</td>
                            <td>${flight.latitude}</td>
                            <td>${flight.longitude}</td>
                        </tr>
                    `;
                    tableBody.innerHTML += row;
                });
                updateFlightCount();
            })
            .catch(error => console.error('Error:', error));
    }

    function updateFlightCount() {
        const lang = document.getElementById('languageSelect').value;
        const flightCount = document.querySelector('#flightTable tbody').childElementCount;
        document.getElementById('flightCount').innerText = `${translations[lang].flightCountLabel} ${flightCount}`;
    }

    document.getElementById('refreshBtn').addEventListener('click', function() {
        getFlights(currentLat, currentLon);
    });

    document.getElementById('downloadBtn').addEventListener('click', function() {
        html2canvas(document.querySelector("#flightTable")).then(canvas => {
            const link = document.createElement('a');
            link.download = 'flight_table.jpg';
            link.href = canvas.toDataURL("image/jpeg");
            link.click();
        });
    });

    getLocation();
    updateLanguage('en');  // Set default language to English
    </script>
</body>
</html>
'''
from flask import Flask, render_template_string, request, jsonify, send_from_directory
import requests
import math
import os

app = Flask(__name__, static_folder='.')

# HTML şablonu ve diğer kodlar buraya gelecek...

@app.route('/')
def index():
    return render_template_string(INDEX_TEMPLATE)

@app.route('/logo.png')
def serve_logo():
    return send_from_directory('.', 'logo.png')

@app.route('/get_flights', methods=['POST'])
def get_flights():
    lat = float(request.json['lat'])
    lon = float(request.json['lon'])
    radius = float(request.json['radius'])
    
    # OpenSky API'sine istek gönder
    url = f"https://opensky-network.org/api/states/all?lamin={lat-1}&lomin={lon-1}&lamax={lat+1}&lomax={lon+1}"
    response = requests.get(url)
    data = response.json()
    
    flight_data = []
    if data['states']:
        for state in data['states']:
            flight_lat, flight_lon = state[6], state[5]
            distance = calculate_distance(lat, lon, flight_lat, flight_lon)
            
            if distance <= radius:
                flight_data.append({
                    'icao24': state[0],
                    'callsign': state[1].strip() if state[1] else "N/A",
                    'origin_country': state[2],
                    'altitude': f"{state[7]} m" if state[7] else "N/A",
                    'velocity': f"{round(float(state[9]) * 3.6, 2)} km/h" if state[9] else "N/A",
                    'true_track': f"{state[10]}°" if state[10] else "N/A",
                    'latitude': state[6],
                    'longitude': state[5]
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

if __name__ == '__main__':
    app.run(debug=True)