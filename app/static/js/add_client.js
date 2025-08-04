// Add Client specific JavaScript
document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const inputs = form.querySelectorAll('.form-control');
    const submitBtn = form.querySelector('.btn-primary');

    // Add enhanced form field interactions
    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function () {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });

        input.addEventListener('input', function () {
            validateField(this);
        });

        if (input.tagName === 'TEXTAREA') {
            addCharacterCounter(input);
        }
    });

    // Enhanced form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        showLoadingState();

        let isValid = true;
        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });

        if (isValid) {
            const currentForm = this; // ✅ fix this context issue

            setTimeout(() => {
                currentForm.submit(); // ✅ works correctly now
            }, 1500);
        } else {
            hideLoadingState();
            showErrorMessage('Please fix the errors and try again.');
        }
    });

    animateFormElements();
});

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';

    removeFieldError(field);

    switch (fieldName) {
        case 'name':
            if (!value) {
                errorMessage = 'Name is required';
                isValid = false;
            } else if (value.length < 2) {
                errorMessage = 'Name must be at least 2 characters';
                isValid = false;
            }
            break;
        case 'email':
            if (!value) {
                errorMessage = 'Email is required';
                isValid = false;
            } else if (!isValidEmail(value)) {
                errorMessage = 'Please enter a valid email address';
                isValid = false;
            }
            break;
        case 'phone':
            if (value && !isValidPhone(value)) {
                errorMessage = 'Please enter a valid phone number';
                isValid = false;
            }
            break;
        case 'notes':
            if (value.length > 500) {
                errorMessage = 'Notes must be less than 500 characters';
                isValid = false;
            }
            break;
    }

    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        showFieldSuccess(field);
    }

    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

function showFieldError(field, message) {
    field.style.borderColor = '#ef4444';
    field.style.backgroundColor = '#fef2f2';

    let errorDiv = field.parentElement.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            color: #ef4444;
            font-size: 0.8rem;
            margin-top: 0.5rem;
            padding: 0.25rem 0.5rem;
            background: rgba(239, 68, 68, 0.1);
            border-radius: 6px;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideDown 0.3s ease;
        `;
        field.parentElement.appendChild(errorDiv);
    }
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i>${message}`;
}

function showFieldSuccess(field) {
    field.style.borderColor = '#10b981';
    field.style.backgroundColor = '#f0fdf4';
    removeFieldError(field);
}

function removeFieldError(field) {
    field.style.borderColor = '#e5e7eb';
    field.style.backgroundColor = '#fafafa';

    const errorDiv = field.parentElement.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function addCharacterCounter(textarea) {
    const maxLength = 500;
    const counter = document.createElement('div');
    counter.className = 'character-counter';
    counter.style.cssText = `
        text-align: right;
        font-size: 0.8rem;
        color: #6b7280;
        margin-top: 0.5rem;
        transition: color 0.3s ease;
    `;

    function updateCounter() {
        const remaining = maxLength - textarea.value.length;
        counter.textContent = `${textarea.value.length}/${maxLength} characters`;

        if (remaining < 50) {
            counter.style.color = '#ef4444';
        } else if (remaining < 100) {
            counter.style.color = '#f59e0b';
        } else {
            counter.style.color = '#6b7280';
        }
    }

    textarea.addEventListener('input', updateCounter);
    textarea.parentElement.appendChild(counter);
    updateCounter();
}

function showLoadingState() {
    const submitBtn = document.querySelector('.btn-primary');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        Saving Client...
    `;
    submitBtn.style.opacity = '0.8';
}

function hideLoadingState() {
    const submitBtn = document.querySelector('.btn-primary');
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
        Add Client
        <i class="fas fa-save"></i>
    `;
    submitBtn.style.opacity = '1';
}

function showErrorMessage(message) {
    const existingError = document.querySelector('.form-error');
    if (existingError) {
        existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error alert alert-danger';
    errorDiv.style.cssText = `
        margin-bottom: 1rem;
        padding: 1rem;
        border-radius: 12px;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #dc2626;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideDown 0.3s ease;
    `;
    errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i>${message}`;

    const form = document.querySelector('form');
    form.insertBefore(errorDiv, form.firstChild);

    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => errorDiv.remove(), 300);
        }
    }, 5000);
}

function animateFormElements() {
    const formGroups = document.querySelectorAll('.form-group');

    formGroups.forEach((group, index) => {
        group.style.opacity = '0';
        group.style.transform = 'translateY(20px)';
        group.style.transition = 'all 0.4s ease';

        setTimeout(() => {
            group.style.opacity = '1';
            group.style.transform = 'translateY(0)';
        }, index * 100 + 300);
    });
}

// Add animations to <head>
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-10px);
        }
    }

    .form-group.focused label {
        color: #3b82f6;
    }

    .form-control:valid {
        border-color: #10b981;
    }

    .character-counter {
        animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(style);
