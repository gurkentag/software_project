"""This module is the main backend module."""
import peewee
from apscheduler.schedulers.background import BackgroundScheduler
from flask import Flask, request
from datenbank import *

app = Flask(__name__)


@app.before_request
def _db_connect():
    if db.is_closed():
        db.connect()


@app.teardown_request
def _db_close(exc):
    if not db.is_closed():
        db.close()


@app.route("/api/getmqtt_messung/<deviceid>")
def getmqtt_messung(deviceid):
    return {"messung": get_neuste_messung(deviceid)}


@app.route("/api/get_maximum/<deviceid>")
def get_maximum(deviceid):
    return {"maxverbrauch": get_hour_max(deviceid)}


@app.route("/api/get_average/<deviceid>")
def get_average(deviceid):
    return {"durchschnitsverbrauch": get_hour_average(deviceid)}


@app.route("/api/get_graph_daten/<deviceid>")
def get_graph_daten(deviceid):
    zeitfenster = request.args.get("timeframe")
    print(zeitfenster)
    if not zeitfenster:
        return {"messungen": get_last_n_messungen(120, deviceid)}
    else:
        if zeitfenster == "monthly":
            print("detected monthly")
            return {"messungen": get_last_n_messungen_stuendlich(672, deviceid)}
        elif zeitfenster == "weekly":
            print("detected weekly")
            return {"messungen": get_last_n_messungen_stuendlich(168, deviceid)}


@app.route("/api/gruppe_hinzufuegen/<name>")
def api_gruppe_hinzufuegen(name):
    try:
        gruppe_hinzufuegen(name)
        return {"status": "ok"}
    except peewee.IntegrityError:
        return {"status": "error"}


@app.route("/api/get_gruppe/<gruppe>")
def get_gruppe_endpoint(gruppe):
    return {"gruppe": get_gruppe(gruppe)}


@app.route("/api/delete_gruppenzugehoerigkeit")
def delete_gruppenzugehoerigkeit():
    gruppen_id = request.args.get("gruppenid")
    device_id = request.args.get("deviceid")
    try:
        gruppenzugehoerigkeit_loeschen(gruppen_id, device_id)
        return {"status": "OK"}
    except:
        return {"status": "ERROR"}


@app.route("/api/delete_gruppe/<gruppenid>")
def delete_gruppe(gruppenid):
    try:
        gruppe_loeschen(gruppenid)
    except:
        pass

    return {"status": "OK"}


@app.route("/api/add_gruppenzugehoerigkeit")
def add_gruppenzugehoerigkeit():
    gruppen_id = request.args.get("gruppenid")
    device_id = request.args.get("deviceid")
    try:
        gruppen_zugehoerigkeit_definieren(gruppen_id, device_id)
        return {"status": "OK"}
    except:
        return {"status": "ERROR"}


@app.route("/api/alle_gruppen")
def alle_gruppen():
    return get_all_groups()


@app.route("/api/submit_lastsequenz")
def submit_lastsequenz():
    geraet = request.args.get("geraet")
    max_val = request.args.get("max_val")
    min_val = request.args.get("min_val")
    label = request.args.get("label")

    set_lastsequenz(label, min_val, max_val, geraet)
    return {"status": "OK"}


@app.route("/api/delete_sequenz/<sequenzid>")
def delete_sequenz_api(sequenzid):
    delete_sequenz(sequenzid)
    return {'status': 'OK'}


@app.route("/api/get_sequenzen")
def get_all_sequenzen():
    return get_sequenzen()


@app.route("/api/get_sequenz_values")
def api_get_sequenz_values():
    id = request.args.get("id")
    return get_sequenz_values(id)


@app.route("/api/alle_statistiken/<deviceid>")
def alle_statistiken(deviceid):
    return {
        "deviceid": deviceid,
        "messung": get_neuste_messung(deviceid),
        "maxverbrauch": get_hour_max(deviceid),
        "durchschnitsverbrauch": get_hour_average(deviceid)
    }


@app.route("/api/multiple_statistics/<deviceidstring>")
def multiple_statistiken(deviceidstring):
    zeitfenster = request.args.get("timeframe")
    print(zeitfenster)
    if not zeitfenster:
        response_items = []
        for deviceid in deviceidstring.split("+"):
            response_items.append({
                "deviceid": deviceid,
                "messung": get_neuste_messung(deviceid),
                "maxverbrauch": get_hour_max(deviceid),
                "durchschnitsverbrauch": get_hour_average(deviceid)
            })
        return response_items
    else:
        if zeitfenster == "monthly":
            print("detected monthly")
            response_items = []
            for deviceid in deviceidstring.split("+"):
                response_items.append({
                    "deviceid": deviceid,
                    "messung": get_neuste_messung(deviceid),
                    "maxverbrauch": get_monthly_max(deviceid),
                    "durchschnitsverbrauch": get_monthly_average(deviceid)
                })
            return response_items
        elif zeitfenster == "weekly":
            print("detected weekly")
            response_items = []
            for deviceid in deviceidstring.split("+"):
                response_items.append({
                    "deviceid": deviceid,
                    "messung": get_neuste_messung(deviceid),
                    "maxverbrauch": get_monthly_max(deviceid),
                    "durchschnitsverbrauch": get_monthly_average(deviceid)
                })
            return response_items


def healthcheck_schedule():
    print("Healthcheck successful", flush=True)

db.connect()
db.create_tables([Messung, Durchschnitt, Gruppen,
                 Gruppen_zugehoerigkeit, Lastsequenz, Lastsequenz_werte, StuendlicheMessung, MaxTotal])
scheduler = BackgroundScheduler()
scheduler.add_job(func=fill_consumption_table, trigger='interval', minutes=5)
scheduler.add_job(func=fill_maxTotal, trigger='interval', minutes=5)
scheduler.add_job(func=healthcheck_schedule, trigger='interval', minutes=5)
scheduler.add_job(func=automatische_lastsequenz_speichern,
                  trigger='interval', minutes=60)
scheduler.start()

if __name__ == "__main__":
    app.run()
