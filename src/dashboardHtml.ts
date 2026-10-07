export function getDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IMAGENTIA // Live B2B WhatsApp Conversation Hub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-base: #080B11;
      --bg-surface: #0E131F;
      --bg-card: #141B2B;
      --bg-card-hover: #1A2338;
      --border-subtle: #1F293D;
      --border-focus: #3B82F6;
      --text-main: #F3F4F6;
      --text-muted: #94A3B8;
      --text-dim: #64748B;
      --accent-gold: #D4AF37;
      --accent-emerald: #10B981;
      --accent-crimson: #EF4444;
      --accent-amber: #F59E0B;
      --accent-blue: #3B82F6;
      --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background-color: var(--bg-base); color: var(--text-main); font-family: var(--font-sans); height: 100vh; overflow: hidden; display: flex; flex-direction: column; }
    header { background: var(--bg-surface); border-bottom: 1px solid var(--border-subtle); padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
    .brand { display: flex; align-items: center; gap: 14px; }
    .brand-logo { font-weight: 800; font-size: 1.15rem; letter-spacing: 0.12em; color: #FFFFFF; display: flex; align-items: center; gap: 8px; }
    .brand-logo span { color: var(--accent-gold); }
    .brand-tag { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 8px; border-radius: 4px; background: rgba(212, 175, 55, 0.12); color: var(--accent-gold); border: 1px solid rgba(212, 175, 55, 0.25); }
    .status-group { display: flex; align-items: center; gap: 12px; }
    .status-pill { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; padding: 4px 10px; border-radius: 20px; background: var(--bg-card); border: 1px solid var(--border-subtle); color: var(--text-muted); }
    .dot { width: 7px; height: 7px; border-radius: 50%; }
    .dot-green { background: var(--accent-emerald); box-shadow: 0 0 8px var(--accent-emerald); }
    .dot-blue { background: var(--accent-blue); }
    .dot-amber { background: var(--accent-amber); box-shadow: 0 0 6px var(--accent-amber); }
    .header-actions { display: flex; align-items: center; gap: 10px; }
    .btn { font-size: 0.75rem; font-weight: 600; padding: 6px 12px; border-radius: 6px; text-decoration: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s ease; border: 1px solid transparent; }
    .btn-secondary { background: var(--bg-card); color: var(--text-main); border-color: var(--border-subtle); }
    .btn-secondary:hover { background: var(--bg-card-hover); border-color: var(--text-dim); }
    .btn-gold { background: rgba(212, 175, 55, 0.15); color: var(--accent-gold); border-color: rgba(212, 175, 55, 0.35); }
    .btn-gold:hover { background: rgba(212, 175, 55, 0.25); }
    .kpi-bar { background: var(--bg-surface); border-bottom: 1px solid var(--border-subtle); padding: 10px 24px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; flex-shrink: 0; }
    .kpi-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 8px 14px; display: flex; align-items: center; justify-content: space-between; }
    .kpi-title { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
    .kpi-value { font-size: 1.15rem; font-weight: 700; font-family: var(--font-mono); color: #FFFFFF; }
    .main-layout { flex: 1; display: grid; grid-template-columns: 380px 1fr; overflow: hidden; }
    .sidebar { background: var(--bg-surface); border-right: 1px solid var(--border-subtle); display: flex; flex-direction: column; overflow: hidden; }
    .sidebar-header { padding: 14px 16px; border-bottom: 1px solid var(--border-subtle); }
    .filter-tabs { display: flex; gap: 6px; margin-bottom: 10px; }
    .filter-btn { flex: 1; background: var(--bg-card); border: 1px solid var(--border-subtle); color: var(--text-muted); padding: 6px 4px; font-size: 0.7rem; font-weight: 600; border-radius: 6px; cursor: pointer; text-align: center; }
    .filter-btn.active { background: var(--accent-blue); border-color: var(--accent-blue); color: #FFFFFF; }
    .filter-btn.filter-hot.active { background: var(--accent-crimson); border-color: var(--accent-crimson); }
    .search-box { width: 100%; background: var(--bg-card); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 8px 12px; font-size: 0.75rem; border-radius: 6px; outline: none; }
    .leads-list { flex: 1; overflow-y: auto; }
    .lead-item { padding: 14px 16px; border-bottom: 1px solid var(--border-subtle); cursor: pointer; }
    .lead-item:hover { background: var(--bg-card-hover); }
    .lead-item.selected { background: var(--bg-card); border-left: 3px solid var(--accent-blue); }
    .lead-item.selected.is-hot { border-left: 3px solid var(--accent-crimson); }
    .lead-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
    .lead-phone { font-weight: 700; font-size: 0.85rem; font-family: var(--font-mono); color: #FFFFFF; }
    .badge { font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
    .badge-hot { background: rgba(239, 68, 68, 0.18); color: var(--accent-crimson); border: 1px solid rgba(239, 68, 68, 0.35); }
    .badge-qualified { background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-low { background: rgba(100, 116, 139, 0.18); color: var(--text-muted); border: 1px solid rgba(100, 116, 139, 0.25); }
    .lead-snippet { font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
    .lead-meta { display: flex; align-items: center; justify-content: space-between; font-size: 0.68rem; color: var(--text-dim); }
    .chat-panel { background: var(--bg-base); display: flex; flex-direction: column; overflow: hidden; }
    .chat-header { background: var(--bg-surface); border-bottom: 1px solid var(--border-subtle); padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
    .chat-prospect-info { display: flex; align-items: center; gap: 12px; }
    .avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--bg-card); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--accent-gold); font-size: 0.9rem; }
    .chat-prospect-details h2 { font-size: 0.95rem; font-weight: 700; color: #FFFFFF; display: flex; align-items: center; gap: 8px; }
    .chat-prospect-details p { font-size: 0.72rem; color: var(--text-muted); }
    .diagnosis-card { background: var(--bg-card); border-bottom: 1px solid var(--border-subtle); padding: 12px 24px; font-size: 0.75rem; display: flex; align-items: flex-start; gap: 12px; flex-shrink: 0; }
    .diagnosis-tag { font-size: 0.65rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; background: rgba(59, 130, 246, 0.15); color: var(--accent-blue); border: 1px solid rgba(59, 130, 246, 0.3); white-space: nowrap; }
    .diagnosis-text { flex: 1; color: var(--text-main); line-height: 1.4; }
    .messages-area { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 16px; }
    .msg-group { display: flex; flex-direction: column; max-width: 68%; }
    .msg-prospect { align-self: flex-start; }
    .msg-agent { align-self: flex-end; }
    .msg-system { align-self: center; max-width: 85%; }
    .bubble { padding: 12px 16px; border-radius: 12px; font-size: 0.82rem; line-height: 1.5; position: relative; }
    .msg-prospect .bubble { background: var(--bg-card); border: 1px solid var(--border-subtle); color: #FFFFFF; border-bottom-left-radius: 3px; }
    .msg-agent .bubble { background: #0B3828; border: 1px solid rgba(16, 185, 129, 0.35); color: #ECFDF5; border-bottom-right-radius: 3px; }
    .msg-system .bubble { background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); color: var(--accent-amber); font-size: 0.72rem; padding: 6px 14px; border-radius: 20px; text-align: center; }
    .msg-info { font-size: 0.65rem; color: var(--text-dim); margin-top: 4px; display: flex; align-items: center; gap: 6px; }
    .msg-agent .msg-info { justify-content: flex-end; color: rgba(255, 255, 255, 0.5); }
    .empty-state { margin: auto; text-align: center; color: var(--text-dim); font-size: 0.85rem; }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="brand-logo">IMAGENTIA <span>//</span> B2B AGENT</div>
      <div class="brand-tag">Autonomous Closer</div>
    </div>
    <div class="status-group">
      <div class="status-pill"><span class="dot dot-green"></span> Línea: +52 663 107 8176</div>
      <div class="status-pill"><span class="dot dot-blue"></span> Webhook: Render 24/7</div>
      <div class="status-pill"><span class="dot dot-amber"></span> Alertas: Cristian (+52 664 480 8790)</div>
    </div>
    <div class="header-actions">
      <a href="https://sapiix.com/login" target="_blank" class="btn btn-secondary">SAPIIX CRM ↗</a>
      <a href="https://imagentia.com.mx/intake" target="_blank" class="btn btn-secondary">Intake Form ↗</a>
      <button onclick="refreshData()" class="btn btn-gold">⟳ Actualizar</button>
    </div>
  </header>
  <div class="kpi-bar">
    <div class="kpi-card"><div><div class="kpi-title">Total Prospectos</div><div class="kpi-value" id="kpi-total">0</div></div><span style="font-size: 1.4rem;">👥</span></div>
    <div class="kpi-card"><div><div class="kpi-title">Leads HOT 🔥</div><div class="kpi-value" style="color: var(--accent-crimson);" id="kpi-hot">0</div></div><span style="font-size: 1.4rem;">🔥</span></div>
    <div class="kpi-card"><div><div class="kpi-title">Cualificados B2B</div><div class="kpi-value" style="color: var(--accent-emerald);" id="kpi-qualified">0</div></div><span style="font-size: 1.4rem;">🎯</span></div>
    <div class="kpi-card"><div><div class="kpi-title">Blindaje Tarifas</div><div class="kpi-value" style="color: var(--accent-gold);">100%</div></div><span style="font-size: 1.4rem;">🛡️</span></div>
  </div>
  <div class="main-layout">
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="filter-tabs">
          <button class="filter-btn active" onclick="setFilter('ALL', this)">Todos</button>
          <button class="filter-btn filter-hot" onclick="setFilter('HOT', this)">🔥 HOT</button>
          <button class="filter-btn" onclick="setFilter('QUALIFIED', this)">Cualificados</button>
          <button class="filter-btn" onclick="setFilter('LOW', this)">Iniciales</button>
        </div>
        <input type="text" id="search-input" class="search-box" placeholder="Buscar por teléfono o texto..." oninput="renderLeadsList()">
      </div>
      <div class="leads-list" id="leads-container"></div>
    </div>
    <div class="chat-panel" id="chat-panel">
      <div class="empty-state" id="empty-state">
        <p>Selecciona un prospecto en la lista para ver la conversación completa y el diagnóstico en tiempo real.</p>
      </div>
      <div id="chat-content" style="display: none; height: 100%; display: flex; flex-direction: column;">
        <div class="chat-header">
          <div class="chat-prospect-info">
            <div class="avatar" id="chat-avatar">#</div>
            <div class="chat-prospect-details">
              <h2>
                <span id="chat-phone">+52 ...</span>
                <span id="chat-badge" class="badge">HOT</span>
              </h2>
              <p id="chat-status-text">Atendido de forma autónoma por GPT-4o-mini</p>
            </div>
          </div>
          <div><a id="btn-wa-direct" href="#" target="_blank" class="btn btn-secondary">Abrir en WhatsApp Web ↗</a></div>
        </div>
        <div class="diagnosis-card">
          <div class="diagnosis-tag">DIAGNÓSTICO B2B</div>
          <div class="diagnosis-text"><strong>Evaluación de IA: </strong><span id="chat-reason">Cargando...</span></div>
        </div>
        <div class="messages-area" id="messages-container"></div>
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
        allLeads = await res.json();
        updateKPIs();
        renderLeadsList();
        if (selectedPhone) {
          const lead = allLeads.find(l => l.phone === selectedPhone);
          if (lead) renderChat(lead);
        } else if (allLeads.length > 0) {
          selectLead(allLeads[0].phone);
        }
      } catch (err) { console.error(err); }
    }
    function updateKPIs() {
      document.getElementById('kpi-total').innerText = allLeads.length;
      document.getElementById('kpi-hot').innerText = allLeads.filter(l => l.isHot || l.qualification === 'HOT').length;
      document.getElementById('kpi-qualified').innerText = allLeads.filter(l => l.qualification === 'QUALIFIED').length;
    }
    function setFilter(f, btn) {
      currentFilter = f;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderLeadsList();
    }
    function renderLeadsList() {
      const q = document.getElementById('search-input').value.toLowerCase();
      const c = document.getElementById('leads-container');
      c.innerHTML = '';
      const filtered = allLeads.filter(l => {
        const mf = currentFilter === 'ALL' || l.qualification === currentFilter;
        const mq = !q || l.phone.toLowerCase().includes(q) || (l.name && l.name.toLowerCase().includes(q)) || l.lastMessage.toLowerCase().includes(q);
        return mf && mq;
      });
      if (filtered.length === 0) { c.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-dim); font-size: 0.8rem;">No hay prospectos en esta categoría.</div>'; return; }
      filtered.forEach(lead => {
        const item = document.createElement('div');
        item.className = 'lead-item ' + (lead.phone === selectedPhone ? 'selected ' : '') + (lead.isHot ? 'is-hot' : '');
        item.onclick = () => selectLead(lead.phone);
        const bc = lead.isHot ? 'badge-hot' : (lead.qualification === 'QUALIFIED' ? 'badge-qualified' : 'badge-low');
        const bl = lead.isHot ? '🔥 HOT' : lead.qualification;
        const ts = new Date(lead.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        item.innerHTML = '<div class="lead-top"><span class="lead-phone">+' + lead.phone + '</span><span class="badge ' + bc + '">' + bl + '</span></div><div class="lead-snippet">' + escapeHtml(lead.lastMessage) + '</div><div class="lead-meta"><span>' + (lead.name || 'Prospecto Inbound') + '</span><span>' + ts + '</span></div>';
        c.appendChild(item);
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
      document.getElementById('chat-content').style.display = 'flex';
      document.getElementById('chat-avatar').innerText = (lead.name ? lead.name[0] : '+').toUpperCase();
      document.getElementById('chat-phone').innerText = '+' + lead.phone + (lead.name ? ' (' + lead.name + ')' : '');
      const badge = document.getElementById('chat-badge');
      badge.className = 'badge ' + (lead.isHot ? 'badge-hot' : (lead.qualification === 'QUALIFIED' ? 'badge-qualified' : 'badge-low'));
      badge.innerText = lead.isHot ? '🔥 LEAD HOT' : lead.qualification;
      document.getElementById('chat-reason').innerText = lead.reason || 'Evaluación comercial estándar.';
      document.getElementById('btn-wa-direct').href = 'https://wa.me/' + lead.phone;
      const mc = document.getElementById('messages-container');
      mc.innerHTML = '';
      lead.messages.forEach(msg => {
        const g = document.createElement('div');
        const ts = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (msg.sender === 'prospect') {
          g.className = 'msg-group msg-prospect';
          g.innerHTML = '<div class="bubble">' + escapeHtml(msg.text) + '</div><div class="msg-info"><span>Prospecto</span> • <span>' + ts + '</span></div>';
        } else if (msg.sender === 'agent') {
          g.className = 'msg-group msg-agent';
          g.innerHTML = '<div class="bubble">' + escapeHtml(msg.text) + '</div><div class="msg-info"><span>IMAGENTIA B2B Bot</span> • <span>' + ts + '</span> ✓✓</div>';
        } else {
          g.className = 'msg-group msg-system';
          g.innerHTML = '<div class="bubble">' + escapeHtml(msg.text) + '</div>';
        }
        mc.appendChild(g);
      });
      mc.scrollTop = mc.scrollHeight;
    }
    function escapeHtml(t) { const d = document.createElement('div'); d.innerText = t; return d.innerHTML; }
    function refreshData() { loadData(); }
    loadData();
    setInterval(loadData, 4000);
  </script>
</body>
</html>`;
}
