import { useState, useEffect } from "react";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PrimarySearchAppBar from "./components/AppBar";
import Paper from "@mui/material/Paper";
import { CircularProgress, Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import WeatherCard from "./components/WeatherCard";
import { shiftWeek, getTimeOfDay, getTheme } from "./utils/utils";
import { HourlyData, VCResponse } from "./types/ResponseSchema";

// Disable blue accents on material UI focused elements
const theme = createTheme({
  components: {
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#333333",
          "&.Mui-focused": {
            color: "#333333",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          "& .MuiSelect-select": {
            color: "#333333",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "lightgrey",
          },
        },
      },
    },
  },
});

const Dashboard = () => {
  const [currentLocationString, setCurrentLocationString] = useState<string>(); // Default/current location in string format
  const [selectedLatLong, setSelectedLatLong] = useState<{
    lat: number;
    long: number;
  }>(); // Latitude and Longitude of selected location, defaults to current location
  const [selectedLocationString, setSelectedLocationString] =
    useState<string>(); // Displayed geolocation via nominatim.openstreetmap.org search
  const [timeOfDay, setTimeOfDay] = useState<
    "Afternoon" | "Morning" | "Evening"
  >("Afternoon"); // Morning/Afternoon/Evening state enum
  const [dayJump, setDayJump] = useState<number>(0); // How far the selected day is in the future from current (for date math)
  const [dashLoading, setDashLoading] = useState<boolean>(false); // Loading state for visualcrossing response
  const [cachedDays, setCachedDays] = useState<Map<string, HourlyData[]>>(
    new Map()
  ); // For each location, keep a cache of hourly data to minimize requests. Start with day +/- 7, 14
  const [primaryDate, setPrimaryDate] = useState<string>(); // Weather date to show on left of screen
  const [secondaryDate, setSecondaryDate] = useState<string>(); // Weather date to show on right of screen
  const [screenWidth, setScreenWidth] = useState(window.innerWidth); // Monitor screen width for component responsiveness
  const [graphHeight, setGraphHeight] = useState(600); // Weather graph height, dynamically set
  const [showSecondaryOnly, setShowSecondaryOnly] = useState<boolean>(false); // If only one graph is shown and it is the last date available, show secondary only
  const [loadError, setLoadError] = useState<boolean>(false); // Response error state

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      if (window.innerWidth < 1100) {
        // Shrink graph for mobile version
        setGraphHeight(400);
      } else {
        setShowSecondaryOnly(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleShift = async (forward: boolean) => {
    // Shift primary and secondary dates by one week each if possible
    let primaryResult = undefined;
    let newPrimaryDate = undefined;
    let secondaryResult = undefined;
    let newSecondaryDate = undefined;
    if (selectedLatLong) {
      if (primaryDate) {
        const newPrimary = shiftWeek(forward, primaryDate);
        // Cache/request new date
        await getDailyWeatherData(
          selectedLatLong.lat,
          selectedLatLong.long,
          newPrimary,
          true
        );
        primaryResult = cachedDays.get(newPrimary);
        if (
          !(
            primaryResult === undefined ||
            (primaryResult !== undefined && primaryResult.length === 0)
          )
        ) {
          newPrimaryDate = newPrimary;
        }
      }
      if (secondaryDate) {
        // Same logic for secondary date
        const newSecondary = shiftWeek(forward, secondaryDate);
        await getDailyWeatherData(
          selectedLatLong.lat,
          selectedLatLong.long,
          newSecondary,
          true
        );
        secondaryResult = cachedDays.get(newSecondary);
        if (
          !(
            secondaryResult === undefined ||
            (secondaryResult !== undefined && secondaryResult.length === 0)
          )
        ) {
          newSecondaryDate = newSecondary;
        }
      }
    }
    // If both dates can be modified by one week, adjust both
    if (
      primaryResult &&
      secondaryResult &&
      newPrimaryDate !== newSecondaryDate
    ) {
      setPrimaryDate(newPrimaryDate);
      setSecondaryDate(newSecondaryDate);
    } else if (primaryResult && !secondaryResult && screenWidth < 1100) {
      // If we reach the last week of forecast data and only one graph is being shown, show secondary (always primary + 7 days)
      setShowSecondaryOnly(true);
    }
  };

  // Set the time of day when the component mounts
  useEffect(() => {
    setTimeOfDay(getTimeOfDay());
  }, []);

  useEffect(() => {
    // Fetch user location on mount
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      setSelectedLatLong({ lat: latitude, long: longitude });
      try {
        const response = await fetch(
          `https://corsproxy.io/?https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
        );
        const data = await response.json();
        setLoadError(false);
        return setCurrentLocationString(data.display_name);
      } catch (error) {
        setLoadError(true);
        console.error("Error fetching current location:", error);
      }
    });
  }, []);

  const getDailyWeatherData = async (
    lat: number,
    long: number,
    dateStart: string,
    cacheUpdate: boolean // When fetching new location, don't use/update cache
  ) => {
    if (cacheUpdate && cachedDays.has(dateStart)) {
      setLoadError(false);
      return cachedDays.get(dateStart);
    } else {
      try {
        const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${long}/${dateStart}?key=${process.env.VC_KEY}&include=hours&unitGroup=us&contentType=json`;
        const response = await fetch(url);
        if (!response.ok) {
          console.error(`API request failed: ${response.statusText}`);
          setLoadError(true);
          return undefined;
        }
        const data: VCResponse = await response.json(); // Type assertion
        if (!data.days || data.days.length === 0 || !data.days[0].hours) {
          console.error("Invalid data format: Missing expected fields");
          // Empty data for day, but response ok
          setLoadError(false);
          return undefined;
        }
        if (cacheUpdate) {
          const newCachedDays = cachedDays;
          newCachedDays.set(dateStart, data.days[0].hours);
          setCachedDays(newCachedDays);
        }
        return data.days[0].hours || undefined; // Return only hourly data
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setLoadError(true);
        return undefined;
      }
    }
  };

  useEffect(() => {
    // Reset margin and padding for html and body on mount
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
  }, []);

  useEffect(() => {
    if (!selectedLatLong) return;
    const currentDate = new Date(); // Get current date
    currentDate.setDate(currentDate.getDate() + dayJump); // Add offset days
    const dateStart = currentDate.toLocaleDateString("en-CA");
    getDailyWeatherData(
      selectedLatLong.lat,
      selectedLatLong.long,
      dateStart,
      true
    ).then((val) => val !== undefined && setPrimaryDate(dateStart));
    const newSecondary = shiftWeek(true, dateStart);
    getDailyWeatherData(
      selectedLatLong.lat,
      selectedLatLong.long,
      newSecondary,
      true
    ).then((val) => val !== undefined && setSecondaryDate(newSecondary));
  }, [selectedLatLong, dayJump]);

  useEffect(() => {
    if (selectedLatLong && selectedLatLong.lat && selectedLatLong.long) {
      initializeNewLocation(selectedLatLong.lat, selectedLatLong.long, dayJump);
    }
  }, [selectedLatLong]);

  const initializeNewLocation = async (
    lat: number,
    long: number,
    dayOffset: number
  ) => {
    setCachedDays(new Map());
    setDashLoading(true);
    const dayJumps = [-14, -7, 0, 7, 14];
    const newDateCache = new Map();
    for (let i = 0; i < dayJumps.length; i++) {
      let currentDate = new Date();
      currentDate.setUTCDate(
        currentDate.getUTCDate() + dayOffset + dayJumps[i]
      );
      const dateStart = currentDate.toLocaleDateString("en-CA");
      const daily = await getDailyWeatherData(lat, long, dateStart, false);
      newDateCache.set(dateStart, daily);
      if (dayJumps[i] === 0) {
        setPrimaryDate(dateStart);
      } else if (dayJumps[i] === 7) {
        setSecondaryDate(dateStart);
      }
    }
    setDashLoading(false);
    setCachedDays(newDateCache);
  };

  return (
    <ThemeProvider theme={theme}>
      <div
        style={{
          height: "100%",
          minHeight: "100vh",
          background: getTheme(timeOfDay, true),
          padding: "15px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <PrimarySearchAppBar
          setLocationString={setSelectedLocationString}
          setLocationCoords={setSelectedLatLong}
          selectedTOD={timeOfDay}
          onSelectTOD={setTimeOfDay}
          setDayJump={setDayJump}
          smallScreen={screenWidth < 600}
          accentColor={getTheme(timeOfDay, false)}
        />
        <Paper elevation={3} sx={{ padding: "10px", marginTop: "10px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              height: "100%",
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  width: screenWidth * 0.9,
                }}
              >
                <LocationOnIcon
                  sx={{
                    color: getTheme(timeOfDay, false),
                    alignSelf: "center",
                    margin: "5px",
                  }}
                />
                <Typography
                  variant="body1"
                  noWrap
                  component="div"
                  align="center"
                  sx={{
                    display: "block",
                    color: "#333333",
                    alignSelf: "center",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    minWidth: "0",
                    maxWidth: "100%",
                  }}
                >
                  {selectedLocationString || currentLocationString}
                </Typography>
              </div>
            </div>
          </div>
        </Paper>
        <Paper
          elevation={3}
          sx={{
            marginTop: "10px",
            flex: 0.95, // Makes this paper take up the remaining space
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            overflow: "hidden",
            height: "100%",
            position: "relative",
            marginBottom: "20px",
            padding: "10px",
          }}
        >
          <div style={{ height: 20 }}>
            <IconButton
              sx={{ position: "absolute", left: 5 }}
              onClick={() => handleShift(false)}
              aria-label="left"
            >
              <ArrowBackIcon />
            </IconButton>
            <IconButton
              sx={{ position: "absolute", right: 5 }}
              onClick={() => handleShift(true)}
              aria-label="right"
            >
              <ArrowForwardIcon />
            </IconButton>
          </div>
          {!dashLoading && primaryDate ? (
            <div
              style={{
                width: "100%",
                maxWidth: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              {!showSecondaryOnly && (
                <div
                  style={{
                    width: screenWidth < 1100 ? "90%" : "45%", // Adjusts dynamically
                    maxWidth: "100%",
                    height: "100%",
                    flexGrow: 1,
                    minHeight: 600,
                    display: "flex",
                  }}
                >
                  <WeatherCard
                    hours={cachedDays.get(primaryDate) || []}
                    selectedTOD={timeOfDay}
                    color1={getTheme(timeOfDay, false)[0]}
                    color2={getTheme(timeOfDay, false)[1]}
                    graphHeight={graphHeight}
                    date={primaryDate}
                    screenWidth={screenWidth}
                  />
                </div>
              )}
              {secondaryDate &&
                (screenWidth > 1100 ||
                  (screenWidth < 1100 && showSecondaryOnly)) && (
                  <div
                    style={{
                      width: "45%", // Ensures it shares space correctly
                      maxWidth: "100%",
                      height: "100%",
                      flexGrow: 1,
                      minHeight: 600,
                      display: "flex",
                    }}
                  >
                    <WeatherCard
                      hours={cachedDays.get(secondaryDate) || []}
                      selectedTOD={timeOfDay}
                      color1={getTheme(timeOfDay, false)[0]}
                      color2={getTheme(timeOfDay, false)[1]}
                      graphHeight={graphHeight}
                      date={secondaryDate}
                      screenWidth={screenWidth}
                    />
                  </div>
                )}
            </div>
          ) : (
            <div
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                width: "100%",
                display: "flex", // Ensure this div is a flex container
              }}
            >
              {!dashLoading && loadError ? (
                <div>Connection Error: Try Again</div>
              ) : (
                <CircularProgress sx={{ margin: "auto" }} />
              )}
            </div>
          )}
        </Paper>
      </div>
    </ThemeProvider>
  );
};

export default Dashboard;
