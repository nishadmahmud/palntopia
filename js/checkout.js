document.addEventListener('DOMContentLoaded', function() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const checkoutItemsContainer = document.getElementById('checkout-items');
    const shippingForm = document.getElementById('shipping-form');
    const placeOrderBtn = document.getElementById('place-order-btn');
    let appliedPromo = JSON.parse(localStorage.getItem('appliedPromo')) || null;

    function displayCheckoutItems() {
        checkoutItemsContainer.innerHTML = '';
        
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'flex justify-between items-center';
            itemElement.innerHTML = `
                <div class="flex items-center space-x-4">
                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded">
                    <div>
                        <h3 class="font-medium">${item.name}</h3>
                        <p class="text-sm text-gray-600">Quantity: ${item.quantity}</p>
                    </div>
                </div>
                <span class="font-medium">TK ${formatPrice(item.price * item.quantity)}</span>
            `;
            checkoutItemsContainer.appendChild(itemElement);
        });

        updateOrderSummary();
    }

    function updateOrderSummary() {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 10000 ? 0 : 500;
        const discount = appliedPromo ? (subtotal * appliedPromo.discount) : 0;
        const total = subtotal + shipping - discount;

        document.getElementById('checkout-subtotal').textContent = `TK ${formatPrice(subtotal)}`;
        document.getElementById('checkout-shipping').textContent = shipping === 0 ? 'Free' : `TK ${formatPrice(shipping)}`;
        document.getElementById('checkout-discount').textContent = `-TK ${formatPrice(discount)}`;
        document.getElementById('checkout-total').textContent = `TK ${formatPrice(total)}`;
    }

    function formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function validateForm() {
        const inputs = shippingForm.querySelectorAll('input[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('border-red-500');
            } else {
                input.classList.remove('border-red-500');
            }
        });

        return isValid;
    }

    // bKash Payment Integration
    const bKashPayment = {
        init() {
            const paymentMethod = document.querySelector('input[name="payment"][value="bkash"]');
            paymentMethod.addEventListener('change', this.showBkashForm.bind(this));
        },

        showBkashForm() {
            const bkashFormHTML = `
                <div id="bkash-form" class="mt-4 space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">bKash Number</label>
                        <input type="tel" required class="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent" pattern="01[3-9][0-9]{8}">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Transaction ID</label>
                        <input type="text" required class="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent">
                    </div>
                </div>
            `;

            const paymentMethodContainer = document.querySelector('.payment-method');
            const existingForm = document.getElementById('bkash-form');
            
            if (!existingForm) {
                paymentMethodContainer.insertAdjacentHTML('beforeend', bkashFormHTML);
            }
        },

        async processPayment(orderData) {
            const bkashNumber = document.querySelector('#bkash-form input[type="tel"]')?.value;
            const transactionId = document.querySelector('#bkash-form input[type="text"]')?.value;

            if (!bkashNumber || !transactionId) {
                throw new Error('Please provide bKash payment details');
            }

            // Here you would typically verify the transaction with bKash API
            return {
                paymentId: transactionId,
                status: 'success',
                method: 'bkash'
            };
        }
    };

    // Initialize bKash payment
    bKashPayment.init();

    // Update the placeOrder function to handle bKash payments
    placeOrderBtn.addEventListener('click', async () => {
        if (!validateForm()) {
            alert('Please fill in all required fields');
            return;
        }

        const formData = new FormData(shippingForm);
        const orderData = {
            items: cart,
            shipping: Object.fromEntries(formData),
            payment: document.querySelector('input[name="payment"]:checked').value,
            total: parseFloat(document.getElementById('checkout-total').textContent.replace('TK ', '').replace(',', '')),
            orderDate: new Date().toISOString()
        };

        try {
            if (orderData.payment === 'bkash') {
                const paymentResult = await bKashPayment.processPayment(orderData);
                orderData.paymentDetails = paymentResult;
            }

            // Send order to backend
            console.log('Order placed:', orderData);
            
            // Clear cart and promo
            localStorage.removeItem('cart');
            localStorage.removeItem('appliedPromo');
            
            // Save order details for confirmation page
            localStorage.setItem('lastOrder', JSON.stringify({
                orderNumber: generateOrderNumber(),
                ...orderData
            }));
            
            // Redirect to order confirmation
            window.location.href = '/pages/order-confirmation.html';
        } catch (error) {
            console.error('Error placing order:', error);
            alert(error.message || 'There was an error placing your order. Please try again.');
        }
    });

    function generateOrderNumber() {
        return 'ORD-' + Date.now().toString(36).toUpperCase();
    }

    // Initialize checkout page
    displayCheckoutItems();
}); 