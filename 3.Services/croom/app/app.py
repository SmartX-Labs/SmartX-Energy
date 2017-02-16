import os
import json
from flask import Flask, request, render_template, session, flash, redirect, \
    url_for, jsonify

from flask_socketio import SocketIO, emit, disconnect
from celery import Celery
from db import RedisWorker

# Flask configuration
app = Flask(__name__)

# SocketIO configuration
async_mode = None
socketio = SocketIO(app, async_mode=async_mode)
thread = None

# Celery configuration
app.config['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'
app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'
celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)

# Worker configuration
worker = RedisWorker()

@celery.task
def send_async_request(air_id, temp, action):
    print("implement")

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method =='GET':
        temp = worker.get_keyby_data_last("temp")
        resource = worker.get_keyby_data_last("resource")
        air_temp_1 = worker.get_air_temp("1")
        air_temp_2 = worker.get_air_temp("2")
        return render_template('index.html', async_mode=socketio.async_mode,
                                temp=temp, resource=resource,
                                air_temp_1=air_temp_1, air_temp_2=air_temp_2)

@app.route('/control', methods=['POST'])
def control():
    air_id = request.form['id']
    action = request.form['action']

    send_async_request.delay(air_id, temp, action)

    temp = worker.get_air_temp(air_id)
    if temp == None:
        temp = 20
    else:
        temp += int(action)

    worker.set_air_temp(air_id, temp)

    return jsonify({}), 200, {'temperature': temp}

def background_thread():
    while True:

        temp = worker.get_keyby_data_last("temp")
        temp = json.dumps(temp)
        resource = worker.get_keyby_data_last("resource")
        resource = json.dumps(resource)

        temp_dump = worker.get_dump_data("temp")
        temp_resource = worker.get_dump_data("resource")

        temp_mean = worker.mean_dump_data(temp_dump, "temperature")
        hum_mean = worker.mean_dump_data(temp_dump, "humidity")
        resource_cpu_mean = worker.mean_dump_data(temp_resource, "cpu")
        resource_mem_mean = worker.mean_dump_data(temp_resource, "memory")
        resource_disk_mean = worker.mean_dump_data(temp_resource, "disk")

        socketio.emit('background_thread', {
                        'temp': temp,
                        'resource': resource,
                        'temp_mean': temp_mean,
                        'hum_mean': hum_mean,
                        'resource_cpu_mean': resource_cpu_mean,
                        'resource_mem_mean': resource_mem_mean,
                        'resource_disk_mean': resource_disk_mean
                        },)
        socketio.sleep(2)


@socketio.on('connect')
def connect():
    global thread
    if thread is None:
        thread = socketio.start_background_task(target=background_thread)
    emit('my_response', {'data': 'Connected', 'count': 0})

@socketio.on('disconnect')
def disconnect():
    print('Client disconnected', request.sid)

if __name__ == '__main__':
    app.run(debug=True)
    socketio.run(app)
