import { useEffect, useState } from "react";
import axios from "axios";
import GroupInspector from "./GroupInspector";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Accordion from 'react-bootstrap/Accordion';
import { toast, ToastContainer } from "react-toastify";

const makeRequest = (callback) => {
  axios.get(`/api/alle_gruppen`).then((response) => {
    callback(response);
  });
};

function gruppeErstellen(gruppenName, callback) {
  axios.get(`/api/gruppe_hinzufuegen/${gruppenName}`).then((response) => {
    console.log(response);
    console.log("created group");
    callback();
    toast("Gruppe gespeichert!");
  });
}

export default function GroupContainer() {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  useEffect(() => {
    makeRequest((response) => {
      setGroups(response.data);
    });
    return () => {};
  }, []);
  function reset_container() {
    makeRequest((response) => {
      setGroups(response.data);
    });
  }
  return (
    <>
      <Form>
      <ToastContainer autoClose={500} hideProgressBar={true} />
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Gruppenname</Form.Label>
          <Form.Control
            value={newGroupName}
            onChange={(e) => {
              setNewGroupName(e.target.value);
            }}
            placeholder="Name für die neue Gruppe"
          />
        </Form.Group>
        <Button
          variant="primary"
          onClick={() => {
            if (newGroupName) {
              gruppeErstellen(newGroupName, () => {
                reset_container();
              });
            } else {toast("⚠️ Bitte einen Namen eingeben");}
          }}
        >
          Gruppe hinzufügen
        </Button>
      </Form>
      <Accordion className="my-3">
      <Accordion.Item eventKey="1">
              <Accordion.Header>Gespeicherte Gruppen</Accordion.Header>
              <Accordion.Body>

      {groups.map((group) => {
        return (
          <GroupInspector
            key={group.id}
            groupID={group.id}
            groupName={group.name}
            resetter={reset_container}
            
          />
        );
      })}
       </Accordion.Body>
            </Accordion.Item>
          </Accordion>
    </>
  );
}
