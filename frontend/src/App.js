import React, { useState } from "react";
import "./App.css";
import GroupContainer from "./GroupContainer";
import { LastSeq } from "./LastSeq";
import LastSeqList from "./LastSeqList";
import NewSelect from "./NewSelect";
import StatisticsTable from "./StatisticsTable";
import Accordion from "react-bootstrap/Accordion";

function App() {
  document.title = "Greensoftweb";
  const [geraeteList, setGeraetList] = useState([]);
  const [timeFrameGraph, setTimeFrameGraph] = React.useState("twoMinutes");
  return (
    <div data-bs-theme={"dark"}>
      <header className={"App-header fst-italic fs-1 fw-bold bg-white"}>
        Greensoft
      </header>
      <div className={"main-container"}>
        <div id="newSelectContainer">
          <h2>Vergleich und Analyse durchführen</h2>
          <NewSelect
            geraeteList={geraeteList}
            setGeraetList={setGeraetList}
            timeFrameGraph={timeFrameGraph}
            setTimeFrameGraph={setTimeFrameGraph}
          />
        </div>

        {geraeteList.length > 0 ? (
          <div>
            <StatisticsTable geraeteliste={geraeteList} />
          </div>
        ) : (
          <></>
        )}
        <hr />
        <div>
          <h2>Lastsequenz auswählen und speichern</h2>
          <LastSeq />
        </div>

        <Accordion className="my-3">
          <Accordion.Item eventKey="0">
            <Accordion.Header>Gespeicherte Lastsequenzen</Accordion.Header>
            <Accordion.Body>
              <LastSeqList />
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        <hr />
        <div>
          <h2>Gruppen</h2>
          <GroupContainer />
        </div>
      </div>
    </div>
  );
}

export default App;
