import os
from influxdb import InfluxDBClient

os.environ['HOST'] = '210.125.84.55'
os.environ['PORT'] = '8086'
os.environ['USERNAME'] = 'root'
os.environ['PW'] = 'root'
os.environ['DATABASE'] = 'senics'

class Influx():
    id_number = 0;

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

    def query_ids_from_temp(self):
        ids = []
        tag_query = self.client.query("SHOW TAG VALUES FROM temp WITH KEY = id")
        tags = list(tag_query)[0]

        for tag in tags:
            ids.append(tag['value'])

        self.id_number = len(ids)
        return ids

    def query_temp(self, limit=None):
        query = "SELECT * FROM temp ORDER BY time DESC"
        limit_option = '';
        if (limit != None):
            limit_option = " LIMIT " + str(limit);
        return self.client.query(query + limit_option)

    def query_temp_by_id(self, limit=1):
        query = "SELECT * FROM temp WHERE id="
        option = " ORDER BY time DESC LIMIT "
        ids = self.query_ids_from_temp();
        temp_list = []

        for i in ids:
            temp = self.client.query(query + '\'' + i + '\'' + option + str(limit))
            temp_array = list(temp)[0]
            for item in temp_array:
                temp_list.append(item)
        return temp_list

    def get_mean_from_temp(self, n=100):
        samples = self.query_temp_by_id(n)
        mean = 0
        total = 0

        for sample in samples:
            total += sample['temperature']
        mean = total/n/self.id_number
        return mean

    def query_resource(self, limit=None):
        query = "SELECT * FROM resource ORDER BY time DESC"
        limit_option = '';
        if (limit != None):
            limit_option = " LIMIT " + str(limit);
        return self.client.query(query + limit_option)
