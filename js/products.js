document.addEventListener('DOMContentLoaded', function() {
    // Mobile Filter Toggle
    const filterToggle = document.getElementById('filter-toggle');
    const filterSidebar = document.querySelector('.filter-sidebar');
    const closeFilters = document.getElementById('close-filters');
    const filterOverlay = document.getElementById('filter-overlay');

    function toggleFilters() {
        filterSidebar.classList.toggle('open');
        document.body.classList.toggle('filter-open');
        filterOverlay.classList.toggle('hidden');
        
        // If opening, first show overlay then animate
        if (filterSidebar.classList.contains('open')) {
            filterSidebar.style.transform = 'translateX(0)';
        } else {
            filterSidebar.style.transform = 'translateX(-100%)';
        }
    }

    function closeFilterSidebar() {
        filterSidebar.classList.remove('open');
        document.body.classList.remove('filter-open');
        filterOverlay.classList.add('hidden');
        filterSidebar.style.transform = 'translateX(-100%)';
    }

    if (filterToggle) {
        filterToggle.addEventListener('click', toggleFilters);
    }

    if (closeFilters) {
        closeFilters.addEventListener('click', closeFilterSidebar);
    }

    if (filterOverlay) {
        filterOverlay.addEventListener('click', closeFilterSidebar);
    }

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && filterSidebar.classList.contains('open')) {
            closeFilterSidebar();
        }
    });

    // Close filters on window resize if screen becomes large
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024 && filterSidebar.classList.contains('open')) {
            closeFilterSidebar();
        }
    });

    // Grid/List View Toggle
    const gridViewBtn = document.querySelector('[data-view="grid"]');
    const listViewBtn = document.querySelector('[data-view="list"]');
    const productsContainer = document.querySelector('.products-container');

    if (gridViewBtn && listViewBtn) {
        gridViewBtn.addEventListener('click', () => {
            productsContainer.classList.remove('list-view');
            productsContainer.classList.add('grid-view');
            gridViewBtn.classList.add('text-secondary');
            listViewBtn.classList.remove('text-secondary');
            // Save preference
            localStorage.setItem('view-preference', 'grid');
        });

        listViewBtn.addEventListener('click', () => {
            productsContainer.classList.remove('grid-view');
            productsContainer.classList.add('list-view');
            listViewBtn.classList.add('text-secondary');
            gridViewBtn.classList.remove('text-secondary');
            // Save preference
            localStorage.setItem('view-preference', 'list');
        });

        // Load saved preference
        const savedView = localStorage.getItem('view-preference');
        if (savedView === 'list') {
            listViewBtn.click();
        }
    }

    // Filtering functionality
    const filterCheckboxes = document.querySelectorAll('.filter-checkbox');
    const priceRange = document.querySelector('#price-range');
    const products = document.querySelectorAll('.product-card');
    const activeFiltersContainer = document.getElementById('active-filters');
    
    function updateFilters() {
        const activeFilters = {
            categories: Array.from(filterCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value),
            price: priceRange ? parseInt(priceRange.value) : Infinity
        };

        products.forEach(product => {
            const matchesCategory = activeFilters.categories.length === 0 || 
                                  activeFilters.categories.includes(product.dataset.category);
            const matchesPrice = parseInt(product.dataset.price) <= activeFilters.price;

            if (matchesCategory && matchesPrice) {
                product.classList.remove('hidden');
            } else {
                product.classList.add('hidden');
            }
        });

        updateProductCount();
        updateFilterTags(activeFilters);
    }

    function updateProductCount() {
        const visibleProducts = document.querySelectorAll('.product-card:not(.hidden)').length;
        document.getElementById('product-count').textContent = `${visibleProducts} products`;
    }

    function updateFilterTags(activeFilters) {
        activeFiltersContainer.innerHTML = '';

        // Add category tags
        activeFilters.categories.forEach(category => {
            const checkbox = document.querySelector(`[value="${category}"]`);
            const tag = createFilterTag(checkbox.dataset.category, () => {
                checkbox.checked = false;
                updateFilters();
            });
            activeFiltersContainer.appendChild(tag);
        });

        // Add price tag if not at max
        if (activeFilters.price < 10000) {
            const tag = createFilterTag(
                `Up to TK ${formatPrice(activeFilters.price)}`,
                () => {
                    priceRange.value = 10000;
                    document.getElementById('price-value').textContent = `TK ${formatPrice(10000)}`;
                    updateFilters();
                }
            );
            activeFiltersContainer.appendChild(tag);
        }

        // Add clear all button if there are active filters
        if (activeFiltersContainer.children.length > 0) {
            const clearAll = document.createElement('button');
            clearAll.className = 'text-red-500 text-sm hover:text-red-600 ml-2';
            clearAll.textContent = 'Clear All';
            clearAll.addEventListener('click', clearAllFilters);
            activeFiltersContainer.appendChild(clearAll);
        }
    }

    function createFilterTag(text, onRemove) {
        const tag = document.createElement('div');
        tag.className = 'bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center gap-2';
        tag.innerHTML = `
            <span>${text}</span>
            <button class="text-gray-500 hover:text-gray-700">
                <i class="fas fa-times"></i>
            </button>
        `;
        tag.querySelector('button').addEventListener('click', onRemove);
        return tag;
    }

    function clearAllFilters() {
        filterCheckboxes.forEach(cb => cb.checked = false);
        priceRange.value = 10000;
        document.getElementById('price-value').textContent = `TK ${formatPrice(10000)}`;
        updateFilters();
    }

    // Event listeners for filters
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateFilters);
    });

    if (priceRange) {
        priceRange.addEventListener('input', updateFilters);
        // Update price label
        priceRange.addEventListener('input', (e) => {
            document.getElementById('price-value').textContent = `TK ${formatPrice(e.target.value)}`;
        });
    }

    // Sorting functionality
    const sortSelect = document.querySelector('#sort-select');
    
    function sortProducts(sortBy) {
        const productsArray = Array.from(products);
        
        productsArray.sort((a, b) => {
            const priceA = parseInt(a.dataset.price);
            const priceB = parseInt(b.dataset.price);
            const dateA = parseInt(a.dataset.date);
            const dateB = parseInt(b.dataset.date);
            
            switch(sortBy) {
                case 'price-low':
                    return priceA - priceB;
                case 'price-high':
                    return priceB - priceA;
                case 'newest':
                    return dateB - dateA;
                default:
                    return 0;
            }
        });

        productsContainer.innerHTML = '';
        productsArray.forEach(product => {
            productsContainer.appendChild(product);
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => sortProducts(e.target.value));
    }

    // Initialize
    updateFilters();
    sortProducts('featured');

    // Shopping Cart functionality
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartCount();

    // Listen for storage changes from other tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'cart') {
            // Update cart from storage
            cart = JSON.parse(e.newValue || '[]');
            updateCartCount();
            updateMiniCart();
        }
    });

    // Broadcast cart updates to other tabs
    function broadcastCartUpdate() {
        const event = new StorageEvent('storage', {
            key: 'cart',
            newValue: localStorage.getItem('cart'),
            url: window.location.href
        });
        window.dispatchEvent(event);
    }

    function addToCart(productId, name, price, image, quantity) {
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
        broadcastCartUpdate();
        updateCartCount();
        showCartNotification();
        updateMiniCart();
    }

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

    function showCartNotification() {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-secondary text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 translate-y-0';
        notification.textContent = 'Item added to cart!';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('translate-y-[-100%]');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
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

    // Update quantity function
    function updateQuantity(productId, change) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, item.quantity + change);
            localStorage.setItem('cart', JSON.stringify(cart));
            broadcastCartUpdate();
            updateCartCount();
            updateMiniCart();
        }
    }

    // Remove item from cart
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        broadcastCartUpdate();
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

    // Add event listeners to "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(addButton => {
        const product = addButton.closest('.product-card');
        if (!product) return;
        
        addButton.addEventListener('click', () => {
            const productData = product.dataset;
            window.cartFunctions.addToCart(
                productData.id,
                productData.name,
                parseInt(productData.price),
                productData.image,
                1
            );
        });
    });

    function formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Search functionality
    const searchInput = document.getElementById('search-input');
    let searchTimeout;

    function searchProducts(query) {
        query = query.toLowerCase().trim();
        
        products.forEach(product => {
            const name = product.dataset.name.toLowerCase();
            const description = product.dataset.description?.toLowerCase() || '';
            const category = product.dataset.category.toLowerCase();
            
            const matches = name.includes(query) || 
                           description.includes(query) || 
                           category.includes(query);
            
            // Add/remove fade class for smooth transitions
            if (matches) {
                product.classList.remove('hidden');
                product.classList.remove('opacity-0');
            } else {
                product.classList.add('opacity-0');
                setTimeout(() => product.classList.add('hidden'), 300);
            }
        });

        updateProductCount();
        updateNoResultsMessage(query);
    }

    function updateNoResultsMessage(query) {
        let existingMessage = document.getElementById('no-results-message');
        const visibleProducts = document.querySelectorAll('.product-card:not(.hidden)').length;

        if (visibleProducts === 0) {
            if (!existingMessage) {
                existingMessage = document.createElement('div');
                existingMessage.id = 'no-results-message';
                existingMessage.className = 'text-center py-8 text-gray-500';
                const productsContainer = document.querySelector('.products-container');
                productsContainer.parentNode.insertBefore(existingMessage, productsContainer.nextSibling);
            }
            existingMessage.innerHTML = `
                <p class="text-lg mb-2">No products found for "${query}"</p>
                <p class="text-sm">Try adjusting your search or filters</p>
            `;
        } else if (existingMessage) {
            existingMessage.remove();
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            // Clear previous timeout
            clearTimeout(searchTimeout);
            
            // Set new timeout for debouncing
            searchTimeout = setTimeout(() => {
                searchProducts(e.target.value);
            }, 300);
        });

        // Clear search with X button
        const clearSearch = document.createElement('button');
        clearSearch.className = 'absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hidden';
        clearSearch.innerHTML = '<i class="fas fa-times"></i>';
        searchInput.parentNode.appendChild(clearSearch);

        searchInput.addEventListener('input', () => {
            clearSearch.classList.toggle('hidden', !searchInput.value);
        });

        clearSearch.addEventListener('click', () => {
            searchInput.value = '';
            searchProducts('');
            clearSearch.classList.add('hidden');
        });
    }

    // Initialize cart from storage
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
}); 