import { calculateColor } from "../utils/colors.js";

const WEATHER_CODES_URL = `https://api.github.com/gists/9490c195ed2b53c707087c8c2db4ec0c`;
let weatherCodeMapping;
const divId = document.getElementById("scr").attributes["div-id"].nodeValue;

//##################################### CSS #############################################
const styleSearchContainer = (inputContainer) => {
    inputContainer.style.display = "flex";
    inputContainer.style.flexDirection = "row";
    inputContainer.style.justifyContent = "center";
    inputContainer.style.margin = "10px 0";
};

const styleWeatherContainer = (widgetContainer) => {
    widgetContainer.style.backgroundColor = "#f5f5f5";
    widgetContainer.style.padding = "20px";
    widgetContainer.style.borderRadius = "8px";
    widgetContainer.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.1)";
    widgetContainer.style.textAlign = "center";
    widgetContainer.style.fontFamily = "sans-serif";
    widgetContainer.style.width = "50%";
};

const styleDayAvg = (dayDiv, day, avgTemperature) => {
    dayDiv.id = day.toLowerCase();
    dayDiv.style.display = "flex";
    dayDiv.style.flexDirection = "column";
    dayDiv.style.alignItems = "center";
    dayDiv.style.width = "120px";
    dayDiv.style.margin = "0 10px";
    dayDiv.style.border = "1px solid #ccc";
    dayDiv.style.borderRadius = "8px";
    dayDiv.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
    dayDiv.style.padding = "10px";
    dayDiv.style.fontSize = "14px";
    dayDiv.style.textAlign = "center";
    dayDiv.style.cursor = "pointer";
    dayDiv.style.transition =
        "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out";

    dayDiv.addEventListener("mouseenter", () => {
        dayDiv.style.transform = "scale(1.02)";
        dayDiv.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    });
    dayDiv.addEventListener("mouseleave", () => {
        dayDiv.style.transform = "scale(1)";
        dayDiv.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
    });

    const color = calculateColor(avgTemperature);
    dayDiv.style.background = `linear-gradient(to bottom, ${color} 0%, #ffffff 100%)`;
};

//########################################################################################

//##################################### HTML #############################################

const createElements = () => {
    const weatherContainer = createWeatherContainer(divId);
    const loaderElement = createLoader();
    const inputsContainer = document.createElement("div");
    inputsContainer.style.width = "590px";
    inputsContainer.style.margin = "0 auto";

    const citySearchContainer = document.createElement("div");
    styleSearchContainer(citySearchContainer);

    const citySearchBar = createInput("Enter City Name", "city-input");
    const citySearchButton = createSearchButton(
        "Search by City Name",
        "city-search-btn",
        getAvgTemperaturesByCity
    );
    citySearchContainer.appendChild(citySearchBar);
    citySearchContainer.appendChild(citySearchButton);
    inputsContainer.appendChild(citySearchContainer);

    const geoSearchContainer = document.createElement("div");
    styleSearchContainer(geoSearchContainer);

    const geoSearchBar = createInput("Enter Latitude", "lat-input");
    geoSearchContainer.appendChild(geoSearchBar);
    const geoSearchBar2 = createInput("Enter Longitude", "lon-input");
    geoSearchContainer.appendChild(geoSearchBar2);

    const geoSearchButton = createSearchButton(
        "Search by Geo Location",
        "geo-search-btn",
        getAvgTemperaturesByGeolocation
    );
    geoSearchContainer.appendChild(geoSearchButton);
    inputsContainer.appendChild(geoSearchContainer);
    weatherContainer.appendChild(inputsContainer);
    weatherContainer.appendChild(loaderElement);
    document.body.appendChild(weatherContainer);
};

const createWeatherContainer = (divId) => {
    const weatherContainer = divId
        ? document.getElementById(divId)
        : document.createElement("div");
    weatherContainer.className = "weather-widget-container";
    styleWeatherContainer(weatherContainer);
    return weatherContainer;
};

const createInput = (placeholder, id) => {
    const searchBar = document.createElement("input");
    searchBar.type = "text";
    searchBar.placeholder = placeholder;
    searchBar.id = id;
    searchBar.style.padding = "8px";
    searchBar.style.border = "1px solid #ccc";
    searchBar.style.borderRadius = "4px";
    searchBar.style.margin = "0 5px";
    searchBar.style.outline = "none";
    searchBar.style.fontSize = "14px";
    searchBar.style.width = "100%";

    return searchBar;
};

const createSearchButton = (text, id, clickHandler) => {
    const searchButton = document.createElement("button");
    searchButton.id = id;
    searchButton.textContent = text;
    searchButton.style.padding = "8px 16px";
    searchButton.style.backgroundColor = "#007bff";
    searchButton.style.color = "white";
    searchButton.style.border = "none";
    searchButton.style.borderRadius = "4px";
    searchButton.style.fontSize = "14px";
    searchButton.style.cursor = "pointer";
    searchButton.style.transition = "background-color 0.15s ease-in-out";
    searchButton.style.minWidth = "185px";
    searchButton.addEventListener("click", clickHandler);
    searchButton.addEventListener("mouseenter", () => {
        searchButton.style.backgroundColor = "#0056b3";
    });
    searchButton.addEventListener("mouseleave", () => {
        searchButton.style.backgroundColor = "#007bff";
    });
    return searchButton;
};

const createLoader = () => {
    const loaderContainer = document.createElement("div");
    loaderContainer.id = "loader";
    loaderContainer.className = "loader-container";
    loaderContainer.style.position = "fixed";
    loaderContainer.style.top = "50%";
    loaderContainer.style.left = "50%";
    loaderContainer.style.transform = "translate(-50%, -50%)";
    loaderContainer.style.display = "none";

    const loader = document.createElement("div");
    loader.className = "loader";
    loader.style.width = "48px";
    loader.style.height = "48px";
    loader.style.border = "3px solid #FFF";
    loader.style.borderRadius = "50%";
    loader.style.display = "inline-block";
    loader.style.position = "relative";
    loader.style.boxSizing = "border-box";
    loader.style.animation = "rotation 1s linear infinite";

    const loaderAfter = document.createElement("div");
    loaderAfter.className = "loader-after";
    loaderAfter.style.content = "";
    loaderAfter.style.boxSizing = "border-box";
    loaderAfter.style.position = "absolute";
    loaderAfter.style.left = "50%";
    loaderAfter.style.top = "50%";
    loaderAfter.style.transform = "translate(-50%, -50%)";
    loaderAfter.style.width = "56px";
    loaderAfter.style.height = "56px";
    loaderAfter.style.borderRadius = "50%";
    loaderAfter.style.border = "3px solid transparent";
    loaderAfter.style.borderBottomColor = "#FF3D00";

    loader.appendChild(loaderAfter);
    loaderContainer.appendChild(loader);

    return loaderContainer;
};

const updateWidgetContent = async (daysAverages) => {
    const widgetContainer = document.getElementById("weather-widget-container");
    const oldAvgsDiv = document.getElementById("averages-days-container");
    if (oldAvgsDiv) {
        widgetContainer.removeChild(oldAvgsDiv);
    }

    const averagesDiv = document.createElement("div");

    averagesDiv.id = "averages-days-container";
    averagesDiv.style.display = "flex";
    averagesDiv.style.flexDirection = "row";
    averagesDiv.style.justifyContent = "center";
    averagesDiv.style.margin = "20px auto";

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
    imagesContainer.style.display = "flex";
    imagesContainer.style.flexDirection = "row";

    const dayImageContainer = createImageAndDescription(day, "day");
    const nightImageContainer = createImageAndDescription(night, "night");

    dayImageContainer.style.maxWidth = "50%";
    nightImageContainer.style.maxWidth = "50%";

    imagesContainer.appendChild(dayImageContainer);
    imagesContainer.appendChild(nightImageContainer);

    return imagesContainer;
};

const createImageAndDescription = ({ image, description }, at) => {
    const imageContainer = document.createElement("div");
    imageContainer.style.display = "flex";
    imageContainer.style.flexDirection = "column";
    imageContainer.style.alignItems = "center";

    const imgElement = document.createElement("img");
    imgElement.src = image;
    imgElement.style.maxWidth = "100%";

    const descriptionElement = document.createElement("p");
    descriptionElement.textContent = `${description} at ${at}`;
    descriptionElement.style.marginTop = "5px";

    imageContainer.appendChild(imgElement);
    imageContainer.appendChild(descriptionElement);

    return imageContainer;
};

//############################################################################################

//########################################## Logic ###########################################

const getAvgTemperaturesByCity = async () => {
    const searchButtons = document.querySelectorAll(
        "#geo-search-btn, #city-search-btn"
    );
    showLoader();
    await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, 10000);
    });

    disableButtons(searchButtons);
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
    hideLoader();
    updateWidgetContent(daysAverages);
    enableButtons(searchButtons);
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

const getAvgTemperaturesByGeolocation = async () => {
    const searchButtons = document.querySelectorAll(
        "#geo-search-btn, #city-search-btn"
    );
    disableButtons(searchButtons);
    const lan = document.getElementById("lan").value;
    const lon = document.getElementById("lon").value;
    const geoLocation = { lan, lon };
    const historyData = await getHistoricalWeather(
        geoLocation,
        startDate,
        endDate
    );
    const dayTempMapping = await getDayToTemperatureMapping(historyData);
    const daysAverages = await calculateAverages(dayTempMapping);
    updateWidgetContent(daysAverages);
    enableButtons(searchButtons);
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

const getWeatherCodesMapping = async () => {
    const data = await fetch(WEATHER_CODES_URL);
    const res = await data.json().catch((error) => {
        console.error("Error fetching weatherCodeMapping data:", error);
    });

    const { files } = res;

    return files && files["descriptions.json"]
        ? JSON.parse(files["descriptions.json"].content)
        : {};
};

const execute = async () => {
    weatherCodeMapping = await getWeatherCodesMapping();
    // const { startDate, endDate } = get30DaysDateRange();
    // const userAverageTemperature = await getUserAverageTemperature(
    //     startDate,
    //     endDate
    // );
    // console.log("User location averages: ", userAverageTemperature);
    createElements();
};

execute();
