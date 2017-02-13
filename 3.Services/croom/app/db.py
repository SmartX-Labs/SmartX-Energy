import os
from influxdb import InfluxDBClient

os.environ['HOST'] = '210.125.84.55'
os.environ['PORT'] = '8086'
os.environ['USERNAME'] = 'root'
os.environ['PW'] = 'root'
os.environ['DATABASE'] = 'senics'

class Influx():

    def __init__(self):
        self.client = InfluxDBClient(
            os.environ['HOST'],
            os.environ['PORT'],
            os.environ['USERNAME'],
            os.environ['PW'],
            os.environ['DATABASE']
        )

    def query(self, query):
        return self.client.query(str(query))

    def query_tag(self, measurement, tag_key):
        tags = []
        tag_query = self.client.query("SHOW TAG VALUES FROM " + measurement + " WITH KEY = " + tag_key)
        tag_list = list(tag_query)[0]

        for item in tag_list:
            tags.append(item['value'])
        return tags

    def query_measurement(self, measurement, limit=None):
        query = "SELECT * FROM " + measurement + " ORDER BY time DESC"
        limit_option = '';
        if (limit != None):
            limit_option = " LIMIT " + str(limit);
        return self.client.query(query + limit_option)

    def query_measurement_distinct_tag(self, measurement, tag_key, limit=1):
        query = "SELECT * FROM " + measurement + " WHERE "+ tag_key + "="
        option = " ORDER BY time DESC LIMIT "
        tag_list = self.query_tag(measurement, tag_key);
        measurement_list = []

        for item in tag_list:
            measurement = self.client.query(query + '\'' + item + '\'' + option + str(limit))
            measurement_list += list(measurement)[0]
        return measurement_list

    def get_mean(self, measurement, tag, field, limit=10):
        samples = self.query_measurement_distinct_tag(measurement, tag, limit)
        mean = 0
        total = 0

        for sample in samples:
            total += sample[field]
        mean = total/len(samples)
        return mean
