import React, { useState, useEffect } from "react";
import { Select, MenuItem, InputLabel, FormControl } from "@mui/material";

const TimePeriodDropdown = ({
  selectedTOD,
  onSelectTOD,
}: {
  selectedTOD: string;
  onSelectTOD: React.Dispatch<React.SetStateAction<string>>;
}) => {
  // Define time periods and their ranges
  const timePeriods = [
    { label: "Morning", start: 8, end: 12 },
    { label: "Afternoon", start: 12, end: 17 },
    { label: "Evening", start: 17, end: 21 },
  ];

  useEffect(() => {
    const currentHour = new Date().getHours();
    const currentPeriod = timePeriods.find(
      (period) => currentHour >= period.start && currentHour < period.end
    );

    // Default to afternoon if no period matches
    onSelectTOD(currentPeriod ? currentPeriod.label : "Afternoon");
  }, []);

  const handleChange = (event) => {
    onSelectTOD(event.target.value);
  };

  return (
    <FormControl fullWidth variant="outlined">
      <InputLabel id="time-period-select-label">Time of Day</InputLabel>
      <Select
        labelId="time-period-select-label"
        value={selectedTOD}
        onChange={handleChange}
        label="Time of Day"
      >
        {timePeriods.map((period, index) => (
          <MenuItem key={index} value={period.label}>
            {period.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default TimePeriodDropdown;
