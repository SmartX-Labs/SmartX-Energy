import os
from flask import Flask, request, render_template, session, flash, redirect, \
    url_for, jsonify

from celery import Celery

app = Flask(__name__)
#app.config['SECRET_KEY'] = ''

# Celery configuration
app.config['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'
app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'

# Initialize Celery
celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)

@app.route("/")
def hello():
    return "hello"

if __name__ == '__main__':
    app.run(debug=True)
