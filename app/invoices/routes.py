from flask import render_template, redirect, url_for, flash, request, make_response
from flask_login import login_required, current_user
from . import invoices
from .forms import InvoiceForm
from app import db, mail
from app.models import Client, Invoice, LineItem
from datetime import datetime
from weasyprint import HTML
from flask_mail import Message
import os
from threading import Thread
from flask import current_app
# Async email sender

def send_async_email(app, msg):
    with app.app_context():
        mail.send(msg)

def send_email(subject, sender, recipients, text_body, html_body, attachments=None, sync=False):
    msg = Message(subject, sender=sender, recipients=recipients)
    msg.body = text_body
    msg.html = html_body
    if attachments:
        for attachment in attachments:
            msg.attach(*attachment)
    if sync:
        mail.send(msg)
    else:
        Thread(target=send_async_email, args=(current_app._get_current_object(), msg)).start()

@invoices.route('/create', methods=['GET', 'POST'])
@login_required
def create_invoice():
    form = InvoiceForm()
    form.client_id.choices = [(client.id, client.name) for client in Client.query.filter_by(user_id=current_user.id)]

    if form.validate_on_submit():
        invoice = Invoice(
            user_id=current_user.id,
            client_id=form.client_id.data,
            issue_date=form.issue_date.data,
            due_date=form.due_date.data
        )

        total = 0
        for item_form in form.line_items.entries:
            quantity = item_form.form.quantity.data
            unit_price = item_form.form.unit_price.data
            item_total = quantity * unit_price
            total += item_total

            line_item = LineItem(
                description=item_form.form.description.data,
                quantity=quantity,
                unit_price=unit_price,
                total=item_total
            )
            invoice.line_items.append(line_item)

        invoice.total_amount = total
        db.session.add(invoice)
        db.session.commit()
        flash('Invoice created successfully!', 'success')
        return redirect(url_for('invoices.create_invoice'))

    if request.method == 'POST' and not form.validate():
        flash('Please correct the errors in the form.', 'danger')
        print("Form Errors:", form.errors)

    return render_template('create_invoice.html', form=form)


@invoices.route('/list')
@login_required
def list_invoices():
    status_filter = request.args.get('status', 'all')
    query = Invoice.query.filter_by(user_id=current_user.id)

    if status_filter == 'paid':
        query = query.filter_by(status='paid')
    elif status_filter == 'unpaid':
        query = query.filter_by(status='unpaid')
    elif status_filter == 'overdue':
        query = query.filter(Invoice.due_date < datetime.today(), Invoice.status == 'unpaid')

    invoices_list = query.order_by(Invoice.due_date.desc()).all()
    return render_template('invoice_list.html', invoices=invoices_list, status=status_filter)


@invoices.route('/mark-paid/<int:invoice_id>', methods=['POST'])
@login_required
def mark_invoice_paid(invoice_id):
    invoice = Invoice.query.filter_by(id=invoice_id, user_id=current_user.id).first_or_404()
    invoice.status = 'paid'
    db.session.commit()
    flash('Invoice marked as paid.', 'success')
    return redirect(url_for('invoices.list_invoices'))


@invoices.route('/view/<int:invoice_id>')
@login_required
def view_invoice(invoice_id):
    invoice = Invoice.query.filter_by(id=invoice_id, user_id=current_user.id).first_or_404()
    return render_template('view_invoice.html', invoice=invoice)


@invoices.route('/pdf/<int:invoice_id>')
@login_required
def download_pdf(invoice_id):
    invoice = Invoice.query.filter_by(id=invoice_id, user_id=current_user.id).first_or_404()
    rendered = render_template('pdf_template.html', invoice=invoice)
    pdf = HTML(string=rendered).write_pdf()
    response = make_response(pdf)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = f'inline; filename=Your_Invoice_{invoice.id}.pdf'
    return response


@invoices.route('/email/<int:invoice_id>', methods=['POST'])
@login_required
def email_invoice(invoice_id):
    invoice = Invoice.query.filter_by(id=invoice_id, user_id=current_user.id).first_or_404()

    if not invoice.client.email:
        flash("Client has no email address.", "danger")
        return redirect(url_for('invoices.view_invoice', invoice_id=invoice.id))

    html_body = render_template('email_body.html', invoice=invoice)
    text_body = render_template('email_body.txt', invoice=invoice)
    rendered_pdf = render_template('pdf_template.html', invoice=invoice)
    pdf = HTML(string=rendered_pdf).write_pdf()

    send_email(
        subject=f"Invoice #{invoice.id}",
        sender=os.getenv('MAIL_DEFAULT_SENDER'),
        recipients=[invoice.client.email],
        text_body=text_body,
        html_body=html_body,
        attachments=[(f"Your_Invoice_{invoice.id}.pdf", "application/pdf", pdf)]
    )

    flash("Invoice emailed successfully.", "success")
    return redirect(url_for('invoices.view_invoice', invoice_id=invoice.id))


@invoices.route('/edit/<int:invoice_id>', methods=['GET', 'POST'])
@login_required
def edit_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)

    if invoice.user_id != current_user.id:
        flash('Unauthorized access', 'danger')
        return redirect(url_for('invoices.list_invoices'))

    form = InvoiceForm(obj=invoice)
    form.client_id.choices = [(client.id, client.name) for client in Client.query.filter_by(user_id=current_user.id)]

    if request.method == 'POST' and form.validate_on_submit():
        invoice.client_id = form.client_id.data
        invoice.issue_date = form.issue_date.data
        invoice.due_date = form.due_date.data

        invoice.line_items.clear()
        total = 0
        for item_form in form.line_items.entries:
            quantity = item_form.form.quantity.data
            unit_price = item_form.form.unit_price.data
            item_total = quantity * unit_price
            total += item_total
            line_item = LineItem(
                description=item_form.form.description.data,
                quantity=quantity,
                unit_price=unit_price,
                total=item_total
            )
            invoice.line_items.append(line_item)

        invoice.total_amount = total
        db.session.commit()
        flash('Invoice updated successfully!', 'success')
        return redirect(url_for('invoices.view_invoice', invoice_id=invoice.id))

    return render_template('edit_invoice.html', form=form, invoice=invoice)


@invoices.route('/delete/<int:invoice_id>', methods=['POST'])
@login_required
def delete_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)

    if invoice.user_id != current_user.id:
        flash('Unauthorized', 'danger')
        return redirect(url_for('invoices.list_invoices'))

    db.session.delete(invoice)
    db.session.commit()
    flash('Invoice deleted!', 'success')
    return redirect(url_for('invoices.list_invoices'))