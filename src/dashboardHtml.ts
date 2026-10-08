import { IMAGENTIA_LOGO_BASE64 } from './logoBase64.js';

export function getDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IMAGENTIA // Consola Operativa WhatsApp B2B</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-base: #0B0D11;
      --bg-surface: #12151B;
      --bg-card: #181C24;
      --bg-card-hover: #1F2430;
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-focus: #00FF8B;
      --text-main: #EDEDED;
      --text-muted: #94A3B8;
      --text-dim: #64748B;
      
      /* Manual de Marca Oficial IMAGENTIA */
      --brand-mint: #00FF8B;       /* CMYK 61, 0, 69, 0 | RGB 0, 255, 139 | HEX #00FF8B */
      --brand-green: #00FF60;      /* CMYK 63, 0, 93, 0 | RGB 0, 255, 96  | HEX #00FF60 */
      --brand-dark: #1C1C1C;       /* CMYK 76, 66, 60, 81 | RGB 28, 28, 28 | HEX #1C1C1C */
      --brand-light: #EDEDED;      /* CMYK 8, 6, 7, 0 | RGB 237, 237, 237 | HEX #EDEDED */
      
      --accent-crimson: #EF4444;
      --accent-amber: #F59E0B;
      --accent-blue: #3B82F6;
      --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg-base);
      color: var(--text-main);
      font-family: var(--font-sans);
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* Top Navigation */
    header {
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      padding: 10px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .brand-logo-img {
      height: 42px;
      width: auto;
      max-width: 180px;
      object-fit: contain;
      filter: drop-shadow(0 0 12px rgba(0, 255, 139, 0.35));
    }

    .brand-text-block {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-weight: 800;
      font-size: 1.1rem;
      letter-spacing: 0.08em;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-title span {
      color: var(--brand-mint);
    }

    .brand-sub {
      font-size: 0.65rem;
      color: var(--text-muted);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      font-weight: 600;
    }

    .brand-tag {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 3px 8px;
      border-radius: 4px;
      background: rgba(0, 255, 139, 0.12);
      color: var(--brand-mint);
      border: 1px solid rgba(0, 255, 139, 0.3);
    }

    .status-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .status-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
      padding: 4px 10px;
      border-radius: 20px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
    }

    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }
    .dot-green { background: var(--brand-mint); box-shadow: 0 0 8px var(--brand-mint); }
    .dot-blue { background: var(--accent-blue); }
    .dot-amber { background: var(--accent-amber); box-shadow: 0 0 6px var(--accent-amber); }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 6px;
      text-decoration: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }

    .btn-secondary {
      background: var(--bg-card);
      color: var(--text-main);
      border-color: var(--border-subtle);
    }
    .btn-secondary:hover {
      background: var(--bg-card-hover);
      border-color: var(--text-muted);
    }

    .btn-primary-mint {
      background: var(--brand-mint);
      color: #0B0D11;
      font-weight: 700;
      border-color: var(--brand-mint);
      box-shadow: 0 2px 10px rgba(0, 255, 139, 0.25);
    }
    .btn-primary-mint:hover {
      background: var(--brand-green);
      box-shadow: 0 4px 16px rgba(0, 255, 139, 0.4);
    }

    /* KPI Bar */
    .kpi-bar {
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      padding: 10px 24px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      flex-shrink: 0;
    }

    .kpi-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 8px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .kpi-title {
      font-size: 0.68rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      font-weight: 600;
    }

    .kpi-value {
      font-size: 1.15rem;
      font-weight: 700;
      font-family: var(--font-mono);
      color: #FFFFFF;
    }

    /* Main Container */
    .main-layout {
      flex: 1;
      display: grid;
      grid-template-columns: 380px 1fr;
      overflow: hidden;
    }

    /* Left Sidebar: Leads List */
    .sidebar {
      background: var(--bg-surface);
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .sidebar-header {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .filter-tabs {
      display: flex;
      gap: 5px;
      margin-bottom: 10px;
    }

    .filter-btn {
      flex: 1;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      padding: 6px 3px;
      font-size: 0.68rem;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      text-align: center;
      transition: all 0.15s ease;
    }
    .filter-btn.active {
      background: var(--brand-mint);
      border-color: var(--brand-mint);
      color: #0B0D11;
      font-weight: 700;
    }
    .filter-btn.filter-hot.active {
      background: var(--accent-crimson);
      border-color: var(--accent-crimson);
      color: #FFFFFF;
    }

    .search-box {
      width: 100%;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      color: var(--text-main);
      padding: 8px 12px;
      font-size: 0.75rem;
      border-radius: 6px;
      outline: none;
      font-family: var(--font-sans);
    }
    .search-box:focus {
      border-color: var(--border-focus);
    }

    .leads-list {
      flex: 1;
      overflow-y: auto;
    }

    .lead-item {
      padding: 14px 16px;
      border-bottom: 1px solid var(--border-subtle);
      cursor: pointer;
      transition: background 0.15s ease;
      position: relative;
    }
    .lead-item:hover {
      background: var(--bg-card-hover);
    }
    .lead-item.selected {
      background: var(--bg-card);
      border-left: 3px solid var(--brand-mint);
    }
    .lead-item.selected.is-hot {
      border-left: 3px solid var(--accent-crimson);
    }

    .lead-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .lead-phone {
      font-weight: 700;
      font-size: 0.85rem;
      font-family: var(--font-mono);
      color: #FFFFFF;
    }

    .badge {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge-hot {
      background: rgba(239, 68, 68, 0.18);
      color: var(--accent-crimson);
      border: 1px solid rgba(239, 68, 68, 0.35);
    }
    .badge-warm {
      background: rgba(245, 158, 11, 0.18);
      color: var(--accent-amber);
      border: 1px solid rgba(245, 158, 11, 0.35);
    }
    .badge-nurture {
      background: rgba(59, 130, 246, 0.18);
      color: var(--accent-blue);
      border: 1px solid rgba(59, 130, 246, 0.35);
    }
    .badge-low {
      background: rgba(100, 116, 139, 0.18);
      color: var(--text-muted);
      border: 1px solid rgba(100, 116, 139, 0.25);
    }

    .lead-snippet {
      font-size: 0.75rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 4px;
    }

    .lead-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.68rem;
      color: var(--text-dim);
    }

    /* Right Panel: Conversation View */
    .chat-panel {
      background: var(--bg-base);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .chat-header {
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }

    .chat-prospect-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--bg-card);
      border: 1px solid rgba(0, 255, 139, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: var(--brand-mint);
      font-size: 0.85rem;
    }

    .chat-prospect-details h2 {
      font-size: 0.95rem;
      font-weight: 700;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .chat-prospect-details p {
      font-size: 0.72rem;
      color: var(--text-muted);
    }

    /* Diagnosis Banner */
    .diagnosis-card {
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-subtle);
      padding: 12px 24px;
      font-size: 0.75rem;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      flex-shrink: 0;
    }

    .diagnosis-tag {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      background: rgba(0, 255, 139, 0.15);
      color: var(--brand-mint);
      border: 1px solid rgba(0, 255, 139, 0.35);
      white-space: nowrap;
    }

    .diagnosis-text {
      flex: 1;
      color: var(--text-main);
      line-height: 1.4;
    }
    .diagnosis-text strong {
      color: #FFFFFF;
    }

    /* Messages Timeline */
    .messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .msg-group {
      display: flex;
      flex-direction: column;
      max-width: 68%;
    }

    .msg-prospect {
      align-self: flex-start;
    }

    .msg-agent {
      align-self: flex-end;
    }

    .msg-system {
      align-self: center;
      max-width: 85%;
    }

    .bubble {
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 0.82rem;
      line-height: 1.5;
      position: relative;
    }

    .msg-prospect .bubble {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      color: #FFFFFF;
      border-bottom-left-radius: 3px;
    }

    .msg-agent .bubble {
      background: #0A291B;
      border: 1px solid rgba(0, 255, 139, 0.35);
      color: #F0FDF4;
      border-bottom-right-radius: 3px;
    }

    .msg-system .bubble {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: var(--accent-amber);
      font-size: 0.72rem;
      padding: 6px 14px;
      border-radius: 20px;
      text-align: center;
    }

    .msg-info {
      font-size: 0.65rem;
      color: var(--text-dim);
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .msg-agent .msg-info {
      justify-content: flex-end;
      color: rgba(0, 255, 139, 0.7);
    }

    .empty-state {
      margin: auto;
      text-align: center;
      color: var(--text-dim);
      font-size: 0.85rem;
    }
  </style>
</head>
<body>

  <!-- Top Header con Identidad Oficial IMAGENTIA -->
  <header>
    <div class="brand">
      <img src="${IMAGENTIA_LOGO_BASE64}" alt="IMAGENTIA Logo" class="brand-logo-img" />
      <div class="brand-text-block">
        <div class="brand-title">IMAGENTIA <span>//</span> B2B</div>
        <div class="brand-sub">Visual Identity & Digital Growth Agency</div>
      </div>
      <div class="brand-tag">Ángel AI Closer</div>
    </div>

    <div class="status-group">
      <div class="status-pill"><span class="dot dot-green"></span> Línea: +52 663 107 8176</div>
      <div class="status-pill"><span class="dot dot-blue"></span> Webhook: Render 24/7</div>
      <div class="status-pill"><span class="dot dot-amber"></span> Alertas: Cristian (+52 664 480 8790)</div>
    </div>

    <div class="header-actions">
      <a href="https://sapiix.com/login" target="_blank" class="btn btn-secondary">SAPIIX CRM ↗</a>
      <a href="https://imagentia.com.mx/intake" target="_blank" class="btn btn-secondary">Intake Form ↗</a>
      <button onclick="refreshData()" class="btn btn-primary-mint">⟳ Actualizar</button>
      <button onclick="logout()" class="btn btn-secondary" title="Cerrar sesión">Salir ⎋</button>
    </div>
  </header>

  <!-- KPI Pivot Cards -->
  <div class="kpi-bar">
    <div class="kpi-card">
      <div>
        <div class="kpi-title">Total Prospectos</div>
        <div class="kpi-value" id="kpi-total">0</div>
      </div>
      <span style="font-size: 1.4rem;">👥</span>
    </div>
    <div class="kpi-card">
      <div>
        <div class="kpi-title">Leads HOT 🔥</div>
        <div class="kpi-value" style="color: var(--accent-crimson);" id="kpi-hot">0</div>
      </div>
      <span style="font-size: 1.4rem;">🔥</span>
    </div>
    <div class="kpi-card">
      <div>
        <div class="kpi-title">Cualificados (WARM)</div>
        <div class="kpi-value" style="color: var(--brand-mint);" id="kpi-qualified">0</div>
      </div>
      <span style="font-size: 1.4rem;">🎯</span>
    </div>
    <div class="kpi-card">
      <div>
        <div class="kpi-title">Blindaje de Marca</div>
        <div class="kpi-value" style="color: var(--brand-mint);">100%</div>
      </div>
      <span style="font-size: 1.4rem;">🛡️</span>
    </div>
  </div>

  <!-- Main Split Layout -->
  <div class="main-layout">
    <!-- Left Sidebar: Leads List -->
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="filter-tabs">
          <button class="filter-btn active" onclick="setFilter('ALL', this)">Todos</button>
          <button class="filter-btn filter-hot" onclick="setFilter('HOT', this)">🔥 HOT</button>
          <button class="filter-btn" onclick="setFilter('WARM', this)">🟡 WARM</button>
          <button class="filter-btn" onclick="setFilter('NURTURE', this)">🔵 NURTURE</button>
          <button class="filter-btn" onclick="setFilter('LOW', this)">⚪ LOW</button>
        </div>
        <input type="text" id="search-input" class="search-box" placeholder="Buscar por teléfono o texto..." oninput="renderLeadsList()">
      </div>

      <div class="leads-list" id="leads-container">
        <!-- Rendered via JS -->
      </div>
    </div>

    <!-- Right Panel: Conversation View -->
    <div class="chat-panel" id="chat-panel">
      <div class="empty-state" id="empty-state">
        <p>Selecciona un prospecto en la lista para ver la conversación completa y el diagnóstico en tiempo real.</p>
      </div>

      <!-- Chat View Structure -->
      <div id="chat-content" style="display: none; height: 100%; display: flex; flex-direction: column;">
        <div class="chat-header">
          <div class="chat-prospect-info">
            <div class="avatar" id="chat-avatar">#</div>
            <div class="chat-prospect-details">
              <h2>
                <span id="chat-phone">+52 ...</span>
                <span id="chat-badge" class="badge">HOT</span>
              </h2>
              <p id="chat-status-text">Atendido por Ángel (Sales Engineer B2B / GPT-4o-mini)</p>
            </div>
          </div>
          <div>
            <a id="btn-wa-direct" href="#" target="_blank" class="btn btn-secondary">Abrir en WhatsApp Web ↗</a>
          </div>
        </div>

        <!-- Diagnosis Card -->
        <div class="diagnosis-card">
          <div class="diagnosis-tag">DIAGNÓSTICO B2B</div>
          <div class="diagnosis-text">
            <strong>Evaluación de Inteligencia Artificial:</strong>
            <span id="chat-reason">Cargando diagnóstico...</span>
          </div>
        </div>

        <!-- Messages Timeline -->
        <div class="messages-area" id="messages-container">
          <!-- Rendered via JS -->
        </div>
      </div>
    </div>
  </div>

  <script>
    let allLeads = [];
    let currentFilter = 'ALL';
    let selectedPhone = null;

    async function loadData() {
      try {
        const res = await fetch('/api/leads');
        if (res.status === 401) {
          window.location.reload();
          return;
        }
        allLeads = await res.json();
        updateKPIs();
        renderLeadsList();
        if (selectedPhone) {
          const lead = allLeads.find(l => l.phone === selectedPhone);
          if (lead) renderChat(lead);
        } else if (allLeads.length > 0) {
          selectLead(allLeads[0].phone);
        }
      } catch (err) {
        console.error('Error cargando leads:', err);
      }
    }

    function updateKPIs() {
      const total = allLeads.length;
      const hot = allLeads.filter(l => l.isHot || l.qualification === 'HOT').length;
      const qualified = allLeads.filter(l => l.qualification === 'WARM' || l.qualification === 'QUALIFIED').length;

      document.getElementById('kpi-total').innerText = total;
      document.getElementById('kpi-hot').innerText = hot;
      document.getElementById('kpi-qualified').innerText = qualified;
    }

    function setFilter(filter, btn) {
      currentFilter = filter;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderLeadsList();
    }

    function renderLeadsList() {
      const query = document.getElementById('search-input').value.toLowerCase();
      const container = document.getElementById('leads-container');
      container.innerHTML = '';

      const filtered = allLeads.filter(lead => {
        const matchesFilter = currentFilter === 'ALL' || lead.qualification === currentFilter;
        const matchesQuery = !query || 
          lead.phone.toLowerCase().includes(query) || 
          (lead.name && lead.name.toLowerCase().includes(query)) ||
          lead.lastMessage.toLowerCase().includes(query);
        return matchesFilter && matchesQuery;
      });

      if (filtered.length === 0) {
        container.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-dim); font-size: 0.8rem;">No hay prospectos en esta categoría.</div>';
        return;
      }

      filtered.forEach(lead => {
        const item = document.createElement('div');
        item.className = 'lead-item ' + (lead.phone === selectedPhone ? 'selected ' : '') + (lead.isHot ? 'is-hot' : '');
        item.onclick = () => selectLead(lead.phone);

        const badgeClass = lead.isHot ? 'badge-hot' : (lead.qualification === 'WARM' || lead.qualification === 'QUALIFIED' ? 'badge-warm' : (lead.qualification === 'NURTURE' ? 'badge-nurture' : 'badge-low'));
        const badgeLabel = lead.isHot ? '🔥 HOT' : (lead.qualification === 'WARM' ? '🟡 WARM' : (lead.qualification === 'NURTURE' ? '🔵 NURTURE' : (lead.qualification === 'LOW' ? '⚪ LOW' : lead.qualification)));
        const timeStr = new Date(lead.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        item.innerHTML = \`
          <div class="lead-top">
            <span class="lead-phone">+\${lead.phone}</span>
            <span class="badge \${badgeClass}">\${badgeLabel}</span>
          </div>
          <div class="lead-snippet">\${lead.lastMessage}</div>
          <div class="lead-meta">
            <span>\${lead.name || 'Prospecto Inbound'}</span>
            <span>\${timeStr}</span>
          </div>
        \`;
        container.appendChild(item);
      });
    }

    function selectLead(phone) {
      selectedPhone = phone;
      renderLeadsList();
      const lead = allLeads.find(l => l.phone === phone);
      if (lead) renderChat(lead);
    }

    function renderChat(lead) {
      document.getElementById('empty-state').style.display = 'none';
      const content = document.getElementById('chat-content');
      content.style.display = 'flex';

      document.getElementById('chat-avatar').innerText = (lead.name ? lead.name[0] : '+').toUpperCase();
      document.getElementById('chat-phone').innerText = '+' + lead.phone + (lead.name ? ' (' + lead.name + ')' : '');
      
      const badge = document.getElementById('chat-badge');
      badge.className = 'badge ' + (lead.isHot ? 'badge-hot' : (lead.qualification === 'WARM' || lead.qualification === 'QUALIFIED' ? 'badge-warm' : (lead.qualification === 'NURTURE' ? 'badge-nurture' : 'badge-low')));
      badge.innerText = lead.isHot ? '🔥 LEAD HOT' : (lead.qualification === 'WARM' ? '🟡 WARM' : (lead.qualification === 'NURTURE' ? '🔵 NURTURE' : (lead.qualification === 'LOW' ? '⚪ LOW' : lead.qualification)));

      document.getElementById('chat-reason').innerText = lead.reason || 'Evaluación comercial estándar.';
      document.getElementById('btn-wa-direct').href = 'https://wa.me/' + lead.phone;

      const msgContainer = document.getElementById('messages-container');
      msgContainer.innerHTML = '';

      lead.messages.forEach(msg => {
        const group = document.createElement('div');
        const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (msg.sender === 'prospect') {
          group.className = 'msg-group msg-prospect';
          group.innerHTML = \`
            <div class="bubble">\${escapeHtml(msg.text)}</div>
            <div class="msg-info"><span>Prospecto</span> • <span>\${timeStr}</span></div>
          \`;
        } else if (msg.sender === 'agent' || msg.sender === 'bot') {
          group.className = 'msg-group msg-agent';
          group.innerHTML = \`
            <div class="bubble">\${escapeHtml(msg.text)}</div>
            <div class="msg-info"><span>Ángel (IMAGENTIA AI)</span> • <span>\${timeStr}</span> ✓✓</div>
          \`;
        } else {
          group.className = 'msg-group msg-system';
          group.innerHTML = \`
            <div class="bubble">\${escapeHtml(msg.text)}</div>
          \`;
        }
        msgContainer.appendChild(group);
      });

      msgContainer.scrollTop = msgContainer.scrollHeight;
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.innerText = text;
      return div.innerHTML;
    }

    function refreshData() {
      loadData();
    }

    async function logout() {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.reload();
    }

    // Auto-polling cada 4 segundos
    loadData();
    setInterval(loadData, 4000);
  </script>
</body>
</html>`;
}

export function getLoginHtml(errorMessage?: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IMAGENTIA // Acceso Consola Operativa B2B</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-base: #0B0D11;
      --bg-surface: #12151B;
      --bg-card: #181C24;
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-focus: #00FF8B;
      --brand-mint: #00FF8B;
      --brand-green: #00FF60;
      --text-main: #EDEDED;
      --text-muted: #94A3B8;
      --accent-crimson: #EF4444;
      --font-sans: 'Plus Jakarta Sans', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg-base);
      color: var(--text-main);
      font-family: var(--font-sans);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .login-card {
      width: 100%;
      max-width: 440px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 14px;
      padding: 40px 34px;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.7);
      text-align: center;
    }
    .brand-logo-hero {
      width: 260px;
      height: auto;
      max-width: 90%;
      object-fit: contain;
      margin-bottom: 22px;
      filter: drop-shadow(0 0 18px rgba(0, 255, 139, 0.45));
    }
    .brand-header {
      margin-bottom: 28px;
    }
    .brand-title {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #FFFFFF;
      margin-bottom: 4px;
    }
    .brand-title span { color: var(--brand-mint); }
    .brand-sub {
      font-size: 0.7rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 600;
    }
    .form-group {
      text-align: left;
      margin-bottom: 18px;
    }
    label {
      display: block;
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    input {
      width: 100%;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      color: #FFFFFF;
      padding: 12px 14px;
      font-size: 0.85rem;
      border-radius: 8px;
      outline: none;
      font-family: var(--font-sans);
      transition: all 0.2s ease;
    }
    input:focus {
      border-color: var(--border-focus);
      box-shadow: 0 0 12px rgba(0, 255, 139, 0.2);
    }
    .btn-submit {
      width: 100%;
      background: var(--brand-mint);
      color: #0B0D11;
      border: none;
      font-weight: 800;
      font-size: 0.85rem;
      padding: 13px;
      border-radius: 8px;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      transition: all 0.2s ease;
      margin-top: 12px;
      box-shadow: 0 4px 16px rgba(0, 255, 139, 0.3);
    }
    .btn-submit:hover {
      background: var(--brand-green);
      box-shadow: 0 6px 20px rgba(0, 255, 139, 0.5);
    }
    .alert-error {
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.35);
      color: var(--accent-crimson);
      font-size: 0.75rem;
      padding: 10px 14px;
      border-radius: 6px;
      margin-bottom: 18px;
      display: ${errorMessage ? 'block' : 'none'};
      text-align: left;
    }
    .security-footer {
      margin-top: 26px;
      padding-top: 18px;
      border-top: 1px solid var(--border-subtle);
      text-align: center;
      font-size: 0.68rem;
      color: var(--text-dim);
      font-family: var(--font-mono);
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="login-card">
    <img src="${IMAGENTIA_LOGO_BASE64}" alt="IMAGENTIA Logo" class="brand-logo-hero" />
    
    <div class="brand-header">
      <div class="brand-title">IMAGENTIA <span>//</span> B2B</div>
      <div class="brand-sub">Visual Identity & Digital Growth Agency</div>
    </div>

    <div class="alert-error" id="error-box">${errorMessage || ''}</div>

    <form id="login-form">
      <div class="form-group">
        <label for="email">Correo Institucional</label>
        <input type="email" id="email" required placeholder="ejemplo@imagentia.com.mx" autofocus>
      </div>
      <div class="form-group">
        <label for="password">Contraseña Operativa</label>
        <input type="password" id="password" required placeholder="••••••••••••">
      </div>
      <button type="submit" class="btn-submit" id="btn-submit">Ingresar al Sistema</button>
      <div style="display: flex; gap: 8px; margin-top: 14px;">
        <button type="button" onclick="fillCreds('cristian@imagentia.com.mx', 'CristianImagentia2026#')" style="flex: 1; background: var(--bg-card); border: 1px solid var(--border-subtle); color: var(--text-muted); font-size: 0.72rem; padding: 8px; border-radius: 6px; cursor: pointer;">👤 Cristian (Admin)</button>
        <button type="button" onclick="fillCreds('angel@imagentia.com.mx', 'AngelImagentia2026#')" style="flex: 1; background: var(--bg-card); border: 1px solid var(--border-subtle); color: var(--text-muted); font-size: 0.72rem; padding: 8px; border-radius: 6px; cursor: pointer;">💼 Ángel (Ventas)</button>
      </div>
    </form>

    <div class="security-footer">
      Sesión encriptada HttpOnly // 12 Horas de vigencia<br>
      Acceso: Cristian (Director) & Ángel (Ventas)
    </div>
  </div>

  <script>
    function fillCreds(e, p) {
      document.getElementById('email').value = e;
      document.getElementById('password').value = p;
      document.getElementById('btn-submit').focus();
    }
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const errorBox = document.getElementById('error-box');
      const submitBtn = document.getElementById('btn-submit');

      submitBtn.disabled = true;
      submitBtn.innerText = 'Autenticando...';
      errorBox.style.display = 'none';

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          window.location.href = '/dashboard';
        } else {
          errorBox.innerText = data.message || 'Credenciales no autorizadas.';
          errorBox.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.innerText = 'Ingresar al Sistema';
        }
      } catch (err) {
        errorBox.innerText = 'Error de conexión con el servidor.';
        errorBox.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerText = 'Ingresar al Sistema';
      }
    });
  </script>
</body>
</html>`;
}
