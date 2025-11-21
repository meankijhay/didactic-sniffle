let extensionsData = [];
const extensionsGrid = document.querySelector('.extensions-grid');
const filterButtons = document.querySelectorAll('.filter-controls .filter-btn');

async function initialize() {
    try {
        const response = await fetch('./data.json');
        extensionsData = await response.json();
        
        extensionsData = extensionsData.map((ext, index) => ({ ...ext, id: index + 1 }));

        renderExtensions('all');
        setupEventListeners();
    } catch (error) {
        console.error("Error loading data. Make sure you are running a local web server (e.g., Live Server) to bypass CORS issues.", error);
    }
}

function renderExtensions(filter = 'all') {
    extensionsGrid.innerHTML = '';

    let filteredData = extensionsData;
    
    if (filter === 'active') {
        filteredData = extensionsData.filter(ext => ext.isActive);
    } else if (filter === 'inactive') {
        filteredData = extensionsData.filter(ext => !ext.isActive);
    }
    
    filteredData.forEach(extension => {
        const card = createExtensionCard(extension);
        extensionsGrid.appendChild(card);
    });
}

function createExtensionCard(extension) {
    const card = document.createElement('div');
    card.className = 'extension-card';
    card.setAttribute('data-extension-id', extension.id);
    card.setAttribute('data-is-active', extension.isActive); 

    card.innerHTML = `
        <div class="card-header">
            <img src="${extension.logo}" alt="${extension.name} logo" class="extension-logo">
            <h3 class="extension-name">${extension.name}</h3>
        </div>
        <p class="extension-description">${extension.description}</p>
        <div class="card-actions">
            <button class="remove-btn" data-id="${extension.id}">Remove</button>
            <label class="toggle-switch">
                <input type="checkbox" data-id="${extension.id}" ${extension.isActive ? 'checked' : ''} aria-label="Toggle ${extension.name} active state">
                <span class="slider"></span>
            </label>
        </div>
    `;
    return card;
}

function setupEventListeners() {
    filterButtons.forEach(button => {
        button.addEventListener('click', handleFilterClick);
    });
    
    extensionsGrid.addEventListener('click', handleCardActions);
}

function handleFilterClick(event) {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const filterType = event.target.dataset.filter;
    renderExtensions(filterType);
}

function handleCardActions(event) {
    const target = event.target;
    
    const extensionId = parseInt(target.dataset.id || target.closest('.toggle-switch input')?.dataset.id);
    if (isNaN(extensionId)) return;
    
    if (target.matches('.toggle-switch input')) {
        toggleExtensionState(extensionId, target.checked);
    }
    
    if (target.matches('.remove-btn')) {
        removeExtension(extensionId);
    }
}

function toggleExtensionState(id, newState) {
    const extensionIndex = extensionsData.findIndex(ext => ext.id === id);
    
    if (extensionIndex > -1) {
        extensionsData[extensionIndex].isActive = newState;
        
        const currentFilter = document.querySelector('.filter-btn.active').dataset.filter;
        
        renderExtensions(currentFilter);
    }
}

function removeExtension(id) {
    extensionsData = extensionsData.filter(ext => ext.id !== id);
    
    const currentFilter = document.querySelector('.filter-btn.active').dataset.filter;
    renderExtensions(currentFilter);
}

initialize();