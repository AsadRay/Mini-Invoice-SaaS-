document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.invoice-card').forEach(card => {
        card.addEventListener('click', function (e) {
            // Prevent clicks on buttons/links inside the card from triggering the card redirect
            if (e.target.closest('.action-btn') || e.target.tagName === 'A' || e.target.closest('form')) return;

            const href = this.getAttribute('data-href');
            if (href) {
                window.location.href = href;
            }
        });
    });
});
