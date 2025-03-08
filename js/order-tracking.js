document.addEventListener('DOMContentLoaded', function() {
    const trackingForm = document.getElementById('tracking-form');
    const orderStatus = document.getElementById('order-status');
    
    // Mock order data (replace with actual backend integration)
    const mockOrders = {
        'ORD-123': {
            status: 'processing',
            estimatedDelivery: '2024-03-20',
            currentLocation: 'Dhaka Warehouse',
            updates: [
                { status: 'ordered', date: '2024-03-15', completed: true },
                { status: 'processing', date: '2024-03-16', completed: true },
                { status: 'shipped', date: '2024-03-17', completed: false },
                { status: 'delivered', date: '2024-03-20', completed: false }
            ]
        }
    };

    trackingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const orderNumber = this.querySelector('input').value.trim();
        const order = mockOrders[orderNumber];

        if (order) {
            updateOrderStatus(order);
            orderStatus.classList.remove('hidden');
        } else {
            alert('Order not found. Please check the order number and try again.');
        }
    });

    function updateOrderStatus(order) {
        const steps = orderStatus.querySelectorAll('.status-step');
        const currentStep = order.updates.findIndex(update => !update.completed);
        
        steps.forEach((step, index) => {
            const icon = step.querySelector('div');
            if (index < currentStep) {
                icon.classList.remove('bg-gray-200', 'text-gray-500');
                icon.classList.add('bg-secondary', 'text-white');
            }
        });

        document.getElementById('delivery-date').textContent = new Date(order.estimatedDelivery).toLocaleDateString();
        document.getElementById('current-location').textContent = order.currentLocation;
    }
}); 