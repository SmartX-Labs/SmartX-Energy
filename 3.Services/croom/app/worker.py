import os
import time

from flask import Flask
from celery import Celery

from db import RedisWorker

# Flask configuration
app = Flask(__name__)

# Celery configuration
app.config['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'
app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'
celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)

# Worker configuration
worker = RedisWorker()

@app.route('/')
def root():
    return 'Started a background'

@celery.task
def background_task(measurement, tag_key):
    worker.run(measurement, tag_key)

@celery.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(1.0, background_task.s("temp", "id"), name='periodic task for temp')
    sender.add_periodic_task(1.0, background_task.s("resource", "deviceId"), name='periodic task for resource')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
