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
from Flask import g
import jsonify

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

def check_user(email, password):
    return False
