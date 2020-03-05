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
    if result==[]:
        return False
    if result[0] == password :
        return True
    else:
        return False


def link_token_to_user(email, token):
    try:
        get_db().execute("insert or replace into loggedUser values(?,?)", [email, token])
        get_db().commit()
        return True
    except:
        return False

def save_new_user(email, password, firstname, familyname, gender, city, country):
    try:
        get_db().execute("insert into users values(?,?,?,?,?,?,?)", [email, password, firstname, familyname, gender, city, country])
        get_db().commit()
        return True
    except:
        return False


def sign_out(token):
    try:
        get_db().execute("delete from loggedUser where token like ?", [token])
        get_db().commit()
        return True
    except:
        return False

def get_user_data_by_token(token):
    cursor = get_db().execute('select * from users where email like (select email from loggedUser where token like ?)', [token])
    rows = cursor.fetchall()
    cursor.close()
    if rows==[]:
        return None
    else :
        data = {"success" : True, "email" : rows[0][0], "firstname" : rows[0][2], "familyname" : rows[0][3], "gender" : rows[0][4], "city" : rows[0][5], "country" : rows[0][6]}
        return data

def get_user_data_by_email(email):
    cursor = get_db().execute('select * from users where email like ?', [email])
    rows = cursor.fetchall()
    cursor.close()
    if rows==[]:
        return None
    else:
        index = 0
        data = {"success" : True, "email" : rows[index][0], "firstname" : rows[index][2], "familyname" : rows[index][3], "gender" : rows[index][4], "city" : rows[index][5], "country" : rows[index][6]}
        return data

def get_user_messages_by_token(token):
    cursor = get_db().execute('select sender, message from message where receiver like (select email from loggedUser where token like ?)', [token])
    rows = cursor.fetchall()
    cursor.close()
    if rows==[]:
        return None
    else:
        data = []
        for index in range(len(rows)):
            data.append({'sender' : rows[index][0], 'message' : rows[index][1]})
        return data


def get_user_messages_by_email(email):
    cursor = get_db().execute('select sender, message from message where receiver like ?', [email])
    rows = cursor.fetchall()
    cursor.close()
    if rows==[]:
        return None
    else:
        data = []
        for index in range(len(rows)):
            data.append({'sender' : rows[index][0], 'message' : rows[index][1]})
        return data


def get_email_by_token(token):
        cursor = get_db().execute('select email from users where email like (select email from loggedUser where token like ?)', [token])
        rows = cursor.fetchall()
        cursor.close()
        if rows==[]:
            return None
        else:
            data = []
            for index in range(len(rows)):
                data.append(rows[index][0])
            return data

def post_message(sender_mail, message, dest_email):
        try:
            get_db().execute("insert into message (sender, receiver, message) values(?,?,?)", [sender_mail, dest_email, message])
            get_db().commit()
            return True
        except:
            return False


def check_if_email_exists(email):
    cursor = get_db().execute('select email from users where email like ?', [email])
    rows = cursor.fetchall()
    cursor.close()
    data = []
    for index in range(len(rows)):
        data.append(rows[index][0])
    if data==[]:
        return False
    else:
        return True


def change_password(email, new_password):
    try:
        get_db().execute("update users set password=? where email=?;", [new_password, email])
        get_db().commit()
        return True
    except:
        return False


def get_users_salt(email):
    cursor = get_db().execute('select * from users where email like ?', [email])
    rows = cursor.fetchall()
    cursor.close()
    if rows==[]:
        return None
    else:
        index = 0
        data = {"password" : rows[index][1], "salt" : rows[index][7]}
        return data


def get_email_logged_user():
        cursor = get_db().execute('select * from loggedUser')
        rows = cursor.fetchall()
        cursor.close()
        if rows==[]:
            return None
        else:
            data = {"email" : rows[0][0], "token" : rows[0][1]}

            return data
