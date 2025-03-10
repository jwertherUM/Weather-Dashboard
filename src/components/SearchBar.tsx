import React, { useState, useEffect, useCallback } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Paper from "@mui/material/Paper";
import { CircularProgress, Button } from "@mui/material";
import { LocationData } from "../types/LocationData";

const isValidLocationData = (data: any): data is LocationData[] => {
  return (
    Array.isArray(data) &&
    data.every(
      (item) =>
        typeof item.display_name === "string" &&
        typeof item.lat === "string" &&
        typeof item.lon === "string" &&
        typeof item.address === "object" &&
        typeof item.address.country === "string" &&
        typeof item.address.country_code === "string"
    )
  );
};

const SearchBar = ({
  setLocationCoords,
  setLocationString,
}: {
  setLocationCoords: React.Dispatch<
    React.SetStateAction<{ lat: number; long: number }>
  >;
  setLocationString: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    { label: string; lat: number; long: number }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const fetchLocations = useCallback(async (searchTerm: string) => {
    if (!searchTerm) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://corsproxy.io/?https://nominatim.openstreetmap.org/search?format=json&q=${searchTerm}&addressdetails=1&limit=5`
      );
      const data = await response.json();
      if (!isValidLocationData(data))
        throw new Error("Invalid location data format");

      setSuggestions(
        data.map((loc) => ({
          label: `${loc.display_name} (${
            loc.address.postcode || `${loc.lat},${loc.lon}`
          })`,
          lat: Number(loc.lat),
          long: Number(loc.lon),
        }))
      );
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
    setLoading(false);
  }, []);

  const handleInputChange = (
    event: React.ChangeEvent<{}>,
    newInputValue: string
  ) => {
    setQuery(newInputValue);
    if (timeoutId) clearTimeout(timeoutId);
    const newTimeoutId = setTimeout(() => {
      fetchLocations(newInputValue);
    }, 500);
    setTimeoutId(newTimeoutId);
  };

  return (
    <div style={{ backgroundColor: "#fff", borderRadius: 5 }}>
      <Autocomplete
        freeSolo
        options={suggestions}
        getOptionLabel={(option) => option.label}
        onInputChange={handleInputChange}
        onChange={(event, newValue) => {
          if (
            newValue &&
            typeof newValue !== "string" &&
            newValue.lat &&
            newValue.long
          ) {
            setLocationString(newValue.label);
            setLocationCoords({ lat: newValue.lat, long: newValue.long });
            setQuery("");
            setSuggestions([]);
          }
        }}
        loading={loading}
        renderInput={(params) => (
          <TextField
            {...params}
            sx={{ color: "#333333" }}
            label="Search for a city..."
            variant="outlined"
            fullWidth
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        PaperComponent={(props) => <Paper {...props} elevation={3} />}
      />
    </div>
  );
};

export default SearchBar;
