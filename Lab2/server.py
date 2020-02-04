# ##############################################################################
#                            server.py                                         #
# This file shall contain all the server side remote procedures,implemented    #
# using Python and Flask                                                       #
################################################################################

from flask import Flask
import database_helper
import json
import jsonify



app = Flask(__name__)

@app.route('/hello')
def hello_world():
    return 'Hello, World!'


@app.route('/sign_in')
def sign_in(email, password):
    boolean_success = database_helper.check_user(email, password)
    return "You are at sign in"







if __name__ == '__main__':
    app.run()
