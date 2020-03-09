# ##############################################################################
#                            server.py                                         #
# This file shall contain all the server side remote procedures,implemented    #
# using Python and Flask                                                       #
################################################################################

from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
from flask import Flask, request, render_template, flash, redirect, url_for
import database_helper
import json
from flask import jsonify
import requests
import string
# module secrets used for generate token
import secrets
#module flask_bcrypt for hashing purposes
from flask_bcrypt import Bcrypt
#modele os used by os.urandom
import os
#module binascii needed for the function binascii.hexlify()
import binascii
import hashlib

# module to send Email
import smtplib
import email.utils
from email.mime.text import MIMEText
#manage a form
from flask_wtf import Form
from wtforms import StringField
from wtforms.validators import DataRequired, Email, Length

socketsTab = {}

app = Flask(__name__)
bcrypt = Bcrypt(app)
#32 bytes salt

app.config['SECRET_KEY'] = b'_5#y2L"F4Q8z\n\xec]/'  #random key

app.debug = True

##########Routes##############

@app.route('/')
def root():
    return app.send_static_file('client.html')



@app.route('/sign_in', methods = ['PUT'])
def sign_in():
    data = request.get_json()
    email = data['email']
    inputed_password = data['password']
    ########################### Password validation ############################
    # 1. Retrive user's salt from the database
    authentication_data = database_helper.get_users_salt(email)
    # 2. Append salt to the inputed password
    inputed_password = inputed_password + authentication_data['salt']
    # 3. Compare the hash generated from the inputed password with the one in
    #    the database
    boolean_success = False
    if(bcrypt.check_password_hash(authentication_data['password'], inputed_password)):
        boolean_success = True
    ############################################################################
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
        ########################## Password hashing ############################
        # 1. Generate salt
        salt = os.urandom(32)
        salt = (binascii.hexlify(salt)).decode('utf-8')
        # 2. Append salt to the password
        password = data['password']
        password = password + salt
        # 3. Hash the password and storing
        password = bcrypt.generate_password_hash(password).decode('utf-8')
        output_msg = database_helper.save_new_user(data['email'], password, data['firstname'], data['familyname'], data['gender'], data['city'], data['country'], salt)
        ########################################################################
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
    url = data['url']
    authentication_data = database_helper.get_email_logged_user()
    stored_token = authentication_data['token']
    equal_hashed_token = False
    ########################## Token verification ##########################
    # 1. Recreate the blob using the stored token
    blob = ""
    i = 0
    while i < len(url):
        blob = blob + url[i]
        i = i + 3
    blob = stored_token + blob
    # 2. Hash it
    hash = hashlib.sha256(blob.encode()).hexdigest()
    # 3. Compare the two hashes
    if token == hash:
        equal_hashed_token = True
        print("Equal hashes log_out")
    ########################################################################
    if equal_hashed_token:
        succesful_sign_out = database_helper.sign_out(stored_token)
        if succesful_sign_out:
            return jsonify({'success' : True, 'message' : "Succesfully signed out"})
        else:
            return jsonify({'success' : False, 'message' : "Something went wrong when trying to sign out"})
    else:
        return jsonify({'success' : False, 'message' : "The hashes is not the same"})



@app.route('/change_password', methods = ['POST'])
def change_password():
    data = request.get_json()
    token = data['token']
    old_password = data['old_password']
    new_password = data['new_password']
    if token != None:
        loggedUserData = database_helper.get_email_logged_user()
        email = loggedUserData['email']
        stored_token = loggedUserData['token']
        equal_hashed_token = False
        ########################## Token verification ##########################
        # 1. Recreate the blob using the stored token
        blob = ""
        i = 0
        while i < len(old_password):
            blob = blob + old_password[i]
            i = i + 3
        print("blob oldPswd: " + blob)
        i = 0
        while i < len(new_password):
            blob = blob + new_password[i]
            i = i + 3
        print("blob newPswd: " + blob)
        blob = stored_token + blob
        print("blob: " + blob)
        # 2. Hash it
        hash = hashlib.sha256(blob.encode()).hexdigest()
        print(hash)
        # 3. Compare the two hashes
        if token == hash:
            equal_hashed_token = True
            print("Equal hashes sign_out")
        print(equal_hashed_token)
        ########################################################################
        if equal_hashed_token:
            inputed_password = old_password
            ####################### Old password validation ########################
            # 1. Retrive user's salt from the database
            authentication_data = database_helper.get_users_salt(email)
            # 2. Append salt to the inputed password
            inputed_password = inputed_password + authentication_data['salt']
            # 3. Compare the hash generated from the inputed password with the one in
            #    the database
            exists = False
            if(bcrypt.check_password_hash(authentication_data['password'], inputed_password)):
                exists = True
            ########################################################################
            if exists==False:
                return jsonify({'success' : False, 'message' : "Wrong password"})
            ######################## New password hashing ##########################
            # 1. Generate salt
            salt = os.urandom(32)
            salt = (binascii.hexlify(salt)).decode('utf-8')
            # 2. Append salt to the password
            password = new_password
            password = password + salt
            # 3. Hash the password and storing
            password = bcrypt.generate_password_hash(password).decode('utf-8')
            password_changed = database_helper.change_password(email, password, salt)
            ########################################################################
            if password_changed and exists:
                return jsonify({'success' : True, 'message' : "Password succesfully changed"})
            else:
                return jsonify({'success' : False, 'message' : "Something went wrong changing the password"})
        else:
            print("hashes are not the same")
            return jsonify({'success' : False, 'message' : "The hashes is not the same"})
    else:
        return jsonify({'success' : False, 'message' : "You are not signed in."})



@app.route('/get/data/by_token', methods = ['POST'])
def get_user_data_by_token():
    data = request.get_json()
    token = data['token']
    if token != None:
        url = data['url']
        authentication_data = database_helper.get_email_logged_user()
        stored_token = authentication_data['token']
        equal_hashed_token = False
        ########################## Token verification ##########################
        # 1. Recreate the blob using the stored token
        blob = ""
        i = 0
        while i < len(url):
            blob = blob + url[i]
            i = i + 3
        blob = stored_token + blob
        # 2. Hash it
        hash = hashlib.sha256(blob.encode()).hexdigest()
        # 3. Compare the two hashes
        if token == hash:
            equal_hashed_token = True
            print("Equal hashes get_users_data_by_token")
        ########################################################################
        if equal_hashed_token:
            result = database_helper.get_user_data_by_token(stored_token)
            if result==None:
                return jsonify({'success' : False, 'message' : "No data with requested token"})
            return jsonify(result)
        else:
            return jsonify({'success' : False, 'message' : "No equal hashes get_user_data_by_token"})
    else:
        return jsonify({'success' : False, 'message' : "Token has to be provided"})



@app.route('/get/data/by_email', methods = ['POST'])
def get_user_data_by_email():
    data = request.get_json()
    token = data['token']
    email = data['email']
    authentication_data = database_helper.get_email_logged_user()
    stored_token = authentication_data['token']
    equal_hashed_token = False
    ########################## Token verification ##########################
    # 1. Recreate the blob using the stored token
    blob = ""
    i = 0
    while i < len(email):
        blob = blob + email[i]
        i = i + 3
    blob = stored_token + blob
    # 2. Hash it
    hash = hashlib.sha256(blob.encode()).hexdigest()
    # 3. Compare the two hashes
    if token == hash:
        equal_hashed_token = True
        print("Equal hashes get_users_data_by_email")
    ########################################################################
    if token!= None:
        if equal_hashed_token:
            if email != None:
                result = database_helper.get_user_data_by_email(email)
                if result==None:
                    return jsonify({'success' : False, 'message' : "No data with requested email"})
                return jsonify(result)
            else:
                return jsonify({'success' : False, 'message' : "Email has to be provided"})
        else:
            return jsonify({'success' : False, 'message' : "Hashes not equal get_user_data_by_email"})
    else:
        return jsonify({'success' : False, 'message' : "You are not signed in."})



@app.route('/get/messages/by_token', methods = ['POST'])
def get_user_messages_by_token():
    data = request.get_json()
    token = data['token']
    if token != None:
        url = data['url']
        authentication_data = database_helper.get_email_logged_user()
        stored_token = authentication_data['token']
        equal_hashed_token = False
        ########################## Token verification ##########################
        # 1. Recreate the blob using the stored token
        blob = ""
        i = 0
        while i < len(url):
            blob = blob + url[i]
            i = i + 3
        blob = stored_token + blob
        # 2. Hash it
        hash = hashlib.sha256(blob.encode()).hexdigest()
        # 3. Compare the two hashes
        if token == hash:
            equal_hashed_token = True
            print("Equal hashes get_users_messages_by_token")
        ########################################################################
        if equal_hashed_token:
            result = database_helper.get_user_messages_by_token(stored_token)
            if result==None:
                return jsonify({'success' : False, 'message' : "No message with requested token"})
            return jsonify(result)
        else:
            return jsonify({'success' : False, 'message' : "Hashes not equals get_user_messages_by_token"})
    else:
        return jsonify({'success' : False, 'message' : "Token has to be provided"})



@app.route('/get/messages/by_email', methods = ['POST'])
def get_user_messages_by_email():
    data = request.get_json()
    token = data['token']
    email = data['email']
    if token != None:
        authentication_data = database_helper.get_email_logged_user()
        stored_token = authentication_data['token']
        equal_hashed_token = False
        ########################## Token verification ##########################
        # 1. Recreate the blob using the stored token
        blob = ""
        i = 0
        while i < len(email):
            blob = blob + email[i]
            i = i + 3
        blob = stored_token + blob
        # 2. Hash it
        hash = hashlib.sha256(blob.encode()).hexdigest()
        # 3. Compare the two hashes
        if token == hash:
            equal_hashed_token = True
            print("Equal hashes get_users_data_by_token")
        ########################################################################
        if equal_hashed_token:
            if email != None:
                result = database_helper.get_user_messages_by_email(email)
                if result==None:
                    return jsonify({'success' : False, 'message' : "No message with requested email"})
                return jsonify(result)
            else:
                return jsonify({'success' : False, 'message' : "Email has to be provided"})
        else:
            return jsonify({'success' : False, 'message' : "Hashes not equal get_user_messages_by_email"})
    else:
        return jsonify({'success' : False, 'message' : "You are not signed in."})



@app.route('/post_message', methods = ['POST'])
def post_message():
    data = request.get_json()
    print(data)
    token = data['token']
    message = data['message']
    dest_email = data['email']
    place = data['place']
    authentication_data = database_helper.get_email_logged_user()
    stored_token = authentication_data['token']
    sender_mail = database_helper.get_email_by_token(stored_token)
    sender_mail = sender_mail[0]
    equal_hashed_token = False
    ########################## Token verification ##########################
    # 1. Recreate the blob using the stored token
    blob = ""
    if dest_email != None:
        i = 0
        while i < len(dest_email):
            blob = blob + dest_email[i]
            i = i + 3
    i = 0
    while i < len(message):
        blob = blob + message[i]
        i = i + 3
    blob = stored_token + blob
    # 2. Hash it
    hash = hashlib.sha256(blob.encode()).hexdigest()
    # 3. Compare the two hashes
    if token == hash:
        equal_hashed_token = True
        print("Equal hashes get_users_data_by_token")
    ########################################################################
    if dest_email==None:
        dest_email = sender_mail
    if stored_token != None and dest_email != None:
        if equal_hashed_token:
            if database_helper.check_if_email_exists(sender_mail) and database_helper.check_if_email_exists(dest_email):
                success_post = database_helper.post_message(sender_mail, message, dest_email, place)
                if success_post:
                    return jsonify({'success' : True, 'message' : "Message posted succesfully"})
                else:
                    return jsonify({'success' : False, 'message' : "Something went wrong posting the message"})
            else:
                    return jsonify({'success' : False, 'message' : "Provided token or email do not exist"})
        else:
            return jsonify({'success' : False, 'message' : "Hashes not equal in post_message"})
    else:
        return jsonify({'success' : False, 'message' : "Token and destination email cannot be void"})



#to get the socket
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


################################################################################
#                            Geolocation                                       #
#   Descrip: Function that gets current location                               #
#   Return: json with information related to the inputted                      #
#           latitude and longitude                                             #
################################################################################
@app.route('/get/position', methods = ['POST'])
def getPosition():
    data = request.get_json()
    lat = data['lat']
    long = data['long']
    resp = requests.get("https://geocode.xyz/" + lat + "," + long + "?json=1&auth=558584188059089175329x4704")
    json = resp.json()
    return json



@app.route('/delete_message', methods = ['POST'])
def delete_message():
    data = request.get_json()
    idMessage = data['id']
    result = database_helper.deleteOwnMessage(idMessage)
    if result:
        return jsonify({'success' : True, 'message' : 'Message succesfully deleted'})
    else :
        return jsonify({'success' : False, 'message' : "Something went wrong deleting the message"})





#create a new form to enter the email
class EmailForm(Form):
    email = StringField('Email', validators=[DataRequired(), Email(), Length(min=6, max=60)])


################################################################################
#                            Password reset                                    #
#   Descrip: password reset using email recovery                               #
################################################################################
@app.route('/reset_password', methods = ['GET', 'POST'])
def resetPswd() :
    form = EmailForm()
    if form.validate_on_submit():
        emailDest = form.email.data
        if database_helper.check_if_email_exists(emailDest):
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
            ######################## New password hashing ##########################
            # 1. Find the salt
            resultSalt= database_helper.get_users_salt(emailDest)
            salt = resultSalt['salt']
            # 2. Append salt to the password
            passwordSecure = password + salt
            # 3. Hash the password and storing
            passwordSecure = bcrypt.generate_password_hash(passwordSecure).decode('utf-8')
            password_changed = database_helper.change_password(emailDest, passwordSecure, salt)
            ########################################################################
            if password_changed:
                message = """\
Dear user,
Your new password is : """+ password +"""

The Twidder team"""
                msg = MIMEText(message)
                msg['To'] = email.utils.formataddr((emailDest, emailDest))
                msg['From'] = email.utils.formataddr(('Twidder team', 'noreply.twidder.liu@gmail.com'))
                msg['Subject'] = 'New Twidder password'
                try:
                    # --- send the email ---
                    server = smtplib.SMTP('smtp.gmail.com', 587)
                    server.starttls() #enable security
                    server.login ('noreply.twidder.liu@gmail.com', 'liuTDDD97!')  #login and pswd of the email account
                    server.set_debuglevel(True) # Dump communication with the receiving server straight to the console.
                    server.sendmail('noreply.twidder.liu@gmail.com', [emailDest], msg.as_string())
                    flash("An email has been sending to you.", 'success')
                    #return redirect(url_for('root'))
                except smtplib.SMTPException:
                    flash("Error: unable to send email", 'error')
                finally:
                    server.quit()
            else:
                flash("Something went wrong changing the password", 'error')
        else :
            flash("Your email does not exist in our database.", 'error')
    return render_template('reset_pswd.html', form=form)



#######Run the server#######
if __name__ == '__main__':
    print("Server iniciated with url: \n\thttp://localhost:5000/\n")
    http_server = WSGIServer(('',5000), app, handler_class=WebSocketHandler)
    http_server.serve_forever()
