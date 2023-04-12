let API_KEY = '71999687a3a8645a511abce5465479b5';
let locationApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=`;
let weatherApiUrl = 'https://api.openweathermap.org/data/2.5/forecast?';
let units = 'metric';
let input = document.querySelector('#input');
let city = document.querySelector('#city.value');
let weatherForCurrentLocation = document.querySelector('#currentLocation');
let pLocation = document.querySelector('#location p');

async function checkLocation(city) {
	let locationData = {};
	let locationRequest = new XMLHttpRequest();
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
				locationData = JSON.parse(locationRequest.responseText);
				if (locationData == '') {
					alert('Did not find that city. Please try again!');
					pLocation.innerHTML = 'No Coordinates';
				} else {
					getLocationInfo();
				}
			} else {
				console.log(locationRequest.status);
			}
		},
		false
	);

	locationRequest.send();

	async function getLocationInfo() {
		const lat = locationData[0].lat;
		const lon = locationData[0].lon;

		const str = ` Latitude: ${lat} ° <br> Longitude: ${lon} °`;

		pLocation.innerHTML = str;
		checkWeather(lat, lon);
	}
}
async function checkWeather(lat, lon) {
	let nWeather = document.querySelector('#weatherName p');
	let pWeather = document.querySelector('#weather p');
	let iWeather = document.querySelector('#weatherIcon');
	let weatherData = {};
	let weatherRequest = new XMLHttpRequest();
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
				weatherData = JSON.parse(weatherRequest.responseText);
				createWeatherInfo(weatherData, pWeather, nWeather, iWeather);
			} else {
				pWeather.textContent = 'error: ' + weatherRequest.status;
			}
		},
		false
	);

	weatherRequest.send();

	async function createWeatherInfo(
		weatherData,
		pWeather,
		nWeather,
		iWeather
	) {
		const timeFormat = (date) =>
			date.toLocaleString('en-gb', {
				month: 'short',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
			});
		const location = weatherData.city.name;
		const temp = weatherData.list[0].main.temp.toFixed(0);
		const wind = weatherData.list[0].wind.speed.toFixed(0);
		const time = timeFormat(new Date(weatherData.list[0].dt * 1000));
		const icon = weatherData.list[0].weather[0].icon;
		const description = weatherData.list[0].weather[0].description;

		let forecastList = document.querySelector('#forecastList');
		let weatherList = '<ul>';

		for (i = 2; i <= 24; i += 2) {
			weatherList += ` <li> <div><div class="forecastImg"> <img src="https://openweathermap.org/img/wn/${
				weatherData.list[i].weather[0].icon
			}.png" alt="${
				weatherData.list[i].weather[0].description
			}" width="30px" height="30px"></div>${timeFormat(
				new Date(weatherData.list[i].dt * 1000)
			)} ${weatherData.list[i].main.temp.toFixed(
				0
			)} °C  ${weatherData.list[i].wind.speed.toFixed(0)} m/s </div>
			  </li>`;
		}
		weatherList += '</ul>';
		forecastList.innerHTML = weatherList;

		const str = `${time} <br> ${description} <br> ${temp} °C ${wind} m/s `;

		const name = `${location}`;

		iWeather.innerHTML = `<img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="${description}" height="100px">`;

		nWeather.innerHTML = name;

		pWeather.innerHTML = str;
	}
}

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

weatherForCurrentLocation.addEventListener('click', geoFindMe);

async function geoFindMe() {
	function success(position) {
		const latitude = position.coords.latitude;
		const longitude = position.coords.longitude;
		pLocation.innerHTML = `Latitude: ${latitude}° <br> Longitude: ${longitude} °`;
		checkWeather(latitude, longitude);
	}

	function error() {
		pLocation.textContent = 'Unable to retrieve your location';
	}

	if (!navigator.geolocation) {
		pLocation.textContent = 'Geolocation is not supported by your browser';
	} else {
		pLocation.textContent = 'Locating…';
		navigator.geolocation.getCurrentPosition(success, error, {
			timeout: 1000,
		});
	}
}

function clearInfo() {
	document.body.innerHTML = `
        <div class="container">
            <div class="left"><button type="button" id="currentLocation">Show weather for current location</button>
                <br>
                <form id="input">
                    <h3>Enter a city to check weather</h3>
                    <input type="text" id="city" name="city">
                    <br>
                    <button type="submit" id="submit">Show Weather</button>
                </form>
                <div id="location">
                    <h1>Location coordinates</h1>
                    <p>No Coordinates</p>
                </div>
                <div id="weatherName">
                    <h1>Weather</h1>
                    <p>No City Data</p>
                </div>
                <div id="weather">
                    <div id="weatherIcon"><img src="" alt=""></div>
                    <p>No Weather Data</p>
                </div>
            </div>
            <div class="right">
                <h3>Weather Forecast</h3>
                <div id="forecastList">

                </div>
            </div>
        </div>
        <script src="main.js"></script>
    `;
}
