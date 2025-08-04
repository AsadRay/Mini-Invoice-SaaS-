import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from dotenv import load_dotenv
from flask_mail import Mail
from config import Config
from flask_mail import Mail



# Load environment variables from .env
load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
login_manager.login_view = 'auth.login'
mail = Mail()

#----load_user----
from app.models import User
@login_manager.user_loader
def load_user(user_id):
    from app.models import User
    return User.query.get(int(user_id))
#-----------------
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    mail.init_app(app)
    
    # Blueprints
    from app.auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint)

    from app.clients import clients as clients_blueprint
    app.register_blueprint(clients_blueprint, url_prefix='/clients')

    from app.invoices import invoices as invoices_blueprint
    app.register_blueprint(invoices_blueprint, url_prefix='/invoices')

    from app.dashboard import dashboard as dashboard_blueprint
    app.register_blueprint(dashboard_blueprint, url_prefix='/dashboard')


    from datetime import datetime
    app.jinja_env.globals['current_time'] = datetime.today

  

    return app
