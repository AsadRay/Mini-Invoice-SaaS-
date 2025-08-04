// Invoice cards specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
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

    // Enhanced click handlers for action buttons
    const actionButtons = document.querySelectorAll('.action-btn, .btn-paid');
    actionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card click
            
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
        
        // Add hover effects
        button.addEventListener('mouseenter', function() {
            if (this.classList.contains('btn-paid')) {
                this.style.transform = 'translateY(-2px) scale(1.05)';
            } else {
                this.style.transform = 'translateY(-3px) scale(1.1)';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add card hover effects
    const invoiceCards = document.querySelectorAll('.invoice-card');
    invoiceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.cursor = 'pointer';
        });
    });

    // Add success animation after form submissions
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        const cards = document.querySelectorAll('.invoice-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('success');
                setTimeout(() => {
                    card.classList.remove('success');
                }, 600);
            }, index * 100);
        });
        
        showToast('Operation completed successfully!', 'success');
    }
});

// Toast notification function
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
    
    const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
    const iconColor = type === 'success' ? '#10b981' : '#3b82f6';
    
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas ${iconClass}" style="color: ${iconColor};"></i>
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
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.invoice-card').forEach(card => {
        card.addEventListener('click', function (e) {
            // Prevent clicks on buttons/links/forms inside the card from triggering the card redirect
            if (e.target.closest('.action-btn') || 
                e.target.tagName === 'A' || 
                e.target.closest('form') ||
                e.target.tagName === 'BUTTON' ||
                e.target.closest('.invoice-actions')) {
                return;
            }

            const href = this.getAttribute('data-href');
            if (href) {
                window.location.href = href;
            }
        });
    });
});