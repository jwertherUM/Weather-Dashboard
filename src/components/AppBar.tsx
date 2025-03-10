import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SearchBar from "./SearchBar";
import DayDropdown from "./DayDropdown";
import TimePeriodDropdown from "./TimeOfDayDropdown";

// Top surface element in app, contains search and dropdowns
export default function PrimarySearchAppBar({
  setLocationCoords,
  setLocationString,
  onSelectTOD,
  selectedTOD,
  setDayJump,
  smallScreen,
  accentColor,
}: {
  setLocationString: React.Dispatch<React.SetStateAction<string>>;
  setLocationCoords: React.Dispatch<
    React.SetStateAction<{ lat: number; long: number }>
  >;
  onSelectTOD: React.Dispatch<React.SetStateAction<string>>;
  selectedTOD: string;
  setDayJump: React.Dispatch<React.SetStateAction<number>>;
  smallScreen: boolean;
  accentColor: string;
}) {
  return (
    <Box>
      <AppBar
        position="static"
        style={{
          borderRadius: 5,
          backgroundColor: "#fff",
          paddingTop: "15px",
          paddingBottom: "15px",
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            align="center"
            sx={{
              display: {
                xs: "none",
                sm: "block",
                color: accentColor,
              },
            }}
          >
            WHETHER.IO
          </Typography>
          <Box sx={{ flexGrow: 4, padding: "10px" }}>
            <SearchBar
              setLocationCoords={setLocationCoords}
              setLocationString={setLocationString}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: smallScreen ? "column" : "row",
              alignItems: "center",
              gap: smallScreen ? "10px" : "0px", // Adds spacing when in column mode
            }}
          >
            <Box sx={{ flex: 1, width: "100%" }}>
              <div style={{ display: "flex", flexDirection: "row" }}>
                <EventRepeatIcon
                  sx={{
                    color: accentColor,
                    alignSelf: "center",
                    margin: "5px",
                  }}
                />
                <DayDropdown setDayJump={setDayJump} />
              </div>
            </Box>
            <Box sx={{ flex: 1, width: "100%" }}>
              <div style={{ display: "flex", flexDirection: "row" }}>
                <AccessTimeIcon
                  sx={{
                    color: accentColor,
                    alignSelf: "center",
                    margin: "5px",
                  }}
                />
                <TimePeriodDropdown
                  selectedTOD={selectedTOD}
                  onSelectTOD={onSelectTOD}
                />
              </div>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
