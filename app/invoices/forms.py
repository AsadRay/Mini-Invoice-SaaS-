from flask_wtf import FlaskForm
from wtforms import StringField, IntegerField, FloatField, FieldList, FormField, SubmitField, DateField, SelectField
from wtforms.validators import DataRequired, Optional, NumberRange

class LineItemForm(FlaskForm):
    # ✅ Disable CSRF for nested form only
    class Meta:
        csrf = False

    description = StringField('Description', validators=[DataRequired()])
    quantity = IntegerField('Quantity', validators=[DataRequired(), NumberRange(min=1)])
    unit_price = FloatField('Unit Price', validators=[DataRequired(), NumberRange(min=0.0)])

class InvoiceForm(FlaskForm):
    client_id = SelectField('Client', coerce=int, validators=[DataRequired()])
    issue_date = DateField('Issue Date', validators=[DataRequired()])
    due_date = DateField('Due Date', validators=[DataRequired()])
    line_items = FieldList(FormField(LineItemForm), min_entries=1)
    submit = SubmitField('Create Invoice')
