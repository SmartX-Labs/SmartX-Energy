import os
from datetime import datetime, timedelta
from influxdb import InfluxDBClient

from itertools import groupby
import json
import pickle
import redis

os.environ['INFLUX_HOST'] = '210.125.84.55'
os.environ['INFLUX_PORT'] = '8086'
os.environ['INFLUX_USERNAME'] = 'root'
os.environ['INFLUX_PW'] = 'root'
os.environ['INFLUX_DATABASE'] = 'senics'

class Influx():

    def __init__(self):
        self.client = InfluxDBClient(
            os.environ['INFLUX_HOST'],
            os.environ['INFLUX_PORT'],
            os.environ['INFLUX_USERNAME'],
            os.environ['INFLUX_PW'],
            os.environ['INFLUX_DATABASE']
        )

    def query(self, query):
        return self.client.query(str(query))

    def query_tag(self, measurement, tag_key):
        tags = []
        tag_query = self.client.query("SHOW TAG VALUES FROM " + measurement + " WITH KEY = " + tag_key)

        if tag_query != None:
            tag_list = list(tag_query)[0]
        else:
            return 'No measurement or tag'

        for item in tag_list:
            tags.append(item['value'])
        return tags

    def query_measurement(self, measurement, limit=None):
        query = "SELECT * FROM " + measurement + " ORDER BY time DESC"
        limit_option = '';
        if limit != None:
            limit_option = " LIMIT " + str(limit);
        return self.client.query(query + limit_option)

    def query_measurement_distinct_tag(self, measurement, tag_key, limit=1):
        query = "SELECT * FROM " + measurement + " WHERE "+ tag_key + "="
        option = " ORDER BY time DESC LIMIT "
        tag_list = self.query_tag(measurement, tag_key);
        measurement_list = []

        for item in tag_list:
            measurement = self.client.query(query + "\'" + item + "\'" + option + str(limit))
            measurement_list += list(measurement)[0]
        return measurement_list

    def query_by_time(self, measurement, minutes=30):
        query = ""

        if measurement == 'temp':
            query = "SELECT temperature, humidity, id FROM temp where time > "
        elif measurement == 'resource':
            query = "SELECT cpu, memory, disk, deviceId FROM resource where time > "
        else:
            return None

        time = datetime.utcnow() - timedelta(minutes=minutes)
        # time = str(time.strftime('%Y-%m-%dT%H:%M:%SZ'))

        result_set = self.client.query(query + "\'" + str(time) + "\'")
        result_list = list(result_set)

        if len(result_list) > 0:
            result_list = result_list[0]

        return result_list

class RedisWorker():

    def __init__(self):
        self.influx = Influx()
        self.worker = redis.StrictRedis(host='localhost', port='6379', db=1)

    def groupby_data(self, origin_list, group_key):
        sorted_list = sorted(origin_list, key = lambda k: k[group_key])
        groupby_list = groupby(sorted_list, key = lambda k: k[group_key])

        groups = []
        keys = []
        for key, group in groupby_list:
            groups.append(list(group))
            keys.append(key)

        return {'keys': keys, 'groups': groups}

    def mean_dump_data(self, dump_data, field_key):
        numerator = float(sum(v[field_key] for v in dump_data))
        denominator = max(len(dump_data), 1)
        return numerator/denominator

    def set_keyby_data(self, measurement, tag_key, minutes=1):
        result_list = self.influx.query_by_time(measurement, minutes)
        print(len(result_list))

        if len(result_list) > 0:
            data = self.groupby_data(result_list, tag_key)

            key_dump = pickle.dumps(data['keys'])
            self.worker.set(measurement+"-key", key_dump)

            for index, key in enumerate(data['keys']):
                keyby_data_dump = pickle.dumps(data['groups'][int(index)])
                self.worker.set(measurement+key, keyby_data_dump)
            return data

    def set_dump_data(self, measurement, minutes=1):
        result_list = self.influx.query_by_time(measurement, minutes)
        print(len(result_list))

        if len(result_list) > 0:
            data_dump = pickle.dumps(result_list)
            self.worker.set(measurement+"-dump", data_dump)
            return data_dump

    def get_keys(self, measurement):
        keys = self.worker.get(measurement+"-key")
        return pickle.loads(keys)

    def get_keyby_data(self, measurement, tag_key=None):
        keys = self.get_keys(measurement)

        if tag_key in keys:
            keyby_data = pickle.loads(self.worker.get(measurement+tag_key))
        else:
            keyby_data = []
            for key in keys:
                origin_data = pickle.loads(self.worker.get(measurement+key))
                keyby_data.append(origin_data)

        return keyby_data

    def get_keyby_data_last(self, measurement, tag_key=None):
        keys = self.get_keys(measurement)

        if tag_key in keys:
            keyby_data_last = pickle.loads(self.worker.get(measurement+tag_key))[-1]
        else:
            keyby_data_last = []
            for key in keys:
                origin_data = pickle.loads(self.worker.get(measurement+key))
                keyby_data_last.append(origin_data[-1])

        return keyby_data_last

    def get_dump_data(self, measurement):
        dump_data = pickle.loads(self.worker.get(measurement+"-dump"))
        return dump_data

    def run(self, measurement, tag_key):
        self.set_dump_data(measurement)
        self.set_keyby_data(measurement, tag_key)
        print("save: " + measurement)

    def set_air_temp(self, air_id, temp):
        dump = pickle.dumps(temp)
        self.worker.set("air-" + air_id, dump)

    def get_air_temp(self, air_id):
        dump = self.worker.get("air-" + air_id)
        if dump == None:
            return None
        else:
            return pickle.loads(dump)
