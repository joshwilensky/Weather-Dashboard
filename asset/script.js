// DOM Elements
const city_name = $('#city_name');
const city_temp = $('#city_temp');
const city_humidity = $('#city_humidity');
const city_wind = $('#city_wind');
const city_UV = $('#city_UV');
const forecast = $('.forecast');
const listGroup = $('.list-group');

// Initialize the city array that is saved in the local storage.
const cities = JSON.parse(localStorage.getItem('cities')) || [];

// initialize with the weather of NYC.
$(document).ready(() => {

    // Render our searching history
    cities.forEach((city) => {
        listGroup.prepend(
            $(`<li class="list-group-item text-capitalize">${city}</li>`)
        );
    });

    const city = 'New York';
    getCurrentWeather(city);
    getFutureWeather(city);

    // Event Listener on list item has been clicked.
    $('.list-group-item').on('click', (e) => {
        const city = e.target.textContent;
        getCurrentWeather(city);
        getFutureWeather(city);
    });
});

// Event Listener on submit.
$('form').on('submit', (e) => {
    e.preventDefault();

    const city = $('input').val();
    cities.push(city);

    // City name has been saved to the local storage.
    localStorage.setItem('cities', JSON.stringify(cities));

    // Render search history.
    listGroup.prepend($(`<li class="list-group-item">${city}</li>`));

    // Event Listener on list item has been clicked.
    $('.list-group-item').on('click', (e) => {
        const city = e.target.textContent;
        getCurrentWeather(city);
        getFutureWeather(city);
    });

    // Get the weather info.
    getCurrentWeather(city);
    getFutureWeather(city);
});

// Function to get the current weather.
function getCurrentWeather(city) {
    let baseURL =
        'https://api.openweathermap.org/data/2.5/weather?appid=9385bb375daef99b7d5d3a120b3b3b1e&units=imperial';

    $.ajax({
        url: baseURL + `&q=${city}`,
        method: 'GET',
    }).then((res) => {

        // Transfer unix time stamp to formattedTime.
        const unix_timestamp = res.dt;
        const date = new Date(unix_timestamp * 1000);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        const formatedTime = `(${month}/${day}/${year})`;

        //Render the current weather.
        city_name.text(res.name + ' ' + formatedTime);
        city_temp.text('Temperature: ' + res.main.temp + '℉');
        city_humidity.text('Humidity: ' + res.main.humidity + '%');
        city_wind.text('Wind Speed: ' + res.wind.speed + 'MPH');
        city_name.append(
            $(
                `<img src="https://openweathermap.org/img/wn/${res.weather[0].icon}@2x.png"></img>`
            )
        );

        // Get the coordinates of the city.
        const lat = res.coord.lat;
        const lon = res.coord.lon;

        //get the UV value with coordinates and render it.
        $.ajax({
            url: ` https://api.openweathermap.org/data/2.5/uvi?appid=9385bb375daef99b7d5d3a120b3b3b1e&units=imperial&lat=${lat}&lon=${lon}`,
            method: 'GET',
        }).then((res) =>
            city_UV.html(
                `UV Index: <span class="text-white p-1 ${
          res.value < 2
            ? 'bg-sucess'
            : res.value <= 7
            ? 'bg-warning'
            : 'bg-danger'
        }">${res.value}</span>`
            )
        );
    });
}

// Function to get the future weather.
function getFutureWeather(city) {
    let baseURL =
        'https://api.openweathermap.org/data/2.5/forecast?appid=9385bb375daef99b7d5d3a120b3b3b1e&units=imperial';

    $.ajax({
        url: baseURL + `&q=${city}`,
        method: 'GET',
    }).then((res) => {

        // Get the weather for the next five days.
        const futureWeather = [];

        for (let i = 4; i < res.list.length; i += 8) {
            futureWeather.push(res.list[i]);
        }

        // Empty the previous weather forecast.
        forecast.empty();

        // Render the future weather.
        futureWeather.forEach((day) => {
            const weatherCard = $('<div>').addClass(
                'card col-sm-4 col-md-2 bg-primary text-white'
            );

            weatherCard.html(`
      <div class="card-body p-md-0 p-sm-1 text-center">
      <h5 class="card-title">${day.dt_txt.slice(0, 10)}</h5>
      <img src="https://openweathermap.org/img/wn/${
        day.weather[0].icon
      }@2x.png"></img>
      <p class="card-text">Temp: ${day.main.temp}℉</p>
      <p class="card-text">Humidity: ${day.main.humidity}%</p>
    </div>
        `);

            forecast.append(weatherCard);
        });
    });
}
