import os
import json
from flask import Flask, request, render_template, session, flash, redirect, \
    url_for, jsonify

from celery import Celery
from db import Influx
# from flask_redis import FlaskRedis
# from core import redis_store
import redis

# Flask configuration
app = Flask(__name__)
#app.config['SECRET_KEY'] = ''

# Celery configuration
app.config['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'
app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'
celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)

# InfluxDB configuration
influx = Influx()

# Redis
r = redis.StrictRedis(host='localhost', port='6379', db=0)

@app.route('/')
def index():
    # temp = influx.query_measurement_distinct_tag("temp", "id")
    # temp = json.dumps(temp)
    resource = influx.query_measurement_distinct_tag("resource", "deviceId")
    resource = json.dumps(resource)
    #
    # temp_mean = influx.get_mean("temp", "id", "temperature")
    # resource_cpu_mean = influx.get_mean("resource", "deviceId", "cpu")
    # resource_mem_mean = influx.get_mean("resource", "deviceId", "memory")
    # resource_disk_mean = influx.get_mean("resource", "deviceId", "disk")

    # r.set('temp', temp)
    r.set('resource', resource)
    # r.set('temp_mean', temp_mean)
    # r.set('resource_cpu_mean', resource_cpu_mean)
    # r.set('resource_mem_mean', resource_mem_mean)
    # r.set('resource_disk_mean', resource_disk_mean)

    return r.get('resource')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
