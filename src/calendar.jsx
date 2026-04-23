// ─── Full Calendar View ────────────────────────────────────────────────────────
// FILEMAKER: Layout "Formador_Calendario". Las celdas se dividen en dos mitades
//   (mañana / tarde) mediante un cálculo: hora_inicio < 14:00 = mañana,
//   hora_fin > 14:00 = tarde. Un curso que cruza las 14:00 ocupa ambas mitades.
function CalendarFullView() {
  const { courses, calendarEvents, addCalendarEvent, setComplianceModal } = React.useContext(AppContext);
  // FILEMAKER: el mes inicial es el actual (GetAsNumber(Month(Get(CurrentDate)))).
  const NOW = new Date();
  const [cm, setCm]             = React.useState(new Date(NOW.getFullYear(), NOW.getMonth(), 1));
  const [showAdd, setShowAdd]   = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const [nev, setNev]           = React.useState({ title: '', date: '', type: 'personal', notes: '' });

  const MN = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const DN = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  const MONTH_IDX = { Enero:0,Febrero:1,Marzo:2,Abril:3,Mayo:4,Junio:5,Julio:6,Agosto:7,Septiembre:8,Octubre:9,Noviembre:10,Diciembre:11 };

  const y = cm.getFullYear(), m = cm.getMonth();
  const fd  = (new Date(y, m, 1).getDay() + 6) % 7;
  const dim = new Date(y, m + 1, 0).getDate();

  // FILEMAKER: split hora → { morning: <14h, afternoon: >=14h }. El corte fijo
  //   a las 14:00 es convención del cliente (calendario sociosanitario español).
  const getDayHalf = (timeRange) => {
    if (!timeRange) return { morning: true, afternoon: false };
    const parts = String(timeRange).replace(/\s/g, '').split('-');
    const parse = (t) => {
      if (!t) return null;
      const [h, mm = '00'] = t.split(':');
      const hh = parseInt(h, 10);
      const mi = parseInt(mm, 10) || 0;
      return hh + mi / 60;
    };
    const start = parse(parts[0]);
    const end   = parse(parts[1]) ?? start;
    if (start == null) return { morning: true, afternoon: false };
    return {
      morning:   start < 14,
      afternoon: end   > 14,
    };
  };

  // Parsea `dates` del curso y devuelve la lista de días-del-mes que ocupa en el
  // mes mostrado. Soporta tres formatos:
  //   • "13-16 Abril 2026"     → rango
  //   • "13, 16, 23 Abril 2026" → lista
  //   • "1 Enero 2026"         → un solo día
  const parseCourseDays = (datesStr) => {
    if (!datesStr) return [];
    // Extrae mes y año del final
    const mRe = datesStr.match(/(Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre)\s+(\d{4})/i);
    if (!mRe) return [];
    const monthIdx = MONTH_IDX[mRe[1].charAt(0).toUpperCase() + mRe[1].slice(1).toLowerCase()];
    const year = parseInt(mRe[2], 10);
    if (monthIdx !== m || year !== y) return [];
    // Extrae la parte numérica previa al mes
    const nums = datesStr.slice(0, mRe.index).trim();
    const days = [];
    // Formato rango: "13-16"
    const range = nums.match(/^(\d{1,2})\s*-\s*(\d{1,2})$/);
    if (range) {
      const s = parseInt(range[1], 10), e = parseInt(range[2], 10);
      for (let d = s; d <= e; d++) days.push(d);
      return days;
    }
    // Formato lista: "13, 16, 23"
    nums.split(/[,;]/).forEach(n => {
      const v = parseInt(n.trim(), 10);
      if (!isNaN(v)) days.push(v);
    });
    return days;
  };

  // Estructura: dayEv[día] = { morning: [...], afternoon: [...] }
  const dayEv = {};
  const pushEvent = (d, ev, half) => {
    if (!dayEv[d]) dayEv[d] = { morning: [], afternoon: [] };
    if (half.morning)   dayEv[d].morning.push(ev);
    if (half.afternoon) dayEv[d].afternoon.push(ev);
  };

  const booked = courses.filter(c => ['accepted','review','completed'].includes(c.status));
  booked.forEach(c => {
    const days = parseCourseDays(c.dates);
    const half = getDayHalf(c.time);
    days.forEach(d => pushEvent(d, c, half));
  });

  calendarEvents.forEach(ev => {
    const d = new Date(ev.date);
    if (d.getMonth() === m && d.getFullYear() === y) {
      const dd = d.getDate();
      // Los eventos personales ocupan ambas mitades por defecto (no tienen hora).
      pushEvent(dd, { ...ev, isPersonal: true }, { morning: true, afternoon: true });
    }
  });

  const evColor = (ev) => {
    if (ev.isPersonal)            return COLORS.fuchsia;
    if (ev.status === 'accepted') return '#16a34a';
    if (ev.status === 'review')   return COLORS.yellow;
    return COLORS.lavender;
  };

  const cells = [];
  for (let i = 0; i < fd; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);

  const inp = { padding: '11px 15px', borderRadius: 14, border: '1px solid #e8eaf0', fontSize: 14, fontFamily: 'Lato', outline: 'none', width: '100%', boxSizing: 'border-box', color: COLORS.dark, transition: 'border-color 0.2s' };

  // Hoy: sólo marcar si el mes mostrado es el actual.
  const TODAY = (NOW.getMonth() === m && NOW.getFullYear() === y) ? NOW.getDate() : -1;

  const renderHalfCell = (evs, color) => React.createElement('div', {
    style: {
      flex: 1, padding: 2, minHeight: 20,
      background: evs.length > 0 ? `${color}08` : 'transparent',
      borderRadius: 4,
      display: 'flex', flexDirection: 'column', gap: 1,
    }
  },
    ...evs.slice(0, 2).map((ev, j) => React.createElement('div', {
      key: j,
      onClick: e => { e.stopPropagation(); if (ev.status === 'accepted') setComplianceModal(ev); },
      title: ev.title,
      style: { fontSize: 9, padding: '2px 5px', borderRadius: 4, background: `${evColor(ev)}1d`, color: evColor(ev), fontWeight: 700, fontFamily: 'Lato', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: ev.status === 'accepted' ? 'pointer' : 'default', lineHeight: 1.25 }
    }, ev.title)),
    evs.length > 2 && React.createElement('div', { style: { fontSize: 8, color: COLORS.textLight, fontFamily: 'Lato', paddingLeft: 3 } }, '+' + (evs.length - 2)),
  );

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
      React.createElement('button', { onClick: () => { setCm(new Date(NOW.getFullYear(), NOW.getMonth(), 1)); setSelected(null); }, style: { marginLeft: 6, padding: '6px 12px', borderRadius: 10, background: 'transparent', border: '1px solid #e4e7ef', cursor: 'pointer', fontSize: 11, color: COLORS.textLight, fontFamily: 'Lato', fontWeight: 700 } }, 'Hoy'),
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
            const evs = dayEv[day] || { morning: [], afternoon: [] };
            const total = evs.morning.length + evs.afternoon.length;
            const isSelected = selected === day;
            const isToday    = day === TODAY;
            return React.createElement('div', {
              key: i,
              onClick: () => { if (day) setSelected(isSelected ? null : day); },
              style: {
                minHeight: 96, padding: '6px 6px 4px', borderRadius: 14,
                background: isSelected ? `${COLORS.orange}08` : day ? '#fafbfc' : 'transparent',
                border: isSelected ? `1.5px solid ${COLORS.orange}40` : total > 0 ? `1px solid ${COLORS.orange}18` : '1px solid transparent',
                transition: 'all 0.15s', cursor: day ? 'pointer' : 'default',
                display: 'flex', flexDirection: 'column', gap: 3,
              }
            },
              day && React.createElement(React.Fragment, null,
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 } },
                  React.createElement('div', { style: { fontSize: 12, fontWeight: isToday ? 800 : 600, color: isToday ? '#fff' : COLORS.dark, fontFamily: 'Lato', width: 22, height: 22, borderRadius: 7, background: isToday ? COLORS.gradient : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isToday ? '0 2px 8px rgba(244,120,9,0.35)' : 'none' } }, day),
                ),
                // Mañana (arriba)
                renderHalfCell(evs.morning, COLORS.yellow),
                // Divisor fino
                React.createElement('div', { style: { height: 1, background: '#e4e7ef', opacity: 0.6 } }),
                // Tarde (abajo)
                renderHalfCell(evs.afternoon, COLORS.lavender),
              ),
            );
          }),
        ),
        // Leyenda de mitades
        React.createElement('div', { style: { marginTop: 10, display: 'flex', gap: 14, fontFamily: 'Lato', fontSize: 10, color: COLORS.textLight } },
          React.createElement('span', null, '☀ Mañana (inicio < 14:00)'),
          React.createElement('span', null, '🌙 Tarde (fin > 14:00)'),
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
        (() => {
          const ds = dayEv[selected] || { morning: [], afternoon: [] };
          const total = ds.morning.length + ds.afternoon.length;
          if (total === 0) return React.createElement('div', { style: { textAlign: 'center', padding: '24px 0', color: COLORS.textLight, fontFamily: 'Lato', fontSize: 13 } }, 'Sin eventos en este día');
          const renderBlock = (title, list) => list.length === 0 ? null : React.createElement('div', { style: { marginBottom: 14 } },
            React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 10, fontWeight: 700, color: COLORS.textLight, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 } }, title),
            ...list.map((ev, j) =>
              React.createElement('div', {
                key: title + j,
                style: { padding: '12px 14px', borderRadius: 16, background: `${evColor(ev)}0e`, border: `1px solid ${evColor(ev)}24`, marginBottom: 6 }
              },
                React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 700, color: COLORS.dark, marginBottom: 4 } }, ev.title),
                !ev.isPersonal && React.createElement('div', { style: { fontSize: 11, color: COLORS.textLight, fontFamily: 'Lato' } }, (ev.time || '') + ' · ' + (ev.location || '')),
                React.createElement('div', { style: { fontSize: 11, color: evColor(ev), fontFamily: 'Lato', fontWeight: 700, marginTop: 6 } }, ev.isPersonal ? 'Personal' : ev.status === 'accepted' ? 'Aceptado' : ev.status === 'review' ? 'En revisión' : 'Completado'),
                ev.status === 'accepted' && React.createElement('button', {
                  onClick: () => setComplianceModal(ev),
                  style: { marginTop: 8, padding: '5px 12px', borderRadius: 10, border: 'none', background: `${COLORS.cyan}14`, color: COLORS.cyan, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato' }
                }, 'Cerrar formación'),
              )
            ),
          );
          return React.createElement('div', null,
            renderBlock('☀ Mañana', ds.morning),
            renderBlock('🌙 Tarde', ds.afternoon),
          );
        })(),
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

// Helper exportado para detección de duplicidad horaria desde otros componentes
// (usado por el modal "Proponer fechas" del swipe).
// FILEMAKER: equivalente al script "Detectar_Duplicidad_Horario" —
//   ( fecha_A = fecha_B ) AND ( hora_inicio_A < hora_fin_B ) AND ( hora_fin_A > hora_inicio_B ).
function detectScheduleClash(dates, time, courses, calendarEvents) {
  if (!dates || !time) return [];
  const parseTime = (t) => {
    if (!t) return null;
    const [h, mm = '00'] = String(t).split(':');
    return parseInt(h, 10) + (parseInt(mm, 10) || 0) / 60;
  };
  const [startH, endH] = String(time).replace(/\s/g, '').split('-').map(parseTime);
  if (startH == null || endH == null) return [];

  const normDates = String(dates);
  const clashes = [];
  const MONTHS = { Enero:0,Febrero:1,Marzo:2,Abril:3,Mayo:4,Junio:5,Julio:6,Agosto:7,Septiembre:8,Octubre:9,Noviembre:10,Diciembre:11 };
  const expandDays = (datesStr) => {
    if (!datesStr) return [];
    const mRe = String(datesStr).match(/(Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre)\s+(\d{4})/i);
    if (!mRe) return [];
    const idx = MONTHS[mRe[1].charAt(0).toUpperCase() + mRe[1].slice(1).toLowerCase()];
    const y = parseInt(mRe[2], 10);
    const raw = datesStr.slice(0, mRe.index).trim();
    const days = [];
    const range = raw.match(/^(\d{1,2})\s*-\s*(\d{1,2})$/);
    if (range) {
      const s = parseInt(range[1], 10), e = parseInt(range[2], 10);
      for (let d = s; d <= e; d++) days.push(`${y}-${String(idx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    } else {
      raw.split(/[,;]/).forEach(n => {
        const v = parseInt(n.trim(), 10);
        if (!isNaN(v)) days.push(`${y}-${String(idx + 1).padStart(2, '0')}-${String(v).padStart(2, '0')}`);
      });
    }
    return days;
  };

  const myDays = expandDays(normDates);
  (courses || []).forEach(c => {
    if (!['accepted', 'review'].includes(c.status)) return;
    const theirDays = expandDays(c.dates);
    const overlap = myDays.some(d => theirDays.includes(d));
    if (!overlap) return;
    const [s2, e2] = String(c.time || '').replace(/\s/g, '').split('-').map(parseTime);
    if (s2 == null || e2 == null) return;
    if (startH < e2 && endH > s2) clashes.push(c.title);
  });
  return clashes;
}

window.CalendarFullView     = CalendarFullView;
window.detectScheduleClash  = detectScheduleClash;
