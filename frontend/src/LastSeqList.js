import { useEffect, useState } from "react";
import axios from "axios";
import Sequenz from "./Sequenz";
import Form from "react-bootstrap/Form";

const makeRequest = (callback) => {
  axios.get(`/api/get_sequenzen`).then((response) => {
    callback(response);
  });
};

export default function LastSeqList() {
  const [sequenzen, setSequenzen] = useState([]);
  const [automatischeAnzeige, setAutomatischeAnzeige] = useState(false);
  useEffect(() => {
    makeRequest((response) => {
      setSequenzen(response.data);
    });
    return () => {};
  }, []);

  function resetSequenzen() {
    makeRequest((response) => {
      setSequenzen(response.data);
    });
  }

  return (
    <>
      <button onClick={resetSequenzen} className={"btn btn-secondary"}>
        ↻ Aktualisieren
      </button>
      <Form.Check
        className={"my-2"}
        onChange={() => setAutomatischeAnzeige(!automatischeAnzeige)}
        checked={automatischeAnzeige}
        type={"checkbox"}
        id={`default-${"checkbox"}`}
        label={`Zeige automatisch erstellte Lastsequenzen`}
      />
      {sequenzen.map((sequenz) => {
        return (
          <Sequenz
            key={sequenz.id}
            label={sequenz.label}
            id={sequenz.id}
            device={sequenz.device}
            resetter={resetSequenzen}
            showAll={automatischeAnzeige}
          />
        );
      })}
    </>
  );
}
