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
    const countrySelect = document.getElementById('country-select');
    if (countrySelect) {
        countrySelect.addEventListener('change', (event) => {
            const selectedCountry = event.target.value;
            filterPlacesByCountry(selectedCountry);
        });
    }

    // For Place Details page
    if (window.location.pathname.includes('place.html')) {
        const placeId = getPlaceIdFromURL();
        const token = getCookie('token');
        if (token) {
            fetchPlaceDetails(token, placeId);
        } else {
            alert("You need to log in to view place details.");
            window.location.href = 'login.html';
        }

        // Handle review form submission on place.html
        const reviewForm = document.getElementById('review-form');
        if (reviewForm) {
            reviewForm.addEventListener('submit', async (event) => {
                event.preventDefault(); // Prevent default form submission

                const reviewText = document.getElementById('review-text').value;
                const rating = document.getElementById('rating').value;

                // Submit the review
                await submitReview(token, placeId, reviewText, rating);
            });
        }
    }
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
    const loginLink = document.querySelector('.login-button a');
    const addReviewSection = document.getElementById('add-review');

    if (loginLink) {
        if (!token) {
            loginLink.style.display = 'block';
            if (addReviewSection) addReviewSection.style.display = 'none';
        } else {
            loginLink.style.display = 'none';
            if (addReviewSection) addReviewSection.style.display = 'block';
            await fetchPlaces(token); // Fetch places data if the user is authenticated
        }
    }
    return token; // Return the token for further use
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
    if (!placesList) {
        console.error("No element with ID 'places-list' found.");
        return;
    }

    placesList.innerHTML = ''; // Clear existing places

    places.forEach(place => {
        const placeCard = document.createElement('div');
        placeCard.className = 'place-card';
        placeCard.dataset.country = place.country_code; // Store country code in data attribute
        placeCard.innerHTML = `
            
            <img src="place1.jpg" alt="${place.description}" class="place-image">
            url
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
    if (!countrySelect) return;

    try {
        const response = await fetch('/home/tarek/HBnB-Evolution-Client/hbnb-public-main/03-frontend/mock-api/data/countries.json');
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

// Get place ID from URL
function getPlaceIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Fetch place details from the API
async function fetchPlaceDetails(token, placeId) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/places/${placeId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const place = await response.json();
            displayPlaceDetails(place);
            displayReviews(place.reviews); // Ensure this function is called
        } else {
            console.error('Failed to fetch place details:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching place details:', error);
    }
}

// Display place details
function displayPlaceDetails(place) {
    const placeDetailsSection = document.getElementById('place-details');
    if (!placeDetailsSection) {
        console.error("No element with ID 'place-details' found.");
        return;
    }

    placeDetailsSection.innerHTML = `
        <h1>${place.description}</h1>
        <div class="place-info">
            <p><strong>Host:</strong> ${place.host_name}</p>
            <p><strong>Price per night:</strong> $${place.price_per_night}</p>
            <p><strong>Location:</strong> ${place.city_name}, ${place.country_name}</p>
            <p><strong>Description:</strong> ${place.description}</p>
            <p><strong>Amenities:</strong> ${place.amenities.join(', ')}</p>
        </div>
    `;
}

// Display reviews for the place
function displayReviews(reviews) {
    const reviewsSection = document.getElementById('reviews');
    if (!reviewsSection) {
        console.error("No element with ID 'reviews' found.");
        return;
    }

    reviewsSection.innerHTML = ''; // Clear existing reviews

    reviews.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'review';
        reviewElement.innerHTML = `
            <p><strong>${review.user_name}</strong></p>
            <p>${review.comment}</p>
            <p><strong>Rating:</strong> ${'⭐'.repeat(review.rating)}</p> <!-- Display star rating -->
        `;
        reviewsSection.appendChild(reviewElement);
    });
}

// // Submit review for the place
// async function submitReview(token, placeId, reviewText, rating) {
//     try {
//         const response = await fetch(`http://127.0.0.1:5000/places/${placeId}/reviews`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             },
//             body: JSON.stringify({
//                 text: reviewText,
//                 rating: parseInt(rating, 10)
//             })
//         });

//         if (response.ok) {
//             const newReview = await response.json();
//             displayReviews([...document.querySelectorAll('.review').map(r => r.textContent), newReview]); // Update reviews with new review
//             alert('Review submitted successfully!');
//             document.getElementById('review-text').value = ''; // Clear review form
//             document.getElementById('rating').value = ''; // Clear rating form
//         } else {
//             const errorData = await response.json();
//             alert(`Failed to submit review: ${errorData.msg || response.statusText}`);
//         }
//     } catch (error) {
//         console.error('Error submitting review:', error);
//         alert('An error occurred. Please try again.');
//     }
// }
// Submit review for the place
// async function submitReview(token, placeId, reviewText, rating) {
//     try {
//         const response = await fetch(`http://127.0.0.1:5000/places/${placeId}/reviews`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             },
//             body: JSON.stringify({
//                 text: reviewText,
//                 rating: parseInt(rating, 10)
//             })
//         });

//         if (response.ok) {
//             const newReview = await response.json();
//             const reviewsSection = document.getElementById('reviews');
            
//             if (!reviewsSection) {
//                 console.error("No element with ID 'reviews' found.");
//                 return;
//             }

//             // Clear existing reviews and re-render with the new review
//             const existingReviews = Array.from(reviewsSection.querySelectorAll('.review'));
//             reviewsSection.innerHTML = ''; // Clear existing reviews

//             // Add the new review to the reviews section
//             existingReviews.forEach(review => reviewsSection.appendChild(review)); // Append old reviews
//             displayReviews([newReview]); // Display the new review

//             alert('Review submitted successfully!');
//             document.getElementById('review-text').value = ''; // Clear review form
//             document.getElementById('rating').value = ''; // Clear rating form
//         } else {
//             const errorData = await response.json();
//             alert(`Failed to submit review: ${errorData.msg || response.statusText}`);
//         }
//     } catch (error) {
//         console.error('Error submitting review:', error);
//         alert('An error occurred. Please try again.');
//     }
// }
// Submit review for the place
async function submitReview(token, placeId, reviewText, rating) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/places/${placeId}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                text: reviewText,
                rating: parseInt(rating, 10)
            })
        });

        if (response.ok) {
            const newReview = await response.json();
            const reviewsSection = document.getElementById('reviews');
            
            if (!reviewsSection) {
                console.error("No element with ID 'reviews' found.");
                return;
            }

            // Clear existing reviews and re-render with the new review
            reviewsSection.innerHTML = ''; // Clear existing reviews
            displayReviews([newReview]); // Display the new review

            alert('Review submitted successfully!');
            document.getElementById('review-form').reset(); // Clear review form
        } else {
            const errorData = await response.json();
            alert(`Failed to submit review: ${errorData.msg || response.statusText}`);
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        alert('An error occurred. Please try again.');
    }
}

// Setup event listener for review form
document.addEventListener('DOMContentLoaded', () => {
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission
            
            const reviewText = document.getElementById('review-text').value.trim();
            const rating = document.getElementById('rating').value;

            if (!reviewText) {
                alert('Please enter a review.');
                return;
            }

            // Retrieve the token and placeId from the cookies and URL respectively
            const token = getCookie('token');
            const placeId = getPlaceIdFromURL();

            // Submit the review
            await submitReview(token, placeId, reviewText, rating);
        });
    }
});

