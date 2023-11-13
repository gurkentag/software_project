import * as React from "react";
import { useEffect, useRef, useState } from "react";
//import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import OutlinedInput from "@mui/material/OutlinedInput";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

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

import zoomPlugin from "chartjs-plugin-zoom";
import { Line } from "react-chartjs-2";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

const ITEM_HEIGHT = 32;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};
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
      text: "Mit der Maus einen Bereich an dem Graph auswählen",
    },
    zoom: {
      pan: {
        enabled: true,
        mode: "x",
        modifierKey: "ctrl",
      },
      zoom: {
        drag: {
          enabled: true,
          backgroundColor: "rgba(100, 27, 150, 0.75)",
        },
        mode: "x",
      },
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

export const data = {
  labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  datasets: [
    {
      label: `Edison № blargh`,
      data: [
        2.0, 9.0, 17.0, 2.0, 4.0, 6.0, 2.0, 2.0, 9.0, 17.0, 2.0, 4.0, 6.0, 2.0,
      ],
      borderColor: "rgba(255, 236, 179, 0.5)",
      backgroundColor: "rgba(255, 255, 255, 1)",
    },
  ],
};

function formatTimestamp(unixtimestamp) {
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

function inverseFormatTimestamp(dateString) {
  var date = new Date(Date.now());
  return (
    new Date(
      `${
        date.getMonth() + 1
      }/${date.getDate()}/${date.getFullYear()} ${dateString}`
    ).getTime() / 1000
  );
}

var numberOfDevice;

export function LastSeq() {
  const selectOptions = [];
  for (var i = 1; i <= 56; i++) {
    if (i !== 50 && i !== 30) {
      selectOptions.push(
        <MenuItem key={i} value={i}>
          {" "}
          {`Edison № ${i}`}
        </MenuItem>
      );
    }
  }
  const [deviceSelect, setDeviceSelect] = React.useState(
    selectOptions[0].value
  );
  const [deviceData, setDeviceData] = React.useState([[], []]);
  const chartRef = useRef(null);
  const [newLastSeqName, setNewLastSeqName] = useState("");

  useEffect(() => {
    const chart = chartRef.current;

    if (chart) {
      console.log("ChartJS", chart);
    }
  }, []);

  function resetZoom() {
    const chart = chartRef.current;
    if (chart) {
      chart.resetZoom();
    }
  }

  function submitZoom() {
    if (newLastSeqName) {
      const chart = chartRef.current;
      const x_values = chart.scales.x.ticks.map((el) => el.label);
      var min_val = x_values.reduce((min, c) => (c < min ? c : min));
      var max_val = x_values.reduce((max, c) => (c > max ? c : max));
      console.log(`User selected from ${min_val} to ${max_val}`);
      //resetZoom()
      submitRequest(deviceSelect, min_val, max_val, newLastSeqName);
    } else {
      console.log("User did not input a name for the new lastseq.");
      toast("⚠️ Bitte einen Namen eingeben");
    }
  }

  function submitRequest(geraetNummer, min_val, max_val, name) {
    min_val = inverseFormatTimestamp(min_val);
    max_val = inverseFormatTimestamp(max_val);
    axios
      .get(
        `/api/submit_lastsequenz?geraet=${geraetNummer}&min_val=${min_val}&max_val=${max_val}&label=${name}`
      )
      .catch(function (error) {
        console.log(error);
      })
      .then((response) => {
        console.log(response);
        toast("Lastsequenz gespeichert!");
        resetZoom();
      });
  }

  const handleSelectChange = (event) => {
    console.log(event.target.value);
    setDeviceSelect(event.target.value);
    makeDeviceRequest(event.target.value);
  };

  function makeDeviceRequest(geraetNummer) {
    if (geraetNummer !== "-1") {
      axios.get(`/api/get_graph_daten/${geraetNummer}`).then((response) => {
        console.log(response);
        var messungen = response.data.messungen;
        messungen = messungen.sort((a, b) => a[1] - b[1]);
        var labelz = messungen.map((m) => m[1]);
        var labelz = labelz.map((m) => formatTimestamp(m));
        var valz = messungen.map((m) => m[0]);
        console.log(labelz);
        console.log(valz);
        setDeviceData([labelz, valz]);
        numberOfDevice = geraetNummer;
      });
    }
  }

  const data = {
    labels: deviceData[0],
    datasets: [
      {
        label: "Edison № " + numberOfDevice,
        data: deviceData[1],
        borderColor: "rgba(100, 27, 150, 0.75)",
        backgroundColor: "rgba(255, 255, 255, 1)",
      },
    ],
  };

  return (
    <div className={"my-3"}>
      <ToastContainer autoClose={500} hideProgressBar={true} />
      <Box sx={{ minWidth: 200 }}>
        <FormControl sx={{ m: 1, minWidth: 300 }} size="medium">
          <InputLabel id="demo-simple-select-label">
            Gerät für Lastsequenz wählen
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label="Lastsequenz auswählen"
            value={deviceSelect}
            input={<OutlinedInput label="Gerät für Lastsequenz wählen" />}
            renderValue={(/*deviseSelect*/) => deviceSelect}
            MenuProps={MenuProps}
            onChange={handleSelectChange}
          >
            {selectOptions}
            {/* {/* {selectOptions.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.text}
                    </option>
                ))} */}
          </Select>
        </FormControl>
      </Box>

      {deviceSelect > 0 && (
        <>
          <Form>
            <Form.Group className="m-2" controlId="formBasicEmail">
              <Form.Label>Lastsequenzname</Form.Label>
              <Form.Control
                value={newLastSeqName}
                onChange={(e) => {
                  setNewLastSeqName(e.target.value);
                }}
                placeholder="Name für die neue Lastsequenz"
              />
            </Form.Group>
            <Button variant="primary" onClick={resetZoom} className={"m-2"}>
              Zurücksetzen
            </Button>
            <Button variant="primary" onClick={submitZoom} className={"m-2"}>
              Lastsequenz speichern
            </Button>
          </Form>
          <div className={"graph-container sequenzContainer"}>
            <Line ref={chartRef} options={options} data={data} />
          </div>
        </>
      )}
    </div>
  );
}
