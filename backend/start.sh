#!/bin/sh
python MQTT_client.py &
gunicorn -b 0.0.0.0:8000 app:app --log-level debug