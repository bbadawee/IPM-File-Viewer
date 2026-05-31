// IPM Clearing File Viewer Frontend JavaScript

// Global Application State
const state = {
  transactions: [],
  filteredTransactions: [],
  currencyCodes: {},
  mccCodes: {},
  emvTags: {},
  selectedTransaction: null,
  isPanMasked: true,
  activeTab: 'overview',
  filters: {
    search: '',
    brand: 'ALL',
    mti: 'ALL',
    mccCategory: 'ALL',
    currency: 'ALL'
  }
};

// DOM Elements
const elements = {
  uploadSection: document.getElementById('upload-section'),
  viewerSection: document.getElementById('viewer-section'),
  dropZone: document.getElementById('drop-zone'),
  fileInput: document.getElementById('file-input'),
  browseBtn: document.getElementById('browse-btn'),
  uploadNewBtn: document.getElementById('upload-new-btn'),
  loadedFileInfo: document.getElementById('loaded-file-info'),
  displayFileName: document.getElementById('display-file-name'),
  displayFileTxCount: document.getElementById('display-file-tx-count'),
  loadingOverlay: document.getElementById('loading-overlay'),
  
  // KPIs
  kpiTotalTx: document.getElementById('kpi-total-tx'),
  kpiPresentments: document.getElementById('kpi-presentments'),
  kpiFees: document.getElementById('kpi-fees'),
  kpiUniqueCards: document.getElementById('kpi-unique-cards'),
  
  // Charts
  cardSchemeChart: document.getElementById('card-scheme-chart'),
  mtiChart: document.getElementById('mti-chart'),
  
  // Toolbar Filters
  searchInput: document.getElementById('search-input'),
  filterBrand: document.getElementById('filter-brand'),
  filterMti: document.getElementById('filter-mti'),
  filterMcc: document.getElementById('filter-mcc'),
  filterCurrency: document.getElementById('filter-currency'),
  togglePanBtn: document.getElementById('toggle-pan-btn'),
  exportJsonBtn: document.getElementById('export-json-btn'),
  resetFiltersBtn: document.getElementById('reset-filters-btn'),
  
  // Transaction Table
  transactionRows: document.getElementById('transaction-rows'),
  noRecordsMsg: document.getElementById('no-records-msg'),
  footerRecordCount: document.getElementById('footer-record-count'),
  
  // Slide-out Drawer
  detailDrawer: document.getElementById('detail-drawer'),
  drawerBackdrop: document.getElementById('drawer-backdrop'),
  closeDrawerBtn: document.getElementById('close-drawer-btn'),
  drawerSummaryHeader: document.getElementById('drawer-summary-header'),
  detailSchemeAvatar: document.getElementById('detail-scheme-avatar'),
  detailMerchantName: document.getElementById('detail-merchant-name'),
  detailTypeBadge: document.getElementById('detail-type-badge'),
  detailMainAmount: document.getElementById('detail-main-amount'),
  detailRevealPanBtn: document.getElementById('detail-reveal-pan-btn'),
  
  // Tab elements
  tabBtns: document.querySelectorAll('.tab-btn'),
  tabContents: document.querySelectorAll('.tab-content'),
  
  // Detail Fields
  tdMti: document.getElementById('td-mti'),
  tdScheme: document.getElementById('td-scheme'),
  tdPan: document.getElementById('td-pan'),
  tdDe24: document.getElementById('td-de24'),
  tdDe38: document.getElementById('td-de38'),
  tdDe37: document.getElementById('td-de37'),
  tdDe31: document.getElementById('td-de31'),
  tdMerchantName: document.getElementById('td-merchant-name'),
  tdLocation: document.getElementById('td-location'),
  tdMcc: document.getElementById('td-mcc'),
  tdMccDesc: document.getElementById('td-mcc-desc'),
  tdDe42: document.getElementById('td-de42'),
  tdDe41: document.getElementById('td-de41'),
  tdAmount: document.getElementById('td-amount'),
  tdCurrency: document.getElementById('td-currency'),
  tdDe14: document.getElementById('td-de14'),
  tdDe12: document.getElementById('td-de12'),
  
  // EMV Tab
  emvTagsEmpty: document.getElementById('emv-tags-empty'),
  emvTagsList: document.getElementById('emv-tags-list'),
  
  // Raw Tab
  rawJsonCode: document.getElementById('raw-json-code')
};

// Initialize Application
async function init() {
  await loadMappings();
  setupEventListeners();
}

// Load configurations and metadata mapping files
async function loadMappings() {
  try {
    const [currencies, mccs, emvs] = await Promise.all([
      fetch('currency_codes.json').then(r => r.json()).catch(() => ({})),
      fetch('mcc_codes.json').then(r => r.json()).catch(() => ({})),
      fetch('emv_tags.json').then(r => r.json()).catch(() => ({}))
    ]);
    state.currencyCodes = currencies;
    state.mccCodes = mccs;
    state.emvTags = emvs;
    console.log('[App] Metadata mappings loaded successfully');
  } catch (err) {
    console.error('[App] Failed to load metadata mapping files', err);
  }
}

// Setup Interaction Event Listeners
function setupEventListeners() {
  // Drag and drop zone events
  ['dragenter', 'dragover'].forEach(eventName => {
    elements.dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      elements.dropZone.classList.add('drag-over');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    elements.dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      elements.dropZone.classList.remove('drag-over');
    }, false);
  });

  elements.dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  });

  // Browse file button
  elements.browseBtn.addEventListener('click', () => elements.fileInput.click());
  elements.fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  });

  // Upload New button in Header
  elements.uploadNewBtn.addEventListener('click', () => {
    elements.viewerSection.classList.add('hidden');
    elements.uploadNewBtn.classList.add('hidden');
    elements.loadedFileInfo.classList.add('hidden');
    elements.uploadSection.classList.remove('hidden');
    // Clear input
    elements.fileInput.value = '';
  });

  // Search input
  elements.searchInput.addEventListener('input', (e) => {
    state.filters.search = e.target.value;
    applyFilters();
  });

  // Dropdown filters
  elements.filterBrand.addEventListener('change', (e) => {
    state.filters.brand = e.target.value;
    applyFilters();
  });
  elements.filterMti.addEventListener('change', (e) => {
    state.filters.mti = e.target.value;
    applyFilters();
  });
  elements.filterMcc.addEventListener('change', (e) => {
    state.filters.mccCategory = e.target.value;
    applyFilters();
  });
  elements.filterCurrency.addEventListener('change', (e) => {
    state.filters.currency = e.target.value;
    applyFilters();
  });

  // PAN Masking Toggle button
  elements.togglePanBtn.addEventListener('click', () => {
    state.isPanMasked = !state.isPanMasked;
    elements.togglePanBtn.classList.toggle('active', state.isPanMasked);
    const spanText = elements.togglePanBtn.querySelector('span');
    spanText.textContent = state.isPanMasked ? 'Mask PANs' : 'Unmask PANs';
    
    // Rerender table and drawer (if active)
    renderTransactionList();
    if (state.selectedTransaction) {
      renderDetailDrawerPAN();
    }
  });

  // Reset Filters button
  elements.resetFiltersBtn.addEventListener('click', () => {
    elements.searchInput.value = '';
    elements.filterBrand.value = 'ALL';
    elements.filterMti.value = 'ALL';
    elements.filterMcc.value = 'ALL';
    elements.filterCurrency.value = 'ALL';
    
    state.filters = {
      search: '',
      brand: 'ALL',
      mti: 'ALL',
      mccCategory: 'ALL',
      currency: 'ALL'
    };
    applyFilters();
  });

  // Export JSON Button
  elements.exportJsonBtn.addEventListener('click', () => {
    exportToJSON();
  });

  // Drawer Close events
  elements.closeDrawerBtn.addEventListener('click', closeDetailDrawer);
  elements.drawerBackdrop.addEventListener('click', closeDetailDrawer);

  // Detail Reveal PAN
  elements.detailRevealPanBtn.addEventListener('click', () => {
    if (!state.selectedTransaction) return;
    const fullPan = state.selectedTransaction.de2 || '';
    const isCurrentlyMasked = elements.tdPan.textContent.includes('*');
    if (isCurrentlyMasked) {
      elements.tdPan.textContent = formatPanSpacing(fullPan);
      elements.detailRevealPanBtn.textContent = 'Hide';
    } else {
      elements.tdPan.textContent = maskCardNumber(fullPan);
      elements.detailRevealPanBtn.textContent = 'Reveal';
    }
  });

  // Drawer Tabs switching
  elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });
}

// Switch drawer tabs
function switchTab(tabId) {
  state.activeTab = tabId;
  elements.tabBtns.forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
  });
  elements.tabContents.forEach(c => {
    c.classList.toggle('active', c.id === `tab-${tabId}`);
  });
}

// Upload file to Backend
async function handleFileUpload(file) {
  elements.loadingOverlay.classList.remove('hidden');
  
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || errData.details || 'Server error uploading file');
    }
    
    const result = await response.json();
    console.log('[App] Loaded transactions:', result.transactionsCount);
    
    // Update State
    state.transactions = result.data;
    state.filteredTransactions = [...result.data];
    
    // Update Header File Info
    elements.displayFileName.textContent = result.filename;
    elements.displayFileTxCount.textContent = `${result.transactionsCount} tx`;
    
    // Initialize Dashboard components
    populateFilterOptions();
    calculateKPIs();
    renderCharts();
    applyFilters();
    
    // Switch Screen
    elements.uploadSection.classList.add('hidden');
    elements.viewerSection.classList.remove('hidden');
    elements.uploadNewBtn.classList.remove('hidden');
    elements.loadedFileInfo.classList.remove('hidden');
    
  } catch (err) {
    alert(`File parsing failed:\n${err.message}`);
    console.error('[App] Upload failure:', err);
  } finally {
    elements.loadingOverlay.classList.add('hidden');
  }
}

// Populate Dropdown Options dynamically based on parsed data
function populateFilterOptions() {
  const mtis = new Set();
  const mccCategories = new Set();
  const currencies = new Set();
  
  state.transactions.forEach(tx => {
    if (tx.mti) mtis.add(tx.mti);
    
    if (tx.de26) {
      const mccInfo = state.mccCodes[tx.de26];
      if (mccInfo && mccInfo.category) mccCategories.add(mccInfo.category);
    }
    
    if (tx.de49) {
      currencies.add(tx.de49);
    }
  });

  // Re-build MTI options
  elements.filterMti.innerHTML = '<option value="ALL">All MTIs</option>';
  Array.from(mtis).sort().forEach(mti => {
    const opt = document.createElement('option');
    opt.value = mti;
    opt.textContent = `${mti} - ${getMTIShortName(mti)}`;
    elements.filterMti.appendChild(opt);
  });

  // Re-build MCC Category options
  elements.filterMcc.innerHTML = '<option value="ALL">All Categories</option>';
  Array.from(mccCategories).sort().forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    elements.filterMcc.appendChild(opt);
  });

  // Re-build Currency options
  elements.filterCurrency.innerHTML = '<option value="ALL">All Currencies</option>';
  Array.from(currencies).sort().forEach(curr => {
    const opt = document.createElement('option');
    opt.value = curr;
    const currMap = state.currencyCodes[curr];
    opt.textContent = currMap ? `${currMap.code} (${curr})` : `Currency ${curr}`;
    elements.filterCurrency.appendChild(opt);
  });
}

// Calculate KPIs
function calculateKPIs() {
  const totalCount = state.transactions.length;
  elements.kpiTotalTx.textContent = totalCount.toLocaleString();

  // Clearing Presentment Volume
  // Sum up transaction amounts (de4) grouped by currency for MTIs related to clearing presentment (e.g. 1240)
  const presentmentVolumes = {};
  const feeVolumes = {};
  const uniqueCardSet = new Set();

  state.transactions.forEach(tx => {
    if (tx.de2) uniqueCardSet.add(tx.de2);

    const mti = tx.mti || '';
    const currencyCode = tx.de49 || 'Unknown';
    const rawAmt = parseFloat(tx.de4) || 0;
    
    // Amount formatting
    const currMeta = state.currencyCodes[currencyCode];
    const decimals = currMeta ? currMeta.decimals : 2;
    const realAmount = rawAmt / Math.pow(10, decimals);

    if (mti === '1240') {
      presentmentVolumes[currencyCode] = (presentmentVolumes[currencyCode] || 0) + realAmount;
    } else if (mti === '1644') {
      feeVolumes[currencyCode] = (feeVolumes[currencyCode] || 0) + realAmount;
    }
  });

  // Render volume strings in UI (comma separated currencies if multiple)
  elements.kpiPresentments.innerHTML = formatKpiVolume(presentmentVolumes);
  elements.kpiFees.innerHTML = formatKpiVolume(feeVolumes);
  elements.kpiUniqueCards.textContent = uniqueCardSet.size.toLocaleString();
}

function formatKpiVolume(volumeMap) {
  const keys = Object.keys(volumeMap);
  if (keys.length === 0) return '0.00';
  
  return keys.map(curr => {
    const vol = volumeMap[curr];
    const currMeta = state.currencyCodes[curr];
    const symbol = currMeta ? currMeta.code : `[${curr}]`;
    const formattedVal = vol.toLocaleString(undefined, {
      minimumFractionDigits: currMeta ? currMeta.decimals : 2,
      maximumFractionDigits: currMeta ? currMeta.decimals : 2
    });
    return `<span>${formattedVal}</span> <small>${symbol}</small>`;
  }).join(' <br> ');
}

// Dynamic SVG Charts
function renderCharts() {
  renderCardSchemeChart();
  renderMTIChart();
}

// Render Scheme Mix Stack Bar
function renderCardSchemeChart() {
  let mastercardCount = 0;
  let visaCount = 0;
  let otherCount = 0;

  state.transactions.forEach(tx => {
    const brand = getCardBrandName(tx.de2);
    if (brand === 'Mastercard') mastercardCount++;
    else if (brand === 'Visa') visaCount++;
    else otherCount++;
  });

  const total = state.transactions.length;
  if (total === 0) {
    elements.cardSchemeChart.innerHTML = '<p class="text-muted">No data available</p>';
    return;
  }

  const mcPct = ((mastercardCount / total) * 100).toFixed(1);
  const visaPct = ((visaCount / total) * 100).toFixed(1);
  const otherPct = ((otherCount / total) * 100).toFixed(1);

  // SVG representation for scheme distribution (beautiful progress visual)
  elements.cardSchemeChart.innerHTML = `
    <div style="width: 100%; display: flex; flex-direction: column; gap: 1rem; padding: 0.5rem 0;">
      <div style="height: 24px; width: 100%; border-radius: 8px; overflow: hidden; display: flex; background: var(--bg-tertiary);">
        ${mastercardCount > 0 ? `<div style="width: ${mcPct}%; background: linear-gradient(90deg, #f97316, #ea580c); transition: width 0.5s ease;" title="Mastercard: ${mastercardCount} (${mcPct}%)"></div>` : ''}
        ${visaCount > 0 ? `<div style="width: ${visaPct}%; background: linear-gradient(90deg, #3b82f6, #1d4ed8); transition: width 0.5s ease;" title="Visa: ${visaCount} (${visaPct}%)"></div>` : ''}
        ${otherCount > 0 ? `<div style="width: ${otherPct}%; background: #64748b; transition: width 0.5s ease;" title="Others: ${otherCount} (${otherPct}%)"></div>` : ''}
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.85rem;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="width: 12px; height: 12px; border-radius: 3px; background: #f97316;"></div>
            <span>Mastercard</span>
          </div>
          <span class="text-bold">${mastercardCount} <small class="text-secondary">(${mcPct}%)</small></span>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="width: 12px; height: 12px; border-radius: 3px; background: #3b82f6;"></div>
            <span>Visa</span>
          </div>
          <span class="text-bold">${visaCount} <small class="text-secondary">(${visaPct}%)</small></span>
        </div>
        ${otherCount > 0 ? `
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="width: 12px; height: 12px; border-radius: 3px; background: #64748b;"></div>
            <span>Others</span>
          </div>
          <span class="text-bold">${otherCount} <small class="text-secondary">(${otherPct}%)</small></span>
        </div>` : ''}
      </div>
    </div>
  `;
}

// Render dynamic SVG MTI Bar Chart
function renderMTIChart() {
  const mtiCounts = {};
  state.transactions.forEach(tx => {
    const mti = tx.mti || 'Other';
    mtiCounts[mti] = (mtiCounts[mti] || 0) + 1;
  });

  const mtiKeys = Object.keys(mtiCounts).sort();
  if (mtiKeys.length === 0) {
    elements.mtiChart.innerHTML = '<p class="text-muted">No data available</p>';
    return;
  }

  // Find max value for scaling heights
  const counts = Object.values(mtiCounts);
  const maxVal = Math.max(...counts);

  const svgWidth = 400;
  const svgHeight = 180;
  const chartBottom = 150;
  const chartHeight = 120;
  
  const barWidth = 40;
  const barSpacing = 30;
  const startX = (svgWidth - (mtiKeys.length * barWidth + (mtiKeys.length - 1) * barSpacing)) / 2;

  let svgContent = `<svg viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" height="100%">`;
  
  // Draw Grid Lines (3 levels)
  for (let i = 1; i <= 3; i++) {
    const yVal = chartBottom - (chartHeight * (i / 3));
    const gridCount = Math.round(maxVal * (i / 3));
    svgContent += `
      <line class="chart-grid-line" x1="20" y1="${yVal}" x2="${svgWidth - 20}" y2="${yVal}"></line>
      <text class="chart-label" x="15" y="${yVal + 3}" text-anchor="end" style="font-size: 0.65rem;">${gridCount}</text>
    `;
  }

  // Draw Bottom Axis
  svgContent += `<line class="chart-axis-line" x1="20" y1="${chartBottom}" x2="${svgWidth - 20}" y2="${chartBottom}"></line>`;

  // Draw Bars
  mtiKeys.forEach((mti, idx) => {
    const count = mtiCounts[mti];
    const height = (count / maxVal) * chartHeight;
    const x = startX + idx * (barWidth + barSpacing);
    const y = chartBottom - height;

    const barClass = mti === '1240' ? 'chart-bar-rect' : (mti === '1644' ? 'chart-bar-rect-fee' : 'chart-bar-rect');
    const colorStyle = mti === '1240' ? 'var(--accent-cyan)' : (mti === '1644' ? 'var(--accent-purple)' : 'var(--text-muted)');

    svgContent += `
      <g>
        <!-- Bar Rect -->
        <rect class="${barClass}" x="${x}" y="${y}" width="${barWidth}" height="${height}" fill="${colorStyle}"></rect>
        
        <!-- Value text on top -->
        <text class="chart-value-label" x="${x + barWidth/2}" y="${y - 8}">${count}</text>
        
        <!-- MTI text on bottom -->
        <text class="chart-label" x="${x + barWidth/2}" y="${chartBottom + 16}" text-anchor="middle">${mti}</text>
        <!-- Short MTI Description under -->
        <text class="chart-label" x="${x + barWidth/2}" y="${chartBottom + 26}" text-anchor="middle" style="font-size: 0.55rem; fill: var(--text-muted);">${getMTIShortName(mti)}</text>
      </g>
    `;
  });

  svgContent += `</svg>`;
  elements.mtiChart.innerHTML = svgContent;
}

// Apply Selected Filters to state list
function applyFilters() {
  const searchLower = state.filters.search.toLowerCase();
  
  state.filteredTransactions = state.transactions.filter(tx => {
    // 1. Search Query filter (matches PAN, merchant name in DE43, RRN, ARN, Approval Code)
    const pan = tx.de2 || '';
    const rrn = tx.de37 || '';
    const arn = (tx.de31 && tx.de31.s4) || '';
    const authCode = tx.de38 || '';
    
    // Parse merchant info
    const merch = getMerchantDetails(tx);
    const merchantName = merch.name.toLowerCase();
    const city = merch.city.toLowerCase();

    const matchesSearch = !state.filters.search || 
      pan.includes(state.filters.search) ||
      rrn.includes(state.filters.search) ||
      arn.includes(state.filters.search) ||
      authCode.includes(state.filters.search) ||
      merchantName.includes(searchLower) ||
      city.includes(searchLower);

    if (!matchesSearch) return false;

    // 2. Brand Scheme filter
    if (state.filters.brand !== 'ALL') {
      const brand = getCardBrandName(tx.de2);
      if (state.filters.brand === 'OTHER' && (brand === 'Visa' || brand === 'Mastercard')) return false;
      if (state.filters.brand !== 'OTHER' && brand !== state.filters.brand) return false;
    }

    // 3. MTI filter
    if (state.filters.mti !== 'ALL' && tx.mti !== state.filters.mti) return false;

    // 4. MCC Category filter
    if (state.filters.mccCategory !== 'ALL') {
      const mccInfo = state.mccCodes[tx.de26];
      if (!mccInfo || mccInfo.category !== state.filters.mccCategory) return false;
    }

    // 5. Currency filter
    if (state.filters.currency !== 'ALL' && tx.de49 !== state.filters.currency) return false;

    return true;
  });

  // Re-render
  renderTransactionList();
}

// Render rows in the Table
function renderTransactionList() {
  elements.transactionRows.innerHTML = '';
  
  const count = state.filteredTransactions.length;
  elements.footerRecordCount.textContent = `Showing ${count} of ${state.transactions.length} transactions`;

  if (count === 0) {
    elements.noRecordsMsg.classList.remove('hidden');
    return;
  }
  
  elements.noRecordsMsg.classList.add('hidden');

  state.filteredTransactions.forEach((tx, index) => {
    const tr = document.createElement('tr');
    tr.dataset.index = index;
    
    // Card Scheme avatar badge
    const brand = getCardBrandName(tx.de2);
    const brandClass = brand === 'Mastercard' ? 'brand-mastercard' : (brand === 'Visa' ? 'brand-visa' : 'brand-other');
    const brandText = brand.substring(0, 2);

    // Masked Card PAN
    const cardPan = state.isPanMasked ? maskCardNumber(tx.de2) : formatPanSpacing(tx.de2);

    // MTI and short description
    const mtiClass = tx.mti === '1240' ? 'mti-1240' : (tx.mti === '1644' ? 'mti-1644' : 'mti-other');
    const mtiLabel = getTransactionTypeName(tx.mti, tx.de24);

    // Merchant details
    const merch = getMerchantDetails(tx);
    const locationStr = merch.city ? `${merch.city}, ${merch.country}` : merch.country;

    // MCC Badge
    const mccMeta = state.mccCodes[tx.de26];
    const mccDesc = mccMeta ? mccMeta.name : 'Unknown merchant type';
    const mccCategory = mccMeta ? mccMeta.category : 'Retail';

    // Timestamp formatting
    const timestampStr = formatLocalTime(tx.de12);

    // Financial formatting
    const rawAmt = parseFloat(tx.de4) || 0;
    const currMeta = state.currencyCodes[tx.de49];
    const decimals = currMeta ? currMeta.decimals : 2;
    const symbol = currMeta ? currMeta.code : `[${tx.de49}]`;
    const formattedAmount = (rawAmt / Math.pow(10, decimals)).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });

    tr.innerHTML = `
      <td>
        <div class="scheme-cell">
          <span class="card-brand-icon ${brandClass}">${brandText}</span>
        </div>
      </td>
      <td class="pan-cell font-mono">${cardPan}</td>
      <td>
        <span class="mti-badge ${mtiClass}">${tx.mti}</span>
        <span class="text-xs text-secondary" style="display: block; margin-top: 0.15rem;">${mtiLabel}</span>
      </td>
      <td>
        <span class="text-bold" style="font-size: 0.9rem; color: var(--text-primary); display: block;">${merch.name}</span>
        <span class="text-xs text-secondary">${locationStr}</span>
      </td>
      <td>
        <div class="mcc-badge-cell" title="${tx.de26}: ${mccDesc}">
          <span class="mcc-number-tag">${tx.de26}</span>
          <span class="mcc-text">${mccCategory}</span>
        </div>
      </td>
      <td>
        <span class="text-xs text-secondary">${timestampStr}</span>
      </td>
      <td class="text-right">
        <span class="amount-text">${formattedAmount}</span>
        <span class="currency-symbol">${symbol}</span>
      </td>
    `;

    // Click handler to open detail side panel
    tr.addEventListener('click', () => {
      openDetailDrawer(tx);
    });

    elements.transactionRows.appendChild(tr);
  });
}

// Side Detail Panel Logic
function openDetailDrawer(tx) {
  state.selectedTransaction = tx;
  switchTab('overview');

  const merch = getMerchantDetails(tx);
  const brand = getCardBrandName(tx.de2);
  const brandClass = brand === 'Mastercard' ? 'brand-mastercard' : (brand === 'Visa' ? 'brand-visa' : 'brand-other');
  const brandText = brand.substring(0, 2);

  // Summary Header
  elements.detailSchemeAvatar.className = `scheme-avatar ${brandClass}`;
  elements.detailSchemeAvatar.textContent = brandText;
  elements.detailMerchantName.textContent = merch.name;
  elements.detailTypeBadge.textContent = getTransactionTypeName(tx.mti, tx.de24);
  
  // Format top amount
  const rawAmt = parseFloat(tx.de4) || 0;
  const currMeta = state.currencyCodes[tx.de49];
  const decimals = currMeta ? currMeta.decimals : 2;
  const symbol = currMeta ? currMeta.code : `[${tx.de49}]`;
  const formattedAmount = (rawAmt / Math.pow(10, decimals)).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  elements.detailMainAmount.textContent = `${formattedAmount} ${symbol}`;

  // Populate Fields
  elements.tdMti.textContent = tx.mti || '-';
  elements.tdScheme.textContent = brand;
  renderDetailDrawerPAN();

  elements.tdDe24.textContent = tx.de24 ? `${tx.de24} (${getFunctionCodeDescription(tx.de24)})` : '-';
  elements.tdDe38.textContent = tx.de38 || '-';
  elements.tdDe37.textContent = tx.de37 || '-';
  
  // ARN reconstruction
  if (tx.de31) {
    const s1 = tx.de31.s1 || '';
    const s2 = tx.de31.s2 || '';
    const s3 = tx.de31.s3 || '';
    const s4 = tx.de31.s4 || '';
    const s5 = tx.de31.s5 || '';
    elements.tdDe31.textContent = `${s1}-${s2}-${s3}-${s4}-${s5}`.trim();
  } else {
    elements.tdDe31.textContent = '-';
  }

  // Merchant & Terminal Info
  elements.tdMerchantName.textContent = merch.name;
  elements.tdLocation.textContent = merch.city ? `${merch.city}, ${merch.country}` : merch.country;
  
  elements.tdMcc.textContent = tx.de26 || '-';
  const mccMeta = state.mccCodes[tx.de26];
  elements.tdMccDesc.textContent = mccMeta ? mccMeta.name : 'Unknown Category';
  
  elements.tdDe42.textContent = tx.de42 ? tx.de42.trim() : '-';
  elements.tdDe41.textContent = tx.de41 || '-';

  // Financials & Dates
  elements.tdAmount.textContent = `${formattedAmount} ${symbol}`;
  elements.tdCurrency.textContent = tx.de49 ? `${tx.de49} (${currMeta ? currMeta.name : 'Unknown'})` : '-';
  elements.tdDe14.textContent = tx.de14 ? `${tx.de14.substring(2,4)}/20${tx.de14.substring(0,2)}` : '-';
  elements.tdDe12.textContent = formatLocalTime(tx.de12);

  // Render EMV ICC Tags (DE55)
  renderEMVTags(tx.de55);

  // Raw JSON
  elements.rawJsonCode.textContent = JSON.stringify(tx, null, 2);

  // Slide Drawer Open
  elements.detailDrawer.classList.add('open');
  elements.drawerBackdrop.classList.add('visible');
}

function renderDetailDrawerPAN() {
  if (!state.selectedTransaction) return;
  const fullPan = state.selectedTransaction.de2 || '';
  if (state.isPanMasked) {
    elements.tdPan.textContent = maskCardNumber(fullPan);
    elements.detailRevealPanBtn.textContent = 'Reveal';
  } else {
    elements.tdPan.textContent = formatPanSpacing(fullPan);
    elements.detailRevealPanBtn.textContent = 'Hide';
  }
}

function closeDetailDrawer() {
  elements.detailDrawer.classList.remove('open');
  elements.drawerBackdrop.classList.remove('visible');
  state.selectedTransaction = null;
}

// Render EMV tags from DE55 in side panel
function renderEMVTags(de55Obj) {
  elements.emvTagsList.innerHTML = '';
  
  if (!de55Obj || Object.keys(de55Obj).length === 0) {
    elements.emvTagsEmpty.classList.remove('hidden');
    return;
  }
  
  elements.emvTagsEmpty.classList.add('hidden');

  // de55 fields are like: { "tag50": "4D617374657263617264", "tag57": "..." }
  Object.keys(de55Obj).forEach(key => {
    // Extract Tag ID (e.g. tag5F24 -> 5F24)
    const tagId = key.replace('tag', '').toUpperCase();
    const hexVal = de55Obj[key];
    
    const tagMeta = state.emvTags[tagId];
    const tagName = tagMeta ? tagMeta.name : `EMV Tag ${tagId}`;
    const format = tagMeta ? tagMeta.format : 'hex';
    
    let decodedVal = '';
    if (format === 'ascii') {
      decodedVal = hexToAscii(hexVal);
    } else if (format === 'bcd_date') {
      decodedVal = parseBcdDate(hexVal);
    } else if (format === 'numeric_amount') {
      decodedVal = parseEmvAmount(hexVal);
    } else if (format === 'numeric') {
      decodedVal = parseInt(hexVal, 10).toString();
    }
    
    const tagRow = document.createElement('div');
    tagRow.className = 'emv-tag-row';
    tagRow.innerHTML = `
      <div class="emv-tag-header">
        <span class="emv-tag-name">${tagName}</span>
        <span class="emv-tag-code">Tag ${tagId}</span>
      </div>
      ${decodedVal ? `<div class="emv-tag-value-decoded">${decodedVal}</div>` : ''}
      <div class="emv-tag-raw-hex" title="Raw Hex Value">${hexVal}</div>
    `;
    elements.emvTagsList.appendChild(tagRow);
  });
}

/* SMART DATA PARSING AND UTILITY HELPER ALGORITHMS */

// 1. Clean Merchant Name and Location parsing (DE43 S2/S3/S5/S6 algorithm)
function getMerchantDetails(tx) {
  const de43 = tx.de43 || {};
  const s2 = de43.s2 ? de43.s2.trim() : '';
  const s3 = de43.s3 ? de43.s3.trim() : '';
  
  // Country mapping from de43 subfields or fallback
  let country = 'IQ'; // Default for sample
  if (de43.s6) country = de43.s6.trim();
  else if (s2.endsWith(' IQ')) country = 'IQ';
  
  if (!s2) {
    return { name: 'Unknown Merchant', city: '', country: country };
  }

  // If we have a city subfield (s3), find where it matches inside s2. Everything before is the Merchant Name!
  if (s3) {
    const s3Lower = s3.toLowerCase();
    const s2Lower = s2.toLowerCase();
    const idx = s2Lower.indexOf(s3Lower);
    
    if (idx !== -1) {
      const name = s2.substring(0, idx).trim();
      return {
        name: name || s2, // fallback to full string if index is 0
        city: s3,
        country: country
      };
    }
  }

  // Fallback regex to clean trailing countries or double spaces
  const cleanName = s2.replace(/\s\s+/g, ' ');
  return { name: cleanName, city: '', country: country };
}

// 2. Identify card brand using BIN numbers (first character of PAN)
function getCardBrandName(pan) {
  if (!pan) return 'OTHER';
  const firstDigit = pan.charAt(0);
  if (firstDigit === '4') return 'Visa';
  if (firstDigit === '5' || firstDigit === '2') return 'Mastercard';
  return 'OTHER';
}

// 3. Mask Credit Card PAN spacing
function maskCardNumber(pan) {
  if (!pan) return '-';
  // Keep first 6 digits and last 4 digits, mask middle
  const len = pan.length;
  if (len < 10) return pan;
  const start = pan.substring(0, 6);
  const end = pan.substring(len - 4);
  const mask = '*'.repeat(len - 10);
  return formatPanSpacing(start + mask + end);
}

function formatPanSpacing(pan) {
  if (!pan) return '-';
  // Split into chunks of 4 digits
  return pan.replace(/(.{4})/g, '$1 ').trim();
}

// 4. Hex to ASCII decoder
function hexToAscii(hex) {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    const charCode = parseInt(hex.substr(i, 2), 16);
    if (charCode >= 32 && charCode <= 126) {
      str += String.fromCharCode(charCode);
    }
  }
  return str.trim();
}

// 5. EMV BCD Date parser (e.g. 291130 -> 2029-11-30)
function parseBcdDate(bcd) {
  if (bcd.length === 6) {
    return `20${bcd.substring(0, 2)}-${bcd.substring(2, 4)}-${bcd.substring(4, 6)}`;
  }
  if (bcd.length === 4) {
    return `20${bcd.substring(0, 2)}-${bcd.substring(2, 4)}`;
  }
  return bcd;
}

// 6. EMV Amount formatter (e.g. 000000001000 -> 10.00)
function parseEmvAmount(val) {
  const parsed = parseInt(val, 10);
  if (isNaN(parsed)) return val;
  return (parsed / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// 7. Format Date and Time (DE12 Local Timestamp: s1=YYMMDD, s2=HHMMSS)
function formatLocalTime(de12Obj) {
  if (!de12Obj || !de12Obj.s1 || !de12Obj.s2) return '-';
  const d = de12Obj.s1; // YYMMDD
  const t = de12Obj.s2; // HHMMSS
  
  if (d.length === 6 && t.length === 6) {
    const year = `20${d.substring(0, 2)}`;
    const month = d.substring(2, 4);
    const day = d.substring(4, 6);
    const hour = t.substring(0, 2);
    const min = t.substring(2, 4);
    const sec = t.substring(4, 6);
    
    // Map Month index
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mIdx = parseInt(month, 10) - 1;
    const monthStr = months[mIdx] || month;

    return `${monthStr} ${day}, ${year} ${hour}:${min}:${sec}`;
  }
  return `${d} ${t}`;
}

// 8. Description for MTIs
function getMTIShortName(mti) {
  const map = {
    '1240': 'Presentment',
    '1644': 'Fee/Admin',
    '1442': 'Chargeback',
    '1120': 'Auth Advice'
  };
  return map[mti] || 'Other';
}

function getTransactionTypeName(mti, de24) {
  const mtiName = getMTIShortName(mti);
  const fnName = de24 ? getFunctionCodeDescription(de24) : '';
  if (fnName) {
    return `${mtiName} (${fnName})`;
  }
  return mtiName;
}

// 9. Description for function codes (DE24)
function getFunctionCodeDescription(de24) {
  const map = {
    '200': 'First Presentment',
    '205': 'Second Presentment',
    '282': 'Chargeback',
    '450': 'Second Chargeback',
    '697': 'Fee Collection'
  };
  return map[de24] || `Func ${de24}`;
}

// 10. Export to JSON Download
function exportToJSON() {
  if (state.filteredTransactions.length === 0) return;
  
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.filteredTransactions, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  
  // Formulate nice file name
  const sourceName = elements.displayFileName.textContent.replace('.ipm', '');
  dlAnchorElem.setAttribute("download", `${sourceName}_filtered_export.json`);
  dlAnchorElem.click();
}

// Start app
window.addEventListener('DOMContentLoaded', init);
