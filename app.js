// Application State
let entries = [];
let editingId = null;
let viewingId = null;
let deletingId = null;
let deferredPrompt = null;

// DOM Elements
const entriesList = document.getElementById('entriesList');
const emptyState = document.getElementById('emptyState');
const addBtn = document.getElementById('addBtn');
const installBtn = document.getElementById('installBtn');
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
document.addEventListener('DOMContentLoaded', () => {
    loadEntries();
    renderEntries();
    setupEventListeners();
    registerServiceWorker();
    setupInstallPrompt();
});

// Event Listeners
function setupEventListeners() {
    addBtn.addEventListener('click', () => openModal());
    installBtn.addEventListener('click', handleInstallClick);
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
    searchInput.addEventListener('input', renderEntries);
    
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

// Load entries from localStorage
function loadEntries() {
    const saved = localStorage.getItem('birthEntries2026');
    if (saved) {
        entries = JSON.parse(saved);
    }
}

// Save entries to localStorage
function saveEntries() {
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
    document.getElementById('names').value = entry.names || '';
    document.getElementById('birthNumber').value = entry.birthNumber || '';
    document.getElementById('agreedAmount').value = entry.agreedAmount || '';
    document.getElementById('includes').value = entry.includes || '';
    document.getElementById('actualAmount').value = entry.actualAmount || '';
    document.getElementById('notes').value = entry.notes || '';
    document.getElementById('birthDate').value = entry.birthDate || '';
    document.getElementById('babyGender').value = entry.babyGender || '';
    document.getElementById('birthPlace').value = entry.birthPlace || '';
    document.getElementById('referralSource').value = entry.referralSource || '';
}

// Handle form submission
function handleSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: document.getElementById('entryId').value || generateId(),
        month: document.getElementById('month').value,
        estimatedDate: document.getElementById('estimatedDate').value,
        names: document.getElementById('names').value,
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

    if (editingId) {
        const index = entries.findIndex(e => e.id === editingId);
        if (index !== -1) {
            entries[index] = formData;
        }
    } else {
        entries.push(formData);
    }

    saveEntries();
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
function performDelete(id) {
    entries = entries.filter(e => e.id !== id);
    saveEntries();
    renderEntries();
    closeDeleteModalHandler();
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

    viewContent.innerHTML = `
        <div class="view-details">
            <div class="view-section">
                <h3>פרטי לקוח</h3>
                <div class="view-row">
                    <span class="view-label">שמות:</span>
                    <span class="view-value">${escapeHtml(entry.names)}</span>
                </div>
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
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filteredEntries = filteredEntries.filter(e => 
            e.names?.toLowerCase().includes(searchTerm) ||
            e.notes?.toLowerCase().includes(searchTerm) ||
            e.birthPlace?.toLowerCase().includes(searchTerm) ||
            e.referralSource?.toLowerCase().includes(searchTerm)
        );
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

    // Attach event listeners to view buttons
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('.entry-card').dataset.id;
            viewEntry(id);
        });
    });

    // Attach event listeners to edit buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('.entry-card').dataset.id;
            editEntry(id);
        });
    });

    // Attach event listeners to delete buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('.entry-card').dataset.id;
            deleteEntry(id);
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

    return `
        <div class="entry-card" data-id="${entry.id}">
            <div class="entry-header">
                <div>
                    <h3 class="entry-title">${escapeHtml(entry.names)}</h3>
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

// Register Service Worker for PWA
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js', { scope: './' })
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
}
