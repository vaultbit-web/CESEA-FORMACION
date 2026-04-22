// ─── Swipe Cards ──────────────────────────────────────────────────────────────
const { motion, AnimatePresence, useMotionValue, useTransform } = window.Motion || {};

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

        // Area breadcrumb
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.8 } },
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

  const availableAll = courses.filter(c => c.status === 'available');
  const availableAreas = ['all', ...Array.from(new Set(availableAll.map(c => c.area)))];
  const available = areaFilter === 'all' ? availableAll : availableAll.filter(c => c.area === areaFilter);

  const handleRight = (id) => {
    const c = courses.find(c => c.id === id);
    swipeRight(id);
    setToast({ title: c?.title, type: 'right' });
    setTimeout(() => setToast(null), 3200);
  };
  const handleLeft = (id) => {
    swipeLeft(id);
    setToast({ title: 'Oferta descartada', type: 'left' });
    setTimeout(() => setToast(null), 2200);
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
  );
}

// ─── Offers Full View (Cursos tab) ────────────────────────────────────────────
// Organización por Área → Subcategoría, idéntica a csaformacion.com/formacion.
// Filtros por estado, área formativa, subcategoría y búsqueda de texto.
function OfertasView() {
  const { courses, submitChange, setComplianceModal } = React.useContext(AppContext);
  const [status, setStatus]     = React.useState('all');
  const [area, setArea]         = React.useState('all');
  const [sub, setSub]           = React.useState('all');
  const [query, setQuery]       = React.useState('');
  const [editId, setEditId]     = React.useState(null);
  const [form, setForm]         = React.useState({ dates: '', topic: '', notes: '' });
  const [viewMode, setViewMode] = React.useState('grouped');  // 'grouped' | 'list'
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
  const filtered = courses.filter(c =>
       (status === 'all' || c.status   === status)
    && (area   === 'all' || c.area     === area)
    && (sub    === 'all' || c.category === sub)
    && (!query || c.title.toLowerCase().includes(query.toLowerCase()) || c.subtitle?.toLowerCase().includes(query.toLowerCase()))
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
    React.createElement('div', { style: { marginBottom: 22 } },
      React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 24, fontWeight: 800, color: COLORS.dark, margin: '0 0 4px' } }, 'Catálogo de formaciones'),
      React.createElement('p', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight, margin: 0 } }, 'Explora el catálogo completo organizado por área y categoría, filtra por estado y consulta los detalles de cada formación.'),
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
  );
}

// ─── Individual course row (used in both grouped and list views) ──────────────
function CourseRow({ course: c, areaColor, statusConf: st, dense, onCloseCompliance, onEdit, isEditing, form, setForm, submitChange, onCancelEdit, animIdx }) {
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

window.SwipeCard   = SwipeCard;
window.SwipeStack  = SwipeStack;
window.OfertasView = OfertasView;
