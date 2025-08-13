// Global variables
let currentUser = null;
let currentEditItem = null;
let itemCounter = 1;
let touchStartX = 0;
let touchStartY = 0;
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Initialize the application
function initializeApp() {
    loadChecklistFromStorage();
    updateProgress();
    setupTabNavigation();
    setupMobileFeatures();
    
    // Set up form submission
    document.getElementById('add-item-form').addEventListener('submit', addNewItem);
    
    // Set up modal close functionality
    document.querySelector('.close').addEventListener('click', closeEditModal);
    window.addEventListener('click', function(event) {
        if (event.target === document.getElementById('edit-modal')) {
            closeEditModal();
        }
    });
    
    // Set up edit form submission
    document.getElementById('edit-form').addEventListener('submit', saveEditedItem);
    
    // Set up Firebase auth state listener
    if (window.firebase && window.firebase.auth) {
        window.firebase.onAuthStateChanged(window.firebase.auth, (user) => {
            if (user) {
                // User is signed in
                currentUser = {
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    picture: user.photoURL
                };
                
                document.getElementById('user-name').textContent = `Welcome, ${currentUser.name}!`;
                document.getElementById('google-signin-btn').style.display = 'none';
                document.getElementById('user-info').style.display = 'inline-flex';
                
                loadUserData();
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            } else {
                // User is signed out
                currentUser = null;
                document.getElementById('google-signin-btn').style.display = 'block';
                document.getElementById('user-info').style.display = 'none';
                localStorage.removeItem('currentUser');
            }
        });
    }
    
    // Check for saved user on page load
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            document.getElementById('user-name').textContent = `Welcome, ${currentUser.name}!`;
            document.getElementById('google-signin-btn').style.display = 'none';
            document.getElementById('user-info').style.display = 'inline-flex';
            loadUserData();
        } catch (e) {
            console.error('Error loading saved user:', e);
        }
    }
}

// Tab Navigation Functions
function setupTabNavigation() {
    const tabs = document.querySelectorAll('.category-tab');
    const sections = document.querySelectorAll('.category-section');
    
    // Remove all active classes initially
    tabs.forEach(tab => tab.classList.remove('active'));
    sections.forEach(section => section.classList.remove('active'));
    
    // Check if there's a hash in the URL to set initial active state
    const hash = window.location.hash.substring(1);
    let initialCategory = 'bedding'; // default
    
    if (hash && document.querySelector(`[data-category="${hash}"]`)) {
        initialCategory = hash;
    }
    
    // Set initial active state
    const initialTab = document.querySelector(`[data-category="${initialCategory}"]`);
    const initialSection = document.querySelector(`.category-section[data-category="${initialCategory}"]`);
    
    if (initialTab) initialTab.classList.add('active');
    if (initialSection) initialSection.classList.add('active');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetCategory = this.getAttribute('data-category');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section, hide others
            sections.forEach(section => {
                if (section.getAttribute('data-category') === targetCategory) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });
            
            // Update URL hash
            window.location.hash = targetCategory;
        });
    });
    
    // Handle initial hash or default to bedding
    const initialHash = window.location.hash.slice(1);
    if (initialHash && document.querySelector(`[data-category="${initialHash}"]`)) {
        showCategory(initialHash);
    } else {
        showCategory('bedding');
    }
}

function showCategory(category) {
    // Update active tab
    const tabs = document.querySelectorAll('.category-tab');
    const sections = document.querySelectorAll('.category-section');
    
    tabs.forEach(tab => {
        if (tab.getAttribute('data-category') === category) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Show target section, hide others
    sections.forEach(section => {
        if (section.getAttribute('data-category') === category) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });
}

// Firebase Authentication Functions
function signInWithGoogle() {
    console.log('Sign-in function called');
    console.log('Firebase object:', window.firebase);
    
    if (!window.firebase) {
        showNotification('Firebase not loaded yet. Please refresh the page.', 'error');
        return;
    }
    
    if (!window.firebase.auth) {
        showNotification('Firebase auth not available. Please refresh the page.', 'error');
        return;
    }
    
    if (!window.firebase.provider) {
        showNotification('Google provider not available. Please refresh the page.', 'error');
        return;
    }
    
    console.log('Attempting sign-in with Firebase...');
    
    // Show loading state
    const signInBtn = document.getElementById('google-signin-btn');
    const originalText = signInBtn.innerHTML;
    signInBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    signInBtn.disabled = true;
    
    try {
        console.log('About to call signInWithPopup...');
        console.log('Auth object:', window.firebase.auth);
        console.log('Provider object:', window.firebase.provider);
        
        // Try popup first, fallback to redirect if popup fails
        console.log('Calling signInWithPopup...');
        const signInPromise = window.firebase.signInWithPopup(window.firebase.auth, window.firebase.provider);
        console.log('Sign-in promise created:', signInPromise);
        
        signInPromise.then((result) => {
                console.log('Sign-in successful:', result);
                const user = result.user;
                currentUser = {
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    picture: user.photoURL
                };
                
                // Show user info
                document.getElementById('user-name').textContent = `Welcome, ${currentUser.name}!`;
                document.getElementById('google-signin-btn').style.display = 'none';
                document.getElementById('user-info').style.display = 'inline-flex';
                
                // Load user-specific data from Firebase
                loadUserData();
                
                // Save user info to local storage
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                showNotification('Successfully signed in!', 'success');
                
                // Reset button state (though button will be hidden anyway)
                signInBtn.innerHTML = originalText;
                signInBtn.disabled = false;
            })
            .catch((error) => {
                console.error('Sign-in error:', error);
                console.error('Error type:', typeof error);
                console.error('Error properties:', Object.keys(error));
                console.error('Error code:', error.code);
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
                
                let errorMessage = 'Sign-in failed. Please try again.';
                
                if (error.code === 'auth/popup-closed-by-user') {
                    errorMessage = 'Sign-in was cancelled. Please try again.';
                } else if (error.code === 'auth/popup-blocked') {
                    errorMessage = 'Pop-up was blocked. Trying redirect method...';
                    showNotification(errorMessage, 'info');
                    
                    // Fallback to redirect method
                    try {
                        window.firebase.signInWithRedirect(window.firebase.auth, window.firebase.provider);
                        return; // Don't reset button yet, we're redirecting
                    } catch (redirectError) {
                        console.error('Redirect also failed:', redirectError);
                        errorMessage = 'Both popup and redirect failed. Please try again.';
                    }
                } else if (error.code === 'auth/network-request-failed') {
                    errorMessage = 'Network error. Please check your connection and try again.';
                } else if (error.code === 'auth/unauthorized-domain') {
                    errorMessage = 'This domain is not authorized for Firebase. Please check your Firebase configuration.';
                } else if (error.code === 'auth/operation-not-allowed') {
                    errorMessage = 'Google sign-in is not enabled. Please check your Firebase configuration.';
                } else if (error.code === 'auth/invalid-api-key') {
                    errorMessage = 'Invalid Firebase API key. Please check your configuration.';
                }
                
                showNotification(errorMessage, 'error');
                
                // Reset button state
                signInBtn.innerHTML = originalText;
                signInBtn.disabled = false;
            });
    } catch (error) {
        console.error('Unexpected error during sign-in:', error);
        showNotification('Unexpected error during sign-in. Please try again.', 'error');
        
        // Reset button state
        signInBtn.innerHTML = originalText;
        signInBtn.disabled = false;
    }
}

function signOut() {
    if (window.firebase && window.firebase.auth) {
        window.firebase.signOut(window.firebase.auth)
            .then(() => {
                currentUser = null;
                document.getElementById('google-signin-btn').style.display = 'block';
                document.getElementById('user-info').style.display = 'none';
                localStorage.removeItem('currentUser');
                
                // Clear user-specific data
                clearUserData();
                
                showNotification('Successfully signed out!', 'success');
            })
            .catch((error) => {
                console.error('Sign-out error:', error);
                showNotification('Sign-out failed. Please try again.', 'error');
            });
    } else {
        // Fallback if Firebase not loaded
        currentUser = null;
        document.getElementById('google-signin-btn').style.display = 'block';
        document.getElementById('user-info').style.display = 'none';
        localStorage.removeItem('currentUser');
        clearUserData();
    }
}

function loadUserData() {
    if (currentUser && window.firebase && window.firebase.db) {
        const { doc, getDoc } = window.firebase;
        const userDocRef = doc(window.firebase.db, 'users', currentUser.uid);
        
        getDoc(userDocRef)
            .then((docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.checklist) {
                        restoreChecklistState(data.checklist);
                    }
                }
            })
            .catch((error) => {
                console.error('Error loading user data:', error);
                // Fallback to local storage
                const userData = localStorage.getItem(`checklist_${currentUser.email}`);
                if (userData) {
                    const data = JSON.parse(userData);
                    restoreChecklistState(data);
                }
            });
    } else if (currentUser) {
        // Fallback to local storage
        const userData = localStorage.getItem(`checklist_${currentUser.email}`);
        if (userData) {
            const data = JSON.parse(userData);
            restoreChecklistState(data);
        }
    }
}

function saveUserData() {
    if (currentUser && window.firebase && window.firebase.db) {
        const checklistData = getChecklistData();
        const { doc, setDoc } = window.firebase;
        const userDocRef = doc(window.firebase.db, 'users', currentUser.uid);
        
        setDoc(userDocRef, {
            email: currentUser.email,
            name: currentUser.name,
            checklist: checklistData,
            lastUpdated: new Date().toISOString()
        }, { merge: true })
        .then(() => {
            // Also save to local storage as backup
            localStorage.setItem(`checklist_${currentUser.email}`, JSON.stringify(checklistData));
        })
        .catch((error) => {
            console.error('Error saving to Firebase:', error);
            // Fallback to local storage only
            localStorage.setItem(`checklist_${currentUser.email}`, JSON.stringify(checklistData));
        });
    } else if (currentUser) {
        // Fallback to local storage only
        const checklistData = getChecklistData();
        localStorage.setItem(`checklist_${currentUser.email}`, JSON.stringify(checklistData));
    }
}

function clearUserData() {
    // Reset to default checklist
    location.reload();
}

// Checklist Management Functions
function addNewItem(event) {
    event.preventDefault();
    
    const category = document.getElementById('category-select').value;
    const itemName = document.getElementById('item-name').value.trim();
    
    if (!category || !itemName) return;
    
    const categoryId = `${category}-items`;
    const itemsList = document.getElementById(categoryId);
    
    if (itemsList) {
        const newItem = createItemElement(itemName, category);
        itemsList.appendChild(newItem);
        
        // Clear form
        document.getElementById('item-name').value = '';
        document.getElementById('category-select').value = '';
        
        // Update progress and save
        updateProgress();
        saveUserData();
        saveChecklistToStorage();
        
        // Show the category where item was added
        showCategory(category);
    }
}

function createItemElement(itemName, category) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';
    itemDiv.setAttribute('data-id', `${category}-${Date.now()}`);
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `item-${Date.now()}`;
    checkbox.addEventListener('change', function() {
        toggleItem(this);
    });
    
    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = itemName;
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'item-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.onclick = function() {
        editItem(this);
    };
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.onclick = function() {
        deleteItem(this);
    };
    
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    
    itemDiv.appendChild(checkbox);
    itemDiv.appendChild(label);
    itemDiv.appendChild(actionsDiv);
    
    return itemDiv;
}

function toggleItem(checkbox) {
    const item = checkbox.closest('.item');
    const itemsList = item.parentElement;
    
    if (checkbox.checked) {
        item.classList.add('completed');
        // Move to top of the list
        itemsList.insertBefore(item, itemsList.firstChild);
    } else {
        item.classList.remove('completed');
        // Move back to bottom of the list
        itemsList.appendChild(item);
    }
    
    updateProgress();
    saveUserData();
    saveChecklistToStorage();
}

function editItem(button) {
    const item = button.closest('.item');
    const label = item.querySelector('label');
    
    currentEditItem = item;
    
    // Show modal
    document.getElementById('edit-modal').style.display = 'block';
    document.getElementById('edit-item-name').value = label.textContent;
    document.getElementById('edit-item-name').focus();
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    currentEditItem = null;
}

function saveEditedItem(event) {
    event.preventDefault();
    
    if (currentEditItem) {
        const newName = document.getElementById('edit-item-name').value.trim();
        if (newName) {
            const label = currentEditItem.querySelector('label');
            label.textContent = newName;
            
            closeEditModal();
            saveUserData();
            saveChecklistToStorage();
        }
    }
}

function deleteItem(button) {
    if (confirm('Are you sure you want to delete this item?')) {
        const item = button.closest('.item');
        item.remove();
        
        updateProgress();
        saveUserData();
        saveChecklistToStorage();
    }
}

// Progress and Storage Functions
function updateProgress() {
    const allItems = document.querySelectorAll('.item');
    const completedItems = document.querySelectorAll('.item.completed');
    
    const total = allItems.length;
    const completed = completedItems.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    document.getElementById('progress-fill').style.width = percentage + '%';
    document.getElementById('progress-text').textContent = `${completed} of ${total} items completed`;
}

function saveChecklistToStorage() {
    const checklistData = getChecklistData();
    localStorage.setItem('collegeChecklist', JSON.stringify(checklistData));
}

function loadChecklistFromStorage() {
    const savedData = localStorage.getItem('collegeChecklist');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            restoreChecklistState(data);
        } catch (e) {
            console.error('Error loading checklist data:', e);
        }
    }
}

function getChecklistData() {
    const data = {};
    const categories = ['bedding', 'clothing', 'electronics', 'room-essentials', 'bathroom-hygiene', 'study-supplies', 'documents-id', 'weather-comfort', 'kitchen-cleaning'];
    
    categories.forEach(category => {
        const itemsList = document.getElementById(`${category}-items`);
        if (itemsList) {
            data[category] = [];
            const items = itemsList.querySelectorAll('.item');
            items.forEach(item => {
                const checkbox = item.querySelector('input[type="checkbox"]');
                const label = item.querySelector('label');
                data[category].push({
                    name: label.textContent,
                    completed: checkbox.checked,
                    id: item.getAttribute('data-id')
                });
            });
        }
    });
    
    return data;
}

function restoreChecklistState(data) {
    Object.keys(data).forEach(category => {
        const itemsList = document.getElementById(`${category}-items`);
        if (itemsList) {
            // Clear existing items
            itemsList.innerHTML = '';
            
            // Add items back
            data[category].forEach(itemData => {
                const itemDiv = createItemElement(itemData.name, category);
                const checkbox = itemDiv.querySelector('input[type="checkbox"]');
                
                if (itemData.completed) {
                    checkbox.checked = true;
                    itemDiv.classList.add('completed');
                }
                
                itemsList.appendChild(itemDiv);
            });
        }
    });
    
    updateProgress();
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Enhanced mobile-friendly notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Mobile-specific positioning
    if (isMobile) {
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.left = '10px';
        notification.style.right = '10px';
        notification.style.zIndex = '10000';
        notification.style.borderRadius = '8px';
        notification.style.fontSize = '14px';
        notification.style.fontWeight = '500';
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Escape key to close modal
    if (event.key === 'Escape') {
        closeEditModal();
    }
    
    // Ctrl/Cmd + Enter to submit forms
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        if (document.getElementById('edit-modal').style.display === 'block') {
            saveEditedItem(new Event('submit'));
        } else {
            document.getElementById('add-item-form').dispatchEvent(new Event('submit'));
        }
    }
});

// Auto-save functionality
let autoSaveTimer;
function scheduleAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        saveUserData();
        saveChecklistToStorage();
    }, 2000); // Save after 2 seconds of inactivity
}

// Add auto-save to all interactive elements
document.addEventListener('change', scheduleAutoSave);
document.addEventListener('input', scheduleAutoSave);

// Export/Import functionality
function exportChecklist() {
    const data = getChecklistData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'college-checklist.json';
    a.click();
    
    URL.revokeObjectURL(url);
    showNotification('Checklist exported successfully!', 'success');
}

function importChecklist() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    restoreChecklistState(data);
                    saveChecklistToStorage();
                    showNotification('Checklist imported successfully!', 'success');
                } catch (error) {
                    showNotification('Error importing checklist. Please check the file format.', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
}

// Add export/import buttons to the header and initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app first
    initializeApp();
    
    const header = document.querySelector('.header');
    
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export Checklist';
    exportBtn.className = 'export-btn';
    exportBtn.onclick = exportChecklist;
    exportBtn.style.cssText = `
        background: #ecf0f1;
        color: #2c3e50;
        border: 1px solid #d5dbdb;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        margin: 0 8px;
        font-weight: 500;
        transition: all 0.2s ease;
        font-size: 0.9rem;
    `;
    
    const importBtn = document.createElement('button');
    importBtn.textContent = 'Import Checklist';
    importBtn.className = 'import-btn';
    importBtn.onclick = importChecklist;
    importBtn.style.cssText = `
        background: #ecf0f1;
        color: #2c3e50;
        border: 1px solid #d5dbdb;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        margin: 0 8px;
        font-weight: 500;
        transition: all 0.2s ease;
        font-size: 0.9rem;
    `;
    
    // Add hover effects
    [exportBtn, importBtn].forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.background = '#d5dbdb';
            this.style.transform = 'translateY(-1px)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.background = '#ecf0f1';
            this.style.transform = 'translateY(0)';
        });
    });
    
    header.appendChild(exportBtn);
    header.appendChild(importBtn);
});

// Mobile-specific features setup
function setupMobileFeatures() {
    if (!isMobile) return;
    
    // Add touch feedback to buttons
    addTouchFeedback();
    
    // Setup swipe gestures for category tabs
    setupSwipeGestures();
    
    // Improve mobile scrolling
    improveMobileScrolling();
    
    // Add mobile-specific event listeners
    addMobileEventListeners();
    
    // Optimize for mobile performance
    optimizeForMobile();
}

// Add touch feedback to interactive elements
function addTouchFeedback() {
    const touchElements = document.querySelectorAll('.google-signin-btn, .add-btn, .edit-btn, .delete-btn, .save-btn, .cancel-btn, .category-tab');
    
    touchElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
            this.style.opacity = '0.8';
        });
        
        element.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
            this.style.opacity = '1';
        });
        
        element.addEventListener('touchcancel', function() {
            this.style.transform = 'scale(1)';
            this.style.opacity = '1';
        });
    });
}

// Setup swipe gestures for category tabs
function setupSwipeGestures() {
    const categoryTabs = document.querySelector('.category-tabs');
    if (!categoryTabs) return;
    
    categoryTabs.addEventListener('touchstart', handleTouchStart, false);
    categoryTabs.addEventListener('touchmove', handleTouchMove, false);
    categoryTabs.addEventListener('touchend', handleTouchEnd, false);
}

// Touch event handlers for swipe gestures
function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = event.touches[0].clientX;
    const touchEndY = event.touches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // Only handle horizontal swipes
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        event.preventDefault();
    }
}

function handleTouchEnd(event) {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // Horizontal swipe threshold
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 100) {
        if (diffX > 0) {
            // Swipe left - next category
            navigateToNextCategory();
        } else {
            // Swipe right - previous category
            navigateToPreviousCategory();
        }
    }
    
    touchStartX = 0;
    touchStartY = 0;
}

// Navigate to next category
function navigateToNextCategory() {
    const activeTab = document.querySelector('.category-tab.active');
    const nextTab = activeTab.nextElementSibling;
    
    if (nextTab && nextTab.classList.contains('category-tab')) {
        nextTab.click();
    }
}

// Navigate to previous category
function navigateToPreviousCategory() {
    const activeTab = document.querySelector('.category-tab.active');
    const prevTab = activeTab.previousElementSibling;
    
    if (prevTab && prevTab.classList.contains('category-tab')) {
        prevTab.click();
    }
}

// Improve mobile scrolling performance
function improveMobileScrolling() {
    // Add momentum scrolling for iOS
    const scrollableElements = document.querySelectorAll('.category-tabs, .items-list');
    scrollableElements.forEach(element => {
        element.style.webkitOverflowScrolling = 'touch';
    });
    
    // Optimize scroll performance
    let ticking = false;
    function updateScroll() {
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateScroll);
            ticking = true;
        }
    }
    
    scrollableElements.forEach(element => {
        element.addEventListener('scroll', requestTick, { passive: true });
    });
}

// Add mobile-specific event listeners
function addMobileEventListeners() {
    // Prevent zoom on double tap for form inputs
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('touchend', function(e) {
            // Prevent double-tap zoom on iOS
            e.preventDefault();
            this.focus();
        });
    });
    
    // Add haptic feedback for mobile devices
    if ('vibrate' in navigator) {
        const interactiveElements = document.querySelectorAll('.item-checkbox, .edit-btn, .delete-btn');
        interactiveElements.forEach(element => {
            element.addEventListener('click', function() {
                navigator.vibrate(10);
            });
        });
    }
    
    // Handle orientation change
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            // Refresh layout after orientation change
            window.scrollTo(0, 0);
            updateProgress();
        }, 100);
    });
}

// Optimize for mobile performance
function optimizeForMobile() {
    // Reduce animations on low-end devices
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        document.body.style.setProperty('--transition-duration', '0.1s');
    }
    
    // Optimize images and icons for mobile
    const icons = document.querySelectorAll('.fas, .fab');
    icons.forEach(icon => {
        icon.style.willChange = 'transform';
    });
    
    // Add passive event listeners for better scroll performance
    const passiveElements = document.querySelectorAll('.category-tabs, .items-list');
    passiveElements.forEach(element => {
        element.addEventListener('touchstart', function() {}, { passive: true });
        element.addEventListener('touchmove', function() {}, { passive: true });
    });
}

 