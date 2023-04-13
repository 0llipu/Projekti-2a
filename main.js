// DOM Project2a, Javascript course, Laurea UAS, Commenting starts here.
// First we wait for the page to load, then we declare some variables.
// Event listener for listening the page to load and general variables are declared here beneath.

window.addEventListener('load', () => {
	let API_KEY = '71999687a3a8645a511abce5465479b5';
	let locationApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=`;
	let weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?`;
	let forecastApiUrl = 'https://api.openweathermap.org/data/2.5/forecast?';
	let units = 'metric';
	let input = document.querySelector('#input');
	let cityInput = document.querySelector('#city');
	let weatherForCurrentLocation = document.querySelector('#currentLocation');
	let pLocation = document.querySelector('#location p');
	let check24 = document.querySelector('#check24');
	let check72 = document.querySelector('#check72');

	// Eventlisteners for the "Current location"- and "Submit"- buttons

	weatherForCurrentLocation.addEventListener('click', geoFindMe);

	input.addEventListener('submit', (e) => {
		e.preventDefault();
		let city = e.target.elements.city.value;

		if (city !== '') {
			checkLocation(city);
		} else {
			alert("City input can't be empty!");
			console.log('error');
			return;
		}
	});

	// Function geoFindme for looking up the location of the browser and storing the latitude and longitude values for later use.

	async function geoFindMe() {
		function success(position) {
			const latitude = position.coords.latitude;
			const longitude = position.coords.longitude;
			pLocation.innerHTML = `Latitude: ${latitude}° <br> Longitude: ${longitude} °`;
			checkCurrentWeather(latitude, longitude); // As a default checking the current weather with the coordinates from current location right away
			clearForecast(); // Clearing forecast of any old locations
			hideForecast(); // Hiding forecast, as a default showing only current weather

			// Adding event listeners for the forecast buttons
			check24.addEventListener('click', (e) => {
				checkWeather24(latitude, longitude);
			});
			check72.addEventListener('click', (e) => {
				checkWeather72(latitude, longitude);
			});
		}
		// Default error message, if-else conditional with a timeout for the position lookup
		function error() {
			pLocation.textContent = 'Unable to retrieve your location';
		}

		if (!navigator.geolocation) {
			pLocation.textContent =
				'Geolocation is not supported by your browser';
		} else {
			pLocation.textContent = 'Locating…';
			navigator.geolocation.getCurrentPosition(success, error, {
				timeout: 5000,
			});
		}
	}

	// checkLocation function to check a city from user input
	async function checkLocation(city) {
		let locationData = {};
		let locationRequest = new XMLHttpRequest();
		// Initializing the AJAX Call to check the coordinates of a city that user has searched for
		// Getting the API URL, API KEY and user input from variables
		locationRequest.open(
			'GET',
			`${locationApiUrl}${city}&limit=1&appid=${API_KEY}`
		);
		locationRequest.responseType = 'text';

		locationRequest.addEventListener(
			'load',
			function () {
				if (locationRequest.status === 200) {
					pLocation.textContent = 'locating...';
					locationData = JSON.parse(locationRequest.responseText); // Parse the response
					if (locationData == '') {
						// Checking if the response was empty, this means that the response did not find coordinates for the user input
						alert('Did not find that city. Please try again!'); // Pop up an alert
						pLocation.innerHTML = 'No Coordinates'; // Reset location coordinates
						cityInput.value = ''; // Reset user input field
						clearForecast(); // Clear forecast section
						hideForecast(); // Hide forecast section
						clearCurrent(); // Clear current weather section
					} else {
						getLocationInfo(); // If the city was found then we will store the response and run this function
					}
				} else {
					console.log(locationRequest.status); // Console log error for debugging
				}
			},
			false
		);

		locationRequest.send(); // Response stored

		// Function getLocationInfo to get the coordinates for the user input city
		// Latitude and longitude values are found in the JSON response
		// They are stored in variables lat and lon
		async function getLocationInfo() {
			const lat = locationData[0].lat;
			const lon = locationData[0].lon;

			const str = ` Latitude: ${lat} ° <br> Longitude: ${lon} °`; // Here we print out the location coordinates to the app location section

			pLocation.innerHTML = str;
			checkCurrentWeather(lat, lon); // Search for current location's current weather
			clearForecast(); // Clear forecast from any old info
			hideForecast(); // Hide forecast as a default

			// Adding event listeners for the forecast buttons
			check24.addEventListener('click', (e) => {
				checkWeather24(lat, lon);
			});
			check72.addEventListener('click', (e) => {
				checkWeather72(lat, lon);
			});
		}
	}

	// function checkCurrentWeather to search for the current weather via an AJAX CALL from openweathermap API
	// Here we pass in the lat, lon values from either the geoFindMe or the checkLocation function
	async function checkCurrentWeather(lat, lon) {
		let nWeather = document.querySelector('#cityName'); // Place for storing the weather station name to the html document
		let pWeather = document.querySelector('#weatherData'); // Place for storing the weather info
		let iWeather = document.querySelector('#weatherIcon'); // Place for the weather icon
		let tWeather = document.querySelector('#temp'); // Place for the current temp beside the icon
		let currentWeatherData = {};
		let weatherRequest = new XMLHttpRequest();
		// Initializing the AJAX Call for the current weather, API URL, API KEY, latitude, longitude, units are taken from variables
		weatherRequest.open(
			'GET',
			`${weatherApiUrl}lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}&units=${units}`
		);
		weatherRequest.responseType = 'text';

		weatherRequest.addEventListener(
			'load',
			function () {
				if (weatherRequest.status === 200) {
					pWeather.textContent = 'loading...';
					currentWeatherData = JSON.parse(
						weatherRequest.responseText
					);
					// Storing the data and sending it to the function createCurrentWeatherInfo
					createCurrentWeatherInfo(
						currentWeatherData,
						pWeather,
						nWeather,
						iWeather,
						tWeather
					);
				} else {
					// If something goes wrong then show error in the pWeather location
					pWeather.textContent = 'error: ' + weatherRequest.status;
				}
			},
			false
		);

		weatherRequest.send();

		// Function for creating the information to the html page, temp, wind, sunrise, sunset etc passed on and showed on the page.
		async function createCurrentWeatherInfo(
			currentWeatherData,
			pWeather,
			nWeather,
			iWeather,
			tWeather
		) {
			const timeFormat = (date) =>
				date.toLocaleString('en-gb', {
					month: 'short',
					day: '2-digit',
					hour: '2-digit',
					minute: '2-digit',
				});
			const location = currentWeatherData.name;
			const temp = currentWeatherData.main.temp.toFixed(0);
			const wind = currentWeatherData.wind.speed.toFixed(0);
			const time = timeFormat(new Date(currentWeatherData.dt * 1000));
			const icon = currentWeatherData.weather[0].icon;
			const description = currentWeatherData.weather[0].description;
			const num = degToCompass(currentWeatherData.wind.deg);
			const feels = currentWeatherData.main.feels_like.toFixed(0);
			const sunrise = new Date(
				currentWeatherData.sys.sunrise * 1000
			).toLocaleString('en-gb', {
				hour: '2-digit',
				minute: '2-digit',
			});
			const sunset = new Date(
				currentWeatherData.sys.sunset * 1000
			).toLocaleString('en-gb', {
				hour: '2-digit',
				minute: '2-digit',
			});

			const str = `${time} <br> ${description} <br> Feels like: ${feels} °C <br> Wind: ${wind} m/s from ${num} <br> Sunrise: ${sunrise} <br> Sunset: ${sunset}`;

			const name = `${location}`;

			tWeather.innerHTML = `${temp} °C`;

			iWeather.innerHTML = `<img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="${description}" height="120px">`;

			nWeather.innerHTML = name;

			pWeather.innerHTML = str;
		}
	}

	async function checkWeather24(lat, lon) {
		let weather24Data = {};
		let weather24Request = new XMLHttpRequest();
		weather24Request.open(
			'GET',
			`${forecastApiUrl}lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}&units=${units}`
		);
		weather24Request.responseType = 'text';

		weather24Request.addEventListener(
			'load',
			function () {
				if (weather24Request.status === 200) {
					weather24Data = JSON.parse(weather24Request.responseText);
					createWeather24Info(weather24Data);
				} else {
					console.log(weather24Request.status);
				}
			},
			false
		);

		weather24Request.send();

		async function createWeather24Info(weather24Data) {
			const timeFormat = (date) =>
				date.toLocaleString('en-gb', {
					month: 'short',
					day: '2-digit',
					hour: '2-digit',
					minute: '2-digit',
				});

			let forecastList = document.querySelector('#forecastList');
			let weatherList = '<ul> <h3> Forecast for the next 24h</h3>';

			for (i = 0; i <= 8; i++) {
				weatherList += ` <li> <div><div class="forecastImg"> <img src="https://openweathermap.org/img/wn/${
					weather24Data.list[i].weather[0].icon
				}@4x.png" alt="${
					weather24Data.list[i].weather[0].description
				}" height="40px"></div>${timeFormat(
					new Date(weather24Data.list[i].dt * 1000)
				)} Temperature: ${weather24Data.list[i].main.temp.toFixed(
					0
				)} °C <br> Wind: ${weather24Data.list[i].wind.speed.toFixed(
					0
				)} m/s from ${degToCompass(
					weather24Data.list[i].wind.deg
				)}</div>
			  </li>`;
			}
			weatherList += '</ul>';
			forecastList.innerHTML = weatherList;

			showForecast();
		}
	}

	async function checkWeather72(lat, lon) {
		let weather72Data = {};
		let weather72Request = new XMLHttpRequest();
		weather72Request.open(
			'GET',
			`${forecastApiUrl}lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}&units=${units}`
		);
		weather72Request.responseType = 'text';

		weather72Request.addEventListener(
			'load',
			function () {
				if (weather72Request.status === 200) {
					weather72Data = JSON.parse(weather72Request.responseText);
					createWeather72Info(weather72Data);
				} else {
					console.log(weather72Request.status);
				}
			},
			false
		);

		weather72Request.send();

		async function createWeather72Info(weather72Data) {
			const timeFormat = (date) =>
				date.toLocaleString('en-gb', {
					month: 'short',
					day: '2-digit',
					hour: '2-digit',
					minute: '2-digit',
				});

			let forecastList = document.querySelector('#forecastList');
			let weatherList =
				'<ul> <h3> Forecast for the next 24h to 72h </h3> ';

			for (i = 7; i <= 24; i += 2) {
				weatherList += ` <li> <div><div class="forecastImg"> <img src="https://openweathermap.org/img/wn/${
					weather72Data.list[i].weather[0].icon
				}@4x.png" alt="${
					weather72Data.list[i].weather[0].description
				}" height="40px"></div>${timeFormat(
					new Date(weather72Data.list[i].dt * 1000)
				)} Temperature: ${weather72Data.list[i].main.temp.toFixed(
					0
				)} °C  <br> Wind: ${weather72Data.list[i].wind.speed.toFixed(
					0
				)} m/s from ${degToCompass(
					weather72Data.list[i].wind.deg
				)}</div>
			  </li>`;
			}
			weatherList += '</ul>';
			forecastList.innerHTML = weatherList;

			showForecast();
		}
	}

	function degToCompass(num) {
		var val = Math.floor(num / 22.5 + 0.5);
		var arr = [
			'North',
			'North NE',
			'North E',
			'East NE',
			'East',
			'Eeast SE',
			'South E',
			'South SE',
			'South',
			'South SW',
			'South W',
			'West SW',
			'West',
			'West NW',
			'North W',
			'North NW',
		];
		return arr[val % 16];
	}
	function clearForecast() {
		let forecastList = document.querySelector('#forecastList');
		forecastList.innerHTML = '';
	}

	function clearCurrent() {
		let currentWeatherInfo = document.querySelector('#weather');

		currentWeatherInfo.innerHTML = `<div class="current">
                    <div>
                        <p id="temp" class="temp"></p>
                    </div>
                    <div id="weatherIcon"><img src="" alt=""></div>
                </div>
                <div id="weatherInfo">
                    <h3>Weather station details</h3>
                    <p id="cityName">No City Data</p>
                    <p id="weatherData">No Weather Data</p>
                </div>`;
	}

	function showForecast() {
		let right = document.getElementById('right');
		let container = document.getElementById('container');
		right.classList.add('forecastDisplay');
		container.classList.add('forecastWidth');
		container.classList.add('forecastMinWidth');
	}

	function hideForecast() {
		let right = document.getElementById('right');
		let container = document.getElementById('container');
		right.classList.remove('forecastDisplay');
		container.classList.remove('forecastWidth');
		container.classList.remove('forecastMinWidth');
	}
});
