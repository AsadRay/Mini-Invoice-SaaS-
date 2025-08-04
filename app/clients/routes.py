from flask import render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from . import clients
from .forms import ClientForm
from app import db
from app.models import Client

@clients.route('/add', methods=['GET', 'POST'])
@login_required
def add_client():
    form = ClientForm()
    if form.validate_on_submit():
        client = Client(
            name=form.name.data,
            email=form.email.data,
            phone=form.phone.data,
            company=form.company.data,
            notes=form.notes.data,
            user_id=current_user.id
        )
        db.session.add(client)
        db.session.commit()
        flash('Client added successfully!', 'success')
        return redirect(url_for('clients.list_clients'))
    return render_template('add_client.html', form=form)

@clients.route('/list')
@login_required
def list_clients():
    all_clients = Client.query.filter_by(user_id=current_user.id).all()
    return render_template('client_list.html', clients=all_clients)

@clients.route('/edit/<int:client_id>', methods=['GET', 'POST'])
@login_required
def edit_client(client_id):
    client = Client.query.filter_by(id=client_id, user_id=current_user.id).first_or_404()
    form = ClientForm(obj=client)
    if form.validate_on_submit():
        client.name = form.name.data
        client.email = form.email.data
        client.phone = form.phone.data
        client.company = form.company.data
        client.notes = form.notes.data
        db.session.commit()
        flash('Client updated successfully!', 'success')
        return redirect(url_for('clients.list_clients'))
    return render_template('edit_client.html', form=form, client=client)


@clients.route('/delete/<int:client_id>', methods=['POST'])
@login_required
def delete_client(client_id):
    client = Client.query.filter_by(id=client_id, user_id=current_user.id).first_or_404()
    db.session.delete(client)
    db.session.commit()
    flash('Client deleted.', 'info')
    return redirect(url_for('clients.list_clients'))
