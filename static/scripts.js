// Çeviri nesnesi
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
        flightCountLabel: "Total flights found:",
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
        flightCountLabel: "Всего найдено рейсов:",
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
        flightCountLabel: "Insgesamt gefundene Flüge:",
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
        flightCountLabel: "Toplam bulunan uçuş:",
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
        flightCountLabel: "Total de vuelos encontrados:",
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
        flightCountLabel: "Total des vols trouvés:",
    },
};

let currentLat, currentLon;
const radiusSlider = document.getElementById("radiusSlider");
const radiusValue = document.getElementById("radiusValue");
const canvas = document.getElementById("radarCanvas");
const ctx = canvas.getContext("2d");
let currentFlights = []; // Mevcut uçuşları saklayacak global değişken

function updateLanguage(lang) {
    document.title = translations[lang].mainTitle;
    document.getElementById("mainTitle").textContent = translations[lang].mainTitle;
    document.getElementById("locationLabel").textContent = translations[lang].locationLabel;
    document.getElementById("radiusLabel").textContent = translations[lang].radiusLabel;
    document.getElementById("refreshBtn").textContent = translations[lang].refreshLabel;
    document.getElementById("downloadBtn").textContent = translations[lang].downloadLabel;

    document.getElementById("thCallsign").textContent = translations[lang].thCallsign;
    document.getElementById("thCountry").textContent = translations[lang].thCountry;
    document.getElementById("thAltitude").textContent = translations[lang].thAltitude;
    document.getElementById("thSpeed").textContent = translations[lang].thSpeed;
    document.getElementById("thDirection").textContent = translations[lang].thDirection;
    document.getElementById("thLatitude").textContent = translations[lang].thLatitude;
    document.getElementById("thLongitude").textContent = translations[lang].thLongitude;

    updateFlightCount(lang);
}

function updateFlightCount(lang) {
    const flightCount = document.querySelector("#flightTable tbody").childElementCount;
    document.getElementById("flightCount").innerHTML = `${translations[lang].flightCountLabel} <span class="text-blue-600">${flightCount}</span>`;
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
    switch (error.code) {
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
    axios
        .get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
        .then((response) => {
            const city = response.data.address.city || response.data.address.town || response.data.address.village || "Unknown City";
            const lang = document.getElementById("languageSelect").value;
            document.getElementById("locationLabel").innerText = `${translations[lang].locationLabel}: ${lat.toFixed(4)}, ${lon.toFixed(4)} (${city})`;
        })
        .catch((error) => console.error("Error:", error));
}

function initRadar() {
    const container = document.getElementById("radarContainer");
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    drawRadar();
    canvas.addEventListener("click", handleRadarClick);
}

function drawRadar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    ctx.fillStyle = "rgba(0, 31, 63, 0.1)";
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 255, 0, 0.5)";
    ctx.lineWidth = 1;

    for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (radius * i) / 4, 0, 2 * Math.PI);
        ctx.stroke();
    }
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
        ctx.stroke();
    }
}

function drawAirplane(ctx, x, y, size, bearing, on_ground, fpm) {
    const radians = bearing;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(radians);
    ctx.beginPath();
    ctx.moveTo(0, -size / 2); // Nose
    ctx.lineTo(size / 2, size / 2); // Right wing
    ctx.lineTo(0, size / 4); // Tail
    ctx.lineTo(-size / 2, size / 2); // Left wing
    ctx.closePath();
    if (!on_ground) {
        ctx.fillStyle = "yellow";
    } else {
        ctx.fillStyle = "red";
    }
    ctx.fill();
    if (!isNaN(fpm)) {
        const signX = size / 2 + 1.5; // Position the sign slightly to the right of the right wing
        const signY = 3; // Position the sign vertically centered with the airplane
        ctx.font = "12px Arial";
        ctx.fillStyle = "yellow";
        ctx.fillText(fpm > 0 ? "+" : "-", signX, signY);
    }
    ctx.restore();
}

function updateRadarPoints(flights) {
    drawRadar();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    ctx.fillStyle = "yellow";
    flights.forEach((flight) => {
        const lat = parseFloat(flight.latitude);
        const lon = parseFloat(flight.longitude);
        if (!isNaN(lat) && !isNaN(lon)) {
            const distance = calculateDistance(currentLat, currentLon, lat, lon);
            const radians = (parseFloat(flight.true_track.toString().replace("°", "")) * Math.PI) / 180;
            const maxDistance = parseFloat(radiusSlider.value);
            const normalizedDistance = Math.min(distance / maxDistance, 1);
            const x = centerX + Math.sin(radians) * normalizedDistance * radius;
            const y = centerY - Math.cos(radians) * normalizedDistance * radius;
            const on_ground = flight.on_ground;
            const fpm = parseFloat(flight.vertical_speed.toString().replace(" fpm", ""));
            const airplaneSize = 10; // Size of the airplane shape
            drawAirplane(ctx, x, y, airplaneSize, radians, on_ground, fpm);
            flight.radarX = x;
            flight.radarY = y;
        }
    });
    currentFlights = flights;
}

function handleRadarClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let closestFlight = null;
    let minDistance = Infinity;
    currentFlights.forEach((flight) => {
        if (flight.radarX && flight.radarY) {
            const distance = Math.sqrt(Math.pow(x - flight.radarX, 2) + Math.pow(y - flight.radarY, 2));
            if (distance < minDistance) {
                minDistance = distance;
                closestFlight = flight;
            }
        }
    });
    if (closestFlight && minDistance < 10) {
        showFlightInfo(closestFlight);
    }
}

function showFlightInfo(flight) {
    const popup = document.createElement("div");
    popup.className = "fixed z-10 inset-0 overflow-y-auto";
    popup.innerHTML = `
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Flight Information
                    </h3>
                    <div class="mt-2">
                        <p class="text-sm text-gray-500">
                            Callsign: ${flight.callsign}<br>
                            Country: ${flight.origin_country}<br>
                            Altitude: ${flight.altitude}<br>
                            Speed: ${flight.velocity}<br>
                            Direction: ${flight.true_track}<br>
                            Latitude: ${flight.latitude}<br>
                            Longitude: ${flight.longitude}<br>
                            On Ground: ${flight.on_ground}<br>
                            Vertical Speed: ${flight.vertical_speed}
                        </p>
                    </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" id="closePopup">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(popup);
    document.getElementById("closePopup").addEventListener("click", () => {
        document.body.removeChild(popup);
    });
}

function getFlights(lat, lon) {
    const radius = radiusSlider.value;
    axios
        .post("/get_flights", { lat, lon, radius })
        .then((response) => {
            const flights = response.data;
            updateFlightTable(flights);
            updateRadarPoints(flights);
            updateFlightCount(document.getElementById("languageSelect").value);
        })
        .catch((error) => console.error("Error:", error));
}

function updateFlightTable(flights) {
    const tableBody = document.querySelector("#flightTable tbody");
    tableBody.innerHTML = "";
    flights.forEach((flight) => {
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
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Dünya'nın yarıçapı (km)
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

const debouncedGetFlights = debounce(() => getFlights(currentLat, currentLon), 1000);

// Event Listeners
window.addEventListener("load", () => {
    initRadar();
    getLocation();
    updateLanguage("en"); // Varsayılan dili İngilizce olarak ayarla
});

window.addEventListener("resize", initRadar);

document.getElementById("refreshBtn").addEventListener("click", () => getFlights(currentLat, currentLon));

document.getElementById("languageSelect").addEventListener("change", function () {
    updateLanguage(this.value);
});

radiusSlider.addEventListener("input", function () {
    document.getElementById("radiusValue").textContent = this.value;
    debouncedGetFlights();
});

document.getElementById("downloadBtn").addEventListener("click", function () {
    html2canvas(document.querySelector("#flightTable")).then((canvas) => {
        const link = document.createElement("a");
        link.download = "flight_table.jpg";
        link.href = canvas.toDataURL("image/jpeg");
        link.click();
    });
});
