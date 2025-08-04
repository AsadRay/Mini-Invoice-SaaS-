from flask import Blueprint

invoices = Blueprint('invoices', __name__)

from . import routes  # Import routes after defining blueprint
