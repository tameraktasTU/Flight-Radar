# Flight-Radar

Flight-Radar is a multilingual web application that tracks and displays real-time flight data using the OpenSky Network API. Built with Python Flask, this application offers an interactive interface for viewing nearby flights with various customization options.

![Flight-Radar Screenshot](/static/img/readme.jpg)

## Features

-   Real-time flight tracking using OpenSky Network API
-   Multilingual support (English, Russian, German, Turkish, Spanish, French)
-   Automatic location detection for nearby flight information
-   Adjustable search radius
-   Interactive table displaying flight details
-   Download flight data as JPG
-   Audio notification for new detected flights
-   Dark/Light mode toggle
-   Responsive design for various devices

## Installation

Follow these steps to run the project on your local machine:

1. Clone the repository:
    ```
    git clone https://github.com/U-C4N/Flight-Radar.git
    cd Flight-Radar
    ```
2. Create and activate a virtual Python environment:
    ```
    python -m venv venv
    source venv/bin/activate  # For Windows: venv\Scripts\activate
    ```
3. Install the required packages:
    ```
    pip install -r requirements.txt
    ```
4. Run the application:
    ```
    python app.py
    ```
5. Open your browser and go to `http://127.0.0.1:5000/` to start using the application.

## Usage

1. Allow location access when prompted to view nearby flights.
2. Use the language selector to change the interface language.
3. Adjust the search radius using the slider to view more or fewer flights.
4. Click the "Refresh Flights" button to update the flight data.
5. Use the "Download Table as JPG" button to save the current flight data as an image.
6. Toggle between dark and light modes using the theme switch.

## Acknowledgments

-   [Flask](https://flask.palletsprojects.com/) - Web framework
-   [OpenSky Network API](https://opensky-network.org/apidoc/) - Flight data provider
-   [TailwindCSS](https://tailwindcss.com/) - CSS framework for styling
-   [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) - For interactive features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

U-C4N - [GitHub Profile](https://github.com/U-C4N)

Project Link: [https://github.com/U-C4N/Flight-Radar](https://github.com/U-C4N/Flight-Radar)
