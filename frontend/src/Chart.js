import ReactDOM from "react-dom/client";
import React from "react";

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  elements: {
    point: {
      borderWidth: 0,
      radius: 10,
      pointBackgroundColor: "rgb(0,0,0,0)",
    },
  },
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Graphen von ausgewählten Geräten",
    },
  },
  scales: {
    y: {
      title: {
        display: true,
        text: "Energie in Watt",
      },
    },
  },
};

export const chartcolors = [
  "#fc5c65",
  "#26de81",
  "#fed330",
  "#D980FA",
  "#4b7bec",
  "#a55eea",
  "#fd9644",
  "#1B1464",
];

export function formatTimestamp(unixtimestamp) {
  var date = new Date(unixtimestamp * 1000);
  var hours = String("00" + date.getHours());
  var minutes = String("00" + date.getMinutes());
  var seconds = String("00" + date.getSeconds());
  var formattedTime =
    hours.substring(hours.length - 2) +
    ":" +
    minutes.substring(minutes.length - 2) +
    ":" +
    seconds.substring(seconds.length - 2);
  return formattedTime;
}

export function plotComparison(geraetArray) {
  var times;
  const datasets = [];

  for (var i = 0; i < geraetArray.length; i++) {
    const geraetNummer = geraetArray[i].id;
    const messungen = geraetArray[i].data.sort((a, b) => a[1] - b[1]);
    times = messungen.map((messungen) => formatTimestamp(messungen[1]));
    const dataRounded = messungen.map((messungen) => messungen[0].toFixed(2));
    datasets.push({
      label: `Edison № ${geraetNummer}`,
      data: dataRounded,
      borderColor: chartcolors,
      backgroundColor: chartcolors,
    });
  }

  const data = {
    labels: times,
    datasets: datasets,
  };

  ReactDOM.createRoot(document.getElementById("graphvergleich")).render(
    <Line options={options} data={data} />
  );

  return <>{<div id="graphdaten"></div>}</>;
}
