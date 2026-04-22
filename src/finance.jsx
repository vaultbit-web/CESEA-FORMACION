// ─── Horas impartidas ─────────────────────────────────────────────────────────
// Desglose de horas impartidas, filtrables por área, modalidad, estado y
// curso — con totales, gráfico mensual y tabla exportable.
function HoursView() {
  const { hoursLog, courses } = React.useContext(AppContext);
  const Mc = window.Motion?.motion?.div || 'div';
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  // ── Filtros
  const [fArea,     setFArea]     = React.useState('all');
  const [fModality, setFModality] = React.useState('all');
  const [fStatus,   setFStatus]   = React.useState('all');
  const [query,     setQuery]     = React.useState('');

  const areas      = ['all', ...Array.from(new Set(hoursLog.map(h => h.area)))];
  const modalities = ['all', ...Array.from(new Set(hoursLog.map(h => h.modality)))];
  const statuses   = ['all', ...Array.from(new Set(hoursLog.map(h => h.status)))];

  const filtered = hoursLog.filter(h =>
       (fArea     === 'all' || h.area     === fArea)
    && (fModality === 'all' || h.modality === fModality)
    && (fStatus   === 'all' || h.status   === fStatus)
    && (!query || h.course.toLowerCase().includes(query.toLowerCase()))
  );

  // ── Totales
  const totalHours     = filtered.reduce((s, h) => s + h.hours, 0);
  const validatedHours = filtered.filter(h => h.status === 'Validado').reduce((s, h) => s + h.hours, 0);
  const pendingHours   = filtered.filter(h => h.status !== 'Validado').reduce((s, h) => s + h.hours, 0);
  const distinctCourses = new Set(filtered.map(h => h.course)).size;

  const STATS = [
    { label: 'Horas totales',       value: totalHours     + 'h', color: COLORS.dark,   bg: '#f4f5f9',            icon: '⏱' },
    { label: 'Horas validadas',     value: validatedHours + 'h', color: '#16a34a',     bg: '#f0fdf4',            icon: '✓' },
    { label: 'Horas por validar',   value: pendingHours   + 'h', color: COLORS.orange, bg: `${COLORS.orange}0c`, icon: '◷' },
    { label: 'Formaciones',         value: String(distinctCourses),                    color: COLORS.cyan,   bg: `${COLORS.cyan}0c`,  icon: '◫' },
  ];

  const STATUS_CONF = {
    'Validado':    { color: '#16a34a',     bg: '#f0fdf4'             },
    'Pendiente':   { color: COLORS.orange, bg: `${COLORS.orange}12`  },
    'En revisión': { color: COLORS.yellow, bg: `${COLORS.yellow}18`  },
  };

  // ── Evolución mensual: agregamos horas del log por mes
  const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const monthTotals = Array(12).fill(0);
  filtered.forEach(h => {
    const [_, m] = h.date.split('/');
    monthTotals[parseInt(m) - 1] += h.hours;
  });
  const CHART = MONTHS.slice(0, 6).map((m, i) => ({ m, v: monthTotals[i] }));
  const maxV  = Math.max(...CHART.map(d => d.v), 1);

  // ── Desglose por área (para leer rápidamente el peso de cada área)
  const byArea = {};
  filtered.forEach(h => { byArea[h.area] = (byArea[h.area] || 0) + h.hours; });
  const areaBreakdown = Object.entries(byArea).sort((a, b) => b[1] - a[1]);
  const AREA_COLORS = [COLORS.orange, COLORS.cyan, COLORS.fuchsia, COLORS.lavender, COLORS.yellow];

  const chipStyle = (active) => ({
    padding: '7px 14px', borderRadius: 14, border: 'none',
    background: active ? COLORS.gradient : '#f0f1f5',
    color: active ? '#fff' : COLORS.text,
    fontSize: 12, fontWeight: active ? 700 : 600, cursor: 'pointer', fontFamily: 'Lato',
    transition: 'all 0.18s',
    boxShadow: active ? '0 2px 10px rgba(244,120,9,0.22)' : 'none',
  });

  return React.createElement('div', null,
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6, flexWrap: 'wrap', gap: 12 } },
      React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 28, fontWeight: 800, color: COLORS.dark, margin: 0 } }, 'Horas impartidas'),
      React.createElement('div', { style: { fontSize: 13, color: COLORS.textLight, fontFamily: 'Lato' } }, 'Registro de horas formativas impartidas con CESEA Formación.'),
    ),
    React.createElement('div', { style: { height: 24 } }),

    // ─── Stat cards
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 } },
      ...STATS.map((s, i) => React.createElement(Mc, {
        key: s.label,
        ...(window.Motion ? { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } } : {}),
        style: { background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderRadius: 22, padding: '22px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(255,255,255,0.72)' }
      },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 } },
          React.createElement('span', { style: { fontSize: 11, color: COLORS.textLight, fontFamily: 'Lato', fontWeight: 600, letterSpacing: 0.3 } }, s.label),
          React.createElement('div', { style: { width: 32, height: 32, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: s.color } }, s.icon),
        ),
        React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 } }, s.value),
      )),
    ),

    // ─── Chart + area breakdown
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 } },

      // Evolución mensual de horas
      React.createElement('div', {
        style: { background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderRadius: 24, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(255,255,255,0.72)' }
      },
        React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 15, fontWeight: 800, color: COLORS.dark, marginBottom: 4 } }, 'Evolución mensual'),
        React.createElement('div', { style: { fontSize: 11, color: COLORS.textLight, fontFamily: 'Lato', letterSpacing: 0.3, marginBottom: 22 } }, 'Horas impartidas · 2026'),
        React.createElement('div', { style: { display: 'flex', alignItems: 'flex-end', gap: 8, height: 150 } },
          ...CHART.map(d => {
            const targetH = (d.v / maxV) * 126;
            const Bar = window.Motion?.motion?.div || 'div';
            return React.createElement('div', { key: d.m, style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 } },
              React.createElement('span', { style: { fontSize: 10, fontWeight: 700, color: COLORS.cyan, fontFamily: 'Lato' } }, d.v + 'h'),
              React.createElement(Bar, {
                ...(window.Motion ? { initial: { height: 0 }, animate: { height: mounted ? targetH : 0 }, transition: { duration: 0.65, ease: 'easeOut', delay: 0.12 } } : { style: { height: targetH } }),
                style: { width: '100%', borderRadius: '10px 10px 4px 4px', background: `linear-gradient(180deg, ${COLORS.orange}, ${COLORS.pink}99, ${COLORS.cyan}77)`, boxShadow: `0 4px 16px ${COLORS.orange}22`, minHeight: 2 }
              }),
              React.createElement('span', { style: { fontSize: 11, color: COLORS.textLight, fontFamily: 'Lato' } }, d.m),
            );
          }),
        ),
        React.createElement('div', { style: { marginTop: 20, padding: '14px 16px', background: `${COLORS.cyan}08`, borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight } }, 'Media mensual'),
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 16, fontWeight: 800, color: COLORS.cyan } },
            Math.round(CHART.reduce((s, d) => s + d.v, 0) / CHART.length) + 'h'
          ),
        ),
      ),

      // Desglose por área
      React.createElement('div', {
        style: { background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderRadius: 24, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(255,255,255,0.72)' }
      },
        React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 15, fontWeight: 800, color: COLORS.dark, marginBottom: 18 } }, 'Horas por grupo de acciones'),
        areaBreakdown.length === 0
          ? React.createElement('div', { style: { textAlign: 'center', color: COLORS.textLight, fontSize: 13, fontFamily: 'Lato', padding: '28px 0' } }, 'No hay horas que mostrar con los filtros actuales.')
          : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
              ...areaBreakdown.map(([area, h], i) => {
                const pct = Math.round((h / totalHours) * 100) || 0;
                const c = AREA_COLORS[i % AREA_COLORS.length];
                return React.createElement('div', { key: area },
                  React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 } },
                    React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, fontWeight: 700, color: COLORS.dark } }, area),
                    React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 800, color: c } }, h + 'h · ' + pct + '%'),
                  ),
                  React.createElement('div', { style: { height: 8, borderRadius: 6, background: '#f0f1f5', overflow: 'hidden' } },
                    React.createElement('div', { style: { width: pct + '%', height: '100%', background: `linear-gradient(90deg, ${c}, ${c}cc)`, transition: 'width 0.6s ease' } }),
                  ),
                );
              }),
            ),
      ),
    ),

    // ─── Filters + table
    React.createElement('div', {
      style: { background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderRadius: 24, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(255,255,255,0.72)' }
    },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 12 } },
        React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 15, fontWeight: 800, color: COLORS.dark } }, 'Registro de horas'),
        React.createElement('button', {
          style: { padding: '7px 16px', borderRadius: 12, border: `1px solid ${COLORS.cyan}30`, background: `${COLORS.cyan}08`, color: COLORS.cyan, fontSize: 11, cursor: 'pointer', fontFamily: 'Lato', fontWeight: 700 }
        }, '↓ Exportar CSV'),
      ),

      // Filter row
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 } },
        React.createElement('input', {
          value: query, onChange: e => setQuery(e.target.value),
          placeholder: 'Buscar por nombre de curso…',
          style: { padding: '10px 14px', borderRadius: 12, border: '1px solid #e8eaf0', fontSize: 13, fontFamily: 'Lato', outline: 'none', width: '100%', boxSizing: 'border-box', color: COLORS.dark, background: '#fafbfc' },
        }),
        React.createElement('div', { style: { display: 'flex', gap: 16, flexWrap: 'wrap' } },
          React.createElement(FilterGroup, { label: 'Grupo',     options: areas,      value: fArea,     onChange: setFArea,     chipStyle }),
          React.createElement(FilterGroup, { label: 'Modalidad', options: modalities, value: fModality, onChange: setFModality, chipStyle }),
          React.createElement(FilterGroup, { label: 'Estado',    options: statuses,   value: fStatus,   onChange: setFStatus,   chipStyle }),
        ),
      ),

      // Table
      filtered.length === 0
        ? React.createElement('div', { style: { textAlign: 'center', padding: '48px 0', color: COLORS.textLight } },
            React.createElement('div', { style: { fontSize: 38, marginBottom: 12 } }, '⏱'),
            React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 15, color: COLORS.dark } }, 'Sin registros'),
            React.createElement('div', { style: { fontSize: 13, marginTop: 4, fontFamily: 'Lato' } }, 'Ajusta los filtros para ver más horas.'),
          )
        : React.createElement('div', { style: { overflowX: 'auto', WebkitOverflowScrolling: 'touch' } },
            React.createElement('table', { style: { width: '100%', minWidth: 640, borderCollapse: 'separate', borderSpacing: '0 8px' } },
              React.createElement('thead', null,
                React.createElement('tr', null,
                  ...['Ref.', 'Formación', 'Área', 'Fecha', 'Horas', 'Modalidad', 'Estado'].map(h =>
                    React.createElement('th', { key: h, style: { textAlign: 'left', padding: '4px 12px', fontSize: 10, fontWeight: 700, color: COLORS.textLight, fontFamily: 'Bricolage Grotesque', textTransform: 'uppercase', letterSpacing: 0.8 } }, h)
                  ),
                ),
              ),
              React.createElement('tbody', null,
                ...filtered.map(row => {
                  const st = STATUS_CONF[row.status] || STATUS_CONF['Pendiente'];
                  return React.createElement('tr', { key: row.id },
                    React.createElement('td', { style: { padding: '13px 12px', fontSize: 12, fontFamily: 'Lato', fontWeight: 700, color: COLORS.dark, background: '#fafbfc', borderRadius: '14px 0 0 14px', whiteSpace: 'nowrap' } }, row.id),
                    React.createElement('td', { style: { padding: '13px 12px', fontSize: 12, fontFamily: 'Lato', color: COLORS.text, background: '#fafbfc', maxWidth: 280 } }, row.course),
                    React.createElement('td', { style: { padding: '13px 12px', fontSize: 11, fontFamily: 'Lato', color: COLORS.textLight, background: '#fafbfc', whiteSpace: 'nowrap' } },
                      React.createElement('span', { style: { padding: '3px 10px', borderRadius: 10, background: `${COLORS.fuchsia}10`, color: COLORS.fuchsia, fontWeight: 700 } }, row.area),
                    ),
                    React.createElement('td', { style: { padding: '13px 12px', fontSize: 12, fontFamily: 'Lato', color: COLORS.textLight, background: '#fafbfc', whiteSpace: 'nowrap' } }, row.date),
                    React.createElement('td', { style: { padding: '13px 12px', fontSize: 14, fontFamily: 'Bricolage Grotesque', fontWeight: 800, color: COLORS.dark, background: '#fafbfc', whiteSpace: 'nowrap' } }, row.hours + 'h'),
                    React.createElement('td', { style: { padding: '13px 12px', fontSize: 12, fontFamily: 'Lato', color: COLORS.text, background: '#fafbfc', whiteSpace: 'nowrap' } }, row.modality),
                    React.createElement('td', { style: { padding: '13px 12px', background: '#fafbfc', borderRadius: '0 14px 14px 0' } },
                      React.createElement('span', { style: { padding: '4px 12px', borderRadius: 10, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color, fontFamily: 'Lato', whiteSpace: 'nowrap' } }, row.status),
                    ),
                  );
                }),
              ),
            ),
          ),
    ),
  );
}

// ─── Reusable chip-filter group ───────────────────────────────────────────────
function FilterGroup({ label, options, value, onChange, chipStyle }) {
  return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
    React.createElement('span', { style: { fontSize: 10, fontWeight: 700, color: COLORS.textLight, fontFamily: 'Bricolage Grotesque', textTransform: 'uppercase', letterSpacing: 1 } }, label + ':'),
    ...options.map(opt => React.createElement('button', {
      key: opt, onClick: () => onChange(opt), style: chipStyle(value === opt),
    }, opt === 'all' ? 'Todos' : opt)),
  );
}

window.HoursView = HoursView;
