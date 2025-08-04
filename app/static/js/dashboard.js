// Dashboard specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Animate stats cards on load
    const statsCards = document.querySelectorAll('.stats-card');
    statsCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.5s ease';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        }, index * 100);
    });

    // Add enhanced click handlers for action buttons
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const action = this.getAttribute('title');
            
            // Add enhanced ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.8)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.width = size + 'px';
            ripple.style.height = size + 'px';
            ripple.style.pointerEvents = 'none';
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
        
        // Add hover sound effect (optional)
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.1)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add intersection observer for card animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.invoice-card').forEach(card => {
        cardObserver.observe(card);
    });
});

// Enhanced refresh invoices function
function refreshInvoices() {
    const refreshBtn = document.querySelector('[onclick="refreshInvoices()"]');
    const icon = refreshBtn.querySelector('i');
    const cards = document.querySelectorAll('.invoice-card');
    
    // Add spinning animation
    icon.style.animation = 'spin 1s linear infinite';
    refreshBtn.disabled = true;
    refreshBtn.style.opacity = '0.7';
    
    // Add loading shimmer to cards
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0.5';
            card.style.transform = 'scale(0.98)';
        }, index * 50);
    });
    
    // Simulate refresh (in real app, this would be an AJAX call)
    setTimeout(() => {
        icon.style.animation = '';
        refreshBtn.disabled = false;
        refreshBtn.style.opacity = '1';
        
        // Restore cards with animation
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
                card.style.animation = 'bounce 0.6s ease';
            }, index * 100);
        });
        
        showToast('Invoices refreshed successfully!', 'success');
    }, 1500);
}

// Enhanced toast notification function
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.zIndex = '9999';
    toast.style.minWidth = '300px';
    toast.style.borderRadius = '12px';
    toast.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)';
    toast.style.backdropFilter = 'blur(10px)';
    toast.style.animation = 'slideInRight 0.3s ease';
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-check-circle" style="color: #10b981;"></i>
            ${message}
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds with animation
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }
    }, 3000);
}

// Add CSS for enhanced animations
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);