// ─── Full Calendar View ────────────────────────────────────────────────────────
function CalendarFullView() {
  const { courses, calendarEvents, addCalendarEvent, setComplianceModal } = React.useContext(AppContext);
  const [cm, setCm]           = React.useState(new Date(2026, 4, 1));
  const [showAdd, setShowAdd] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const [nev, setNev] = React.useState({ title: '', date: '', type: 'personal', notes: '' });

  const MN = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const DN = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

  const y = cm.getFullYear(), m = cm.getMonth();
  const fd  = (new Date(y, m, 1).getDay() + 6) % 7;
  const dim = new Date(y, m + 1, 0).getDate();

  const booked = courses.filter(c => ['accepted','review','completed'].includes(c.status));
  const dayEv  = {};

  booked.forEach(c => {
    const match = c.dates.match(/(\d{1,2})(?:-(\d{1,2}))?\s+(\w+)\s+(\d{4})/);
    if (!match) return;
    const months = {Enero:0,Febrero:1,Marzo:2,Abril:3,Mayo:4,Junio:5,Julio:6,Agosto:7,Septiembre:8,Octubre:9,Noviembre:10,Diciembre:11};
    if (months[match[3]] !== m) return;
    const s = parseInt(match[1]), e = match[2] ? parseInt(match[2]) : s;
    for (let d = s; d <= e; d++) {
      if (!dayEv[d]) dayEv[d] = [];
      dayEv[d].push(c);
    }
  });
  calendarEvents.forEach(ev => {
    const d = new Date(ev.date);
    if (d.getMonth() === m && d.getFullYear() === y) {
      const dd = d.getDate();
      if (!dayEv[dd]) dayEv[dd] = [];
      dayEv[dd].push({ ...ev, isPersonal: true });
    }
  });

  const evColor = (ev) => {
    if (ev.isPersonal)           return COLORS.fuchsia;
    if (ev.status === 'accepted') return '#16a34a';
    if (ev.status === 'review')   return COLORS.yellow;
    return COLORS.lavender;
  };

  const cells = [];
  for (let i = 0; i < fd; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);

  const inp = { padding: '11px 15px', borderRadius: 14, border: '1px solid #e8eaf0', fontSize: 14, fontFamily: 'Lato', outline: 'none', width: '100%', boxSizing: 'border-box', color: COLORS.dark, transition: 'border-color 0.2s' };

  const TODAY = 21;

  return React.createElement('div', null,
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 } },
      React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 28, fontWeight: 800, color: COLORS.dark, margin: 0 } }, 'Calendario'),
      React.createElement('button', {
        onClick: () => setShowAdd(true),
        style: { padding: '11px 24px', borderRadius: 18, border: 'none', background: COLORS.gradient, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Bricolage Grotesque', boxShadow: '0 4px 18px rgba(244,120,9,0.28)', display: 'flex', alignItems: 'center', gap: 7 }
      }, '+ Añadir evento'),
    ),

    // Month navigation
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(14px)', borderRadius: 20, padding: '12px 22px', border: '1px solid rgba(255,255,255,0.7)', width: 'fit-content' } },
      React.createElement('button', { onClick: () => { setCm(new Date(y, m-1, 1)); setSelected(null); }, style: { width: 32, height: 32, borderRadius: 10, background: '#f0f1f5', border: 'none', cursor: 'pointer', fontSize: 16, color: COLORS.textLight, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, '‹'),
      React.createElement('span', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 17, fontWeight: 800, color: COLORS.dark, minWidth: 180, textAlign: 'center' } }, MN[m] + ' ' + y),
      React.createElement('button', { onClick: () => { setCm(new Date(y, m+1, 1)); setSelected(null); }, style: { width: 32, height: 32, borderRadius: 10, background: '#f0f1f5', border: 'none', cursor: 'pointer', fontSize: 16, color: COLORS.textLight, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, '›'),
    ),

    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: selected ? '1fr 300px' : '1fr', gap: 20 } },
      // Calendar grid
      React.createElement('div', {
        style: { background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(14px)', borderRadius: 28, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.04)', border: '1px solid rgba(255,255,255,0.72)' }
      },
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 } },
          ...DN.map(d => React.createElement('div', { key: d, style: { textAlign: 'center', fontSize: 11, fontWeight: 700, color: COLORS.textLight, padding: '6px 0', fontFamily: 'Bricolage Grotesque', textTransform: 'uppercase', letterSpacing: 0.5 } }, d)),
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 } },
          ...cells.map((day, i) => {
            const evs    = dayEv[day] || [];
            const isSelected = selected === day;
            const isToday    = day === TODAY;
            return React.createElement('div', {
              key: i,
              onClick: () => { if (day) setSelected(isSelected ? null : day); },
              style: {
                minHeight: 86, padding: '8px 7px', borderRadius: 14,
                background: isSelected ? `${COLORS.orange}08` : day ? '#fafbfc' : 'transparent',
                border: isSelected ? `1.5px solid ${COLORS.orange}40` : evs.length > 0 ? `1px solid ${COLORS.orange}18` : '1px solid transparent',
                transition: 'all 0.15s', cursor: day ? 'pointer' : 'default',
              }
            },
              day && React.createElement(React.Fragment, null,
                React.createElement('div', { style: { fontSize: 12, fontWeight: isToday ? 800 : 600, color: isToday ? '#fff' : COLORS.dark, marginBottom: 4, fontFamily: 'Lato', width: 22, height: 22, borderRadius: 7, background: isToday ? COLORS.gradient : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isToday ? '0 2px 8px rgba(244,120,9,0.35)' : 'none' } }, day),
                evs.slice(0, 2).map((ev, j) =>
                  React.createElement('div', {
                    key: j,
                    onClick: e => { e.stopPropagation(); if (ev.status === 'accepted') setComplianceModal(ev); },
                    style: { fontSize: 10, padding: '3px 6px', borderRadius: 7, marginBottom: 2, background: `${evColor(ev)}18`, color: evColor(ev), fontWeight: 700, fontFamily: 'Lato', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: ev.status === 'accepted' ? 'pointer' : 'default' }
                  }, ev.title),
                ),
                evs.length > 2 && React.createElement('div', { style: { fontSize: 9, color: COLORS.textLight, fontFamily: 'Lato', paddingLeft: 2 } }, '+' + (evs.length - 2) + ' más'),
              ),
            );
          }),
        ),
      ),

      // Selected day detail panel
      selected && React.createElement('div', {
        style: { background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(14px)', borderRadius: 24, padding: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.04)', border: '1px solid rgba(255,255,255,0.72)', alignSelf: 'start' }
      },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } },
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 15, fontWeight: 800, color: COLORS.dark } }, MN[m] + ' ' + selected),
          React.createElement('button', { onClick: () => setSelected(null), style: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: COLORS.textLight, lineHeight: 1 } }, '✕'),
        ),
        (dayEv[selected] || []).length === 0
          ? React.createElement('div', { style: { textAlign: 'center', padding: '24px 0', color: COLORS.textLight, fontFamily: 'Lato', fontSize: 13 } }, 'Sin eventos en este día')
          : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
              ...(dayEv[selected] || []).map((ev, j) =>
                React.createElement('div', {
                  key: j,
                  style: { padding: '12px 14px', borderRadius: 16, background: `${evColor(ev)}0e`, border: `1px solid ${evColor(ev)}24` }
                },
                  React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 700, color: COLORS.dark, marginBottom: 4 } }, ev.title),
                  !ev.isPersonal && React.createElement('div', { style: { fontSize: 11, color: COLORS.textLight, fontFamily: 'Lato' } }, ev.time + ' · ' + ev.location),
                  React.createElement('div', { style: { fontSize: 11, color: evColor(ev), fontFamily: 'Lato', fontWeight: 700, marginTop: 6 } }, ev.isPersonal ? 'Personal' : ev.status === 'accepted' ? 'Aceptado' : ev.status === 'review' ? 'En revisión' : 'Completado'),
                  ev.status === 'accepted' && React.createElement('button', {
                    onClick: () => setComplianceModal(ev),
                    style: { marginTop: 8, padding: '5px 12px', borderRadius: 10, border: 'none', background: `${COLORS.cyan}14`, color: COLORS.cyan, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato' }
                  }, 'Cerrar formación'),
                )
              ),
            ),
      ),
    ),

    // Legend
    React.createElement('div', { style: { display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' } },
      ...[['Aceptado','#16a34a'],['En revisión',COLORS.yellow],['Completado',COLORS.lavender],['Personal',COLORS.fuchsia]].map(([l,c]) =>
        React.createElement('div', { key: l, style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: COLORS.textLight, fontFamily: 'Lato' } },
          React.createElement('div', { style: { width: 10, height: 10, borderRadius: 4, background: c } }), l,
        ),
      ),
    ),

    // Add event modal
    showAdd && React.createElement('div', {
      style: { position: 'fixed', inset: 0, background: 'rgba(26,26,46,0.28)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
      onClick: e => { if (e.target === e.currentTarget) setShowAdd(false); }
    },
      React.createElement('div', { style: { background: '#fff', borderRadius: 30, padding: 36, width: 440, boxShadow: '0 28px 90px rgba(0,0,0,0.14)', position: 'relative', overflow: 'hidden' } },
        React.createElement('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: COLORS.gradient } }),
        React.createElement('h2', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 20, fontWeight: 800, color: COLORS.dark, margin: '0 0 22px' } }, 'Nuevo evento personal'),
        React.createElement('form', {
          onSubmit: e => {
            e.preventDefault();
            if (nev.title && nev.date) {
              addCalendarEvent(nev);
              setNev({ title: '', date: '', type: 'personal', notes: '' });
              setShowAdd(false);
            }
          },
          style: { display: 'flex', flexDirection: 'column', gap: 14 }
        },
          React.createElement('input', { style: inp, placeholder: 'Título del evento', value: nev.title, required: true, onChange: e => setNev(p => ({ ...p, title: e.target.value })) }),
          React.createElement('input', { type: 'date', style: inp, value: nev.date, required: true, onChange: e => setNev(p => ({ ...p, date: e.target.value })) }),
          React.createElement('select', {
            style: { ...inp, appearance: 'none', cursor: 'pointer' },
            value: nev.type, onChange: e => setNev(p => ({ ...p, type: e.target.value }))
          },
            React.createElement('option', { value: 'personal' },   'Personal'),
            React.createElement('option', { value: 'formacion' },  'Formación externa'),
            React.createElement('option', { value: 'tarea' },      'Tarea pendiente'),
          ),
          React.createElement('textarea', { style: { ...inp, minHeight: 70, resize: 'vertical' }, placeholder: 'Notas opcionales…', value: nev.notes, onChange: e => setNev(p => ({ ...p, notes: e.target.value })) }),
          React.createElement('div', { style: { display: 'flex', gap: 10, marginTop: 4 } },
            React.createElement('button', { type: 'submit', style: { flex: 1, padding: '13px', borderRadius: 16, border: 'none', background: COLORS.gradient, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Bricolage Grotesque', boxShadow: '0 4px 16px rgba(244,120,9,0.25)' } }, 'Añadir evento'),
            React.createElement('button', { type: 'button', onClick: () => setShowAdd(false), style: { padding: '13px 22px', borderRadius: 16, border: '1px solid #e8eaf0', background: '#fff', color: COLORS.textLight, fontSize: 14, cursor: 'pointer', fontFamily: 'Lato' } }, 'Cancelar'),
          ),
        ),
      ),
    ),

    React.createElement(ComplianceModal),
  );
}

window.CalendarFullView = CalendarFullView;
