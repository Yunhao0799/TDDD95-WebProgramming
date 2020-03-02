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
import requests
import string
# module secrets used for generate token
import secrets

# module to send Email
import smtplib
import email.utils
from email.mime.text import MIMEText
#other solution for mails
from flask_mail import Mail
from flask_mail import Message

socketsTab = {}

app = Flask(__name__)

mail = Mail(app)

app.debug = True


@app.route('/')
def root():
    return app.send_static_file('client.html')



@app.route('/sign_in', methods = ['PUT'])
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

@app.route('/sign_up', methods = ['POST'])
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


@app.route('/sign_out', methods = ['POST'])
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


@app.route('/change_password', methods = ['POST'])
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


@app.route('/get/data/by_token', methods = ['POST'])
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

@app.route('/get/data/by_email', methods = ['POST'])
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

@app.route('/get/messages/by_token', methods = ['POST'])
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

@app.route('/get/messages/by_email', methods = ['POST'])
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


@app.route('/post_message', methods = ['POST'])
def post_message():
    data = request.get_json()
    print(data)
    current_user_token = data['token']
    message = data['message']
    dest_email = data['email']
    place = data['place']
    sender_mail = database_helper.get_email_by_token(current_user_token)
    sender_mail = sender_mail[0]
    if dest_email==None:
        dest_email = sender_mail
    if current_user_token != None and dest_email != None:
        if database_helper.check_if_email_exists(sender_mail) and database_helper.check_if_email_exists(dest_email):
            success_post = database_helper.post_message(sender_mail, message, dest_email, place)
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
        token = ws.receive()
        aux = database_helper.get_email_by_token(token)
        email = aux[0]
        if email in socketsTab:
            oldSocket = socketsTab[email]
            try:
                oldSocket.send("sign_out")
            except:
                print("Failed sending sign_out")
            del socketsTab[email]

        socketsTab[email]=ws
        print(socketsTab)

        while True:
            try:
                token = ws.receive()
            except:
                return "Connection socket failed"

    return "End if api"

@app.route('/get/position', methods = ['POST'])
def getPosition():
    data = request.get_json()
    lat = data['lat']
    long = data['long']
    resp = requests.get("https://geocode.xyz/" + lat + "," + long + "?json=1&auth=558584188059089175329x4704")
    json = resp.json()
    return json


@app.route('/reset_password', methods = ['POST'])
def resetPswd() :
    data = request.get_json()
    email = data['email']
    if database_helper.check_if_email_exists(email):

        #create a new secure password#
        stringSource  = string.ascii_letters + string.digits + string.punctuation
        password = secrets.choice(string.ascii_lowercase)
        password += secrets.choice(string.ascii_uppercase)
        password += secrets.choice(string.digits)
        for i in range(6):
            password += secrets.choice(stringSource)
        char_list = list(password)
        secrets.SystemRandom().shuffle(char_list)
        password = ''.join(char_list)
        print ("New secure Password is ", password)

        #upload the database with the new password#
        password_changed = database_helper.change_password(email, password)
        if password_changed:

            #send the email#
            sender = 'test@localhost'
            receivers = [email]

            message = """\
Dear user,
Your new password is : """+ password +"""

The Twidder team"""


            try:
                # Create the message
                msg = Message(subject='New Twidder password',
                              body= message,
                              sender="marie.dralliag@gmail.com",
                              recipients=[email])
                print(msg)
                mail.send(msg)
                #msg = MIMEText(message)
                #msg['From'] = sender
                #msg['To'] = ", ".join(receivers)
                #msg['Subject'] = 'New Twidder password'
                #print(msg.as_string())
                #server = smtplib.SMTP('localhost', 5000)
                #print("server creating")
                #server.sendmail(sender, receivers, msg.as_string())
                #server.quit()
                print("Successfully sent email")
                return jsonify({'success' : True, 'message' : "Password resetting"})
            except smtplib.SMTPException:
                return jsonify({'success' : False, 'message' : "Error: unable to send email"})

        else:
            return jsonify({'success' : False, 'message' : "Something went wrong changing the password"})
    else :
        return jsonify({'success' : False, 'message' : "Your email does not exist in our database."})





if __name__ == '__main__':
    print("http://localhost:5000/")
    http_server = WSGIServer(('',5000), app, handler_class=WebSocketHandler)
    http_server.serve_forever()
