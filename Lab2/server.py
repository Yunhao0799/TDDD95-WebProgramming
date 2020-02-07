# ##############################################################################
#                            server.py                                         #
# This file shall contain all the server side remote procedures,implemented    #
# using Python and Flask                                                       #
################################################################################

from flask import Flask
import database_helper
import json
from flask import jsonify
# module secrets used for generate token
import secrets



app = Flask(__name__)

app.debug = True


@app.route('/hello')
def hello_world():
    return 'Hello, World!'


@app.route('/sign_in/<email>/<password', methods = ['GET'])
def sign_in(email, password):
    boolean_success = database_helper.check_user_password(email, password)
    if boolean_success == True:
        token = secrets.token_hex(16)
        token_saved = database_helper.link_token_to_user(email, token)
        if token_saved:
            return token
        else:
            return jsonify({'success' : False, 'message' : "Error generating and saving the token(maybe you are already signed in)"})
    else:
        return jsonify({'success' : False, 'message' : "Wrong user or wrong password"})

@app.route('/sign_up/<email>/<password>/<firstname>/<familyname>/<gender>/<city>/<country>', methods = ['POST'])
def sign_up(email, password, firstname, familyname, gender, city, country):
    if "@" in email:
        if len(password) >= 5:
            if firstname != None and familyname != None and gender != None and city != None and country != None:
                output_msg = database_helper.save_new_user(email, password, firstname, familyname, gender, city, country)
                if output_msg:
                    return jsonify({'success' : True, 'message' : "Data saved succesfully"})
                else:
                    return jsonify({'success' : False, 'message' : "Something went wrong saving the data(maybe email already exists)"})
            else:
                return jsonify({'success' : False, 'message' : "Fields cannot be empty"})
        else:
            return jsonify({'success' : False, 'message' : "Password too short"})

    else:
        return  jsonify({'success' : True, 'message' : "Invalid email"})

@app.route('/sign_out/<token>', methods = ['POST'])
def sign_out(token):
    succesful_sign_out = database_helper.sign_out(token)
    if succesful_sign_out:
        return jsonify({'success' : True, 'message' : "Succesfully signed out"})
    else:
        return jsonify({'success' : False, 'message' : "Something went wrong when trying to sign out"})

@app.route('/change_password/<token>/<old_password>/<new_password>', methods = ['POST'])
def change_password(token, old_password, new_password):
    return "Not implemented"

@app.route('/get/data/by_token/<token>', methods = ['GET'])
def get_user_data_by_token(token = None):
    if token != None:
        result = database_helper.get_user_data_by_token(token)
        if not result:
            return jsonify({'success' : False, 'message' : "No data with requested token"})
        return jsonify(result)


    else:
        return jsonify({'success' : False, 'message' : "Token has to be provided"})

@app.route('/get/data/by_email/<email>', methods = ['GET'])
def get_user_data_by_email(email = None):
    if email != None:
        result = database_helper.get_user_data_by_email(email)
        if not result:
            return jsonify({'success' : False, 'message' : "No data with requested email"})
        return jsonify(result)


    else:
        return jsonify({'success' : False, 'message' : "Email has to be provided"})

@app.route('/get/messages/by_token/<token>', methods = ['GET'])
def get_user_messages_by_token(token):
    return "Not implemented"

@app.route('/get/messages/by_email/<email>', methods = ['GET'])
def get_user_messages_by_email(current_user_token, email):
    # Retrive current user messages with the user with given email
    return "Not implemented"

def post_message(message):
    return "Not implemented"







if __name__ == '__main__':
    app.run()
