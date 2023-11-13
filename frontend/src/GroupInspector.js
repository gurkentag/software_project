import axios from "axios";
import { useEffect, useState } from "react";
import { chartcolors, formatTimestamp, options } from "./Chart";
import Badge from "react-bootstrap/Badge";

import { Line } from "react-chartjs-2";
import Dropdown from "react-bootstrap/Dropdown";

function addDeviceToGroup(groupid, deviceid, callback) {
  axios
    .get(
      `/api/add_gruppenzugehoerigkeit?gruppenid=${groupid}&deviceid=${deviceid}`
    )
    .then((response) => {
      console.log(response);
      console.log("added device to group");
      callback();
    });
}

function removeDeviceFromGroup(groupid, deviceid, callback) {
  axios
    .get(
      `/api/delete_gruppenzugehoerigkeit?gruppenid=${groupid}&deviceid=${deviceid}`
    )
    .then((response) => {
      console.log(response);
      console.log("added device to group");
      callback();
    });
}

function deleteGruppe(groupid, callback) {
  axios.get(`/api/delete_gruppe/${groupid}`).then((response) => {
    console.log(response);
    console.log("deletedGruppe");
    callback();
  });
}

function requestDevicesInGroup(groupID, callback) {
  axios.get(`/api/get_gruppe/${groupID}`).then((response) => {
    callback(response);
  });
}

function getData(geraetNummer) {
  if (geraetNummer !== "-1") {
    return axios
      .get(`/api/get_graph_daten/${geraetNummer}`)
      .then((response) => {
        console.log(response);
        return { id: geraetNummer, data: response.data.messungen };
      });
  }
}

// eslint-disable-next-line
function PlotComparison({ geraetArray: geraetArray }) {
  console.log(geraetArray);
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

  return <Line options={options} data={data} />;
}

export default function GroupInspector({ groupName, groupID, resetter }) {
  const [toggleView, setToggleView] = useState(false);
  const [devicesInGroup, setDevicesInGroup] = useState([]);
  const [geraeteList, setGeraetList] = useState([]);

  function getValues(devicesInGroup) {
    const respPromises = devicesInGroup.map((item) => getData(item));
    console.log(respPromises);
    Promise.all(respPromises).then((values) => {
      setGeraetList(values);
      console.log(values);
    });
  }

  function showGraph() {
    if (geraeteList.length > 0) {
      setToggleView(!toggleView);
      console.log("toggle");
    } else {
      getValues(devicesInGroup);
      setToggleView(!toggleView);
    }
  }
  useEffect(() => {
    requestDevicesInGroup(groupID, (response) => {
      setDevicesInGroup(response.data.gruppe);
      console.log(response.data);
      getValues(response.data.gruppe);
    });
    return () => {};
  }, []);
  function resetGroup() {
    setToggleView(false);
    setGeraetList([]);
    requestDevicesInGroup(groupID, (response) => {
      setDevicesInGroup(response.data.gruppe);
      console.log(response.data);
      getValues(response.data.gruppe);
    });
  }
  return (
    <>
      <div className={"sequenzContainer"}>
        <h3>
          Gruppe {groupName}, {groupID}
          <button
            className="btn btn-danger m-2 float-end"
            onClick={() =>
              deleteGruppe(groupID, (r) => {
                console.log(r);
                resetter();
              })
            }
          >
            🗑️
          </button>
        </h3>

        <h5>Geräte in Gruppe:</h5>
        {devicesInGroup.map((device) => {
          return (
            <Badge className="devicebadge" bg="primary" key={device}>
              Edison № {device}
              <button
                className="delete-button btn btn-danger"
                onClick={() =>
                  removeDeviceFromGroup(groupID, device, resetGroup)
                }
              >
                🗑️
                <span
                  className="glyphicon glyphicon-trash"
                  aria-hidden="true"
                ></span>
              </button>
            </Badge>
          );
        })}
        <Dropdown className={"m-2"}>
          <Dropdown.Toggle variant="primary" id="dropdown-basic">
            Gerät hinzufügen
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {Array.from({ length: 56 }, (v, k) => k + 1).map((deviceid) => {
              return (
                <Dropdown.Item
                  key={deviceid}
                  onClick={() =>
                    addDeviceToGroup(groupID, deviceid, resetGroup)
                  }
                >
                  {deviceid}
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        </Dropdown>
        <button className="btn btn-primary m-2" onClick={showGraph}>
          Graph anzeigen
        </button>
        {toggleView ? <PlotComparison geraetArray={geraeteList} /> : <></>}
      </div>
    </>
  );
}
