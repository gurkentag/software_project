import * as React from "react";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import axios from "axios";
import { plotComparison } from "./Chart";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function SelectBox(tabledata) {
  const geraeteList = tabledata.geraeteList;
  console.log("geraeteList:", geraeteList);
  const setGeraetList = tabledata.setGeraetList;
  const timeFrameGraph = tabledata.timeFrameGraph;
  const setTimeFrameGraph = tabledata.setTimeFrameGraph;
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [timeFrame, setTimeFrame] = React.useState("hourly");
  const [stateArgString, setStateArgString] = React.useState("");

  const makeRequest = (argString, timeFrameTemp = "hourly") => {
    var timeFrameString = "";
    if (timeFrameTemp === "monthly") {
      timeFrameString = "?timeframe=monthly";
    } else if (timeFrameTemp === "weekly") {
      timeFrameString = "?timeframe=weekly";
    }
    console.log(
      "requesting:",
      `/api/multiple_statistics/${argString}${timeFrameString}`
    );
    axios
      .get(`/api/multiple_statistics/${argString}${timeFrameString}`)
      .then((response) => {
        console.log("response:", response.data);
        setGeraetList(
          response.data.map((e) => {
            return {
              id: e.deviceid,
              messung: e.messung,
              maxverbrauch: e.maxverbrauch,
              durchschnitt: e.durchschnitsverbrauch,
            };
          })
        );
      });
  };

  const makeGraphRequest = (timeFrame) => {
    const respPromises = selectedIds.map((item) => getData(item, timeFrame));
    console.log(respPromises);
    Promise.all(respPromises).then((values) => {
      plotComparison(values);
      console.log(values);
    });
  };

  function getData(geraetNummer, timeFrameGraphTemp = "twoMinutes") {
    if (geraetNummer !== "-1") {
      var timeFrameStringGraph = "";
      if (timeFrameGraphTemp === "monthly") {
        timeFrameStringGraph = "?timeframe=monthly";
      } else if (timeFrameGraphTemp === "weekly") {
        timeFrameStringGraph = "?timeframe=weekly";
      }
      return axios
        .get(`/api/get_graph_daten/${geraetNummer}${timeFrameStringGraph}`)
        .then((response) => {
          console.log(response);
          return { id: geraetNummer, data: response.data.messungen };
        });
    }
  }

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    console.log(value);
    setSelectedIds(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(" , ") : value
    );
    const currentValue = typeof value === "string" ? value.split(",") : value;
    const respPromises = currentValue.map((item) => getData(item));
    console.log(respPromises);
    Promise.all(respPromises).then((values) => {
      plotComparison(values);
      console.log(values);
    });

    //setGeraetList([]); auskommentiert weil die tabelle dann smoother aktualisiert wird
    console.log("Geräte aus CurrentValue:", currentValue);
    var argString = currentValue.join("+");
    setStateArgString(argString);
    makeRequest(argString);
  };

  const options = [];
  for (var i = 1; i <= 56; i++) {
    if (i !== 50 && i !== 30) {
      options.push({ value: i, text: `Edison № ${i}` });
    }
  }

  return (
    <div className={"my-4"}>
      <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel id="demo-multiple-checkbox-label">
          Geräte zum Vergleich wählen
        </InputLabel>
        <Select
          labelId="demo-multiple-checkbox-label"
          id="demo-multiple-checkbox"
          multiple
          value={selectedIds}
          onChange={handleChange}
          input={<OutlinedInput label="Geräte zum Vergleich wählen" />}
          renderValue={(selected) => selected.join(" , ")}
          MenuProps={MenuProps}
        >
          {options.map((option) => (
            <MenuItem key={option.text} value={option.value}>
              <Checkbox checked={selectedIds.indexOf(option.value) > -1} />
              <ListItemText primary={option.text} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <br />
      {selectedIds.length > 0 ? (
        <ButtonGroup aria-label="Basic example" className={"my-3"}>
          <Button
            variant={timeFrameGraph === "twoMinutes" ? "primary" : "secondary"}
            onClick={() => {
              setTimeFrameGraph("twoMinutes");
              makeGraphRequest("twoMinutes");
            }}
          >
            zwei Minuten
          </Button>
          <Button
            variant={timeFrameGraph === "weekly" ? "primary" : "secondary"}
            onClick={() => {
              setTimeFrameGraph("weekly");
              makeGraphRequest("weekly");
            }}
          >
            Wöchentlich
          </Button>
          <Button
            variant={timeFrameGraph === "monthly" ? "primary" : "secondary"}
            onClick={() => {
              setTimeFrameGraph("monthly");
              makeGraphRequest("monthly");
            }}
          >
            Monatlich
          </Button>
        </ButtonGroup>
      ) : (
        <></>
      )}
      <div
        className={
          selectedIds.length > 0
            ? "graph-container sequenzContainer mt-0 "
            : "graph-container"
        }
      >
        <div id="graphvergleich"></div>
      </div>
      {selectedIds.length > 0 ? (
        <ButtonGroup aria-label="Basic example" className={"mt-3"}>
          <Button
            variant={timeFrame === "hourly" ? "primary" : "secondary"}
            onClick={() => {
              setTimeFrame("hourly");
              if (stateArgString) {
                makeRequest(stateArgString, "hourly");
              }
            }}
          >
            Stündlich
          </Button>
          <Button
            variant={timeFrame === "weekly" ? "primary" : "secondary"}
            onClick={() => {
              setTimeFrame("weekly");
              if (stateArgString) {
                makeRequest(stateArgString, "weekly");
              }
            }}
          >
            Wöchentlich
          </Button>
          <Button
            variant={timeFrame === "monthly" ? "primary" : "secondary"}
            onClick={() => {
              setTimeFrame("monthly");
              if (stateArgString) {
                makeRequest(stateArgString, "monthly");
              }
            }}
          >
            Monatlich
          </Button>
        </ButtonGroup>
      ) : (
        <></>
      )}
    </div>
  );
}
