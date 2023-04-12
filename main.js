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
					cityInput.value = '';
					clearForecast();
					clearCurrent();
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
		checkCurrentWeather(lat, lon);
		clearForecast();
		check24.addEventListener('click', (e) => {
			checkWeather24(lat, lon);
		});
		check72.addEventListener('click', (e) => {
			checkWeather72(lat, lon);
		});
	}
}

async function checkCurrentWeather(lat, lon) {
	let nWeather = document.querySelector('#cityName');
	let pWeather = document.querySelector('#weatherData');
	let iWeather = document.querySelector('#weatherIcon');
	let currentWeatherData = {};
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
				currentWeatherData = JSON.parse(weatherRequest.responseText);
				createCurrentWeatherInfo(
					currentWeatherData,
					pWeather,
					nWeather,
					iWeather
				);
			} else {
				pWeather.textContent = 'error: ' + weatherRequest.status;
			}
		},
		false
	);

	weatherRequest.send();

	async function createCurrentWeatherInfo(
		currentWeatherData,
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
		const location = currentWeatherData.name;
		const temp = currentWeatherData.main.temp.toFixed(0);
		const wind = currentWeatherData.wind.speed.toFixed(0);
		const time = timeFormat(new Date(currentWeatherData.dt * 1000));
		const icon = currentWeatherData.weather[0].icon;
		const description = currentWeatherData.weather[0].description;
		const num = degToCompass(currentWeatherData.wind.deg);
		const feels = currentWeatherData.main.feels_like.toFixed(0);

		const str = `${time} <br> ${description} <br> Temperature: ${temp} °C <br> Feels like: ${feels} °C <br> Wind: ${wind} m/s from ${num}`;

		const name = `${location}`;

		iWeather.innerHTML = `<img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="${description}" height="120px">`;

		nWeather.innerHTML = name;

		pWeather.innerHTML = str;
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
		let weatherList = '<ul> <h3> 24h to 72h</h3>';

		for (i = 7; i <= 24; i += 2) {
			weatherList += ` <li> <div><div class="forecastImg"> <img src="https://openweathermap.org/img/wn/${
				weather72Data.list[i].weather[0].icon
			}.png" alt="${
				weather72Data.list[i].weather[0].description
			}" width="30px" height="30px"></div>${timeFormat(
				new Date(weather72Data.list[i].dt * 1000)
			)} ${weather72Data.list[i].main.temp.toFixed(
				0
			)} °C  ${weather72Data.list[i].wind.speed.toFixed(
				0
			)} m/s from ${degToCompass(weather72Data.list[i].wind.deg)}</div>
			  </li>`;
		}
		weatherList += '</ul>';
		forecastList.innerHTML = weatherList;
	}
	check72.addEventListener('click', (e) => {
		checkWeather72(lat, lon);
	});
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
		let weatherList = '<ul> <h3> Next 24h </h3> ';

		for (i = 0; i <= 8; i++) {
			weatherList += ` <li> <div><div class="forecastImg"> <img src="https://openweathermap.org/img/wn/${
				weather24Data.list[i].weather[0].icon
			}.png" alt="${
				weather24Data.list[i].weather[0].description
			}" width="30px" height="30px"></div>${timeFormat(
				new Date(weather24Data.list[i].dt * 1000)
			)} ${weather24Data.list[i].main.temp.toFixed(
				0
			)} °C  ${weather24Data.list[i].wind.speed.toFixed(
				0
			)} m/s from ${degToCompass(weather24Data.list[i].wind.deg)}</div>
			  </li>`;
		}
		weatherList += '</ul>';
		forecastList.innerHTML = weatherList;
	}
	check24.addEventListener('click', (e) => {
		checkWeather24(lat, lon);
	});
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
		checkCurrentWeather(latitude, longitude);
		clearForecast();
		check24.addEventListener('click', (e) => {
			checkWeather24(latitude, longitude);
		});
		check72.addEventListener('click', (e) => {
			checkWeather72(latitude, longitude);
		});
	}

	function error() {
		pLocation.textContent = 'Unable to retrieve your location';
	}

	if (!navigator.geolocation) {
		pLocation.textContent = 'Geolocation is not supported by your browser';
	} else {
		pLocation.textContent = 'Locating…';
		navigator.geolocation.getCurrentPosition(success, error, {
			timeout: 5000,
		});
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
	let location = document.querySelector('#location');

	location.innerHTML = ` <h1>Location coordinates</h1>
                    <p>No Coordinates</p>`;

	let currentWeatherInfo = document.querySelector('#weather');

	currentWeatherInfo.innerHTML = `
                    <div id="weatherInfo">
                        <h3>Weather station</h3>
                        <p id="cityName">No City Data</p>
                        <p id="weatherData">No Weather Data</p>
                    </div>
                    <div id="weatherIcon"><img src="" alt=""></div>`;
}
