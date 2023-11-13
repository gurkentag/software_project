import unittest
from datenbank import get_all_groups, set_lastsequenz, gruppenzugehoerigkeit_loeschen, calculate_average_energy_consumption, get_max_total, fill_maxTotal, automatische_lastsequenz_speichern, gruppe_loeschen
from unittest.mock import patch
from peewee import SqliteDatabase, IntegerField, Model, DateTimeField, FloatField, CharField, AutoField
import time
import datetime


class Testing(unittest.TestCase):

    def test1(self):
        x = 1
        y = 2
        self.assertTrue(x < y)

    def test_get_all_groups_select(self):
        with patch("datenbank.Gruppen.select") as mock:
            get_all_groups()
            self.assertTrue(mock.called)

    def test_datenbank_gruppenzugehoerigkeit_loeschen(self):
        sqlitedb = SqliteDatabase(":memory:")

        class Gruppen_zugehoerigkeit(Model):
            device_id = IntegerField()
            gruppen_id = IntegerField()

            class Meta:
                database = sqlitedb
                indexes = (
                    (("device_id", "gruppen_id"), True),
                )

        sqlitedb.create_tables([Gruppen_zugehoerigkeit])
        testeintrag = Gruppen_zugehoerigkeit(device_id=1, gruppen_id=1)
        testeintrag.save()
        gruppenzugehoerigkeit_loeschen(1, 1, Gruppen_zugehoerigkeit)

        results = [n for n in Gruppen_zugehoerigkeit.select().tuples()]
        self.assertTrue(len(results) == 0)

    def test_datenbank_gruppenzugehoerigkeit_loeschen_neg(self):
        sqlitedb = SqliteDatabase(":memory:")

        class Gruppen_zugehoerigkeit(Model):
            device_id = IntegerField()
            gruppen_id = IntegerField()

            class Meta:
                database = sqlitedb
                indexes = (
                    (("device_id", "gruppen_id"), True),
                )

        sqlitedb.create_tables([Gruppen_zugehoerigkeit])
        testeintrag = Gruppen_zugehoerigkeit(device_id=1, gruppen_id=1)
        testeintrag.save()

        results = [n for n in Gruppen_zugehoerigkeit.select().tuples()]
        self.assertTrue(len(results) == 1)
    def test_datenbank_gruppen_loeschen(self):
        sqlitedb = SqliteDatabase(":memory:")

        class Gruppen(Model):
            gruppen_id = AutoField()
            name = CharField(unique=True)

            class Meta:
                database = sqlitedb
                indexes = (
                    (("gruppen_id", "name"), True),
                )

        sqlitedb.create_tables([Gruppen])
        testeintrag = Gruppen(name="Name")
        testeintrag.save()

        results = [n for n in Gruppen.select().tuples()]
        self.assertTrue(len(results) == 1)

        gruppe_loeschen(1, Gruppen)
        results = [n for n in Gruppen.select().tuples()]
        self.assertTrue(len(results) == 0)

    def test_datenbank_get_all_groups(self):
        sqlitedb = SqliteDatabase(":memory:")

        class Gruppen(Model):
            gruppen_id = AutoField()
            name = CharField(unique=True)

            class Meta:
                database = sqlitedb
                indexes = (
                    (("gruppen_id", "name"), True),
                )

        sqlitedb.create_tables([Gruppen])

        for eintrag in range(5):
            testeintrag = Gruppen(name="Name"+str(eintrag))
            testeintrag.save()

        results = [n for n in Gruppen.select().tuples()]
        self.assertTrue(len(results) == 5)

        results = get_all_groups(Gruppen)
        self.assertTrue(len(results) == 5)

    def test_calculate_average_energy_consumption(self):
        sqlitedb = SqliteDatabase(":memory:")

        class Messung(Model):
            device_id = IntegerField()
            date = DateTimeField()
            verbrauch = FloatField()

            class Meta:
                database = sqlitedb

        sqlitedb.create_tables([Messung])

        for i in range(10):
            testwert = Messung(device_id=1, date=time.time(), verbrauch=i)
            testwert.save()

        result = calculate_average_energy_consumption(1, Messung)
        self.assertEqual(result, 4.5)

    def test_calculate_average_energy_consumption_none(self):
        sqlitedb = SqliteDatabase(":memory:")

        class Messung(Model):
            device_id = IntegerField()
            date = DateTimeField()
            verbrauch = FloatField()

            class Meta:
                database = sqlitedb

        sqlitedb.create_tables([Messung])

        result = calculate_average_energy_consumption(1, Messung)
        self.assertEqual(result, None)

    def test_fill_maxTotal(self):
        sqlitedb = SqliteDatabase(":memory:")

        class MaxTotal(Model):
            device_id = IntegerField()
            maximum = FloatField()

            class Meta:
                database = sqlitedb
        sqlitedb.create_tables([MaxTotal])

        with patch("datenbank.get_hour_max") as mock:
            fill_maxTotal(MaxTotal)
            self.assertTrue(mock.called)

    def test_get_max_total(self):
        sqlitedb = SqliteDatabase(":memory:")

        class MaxTotal(Model):
            device_id = IntegerField()
            maximum = FloatField()

            class Meta:
                database = sqlitedb
        sqlitedb.create_tables([MaxTotal])
        testeintrag = MaxTotal(device_id=1, maximum=5)
        testeintrag.save()
        result = get_max_total(1, MaxTotal)
        self.assertEqual(5, result)

    def test_automatische_lastsequenz_speichern(self):
        sqlitedb = SqliteDatabase(":memory:")

        class Messung(Model):
            device_id = IntegerField()
            date = DateTimeField()
            verbrauch = FloatField()

            class Meta:
                database = sqlitedb

        sqlitedb.create_tables([Messung])

        for i in range(40):
            testwert = Messung(
                device_id=1, date=datetime.datetime.now(), verbrauch=50)
            testwert.save()
        testwert = Messung(
            device_id=1, date=datetime.datetime.now(), verbrauch=0)
        testwert.save()

        def temp(i):
            return 1

        with patch("datenbank.get_max_total", wraps=temp) as mock:
            with patch("datenbank.set_lastsequenz") as mockzwei:
                automatische_lastsequenz_speichern(Messung)
                self.assertTrue(mockzwei.called)

    def test_set_lastsequenz(self):
        sqlitedb = SqliteDatabase(":memory:")

        class Messung(Model):
            device_id = IntegerField()
            date = DateTimeField()
            verbrauch = FloatField()

            class Meta:
                database = sqlitedb

        class Lastsequenz(Model):
            sequenz_id = IntegerField()
            label = CharField()
            device_id = IntegerField()

            class Meta:
                database = sqlitedb

        class Lastsequenz_werte(Model):
            sequenz_id = IntegerField()
            device_id = IntegerField()
            verbrauch = FloatField()
            date = DateTimeField()

            class Meta:
                database = sqlitedb

        sqlitedb.create_tables([Messung, Lastsequenz, Lastsequenz_werte])
        for i in range(40):
            testwert = Messung(
                device_id=1, date=datetime.datetime.now(), verbrauch=50)
            testwert.save()
        testwert = Messung(
            device_id=1, date=datetime.datetime.now(), verbrauch=0)
        testwert.save()
        set_lastsequenz("test", time.time()-10, time.time()+10, 1, Lastsequenz=Lastsequenz,
                        Messung=Messung, Lastsequenz_werte=Lastsequenz_werte)
        results = [n for n in Lastsequenz().select().tuples()]
        self.assertTrue(len(results) == 1)
        self.assertEqual("test", results[0][2])


if __name__ == "__main__":
    unittest.main()
