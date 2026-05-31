let allRecords = [];
let filteredRecords = [];
let currentPage = 1;
const PAGE_SIZE = 100;

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const loadingState = document.getElementById('loading-state');
const statsPanel = document.getElementById('stats-panel');
const filtersPanel = document.getElementById('filters-panel');
const welcomeMsg = document.getElementById('welcome-message');
const validationPanel = document.getElementById('validation-panel');
const validationIcon = document.getElementById('validation-icon');
const validationHeading = document.getElementById('validation-heading');
const validationContent = document.getElementById('validation-content');
const validationErrorsList = document.getElementById('validation-errors-list');
const toggleValidationBtn = document.getElementById('toggle-validation');
const tableContainer = document.getElementById('table-container');
const tableBody = document.getElementById('table-body');

const statFilename = document.getElementById('stat-filename');
const statCount = document.getElementById('stat-count');
const filterMti = document.getElementById('filter-mti');
const searchInput = document.getElementById('search-input');

const pagePrev = document.getElementById('page-prev');
const pageNext = document.getElementById('page-next');
const pageInfo = document.getElementById('page-info');

const modal = document.getElementById('details-modal');
const modalBody = document.getElementById('modal-details-body');
const closeModal = document.querySelector('.close-modal');

// Drag & Drop Handlers
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFile(e.target.files[0]);
    }
});

// File Upload
async function handleFile(file) {
    dropZone.classList.add('hidden');
    loadingState.classList.remove('hidden');
    welcomeMsg.classList.add('hidden');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            allRecords = data.records;
            statFilename.textContent = data.filename;
            statCount.textContent = data.total;
            
            // Handle Validation
            if (data.validation) {
                renderValidationReport(data.validation);
            }
            
            setupFilters();
            applyFilters();
            
            statsPanel.classList.remove('hidden');
            filtersPanel.classList.remove('hidden');
            tableContainer.classList.remove('hidden');
        } else {
            alert("Error: " + data.error);
            dropZone.classList.remove('hidden');
        }
    } catch (err) {
        alert("Upload failed: " + err.message);
        dropZone.classList.remove('hidden');
    } finally {
        loadingState.classList.add('hidden');
    }
}

// Validation Report Rendering
function renderValidationReport(validation) {
    validationPanel.classList.remove('hidden');
    validationErrorsList.innerHTML = '';
    
    if (validation.passed) {
        validationPanel.classList.remove('has-errors');
        validationIcon.setAttribute('data-feather', 'check-circle');
        validationIcon.classList.remove('error-icon');
        validationIcon.classList.add('success-icon');
        validationHeading.textContent = 'Data Integrity Passed (100% Compliant)';
        validationContent.classList.add('hidden');
        toggleValidationBtn.classList.add('hidden');
    } else {
        validationPanel.classList.add('has-errors');
        validationIcon.setAttribute('data-feather', 'alert-triangle');
        validationIcon.classList.remove('success-icon');
        validationIcon.classList.add('error-icon');
        validationHeading.textContent = `Data Integrity Failed (${validation.errors.length} Violations Found)`;
        
        validation.errors.forEach(err => {
            const li = document.createElement('li');
            li.textContent = err;
            validationErrorsList.appendChild(li);
        });
        
        validationContent.classList.remove('hidden');
        toggleValidationBtn.classList.remove('hidden');
    }
    
    // Re-render icons
    feather.replace();
}

toggleValidationBtn.addEventListener('click', () => {
    validationContent.classList.toggle('hidden');
    const icon = validationContent.classList.contains('hidden') ? 'chevron-down' : 'chevron-up';
    toggleValidationBtn.innerHTML = `<i data-feather="${icon}"></i>`;
    feather.replace();
});

// Filters & Search
function setupFilters() {
    const mtis = new Set();
    allRecords.forEach(r => {
        if (r.mti) mtis.add(r.mti);
    });
    
    filterMti.innerHTML = '<option value="All">All MTIs</option>';
    Array.from(mtis).sort().forEach(mti => {
        const opt = document.createElement('option');
        opt.value = mti;
        opt.textContent = mti;
        filterMti.appendChild(opt);
    });
}

function applyFilters() {
    const mtiVal = filterMti.value;
    const searchVal = searchInput.value.toLowerCase();
    
    filteredRecords = allRecords.filter(r => {
        if (mtiVal !== "All" && r.mti !== mtiVal) return false;
        
        if (searchVal) {
            const pan = (r.de2 || "").toLowerCase();
            const rrn = (r.de37 || "").toLowerCase();
            if (!pan.includes(searchVal) && !rrn.includes(searchVal)) {
                return false;
            }
        }
        return true;
    });
    
    currentPage = 1;
    renderTable();
}

filterMti.addEventListener('change', applyFilters);
searchInput.addEventListener('input', applyFilters);

// Table Rendering
function renderTable() {
    tableBody.innerHTML = '';
    
    const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE) || 1;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    pagePrev.disabled = currentPage === 1;
    pageNext.disabled = currentPage === totalPages;
    
    const startIdx = (currentPage - 1) * PAGE_SIZE;
    const endIdx = Math.min(startIdx + PAGE_SIZE, filteredRecords.length);
    const pageRecords = filteredRecords.slice(startIdx, endIdx);
    
    pageRecords.forEach((r, idx) => {
        const tr = document.createElement('tr');
        tr.onclick = () => openDetails(r);
        
        // MTI/Func
        const mtiStr = r.mti || "";
        const funcStr = r.de24 ? `/${r.de24}` : "";
        const typeBadge = `<span class="badge mti">${mtiStr}${funcStr}</span>`;
        
        // Date formatting (DE12)
        let dateStr = "";
        if (r.de12 && r.de12.s1 && r.de12.s2) {
            const s1 = r.de12.s1;
            const s2 = r.de12.s2;
            dateStr = `20${s1.substring(0,2)}-${s1.substring(2,4)}-${s1.substring(4,6)} ${s2.substring(0,2)}:${s2.substring(2,4)}`;
        }
        
        // Amount
        let amtStr = r.de4 || "";
        if (amtStr) {
            const val = parseInt(amtStr, 10);
            amtStr = (val / 100).toFixed(2);
        }
        
        // Merchant City
        let merchantStr = "";
        if (r.de43 && r.de43.s3) {
            merchantStr = r.de43.s3;
        }

        tr.innerHTML = `
            <td>${startIdx + idx + 1}</td>
            <td>${typeBadge}</td>
            <td>${maskPan(r.de2 || "")}</td>
            <td>${amtStr}</td>
            <td>${dateStr}</td>
            <td>${r.de37 || ""}</td>
            <td>${r.de38 || ""}</td>
            <td>${merchantStr}</td>
        `;
        tableBody.appendChild(tr);
    });
}

function maskPan(pan) {
    if (!pan || pan.length < 10) return pan;
    return pan.substring(0, 6) + "••••••" + pan.substring(pan.length - 4);
}

// Pagination
pagePrev.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
});

pageNext.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
});

// Modal Details
function openDetails(record) {
    modalBody.innerHTML = '';
    
    // Sort keys alphabetically, but put MTI first
    const keys = Object.keys(record).sort();
    
    keys.forEach(k => {
        const val = record[k];
        if (typeof val === 'object' && val !== null) {
            // Compound field
            const row = document.createElement('div');
            row.className = 'field-row';
            row.innerHTML = `<div class="field-key">${k.toUpperCase()}</div><div class="field-val">Complex Data Element</div>`;
            modalBody.appendChild(row);
            
            Object.keys(val).sort().forEach(subK => {
                const subRow = document.createElement('div');
                subRow.className = 'subfield-row';
                subRow.innerHTML = `<span style="width:60px; font-weight:600;">${subK}:</span> <span>${val[subK]}</span>`;
                modalBody.appendChild(subRow);
            });
            
        } else {
            // Simple field
            const row = document.createElement('div');
            row.className = 'field-row';
            row.innerHTML = `<div class="field-key">${k.toUpperCase()}</div><div class="field-val">${val}</div>`;
            modalBody.appendChild(row);
        }
    });
    
    modal.classList.remove('hidden');
}

closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});
