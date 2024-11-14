// URLs for Google Sheets with credentials and cities data
const credentialsSheetURL = "https://spreadsheets.google.com/feeds/list/YOUR_CREDENTIALS_SHEET_ID/od6/public/values?alt=json";
const statesCitiesSheetURL = "https://spreadsheets.google.com/feeds/list/YOUR_STATES_CITIES_SHEET_ID/od6/public/values?alt=json";

// Fetch credentials from Google Sheets
let users = [];

fetch(credentialsSheetURL)
  .then(response => response.json())
  .then(data => {
    users = data.feed.entry.map(entry => ({
      username: entry.gsx$username.$t,
      password: entry.gsx$password.$t
    }));
  })
  .catch(error => console.error("Error fetching credentials data:", error));

// Fetch states and cities data from Google Sheets
let statesCities = {};

fetch(statesCitiesSheetURL)
  .then(response => response.json())
  .then(data => {
    const citiesData = data.feed.entry.map(entry => ({
      state: entry.gsx$state.$t,
      city: entry.gsx$city.$t
    }));
    
    // Group cities by state
    statesCities = citiesData.reduce((acc, { state, city }) => {
      if (!acc[state]) {
        acc[state] = [];
      }
      acc[state].push(city);
      return acc;
    }, {});
    
    // Populate states dropdown
    const stateSelect = document.getElementById("state-select");
    Object.keys(statesCities).forEach(state => {
      const option = document.createElement("option");
      option.value = state;
      option.textContent = state;
      stateSelect.appendChild(option);
    });
  })
  .catch(error => console.error("Error fetching states and cities data:", error));

// Handle login form submission
document.getElementById("login-form").addEventListener("submit", function(event) {
  event.preventDefault();
  
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  
  const user = users.find(user => user.username === username && user.password === password);
  
  if (user) {
    showStateCitySelection();
  } else {
    showPopup("Invalid username or password.");
  }
});

// Show the state/city selection page
function showStateCitySelection() {
  document.getElementById("login-container").style.display = "none";
  document.getElementById("state-city-container").style.display = "block";
  
  // Enable city dropdown based on selected state
  const stateSelect = document.getElementById("state-select");
  stateSelect.addEventListener("change", function() {
    const citySelect = document.getElementById("city-select");
    const selectedState = stateSelect.value;
    
    if (selectedState) {
      citySelect.disabled = false;
      citySelect.innerHTML = `<option value="">Select City</option>`;
      statesCities[selectedState].forEach(city => {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
      });
    } else {
      citySelect.disabled = true;
      citySelect.innerHTML = `<option value="">Select City</option>`;
    }
  });
}

// Show popup with message
function showPopup(message) {
  document.getElementById("popup-message").textContent = message;
  document.getElementById("popup").style.display = "block";
}

// Close the popup
function closePopup() {
  document.getElementById("popup").style.display = "none";
}
