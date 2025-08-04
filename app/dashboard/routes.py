from flask import render_template
from flask import request, redirect, url_for, flash
from app.email import send_email
from flask_login import login_required, current_user
from app.models import Client, Invoice
from datetime import datetime
from sqlalchemy import extract, func , case
from . import dashboard  # ✅ this is how you use the already created blueprint
import os
from app import db
@dashboard.route('/')
@login_required
def index():
    user_id = current_user.id

    total_clients = Client.query.filter_by(user_id=user_id).count()
    total_invoices = Invoice.query.filter_by(user_id=user_id).count()
    paid_invoices = Invoice.query.filter_by(user_id=user_id, status='paid').count()
    unpaid_invoices = total_invoices - paid_invoices
    recent_invoices = Invoice.query.filter_by(user_id=user_id).order_by(Invoice.issue_date.desc()).limit(5).all()

    return render_template('dashboard.html',
        total_clients=total_clients,
        total_invoices=total_invoices,
        paid_invoices=paid_invoices,
        unpaid_invoices=unpaid_invoices,
        recent_invoices=recent_invoices
    )
@dashboard.route('/send-reminder/<int:invoice_id>', methods=['POST'])
@login_required
def send_reminder(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)

    if invoice.user_id != current_user.id:
        flash("You are not authorized to send a reminder for this invoice.", "danger")
        return redirect(url_for('dashboard.index'))

    client = invoice.client
    if not client.email:
        flash("Client does not have a valid email.", "danger")
        return redirect(url_for('dashboard.index'))

    subject = f"Payment Reminder for Invoice #{invoice.id}"
    body = f"""
    Hello {client.name},

    This is a reminder that your invoice #{invoice.id} is still unpaid.

    Amount Due: ${invoice.total_amount}
    Due Date: {invoice.due_date.strftime('%B %d, %Y')}

    Please make the payment as soon as possible.

    Regards,
    Mini Invoice SaaS
    """

    try:
        send_email(
            subject=subject,
            sender=os.getenv('MAIL_DEFAULT_SENDER'),
            recipients=[client.email],
            text_body=body,
            html_body=body  # you can use a Jinja2 HTML template if you prefer
        )
        flash("Reminder email sent successfully.", "success")
    except Exception as e:
        flash(f"Failed to send email: {str(e)}", "danger")

    return redirect(url_for('dashboard.index'))





@dashboard.route('/reports')
@login_required
def reports():
    user_id = current_user.id

    # Total revenue from paid invoices
    total_revenue = db.session.query(
        func.sum(Invoice.total_amount)
    ).filter_by(user_id=user_id, status='paid').scalar() or 0

    # Revenue for current month
    now = datetime.utcnow()
    revenue_this_month = db.session.query(
        func.sum(Invoice.total_amount)
    ).filter(
        Invoice.user_id == user_id,
        Invoice.status == 'paid',
        extract('month', Invoice.issue_date) == now.month,
        extract('year', Invoice.issue_date) == now.year
    ).scalar() or 0

    # Unpaid and overdue counts
    unpaid_count = Invoice.query.filter_by(user_id=user_id, status='unpaid').count()
    overdue_count = Invoice.query.filter(
        Invoice.user_id == user_id,
        Invoice.status == 'unpaid',
        Invoice.due_date < datetime.utcnow()
    ).count()

    # Invoice status counts
    paid_count = Invoice.query.filter_by(user_id=user_id, status='paid').count()
    invoice_status_counts = {
        'paid': paid_count,
        'unpaid': unpaid_count,
        'overdue': overdue_count
    }

    # Top clients (by revenue)
    top_clients = db.session.query(
        Client.name,
        func.sum(Invoice.total_amount).label('total_paid')
    ).join(Invoice).filter(
        Invoice.user_id == user_id,
        Invoice.status == 'paid'
    ).group_by(Client.name).order_by(func.sum(Invoice.total_amount).desc()).limit(3).all()

    # Monthly summary
    monthly_summary = db.session.query(
    func.to_char(Invoice.issue_date, 'Month YYYY').label('month_name'),
    func.count(Invoice.id).label('total'),
    func.sum(Invoice.total_amount).label('revenue'),
    func.sum(case((Invoice.status == 'paid', 1), else_=0)).label('paid'),
    func.sum(case((Invoice.status == 'unpaid', 1), else_=0)).label('unpaid')
    ).filter_by(user_id=user_id).group_by('month_name').order_by('month_name').all()
    return render_template('reports.html',
        total_revenue=total_revenue,
        revenue_this_month=revenue_this_month,
        unpaid_count=unpaid_count,
        overdue_count=overdue_count,
        invoice_status_counts=invoice_status_counts,
        top_clients=top_clients,
        monthly_summary=monthly_summary
    )