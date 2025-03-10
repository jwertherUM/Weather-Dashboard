export const shiftWeek = (forward: boolean, incomingDate: string) => {
  // Add or subtract seven days from given date (forward --> +7, !forward --> -7)
  const dateStr = incomingDate;
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + (forward ? 7 : -7));
  const newMonth = String(date.getMonth() + 1).padStart(2, "0");
  const newDay = String(date.getDate()).padStart(2, "0");
  const newYear = date.getFullYear();
  // Return date +/- 7 days as YYYY-MM-DD
  return `${newYear}-${newMonth}-${newDay}`;
};

export const getTimeOfDay = () => {
  // Determine time of day, if user time is outside of defined zones, default to afternoon (common time to plan events)
  const currentHour = new Date().getHours();
  if (currentHour >= 8 && currentHour < 12) {
    return "Morning";
  } else if (currentHour >= 12 && currentHour < 17) {
    return "Afternoon";
  } else if (currentHour >= 17 && currentHour < 21) {
    return "Evening";
  } else {
    return "Afternoon"; // Default to afternoon for night/early hours
  }
};

export const getTheme = (timeOfDay: string, gradient: boolean) => {
  if (gradient) {
    switch (timeOfDay) {
      case "Morning":
        return "linear-gradient(to bottom, #ffecd2, #fcb69f)"; // Soft orange to pink (sunrise)
      case "Afternoon":
        return "linear-gradient(to bottom, #a0c4ff, #b9e6ff)"; // Soft light blue (blue sky)
      case "Evening":
        return "linear-gradient(to bottom, #776E99, #DA7F7D)"; // Muted purple and soft pink (dusk)
      default:
        return "linear-gradient(to bottom, #a0c4ff, #b9e6ff)"; // Default to afternoon (blue sky)
    }
  } else {
    switch (timeOfDay) {
      case "Morning":
        return ["#ffecd2", "#fcb69f"];
      case "Afternoon":
        return ["#b9e6ff", "#a0c4ff"];
      case "Evening":
        return ["#DA7F7D", "#776E99"];
      default:
        return ["#b9e6ff", "#a0c4ff"];
    }
  }
};
