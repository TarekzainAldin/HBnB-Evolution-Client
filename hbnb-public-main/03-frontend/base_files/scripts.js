document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    populateCountrySelect(); // Populate the country dropdown

    // Login form handling
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();  // Prevent the default form submission
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://127.0.0.1:5000/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    document.cookie = `token=${data.access_token}; path=/; Secure; SameSite=Strict`;
                    window.location.href = 'index.html';
                } else {
                    const errorData = await response.json();
                    alert(`Login failed: ${errorData.msg || response.statusText}`);
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('An error occurred. Please try again.');
            }
        });
    }

    // Check if the user is authenticated and display places
    checkAuthentication();
    
    // Country filter handling
    document.getElementById('country-select').addEventListener('change', (event) => {
        const selectedCountry = event.target.value;
        filterPlacesByCountry(selectedCountry);
    });
});

// Function to get the value of a cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Check authentication status and fetch places if authenticated
async function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.querySelector('.login-button');

    if (!token) {
        loginLink.style.display = 'block';
    } else {
        loginLink.style.display = 'none';
        await fetchPlaces(token); // Fetch places data if the user is authenticated
    }
}

// Fetch places data from the API
async function fetchPlaces(token) {
    try {
        const response = await fetch('http://127.0.0.1:5000/places', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const places = await response.json();
            console.log('Fetched places:', places); // Debug log
            displayPlaces(places);
        } else {
            console.error('Failed to fetch places:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching places:', error);
    }
}

// Display places on the page
function displayPlaces(places) {
    const placesList = document.getElementById('places-list');
    placesList.innerHTML = ''; // Clear existing places

    places.forEach(place => {
        const placeCard = document.createElement('div');
        placeCard.className = 'place-card';
        placeCard.dataset.country = place.country_code; // Store country code in data attribute
        placeCard.innerHTML = `
            <img src="place1.jpg" alt="${place.description}" class="place-image">
            <h2>${place.description}</h2>
            <p>Price per night: $${place.price_per_night}</p>
            <p>Location: ${place.city_name}, ${place.country_name}</p>
            <button class="details-button" onclick="window.location.href='place.html?id=${place.id}';">View Details</button>
        `;
        placesList.appendChild(placeCard);
    });
}

// Populate the country select dropdown
async function populateCountrySelect() {
    const countrySelect = document.getElementById('country-select');

    try {
        const response = await fetch('/home/tarek/HBnB-Evolution-Client/hbnb-public-main/03-frontend/mock-api/data/countries.json   '); // Replace with the correct path
        if (response.ok) {
            const countries = await response.json();
            console.log('Fetched countries:', countries); // Debug log
            countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country.code;
                option.text = country.name;
                countrySelect.appendChild(option);
            });
        } else {
            console.error('Failed to load countries:', response.statusText);
        }
    } catch (error) {
        console.error('Error loading countries:', error);
    }
}

// Filter places by selected country
function filterPlacesByCountry(countryCode) {
    console.log('Filtering by country code:', countryCode); // Debug log
    const placeCards = document.querySelectorAll('.place-card');

    placeCards.forEach(card => {
        const cardCountryCode = card.dataset.country; // Retrieve country code from data attribute
        console.log('Card country code:', cardCountryCode); // Debug log
        card.style.display = cardCountryCode === countryCode || countryCode === '' ? 'block' : 'none';
    });
}
