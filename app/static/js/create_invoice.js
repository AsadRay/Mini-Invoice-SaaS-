   let itemCounter = document.querySelectorAll('#line-items .border').length;

    document.addEventListener('DOMContentLoaded', function() {
        // Calculate initial total
        calculateTotal();

        // Form submission handling
        const form = document.getElementById('invoiceForm');
        const submitBtn = document.getElementById('submitBtn');

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;
            
            // Validate form
            if (validateForm()) {
                // Simulate form processing (replace with actual submission)
                setTimeout(() => {
                    form.submit();
                }, 1000);
            } else {
                // Reset button state
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
            }
        });

        // Add input event listeners for real-time calculation
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('input', calculateTotal);
        });
    });

    function addLineItem() {
        const lineItemsContainer = document.getElementById('line-items');
        const newItemIndex = itemCounter;
        itemCounter++;

        const newItem = document.createElement('div');
        newItem.className = 'border p-3 mb-3';
        newItem.setAttribute('data-item-index', newItemIndex);
        
        newItem.innerHTML = `
            <div class="mb-2">
                <label>
                    Description
                </label>
                <input type="text" name="line_items-${newItemIndex}-description" class="form-control" placeholder="Enter item description..." required>
            </div>
            <div class="mb-2">
                <label>
                    Quantity
                </label>
                <input type="number" name="line_items-${newItemIndex}-quantity" class="form-control" placeholder="1" min="1" step="1" value="1" onchange="calculateTotal()" required>
            </div>
            <div class="mb-2">
                <label>
                    Unit Price
                </label>
                <input type="number" name="line_items-${newItemIndex}-unit_price" class="form-control" placeholder="0.00" min="0" step="0.01" onchange="calculateTotal()" required>
            </div>
        `;

        lineItemsContainer.appendChild(newItem);
        
        // Add animation
        newItem.style.opacity = '0';
        newItem.style.transform = 'translateY(20px)';
        setTimeout(() => {
            newItem.style.transition = 'all 0.3s ease';
            newItem.style.opacity = '1';
            newItem.style.transform = 'translateY(0)';
        }, 10);

        calculateTotal();
        updateItemNumbers();
    }

    function removeLineItem(button) {
        const lineItem = button.closest('.border');
        
        // Add removal animation
        lineItem.style.transition = 'all 0.3s ease';
        lineItem.style.opacity = '0';
        lineItem.style.transform = 'translateX(-100%)';
        
        setTimeout(() => {
            lineItem.remove();
            updateItemNumbers();
            calculateTotal();
        }, 300);
    }

    function updateItemNumbers() {
        const lineItems = document.querySelectorAll('.border');
        lineItems.forEach((item, index) => {
            const numberElement = item.querySelector('.line-item-number');
            const titleElement = item.querySelector('.line-item-title');
            if (numberElement) numberElement.textContent = index + 1;
            if (titleElement) {
                const titleText = titleElement.childNodes[titleElement.childNodes.length - 1];
                if (titleText) titleText.textContent = ` Item ${index + 1}`;
            }
        });
    }

    function calculateTotal() {
        let total = 0;
        const lineItems = document.querySelectorAll('.border');
        
        lineItems.forEach(item => {
            const quantity = parseFloat(item.querySelector('input[name*="quantity"]')?.value || 0);
            const unitPrice = parseFloat(item.querySelector('input[name*="unit_price"]')?.value || 0);
            total += quantity * unitPrice;
        });

        const totalAmountElement = document.getElementById('totalAmount');
        if (totalAmountElement) {
            totalAmountElement.textContent = total.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        // Update total preview visibility
        const totalPreview = document.getElementById('totalPreview');
        if (total > 0) {
            totalPreview.style.display = 'block';
        } else {
            totalPreview.style.display = 'none';
        }
    }

    function validateForm() {
        const requiredFields = document.querySelectorAll('input[required], select[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#ef4444';
                isValid = false;
            } else {
                field.style.borderColor = '#e5e7eb';
            }
        });

        if (!isValid) {
            showToast('Please fill in all required fields', 'error');
        }

        return isValid;
    }

    // Toast notification function
    function showToast(message, type = 'info') {
        const toastColors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${toastColors[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            font-weight: 500;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Add CSS for toast animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);