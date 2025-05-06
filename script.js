// List of products with real images from Unsplash
const products = [
    { id: 1, name: "Smartphone", price: 299.99, image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97", category: "electronics" },
    { id: 2, name: "Laptop", price: 799.99, image: "https://images.unsplash.com/photo-1618424181497-157f25b6ddd5", category: "electronics" },
    { id: 3, name: "T-Shirt", price: 19.99, image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820", category: "clothing" },
    { id: 4, name: "Jeans", price: 49.99, image: "https://images.unsplash.com/photo-1602293589930-45aad59ba27c", category: "clothing" },
    { id: 5, name: "Coffee Maker", price: 59.99, image: "https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad", category: "home" },
];

// Cart to store selected items
let cart = JSON.parse(localStorage.getItem("cart")) || [];

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const categoryFilter = document.getElementById("category-filter");
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    const cartIcon = document.getElementById("cart-icon");
    const cartModal = document.getElementById("cart-modal");
    const closeCart = document.querySelector(".close");
    const checkoutBtn = document.getElementById("checkout-btn");
    const themeToggle = document.getElementById("theme-toggle");
    const contactForm = document.getElementById("contact-form");

    if (document.getElementById("featured-products")) {
        showFeaturedProducts();
    }

    if (document.getElementById("products-grid")) {
        showProducts();
    }

    updateCartCount();

    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });
    }

    if (searchButton) {
        searchButton.addEventListener("click", () => {
            const query = searchInput.value.toLowerCase();
            if (document.getElementById("products-grid")) {
                showProducts(query);
            } else if (query) {
                window.location.href = `products.html?search=${query}`;
            }
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener("change", () => {
            showProducts(searchInput.value.toLowerCase());
        });
    }

    if (cartIcon) {
        cartIcon.addEventListener("click", (e) => {
            e.preventDefault();
            showCart();
            cartModal.style.display = "block";
        });
    }

    if (closeCart) {
        closeCart.addEventListener("click", () => {
            cartModal.style.display = "none";
            clearCartDisplay();
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            alert("Thank you for your purchase! Check your email for a confirmation.");
            cart = [];
            localStorage.setItem("cart", JSON.stringify(cart));
            updateCartCount();
            showCart();
            cartModal.style.display = "none";
            clearCartDisplay();
        });
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const body = document.body;
            body.classList.toggle("dark");
            const isDark = body.classList.contains("dark");
            document.getElementById("theme-icon").className = isDark ? "fas fa-moon" : "fas fa-sun";
            localStorage.setItem("theme", isDark ? "dark" : "light");
        });

        if (localStorage.getItem("theme") === "dark") {
            document.body.classList.add("dark");
            document.getElementById("theme-icon").className = "fas fa-moon";
        }
    }

    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const message = document.getElementById("form-message");
            message.textContent = "Message sent! We'll get back to you soon.";
            message.style.opacity = 0;
            message.style.transition = "opacity 0.5s ease";
            message.style.opacity = 1;
            contactForm.reset();
            setTimeout(() => {
                message.style.opacity = 0;
            }, 3000);
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get("search");
    if (searchQuery && searchInput && document.getElementById("products-grid")) {
        searchInput.value = searchQuery;
        showProducts(searchQuery);
    }
});

function showFeaturedProducts() {
    const container = document.getElementById("featured-products");
    if (!container) return;

    const randomProducts = products.sort(() => 0.5 - Math.random()).slice(0, 4);
    container.innerHTML = randomProducts.map(product => createProductCard(product)).join("");

    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", () => {
            const id = parseInt(button.dataset.id);
            addToCart(id);
            showCart();
            cartModal.style.display = "block";
        });
    });
}

function showProducts(search = "") {
    const container = document.getElementById("products-grid");
    const category = document.getElementById("category-filter")?.value || "all";
    const resultsInfo = document.getElementById("search-results-info");

    if (!container) return;

    let filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(search);
        const matchesCategory = category === "all" || product.category === category;
        return matchesSearch && matchesCategory;
    });

    if (resultsInfo && search) {
        resultsInfo.innerHTML = `
            <span>${filteredProducts.length} result${filteredProducts.length !== 1 ? "s" : ""} for "${search}"</span>
            <span class="clear-search" onclick="clearSearch()">Clear Search</span>
        `;
    } else if (resultsInfo) {
        resultsInfo.innerHTML = "";
    }

    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <h3>No products found</h3>
                <p>Try a different search term.</p>
            </div>
        `;
    } else {
        container.innerHTML = filteredProducts.map(product => createProductCard(product)).join("");
    }

    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", () => {
            const id = parseInt(button.dataset.id);
            addToCart(id);
            showCart();
            cartModal.style.display = "block";
        });
    });
}

function clearSearch() {
    const searchInput = document.getElementById("search-input");
    searchInput.value = "";
    window.history.pushState({}, "", "products.html");
    showProducts();
}

function createProductCard(product) {
    return `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">$${product.price.toFixed(2)}</p>
            <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
        </div>
    `;
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += 1;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cartCount = document.getElementById("cart-count");
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function showCart() {
    const cartItems = document.getElementById("cart-items");
    const totalPrice = document.getElementById("total-price");

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
        totalPrice.textContent = "0.00";
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div>
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
        </div>
    `).join("");

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalPrice.textContent = total.toFixed(2);
}

function clearCartDisplay() {
    const cartItems = document.getElementById("cart-items");
    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
    }
}