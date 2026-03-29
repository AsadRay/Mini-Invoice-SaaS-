import os

from dotenv import load_dotenv

load_dotenv()
class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    IMAP_SERVER = os.getenv('IMAP_SERVER')

    IMAP_PORT = int(os.getenv('IMAP_PORT'))

    MAIL_SERVER = os.getenv('MAIL_SERVER')

    MAIL_PORT = int(os.getenv('MAIL_PORT'))

    MAIL_USERNAME = os.getenv('MAIL_USERNAME')

    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')

    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'False') == 'True'   # → False

    MAIL_USE_SSL = os.getenv('MAIL_USE_SSL','True') == 'True'

    MAIL_ASCII_ATTACHMENTS = os.getenv('MAIL_ASCII_ATTACHMENTS') == 'True'

    ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL')