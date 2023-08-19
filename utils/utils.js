const WEATHER_CODES_URL = `https://api.github.com/gists/9490c195ed2b53c707087c8c2db4ec0c`;

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

export const weatherCodeMapping = await getWeatherCodesMapping();
