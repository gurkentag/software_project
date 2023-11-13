import json
import os

CONFIG_PATH = './config.json'


def read_config():
    values_to_collect = [
        'MQTT_CLIENT_ID',
        'MQTT_USERNAME',
        'MQTT_PASSWORD',
        'MQTT_BROKER',
        'MQTT_PORT',
        'DB_DATABASE',
        'DB_HOST',
        'DB_USER',
        'DB_PASSWORD'
    ]
    if os.path.isfile(CONFIG_PATH):
        with open(CONFIG_PATH, 'r') as f:
            return json.load(f)
    else:
        retdict = {}
        print("config file not found, reading from env...")
        for val in values_to_collect:
            retdict[val] = os.environ.get(val)
            if type(retdict[val]) == type(None):
                print('{} not found in env'.format(val))
                retdict[val] = "dummy"
        with open(CONFIG_PATH, 'w') as f:
            json.dump(retdict, f)
        return retdict


if __name__ == '__main__':
    print(read_config())
