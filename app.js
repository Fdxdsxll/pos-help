// Lager data struktur
let inventory = [
    { id: 1, name: 'Produkt 1', quantity: 10, category: 'Kategori A', price: 99.99 },
    { id: 2, name: 'Produkt 2', quantity: 5, category: 'Kategori B', price: 149.99 }
];

// Bestillings data struktur
let orders = [
    { id: 1, customerName: 'John Doe', items: ['Produkt 1', 'Produkt 2'], date: '2024-01-20' }
];

// Udvidet data struktur
let payments = [];
let orderStatuses = {
    PENDING: 'Afventer',
    PAID: 'Betalt',
    CANCELLED: 'Annulleret'
};

// Opdateret orders struktur
orders = orders.map(order => ({
    ...order,
    status: orderStatuses.PENDING,
    total: 0
}));

// Vis sektion
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    refreshDisplay();
    if (sectionId === 'pos') {
        displayPosProducts();
    }
}

// Opdater visning
function refreshDisplay() {
    displayInventory();
    displayOrders();
    displayPayments();
    updateStatistics();
}

// Vis lagerliste
function displayInventory() {
    const searchTerm = document.getElementById('inventorySearch').value.toLowerCase();
    const filteredInventory = inventory.filter(item => 
        item.name.toLowerCase().includes(searchTerm) || 
        item.category.toLowerCase().includes(searchTerm)
    );

    const inventoryList = document.getElementById('inventoryList');
    inventoryList.innerHTML = filteredInventory.map(item => `
        <div class="list-item">
            <span>${item.name} - ${item.quantity} stk. - ${item.category} - ${item.price} kr.</span>
            <button onclick="deleteInventoryItem(${item.id})">Slet</button>
        </div>
    `).join('');
}

// Vis bestillingsliste
function displayOrders() {
    const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
    const filteredOrders = orders.filter(order => 
        order.customerName.toLowerCase().includes(searchTerm) || 
        order.items.join(' ').toLowerCase().includes(searchTerm)
    );

    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = filteredOrders.map(order => `
        <div class="list-item">
            <div>
                <span>${order.customerName} - ${order.items.join(', ')} - ${order.date}</span>
                <span class="status status-${order.status.toLowerCase()}">${order.status}</span>
            </div>
            <div>
                <span>${order.total} kr</span>
                <button onclick="deleteOrder(${order.id})">Slet</button>
            </div>
        </div>
    `).join('');
}

// Vis betalinger
function displayPayments() {
    const searchTerm = document.getElementById('paymentSearch').value.toLowerCase();
    const filteredPayments = payments.filter(payment => 
        payment.orderId.toString().includes(searchTerm) || 
        payment.method.toLowerCase().includes(searchTerm)
    );

    const paymentsList = document.getElementById('paymentsList');
    paymentsList.innerHTML = filteredPayments.map(payment => `
        <div class="list-item">
            <span>Ordre #${payment.orderId} - ${payment.amount} kr - ${payment.method}</span>
            <span class="status status-${payment.status.toLowerCase()}">${payment.status}</span>
        </div>
    `).join('');
}

function calculateOrderTotal(items) {
    return items.reduce((total, itemName) => {
        const item = inventory.find(i => i.name === itemName);
        return total + (item ? item.price : 0);
    }, 0);
}

// Tilføj vare formular
function showAddItemForm() {
    document.getElementById('addItemForm').classList.add('active');
}

function hideAddItemForm() {
    document.getElementById('addItemForm').classList.remove('active');
}

// Tilføj bestilling formular
function showAddOrderForm() {
    document.getElementById('addOrderForm').classList.add('active');
}

function hideAddOrderForm() {
    document.getElementById('addOrderForm').classList.remove('active');
}

// Tilføj ny vare
function addItem() {
    const name = document.getElementById('itemName').value;
    const quantity = parseInt(document.getElementById('itemQuantity').value);
    const category = document.getElementById('itemCategory').value;
    const price = parseFloat(document.getElementById('itemPrice').value);

    if (name && quantity && category && price) {
        inventory.push({
            id: inventory.length + 1,
            name,
            quantity,
            category,
            price
        });
        hideAddItemForm();
        refreshDisplay();
        // Reset form
        document.getElementById('itemName').value = '';
        document.getElementById('itemQuantity').value = '';
        document.getElementById('itemCategory').value = '';
        document.getElementById('itemPrice').value = '';
    }
}

// Tilføj ny bestilling
function addOrder() {
    const customerName = document.getElementById('customerName').value;
    const items = document.getElementById('orderItems').value.split(',').map(item => item.trim());
    const date = document.getElementById('orderDate').value;

    if (customerName && items.length > 0 && date) {
        const total = calculateOrderTotal(items);
        orders.push({
            id: orders.length + 1,
            customerName,
            items,
            date,
            status: orderStatuses.PENDING,
            total
        });
        hideAddOrderForm();
        refreshDisplay();
        document.getElementById('customerName').value = '';
        document.getElementById('orderItems').value = '';
        document.getElementById('orderDate').value = '';
    }
}

// Tilføj betaling
function addPayment() {
    const orderId = parseInt(document.getElementById('paymentOrderId').value);
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const method = document.getElementById('paymentMethod').value;

    if (orderId && amount && method) {
        const payment = {
            id: payments.length + 1,
            orderId,
            amount,
            method,
            date: new Date().toISOString().split('T')[0],
            status: 'COMPLETED'
        };
        
        payments.push(payment);
        
        // Update order status
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = orderStatuses.PAID;
        }

        hideAddPaymentForm();
        refreshDisplay();
    }
}

// POS System Variables
let currentCart = [];

// Display products in POS
function displayPosProducts() {
    const searchTerm = document.getElementById('posSearch').value.toLowerCase();
    const filteredProducts = inventory.filter(item => 
        item.name.toLowerCase().includes(searchTerm) || 
        item.category.toLowerCase().includes(searchTerm)
    );

    const productList = document.getElementById('posProductList');
    productList.innerHTML = filteredProducts.map(item => `
        <div class="product-card" onclick="addToCart(${item.id})">
            <h4>${item.name}</h4>
            <p>${item.price.toFixed(2)} kr</p>
            <small>${item.quantity} på lager</small>
        </div>
    `).join('');
}

// Add item to cart
function addToCart(productId) {
    const product = inventory.find(item => item.id === productId);
    if (!product || product.quantity <= 0) return;

    const cartItem = currentCart.find(item => item.id === productId);
    if (cartItem) {
        if (cartItem.quantity < product.quantity) {
            cartItem.quantity++;
        }
    } else {
        currentCart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    updateCartDisplay();
}

// Update cart quantity
function updateCartQuantity(productId, delta) {
    const cartItem = currentCart.find(item => item.id === productId);
    const product = inventory.find(item => item.id === productId);
    
    if (cartItem) {
        cartItem.quantity += delta;
        if (cartItem.quantity <= 0) {
            currentCart = currentCart.filter(item => item.id !== productId);
        } else if (cartItem.quantity > product.quantity) {
            cartItem.quantity = product.quantity;
        }
    }
    updateCartDisplay();
}

// Update cart display
function updateCartDisplay() {
    const cartDiv = document.getElementById('posCart');
    cartDiv.innerHTML = currentCart.map(item => `
        <div class="cart-item">
            <span>${item.name}</span>
            <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, 1)">+</button>
                <span>${(item.price * item.quantity).toFixed(2)} kr</span>
            </div>
        </div>
    `).join('');

    const total = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cartTotal').textContent = total.toFixed(2) + ' kr';
}

// Modify the processPosPayment function to handle different payment interfaces
function processPosPayment(method) {
    if (currentCart.length === 0) return;

    const total = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (method === 'mobilepay') {
        // Open MobilePay portal in a new window
        window.open('https://portal.vippsmobilepay.com/login', '_blank');
    } else if (method === 'card' || method === 'cash') {
        // Open Dinero for card and cash payments
        window.open('https://app.dinero.dk/551307/2025-01/vouchers/purchases/create', '_blank');
    }

    // Wait a moment before processing the payment completion
    setTimeout(() => {
        processPaymentCompletion(total, method);
    }, 1000);
}

function processPaymentCompletion(total, method) {
    // Create new order
    const orderId = orders.length + 1;
    const newOrder = {
        id: orderId,
        customerName: 'Butikskunde',
        items: currentCart.map(item => item.name),
        date: new Date().toISOString().split('T')[0],
        status: orderStatuses.PAID,
        total: total
    };
    orders.push(newOrder);

    // Create payment
    payments.push({
        id: payments.length + 1,
        orderId: orderId,
        amount: total,
        method: method,
        date: new Date().toISOString().split('T')[0],
        status: 'COMPLETED'
    });

    // Update inventory
    currentCart.forEach(item => {
        const inventoryItem = inventory.find(i => i.id === item.id);
        if (inventoryItem) {
            inventoryItem.quantity -= item.quantity;
        }
    });

    // Clear cart
    currentCart = [];
    updateCartDisplay();
    displayPosProducts();
    refreshDisplay();
}

// Opdater statistik
function updateStatistics() {
    const today = new Date().toISOString().split('T')[0];
    const todayPayments = payments.filter(p => p.date === today);
    const todayTotal = todayPayments.reduce((sum, p) => sum + p.amount, 0);
    
    document.getElementById('todaySales').textContent = todayTotal.toFixed(2) + ' kr';
    
    const thisMonth = today.substring(0, 7);
    const monthlyPayments = payments.filter(p => p.date.startsWith(thisMonth));
    const monthlyTotal = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
    
    document.getElementById('monthlyRevenue').textContent = monthlyTotal.toFixed(2) + ' kr';
    
    // Top products calculation
    const productSales = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            productSales[item] = (productSales[item] || 0) + 1;
        });
    });
    
    const topProducts = Object.entries(productSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    document.getElementById('topProducts').innerHTML = topProducts
        .map(([name, count]) => `<li>${name}: ${count} stk</li>`)
        .join('');
}

// Payment form handlers
function showAddPaymentForm() {
    const select = document.getElementById('paymentOrderId');
    select.innerHTML = orders
        .filter(order => order.status === orderStatuses.PENDING)
        .map(order => `
            <option value="${order.id}">
                Ordre #${order.id} - ${order.customerName} (${order.total} kr)
            </option>
        `).join('');
    
    document.getElementById('addPaymentForm').classList.add('active');
}

function hideAddPaymentForm() {
    document.getElementById('addPaymentForm').classList.remove('active');
}

// Slet vare
function deleteInventoryItem(id) {
    inventory = inventory.filter(item => item.id !== id);
    refreshDisplay();
}

// Slet bestilling
function deleteOrder(id) {
    orders = orders.filter(order => order.id !== id);
    refreshDisplay();
}

// Event listeners for søgning
document.getElementById('inventorySearch').addEventListener('input', displayInventory);
document.getElementById('orderSearch').addEventListener('input', displayOrders);
document.getElementById('paymentSearch').addEventListener('input', displayPayments);

// Add event listener for POS search
document.getElementById('posSearch')?.addEventListener('input', displayPosProducts);

// Add new function to open help page
function openHelp() {
    window.open('https://websim.ai/@enchantingfeather15501975/hj-lp-office-assistant/', '_blank');
}

// Initialize POS display when showing section

// Initial visning
refreshDisplay();