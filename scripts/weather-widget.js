import { calculateColor } from "../utils/colors-temperatures.js";
import { weatherCodeMapping } from "../utils/utils.js";
const divId = document.getElementById("scr").attributes["div-id"]?.nodeValue;

const styleDayAvg = (dayDiv, day, avgTemperature) => {
    dayDiv.id = day.toLowerCase();
    dayDiv.classList.add("day-avg");
    const color = calculateColor(avgTemperature);
    dayDiv.style.background = `linear-gradient(to bottom, ${color} 0%, #ffffff 100%)`;
};

//##################################### HTML #############################################

const createElements = () => {
    const weatherContainer = createWeatherContainer(divId);
    weatherContainer.id = "main-container";

    const loaderElement = createLoader();

    const titleContainer = document.createElement("div");
    titleContainer.className = "title-container";

    const title = document.createElement("h1");
    title.id = "app-title";
    title.className = "title";
    title.textContent = "Historical Weather Widget";
    titleContainer.appendChild(title);

    const inputsContainer = document.createElement("div");
    inputsContainer.className = "inputs-container";

    const citySearchContainer = document.createElement("div");
    citySearchContainer.className = "search-container";

    const citySearchBar = createInput("Enter City Name", "city-input", "text");
    const citySearchButton = createSearchButton(
        "Search by City Name",
        "city-search-btn",
        getAvgTemperaturesByCity
    );
    citySearchContainer.appendChild(citySearchBar);
    citySearchContainer.appendChild(citySearchButton);
    inputsContainer.appendChild(citySearchContainer);

    const geoSearchContainer = document.createElement("div");
    geoSearchContainer.className = "search-container";

    const geoSearchBar = createInput("Enter Latitude", "lat-input", "number");
    geoSearchContainer.appendChild(geoSearchBar);

    const geoSearchBar2 = createInput("Enter Longitude", "lon-input", "number");
    geoSearchContainer.appendChild(geoSearchBar2);

    const geoSearchButton = createSearchButton(
        "Search by Geo Location",
        "geo-search-btn",
        getAvgTemperaturesByGeolocation
    );

    const errorMessageContainer = document.createElement("div");
    errorMessageContainer.id = "error-message";
    errorMessageContainer.className = "error-message-container";
    errorMessageContainer.textContent =
        "Error fetching data. Make sure you entered valid input.";
    errorMessageContainer.style.display = "none";

    geoSearchContainer.appendChild(geoSearchButton);
    inputsContainer.appendChild(geoSearchContainer);
    weatherContainer.appendChild(titleContainer);
    weatherContainer.appendChild(inputsContainer);
    weatherContainer.appendChild(loaderElement);
    weatherContainer.appendChild(errorMessageContainer);
    document.body.appendChild(weatherContainer);
};

const createWeatherContainer = (divId) => {
    const weatherContainer = divId
        ? document.getElementById(divId)
        : document.createElement("div");
    weatherContainer.className = "weather-widget-container";
    return weatherContainer;
};

const createInput = (placeholder, id, type) => {
    const searchBar = document.createElement("input");
    searchBar.type = type;
    searchBar.placeholder = placeholder;
    searchBar.id = id;
    searchBar.classList.add("input-bar");

    return searchBar;
};

const createSearchButton = (text, id, clickHandler) => {
    const searchButton = document.createElement("button");
    searchButton.id = id;
    searchButton.textContent = text;
    searchButton.classList.add("search-btn");
    searchButton.addEventListener("click", async () => {
        handleDivsVisibility();
        showLoader();
        const searchButtons = document.querySelectorAll(
            "#geo-search-btn, #city-search-btn"
        );
        disableButtons(searchButtons);
        await new Promise((resolve) => setTimeout(resolve, 500));
        await clickHandler();
        hideLoader();
        enableButtons(searchButtons);
    });

    return searchButton;
};

const createLoader = () => {
    const loaderContainer = document.createElement("div");
    loaderContainer.id = "loader";
    loaderContainer.className = "loader";

    return loaderContainer;
};

const includeCssFile = () => {
    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.type = "text/css";
    linkElement.href = "../styles/weather-widget.styles.css";

    document.head.appendChild(linkElement);
};

const updateWidgetContent = async (daysAverages) => {
    const widgetContainer = document.getElementById("main-container");
    const oldAvgsDiv = document.getElementById("avg-days");
    if (oldAvgsDiv) {
        widgetContainer.removeChild(oldAvgsDiv);
    }

    const averagesDiv = document.createElement("div");

    averagesDiv.id = "avg-days";
    averagesDiv.className = "averages-days-container";

    for (const dayAvg of daysAverages) {
        const { dayOfWeek, avgTemperature, weatherCode } = dayAvg;
        const dayDiv = document.createElement("div");
        styleDayAvg(dayDiv, dayOfWeek, avgTemperature);

        const dayNameElement = document.createElement("div");
        dayNameElement.textContent = dayOfWeek;

        const temperatureElement = document.createElement("div");
        temperatureElement.textContent = `${avgTemperature}°C`;

        const imagesContainer = createImagesContainer(weatherCode);

        dayDiv.appendChild(dayNameElement);
        dayDiv.appendChild(temperatureElement);
        dayDiv.appendChild(imagesContainer);
        averagesDiv.appendChild(dayDiv);
    }

    widgetContainer.appendChild(averagesDiv);
};

const createImagesContainer = (weatherCode) => {
    const { day, night } = weatherCodeMapping[weatherCode];

    const imagesContainer = document.createElement("div");
    imagesContainer.classList.add("images-container");

    const dayImageContainer = createImageAndDescription(day, "day");
    const nightImageContainer = createImageAndDescription(night, "night");

    const border = document.createElement("div");
    border.classList.add("border");

    imagesContainer.appendChild(dayImageContainer);
    imagesContainer.appendChild(border);
    imagesContainer.appendChild(nightImageContainer);

    return imagesContainer;
};

const createImageAndDescription = ({ image, description }, at) => {
    const imageContainer = document.createElement("div");
    imageContainer.classList.add("image-container");

    const imgElement = document.createElement("img");
    imgElement.classList.add("weather-img");
    imgElement.src = image;

    const descriptionElement = document.createElement("p");
    descriptionElement.classList.add("weather-description");
    descriptionElement.textContent = `${description} at ${at}`;

    imageContainer.appendChild(imgElement);
    imageContainer.appendChild(descriptionElement);

    return imageContainer;
};

//############################################################################################

//########################################## Logic ###########################################

const getAvgTemperaturesByCity = async () => {
    try {
        const cityName = document.getElementById("city-input").value;
        const getLocation = await getGeolocationByCityName(cityName);
        const { startDate, endDate } = get30DaysDateRange();

        const historyData = await getHistoricalWeather(
            getLocation,
            startDate,
            endDate
        );
        const dayTempMapping = await getDayToTemperatureMapping(historyData);
        const daysAverages = await calculateAverages(dayTempMapping);
        updateWidgetContent(daysAverages);
    } catch (err) {
        handleError();
    }
};

const getAvgTemperaturesByGeolocation = async () => {
    try {
        const lat = document.getElementById("lat-input").value;
        const lon = document.getElementById("lon-input").value;
        const geoLocation = { lat, lon };
        const { startDate, endDate } = get30DaysDateRange();
        const historyData = await getHistoricalWeather(
            geoLocation,
            startDate,
            endDate
        );
        const dayTempMapping = await getDayToTemperatureMapping(historyData);
        const daysAverages = await calculateAverages(dayTempMapping);
        updateWidgetContent(daysAverages);
    } catch (err) {
        handleError();
    }
};

const get30DaysDateRange = () => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 1);
    const lastMonthDate = new Date(currentDate);
    lastMonthDate.setDate(currentDate.getDate() - 30);

    const startYear = lastMonthDate.getFullYear();
    const startMonth = (lastMonthDate.getMonth() + 1)
        .toString()
        .padStart(2, "0");
    const startDay = lastMonthDate.getDate().toString().padStart(2, "0");

    const endYear = currentDate.getFullYear();
    const endMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const endDay = currentDate.getDate().toString().padStart(2, "0");

    const startDate = `${startYear}-${startMonth}-${startDay}`;
    const endDate = `${endYear}-${endMonth}-${endDay}`;

    return { startDate, endDate };
};

const getHistoricalWeather = async (location, startDate, endDate) => {
    const { lat, lon } = location;
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=weathercode,temperature_2m_mean&timezone=auto`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

const calculateAverages = async (dailyData) => {
    const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    const averageTemperatures = {};

    dailyData.forEach(({ day, temperature, weathercode }) => {
        const date = new Date(day);
        const dayOfWeek = daysOfWeek[date.getDay()];

        if (!averageTemperatures[dayOfWeek]) {
            averageTemperatures[dayOfWeek] = {
                sum: temperature,
                count: 1,
                weatherCodes: [weathercode],
            };
        } else {
            averageTemperatures[dayOfWeek].sum += temperature;
            averageTemperatures[dayOfWeek].count++;
            averageTemperatures[dayOfWeek].weatherCodes.push(weathercode);
        }
    });

    return Object.keys(averageTemperatures).map((dayOfWeek) => {
        const { sum, count, weatherCodes } = averageTemperatures[dayOfWeek];
        let weatherCode = getElementWithMostOccurrence(weatherCodes);
        weatherCode = weatherCode ? weatherCode : weatherCodes.pop();
        return {
            dayOfWeek,
            avgTemperature: (sum / count).toFixed(1),
            weatherCode,
        };
    });
};

const getElementWithMostOccurrence = (arr) => {
    return arr
        .sort(
            (a, b) =>
                arr.filter((v) => v === a).length -
                arr.filter((v) => v === b).length
        )
        .pop();
};

const getDayToTemperatureMapping = (data) => {
    const { time, temperature_2m_mean, weathercode } = data.daily;
    return time.map((day, index) => {
        return {
            day,
            temperature: temperature_2m_mean[index],
            weathercode: weathercode[index],
        };
    });
};

const getGeolocationByCityName = async (cityName) => {
    const apiUrl = `https://nominatim.openstreetmap.org/search?q=${cityName}&format=json&limit=1`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    const { lat, lon } = data[0];
    return data.length ? { lat, lon } : {};
};

const getAverageTemperatureByLocation = async (
    location,
    startDate,
    endDate
) => {
    const historyData = await getHistoricalWeather(
        location,
        startDate,
        endDate
    );
    const dayTempMapping = await getDayToTemperatureMapping(historyData);
    const daysAverages = await calculateAverages(dayTempMapping);
    return daysAverages;
};

const getUserAverageTemperature = async (startDate, endDate) => {
    const userLocation = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((position) => {
            resolve({
                lat: position.coords.latitude,
                lon: position.coords.longitude,
            });
        });
    });
    const daysAverages = await getAverageTemperatureByLocation(
        userLocation,
        startDate,
        endDate
    );
    return daysAverages;
};

const showLoader = () => {
    const loader = document.getElementById("loader");
    loader.style.display = "inline-block";
};

const hideLoader = () => {
    const loader = document.getElementById("loader");
    loader.style.display = "none";
};

const disableButtons = (buttons) => {
    for (const button of buttons) {
        button.disabled = true;
        button.style.opacity = 0.5;
        button.style.cursor = "not-allowed";
    }
};

const enableButtons = (buttons) => {
    for (const button of buttons) {
        button.disabled = false;
        button.style.opacity = 1;
        button.style.cursor = "pointer";
    }
};

const handleDivsVisibility = () => {
        const errorMessageContainer = document.getElementById("error-message");
        errorMessageContainer.style.display = "none";

        const averagesDiv = document.getElementById("avg-days");
        if (averagesDiv) {
            averagesDiv.style.display = "none";
        }
};

const handleError = () => {
    hideLoader();
    const searchButtons = document.querySelectorAll(
        "#geo-search-btn, #city-search-btn"
    );
    enableButtons(searchButtons);
    const errorMessageContainer = document.getElementById("error-message");
    errorMessageContainer.style.display = "block";
};

const execute = async () => {
    const { startDate, endDate } = get30DaysDateRange();
    const userAverageTemperature = await getUserAverageTemperature(
        startDate,
        endDate
    );
    console.log(
        "User's current location averages data:",
        userAverageTemperature
    );

    includeCssFile();
    createElements();
};

execute();
