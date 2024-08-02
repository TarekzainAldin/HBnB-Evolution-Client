# HBnB Evolution Project - Public access files


HBnB-Evolution
Project Overview
HBnB-Evolution is a web application that allows users to browse and review places. The project consists of a backend built with Flask and a frontend developed using HTML, CSS, and JavaScript.

Table of Contents
Project Setup
Running the Application
Folder Structure
Endpoints
Troubleshooting
Contributing
License
Project Setup
Prerequisites
Python 3.8 or higher
Node.js (for frontend tools)
venv (Python virtual environment)
git clone https://github.com/TarekzainAldin/HBnB-Evolution-Client.git
cd hbnb-evolution
python3 -m venv .venv

On Windows:
.venv\Scripts\activate

on macOS/linux
source .venv/bin/activate

pip install -r requirements.txt

flask run

npm install


.
├── hbnb/
│   ├── app.py
│   ├── config.py
│   ├── data/
│   │   ├── users.json
│   │   └── places.json
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── place.html
│   ├── add_review.html
│   ├── styles.css
│   └── scripts.js
└── README.md


Endpoints
POST /login

Logs in a user and returns a JWT token.
GET /places

Retrieves a list of all places.
GET /places/<place_id>

Retrieves details for a specific place.
POST /places/<place_id>/reviews

Adds a review for a specific place (requires authentication).
Troubleshooting
Common Issues
CORS Errors:

Ensure CORS is properly configured in your Flask app (flask_cors.CORS is used).
Verify that the frontend is using the correct URL for API requests.
File Not Found:

Ensure that all necessary files (users.json, places.json, countries.json, etc.) are located in the correct directories.
Verify file paths in your fetch requests in scripts.js.
Virtual Environment Issues:

Ensure the virtual environment is activated before running Flask or installing dependencies.
Checking the Network Tab
Use the browser's developer tools (Network tab) to inspect requests and responses to debug issues related to fetching resources or API calls.
Contributing
If you’d like to contribute to this project, please fork the repository and submit a pull request with your changes.

License
This project is licensed under the MIT License. See the LICENSE file for details.
