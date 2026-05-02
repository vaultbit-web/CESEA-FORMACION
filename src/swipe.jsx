// ─── Swipe Cards ──────────────────────────────────────────────────────────────
const { motion, AnimatePresence, useMotionValue, useTransform } = window.Motion || {};

// ─── Helper: validación de secuencia de fechas ───────────────────────────────
// FILEMAKER: equivale al script "Validar_Fechas_Propuesta" — script trigger
//   OnObjectSave en Solicitudes::fecha_fin y Solicitudes::sesiones_json.
//   Devuelve { ok, error } y bloquea el Commit Record si ok=false.
function validateScheduleSequence(startDate, endDate, sessions) {
  if (!startDate)            return { ok: false, error: 'Indica una fecha de inicio.' };
  if (!endDate)              return { ok: false, error: 'Indica una fecha de fin.' };
  if (endDate < startDate)   return { ok: false, error: 'La fecha de fin no puede ser anterior a la de inicio.' };
  for (let i = 0; i < (sessions || []).length; i++) {
    const s = sessions[i];
    if (s.day && s.day < startDate) return { ok: false, error: `La sesión ${i + 1} es anterior a la fecha de inicio.` };
    if (s.day && s.day > endDate)   return { ok: false, error: `La sesión ${i + 1} es posterior a la fecha de fin.` };
    if (i > 0 && s.day && sessions[i - 1].day && s.day < sessions[i - 1].day) {
      return { ok: false, error: `La sesión ${i + 1} no puede ser anterior a la sesión ${i}.` };
    }
  }
  return { ok: true, error: '' };
}
window.validateScheduleSequence = validateScheduleSequence;

// ─── Modal: Proponer fechas al solicitar plaza ───────────────────────────────
// FILEMAKER: Layout modal "Propuesta_Plaza_Formador". Genera un registro en
//   Solicitudes con type="new" y el JSON de fechas propuestas. El nº de días
//   (numImparticiones) lo fija el superadmin en Cursos::num_imparticiones —
//   el formador NO puede cambiarlo desde aquí, solo elige fechas/horas.
function ProposeDatesModal({ course, open, onClose, onSubmit }) {
  const { courses, calendarEvents } = React.useContext(AppContext);
  const initStart = course?.startDate || '';
  const initEnd   = course?.endDate   || course?.startDate || '';
  // El superadmin ha definido cuántas sesiones tiene este curso.
  const numImparticiones = Math.max(1, parseInt(course?.numImparticiones, 10) || 1);
  const [startDate, setStartDate] = React.useState(initStart);
  const [endDate,   setEndDate]   = React.useState(initEnd);
  const [sessions,  setSessions]  = React.useState(
    Array.from({ length: numImparticiones }, () => ({ day: initStart, from: '09:00', to: '14:00' }))
  );
  const [note,      setNote]      = React.useState('');
  const [validationError, setValidationError] = React.useState('');

  React.useEffect(() => {
    if (!open) return;
    setStartDate(initStart);
    setEndDate(initEnd);
    setSessions(Array.from({ length: numImparticiones }, () => ({ day: initStart, from: '09:00', to: '14:00' })));
    setNote('');
    setValidationError('');
  }, [open, course]);

  // Auto-sugerencia: si la fecha fin es anterior a la inicio, igualarla a la de inicio.
  React.useEffect(() => {
    if (startDate && (!endDate || endDate < startDate)) setEndDate(startDate);
  }, [startDate]);

  const isPresencial = course && course.modality !== 'Online';

  // Construye string "D1, D2, D3 Mes Año" a partir de las sesiones
  const buildDatesString = () => {
    const MN = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const days = sessions.map(s => s.day).filter(Boolean);
    if (days.length === 0) return '';
    const parsed = days.map(d => new Date(d));
    const monthIdx = parsed[0].getMonth();
    const year = parsed[0].getFullYear();
    const dayNums = parsed.map(d => d.getDate()).join(', ');
    return `${dayNums} ${MN[monthIdx]} ${year}`;
  };

  // Construye string horario representativo para detección de solape
  const representativeTime = sessions[0] ? `${sessions[0].from}-${sessions[0].to}` : '';

  const clashes = typeof window.detectScheduleClash === 'function'
    ? window.detectScheduleClash(buildDatesString(), representativeTime, (courses || []).filter(c => c.id !== course?.id), calendarEvents)
    : [];

  if (!open || !course) return null;

  const inp = { padding: '10px 12px', borderRadius: 8, border: '1px solid #e4e7ef', fontSize: 13, fontFamily: 'Lato', outline: 'none', width: '100%', boxSizing: 'border-box', color: COLORS.dark, background: '#fff' };

  return React.createElement('div', {
    style: { position: 'fixed', inset: 0, background: 'rgba(15,16,32,0.44)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: 20 },
    onClick: e => { if (e.target === e.currentTarget) onClose(); },
  },
    React.createElement('div', {
      style: { background: '#fff', borderRadius: 18, width: '100%', maxWidth: 560, padding: 28, boxShadow: '0 30px 80px rgba(15,16,32,0.24)', maxHeight: '90vh', overflowY: 'auto' },
    },
      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.orange, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 } }, 'Solicitar plaza'),
      React.createElement('h2', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 18, fontWeight: 800, color: COLORS.dark, margin: '0 0 4px', lineHeight: 1.3 } }, course.title),
      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, marginBottom: 16 } }, 'El cliente propone: ', React.createElement('b', { style: { color: COLORS.text } }, course.dates), ' · ', course.time, '. Confirma o propón tus fechas.'),

      clashes.length > 0 && React.createElement('div', {
        style: { marginBottom: 14, padding: '10px 12px', borderRadius: 10, background: `${COLORS.yellow}18`, border: `1px solid ${COLORS.yellow}40`, fontFamily: 'Lato', fontSize: 12, color: '#a16207' },
      },
        React.createElement('b', null, '⚠ Duplicidad horaria: '),
        'Tus fechas/horas solapan con ', clashes.map(t => `"${t.slice(0, 40)}${t.length > 40 ? '…' : ''}"`).join(' · '),
      ),

      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 } },
        React.createElement('div', null,
          React.createElement('label', { style: { fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, display: 'block', marginBottom: 4 } }, 'Fecha inicio'),
          React.createElement('input', { type: 'date', style: inp, value: startDate, onChange: e => setStartDate(e.target.value) }),
        ),
        React.createElement('div', null,
          React.createElement('label', { style: { fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, display: 'block', marginBottom: 4 } }, 'Fecha fin'),
          // FILEMAKER: el atributo min impone fecha_fin >= fecha_inicio a nivel UI;
          //   en FM se replica con un script trigger OnObjectValidate.
          React.createElement('input', { type: 'date', style: inp, min: startDate || undefined, value: endDate, onChange: e => setEndDate(e.target.value) }),
        ),
      ),

      // FILEMAKER: el nº de imparticiones lo fija el superadmin en
      //   Cursos::num_imparticiones; aquí se muestra como info read-only.
      isPresencial && React.createElement('div', {
        style: { marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: `${COLORS.cyan}10`, border: `1px solid ${COLORS.cyan}30`, fontFamily: 'Lato', fontSize: 12, color: COLORS.text },
      },
        React.createElement('b', { style: { color: COLORS.cyan } }, 'Sesiones predefinidas: ', String(numImparticiones), numImparticiones === 1 ? ' día' : ' días'),
        React.createElement('span', { style: { color: COLORS.textLight, marginLeft: 6 } }, '· definido por el superadministrador'),
      ),

      isPresencial && React.createElement('div', { style: { marginBottom: 14 } },
        React.createElement('label', { style: { fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, display: 'block', marginBottom: 6 } }, 'Horarios por día'),
        ...sessions.map((s, idx) => {
          // Cada sesión >0 no puede ser anterior a la previa.
          const minForThis = idx === 0 ? (startDate || undefined) : (sessions[idx - 1].day || startDate || undefined);
          return React.createElement('div', {
            key: idx,
            style: { display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 8, marginBottom: 6 }
          },
            React.createElement('input', {
              type: 'date', style: inp,
              min: minForThis, max: endDate || undefined,
              value: s.day,
              onChange: e => setSessions(prev => prev.map((ss, i) => i === idx ? { ...ss, day: e.target.value } : ss)),
            }),
            React.createElement('input', { type: 'time', style: inp, value: s.from, onChange: e => setSessions(prev => prev.map((ss, i) => i === idx ? { ...ss, from: e.target.value } : ss)) }),
            React.createElement('input', { type: 'time', style: inp, value: s.to,   onChange: e => setSessions(prev => prev.map((ss, i) => i === idx ? { ...ss, to: e.target.value } : ss)) }),
          );
        }),
      ),

      validationError && React.createElement('div', {
        style: { marginBottom: 12, padding: '10px 12px', borderRadius: 10, background: `${COLORS.red}12`, border: `1px solid ${COLORS.red}40`, fontFamily: 'Lato', fontSize: 12, color: COLORS.red, fontWeight: 700 },
      }, '⚠ ', validationError),

      React.createElement('div', { style: { marginBottom: 16 } },
        React.createElement('label', { style: { fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, display: 'block', marginBottom: 4 } }, 'Mensaje al superadmin (opcional)'),
        React.createElement('textarea', { style: { ...inp, minHeight: 72, resize: 'vertical' }, placeholder: 'Observaciones, condiciones, etc.', value: note, onChange: e => setNote(e.target.value) }),
      ),

      React.createElement('div', { style: { display: 'flex', gap: 10, justifyContent: 'flex-end' } },
        React.createElement('button', {
          onClick: onClose,
          style: { padding: '10px 18px', borderRadius: 9, border: '1px solid #e4e7ef', background: '#fff', color: COLORS.text, fontFamily: 'Lato', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
        }, 'Cancelar'),
        React.createElement('button', {
          onClick: () => {
            const v = validateScheduleSequence(startDate, endDate, sessions);
            if (!v.ok) { setValidationError(v.error); return; }
            setValidationError('');
            onSubmit({ dates: buildDatesString(), schedule: sessions, note });
          },
          style: { padding: '10px 20px', borderRadius: 9, border: 'none', background: COLORS.gradient, color: '#fff', fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 800, cursor: 'pointer', letterSpacing: 0.3 },
        }, 'Enviar propuesta →'),
      ),
    ),
  );
}

const TAG_COLORS = [COLORS.cyan, COLORS.fuchsia, COLORS.orange, COLORS.pink, COLORS.lavender, COLORS.yellow];
const MOD_COLORS = { Presencial: COLORS.orange, Online: COLORS.cyan, Híbrido: COLORS.fuchsia };

// Color estable por área formativa (coherente en toda la plataforma)
const AREA_COLORS = {
  'Área técnica':             COLORS.orange,
  'Competencias':             COLORS.cyan,
  'ACP y Modelo de Atención': COLORS.fuchsia,
  'Área de autocuidados':     COLORS.lavender,
};

// ─── Individual Swipe Card ────────────────────────────────────────────────────
function SwipeCard({ course, onSwipeRight, onSwipeLeft, zIdx }) {
  const x            = useMotionValue(0);
  const rotate       = useTransform(x, [-220, 220], [-12, 12]);
  const opacity      = useTransform(x, [-200, -90, 0, 90, 200], [0.3, 1, 1, 1, 0.3]);
  const rightOverlay = useTransform(x, [0, 140], [0, 0.4]);
  const leftOverlay  = useTransform(x, [-140, 0], [0.35, 0]);
  const [rVal, setRVal] = React.useState(0);
  const [lVal, setLVal] = React.useState(0);

  React.useEffect(() => {
    const u1 = rightOverlay.on('change', setRVal);
    const u2 = leftOverlay.on('change', setLVal);
    return () => { u1(); u2(); };
  }, []);

  const modColor  = MOD_COLORS[course.modality] || COLORS.cyan;
  const areaColor = AREA_COLORS[course.area]    || COLORS.orange;

  return React.createElement(motion.div, {
    style: { x, rotate, opacity, position: 'absolute', width: '100%', zIndex: zIdx, cursor: 'grab', touchAction: 'none' },
    drag: 'x',
    dragConstraints: { left: 0, right: 0 },
    dragElastic: 0.6,
    whileDrag: { cursor: 'grabbing', scale: 1.015 },
    onDragEnd: (_, info) => {
      if (info.offset.x > 110)  onSwipeRight(course.id);
      else if (info.offset.x < -110) onSwipeLeft(course.id);
    },
    initial: { scale: 0.94, opacity: 0, y: 8 },
    animate: { scale: 1, opacity: 1, y: 0 },
    exit:    { opacity: 0, scale: 0.9, y: -8, transition: { duration: 0.22 } },
  },
    React.createElement('div', {
      style: {
        background: '#ffffff',
        borderRadius: 18, padding: '24px 24px 22px',
        boxShadow: '0 12px 40px rgba(18,20,35,0.08), 0 2px 6px rgba(18,20,35,0.04)',
        border: '1px solid #eceef4', position: 'relative', overflow: 'hidden',
      }
    },
      // Accept / reject overlays
      React.createElement(motion.div, { style: { position: 'absolute', inset: 0, background: '#16a34a', opacity: rightOverlay, borderRadius: 18, pointerEvents: 'none', zIndex: 2 } }),
      React.createElement(motion.div, { style: { position: 'absolute', inset: 0, background: COLORS.red,  opacity: leftOverlay,  borderRadius: 18, pointerEvents: 'none', zIndex: 2 } }),

      // Directional labels
      React.createElement('div', {
        style: { position: 'absolute', top: 22, right: 22, opacity: Math.min(rVal * 3.2, 1), color: '#fff', fontWeight: 800, fontSize: 15, fontFamily: 'Bricolage Grotesque', transform: 'rotate(10deg)', letterSpacing: 1.2, zIndex: 3, textShadow: '0 2px 6px rgba(0,0,0,0.18)', pointerEvents: 'none' }
      }, '✓ ACEPTAR'),
      React.createElement('div', {
        style: { position: 'absolute', top: 22, left: 22, opacity: Math.min(lVal * 3.2, 1), color: '#fff', fontWeight: 800, fontSize: 15, fontFamily: 'Bricolage Grotesque', transform: 'rotate(-10deg)', letterSpacing: 1.2, zIndex: 3, textShadow: '0 2px 6px rgba(0,0,0,0.18)', pointerEvents: 'none' }
      }, '✕ RECHAZAR'),

      // Top accent strip by area
      React.createElement('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${areaColor}, ${modColor})`, zIndex: 1 } }),

      // Content
      React.createElement('div', { style: { position: 'relative', zIndex: 1 } },

        // Area breadcrumb + código interno (chip read-only)
        // FILEMAKER: Cursos::codigo_interno mostrado como info, no editable.
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.8, flexWrap: 'wrap' } },
          course.codigoInterno && React.createElement('span', {
            style: { fontFamily: 'Lato', fontSize: 10, fontWeight: 800, color: areaColor, background: `${areaColor}15`, padding: '3px 8px', borderRadius: 5, letterSpacing: 0.6 },
          }, course.codigoInterno),
          React.createElement('span', { style: { color: areaColor } }, course.area),
          React.createElement('span', { style: { opacity: 0.4 } }, '›'),
          React.createElement('span', null, course.category),
        ),

        // Title
        React.createElement('h2', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 19, fontWeight: 800, color: COLORS.dark, margin: '0 0 10px', lineHeight: 1.28, letterSpacing: -0.1 } }, course.title),

        // Subtitle
        course.subtitle && React.createElement('p', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight, lineHeight: 1.5, margin: '0 0 16px' } }, course.subtitle),

        // Info rows
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, padding: '12px 14px', background: '#fafbfc', borderRadius: 10, border: '1px solid #f0f1f5' } },
          ...([
            { label: 'Inicio',    value: course.dates    },
            { label: 'Horario',   value: course.time     },
            { label: 'Modalidad', value: course.modality + ' · ' + course.location },
            { label: 'Duración',  value: course.hours + ' horas' },
          ]).map(row =>
            React.createElement('div', { key: row.label, style: { display: 'flex', fontFamily: 'Lato', fontSize: 12.5, alignItems: 'baseline' } },
              React.createElement('span', { style: { fontWeight: 700, color: COLORS.textLight, width: 82, flexShrink: 0, textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.6 } }, row.label),
              React.createElement('span', { style: { color: COLORS.text, fontWeight: 500 } }, row.value),
            )
          ),
        ),

        // Action buttons
        React.createElement('div', { style: { display: 'flex', gap: 10 } },
          React.createElement('button', {
            onClick: e => { e.stopPropagation(); onSwipeLeft(course.id); },
            style: {
              flex: 1, padding: '12px 0', borderRadius: 10, border: '1px solid #e4e7ef',
              background: '#fff', color: COLORS.text, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Lato', transition: 'all 0.18s',
            }
          }, 'Rechazar'),
          React.createElement('button', {
            onClick: e => { e.stopPropagation(); onSwipeRight(course.id); },
            style: {
              flex: 2, padding: '12px 0', borderRadius: 10, border: 'none',
              background: COLORS.gradient,
              color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Bricolage Grotesque',
              boxShadow: '0 4px 16px rgba(244,120,9,0.26)', transition: 'all 0.18s',
              letterSpacing: 0.2,
            }
          }, 'Solicitar plaza'),
        ),
      ),
    ),
  );
}

// ─── Swipe Stack ──────────────────────────────────────────────────────────────
function SwipeStack() {
  const { courses, swipeRight, swipeLeft } = React.useContext(AppContext);
  const [areaFilter, setAreaFilter] = React.useState('all');
  const [toast, setToast] = React.useState(null);
  // FILEMAKER: el modal de propuesta se abre al hacer "Solicitar plaza" en el botón
  //   o al deslizar la card a la derecha. Un gesto rápido no debe confirmar sin
  //   validar fechas/horas del formador.
  const [proposeCourse, setProposeCourse] = React.useState(null);

  const availableAll = courses.filter(c => c.status === 'available');
  const availableAreas = ['all', ...Array.from(new Set(availableAll.map(c => c.area)))];
  const available = areaFilter === 'all' ? availableAll : availableAll.filter(c => c.area === areaFilter);

  const handleRight = (id) => {
    const c = courses.find(c => c.id === id);
    if (c) setProposeCourse(c);
  };
  const handleLeft = (id) => {
    swipeLeft(id);
    setToast({ title: 'Oferta descartada', type: 'left' });
    setTimeout(() => setToast(null), 2200);
  };

  const submitPropose = (proposal) => {
    if (!proposeCourse) return;
    swipeRight(proposeCourse.id, proposal);
    setToast({ title: proposeCourse.title, type: 'right' });
    setProposeCourse(null);
    setTimeout(() => setToast(null), 3200);
  };

  return React.createElement('div', null,
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 } },
      React.createElement('h2', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 20, fontWeight: 800, color: COLORS.dark, margin: 0 } }, 'Ofertas disponibles'),
      available.length > 0 && React.createElement('span', {
        style: { padding: '4px 12px', borderRadius: 8, background: `${COLORS.orange}10`, color: COLORS.orange, fontSize: 11, fontWeight: 700, fontFamily: 'Lato', textTransform: 'uppercase', letterSpacing: 0.8 }
      }, available.length + ' pendientes'),
    ),
    React.createElement('p', { style: { color: COLORS.textLight, fontSize: 13, fontFamily: 'Lato', margin: '4px 0 14px' } },
      'Desliza la tarjeta o usa los botones para aceptar o rechazar cada propuesta.'
    ),

    // Area chips filter
    React.createElement('div', { style: { display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' } },
      ...availableAreas.map(a => React.createElement('button', {
        key: a, onClick: () => setAreaFilter(a),
        style: {
          padding: '6px 12px', borderRadius: 8, border: '1px solid ' + (areaFilter === a ? COLORS.orange : '#e4e7ef'),
          background: areaFilter === a ? `${COLORS.orange}0d` : '#fff',
          color: areaFilter === a ? COLORS.orange : COLORS.text,
          fontSize: 12, fontWeight: areaFilter === a ? 700 : 600, cursor: 'pointer', fontFamily: 'Lato', transition: 'all 0.15s',
        }
      }, a === 'all' ? 'Todos los grupos' : a)),
    ),

    React.createElement('div', { style: { position: 'relative', height: 460, maxWidth: 480 } },
      AnimatePresence
        ? React.createElement(AnimatePresence, null,
            available.length === 0
              ? React.createElement(motion.div, {
                  key: 'empty',
                  initial: { opacity: 0, scale: 0.94 },
                  animate: { opacity: 1, scale: 1 },
                  style: { textAlign: 'center', paddingTop: 120, position: 'absolute', width: '100%' }
                },
                  React.createElement('div', { style: { width: 54, height: 54, borderRadius: 12, background: `${COLORS.cyan}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 22, color: COLORS.cyan, fontWeight: 800 } }, '✓'),
                  React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: 16, color: COLORS.dark } }, 'Todo al día'),
                  React.createElement('div', { style: { marginTop: 6, fontSize: 13, fontFamily: 'Lato', color: COLORS.textLight } }, 'No quedan ofertas pendientes en este grupo de acciones.'),
                )
              : available.slice(0, 3).reverse().map((c, i, arr) =>
                  React.createElement(SwipeCard, {
                    key: c.id, course: c, zIdx: arr.length - i,
                    onSwipeRight: handleRight, onSwipeLeft: handleLeft,
                  })
                ),
          )
        : (available.length === 0
            ? React.createElement('div', { style: { textAlign: 'center', paddingTop: 110 } }, 'No quedan ofertas')
            : React.createElement(SwipeCard, { course: available[0], zIdx: 1, onSwipeRight: handleRight, onSwipeLeft: handleLeft })
          ),
    ),

    // Toast
    AnimatePresence && React.createElement(AnimatePresence, null,
      toast && React.createElement(motion.div, {
        key: 'toast',
        initial: { opacity: 0, y: 22, x: '-50%' },
        animate: { opacity: 1, y: 0,  x: '-50%' },
        exit:    { opacity: 0, y: -10, x: '-50%' },
        style: {
          position: 'fixed', bottom: 28, left: '50%',
          background: '#fff',
          borderRadius: 12, padding: '12px 20px',
          boxShadow: '0 14px 44px rgba(18,20,35,0.14), 0 2px 8px rgba(18,20,35,0.04)',
          border: '1px solid #eceef4',
          borderLeft: `3px solid ${toast.type === 'right' ? '#16a34a' : COLORS.red}`,
          display: 'flex', alignItems: 'center', gap: 12, zIndex: 500,
        }
      },
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13 } },
          toast.type === 'right'
            ? React.createElement(React.Fragment, null,
                React.createElement('span', { style: { fontWeight: 700, color: COLORS.dark } }, toast.title),
                React.createElement('span', { style: { color: COLORS.textLight } }, ' — en revisión por administración'),
              )
            : React.createElement('span', { style: { color: COLORS.textLight } }, toast.title),
        ),
      ),
    ),

    // Modal de propuesta de fechas
    React.createElement(ProposeDatesModal, {
      course: proposeCourse,
      open:   !!proposeCourse,
      onClose: () => setProposeCourse(null),
      onSubmit: submitPropose,
    }),
  );
}

// ─── Offers Full View (Cursos tab) ────────────────────────────────────────────
// Organización por Área → Subcategoría, idéntica a csaformacion.com/formacion.
// Filtros por estado, área formativa, subcategoría y búsqueda de texto.
function OfertasView() {
  const { courses, submitChange, setComplianceModal, setCurrentView } = React.useContext(AppContext);
  const [status, setStatus]     = React.useState('all');
  const [area, setArea]         = React.useState('all');
  const [sub, setSub]           = React.useState('all');
  const [query, setQuery]       = React.useState('');
  const [editId, setEditId]     = React.useState(null);
  const [form, setForm]         = React.useState({ dates: '', topic: '', notes: '' });
  const [viewMode, setViewMode] = React.useState('grouped');  // 'grouped' | 'list'
  const [showAddProposal, setShowAddProposal] = React.useState(false);
  const Mc                      = motion ? motion.div : 'div';

  const STATUS_CONF = {
    available: { label: 'Disponible',  color: COLORS.orange,    bg: `${COLORS.orange}12`,   dot: COLORS.orange   },
    accepted:  { label: 'Aceptada',    color: '#16a34a',        bg: '#f0fdf4',              dot: '#16a34a'       },
    review:    { label: 'En revisión', color: '#b45309',        bg: `${COLORS.yellow}1a`,   dot: COLORS.yellow   },
    completed: { label: 'Completada',  color: COLORS.lavender,  bg: `${COLORS.lavender}14`, dot: COLORS.lavender },
  };

  const FILTERS = [
    { id: 'all',       label: 'Todos'        },
    { id: 'available', label: 'Disponibles'  },
    { id: 'accepted',  label: 'Aceptadas'    },
    { id: 'review',    label: 'En revisión'  },
    { id: 'completed', label: 'Completadas'  },
  ];

  // Filter pipeline
  // FILEMAKER: Find sobre Cursos por (status, area, category, title, subtitle, codigo_interno).
  const filtered = courses.filter(c =>
       (status === 'all' || c.status   === status)
    && (area   === 'all' || c.area     === area)
    && (sub    === 'all' || c.category === sub)
    && (!query || c.title.toLowerCase().includes(query.toLowerCase()) || c.subtitle?.toLowerCase().includes(query.toLowerCase()) || (c.codigoInterno || '').toLowerCase().includes(query.toLowerCase()))
  );

  const areas = ['all', ...Array.from(new Set(courses.map(c => c.area)))];
  const subs  = ['all', ...Array.from(new Set(
    (area === 'all' ? courses : courses.filter(c => c.area === area)).map(c => c.category)
  ))];

  // Grouped view: area → subcategory → [courses]
  const grouped = {};
  filtered.forEach(c => {
    grouped[c.area] = grouped[c.area] || {};
    grouped[c.area][c.category] = grouped[c.area][c.category] || [];
    grouped[c.area][c.category].push(c);
  });

  const inp = {
    padding: '10px 14px', borderRadius: 10, border: '1px solid #e4e7ef',
    fontSize: 14, fontFamily: 'Lato', outline: 'none',
    width: '100%', boxSizing: 'border-box', transition: 'border-color 0.2s',
    color: COLORS.dark, background: '#fff',
  };

  const chipStyle = (active) => ({
    padding: '6px 12px', borderRadius: 8, border: '1px solid ' + (active ? COLORS.orange : '#e4e7ef'),
    background: active ? `${COLORS.orange}0d` : '#fff',
    color: active ? COLORS.orange : COLORS.text,
    fontSize: 12, fontWeight: active ? 700 : 600, cursor: 'pointer', fontFamily: 'Lato', transition: 'all 0.15s',
  });

  return React.createElement('div', null,
    // Header
    React.createElement('div', { style: { marginBottom: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' } },
      React.createElement('div', null,
        React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 24, fontWeight: 800, color: COLORS.dark, margin: '0 0 4px' } }, 'Mis formaciones'),
        React.createElement('p', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight, margin: 0 } }, 'Tu catálogo de cursos: revisa ofertas, edita contenidos, consulta alumnos o propón una nueva formación.'),
      ),
      React.createElement('button', {
        onClick: () => setShowAddProposal(true),
        style: { padding: '10px 18px', borderRadius: 10, border: 'none', background: COLORS.gradient, color: '#fff', fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 800, cursor: 'pointer', letterSpacing: 0.3, boxShadow: '0 4px 14px rgba(244,120,9,0.24)' },
      }, '+ Añadir propuesta formativa'),
    ),

    // Filter bar (sticky card)
    React.createElement('div', {
      style: { background: '#fff', border: '1px solid #eceef4', borderRadius: 14, padding: 16, marginBottom: 18, boxShadow: '0 1px 3px rgba(18,20,35,0.03)' }
    },
      React.createElement('input', {
        value: query, onChange: e => setQuery(e.target.value),
        placeholder: 'Buscar por título o descripción…',
        style: { ...inp, marginBottom: 12, background: '#fafbfc' },
      }),
      React.createElement('div', { style: { display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' } },
        // Status
        React.createElement('div', { style: { display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' } },
          React.createElement('span', { style: { fontSize: 10, fontWeight: 700, color: COLORS.textLight, fontFamily: 'Lato', textTransform: 'uppercase', letterSpacing: 1, marginRight: 4 } }, 'Estado:'),
          ...FILTERS.map(f => React.createElement('button', { key: f.id, onClick: () => setStatus(f.id), style: chipStyle(status === f.id) }, f.label)),
        ),
        React.createElement('div', { style: { width: 1, height: 22, background: '#eceef4' } }),
        // View toggle
        React.createElement('div', { style: { marginLeft: 'auto', display: 'flex', gap: 4, background: '#f4f5f9', padding: 3, borderRadius: 8 } },
          ...['grouped', 'list'].map(m => React.createElement('button', {
            key: m, onClick: () => setViewMode(m),
            style: {
              padding: '5px 12px', borderRadius: 6, border: 'none',
              background: viewMode === m ? '#fff' : 'transparent',
              color: viewMode === m ? COLORS.orange : COLORS.textLight,
              fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato', textTransform: 'uppercase', letterSpacing: 0.5,
              boxShadow: viewMode === m ? '0 1px 3px rgba(18,20,35,0.08)' : 'none',
            }
          }, m === 'grouped' ? '▦ Por grupo' : '≡ Lista'))
        ),
      ),
      React.createElement('div', { style: { display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f1f5' } },
        // Area
        React.createElement('div', { style: { display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' } },
          React.createElement('span', { style: { fontSize: 10, fontWeight: 700, color: COLORS.textLight, fontFamily: 'Lato', textTransform: 'uppercase', letterSpacing: 1, marginRight: 4 } }, 'Grupo:'),
          ...areas.map(a => React.createElement('button', { key: a, onClick: () => { setArea(a); setSub('all'); }, style: chipStyle(area === a) }, a === 'all' ? 'Todas' : a)),
        ),
        React.createElement('div', { style: { width: 1, height: 22, background: '#eceef4' } }),
        // Subcategory
        React.createElement('div', { style: { display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' } },
          React.createElement('span', { style: { fontSize: 10, fontWeight: 700, color: COLORS.textLight, fontFamily: 'Lato', textTransform: 'uppercase', letterSpacing: 1, marginRight: 4 } }, 'Familia:'),
          ...subs.slice(0, 9).map(s => React.createElement('button', { key: s, onClick: () => setSub(s), style: chipStyle(sub === s) }, s === 'all' ? 'Todas' : s)),
        ),
      ),
    ),

    // Results
    filtered.length === 0
      ? React.createElement('div', { style: { textAlign: 'center', padding: '56px 0', color: COLORS.textLight, background: '#fff', borderRadius: 14, border: '1px dashed #e4e7ef' } },
          React.createElement('div', { style: { fontSize: 30, marginBottom: 10, color: COLORS.textLight } }, '∅'),
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 15, color: COLORS.dark } }, 'Sin resultados'),
          React.createElement('div', { style: { fontSize: 13, marginTop: 4, fontFamily: 'Lato' } }, 'Prueba a quitar algún filtro o cambiar la búsqueda.'),
        )
      : viewMode === 'grouped'
          ? React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 24 } },
              ...Object.entries(grouped).map(([areaName, subcats]) => {
                const areaColor = AREA_COLORS[areaName] || COLORS.orange;
                const totalInArea = Object.values(subcats).reduce((s, arr) => s + arr.length, 0);
                return React.createElement('section', { key: areaName },
                  React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 } },
                    React.createElement('span', { style: { width: 4, height: 18, borderRadius: 2, background: areaColor, display: 'inline-block' } }),
                    React.createElement('h2', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 15, fontWeight: 800, color: COLORS.dark, margin: 0, textTransform: 'uppercase', letterSpacing: 1 } }, areaName),
                    React.createElement('span', { style: { fontSize: 11, color: COLORS.textLight, fontFamily: 'Lato', fontWeight: 600 } }, totalInArea + ' formaciones'),
                  ),
                  ...Object.entries(subcats).map(([subName, list]) =>
                    React.createElement('div', { key: subName, style: { marginBottom: 14 } },
                      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: areaColor, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 } }, subName + ' · ' + list.length),
                      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 10 } },
                        ...list.map((c, idx) => React.createElement(CourseRow, {
                          key: c.id, course: c, areaColor, statusConf: STATUS_CONF[c.status], dense: true,
                          onCloseCompliance: () => setComplianceModal(c), onEdit: () => setEditId(c.id),
                          isEditing: editId === c.id, form, setForm, submitChange,
                          onCancelEdit: () => setEditId(null), animIdx: idx,
                        })),
                      ),
                    ),
                  ),
                );
              }),
            )
          : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
              ...filtered.map((c, i) => React.createElement(CourseRow, {
                key: c.id, course: c, areaColor: AREA_COLORS[c.area] || COLORS.orange, statusConf: STATUS_CONF[c.status], dense: false,
                onCloseCompliance: () => setComplianceModal(c), onEdit: () => setEditId(c.id),
                isEditing: editId === c.id, form, setForm, submitChange,
                onCancelEdit: () => setEditId(null), animIdx: i,
              })),
            ),

    React.createElement(ComplianceModal),
    // Modal "Añadir propuesta formativa"
    typeof AddProposalModal !== 'undefined' && React.createElement(AddProposalModal, {
      open: showAddProposal, onClose: () => setShowAddProposal(false),
    }),
  );
}

// ─── Individual course row (used in both grouped and list views) ──────────────
function CourseRow({ course: c, areaColor, statusConf: st, dense, onCloseCompliance, onEdit, isEditing, form, setForm, submitChange, onCancelEdit, animIdx }) {
  const { setCurrentView } = React.useContext(AppContext);
  const Mc = motion ? motion.div : 'div';
  const inp = { padding: '9px 12px', borderRadius: 8, border: '1px solid #e4e7ef', fontSize: 13, fontFamily: 'Lato', outline: 'none', width: '100%', boxSizing: 'border-box', color: COLORS.dark, background: '#fff' };

  return React.createElement(Mc, {
    ...(motion ? { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { delay: (animIdx || 0) * 0.02 } } : {}),
    style: {
      background: '#ffffff',
      borderRadius: 12, padding: dense ? '14px 16px' : '18px 22px',
      boxShadow: '0 1px 3px rgba(18,20,35,0.03)',
      border: '1px solid #eceef4',
      borderLeft: `3px solid ${areaColor}`,
      transition: 'border-color 0.15s, box-shadow 0.15s',
    }
  },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 } },
      React.createElement('div', { style: { flex: 1, minWidth: 0 } },
        React.createElement('div', { style: { display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap', alignItems: 'center' } },
          // FILEMAKER: chip Cursos::codigo_interno (visible en lista del formador,
          //   no editable). Útil para identificar el curso en conversaciones internas.
          c.codigoInterno && React.createElement('span', {
            style: { padding: '2px 8px', borderRadius: 4, background: `${areaColor}18`, color: areaColor, fontSize: 10, fontWeight: 800, fontFamily: 'Lato', letterSpacing: 0.6, whiteSpace: 'nowrap' },
          }, c.codigoInterno),
          React.createElement('span', { style: { padding: '2px 8px', borderRadius: 4, background: `${areaColor}10`, color: areaColor, fontSize: 10, fontWeight: 700, fontFamily: 'Lato', textTransform: 'uppercase', letterSpacing: 0.6 } }, c.category),
          React.createElement('span', { style: { padding: '2px 8px', borderRadius: 4, background: '#f4f5f9', color: COLORS.textLight, fontSize: 10, fontWeight: 600, fontFamily: 'Lato', textTransform: 'uppercase', letterSpacing: 0.6 } }, c.modality),
        ),
        React.createElement('h3', { style: { fontFamily: 'Bricolage Grotesque', fontSize: dense ? 14 : 16, fontWeight: 700, color: COLORS.dark, margin: '0 0 6px', lineHeight: 1.3 } }, c.title),
        !dense && c.subtitle && React.createElement('p', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight, margin: '0 0 10px', lineHeight: 1.5 } }, c.subtitle),
        React.createElement('div', { style: { display: 'flex', gap: dense ? 12 : 18, flexWrap: 'wrap', marginTop: dense ? 4 : 8, fontSize: 11, color: COLORS.textLight, fontFamily: 'Lato' } },
          React.createElement('span', null, React.createElement('strong', { style: { color: COLORS.text, marginRight: 4 } }, 'Inicio:'), c.dates),
          React.createElement('span', null, React.createElement('strong', { style: { color: COLORS.text, marginRight: 4 } }, 'Duración:'), c.hours + 'h'),
          !dense && React.createElement('span', null, React.createElement('strong', { style: { color: COLORS.text, marginRight: 4 } }, 'Horario:'), c.time),
          !dense && React.createElement('span', null, React.createElement('strong', { style: { color: COLORS.text, marginRight: 4 } }, 'Lugar:'), c.location),
        ),
      ),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 } },
        React.createElement('span', { style: { padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: st.bg, color: st.color, fontFamily: 'Lato', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: 0.6 } },
          React.createElement('span', { style: { width: 5, height: 5, borderRadius: '50%', background: st.dot, display: 'inline-block' } }),
          st.label,
        ),
        c.status === 'accepted' && React.createElement('button', {
          onClick: onCloseCompliance,
          style: { padding: '5px 12px', borderRadius: 6, border: `1px solid ${COLORS.cyan}30`, background: `${COLORS.cyan}0c`, color: COLORS.cyan, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato', whiteSpace: 'nowrap' }
        }, '✓ Cerrar formación'),
      ),
    ),

    // Acciones rápidas para cursos aceptados (alumnos / incidencias)
    // FILEMAKER: "Ver alumnos" abre Alumnos_Formador filtrado por id_curso.
    //   "Reportar incidencia" lleva al layout Formador_Incidencias con prefill.
    c.status === 'accepted' && !dense && React.createElement('div', {
      style: { display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' },
    },
      React.createElement('button', {
        onClick: () => setCurrentView && setCurrentView('mis-alumnos'),
        style: { padding: '6px 12px', borderRadius: 7, border: `1px solid ${COLORS.cyan}30`, background: `${COLORS.cyan}0c`, color: COLORS.cyan, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato' },
      }, '◌ Ver alumnos'),
      React.createElement('button', {
        onClick: () => setCurrentView && setCurrentView('incidencias'),
        style: { padding: '6px 12px', borderRadius: 7, border: `1px solid ${COLORS.red}30`, background: `${COLORS.red}0a`, color: COLORS.red, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato' },
      }, '⚠ Reportar incidencia'),
    ),

    // Change request badge
    c.changeRequest && React.createElement('div', {
      style: { marginTop: 10, padding: '10px 12px', background: `${COLORS.fuchsia}08`, borderRadius: 8, fontSize: 12, color: COLORS.fuchsia, fontFamily: 'Lato', borderLeft: `3px solid ${COLORS.fuchsia}` }
    },
      React.createElement('span', { style: { fontWeight: 700 } }, 'Cambio solicitado: '),
      c.changeRequest.notes,
    ),

    // Change request form (accepted only)
    c.status === 'accepted' && !c.changeRequest && !dense && React.createElement('div', { style: { marginTop: 12 } },
      isEditing
        ? React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: '#fafbfc', borderRadius: 10, border: '1px solid #eceef4' } },
            React.createElement('div', { style: { fontSize: 12, fontWeight: 700, color: COLORS.dark, fontFamily: 'Bricolage Grotesque', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.6 } }, 'Solicitar cambios'),
            React.createElement('input', { style: inp, placeholder: 'Nuevas fechas propuestas…', value: form.dates, onChange: e => setForm(p => ({ ...p, dates: e.target.value })) }),
            React.createElement('input', { style: inp, placeholder: 'Ajustes al temario o metodología…', value: form.topic, onChange: e => setForm(p => ({ ...p, topic: e.target.value })) }),
            React.createElement('textarea', { style: { ...inp, minHeight: 72, resize: 'vertical' }, placeholder: 'Observaciones adicionales…', value: form.notes, onChange: e => setForm(p => ({ ...p, notes: e.target.value })) }),
            React.createElement('div', { style: { display: 'flex', gap: 8 } },
              React.createElement('button', {
                onClick: () => { if (form.notes) { submitChange(c.id, form); onCancelEdit(); setForm({ dates: '', topic: '', notes: '' }); } },
                style: { padding: '8px 20px', borderRadius: 8, border: 'none', background: COLORS.orange, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato' }
              }, 'Enviar solicitud'),
              React.createElement('button', {
                onClick: onCancelEdit,
                style: { padding: '8px 16px', borderRadius: 8, border: '1px solid #e4e7ef', background: '#fff', color: COLORS.textLight, fontSize: 12, cursor: 'pointer', fontFamily: 'Lato' }
              }, 'Cancelar'),
            ),
          )
        : React.createElement('button', {
            onClick: onEdit,
            style: { padding: '6px 14px', borderRadius: 8, border: `1px solid ${COLORS.lavender}40`, background: `${COLORS.lavender}08`, color: COLORS.lavender, fontSize: 12, cursor: 'pointer', fontFamily: 'Lato', fontWeight: 600, transition: 'all 0.15s' }
          }, '↻ Solicitar cambios'),
    ),
  );
}

window.SwipeCard          = SwipeCard;
window.SwipeStack         = SwipeStack;
window.OfertasView        = OfertasView;
window.ProposeDatesModal  = ProposeDatesModal;
