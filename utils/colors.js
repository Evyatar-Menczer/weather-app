const temperatureRanges = [
    { min: -50, max: -10, color: "#0519ff" },
    { min: -10, max: 0, color: "#2435ff" },
    { min: 0, max: 5, color: "#6ca7ff" },
    { min: 5, max: 10, color: "#86daf3" },
    { min: 10, max: 15, color: "#94fdee" },
    { min: 15, max: 20, color: "#5cf599" },
    { min: 20, max: 25, color: "#b4f360" },
    { min: 25, max: 30, color: "#edc05a" },
    { min: 30, max: 35, color: "#ff7716" },
    { min: 35, max: 40, color: "#ff1616" },
    { min: 40, max: 50, color: "#ff0000" },
];

export const calculateColor = (temperature) => {
    for (const range of temperatureRanges) {
        if (temperature >= range.min && temperature <= range.max) {
            const t = normalize(temperature, range.min, range.max, 1.5);
            return interpolateColors(t, range);
        }
    }

    return "#f5f5f5";
};

const normalize = (value, min, max, factor) =>
    (value - min) / ((max - min) * factor);

const interpolateColors = (normalizedTemperature, range) => {
    const r = Math.round(
        (1 - normalizedTemperature) * 255 +
            normalizedTemperature * hexToR(range.color)
    );
    const g = Math.round(
        (1 - normalizedTemperature) * 255 +
            normalizedTemperature * hexToG(range.color)
    );
    const b = Math.round(
        (1 - normalizedTemperature) * 255 +
            normalizedTemperature * hexToB(range.color)
    );

    return rgbToHex(r, g, b);
};

const hexToR = (hex) => parseInt(hex.slice(1, 3), 16);
const hexToG = (hex) => parseInt(hex.slice(3, 5), 16);
const hexToB = (hex) => parseInt(hex.slice(5, 7), 16);

const rgbToHex = (r, g, b) =>
    `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;

const componentToHex = (c) => {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
};
