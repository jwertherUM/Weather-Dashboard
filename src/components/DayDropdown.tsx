import React, { useState, useEffect } from "react";
import { Select, MenuItem, InputLabel, FormControl } from "@mui/material";

const DayDropdown = ({
  setDayJump,
}: {
  setDayJump: React.Dispatch<React.SetStateAction<number>>;
}) => {
  // Array of the days of the week
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // State to store the selected day
  const [selectedDay, setSelectedDay] = useState("");

  // Get the current day of the week (0 - 6) and set it as the default
  useEffect(() => {
    const currentDay = new Date().getDay();
    setSelectedDay(daysOfWeek[currentDay]);
    setDayJump(0);
  }, []);

  const handleChange = (event) => {
    // Set day to next instance of that day of the week, so yesterday is +6 not -1
    const newDayIdx = daysOfWeek.indexOf(event.target.value);
    const currentDay = new Date().getDay();
    const dayJump =
      currentDay > newDayIdx
        ? 7 - currentDay + newDayIdx
        : newDayIdx - currentDay;
    setSelectedDay(event.target.value);
    setDayJump(dayJump);
  };

  return (
    <FormControl fullWidth variant="outlined">
      <InputLabel id="day-select-label">Day of the Week</InputLabel>
      <Select
        labelId="day-select-label"
        value={selectedDay}
        onChange={handleChange}
        label="Day of the Week"
      >
        {daysOfWeek.map((day, index) => (
          <MenuItem key={index} value={day}>
            {day}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default DayDropdown;
