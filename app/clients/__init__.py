from flask import Blueprint

clients = Blueprint('clients', __name__)

from . import routes  # Import routes after defining blueprint
