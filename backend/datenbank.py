import time
import datetime
from playhouse.mysql_ext import MariaDBConnectorDatabase
from peewee import Model, IntegerField, DateTimeField, FloatField, CharField, AutoField
from read_config import read_config

geraete = 57


config = read_config()
db = MariaDBConnectorDatabase(
    config['DB_DATABASE'], host=config['DB_HOST'], user=config['DB_USER'], password=config['DB_PASSWORD'])


class MaxTotal(Model):
    device_id = IntegerField()
    maximum = FloatField()

    class Meta:
        database = db


class Messung(Model):
    device_id = IntegerField()
    date = DateTimeField()
    verbrauch = FloatField()

    class Meta:
        database = db


class StuendlicheMessung(Model):
    device_id = IntegerField()
    date = DateTimeField()
    verbrauch = FloatField()

    class Meta:
        database = db


class Durchschnitt(Model):
    device_id = IntegerField()
    max_verbrauch = FloatField(null=True)
    average_verbrauch = FloatField(null=True)

    class Meta:
        database = db


class Gruppen(Model):
    gruppen_id = AutoField()
    name = CharField(unique=True)

    class Meta:
        database = db


class Gruppen_zugehoerigkeit(Model):
    device_id = IntegerField()
    gruppen_id = IntegerField()

    class Meta:
        database = db
        indexes = (
            (("device_id", "gruppen_id"), True),
        )


class Lastsequenz(Model):
    sequenz_id = IntegerField()
    label = CharField()
    device_id = IntegerField()

    class Meta:
        database = db


class Lastsequenz_werte(Model):
    sequenz_id = IntegerField()
    device_id = IntegerField()
    verbrauch = FloatField()
    date = DateTimeField()

    class Meta:
        database = db


def fill_maxTotal(MaxTotal=MaxTotal):
    for i in range(1, geraete):
        query = MaxTotal.select(MaxTotal.maximum).where(MaxTotal.device_id == i).limit(
            1).tuples()
        if len(query) == 0:
            hour_max = get_hour_max(i)
            if hour_max != None:
                print(str(hour_max), str(i))
                maxTotal = MaxTotal(device_id=i, maximum=hour_max)
                maxTotal.save()
                print("In MaxTotal wurde an Gerät " +
                      str(i)+" keine Daten Gefunden")
        else:
            if query[0][0] < get_hour_max(i):
                query2 = MaxTotal.update(
                    {
                        MaxTotal.maximum: get_hour_max(i),
                    }).where(MaxTotal.device_id == i)
                query2.execute()
                print("In MaxTotal wurde an Gerät " +
                      str(i)+" Daten Gefunden und geupdated")


def get_max_total(device, MaxTotal):
    query = MaxTotal.select(MaxTotal.maximum).where(MaxTotal.device_id == device).limit(
        1).tuples()
    return query[0][0]


def automatische_lastsequenz_speichern(Messung=Messung):
    for i in range(1, geraete):
        if i == 30 or i == 50:
            continue
        query = Messung.select(Messung.verbrauch, Messung.date).where(
            Messung.device_id == i).order_by(Messung.date.asc()).tuples()
        values = [[val[0], time.mktime(val[1].timetuple())] for val in query]
        aktuellesmax = get_max_total(i)
        potSequenz = []
        for wert in values:
            if wert[0] >= 0.4 * aktuellesmax:
                potSequenz.append(wert)
            else:
                if len(potSequenz) >= 30:
                    print("Habe Lastsequenz für Gerät {} zum Zeitpunkt {} gefunden".format(
                        i, potSequenz[0][1]))
                    set_lastsequenz("Auto Gerät {} Zeitpunkt {}, Schwellwert {}".format(i, potSequenz[0][1], aktuellesmax),
                                    potSequenz[0][1], potSequenz[-1][1], i)
                potSequenz = []


def set_lastsequenz(label, start, end, device, Lastsequenz=Lastsequenz, Messung=Messung, Lastsequenz_werte=Lastsequenz_werte):
    print("set lastsequenz called")
    sequenz_id = int(time.time())
    start = datetime.datetime.fromtimestamp(
        int(start))
    end = datetime.datetime.fromtimestamp(
        int(end))
    lastsequenz = Lastsequenz(
        label=label, sequenz_id=sequenz_id, device_id=device)
    lastsequenz.save()
    print(start)
    print(end)
    print("Requesting for device {} between {} and {}".format(device, start, end))
    query = Messung.select(Messung.verbrauch, Messung.date).where(
        Messung.device_id == int(device), (Messung.date >= start) & (Messung.date <= end)).tuples()
    values = [[val[0], val[1]] for val in query]
    print(len(values))

    for value in values:
        print("saving value: ", value)
        lastsequenz_wert = Lastsequenz_werte(
            sequenz_id=sequenz_id, device_id=device, date=value[1], verbrauch=value[0])
        lastsequenz_wert.save()


def get_sequenzen():
    query = Lastsequenz.select().tuples()
    sequenzen = [{"id": sequenz[1], "label":sequenz[2],
                  "device":sequenz[3]} for sequenz in query]

    return sequenzen


def get_sequenz_values(id):
    print("getting sequenz values for id {}".format(id))
    query = Lastsequenz_werte.select().where(
        Lastsequenz_werte.sequenz_id == id).tuples()
    values = [[val[3], time.mktime(val[4].timetuple())] for val in query]
    return values


def delete_sequenz(seqid):
    query = Lastsequenz.delete().where(Lastsequenz.sequenz_id == seqid)
    query.execute()


def messung_speichern(device, value):
    try:
        messung = Messung(device_id=device, verbrauch=value,
                          date=datetime.datetime.fromtimestamp(time.time()))
        messung.save()
    except Exception as e:
        print("Error trying to save messung {} at {} with Exception {}".format(
            messung, time.time(), e))


def get_neuste_messung(device):
    query = Messung.select(Messung.verbrauch).where(Messung.device_id == device).order_by(Messung.date.desc()).limit(
        1).tuples()
    for ergebnis in query:
        return ergebnis[0]


def get_last_n_messungen(n, device):
    query = Messung.select(Messung.verbrauch, Messung.date).where(Messung.device_id == device).order_by(Messung.date.desc()).limit(
        n).tuples()
    values = [[val[0], time.mktime(val[1].timetuple())] for val in query]
    return values


def get_last_n_messungen_stuendlich(n, device):
    query = StuendlicheMessung.select(StuendlicheMessung.verbrauch, StuendlicheMessung.date).where(StuendlicheMessung.device_id == device)\
        .order_by(StuendlicheMessung.date.desc()).limit(n).tuples()
    values = [[val[0], time.mktime(val[1].timetuple())] for val in query]
    return values


def delete_old_records():
    now = datetime.datetime.fromtimestamp(time.time())
    query = Messung.delete().where(Messung.date < now - datetime.timedelta(days=1))
    query.execute()


def calculate_average_energy_consumption(device, Messung=Messung):
    values = [val[0] for val in Messung.select(
        Messung.verbrauch).where(Messung.device_id == device).tuples()]
    if len(values) == 0:
        return None
    else:
        return sum(values) / len(values)


def calculate_max_energy_consumption(device):
    values = [val[0] for val in Messung.select(
        Messung.verbrauch).where(Messung.device_id == device).tuples()]
    return max(values, default=None)


def durchschnitt_speichern(device):
    if len(list(Durchschnitt.select().where(Durchschnitt.device_id == device).tuples())) == 0:
        durchschnitt = Durchschnitt(device_id=device, max_verbrauch=calculate_max_energy_consumption(device),
                                    average_verbrauch=calculate_average_energy_consumption(device))
        durchschnitt.save()
    else:
        query = Durchschnitt.update(
            {
                Durchschnitt.max_verbrauch: calculate_max_energy_consumption(device),
                Durchschnitt.average_verbrauch: calculate_average_energy_consumption(
                    device)
            }).where(Durchschnitt.device_id == device)
        query.execute()


def fill_consumption_table():
    for i in range(1, geraete):
        durchschnitt_speichern(i)


def get_hour_average(device):
    query = Durchschnitt.select(Durchschnitt.average_verbrauch).where(
        Durchschnitt.device_id == device).tuples()
    for ergebniss in query:
        return ergebniss[0]


def get_hour_max(device):
    query = Durchschnitt.select(Durchschnitt.max_verbrauch).where(
        Durchschnitt.device_id == device).tuples()
    for ergebniss in query:
        return ergebniss[0]


def gruppe_hinzufuegen(name):
    gruppe = Gruppen(name=name)
    gruppe.save()


def gruppen_zugehoerigkeit_definieren(gruppen_id, device_id):
    gruppen_zugehoerigkeit = Gruppen_zugehoerigkeit(
        device_id=device_id, gruppen_id=gruppen_id)
    gruppen_zugehoerigkeit.save()


def get_gruppe(gruppe):
    query = Gruppen_zugehoerigkeit.select(Gruppen_zugehoerigkeit.device_id).where(
        Gruppen_zugehoerigkeit.gruppen_id == gruppe).tuples()
    devices = [device[0] for device in query]
    return devices
#############################################################
#############################################################
def gruppenzugehoerigkeit_loeschen(gruppen_id, device_id, Gruppen_zugehoerigkeit=Gruppen_zugehoerigkeit):
    query = Gruppen_zugehoerigkeit.delete().where(Gruppen_zugehoerigkeit.gruppen_id ==
                                                  gruppen_id, Gruppen_zugehoerigkeit.device_id == device_id)
    query.execute()


def gruppe_loeschen(gruppen_id, Gruppen=Gruppen):
    query = Gruppen.delete().where(Gruppen.gruppen_id == gruppen_id)
    query.execute()


def get_all_groups(Gruppen=Gruppen):
    query = Gruppen.select().tuples()
    gruppen = [{"id": gruppe[0], "name":gruppe[1]} for gruppe in query]
    return gruppen


def get_monthly_average(deviceid):
    counter = 0.0
    sume = 0.0
    query = StuendlicheMessung.select(StuendlicheMessung.verbrauch).where(
        StuendlicheMessung.device_id == deviceid).tuples()
    for ergebniss in query:
        counter += 1
        sume += float(ergebniss[0])
    return sume/counter


def get_monthly_max(deviceid):
    values = []
    query = StuendlicheMessung.select(StuendlicheMessung.verbrauch).where(
        StuendlicheMessung.device_id == deviceid).tuples()
    for ergebniss in query:
        values.append(ergebniss[0])
    return max(values)


if __name__ == "__main__":
    # gruppe_hinzufuegen(1, "gruppe01")
    # gruppen_zugehoerigkeit_definieren(34, 1)
    # gruppen_zugehoerigkeit_definieren(35, 1)
    # gruppen_zugehoerigkeit_definieren(36, 1)
    # gruppen_zugehoerigkeit_definieren(37, 1)
    # print(get_gruppe(1))
    # delete_old_records()
    # fill_consumption_table()
    fill_maxTotal()
    # automatische_lastsequenz_speichern()
    pass
