import { useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the necessary components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Helper function to generate x-axis labels based on the time of day
const generateXAxisLabels = (tod: string) => {
  let startHour, endHour;
  if (tod === "Morning") {
    startHour = 8;
    endHour = 12;
  } else if (tod === "Afternoon") {
    startHour = 12;
    endHour = 17;
  } else if (tod === "Evening") {
    startHour = 17;
    endHour = 21;
  } else {
    return [];
  }

  // Generate the time labels
  const labels = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    const formattedHour = formatTime(hour);
    labels.push(formattedHour);
  }

  return labels;
};

// Return appropriate hours depending on the time of day
const sliceValues = (values: number[], tod: string) => {
  if (values.length === 24) {
    if (tod === "Morning") {
      return values.slice(8, 13);
    } else if (tod === "Afternoon") {
      return values.slice(12, 18);
    } else if (tod === "Evening") {
      return values.slice(17, 23);
    } else {
      return [];
    }
  } else {
    return [];
  }
};

// Helper function to format time to hh:mmAM/PM
const formatTime = (hour: number) => {
  const ampm = hour < 12 ? "AM" : "PM";
  let formattedHour = hour % 12;
  formattedHour = formattedHour === 0 ? 12 : formattedHour; // Adjust for 12 PM / AM
  return `${formattedHour}:00${ampm}`;
};

// Multi y-axis line chart to display groups of weather data
const MultiAxisLineChart = ({
  tod,
  info,
  selectedCategories,
  color1,
  color2,
  graphHeight,
}: {
  tod: string;
  info: Record<string, { label: string; values: number[] }>;
  selectedCategories: string[]; // List of selected categories to display
  color1: string;
  color2: string;
  graphHeight: number;
}) => {
  const chartRef = useRef(null);

  // Dynamically generate x-axis labels based on the time of day
  const labels = generateXAxisLabels(tod);

  // Prepare datasets dynamically based on selected categories
  const datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    yAxisID: string;
  }[] = [];
  selectedCategories.forEach((category, index) => {
    if (info[category] && info[category].values.length === 24) {
      datasets.push({
        label: info[category].label, // Capitalize first letter for the label
        data: sliceValues(info[category].values, tod),
        borderColor: index === 0 ? color1 : color2,
        backgroundColor: index === 0 ? color1 : color2,
        fill: false,
        yAxisID: `y${index + 1}`,
      });
    }
  });

  // Chart data
  const data = {
    labels: labels,
    datasets: datasets,
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: selectedCategories.reduce((scales, category, index) => {
      const yAxisID = `y${index + 1}`;
      scales[yAxisID] = {
        type: "linear",
        position: index === 0 ? "left" : "right",
        title: {
          display: true,
          text: info[category].label,
        },
        min: Math.max(0, Math.min(...info[category].values) - 2), // Dynamic min value based on data
        max: Math.max(...info[category].values) + 1, // Dynamic max value based on data
        grid: {
          display: false,
        },
      };
      return scales;
    }, {}),
    animation: {
      duration: 2000, // 2 seconds
      easing: "easeInOutQuart",
      loop: false,
    },
  };

  return (
    <div style={{ width: "100%" }}>
      <Line
        ref={chartRef}
        data={data}
        options={options}
        style={{ width: "100%", height: graphHeight }}
      />
    </div>
  );
};

export default MultiAxisLineChart;
