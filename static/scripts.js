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

function updateLanguage(lang) {
    document.title = translations[lang].mainTitle;
    document.getElementById("mainTitle").textContent = translations[lang].mainTitle;
    document.getElementById("locationLabel").textContent = translations[lang].locationLabel;
    document.getElementById("radiusLabel").textContent = translations[lang].radiusLabel;
    document.getElementById("refreshLabel").textContent = translations[lang].refreshLabel;
    document.getElementById("downloadLabel").textContent = translations[lang].downloadLabel;
    document.getElementById("thCallsign").textContent = translations[lang].thCallsign;
    document.getElementById("thCountry").textContent = translations[lang].thCountry;
    document.getElementById("thAltitude").textContent = translations[lang].thAltitude;
    document.getElementById("thSpeed").textContent = translations[lang].thSpeed;
    document.getElementById("thDirection").textContent = translations[lang].thDirection;
    document.getElementById("thLatitude").textContent = translations[lang].thLatitude;
    document.getElementById("thLongitude").textContent = translations[lang].thLongitude;
    updateFlightCount();
}

document.getElementById("languageSelect").addEventListener("change", function () {
    updateLanguage(this.value);
});

const radiusSlider = document.getElementById("radiusSlider");
const radiusValue = document.getElementById("radiusValue");
let currentLat, currentLon;

radiusSlider.oninput = function () {
    radiusValue.textContent = this.value;
};

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

function getFlights(lat, lon) {
    const radius = radiusSlider.value;
    axios
        .post("/get_flights", { lat, lon, radius })
        .then((response) => {
            const flights = response.data;
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
            updateFlightCount();
        })
        .catch((error) => console.error("Error:", error));
}

function updateFlightCount() {
    const lang = document.getElementById("languageSelect").value;
    const flightCount = document.querySelector("#flightTable tbody").childElementCount;
    document.getElementById("flightCount").innerText = `${translations[lang].flightCountLabel} ${flightCount}`;
}

document.getElementById("refreshBtn").addEventListener("click", function () {
    getFlights(currentLat, currentLon);
});

document.getElementById("downloadBtn").addEventListener("click", function () {
    html2canvas(document.querySelector("#flightTable")).then((canvas) => {
        const link = document.createElement("a");
        link.download = "flight_table.jpg";
        link.href = canvas.toDataURL("image/jpeg");
        link.click();
    });
});

getLocation();
updateLanguage("en"); // Set default language to English
