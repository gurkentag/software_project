import axios from "axios";
import { useState } from "react";
import { formatTimestamp } from "./Chart";

import { Line } from "react-chartjs-2";

const chartcolors = [
  "#fc5c65",
  "#26de81",
  "#fed330",
  "#D980FA",
  "#4b7bec",
  "#a55eea",
  "#fd9644",
  "#1B1464",
];

function getValues(id, callback) {
  axios.get(`/api/get_sequenz_values?id=${id}`).then((response) => {
    console.log("response:", response.data);
    callback(response);
  });
}

function buildGraph(values, device) {
  const options = {
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
        text: "Lastsequenz",
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
  const datasets = [
    {
      label: `Edison № ${device}`,
      data: values.map((messungen) => messungen[0].toFixed(2)),
      borderColor: chartcolors,
      backgroundColor: chartcolors,
    },
  ];
  console.log("values:", values);
  console.log(datasets);
  const times = values.map((messungen) => formatTimestamp(messungen[1]));
  const data = {
    labels: times,
    datasets: datasets,
  };
  return <Line options={options} data={data} />;
}

export default function Sequenz({ label, device, id, resetter, showAll }) {
  const [values, setValues] = useState([]);
  const [toggleView, setToggleView] = useState(false);

  function showGraph() {
    if (values.length > 0) {
      setToggleView(!toggleView);
    } else {
      getValues(id, (response) => {
        setValues(response.data);
        setToggleView(!toggleView);
      });
    }
  }
  function deleteSequenz(callback) {
    axios.get(`/api/delete_sequenz/${id}`).then((response) => {
      console.log("response:", response.data);
      callback(response);
    });
  }
  return (
    <>
      <div
        className={
          showAll || !label.includes("Auto")
            ? "sequenzContainer"
            : "sequenzContainer d-none"
        }
      >
        <p>
          Lastsequenz {label}, Edison № {device}
        </p>
        <button className="btn btn-primary m-2" onClick={showGraph}>
          Graph anzeigen
        </button>
        <button
          className="btn btn-danger m-2"
          onClick={() =>
            deleteSequenz((r) => {
              console.log(r);
              resetter();
            })
          }
        >
          🗑️
        </button>
        {toggleView ? buildGraph(values, device) : <></>}
      </div>
    </>
  );
}
