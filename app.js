// Application State
let entries = [];
let editingId = null;
let viewingId = null;
let deletingId = null;
let deferredPrompt = null;
let isSignedIn = false;
let gapiLoaded = false;
let gisLoaded = false;

// DOM Elements
const entriesList = document.getElementById('entriesList');
const emptyState = document.getElementById('emptyState');
const emptyStateTitle = document.getElementById('emptyStateTitle');
const emptyStateMessage = document.getElementById('emptyStateMessage');
const loadingState = document.getElementById('loadingState');
const authRequiredState = document.getElementById('authRequiredState');
const authSection = document.getElementById('authSection');
const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const authRequiredBtn = document.getElementById('authRequiredBtn');
const userInfo = document.getElementById('userInfo');
const addBtn = document.getElementById('addBtn');
const installBtn = document.getElementById('installBtn');
const syncBtn = document.getElementById('syncBtn');
const upgradeBtn = document.getElementById('upgradeBtn');
const entryModal = document.getElementById('entryModal');
const viewModal = document.getElementById('viewModal');
const deleteModal = document.getElementById('deleteModal');
const entryForm = document.getElementById('entryForm');
const closeModal = document.getElementById('closeModal');
const closeViewModal = document.getElementById('closeViewModal');
const closeDeleteModal = document.getElementById('closeDeleteModal');
const cancelBtn = document.getElementById('cancelBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const deleteConfirmInput = document.getElementById('deleteConfirmInput');
const deleteError = document.getElementById('deleteError');
const editFromViewBtn = document.getElementById('editFromViewBtn');
const closeViewBtn = document.getElementById('closeViewBtn');
const viewContent = document.getElementById('viewContent');
const monthFilter = document.getElementById('monthFilter');
const searchInput = document.getElementById('searchInput');

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    setupEventListeners();
    registerServiceWorker();
    setupInstallPrompt();
    
    // Ensure UI is set up for working without auth
    updateAuthUI();
    if (authRequiredState) authRequiredState.style.display = 'none';
    
    // Load entries from localStorage immediately
    await loadEntries();
    
    // Initialize Google APIs (but don't auto-sign-in)
    await initializeGoogleAPIs();
});

// Event Listeners
function setupEventListeners() {
    if (addBtn) addBtn.addEventListener('click', () => openModal());
    if (signInBtn) signInBtn.addEventListener('click', handleSignIn);
    if (signOutBtn) signOutBtn.addEventListener('click', handleSignOut);
    if (authRequiredBtn) authRequiredBtn.addEventListener('click', handleSignIn);
    if (syncBtn) syncBtn.addEventListener('click', handleSync);
    if (installBtn) installBtn.addEventListener('click', handleInstallClick);
    if (upgradeBtn) upgradeBtn.addEventListener('click', handleUpgrade);
    closeModal.addEventListener('click', () => closeModalHandler());
    closeViewModal.addEventListener('click', () => closeViewModalHandler());
    closeDeleteModal.addEventListener('click', () => closeDeleteModalHandler());
    cancelBtn.addEventListener('click', () => closeModalHandler());
    cancelDeleteBtn.addEventListener('click', () => closeDeleteModalHandler());
    closeViewBtn.addEventListener('click', () => closeViewModalHandler());
    editFromViewBtn.addEventListener('click', () => {
        closeViewModalHandler();
        if (viewingId) {
            openModal(viewingId);
        }
    });
    entryModal.addEventListener('click', (e) => {
        if (e.target === entryModal) closeModalHandler();
    });
    viewModal.addEventListener('click', (e) => {
        if (e.target === viewModal) closeViewModalHandler();
    });
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModalHandler();
    });
    entryForm.addEventListener('submit', handleSubmit);
    monthFilter.addEventListener('change', renderEntries);
    searchInput.addEventListener('input', () => {
        renderEntries();
    });
    searchInput.addEventListener('keyup', () => {
        renderEntries();
    });
    
    // Delete confirmation input handler
    deleteConfirmInput.addEventListener('input', (e) => {
        const inputValue = e.target.value.trim();
        if (inputValue === 'מחק') {
            confirmDeleteBtn.disabled = false;
            deleteError.style.display = 'none';
        } else {
            confirmDeleteBtn.disabled = true;
            if (inputValue.length > 0) {
                deleteError.style.display = 'block';
            } else {
                deleteError.style.display = 'none';
            }
        }
    });
    
    confirmDeleteBtn.addEventListener('click', () => {
        if (deleteConfirmInput.value.trim() === 'מחק' && deletingId) {
            performDelete(deletingId);
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (entryModal.classList.contains('active')) {
                closeModalHandler();
            } else if (viewModal.classList.contains('active')) {
                closeViewModalHandler();
            } else if (deleteModal.classList.contains('active')) {
                closeDeleteModalHandler();
            }
        }
    });
}

// Load entries from localStorage (always use local storage)
async function loadEntries() {
    const saved = localStorage.getItem('birthEntries2026');
    if (saved) {
        entries = JSON.parse(saved);
        renderEntries();
    } else {
        entries = [];
        renderEntries();
    }
}

// Save entries to localStorage (always use local storage)
async function saveEntries() {
    localStorage.setItem('birthEntries2026', JSON.stringify(entries));
}

// Open Modal
function openModal(id = null) {
    editingId = id;
    const modalTitle = document.getElementById('modalTitle');
    
    if (id) {
        modalTitle.textContent = 'ערוך רשומה';
        const entry = entries.find(e => e.id === id);
        if (entry) {
            fillForm(entry);
        }
    } else {
        modalTitle.textContent = 'הוסף רשומה חדשה';
        entryForm.reset();
        document.getElementById('entryId').value = '';
    }
    
    entryModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close Modal
function closeModalHandler() {
    entryModal.classList.remove('active');
    document.body.style.overflow = '';
    entryForm.reset();
    editingId = null;
}

// Fill form with entry data
function fillForm(entry) {
    document.getElementById('entryId').value = entry.id;
    document.getElementById('month').value = entry.month || '';
    document.getElementById('estimatedDate').value = entry.estimatedDate || '';
    document.getElementById('motherName').value = entry.motherName || '';
    document.getElementById('fatherName').value = entry.fatherName || '';
    document.getElementById('familyName').value = entry.familyName || '';
    document.getElementById('birthNumber').value = entry.birthNumber || '';
    document.getElementById('agreedAmount').value = entry.agreedAmount || '';
    document.getElementById('includes').value = entry.includes || '';
    document.getElementById('actualAmount').value = entry.actualAmount || '';
    document.getElementById('notes').value = entry.notes || '';
    document.getElementById('birthDate').value = entry.birthDate || '';
    document.getElementById('babyGender').value = entry.babyGender || '';
    document.getElementById('birthPlace').value = entry.birthPlace || '';
    document.getElementById('referralSource').value = entry.referralSource || '';
    
    // Backward compatibility: if old 'names' field exists, try to parse it
    if (entry.names && !entry.motherName && !entry.familyName) {
        const nameParts = entry.names.split(' ');
        if (nameParts.length >= 1) {
            document.getElementById('familyName').value = nameParts[nameParts.length - 1];
            if (nameParts.length >= 2) {
                document.getElementById('motherName').value = nameParts[0];
                if (nameParts.length >= 3) {
                    document.getElementById('fatherName').value = nameParts.slice(1, -1).join(' ');
                }
            }
        }
    }
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: document.getElementById('entryId').value || generateId(),
        month: document.getElementById('month').value,
        estimatedDate: document.getElementById('estimatedDate').value,
        motherName: document.getElementById('motherName').value.trim(),
        fatherName: document.getElementById('fatherName').value.trim(),
        familyName: document.getElementById('familyName').value.trim(),
        // Create full name for backward compatibility and display
        names: (() => {
            const mother = document.getElementById('motherName').value.trim();
            const father = document.getElementById('fatherName').value.trim();
            const family = document.getElementById('familyName').value.trim();
            const parts = [mother, father, family].filter(p => p);
            return parts.join(' ');
        })(),
        birthNumber: parseInt(document.getElementById('birthNumber').value),
        agreedAmount: parseInt(document.getElementById('agreedAmount').value),
        includes: document.getElementById('includes').value,
        actualAmount: document.getElementById('actualAmount').value ? 
            parseInt(document.getElementById('actualAmount').value) : null,
        notes: document.getElementById('notes').value,
        birthDate: document.getElementById('birthDate').value,
        babyGender: document.getElementById('babyGender').value,
        birthPlace: document.getElementById('birthPlace').value,
        referralSource: document.getElementById('referralSource').value,
        createdAt: editingId ? 
            entries.find(e => e.id === editingId)?.createdAt || new Date().toISOString() :
            new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Always save to localStorage first
    if (editingId) {
        const index = entries.findIndex(e => e.id === editingId);
        if (index !== -1) {
            entries[index] = formData;
        }
    } else {
        entries.push(formData);
    }
    await saveEntries();
    
    // Optionally sync to calendar if signed in (but don't block on it)
    if (isSignedIn && gapiLoaded) {
        try {
            if (editingId) {
                const existingEntry = entries.find(e => e.id === editingId);
                if (existingEntry?.eventId) {
                    // Update existing event
                    await updateEventInCalendar(existingEntry.eventId, formData);
                    const index = entries.findIndex(e => e.id === editingId);
                    if (index !== -1) {
                        entries[index] = { ...formData, eventId: existingEntry.eventId };
                        await saveEntries();
                    }
                }
                // If no eventId, will be created on next sync
            }
            // New entries will be synced on next sync button click
        } catch (error) {
            console.error('Error syncing to calendar (non-blocking):', error);
            // Don't show error to user - data is saved locally
        }
    }
    
    renderEntries();
    closeModalHandler();
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Delete entry - show confirmation modal
function deleteEntry(id) {
    deletingId = id;
    deleteConfirmInput.value = '';
    deleteError.style.display = 'none';
    confirmDeleteBtn.disabled = true;
    deleteModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    deleteConfirmInput.focus();
}

// Perform actual deletion
async function performDelete(id) {
    // Get entry info before deleting (for calendar deletion)
    const entry = entries.find(e => e.id === id);
    const eventId = entry?.eventId;
    
    // Always delete from local storage
    entries = entries.filter(e => e.id !== id);
    await saveEntries();
    renderEntries();
    closeDeleteModalHandler();
    
    // Optionally delete from calendar if signed in (but don't block on it)
    if (eventId && isSignedIn && gapiLoaded) {
        try {
            await deleteEventFromCalendar(eventId);
        } catch (error) {
            console.error('Error deleting from calendar (non-blocking):', error);
            // Don't show error - entry is already deleted locally
        }
    }
}

// Close delete modal
function closeDeleteModalHandler() {
    deleteModal.classList.remove('active');
    document.body.style.overflow = '';
    deleteConfirmInput.value = '';
    deleteError.style.display = 'none';
    confirmDeleteBtn.disabled = true;
    deletingId = null;
}

// Edit entry
function editEntry(id) {
    openModal(id);
}

// View entry
function viewEntry(id) {
    viewingId = id;
    const entry = entries.find(e => e.id === id);
    if (entry) {
        renderViewContent(entry);
        viewModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close view modal
function closeViewModalHandler() {
    viewModal.classList.remove('active');
    document.body.style.overflow = '';
    viewingId = null;
}

// Render view content
function renderViewContent(entry) {
    const formatDate = (dateStr) => {
        if (!dateStr) return 'לא צוין';
        const date = new Date(dateStr);
        return date.toLocaleDateString('he-IL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return 'לא צוין';
        return new Intl.NumberFormat('he-IL', {
            style: 'currency',
            currency: 'ILS'
        }).format(amount);
    };

    const fullName = [
        entry.motherName,
        entry.fatherName,
        entry.familyName
    ].filter(n => n).join(' ') || entry.names || 'לא צוין';

    viewContent.innerHTML = `
        <div class="view-details">
            <div class="view-section">
                <h3>פרטי לקוח</h3>
                <div class="view-row">
                    <span class="view-label">שם מלא:</span>
                    <span class="view-value">${escapeHtml(fullName)}</span>
                </div>
                ${entry.motherName ? `
                    <div class="view-row">
                        <span class="view-label">שם האם:</span>
                        <span class="view-value">${escapeHtml(entry.motherName)}</span>
                    </div>
                ` : ''}
                ${entry.fatherName ? `
                    <div class="view-row">
                        <span class="view-label">שם האב:</span>
                        <span class="view-value">${escapeHtml(entry.fatherName)}</span>
                    </div>
                ` : ''}
                ${entry.familyName ? `
                    <div class="view-row">
                        <span class="view-label">שם משפחה:</span>
                        <span class="view-value">${escapeHtml(entry.familyName)}</span>
                    </div>
                ` : ''}
                <div class="view-row">
                    <span class="view-label">חודש:</span>
                    <span class="view-value">${entry.month || 'לא צוין'}</span>
                </div>
                <div class="view-row">
                    <span class="view-label">תאריך משוער:</span>
                    <span class="view-value">${formatDate(entry.estimatedDate)}</span>
                </div>
                <div class="view-row">
                    <span class="view-label">מספר לידה:</span>
                    <span class="view-value">${entry.birthNumber || 'לא צוין'}</span>
                </div>
            </div>

            <div class="view-section">
                <h3>פרטי תשלום</h3>
                <div class="view-row">
                    <span class="view-label">סכום שסוכם:</span>
                    <span class="view-value">${formatCurrency(entry.agreedAmount)}</span>
                </div>
                <div class="view-row">
                    <span class="view-label">שולם בפועל:</span>
                    <span class="view-value">${formatCurrency(entry.actualAmount)}</span>
                </div>
                ${entry.includes ? `
                    <div class="view-row full-width">
                        <span class="view-label">מה כולל:</span>
                        <span class="view-value">${escapeHtml(entry.includes)}</span>
                    </div>
                ` : ''}
            </div>

            <div class="view-section">
                <h3>פרטי לידה</h3>
                <div class="view-row">
                    <span class="view-label">תאריך הלידה:</span>
                    <span class="view-value">${formatDate(entry.birthDate)}</span>
                </div>
                <div class="view-row">
                    <span class="view-label">מין היילוד:</span>
                    <span class="view-value">${entry.babyGender || 'לא צוין'}</span>
                </div>
                <div class="view-row">
                    <span class="view-label">מקום לידה:</span>
                    <span class="view-value">${escapeHtml(entry.birthPlace) || 'לא צוין'}</span>
                </div>
            </div>

            ${entry.referralSource ? `
                <div class="view-section">
                    <h3>הפנייה</h3>
                    <div class="view-row">
                        <span class="view-label">הגיעה דרך:</span>
                        <span class="view-value">${escapeHtml(entry.referralSource)}</span>
                    </div>
                </div>
            ` : ''}

            ${entry.notes ? `
                <div class="view-section">
                    <h3>הערות</h3>
                    <div class="view-row full-width">
                        <span class="view-value notes-text">${escapeHtml(entry.notes)}</span>
                    </div>
                </div>
            ` : ''}

            <div class="view-section">
                <h3>מידע טכני</h3>
                <div class="view-row">
                    <span class="view-label">נוצר ב:</span>
                    <span class="view-value">${formatDate(entry.createdAt)}</span>
                </div>
                ${entry.updatedAt !== entry.createdAt ? `
                    <div class="view-row">
                        <span class="view-label">עודכן לאחרונה:</span>
                        <span class="view-value">${formatDate(entry.updatedAt)}</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Render entries
function renderEntries() {
    let filteredEntries = [...entries];

    // Filter by month
    const selectedMonth = monthFilter.value;
    if (selectedMonth) {
        filteredEntries = filteredEntries.filter(e => e.month === selectedMonth);
    }

    // Filter by search
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm) {
        filteredEntries = filteredEntries.filter(e => {
            const searchableText = [
                e.names,
                e.motherName,
                e.fatherName,
                e.familyName,
                e.notes,
                e.birthPlace,
                e.referralSource
            ].filter(t => t).join(' ').toLowerCase();
            return searchableText.includes(searchTerm);
        });
    }

    // Sort by estimated date (newest first)
    filteredEntries.sort((a, b) => {
        const dateA = a.estimatedDate || '';
        const dateB = b.estimatedDate || '';
        return dateB.localeCompare(dateA);
    });

    if (filteredEntries.length === 0) {
        entriesList.innerHTML = '';
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        entriesList.innerHTML = filteredEntries.map(entry => createEntryCard(entry)).join('');
    }

    // Attach event listeners to view buttons (use event delegation for better reliability)
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = e.currentTarget.closest('.entry-card');
            if (card) {
                const id = card.dataset.id;
                if (id) {
                    viewEntry(id);
                }
            }
        });
    });

    // Attach event listeners to edit buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = e.currentTarget.closest('.entry-card');
            if (card) {
                const id = card.dataset.id;
                if (id) {
                    editEntry(id);
                }
            }
        });
    });

    // Attach event listeners to delete buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = e.currentTarget.closest('.entry-card');
            if (card) {
                const id = card.dataset.id;
                if (id) {
                    deleteEntry(id);
                }
            }
        });
    });
}

// Create entry card HTML
function createEntryCard(entry) {
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('he-IL');
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '';
        return new Intl.NumberFormat('he-IL', {
            style: 'currency',
            currency: 'ILS'
        }).format(amount);
    };

    const fullName = [
        entry.motherName,
        entry.fatherName,
        entry.familyName
    ].filter(n => n).join(' ') || entry.names || 'ללא שם';

    return `
        <div class="entry-card" data-id="${entry.id}">
            <div class="entry-header">
                <div>
                    <h3 class="entry-title">${escapeHtml(fullName)}</h3>
                    ${entry.month ? `<span class="badge badge-month">${entry.month}</span>` : ''}
                </div>
                <div class="entry-actions">
                    <button class="btn btn-view">👁️ צפה</button>
                    <button class="btn btn-edit">✏️ ערוך</button>
                    <button class="btn btn-delete">🗑️ מחק</button>
                </div>
            </div>
            <div class="entry-details">
                ${entry.estimatedDate ? `
                    <div class="detail-item">
                        <span class="detail-label">תאריך משוער</span>
                        <span class="detail-value">${formatDate(entry.estimatedDate)}</span>
                    </div>
                ` : ''}
                ${entry.birthNumber ? `
                    <div class="detail-item">
                        <span class="detail-label">מספר לידה</span>
                        <span class="detail-value">${entry.birthNumber}</span>
                    </div>
                ` : ''}
                ${entry.agreedAmount ? `
                    <div class="detail-item">
                        <span class="detail-label">סכום שסוכם</span>
                        <span class="detail-value">${formatCurrency(entry.agreedAmount)}</span>
                    </div>
                ` : ''}
                ${entry.actualAmount !== null ? `
                    <div class="detail-item">
                        <span class="detail-label">שולם בפועל</span>
                        <span class="detail-value">${formatCurrency(entry.actualAmount)}</span>
                    </div>
                ` : ''}
                ${entry.birthDate ? `
                    <div class="detail-item">
                        <span class="detail-label">תאריך הלידה</span>
                        <span class="detail-value">${formatDate(entry.birthDate)}</span>
                    </div>
                ` : ''}
                ${entry.babyGender ? `
                    <div class="detail-item">
                        <span class="detail-label">מין היילוד</span>
                        <span class="detail-value">${entry.babyGender}</span>
                    </div>
                ` : ''}
                ${entry.birthPlace ? `
                    <div class="detail-item">
                        <span class="detail-label">מקום לידה</span>
                        <span class="detail-value">${escapeHtml(entry.birthPlace)}</span>
                    </div>
                ` : ''}
                ${entry.referralSource ? `
                    <div class="detail-item">
                        <span class="detail-label">הגיעה דרך</span>
                        <span class="detail-value">${escapeHtml(entry.referralSource)}</span>
                    </div>
                ` : ''}
                ${entry.includes ? `
                    <div class="detail-item" style="grid-column: 1 / -1;">
                        <span class="detail-label">מה כולל</span>
                        <span class="detail-value">${escapeHtml(entry.includes)}</span>
                    </div>
                ` : ''}
                ${entry.notes ? `
                    <div class="detail-item" style="grid-column: 1 / -1;">
                        <span class="detail-label">הערות</span>
                        <span class="detail-value">${escapeHtml(entry.notes)}</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Setup Install Prompt
function setupInstallPrompt() {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        installBtn.style.display = 'none';
        return;
    }

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        // Show install button
        installBtn.style.display = 'inline-flex';
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
        console.log('PWA was installed');
        installBtn.style.display = 'none';
        deferredPrompt = null;
    });
}

// Handle Install Button Click
async function handleInstallClick() {
    if (!deferredPrompt) {
        // Show manual installation instructions
        alert('להורדת האפליקציה:\n\nChrome/Edge: לחץ על התפריט (⋮) > "הוסף למסך הבית" או "התקן אפליקציה"\n\nFirefox: לחץ על התפריט (☰) > "התקן" או "Add to Home Screen"\n\nSafari (iOS): לחץ על Share > "הוסף למסך הבית"');
        return;
    }

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response to install prompt: ${outcome}`);
    
    // Clear the deferredPrompt
    deferredPrompt = null;
    
    // Hide the install button
    installBtn.style.display = 'none';
}

// ==================== Google Calendar API Integration ====================

// Initialize Google APIs
async function initializeGoogleAPIs() {
    console.log('Initializing Google APIs...');
    
    try {
        // Wait for gapi to be loaded
        await new Promise((resolve) => {
            if (typeof gapi !== 'undefined' && gapi.load) {
                console.log('gapi found, loading client...');
                gapi.load('client', async () => {
                    try {
                        console.log('Initializing gapi client...');
                        await gapi.client.init({
                            apiKey: GOOGLE_CONFIG.API_KEY || '',
                            discoveryDocs: GOOGLE_CONFIG.DISCOVERY_DOCS
                        });
                        gapiLoaded = true;
                        console.log('gapi client initialized');
                        resolve();
                    } catch (error) {
                        console.error('Error initializing gapi client:', error);
                        // Still resolve to allow the app to continue
                        resolve();
                    }
                });
            } else {
                console.log('Waiting for gapi to load...');
                // Wait for gapi to load
                const checkGapi = setInterval(() => {
                    if (typeof gapi !== 'undefined' && gapi.load) {
                        clearInterval(checkGapi);
                        console.log('gapi found, loading client...');
                        gapi.load('client', async () => {
                            try {
                                console.log('Initializing gapi client...');
                                await gapi.client.init({
                                    apiKey: GOOGLE_CONFIG.API_KEY || '',
                                    discoveryDocs: GOOGLE_CONFIG.DISCOVERY_DOCS
                                });
                                gapiLoaded = true;
                                console.log('gapi client initialized');
                                resolve();
                            } catch (error) {
                                console.error('Error initializing gapi client:', error);
                                resolve();
                            }
                        });
                    }
                }, 100);
                
                // Timeout after 10 seconds
                setTimeout(() => {
                    clearInterval(checkGapi);
                    console.error('GAPI loading timeout - continuing anyway');
                    resolve();
                }, 10000);
            }
        });
        
        // Wait for Google Identity Services
        await new Promise((resolve) => {
            if (typeof google !== 'undefined' && google.accounts) {
                console.log('Google Identity Services found');
                gisLoaded = true;
                resolve();
            } else {
                console.log('Waiting for Google Identity Services...');
                const checkGoogle = setInterval(() => {
                    if (typeof google !== 'undefined' && google.accounts) {
                        clearInterval(checkGoogle);
                        console.log('Google Identity Services found');
                        gisLoaded = true;
                        resolve();
                    }
                }, 100);
                
                setTimeout(() => {
                    clearInterval(checkGoogle);
                    console.error('Google Identity Services loading timeout - continuing anyway');
                    resolve();
                }, 10000);
            }
        });
        
        console.log('Google APIs initialization complete. gapiLoaded:', gapiLoaded, 'gisLoaded:', gisLoaded);
        updateAuthUI();
        
        // Try to restore previous session token (but don't auto-sign-in)
        // Wait a bit for everything to be ready, then restore token
        setTimeout(async () => {
            await restoreAuthToken();
        }, 500);
    } catch (error) {
        console.error('Error initializing Google APIs:', error);
        // Don't block - app works without Google Calendar
        updateAuthUI();
    }
}

// Restore authentication token from localStorage
async function restoreAuthToken() {
    // Wait for APIs to be fully loaded
    if (!gapiLoaded || !gapi.client || !gisLoaded) {
        console.log('APIs not ready yet, will retry token restoration');
        // Retry after a short delay
        setTimeout(() => restoreAuthToken(), 1000);
        return;
    }
    
    try {
        // Try to restore token from localStorage
        const savedToken = localStorage.getItem('googleCalendarToken');
        if (savedToken) {
            const tokenData = JSON.parse(savedToken);
            
            // Check if we have the required access_token
            if (!tokenData.access_token) {
                console.log('Saved token missing access_token, clearing');
                localStorage.removeItem('googleCalendarToken');
                return;
            }
            
            // Create token object in the format Google expects
            const token = {
                access_token: tokenData.access_token,
                expires_in: tokenData.expires_in,
                scope: tokenData.scope,
                token_type: tokenData.token_type || 'Bearer'
            };
            
            // Set the token - Google will handle validation when we use it
            gapi.client.setToken(token);
            
            // Mark as signed in - if token is expired, Google will handle it on next API call
            isSignedIn = true;
            updateAuthUI();
            if (userInfo) {
                userInfo.textContent = `מחובר ללוח שנה`;
            }
            console.log('Restored authentication token from localStorage');
            
            // Optionally verify token is still valid (non-blocking)
            // If it fails, we'll handle it when user tries to sync
            gapi.client.calendar.calendarList.list({ maxResults: 1 })
                .then(() => {
                    console.log('Token verified successfully');
                })
                .catch((error) => {
                    console.log('Token may be expired, will need refresh on next sync:', error);
                    // Don't clear token here - let user try to sync, which will trigger refresh
                });
        } else {
            console.log('No saved token found');
        }
    } catch (error) {
        console.error('Error restoring auth token:', error);
        // Clear potentially corrupted token
        try {
            localStorage.removeItem('googleCalendarToken');
            if (gapi.client) {
                gapi.client.setToken(null);
            }
        } catch (e) {
            console.error('Error clearing token:', e);
        }
        isSignedIn = false;
        updateAuthUI();
    }
}

// Handle sign in
async function handleSignIn() {
    console.log('handleSignIn called');
    console.log('gapiLoaded:', gapiLoaded);
    console.log('gisLoaded:', gisLoaded);
    console.log('typeof google:', typeof google);
    console.log('typeof gapi:', typeof gapi);
    
    if (!gapiLoaded) {
        console.error('gapi not loaded yet');
        alert('טוען את Google API. אנא נסה שוב בעוד רגע.');
        return;
    }
    
    if (!gisLoaded) {
        console.error('Google Identity Services not loaded yet');
        alert('טוען את Google Identity Services. אנא נסה שוב בעוד רגע.');
        return;
    }
    
    try {
        if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
            alert('Google Identity Services לא נטענו. אנא רענן את הדף.');
            return;
        }
        
        if (GOOGLE_CONFIG.CLIENT_ID.includes('YOUR_CLIENT_ID') || !GOOGLE_CONFIG.CLIENT_ID || GOOGLE_CONFIG.CLIENT_ID.trim() === '') {
            alert('אנא הגדר את ה-Client ID ב-config.js.\n\nעקב אחרי ההנחיות ב-GOOGLE_SETUP.md כדי לקבל Client ID מ-Google Cloud Console.');
            console.error('Client ID not configured. Current value:', GOOGLE_CONFIG.CLIENT_ID);
            return;
        }
        
        const tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CONFIG.CLIENT_ID,
            scope: GOOGLE_CONFIG.SCOPES,
            callback: (tokenResponse) => {
                console.log('Token response:', tokenResponse);
                if (tokenResponse && tokenResponse.access_token) {
                    // Calculate expiration time (tokens typically last 1 hour, but we'll use the expires_in if provided)
                    const expiresIn = tokenResponse.expires_in || 3600; // Default to 1 hour
                    const expiresAt = new Date().getTime() + (expiresIn * 1000);
                    
                    // Store token with all necessary fields
                    const tokenToStore = {
                        access_token: tokenResponse.access_token,
                        expires_in: tokenResponse.expires_in || expiresIn,
                        scope: tokenResponse.scope,
                        token_type: tokenResponse.token_type || 'Bearer',
                        expires_at: expiresAt
                    };
                    localStorage.setItem('googleCalendarToken', JSON.stringify(tokenToStore));
                    
                    // Set token in gapi client
                    gapi.client.setToken({
                        access_token: tokenResponse.access_token,
                        expires_in: tokenResponse.expires_in,
                        scope: tokenResponse.scope,
                        token_type: tokenResponse.token_type || 'Bearer'
                    });
                    
                    handleAuthSuccess();
                } else if (tokenResponse.error) {
                    console.error('OAuth error:', tokenResponse.error);
                    let errorMsg = 'שגיאה בהתחברות: ' + tokenResponse.error;
                    
                    if (tokenResponse.error === 'invalid_client') {
                        errorMsg += '\n\nזה בדרך כלל אומר ש:\n';
                        errorMsg += '1. ה-Client ID לא קיים או שגוי\n';
                        errorMsg += '2. ה-URL הנוכחי לא ברשימת Authorized JavaScript origins\n\n';
                        errorMsg += 'בדוק ב-Google Cloud Console:\n';
                        errorMsg += '- Credentials > OAuth 2.0 Client ID שלך\n';
                        errorMsg += '- ודא ש-http://localhost:8000 ב-Authorized JavaScript origins';
                    }
                    
                    alert(errorMsg);
                }
            }
        });
        
        // Use empty prompt to avoid re-prompting if already authorized
        // This will use cached credentials if available
        tokenClient.requestAccessToken({ prompt: '' });
    } catch (error) {
        console.error('Error signing in:', error);
        alert('שגיאה בהתחברות ל-Google: ' + error.message + '\n\nאנא ודא שה-API credentials מוגדרים נכון ב-config.js');
    }
}

// Handle credential response (for Google Identity Services)
function handleCredentialResponse(response) {
    // This is for Google Sign-In button, we use OAuth2 token flow instead
}

// Handle successful authentication
async function handleAuthSuccess() {
    console.log('Authentication successful');
    isSignedIn = true;
    updateAuthUI();
    
    // Get user info
    try {
        if (userInfo) {
            userInfo.textContent = `מחובר ללוח שנה`;
        }
    } catch (error) {
        console.error('Error getting user info:', error);
    }
    
    // Don't load entries from calendar - data stays local
    // User can sync manually using sync button
}

// Handle sign out
function handleSignOut() {
    console.log('Signing out');
    const token = gapi.client.getToken();
    if (token) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
    }
    // Remove saved token
    localStorage.removeItem('googleCalendarToken');
    isSignedIn = false;
    // Don't clear entries - they stay in localStorage
    updateAuthUI();
}

// Update authentication UI
function updateAuthUI() {
    if (authSection) authSection.style.display = 'flex';
    if (signInBtn) signInBtn.style.display = isSignedIn ? 'none' : 'inline-flex';
    if (signOutBtn) signOutBtn.style.display = isSignedIn ? 'inline-flex' : 'none';
    // Always show add button - data is stored locally
    if (addBtn) addBtn.style.display = 'inline-flex';
    // Show sync button - will trigger login if needed
    if (syncBtn) syncBtn.style.display = 'inline-flex';
}

// Show loading state
function showLoading() {
    if (loadingState) loadingState.style.display = 'block';
    if (emptyState) emptyState.classList.add('hidden');
    if (authRequiredState) authRequiredState.style.display = 'none';
}

// Hide loading state
function hideLoading() {
    if (loadingState) loadingState.style.display = 'none';
}

// Show auth required state (not used anymore - data is always local)
function showAuthRequired() {
    // Don't show auth required - app works without Google Calendar
    if (authRequiredState) authRequiredState.style.display = 'none';
}

// Convert entry to calendar event
function entryToCalendarEvent(entry) {
    const fullName = [
        entry.motherName,
        entry.fatherName,
        entry.familyName
    ].filter(n => n).join(' ') || entry.names || 'ללא שם';
    
    const eventTitle = `לידה: ${fullName}`;
    
    // Build description from entry fields
    const descriptionParts = [];
    if (entry.birthNumber) descriptionParts.push(`מספר לידה: ${entry.birthNumber}`);
    if (entry.agreedAmount) descriptionParts.push(`סכום שסוכם: ${entry.agreedAmount} ₪`);
    if (entry.actualAmount !== null) descriptionParts.push(`שולם בפועל: ${entry.actualAmount} ₪`);
    if (entry.includes) descriptionParts.push(`מה כולל: ${entry.includes}`);
    if (entry.birthPlace) descriptionParts.push(`מקום לידה: ${entry.birthPlace}`);
    if (entry.babyGender) descriptionParts.push(`מין היילוד: ${entry.babyGender}`);
    if (entry.referralSource) descriptionParts.push(`הגיעה דרך: ${entry.referralSource}`);
    if (entry.notes) descriptionParts.push(`הערות: ${entry.notes}`);
    
    // Store entry data as JSON in extendedProperties
    const entryData = {
        id: entry.id,
        month: entry.month,
        motherName: entry.motherName,
        fatherName: entry.fatherName,
        familyName: entry.familyName,
        birthNumber: entry.birthNumber,
        agreedAmount: entry.agreedAmount,
        actualAmount: entry.actualAmount,
        includes: entry.includes,
        notes: entry.notes,
        birthDate: entry.birthDate,
        babyGender: entry.babyGender,
        birthPlace: entry.birthPlace,
        referralSource: entry.referralSource
    };
    
    const startDate = entry.estimatedDate || entry.birthDate || new Date().toISOString().split('T')[0];
    const endDate = entry.birthDate || startDate;
    
    return {
        summary: eventTitle,
        description: descriptionParts.join('\n'),
        start: {
            date: startDate,
            timeZone: 'Asia/Jerusalem'
        },
        end: {
            date: endDate,
            timeZone: 'Asia/Jerusalem'
        },
        extendedProperties: {
            private: {
                entryData: JSON.stringify(entryData)
            }
        }
    };
}

// Convert calendar event to entry
function calendarEventToEntry(event) {
    try {
        const entryData = event.extendedProperties?.private?.entryData 
            ? JSON.parse(event.extendedProperties.private.entryData)
            : {};
        
        return {
            id: entryData.id || event.id,
            eventId: event.id,
            month: entryData.month || getMonthFromDate(event.start.date || event.start.dateTime),
            estimatedDate: event.start.date || event.start.dateTime?.split('T')[0] || '',
            birthDate: event.end.date || event.end.dateTime?.split('T')[0] || entryData.birthDate || '',
            motherName: entryData.motherName || '',
            fatherName: entryData.fatherName || '',
            familyName: entryData.familyName || '',
            names: entryData.motherName && entryData.familyName 
                ? [entryData.motherName, entryData.fatherName, entryData.familyName].filter(n => n).join(' ')
                : event.summary?.replace('לידה: ', '') || '',
            birthNumber: entryData.birthNumber || 0,
            agreedAmount: entryData.agreedAmount || 0,
            actualAmount: entryData.actualAmount !== undefined ? entryData.actualAmount : null,
            includes: entryData.includes || '',
            notes: entryData.notes || '',
            babyGender: entryData.babyGender || '',
            birthPlace: entryData.birthPlace || '',
            referralSource: entryData.referralSource || '',
            createdAt: entryData.createdAt || new Date().toISOString(),
            updatedAt: event.updated || new Date().toISOString()
        };
    } catch (error) {
        console.error('Error parsing event to entry:', error);
        // Fallback: create basic entry from event
        return {
            id: event.id,
            eventId: event.id,
            names: event.summary?.replace('לידה: ', '') || '',
            estimatedDate: event.start.date || event.start.dateTime?.split('T')[0] || '',
            birthDate: event.end.date || event.end.dateTime?.split('T')[0] || '',
            createdAt: new Date().toISOString(),
            updatedAt: event.updated || new Date().toISOString()
        };
    }
}

// Get month name from date string
function getMonthFromDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const months = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 
                   'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
    return months[date.getMonth()];
}

// Sync local entries to Google Calendar (push only, never delete from local)
async function handleSync() {
    // First, ensure we're signed in
    if (!isSignedIn || !gapi.client || !gapi.client.calendar) {
        // Try to restore token first
        await restoreAuthToken();
        
        // If still not signed in, trigger login
        if (!isSignedIn || !gapi.client || !gapi.client.calendar) {
            await handleSignIn();
            // After sign in, check again
            if (!isSignedIn || !gapi.client || !gapi.client.calendar) {
                return; // User cancelled or error occurred
            }
        }
    }
    
    try {
        showLoading();
        
        // Sync all local entries to Google Calendar
        let syncedCount = 0;
        let errorCount = 0;
        
        for (const entry of entries) {
            try {
                if (entry.eventId) {
                    // Update existing event
                    await updateEventInCalendar(entry.eventId, entry);
                    syncedCount++;
                } else {
                    // Create new event
                    const eventId = await saveEventToCalendar(entry);
                    // Update local entry with eventId
                    const index = entries.findIndex(e => e.id === entry.id);
                    if (index !== -1) {
                        entries[index] = { ...entry, eventId };
                    }
                    syncedCount++;
                }
            } catch (error) {
                // Check if error is due to expired token
                if (error.status === 401 || (error.result && error.result.error && error.result.error.code === 401)) {
                    console.log('Token expired, attempting to refresh...');
                    // Clear current token and try to get a new one
                    localStorage.removeItem('googleCalendarToken');
                    gapi.client.setToken(null);
                    isSignedIn = false;
                    
                    // Try to sign in again (will use cached credentials if available)
                    await handleSignIn();
                    
                    if (isSignedIn && gapi.client.calendar) {
                        // Retry the failed operation
                        try {
                            if (entry.eventId) {
                                await updateEventInCalendar(entry.eventId, entry);
                                syncedCount++;
                            } else {
                                const eventId = await saveEventToCalendar(entry);
                                const index = entries.findIndex(e => e.id === entry.id);
                                if (index !== -1) {
                                    entries[index] = { ...entry, eventId };
                                }
                                syncedCount++;
                            }
                        } catch (retryError) {
                            console.error(`Error syncing entry ${entry.id} after token refresh:`, retryError);
                            errorCount++;
                        }
                    } else {
                        console.error(`Token refresh failed for entry ${entry.id}`);
                        errorCount++;
                    }
                } else {
                    console.error(`Error syncing entry ${entry.id}:`, error);
                    errorCount++;
                }
            }
        }
        
        // Save updated entries with eventIds
        await saveEntries();
        renderEntries();
        hideLoading();
        
        if (errorCount === 0) {
            alert(`סנכרון הושלם בהצלחה! ${syncedCount} רשומות סונכרנו ל-Google Calendar.`);
        } else {
            alert(`סנכרון הושלם עם שגיאות. ${syncedCount} רשומות סונכרנו, ${errorCount} שגיאות.`);
        }
    } catch (error) {
        console.error('Error syncing to calendar:', error);
        hideLoading();
        
        // Check if it's an auth error
        if (error.status === 401 || (error.result && error.result.error && error.result.error.code === 401)) {
            alert('פג תוקף ההתחברות. אנא התחבר מחדש.');
            localStorage.removeItem('googleCalendarToken');
            gapi.client.setToken(null);
            isSignedIn = false;
            updateAuthUI();
        } else {
            alert('שגיאה בסנכרון ל-Google Calendar. אנא נסה שוב.');
        }
    }
}

// Save event to Google Calendar
async function saveEventToCalendar(entry) {
    if (!isSignedIn || !gapi.client.calendar) {
        throw new Error('Not signed in or calendar API not loaded');
    }
    
    const event = entryToCalendarEvent(entry);
    
    try {
        const response = await gapi.client.calendar.events.insert({
            calendarId: GOOGLE_CONFIG.CALENDAR_ID,
            resource: event
        });
        
        return response.result.id;
    } catch (error) {
        console.error('Error saving event to calendar:', error);
        throw error;
    }
}

// Update event in Google Calendar
async function updateEventInCalendar(eventId, entry) {
    if (!isSignedIn || !gapi.client.calendar) {
        throw new Error('Not signed in or calendar API not loaded');
    }
    
    const event = entryToCalendarEvent(entry);
    event.id = eventId;
    
    try {
        await gapi.client.calendar.events.update({
            calendarId: GOOGLE_CONFIG.CALENDAR_ID,
            eventId: eventId,
            resource: event
        });
    } catch (error) {
        console.error('Error updating event in calendar:', error);
        throw error;
    }
}

// Delete event from Google Calendar
async function deleteEventFromCalendar(eventId) {
    if (!isSignedIn || !gapi.client.calendar) {
        throw new Error('Not signed in or calendar API not loaded');
    }
    
    try {
        await gapi.client.calendar.events.delete({
            calendarId: GOOGLE_CONFIG.CALENDAR_ID,
            eventId: eventId
        });
    } catch (error) {
        console.error('Error deleting event from calendar:', error);
        throw error;
    }
}

// Register Service Worker for PWA
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js', { scope: './' })
            .then(registration => {
                console.log('Service Worker registered:', registration);
                
                // Check for updates periodically
                checkForUpdates(registration);
                
                // Check for updates when the page regains focus
                document.addEventListener('visibilitychange', () => {
                    if (!document.hidden) {
                        checkForUpdates(registration);
                    }
                });
                
                // Listen for service worker updates
                registration.addEventListener('updatefound', () => {
                    console.log('New service worker found');
                    const newWorker = registration.installing;
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker is available
                            console.log('New service worker installed, showing upgrade button');
                            if (upgradeBtn) {
                                upgradeBtn.style.display = 'inline-flex';
                            }
                        }
                    });
                });
                
                // Check if there's already a waiting service worker
                if (registration.waiting) {
                    console.log('Service worker waiting to activate');
                    if (upgradeBtn) {
                        upgradeBtn.style.display = 'inline-flex';
                    }
                }
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
        
        // Listen for controller change (service worker updated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('Service worker controller changed, reloading...');
            window.location.reload();
        });
    }
}

// Check for service worker updates
function checkForUpdates(registration) {
    registration.update()
        .then(() => {
            // After update check, see if there's a waiting service worker
            if (registration.waiting) {
                console.log('Service worker waiting to activate (after update check)');
                if (upgradeBtn) {
                    upgradeBtn.style.display = 'inline-flex';
                }
            }
        })
        .catch(error => {
            console.log('Error checking for updates:', error);
        });
}

// Handle upgrade button click
function handleUpgrade() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(registration => {
            if (registration && registration.waiting) {
                // Tell the waiting service worker to skip waiting
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                
                // Hide the upgrade button
                if (upgradeBtn) {
                    upgradeBtn.style.display = 'none';
                }
                
                // The page will reload automatically when the controller changes
            }
        });
    }
}
