from paho.mqtt import client
from datenbank import messung_speichern
import json
import time
from read_config import read_config


def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("wir sind erfolgreich verbunden.")


def ping_online():
    with open("healthcheck", "w") as f:
        f.write(str(int(time.time()))+"\n")


class Submitter:
    def __init__(self, device_id):
        self.device_id = device_id

    def submit(self, client, userdata, message):
        ping_online()
        value = str(json.loads(message.payload.decode())["val"])
        # print("Ich habe " + value + " erhalten und ich bin "  + message.topic.split("/")[1])
        messung_speichern(message.topic.split("/")[1], value)


config = read_config()
broker = config['MQTT_BROKER']
port = int(config['MQTT_PORT'])

client_id = config['MQTT_CLIENT_ID']
username = config['MQTT_USERNAME']
password = config['MQTT_PASSWORD']
topics = []
for x in range(1, 60, 1):
    if x < 10:
        topic = "edison/0" + str(x) + "/active_power_calculated"
    else:
        topic = "edison/" + str(x) + "/active_power_calculated"
    topics.append((topic, 0))
submit = Submitter(str(x))
mqttclient = client.Client(client_id)
mqttclient.username_pw_set(username, password)
mqttclient.on_connect = on_connect
mqttclient.connect(broker, port)

mqttclient.subscribe(topics)
mqttclient.on_message = submit.submit
mqttclient.loop_forever()
