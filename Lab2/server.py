# ##############################################################################
#                            server.py                                         #
# This file shall contain all the server side remote procedures,implemented    #
# using Python and Flask                                                       #
################################################################################

from flask import Flask
import database_helper
import json
# module secrets used for generate token
import secrets



app = Flask(__name__)

app.debug = True


@app.route('/hello')
def hello_world():
    return 'Hello, World!'


@app.route('/sign_in/<email>/<password>', methods = ['GET'])
def sign_in(email, password):
    boolean_success = database_helper.check_user_password(email, password)
    if boolean_success == True:
        token = secrets.token_hex(16)
        return token
    else:
        return "Wrong password"

@app.route('/sign_up/<email>/<password>/<firstname>/<familyname>/<gender>/<city>/<country>', methods = ['POST'])
def sign_up(email, password, firstname, familyname, gender, city, country):
    if "@" in email:
        if len(password) >= 5:
            if firstname != None and familyname != None and gender != None and city != None and country != None:
                output_msg = database_helper.save_new_user(email, password, firstname, familyname, gender, city, country)
                if output_msg:
                    return "Data saved succesfully"
                else:
                    return "Something went wrong saving the data(maybe email already exists)"
            else:
                return "Fields cannot be empty"
        else:
            return "Password too short"

    else:
        return  "Invalid email"






if __name__ == '__main__':
    app.run()
