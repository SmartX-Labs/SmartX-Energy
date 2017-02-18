# from app import app
#
# from celery import current_app
# from celery.bin import worker
#
# current = current_app._get_current_object()
#
# worker = worker.worker(app=current)
#
# options = {
#     'broker': app.config['CELERY_BROKER_URL'],
#     'loglevel': 'INFO',
#     'traceback': True,
#     'beat': True
# }
#
# worker.run(**options)
