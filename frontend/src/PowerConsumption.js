import axios from 'axios';

export default function getPowerConsumptionValue(geraetNummer) {
    if (geraetNummer !== '-1') {
        return axios.get(`/api/getmqtt_messung/${geraetNummer}`).then(response => {
            console.log("PowerConsumptionObject", response)
            return {id: geraetNummer, data: response.data.messung};
        })
    }
}

export function getAvrgPowerConsumptionValue(geraetNummer) {
    if (geraetNummer !== '-1') {
        return axios.get(`/api/get_average/${geraetNummer}`).then(response => {
            console.log("AvrgPowerConsumptionObject", response)
            return {id: geraetNummer, data: response.data.durchschnitsverbrauch};
        })
    }
}

export function getMaxPowerConsumptionValue(geraetNummer) {
    if (geraetNummer !== '-1') {
        return axios.get(`/api/get_maximum/${geraetNummer}`).then(response => {
            console.log("MaxPowerConsumptionObject", response)
            return {id: geraetNummer, data: response.data.maxverbrauch};
        })
    }
}

export function getGruppe(gruppe) {
    return axios.get(`/api/get_gruppe/${gruppe}`).then(response => {
        console.log("Gruppe", response)
        return {data: response.data.gruppe};
    })
}

export function getAlleGruppen() {
    return axios.get("/api/alle_gruppen").then(response => {
        console.log("Gruppen", response)
        return {data: response.data};
    })
}