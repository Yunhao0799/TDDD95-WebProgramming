# ##############################################################################
#                            server.py                                         #
# This file shall contain all the server side remote procedures,implemented    #
# using Python and Flask                                                       #
################################################################################

from flask import Flask
import database_helper
import json


app = Flask(__name__)

app.debug = True


@app.route('/hello')
def hello_world():
    return 'Hello, World!'


@app.route('/sign_in/<email>/<password>', methods = ['GET'])
def sign_in(email, password):
    boolean_success = database_helper.check_user_password(email, password)
    if boolean_success == True:
        return "You are at sign in"
    else:
        return "Wrong password"







if __name__ == '__main__':
    app.run()
