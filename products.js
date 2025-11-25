/**
 * products.js - REWRITTEN FOR DYNAMIC CONTENT
 * This file now acts as a bridge between Firestore and your index.html/admin.html.
 * It automatically fetches data set in control_panel.html.
 */

// Initialize Firebase (Using the same config as control panel)
const firebaseConfig = {
  apiKey: "AIzaSyB1zNzsKmXXLVsOVGnVeGwlT_0uX3XqdO0",
  authDomain: "pipahcookies-order.firebaseapp.com",
  databaseURL: "https://pipahcookies-order-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pipahcookies-order",
  storageBucket: "pipahcookies-order.firebasestorage.app",
  messagingSenderId: "1038900448087",
  appId: "1:1038900448087:web:a46586f21e9ae989708c12"
};

// Check if Firebase is loaded, if not, wait for it or alert
if (typeof firebase === 'undefined') {
  console.error("Firebase SDK not found. Please add Firebase scripts to index.html header.");
} else {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
}

const db = firebase.firestore();
const auth = firebase.auth();

// Global variable to store products so other scripts can access it (like admin.html)
var products = []; 

// Function to Render Products into the Grid
function renderDynamicProducts(productsList) {
    const grid = document.getElementById('product-grid');
    if (!grid) return; // Might be on a page without the grid

    grid.innerHTML = ''; // Clear hardcoded HTML

    productsList.forEach((p, index) => {
        // Fallbacks
        const img = p.mediaUrl || 'Images/icon.png';
        const name = p.name || 'Product';
        const price = p.price || 0;
        const stock = p.stock || 0;
        const isSoldOut = stock <= 0;
        
        // Generate Unique ID for DOM elements
        const domId = `dyn-p-${index}`;

        const card = document.createElement('article');
        card.className = 'card product-card';
        card.innerHTML = `
            <div class="product-slider">
                <img src="${img}" class="product-img active" alt="${name}">
            </div>
            <h3>${name}</h3>
            <p><span class="price">RM${price.toFixed(2)}</span></p>
            
            ${isSoldOut ? '<p style="color:red;font-weight:bold;">SOLD OUT</p>' : `
            <div class="qty-control">
                <button class="qty-btn" onclick="changeProductQty('${domId}', -1)">−</button>
                <input id="qty-${domId}" class="qty-input" type="number" readonly value="1" min="1">
                <button class="qty-btn" onclick="changeProductQty('${domId}', 1)">+</button>
            </div>
            <button class="btn primary" onclick="addToCart('${domId}', '${name.replace(/'/g, "\\'")}', ${price})">Tambah ke Troli</button>
            `}
        `;
        grid.appendChild(card);
        
        // Map the dynamic ID back to the real object for cart logic if needed
        p.frontendId = domId;
    });
}

// Function to fetch data
function initDynamicContent() {
    // 1. Fetch Header/Announcements
    db.collection('site_content').doc('main').onSnapshot(doc => {
        if(doc.exists) {
            const data = doc.data();
            // Update Header Image if element exists
            const headerImg = document.querySelector('.header-img');
            if(headerImg && data.headerImg) headerImg.src = data.headerImg;
            
            // Update Announcement text (Assuming you add a container with id 'announcement-display' in index.html)
            // Or updating existing paragraphs:
            const introP = document.querySelector('#about .lead');
            if(introP && data.announcement) introP.innerText = data.announcement;
        }
    });

    // 2. Fetch Products
    db.collection('products').orderBy('order').onSnapshot(snapshot => {
        products = []; // Reset global array
        snapshot.forEach(doc => {
            const p = doc.data();
            p.id = doc.id; // Ensure ID is preserved
            products.push(p);
        });

        // Update Index.html Grid
        renderDynamicProducts(products);
        
        // If on admin.html (3D Gallery), re-initialize if function exists
        if (typeof initializeGallery === 'function') {
            const gallery = document.getElementById('gallery');
            if(gallery) gallery.innerHTML = ''; // Clear 3D gallery
            initializeGallery(); // Re-run 3D gallery logic
        }
    });
}

// Start fetching when auth is ready (Anonymous login needed for Firestore rules usually)
auth.onAuthStateChanged(user => {
    if (user) {
        initDynamicContent();
    } else {
        auth.signInAnonymously().catch(e => console.error(e));
    }
});