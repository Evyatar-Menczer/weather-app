const WEATHER_CODES_URL = `https://api.github.com/gists/9490c195ed2b53c707087c8c2db4ec0c`;

let weatherCodeMapping;

const divId = document.currentScript.getAttribute("div-id");
//############# HTML #############
const createElements = () => {
    const weatherContainer = createWeatherContainer(divId);

    const inputsContainer = document.createElement("div");
    inputsContainer.style.width = "525px";
    inputsContainer.style.margin = "0 auto";
    
    const citySearchContainer = document.createElement("div");
    citySearchContainer.style.display = "flex";
    citySearchContainer.style.flexDirection = "row";
    citySearchContainer.style.justifyContent = "center";

    const citySearchBar = createInput("Enter City Name", "city-input");
    const citySearchButton = createSearchButton(
        "Search by City",
        getAvgTemperaturesByCity
    );
    citySearchContainer.appendChild(citySearchBar);
    citySearchContainer.appendChild(citySearchButton);
    inputsContainer.appendChild(citySearchContainer);

    const geoSearchContainer = document.createElement("div");
    geoSearchContainer.style.display = "flex";
    geoSearchContainer.style.flexDirection = "row";
    geoSearchContainer.style.justifyContent = "center";
    const geoSearchBar = createInput("Enter Latitude", "lat-input");
    geoSearchContainer.appendChild(geoSearchBar);
    const geoSearchBar2 = createInput("Enter Longitude", "lon-input");
    geoSearchContainer.appendChild(geoSearchBar2);

    const geoSearchButton = createSearchButton(
        "Search by Geo Location",
        getAvgTemperaturesByGeolocation
    );
    geoSearchContainer.appendChild(geoSearchButton);
    inputsContainer.appendChild(geoSearchContainer);
    weatherContainer.appendChild(inputsContainer);
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

    return searchBar;
};

const createSearchButton = (text, clickHandler) => {
    const searchButton = document.createElement("button");
    searchButton.textContent = text;
    searchButton.addEventListener("click", clickHandler);

    return searchButton;
};

const styleWeatherContainer = (widgetContainer) => {
    widgetContainer.style.backgroundColor = "#f5f5f5";
    widgetContainer.style.padding = "20px";
    widgetContainer.style.borderRadius = "8px";
    widgetContainer.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.1)";
    widgetContainer.style.textAlign = "center";
};

const styledayAvg = (dayDiv) => {
    dayDiv.style.flex = "1";
    dayDiv.style.padding = "5px";
    dayDiv.style.backgroundColor = "#fff";
    dayDiv.style.border = "1px solid #ccc";
    dayDiv.style.borderRadius = "4px";
};

const updateWidgetContent = async (daysAverages) => {
    const widgetContainer = document.getElementById("weather-widget-container");
    const averagesDiv = document.getElementById("averages-days-container")
        ? document.getElementById("averages-days-container")
        : document.createElement("div");

    averagesDiv.id = "averages-days-container";
    averagesDiv.style.display = "flex";
    averagesDiv.style.flexDirection = "row";
    averagesDiv.style.justifyContent = "center";
    averagesDiv.style.margin = "20px auto";

    for (const dayAvg of daysAverages) {
        const { dayOfWeek, avgTemperature, weatherCode } = dayAvg;
        const dayDiv = document.createElement("div");
        dayDiv.id = dayOfWeek.toLowerCase();
        dayDiv.style.display = "flex";
        dayDiv.style.flexDirection = "column";
        dayDiv.style.justifyContent = "center";
        dayDiv.style.alignItems = "center";
        dayDiv.style.width = "150px"; // Adjust width as needed
        dayDiv.style.margin = "0 5px";
        dayDiv.style.backgroundColor = "#fff";
        dayDiv.style.border = "1px solid #ccc";
        dayDiv.style.borderRadius = "4px";
        dayDiv.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.1)";
        dayDiv.style.padding = "10px";
        dayDiv.style.fontSize = "14px";
        dayDiv.style.textTransform = "uppercase";
        dayDiv.style.textAlign = "center";
        dayDiv.style.cursor = "pointer";
        dayDiv.style.transition = "all 0.3s ease-in-out";

        // Create elements for day name, temperature, icons, and description
        const dayNameElement = document.createElement("div");
        dayNameElement.textContent = dayOfWeek;
        dayDiv.appendChild(dayNameElement);

        const temperatureElement = document.createElement("div");
        temperatureElement.textContent = `${avgTemperature}°C`;
        dayDiv.appendChild(temperatureElement);

        const imagesContainer = createImagesContainer(weatherCode);
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

    const dayImageContainer = createImageAndDescription(day);
    imagesContainer.appendChild(dayImageContainer);

    const nightImageContainer = createImageAndDescription(night);
    imagesContainer.appendChild(nightImageContainer);

    return imagesContainer;
};

const createImageAndDescription = ({ image, description }) => {
    const imageContainer = document.createElement("div");
    imageContainer.style.display = "flex";
    imageContainer.style.flexDirection = "column";

    const dayIconElement = document.createElement("img");
    dayIconElement.src = image;
    imageContainer.appendChild(dayIconElement);

    const dayDescriptionElement = document.createElement("p");
    dayDescriptionElement.textContent = description;
    imageContainer.appendChild(dayDescriptionElement);

    return imageContainer;
};

//############################################################################################

//########################################## Logic ###########################################

const getAvgTemperaturesByCity = async () => {
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
};

const getAvgTemperaturesByGeolocation = async () => {
    const lan = document.getElementById("lan").value;
    const lon = document.getElementById("lon").value;
    const getLocation = await getGeolocationByCityName(cityName);
    const historyData = await getHistoricalWeather(
        getLocation,
        startDate,
        endDate
    );
    const dayTempMapping = await getDayToTemperatureMapping(historyData);
    const daysAverages = await calculateAverages(dayTempMapping);
    updateWidgetContent(daysAverages);
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
