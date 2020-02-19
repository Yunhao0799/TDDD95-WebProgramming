# ##############################################################################
#                            server.py                                         #
# This file shall contain all the server side remote procedures,implemented    #
# using Python and Flask                                                       #
################################################################################

from flask import Flask, request
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


@app.route('/sign_in', methods = ['GET'])
def sign_in():
    data = request.get_json()
    # print (email)
    email = data['email']
    password = data['password']
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
    return None

@app.route('/sign_up', methods = ['POST'])
def sign_up():
    data = request.get_json()
    if "@" in data['email']:
        if len(data['password']) >= 5:
            if data['firstname'] != None and data['familyname'] != None and data['gender'] != None and data['city'] != None and data['country'] != None:
                output_msg = database_helper.save_new_user(data['email'], data['password'], data['firstname'], data['familyname'], data['gender'], data['city'], data['country'])
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

@app.route('/sign_out', methods = ['POST'])
def sign_out():
    data = request.get_json()
    token = data['token']
    succesful_sign_out = database_helper.sign_out(token)
    if succesful_sign_out:
        return jsonify({'success' : True, 'message' : "Succesfully signed out"})
    else:
        return jsonify({'success' : False, 'message' : "Something went wrong when trying to sign out"})

@app.route('/change_password', methods = ['POST'])
def change_password():
    data = request.get_json()
    token = data['token']
    old_password = data['old_password']
    new_password = data['new_password']
    if token != None and old_password != new_password and old_password != None and len(new_password) >= 5:
        email = database_helper.get_email_by_token(token)
        email = email[0]
        exists = database_helper.check_user_password(email, old_password)
        password_changed = database_helper.change_password(email, new_password)
        if password_changed and exists:
            return jsonify({'success' : True, 'message' : "Password succesfully changed"})
        else:
            return jsonify({'success' : False, 'message' : "Something went wrong changing the password"})
    else:
         return jsonify({'success': False, 'message' : "Make sure that all fields are filled and new password has at least 5 letters"})

@app.route('/get/data/by_token', methods = ['GET'])
def get_user_data_by_token():
    data = request.get_json()
    token = data['token']
    if token != None:
        result = database_helper.get_user_data_by_token(token)
        if not result:
            return jsonify({'success' : False, 'message' : "No data with requested token"})
        return jsonify(result)




    else:
        return jsonify({'success' : False, 'message' : "Token has to be provided"})

@app.route('/get/data/by_email', methods = ['GET'])
def get_user_data_by_email():
    data = request.get_json()
    email = data['email']
    if email != None:
        result = database_helper.get_user_data_by_email(email)
        if not result:
            return jsonify({'success' : False, 'message' : "No data with requested email"})
        return jsonify(result)


    else:
        return jsonify({'success' : False, 'message' : "Email has to be provided"})

@app.route('/get/messages/by_token', methods = ['GET'])
def get_user_messages_by_token():
    data = request.get_json()
    token = data['token']
    if token != None:
        result = database_helper.get_user_messages_by_token(token)
        if not result:
            return jsonify({'success' : False, 'message' : "No message with requested token"})
        return jsonify(result)


    else:
        return jsonify({'success' : False, 'message' : "Token has to be provided"})

@app.route('/get/messages/by_email', methods = ['GET'])
def get_user_messages_by_email():
    # Retrive current user messages with the user with given email
    data = request.get_json()
    token = data['token']
    email = data['email']
    if token != None and email != None:
        result = database_helper.get_user_messages_by_email(token, email)
        if not result:
            return jsonify({'success' : False, 'message' : "No message with requested email"})
        return jsonify(result)


    else:
        return jsonify({'success' : False, 'message' : "Token and email have to be provided"})


@app.route('/post_message', methods = ['POST'])
def post_message():
    data = request.get_json()
    current_user_token = data['token']
    message = data['message']
    dest_email = data['email']

    if current_user_token != None and dest_email != None:
        sender_mail = database_helper.get_email_by_token(current_user_token)
        sender_mail = sender_mail[0]

        if database_helper.check_if_email_exists(sender_mail) and database_helper.check_if_email_exists(dest_email):
            success_post = database_helper.post_message(sender_mail, message, dest_email)
            if success_post:
                return jsonify({'success' : True, 'message' : "Message posted succesfully"})
            else:
                return jsonify({'success' : False, 'message' : "Something went wrong posting the message"})

        else:
                return jsonify({'success' : False, 'message' : "Provided token or email do not exist"})

    else:
        return jsonify({'success' : False, 'message' : "Token and destination email cannot be void"})









if __name__ == '__main__':
    app.run()
