// Application State
let entries = [];
let editingId = null;

// DOM Elements
const entriesList = document.getElementById('entriesList');
const emptyState = document.getElementById('emptyState');
const addBtn = document.getElementById('addBtn');
const entryModal = document.getElementById('entryModal');
const entryForm = document.getElementById('entryForm');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const monthFilter = document.getElementById('monthFilter');
const searchInput = document.getElementById('searchInput');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadEntries();
    renderEntries();
    setupEventListeners();
    registerServiceWorker();
});

// Event Listeners
function setupEventListeners() {
    addBtn.addEventListener('click', () => openModal());
    closeModal.addEventListener('click', () => closeModalHandler());
    cancelBtn.addEventListener('click', () => closeModalHandler());
    entryModal.addEventListener('click', (e) => {
        if (e.target === entryModal) closeModalHandler();
    });
    entryForm.addEventListener('submit', handleSubmit);
    monthFilter.addEventListener('change', renderEntries);
    searchInput.addEventListener('input', renderEntries);

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && entryModal.classList.contains('active')) {
            closeModalHandler();
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

// Delete entry
function deleteEntry(id) {
    if (confirm('האם אתה בטוח שברצונך למחוק רשומה זו?')) {
        entries = entries.filter(e => e.id !== id);
        saveEntries();
        renderEntries();
    }
}

// Edit entry
function editEntry(id) {
    openModal(id);
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

    // Attach event listeners to delete buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('.entry-card').dataset.id;
            deleteEntry(id);
        });
    });

    // Attach event listeners to edit buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('.entry-card').dataset.id;
            editEntry(id);
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
                    <button class="btn btn-edit">ערוך</button>
                    <button class="btn btn-delete">מחק</button>
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

// Register Service Worker for PWA
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
}
