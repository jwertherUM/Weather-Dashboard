import { useState } from "react";
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import MultiAxisLineChart from "./DailyGraph";
import iconMap from "../utils/iconMap";
import { HourlyData } from "../types/ResponseSchema";

const WeatherCard = ({
  hours,
  selectedTOD,
  color1,
  color2,
  graphHeight,
  date,
  screenWidth,
}: {
  hours: HourlyData[];
  selectedTOD: string;
  color1: string;
  color2: string;
  graphHeight: number;
  date: string;
  screenWidth: number;
}) => {
  const [selectedCategory, setSelectedCategory] =
    useState<string>("Temperature");

  const handleCategoryChange = (event: any) => {
    setSelectedCategory(event.target.value);
  };

  const getWeatherIcon = () => {
    // Use static icon dictionary to display VC Weather Icons
    const hourIdx =
      selectedTOD === "Morning" ? 8 : selectedTOD === "Afternoon" ? 12 : 17;
    const selectedHour = hours[hourIdx];
    if (!selectedHour || !selectedHour.icon) return null;
    return iconMap[selectedHour.icon] || iconMap["clear-day"];
  };

  const generateWeatherMessage = (tod: string) => {
    // Pick a message to display based on conditions during the first hour of the time of day
    const hourIdx = tod === "Morning" ? 8 : tod === "Afternoon" ? 12 : 17;
    const selectedHour = hours[hourIdx];
    if (!selectedHour) return "Have a great day!";

    if (selectedHour.precipprob > 50) {
      if (selectedHour.temp > 35) {
        return "Don't forget your umbrella!";
      } else {
        return "Winter Wonderland!";
      }
    }
    if (selectedHour.temp < 40) return "Bundle up out there!";
    if (selectedHour.temp > 85) return "Stay cool and hydrated today!";
    if (selectedHour.windgust > 25)
      return "It might be windy—hold onto your hat!";
    if (selectedHour.humidity > 80) return "A little bit muggy out there!";
    if (selectedHour.conditions.toLowerCase().includes("cloudy"))
      return "Leave the sunglasses at home!";
    if (
      selectedHour.temp > 60 &&
      selectedHour.temp < 85 &&
      selectedHour.precipprob < 10
    )
      return "Perfect Day!";
    return "Enjoy the weather today!";
  };

  // Extract data based on the selected category
  const extractDataForChart = (category: string) => {
    let chartInfo: Record<string, { label: string; values: number[] }> = {};

    switch (category) {
      case "Temperature":
        chartInfo = {
          temps: {
            label: "Temperature (Degrees Farenheit)",
            values: hours.map((x) => x.temp),
          },
          feels: {
            label: "Feels Like (Degrees Farenheit)",
            values: hours.map((x) => x.feelslike),
          },
        };
        break;
      case "Precipitation":
        chartInfo = {
          precipProbs: {
            label: "Precipitation Probability",
            values: hours.map((x) => x.precipprob),
          },
          precip: {
            label: "Precipitation (inches)",
            values: hours.map((x) => x.precip),
          },
        };
        break;
      case "Humidity / UV":
        chartInfo = {
          humidity: {
            label: "Percent Humidity",
            values: hours.map((x) => x.humidity),
          },
          uvIndex: { label: "UV Index", values: hours.map((x) => x.uvindex) },
        };
        break;
      case "Wind":
        chartInfo = {
          windSpeed: {
            label: "Wind Speed (mph)",
            values: hours.map((x) => x.windspeed),
          },
          windGust: {
            label: "Wind Gust (mph)",
            values: hours.map((x) => x.windgust),
          },
        };
        break;
      default:
        break;
    }

    return chartInfo;
  };

  const info = extractDataForChart(selectedCategory);
  const formattedDate = new Date(date + "T00:00:00");
  const dayOfWeek = formattedDate.toLocaleDateString("en-US", {
    weekday: "long",
  });
  const monthDay = formattedDate.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <div
      style={{
        flex: 1,
        height: "100%",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <FormControl
          sx={{
            marginTop: "15px",
            marginBottom: "15px",
            marginRight: "5px",
            marginLeft: "5px",
          }}
        >
          <InputLabel>Insights</InputLabel>
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
            label="Categories"
          >
            <MenuItem value="Temperature">Temperature</MenuItem>
            <MenuItem value="Precipitation">Precipitation</MenuItem>
            <MenuItem value="Humidity / UV">Humidity / UV</MenuItem>
          </Select>
        </FormControl>
        {screenWidth > 700 && (
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div
              style={{
                width: "50px",
                height: "50px",
                backgroundColor: "gray",
                WebkitMaskImage: `url(${getWeatherIcon()})`,
                maskImage: `url(${getWeatherIcon()})`,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskSize: "contain",
                maskSize: "contain",
              }}
            />
            <Typography
              variant="h4"
              noWrap
              component="div"
              align="right"
              sx={{
                display: "block", // Ensure it's always displayed
                color: "gray",
                alignSelf: "center",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
                minWidth: "0",
                maxWidth: "100%",
                marginRight: "5px",
              }}
            >
              {`${
                hours.length === 24 &&
                hours[
                  selectedTOD === "Morning"
                    ? 8
                    : selectedTOD === "Afternoon"
                    ? 12
                    : 17
                ].temp
              }\u00B0 F`}
            </Typography>
          </div>
        )}
        <div>
          <Typography
            variant="body1"
            noWrap
            component="div"
            align="right"
            sx={{
              display: "block",
              color: "gray",
              alignSelf: "center",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              minWidth: "0",
              maxWidth: "100%",
              marginRight: "5px",
            }}
          >
            {`${dayOfWeek} ${selectedTOD}, ${monthDay}`}
          </Typography>
          <Typography
            variant="body2"
            noWrap
            component="div"
            align="right"
            sx={{
              display: "block",
              color: "gray",
              alignSelf: "center",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              minWidth: "0",
              maxWidth: "100%",
              marginRight: "5px",
            }}
          >
            {hours &&
              hours.length >= 1 &&
              hours[
                selectedTOD === "Morning"
                  ? 8
                  : selectedTOD === "Afternoon"
                  ? 12
                  : 17
              ].conditions}
          </Typography>
          <Typography
            variant="body2"
            noWrap
            component="div"
            align="right"
            sx={{
              display: "block",
              color: "gray",
              alignSelf: "center",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              minWidth: "0",
              maxWidth: "100%",
              marginRight: "5px",
            }}
          >
            {generateWeatherMessage(selectedTOD)}
          </Typography>
        </div>
      </div>
      <div style={{ width: "100%" }}>
        <MultiAxisLineChart
          tod={selectedTOD}
          info={info} // info dynamically populated based on the selected category
          selectedCategories={Object.keys(info)} // Pass the selected categories (keys) to the chart
          color1={color1}
          color2={color2}
          graphHeight={graphHeight} // Changes depending on mobile mode
        />
      </div>
    </div>
  );
};

export default WeatherCard;
