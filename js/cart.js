document.addEventListener('DOMContentLoaded', function() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const checkoutBtn = document.getElementById('checkout-btn');
    const itemTemplate = document.getElementById('cart-item-template');

    const promoInput = document.querySelector('input[placeholder="Enter code"]');
    const promoButton = promoInput.nextElementSibling;

    const promoCodes = {
        'WELCOME10': { discount: 0.10, description: '10% off' },
        'PLANT20': { discount: 0.20, description: '20% off' },
        'FREESHIP': { discount: 0, freeShipping: true, description: 'Free shipping' }
    };

    function updateCart() {
        // Clear current cart items
        while (cartItemsContainer.firstChild) {
            cartItemsContainer.removeChild(cartItemsContainer.firstChild);
        }

        if (cart.length === 0) {
            emptyCartMessage.classList.remove('hidden');
            checkoutBtn.disabled = true;
            updateSummary(0);
            return;
        }

        emptyCartMessage.classList.add('hidden');
        checkoutBtn.disabled = false;

        // Add cart items
        cart.forEach(item => {
            const cartItem = itemTemplate.content.cloneNode(true);
            const container = cartItem.querySelector('.cart-item');
            
            container.dataset.id = item.id;
            container.querySelector('img').src = item.image;
            container.querySelector('img').alt = item.name;
            container.querySelector('h3').textContent = item.name;
            container.querySelector('.quantity-input').value = item.quantity;
            container.querySelector('.item-price').textContent = `TK ${formatPrice(item.price * item.quantity)}`;

            // Add event listeners
            container.querySelector('.decrease-quantity').addEventListener('click', () => {
                updateItemQuantity(item.id, -1);
            });

            container.querySelector('.increase-quantity').addEventListener('click', () => {
                updateItemQuantity(item.id, 1);
            });

            container.querySelector('.quantity-input').addEventListener('change', (e) => {
                const newQuantity = parseInt(e.target.value);
                if (newQuantity > 0) {
                    setItemQuantity(item.id, newQuantity);
                } else {
                    e.target.value = item.quantity;
                }
            });

            container.querySelector('.remove-item').addEventListener('click', () => {
                removeItem(item.id);
            });

            cartItemsContainer.appendChild(cartItem);
        });

        updateSummary();
    }

    function updateItemQuantity(id, change) {
        const item = cart.find(item => item.id === id);
        if (item) {
            const newQuantity = item.quantity + change;
            if (newQuantity > 0) {
                item.quantity = newQuantity;
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCart();
            }
        }
    }

    function setItemQuantity(id, quantity) {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity = quantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
        }
    }

    function removeItem(id) {
        const index = cart.findIndex(item => item.id === id);
        if (index !== -1) {
            cart.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
        }
    }

    function updateSummary() {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const appliedPromo = JSON.parse(localStorage.getItem('appliedPromo'));
        
        let shipping = subtotal > 10000 ? 0 : 500;
        let discount = 0;

        if (appliedPromo) {
            if (appliedPromo.freeShipping) {
                shipping = 0;
            }
            if (appliedPromo.discount) {
                discount = subtotal * appliedPromo.discount;
            }
        }

        const total = subtotal + shipping - discount;

        document.getElementById('subtotal').textContent = `TK ${formatPrice(subtotal)}`;
        document.getElementById('shipping').textContent = shipping === 0 ? 'Free' : `TK ${formatPrice(shipping)}`;
        document.getElementById('total').textContent = `TK ${formatPrice(total)}`;

        // Add discount display if there is one
        const discountElement = document.getElementById('discount') || createDiscountElement();
        if (discount > 0) {
            discountElement.textContent = `-TK ${formatPrice(discount)}`;
            discountElement.parentElement.classList.remove('hidden');
        } else {
            discountElement.parentElement.classList.add('hidden');
        }
    }

    function createDiscountElement() {
        const container = document.createElement('div');
        container.className = 'flex justify-between hidden';
        container.innerHTML = `
            <span>Discount</span>
            <span id="discount">-TK 0</span>
        `;
        
        const summaryContainer = document.querySelector('.space-y-3');
        summaryContainer.insertBefore(container, summaryContainer.lastElementChild);
        
        return container.lastElementChild;
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 translate-y-0 ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('translate-y-[-100%]');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    function formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Initialize cart
    updateCart();

    // Checkout button
    checkoutBtn.addEventListener('click', () => {
        alert('Checkout functionality will be implemented soon!');
    });

    promoButton.addEventListener('click', () => {
        const code = promoInput.value.trim().toUpperCase();
        const promo = promoCodes[code];

        if (promo) {
            localStorage.setItem('appliedPromo', JSON.stringify({
                code: code,
                ...promo
            }));
            updateSummary();
            showNotification('Promo code applied successfully!', 'success');
        } else {
            showNotification('Invalid promo code', 'error');
        }
    });
}); 