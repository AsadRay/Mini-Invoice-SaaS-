from flask import Blueprint

auth = Blueprint('auth', __name__)

from . import routes  # Import routes after defining blueprint
