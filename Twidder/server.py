# ##############################################################################
#                            server.py                                         #
# This file shall contain all the server side remote procedures,implemented    #
# using Python and Flask                                                       #
################################################################################

from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
from flask import Flask, request, render_template
import database_helper
import json
from flask import jsonify
# module secrets used for generate token
import secrets

socketsTab = {}

app = Flask(__name__)

app.debug = True


@app.route('/')
def root():
    return app.send_static_file('client.html')



@app.route('/sign_in', methods = ['PUT']) #ok
def sign_in():
    data = request.get_json()
    email = data['email']
    password = data['password']
    boolean_success = database_helper.check_user_password(email, password)
    if boolean_success == True:
        token = secrets.token_hex(16)
        token_saved = database_helper.link_token_to_user(email, token)
        if token_saved:
            return jsonify({'success' : True, 'message' : token})
        else:
            return jsonify({'success' : False, 'message' : "Error generating and saving the token(maybe you are already signed in)"})
    else:
        return jsonify({'success' : False, 'message' : "Wrong user or wrong password"})
    return None

@app.route('/sign_up', methods = ['POST']) #ok
def sign_up():
    data = request.get_json()
    already_exists = database_helper.check_if_email_exists(data['email'])
    if already_exists :
        return jsonify({'success' : False, 'message' : "User already exists."})
    else :  #do not need to check if a field is empty because html code does it (required)
        output_msg = database_helper.save_new_user(data['email'], data['password'], data['firstname'], data['familyname'], data['gender'], data['city'], data['country'])
        if output_msg:
            return jsonify({'success' : True, 'message' : "Data saved succesfully"})
        else:
            return jsonify({'success' : False, 'message' : "Something went wrong saving the data(maybe email already exists)"})


@app.route('/sign_out', methods = ['POST']) #ok
def sign_out(token = None):
    data = request.get_json()
    token = data['token']
    if token==None:
        return jsonify({'success' : False, 'message' : "You are not signed in."})
    succesful_sign_out = database_helper.sign_out(token)
    if succesful_sign_out:
        return jsonify({'success' : True, 'message' : "Succesfully signed out"})
    else:
        return jsonify({'success' : False, 'message' : "Something went wrong when trying to sign out"})


@app.route('/change_password', methods = ['POST'])  #ok
def change_password():
    data = request.get_json()
    token = data['token']
    old_password = data['old_password']
    new_password = data['new_password']
    if token != None:
        email = database_helper.get_email_by_token(token)
        email = email[0]
        exists = database_helper.check_user_password(email, old_password)
        if exists==False:
            return jsonify({'success' : False, 'message' : "Wrong password"})
        password_changed = database_helper.change_password(email, new_password)
        if password_changed and exists:
            return jsonify({'success' : True, 'message' : "Password succesfully changed"})
        else:
            return jsonify({'success' : False, 'message' : "Something went wrong changing the password"})
    else:
        return jsonify({'success' : False, 'message' : "You are not signed in."})


@app.route('/get/data/by_token', methods = ['POST'])  #ok
def get_user_data_by_token():
    data = request.get_json()
    token = data['token']
    if token != None:
        result = database_helper.get_user_data_by_token(token)
        if result==None:
            return jsonify({'success' : False, 'message' : "No data with requested token"})
        return jsonify(result)
    else:
        return jsonify({'success' : False, 'message' : "Token has to be provided"})

@app.route('/get/data/by_email', methods = ['POST']) #ok
def get_user_data_by_email():
    data = request.get_json()
    token = data['token']
    email = data['email']
    if token!= None:
        if email != None:
            result = database_helper.get_user_data_by_email(email)
            if result==None:
                return jsonify({'success' : False, 'message' : "No data with requested email"})
            return jsonify(result)
        else:
            return jsonify({'success' : False, 'message' : "Email has to be provided"})
    else:
        return jsonify({'success' : False, 'message' : "You are not signed in."})

@app.route('/get/messages/by_token', methods = ['POST']) #ok
def get_user_messages_by_token():
    data = request.get_json()
    token = data['token']
    if token != None:
        result = database_helper.get_user_messages_by_token(token)
        if result==None:
            return jsonify({'success' : False, 'message' : "No message with requested token"})
        return jsonify(result)
    else:
        return jsonify({'success' : False, 'message' : "Token has to be provided"})

@app.route('/get/messages/by_email', methods = ['POST']) #ok
def get_user_messages_by_email():
    # Retrive current user messages with the user with given email
    data = request.get_json()
    token = data['token']
    email = data['email']
    if token != None:
        if email != None:
            result = database_helper.get_user_messages_by_email(email)
            if result==None:
                return jsonify({'success' : False, 'message' : "No message with requested email"})
            return jsonify(result)
        else:
            return jsonify({'success' : False, 'message' : "Email has to be provided"})
    else:
        return jsonify({'success' : False, 'message' : "You are not signed in."})


@app.route('/post_message', methods = ['POST'])  #ok
def post_message():
    data = request.get_json()
    current_user_token = data['token']
    message = data['message']
    dest_email = data['email']
    sender_mail = database_helper.get_email_by_token(current_user_token)
    sender_mail = sender_mail[0]
    if dest_email==None:
        dest_email = sender_mail
    if current_user_token != None and dest_email != None:
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


@app.route('/api')
def api():
    if request.environ.get('wsgi.websocket'):
        ws = request.environ['wsgi.websocket']
        email = ws.receive()

        if email in socketsTab:
            socketsTab[email].send("sign_out")

        socketsTab[email]=ws

        try:
            while True:
                email = ws.receive()
        except:
            return "Connection socket failed"




if __name__ == '__main__':
    http_server = WSGIServer(('',5000), app, handler_class=WebSocketHandler)
    http_server.serve_forever()
