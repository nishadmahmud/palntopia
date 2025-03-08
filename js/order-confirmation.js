document.addEventListener('DOMContentLoaded', function() {
    const lastOrder = JSON.parse(localStorage.getItem('lastOrder'));
    
    if (lastOrder) {
        document.getElementById('order-number').textContent = lastOrder.orderNumber;
        document.getElementById('order-date').textContent = new Date(lastOrder.orderDate).toLocaleDateString();
        document.getElementById('payment-method').textContent = lastOrder.payment === 'bkash' ? 'bKash' : 'Cash on Delivery';
        document.getElementById('order-total').textContent = `TK ${formatPrice(lastOrder.total)}`;
    } else {
        window.location.href = '/';
    }

    function formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}); 