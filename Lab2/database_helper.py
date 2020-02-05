################################################################################
#                       database_helper.py                                     #
# This file will contain all the functions that access and control the         #
# database and shall contain some SQL scripts. This file will be used          #
# by the server to access the database. This file shall NOT contain any        #
# domain functions like signin or signup and shall only contain data-centric   #
# functionality like find_user(), remove_user(), create_post() and … .         #
# E.g. Implementing sign_in() in server.py shall involve a call to             #
# find_user() implemented in database_helper.py .                              #
################################################################################


import sqlite3
from flask import Flask, g, request


DATABASE_URI = "database.db"

def get_db():
    db = getattr(g,'db', None)
    if db is None:
        db = g.db = sqlite3.connect(DATABASE_URI)

    return db


def disconnect_db():
    db = getattr(g,'db', None)
    if db is not None:
        g.db.close()
        g.db = None

def check_user_password(email, password):
    cursor = get_db().execute('select password from users where email like ?', [email])
    rows = cursor.fetchall()
    cursor.close()
    result = []
    for index in range(len(rows)):
        result.append(rows[index][0])
    if result[0] == password:
        return True


    return False

def save_new_user(email, password, firstname, familyname, gender, city, country):
    try:
        get_db().execute("insert into users values(?,?,?,?,?,?,?)", [email, password, firstname, familyname, gender, city, country])
        get_db().commit()
        return True
    except:
        return False
