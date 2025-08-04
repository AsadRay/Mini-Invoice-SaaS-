from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SubmitField
from wtforms.validators import DataRequired, Optional, Email

class ClientForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired()])
    email = StringField('Email', validators=[Optional(), Email()])
    phone = StringField('Phone', validators=[Optional()])
    company = StringField('Company', validators=[Optional()])
    notes = TextAreaField('Notes', validators=[Optional()])
    submit_btn = SubmitField('Add Client')
