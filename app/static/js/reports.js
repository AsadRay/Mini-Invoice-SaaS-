(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', function() {
        // Get invoice status data from template
        var invoiceStatusData = {
            paid: {{ invoice_status_counts['paid'] }},
            unpaid: {{ invoice_status_counts['unpaid'] }},
            overdue: {{ invoice_status_counts['overdue'] }}
        };
        
        var total = invoiceStatusData.paid + invoiceStatusData.unpaid + invoiceStatusData.overdue;
        
        if (total > 0) {
            var paidPercent = (invoiceStatusData.paid / total) * 100;
            var unpaidPercent = (invoiceStatusData.unpaid / total) * 100;
            var overduePercent = (invoiceStatusData.overdue / total) * 100;

            var paidBar = document.getElementById('paidBar');
            var unpaidBar = document.getElementById('unpaidBar');
            var overdueBar = document.getElementById('overdueBar');

            if (paidBar) paidBar.style.setProperty('--status-width', paidPercent + '%');
            if (unpaidBar) unpaidBar.style.setProperty('--status-width', unpaidPercent + '%');
            if (overdueBar) overdueBar.style.setProperty('--status-width', overduePercent + '%');
        }
        
        // Add hover effects to chart sections
        var chartSections = document.querySelectorAll('.legend-item');
        chartSections.forEach(function(item) {
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateX(10px) scale(1.05)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.transform = 'translateX(0) scale(1)';
            });
        });

        // Intersection Observer for animations
        var observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                }
            });
        }, observerOptions);
        
        // Observe all animated elements
        document.querySelectorAll('.summary-card, .section-container, .client-item, .status-item, .status-bar').forEach(function(el) {
            observer.observe(el);
        });
    });
})();