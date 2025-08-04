import random
from flask import render_template, redirect, url_for, flash, request, session
from flask_login import login_user, logout_user, login_required, current_user
from . import auth
from .forms import RegisterForm, LoginForm, VerificationForm  # You need to create VerificationForm
from app.models import User
from app import db
from sqlalchemy.exc import IntegrityError
from app.email import send_email
import os

@auth.route('/')
def home():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard.index'))
    return redirect(url_for('auth.login'))

@auth.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        email = form.email.data
        name = form.name.data
        password = form.password.data

        # Check if user already exists
        if User.query.filter_by(email=email).first():
            flash('Email already exists.', 'danger')
            return redirect(url_for('auth.register'))

        # Generate 6-digit code
        code = str(random.randint(100000, 999999))
        session['reg_data'] = {'name': name, 'email': email, 'password': password}
        session['verification_code'] = code

        # Send the code to email
        send_email(
            subject="Email Verification Code",
            sender=os.getenv("MAIL_DEFAULT_SENDER"),
            recipients=[email],
            text_body=f"Your verification code is: {code}",
            html_body=render_template('verify_code_email.html', code=code)
        )

        return redirect(url_for('auth.verify_email'))

    return render_template('register.html', form=form)

@auth.route('/verify-email', methods=['GET', 'POST'])
def verify_email():
    form = VerificationForm()
    if form.validate_on_submit():
        input_code = form.code.data
        stored_code = session.get('verification_code')
        reg_data = session.get('reg_data')

        if not reg_data or input_code != stored_code:
            flash('Invalid or expired verification code.', 'danger')
            return redirect(url_for('auth.register'))

        # Create user
        user = User(name=reg_data['name'], email=reg_data['email'])
        user.set_password(reg_data['password'])
        try:
            db.session.add(user)
            db.session.commit()
            session.pop('verification_code')
            session.pop('reg_data')
            flash('Registration successful. Please login.', 'success')
            return redirect(url_for('auth.login'))
        except IntegrityError:
            db.session.rollback()
            flash('Something went wrong.', 'danger')
            return redirect(url_for('auth.register'))

    return render_template('verify_email.html', form=form)

@auth.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and user.check_password(form.password.data):
            login_user(user)
            flash('Logged in successfully.', 'success')
            return redirect(url_for('dashboard.index'))
        else:
            flash('Invalid email or password.', 'danger')
    return render_template('login.html', form=form)

@auth.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('auth.login'))
