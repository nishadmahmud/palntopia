// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu functionality
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            // Change icon between bars and times
            const icon = mobileMenuButton.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }

    // Newsletter subscription
    const newsletterForm = document.querySelector('section form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const nameInput = this.querySelector('input[type="text"]');
            const emailInput = this.querySelector('input[type="email"]');
            
            if (nameInput.value && emailInput.value) {
                alert('Thank you for subscribing to our newsletter!');
                this.reset();
            } else {
                alert('Please fill in all fields.');
            }
        });
    }

    // Add smooth scrolling for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Cart functionality
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Listen for storage changes from other tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'cart') {
            cart = JSON.parse(e.newValue || '[]');
            updateCartCount();
            updateMiniCart();
        }
    });

    function updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            if (totalItems > 0) {
                cartCount.textContent = totalItems;
                cartCount.classList.remove('hidden');
            } else {
                cartCount.textContent = '0';
                cartCount.classList.add('hidden');
            }
        }
    }

    // Mini Cart functionality
    const miniCart = document.getElementById('mini-cart');
    const cartIcon = document.querySelector('.fa-shopping-cart');
    
    function updateMiniCart() {
        const miniCartItems = document.getElementById('mini-cart-items');
        const miniCartTotal = document.getElementById('mini-cart-total');
        
        if (miniCartItems) {
            miniCartItems.innerHTML = '';
            let total = 0;
            
            cart.forEach(item => {
                total += item.price * item.quantity;
                const itemElement = document.createElement('div');
                itemElement.className = 'flex items-center justify-between py-2 border-b last:border-b-0';
                itemElement.innerHTML = `
                    <div class="flex items-center">
                        <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover rounded">
                        <div class="ml-3">
                            <h4 class="text-sm font-medium">${item.name}</h4>
                            <p class="text-sm text-gray-600">TK ${formatPrice(item.price)} × ${item.quantity} = TK ${formatPrice(item.price * item.quantity)}</p>
                            <div class="flex items-center mt-1">
                                <button class="quantity-btn minus text-gray-500 hover:text-gray-700 px-1" data-id="${item.id}">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="quantity mx-2 min-w-[20px] text-center">${item.quantity}</span>
                                <button class="quantity-btn plus text-gray-500 hover:text-gray-700 px-1" data-id="${item.id}">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <button class="remove-item text-red-500 hover:text-red-700" data-id="${item.id}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                miniCartItems.appendChild(itemElement);

                // Add event listeners for quantity buttons
                const minusBtn = itemElement.querySelector('.minus');
                const plusBtn = itemElement.querySelector('.plus');
                const removeBtn = itemElement.querySelector('.remove-item');

                minusBtn.addEventListener('click', () => updateQuantity(item.id, -1));
                plusBtn.addEventListener('click', () => updateQuantity(item.id, 1));
                removeBtn.addEventListener('click', () => removeFromCart(item.id));
            });
            
            miniCartTotal.textContent = `TK ${formatPrice(total)}`;

            // Show empty cart message if no items
            if (cart.length === 0) {
                miniCartItems.innerHTML = `
                    <div class="text-center py-4 text-gray-500">
                        Your cart is empty
                    </div>
                `;
            }
        }
    }

    function updateQuantity(productId, change) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, item.quantity + change);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            updateMiniCart();
        }
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        updateMiniCart();
        
        if (cart.length === 0) {
            miniCart.classList.add('hidden');
        }
    }

    // Toggle mini cart
    if (cartIcon && miniCart) {
        cartIcon.parentElement.addEventListener('mouseenter', () => {
            if (cart.length > 0) {
                miniCart.classList.remove('hidden');
            }
        });

        miniCart.addEventListener('mouseenter', () => {
            miniCart.classList.remove('hidden');
        });

        miniCart.addEventListener('mouseleave', () => {
            miniCart.classList.add('hidden');
        });

        cartIcon.parentElement.addEventListener('mouseleave', (e) => {
            if (!e.relatedTarget || !e.relatedTarget.closest('#mini-cart')) {
                miniCart.classList.add('hidden');
            }
        });
    }

    function formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Initialize cart
    function initializeCart() {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            try {
                cart = JSON.parse(storedCart);
            } catch (e) {
                console.error('Invalid cart data in storage');
                cart = [];
                localStorage.removeItem('cart');
            }
        } else {
            cart = [];
        }
        updateCartCount();
        updateMiniCart();
    }

    // Initialize cart on page load
    initializeCart();

    // Expose cart functions globally
    window.cartFunctions = {
        addToCart: function(productId, name, price, image, quantity) {
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({
                    id: productId,
                    name: name,
                    price: price,
                    image: image,
                    quantity: quantity
                });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            updateMiniCart();
            
            // Show notification
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-secondary text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 translate-y-0';
            notification.textContent = 'Item added to cart!';
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('translate-y-[-100%]');
                setTimeout(() => notification.remove(), 300);
            }, 2000);
        }
    };

    // Navigation scroll effect
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}); 