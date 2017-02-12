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

    def query_ids_from_temp(self):
        ids = []
        tag_query = self.client.query("SHOW TAG VALUES FROM temp WITH KEY = id")
        tags = list(tag_query)[0]

        for tag in tags:
            ids.append(tag['value'])
        return ids

    def query_temp(self, limit=None):
        query = "SELECT * FROM temp ORDER BY time DESC"
        limit_option = '';
        if (limit != None):
            limit_option = " LIMIT " + str(limit);
        return self.client.query(query + limit_option)

    def query_temp_by_id(self):
        query = "SELECT * FROM temp WHERE id="
        option = " ORDER BY time DESC LIMIT 1"
        ids = self.query_ids_from_temp();
        temp_list = []

        for i in ids:
            temp = self.client.query(query + '\'' + i + '\'' + option)
            temp_list.append(list(temp)[0][0])
        return temp_list

    def query_resource(self, limit=None):
        query = "SELECT * FROM resource ORDER BY time DESC"
        limit_option = '';
        if (limit != None):
            limit_option = " LIMIT " + str(limit);
        return self.client.query(query + limit_option)
