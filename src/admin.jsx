// ─── CESEA Formación — Superadmin ─────────────────────────────────────────────
//
// Vista exclusiva del rol "superadmin". Se renderiza en lugar de AppLayout
// cuando user.roleType === 'superadmin'. La vista de formador se mantiene
// intacta; esta capa es independiente para evitar condicionales dispersos.
//
// FILEMAKER: PORTING GUIDE (capa admin)
// ─────────────────────────────────────────────────────────────────────────────
// Este archivo replica los layouts:
//   • Admin_Dashboard         → AdminDashboardView
//   • Admin_Cursos            → AdminCoursesView     (CRUD de la tabla Cursos)
//   • Admin_Solicitudes       → AdminRequestsView    (portal Solicitudes)
//   • Admin_Horas             → AdminHoursView       (portal Horas_Impartidas)
//   • Admin_Formadores        → AdminTrainersView    (tabla Formadores)
//
// Privilegio requerido en FM: [priv_Superadmin]. Las relaciones y scripts
// están anotados in-line (buscar `FILEMAKER:`).
// ─────────────────────────────────────────────────────────────────────────────

const { motion: adminMotion, AnimatePresence: AdminAP } = window.Motion || {};

const ADMIN_NAV_ITEMS = [
  { id: 'inicio',       label: 'Panel admin',      icon: '▤' },
  { id: 'cursos',       label: 'Cursos',           icon: '▦' },
  { id: 'solicitudes',  label: 'Solicitudes',      icon: '◉' },
  { id: 'horas',        label: 'Validar horas',    icon: '◷' },
  { id: 'formadores',   label: 'Formadores',       icon: '◈' },
];

// ─── Top Nav (admin) ──────────────────────────────────────────────────────────
function AdminTopNav() {
  const {
    currentView, setCurrentView, user, logout,
    adminNotifications, markAllAdminRead, pendingRequests,
  } = React.useContext(AppContext);
  const [showProfile, setShowProfile] = React.useState(false);
  const [showNotif,   setShowNotif]   = React.useState(false);
  const unread = (adminNotifications || []).filter(n => !n.read).length;
  const pending = pendingRequests?.length || 0;

  const closeAll = () => { setShowProfile(false); setShowNotif(false); };

  return React.createElement('nav', {
    style: {
      position: 'sticky', top: 0, zIndex: 100,
      background: '#0f1020',
      borderBottom: '1px solid #1d1f38',
      padding: '0 40px', height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }
  },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 36 } },
      React.createElement('div', {
        style: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' },
        onClick: () => { closeAll(); setCurrentView('inicio'); },
      },
        React.createElement('img', {
          src: 'assets/logotipo-blanco.png', alt: 'CESEA',
          style: { height: 30, width: 'auto' },
          onError: e => { e.target.style.display = 'none'; },
        }),
        React.createElement('span', {
          style: {
            padding: '3px 9px', borderRadius: 5, background: COLORS.gradient,
            color: '#fff', fontSize: 9.5, fontWeight: 800, letterSpacing: 1,
            fontFamily: 'Bricolage Grotesque', textTransform: 'uppercase',
          }
        }, 'Superadmin'),
      ),
      React.createElement('div', { style: { display: 'flex', gap: 2 } },
        ...ADMIN_NAV_ITEMS.map(item => {
          const active = currentView === item.id;
          const showBadge = item.id === 'solicitudes' && pending > 0;
          return React.createElement('button', {
            key: item.id,
            onClick: () => { closeAll(); setCurrentView(item.id); },
            style: {
              padding: '8px 14px', borderRadius: 10, border: 'none',
              background: active ? 'rgba(244,120,9,0.14)' : 'transparent',
              color: active ? COLORS.yellow : 'rgba(255,255,255,0.62)',
              fontFamily: 'Lato', fontSize: 13.5, fontWeight: active ? 700 : 500,
              cursor: 'pointer', transition: 'all 0.18s',
              display: 'flex', alignItems: 'center', gap: 7, position: 'relative',
            },
            onMouseEnter: e => { if (!active) e.currentTarget.style.color = '#fff'; },
            onMouseLeave: e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.62)'; },
          },
            React.createElement('span', { style: { fontSize: 13, opacity: active ? 1 : 0.65 } }, item.icon),
            item.label,
            showBadge && React.createElement('span', {
              style: {
                padding: '1px 6px', borderRadius: 999, background: COLORS.red,
                color: '#fff', fontSize: 10, fontWeight: 800, marginLeft: 4,
                fontFamily: 'Bricolage Grotesque',
              }
            }, pending),
          );
        }),
      ),
    ),

    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
      React.createElement('div', { style: { position: 'relative' } },
        React.createElement('button', {
          onClick: () => { setShowNotif(!showNotif); setShowProfile(false); if (showNotif) markAllAdminRead(); },
          style: {
            width: 36, height: 36, borderRadius: 9,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer', color: '#fff', fontSize: 14, position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }
        },
          '◔',
          unread > 0 && React.createElement('span', {
            style: { position: 'absolute', top: 5, right: 5, width: 8, height: 8, borderRadius: '50%', background: COLORS.red, border: '2px solid #0f1020' }
          }),
        ),
        showNotif && React.createElement('div', {
          style: { position: 'absolute', top: 46, right: 0, background: '#fff', borderRadius: 14, padding: 14, width: 320, boxShadow: '0 20px 48px rgba(0,0,0,0.3)', border: '1px solid #eceef4', zIndex: 300 }
        },
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 13, color: COLORS.dark, marginBottom: 10, padding: '0 4px', textTransform: 'uppercase', letterSpacing: 0.8 } }, 'Notificaciones admin'),
          ...(adminNotifications || []).map(n =>
            React.createElement('div', {
              key: n.id,
              style: { padding: '10px 12px', borderRadius: 10, marginBottom: 4, background: n.read ? 'transparent' : `${COLORS.orange}08`, borderLeft: `3px solid ${n.read ? 'transparent' : COLORS.orange}` }
            },
              React.createElement('div', { style: { fontSize: 13, fontFamily: 'Lato', color: n.read ? COLORS.textLight : COLORS.text, fontWeight: n.read ? 400 : 600, lineHeight: 1.4 } }, n.text),
            )
          ),
        ),
      ),

      React.createElement('div', { style: { position: 'relative' } },
        React.createElement('button', {
          onClick: () => { setShowProfile(!showProfile); setShowNotif(false); },
          style: {
            display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 4px 4px',
            borderRadius: 9, background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
          }
        },
          React.createElement('div', {
            style: {
              width: 30, height: 30, borderRadius: 7, background: COLORS.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 12, fontFamily: 'Bricolage Grotesque',
            }
          }, user?.initials || 'SA'),
          React.createElement('div', { style: { textAlign: 'left', lineHeight: 1.15 } },
            React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, fontWeight: 700, color: '#fff', maxWidth: 130, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, (user?.name || '').split(' ').slice(0, 2).join(' ')),
            React.createElement('div', { style: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontFamily: 'Lato' } }, user?.role),
          ),
          React.createElement('span', { style: { color: 'rgba(255,255,255,0.55)', fontSize: 10, marginLeft: 2 } }, '▾'),
        ),

        showProfile && React.createElement('div', {
          style: { position: 'absolute', top: 48, right: 0, background: '#fff', borderRadius: 14, padding: 16, width: 256, boxShadow: '0 20px 48px rgba(0,0,0,0.3)', border: '1px solid #eceef4', zIndex: 300 }
        },
          React.createElement('div', { style: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #f0f1f5' } },
            React.createElement('div', { style: { width: 40, height: 40, borderRadius: 10, background: COLORS.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14, fontFamily: 'Bricolage Grotesque', flexShrink: 0 } }, user?.initials),
            React.createElement('div', { style: { overflow: 'hidden' } },
              React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 13, color: COLORS.dark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, user?.name),
              React.createElement('div', { style: { fontSize: 11, color: COLORS.textLight, fontFamily: 'Lato', marginTop: 2 } }, user?.email),
            ),
          ),
          React.createElement('button', {
            onClick: logout,
            style: { width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid transparent', background: `${COLORS.red}08`, color: COLORS.red, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Lato', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }
          }, React.createElement('span', null, '↩'), 'Cerrar sesión'),
        ),
      ),
    ),
  );
}

// ─── App Shell (admin) ────────────────────────────────────────────────────────
function AdminLayout() {
  const { currentView } = React.useContext(AppContext);
  return React.createElement('div', { style: { minHeight: '100vh', background: '#f6f7fb' } },
    React.createElement(AdminTopNav),
    React.createElement('main', { style: { padding: '28px 40px 56px', maxWidth: 1360, margin: '0 auto' } },
      currentView === 'inicio'      && React.createElement(AdminDashboardView),
      currentView === 'cursos'      && React.createElement(AdminCoursesView),
      currentView === 'solicitudes' && React.createElement(AdminRequestsView),
      currentView === 'horas'       && React.createElement(AdminHoursView),
      currentView === 'formadores'  && React.createElement(AdminTrainersView),
    ),
  );
}

// ─── Reusable pill badge ──────────────────────────────────────────────────────
function Pill({ text, color, bg }) {
  return React.createElement('span', {
    style: {
      display: 'inline-block', padding: '3px 10px', borderRadius: 6,
      background: bg, color, fontSize: 11, fontWeight: 700,
      fontFamily: 'Lato', textTransform: 'uppercase', letterSpacing: 0.6,
    }
  }, text);
}

const statusColor = (s) => ({
  available:  { c: COLORS.orange,   bg: `${COLORS.orange}15`,   label: 'Disponible' },
  accepted:   { c: '#16a34a',       bg: '#16a34a15',            label: 'Aceptado'   },
  review:     { c: COLORS.yellow,   bg: `${COLORS.yellow}22`,   label: 'En revisión'},
  completed:  { c: COLORS.cyan,     bg: `${COLORS.cyan}18`,     label: 'Completado' },
  archived:   { c: COLORS.textLight,bg: '#e8eaf0',              label: 'Archivado'  },
}[s] || { c: COLORS.textLight, bg: '#eceef4', label: s });

// ─── Dashboard (admin) ────────────────────────────────────────────────────────
// FILEMAKER: Layout "Admin_Dashboard" con resúmenes calculados (aggregates).
function AdminDashboardView() {
  const { courses, trainers, pendingRequests, hoursLog, setCurrentView } = React.useContext(AppContext);
  const totalCourses = courses.length;
  const activeTrainers = trainers.filter(t => t.status === 'Activo').length;
  const pendingHours = hoursLog.filter(h => h.status !== 'Validado').length;
  const totalHours = hoursLog.reduce((s, h) => s + h.hours, 0);

  const KPIS = [
    { label: 'Cursos en catálogo',   value: totalCourses,              color: COLORS.orange,  hint: 'Total publicado en plataforma', go: 'cursos' },
    { label: 'Formadores activos',   value: activeTrainers,            color: COLORS.cyan,    hint: 'Sobre un total de ' + trainers.length, go: 'formadores' },
    { label: 'Solicitudes pendientes', value: pendingRequests.length,  color: COLORS.red,     hint: 'Requieren tu revisión', go: 'solicitudes' },
    { label: 'Horas por validar',    value: pendingHours,              color: COLORS.yellow,  hint: totalHours + 'h totales reportadas', go: 'horas' },
  ];

  return React.createElement('div', null,
    React.createElement('div', { style: { marginBottom: 22 } },
      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.3, marginBottom: 4 } }, 'Panel de superadministración'),
      React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 26, fontWeight: 800, color: COLORS.dark, margin: 0 } },
        'Control total de ',
        React.createElement('span', { style: { background: COLORS.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } }, 'la plataforma'),
      ),
      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight, marginTop: 4 } },
        'Gestiona el catálogo, aprueba solicitudes, valida horas impartidas y administra formadores.'
      ),
    ),
    // KPI cards
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 } },
      ...KPIS.map(k => React.createElement('div', {
        key: k.label,
        onClick: () => setCurrentView(k.go),
        style: {
          background: '#fff', borderRadius: 14, padding: '18px 20px',
          border: '1px solid #eceef4', cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(18,20,35,0.04)', position: 'relative', overflow: 'hidden',
          transition: 'transform 0.15s, box-shadow 0.15s',
        },
        onMouseEnter: e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(18,20,35,0.08)'; },
        onMouseLeave: e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(18,20,35,0.04)'; },
      },
        React.createElement('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: k.color } }),
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 } }, k.label),
        React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 28, fontWeight: 800, color: COLORS.dark, lineHeight: 1 } }, k.value),
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, marginTop: 8 } }, k.hint),
      )),
    ),
    // Two columns: pending requests + recent courses
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 } },
      React.createElement('div', { style: { background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #eceef4' } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 } },
          React.createElement('h3', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: COLORS.dark, margin: 0, textTransform: 'uppercase', letterSpacing: 0.8 } }, 'Solicitudes recientes'),
          React.createElement('button', {
            onClick: () => setCurrentView('solicitudes'),
            style: { padding: '6px 12px', borderRadius: 7, border: `1px solid ${COLORS.orange}`, background: '#fff', color: COLORS.orange, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato' }
          }, 'Ver todas →'),
        ),
        ...(pendingRequests.slice(0, 4).map(r =>
          React.createElement('div', {
            key: r.id,
            style: { padding: '12px 0', borderBottom: '1px solid #f0f1f5' }
          },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 } },
              React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, fontWeight: 700, color: COLORS.dark } }, r.trainer),
              React.createElement(Pill, {
                text: r.type === 'change' ? 'Cambio' : r.type === 'new' ? 'Aceptación' : r.type === 'hours' ? 'Horas' : 'Alta',
                color: r.type === 'register' ? COLORS.cyan : COLORS.orange,
                bg: r.type === 'register' ? `${COLORS.cyan}15` : `${COLORS.orange}12`,
              }),
            ),
            React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight } }, r.detail),
          )
        )),
        pendingRequests.length === 0 && React.createElement('div', {
          style: { padding: 24, textAlign: 'center', color: COLORS.textLight, fontFamily: 'Lato', fontSize: 13 }
        }, 'No hay solicitudes pendientes.'),
      ),
      React.createElement('div', { style: { background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #eceef4' } },
        React.createElement('h3', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: COLORS.dark, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: 0.8 } }, 'Accesos rápidos'),
        ...[
          { label: '+ Crear nuevo curso',         go: 'cursos',      accent: COLORS.orange },
          { label: 'Revisar solicitudes',         go: 'solicitudes', accent: COLORS.red    },
          { label: 'Validar horas impartidas',    go: 'horas',       accent: COLORS.yellow },
          { label: 'Gestionar formadores',        go: 'formadores',  accent: COLORS.cyan   },
        ].map(a => React.createElement('button', {
          key: a.label,
          onClick: () => setCurrentView(a.go),
          style: {
            width: '100%', padding: '11px 14px', borderRadius: 10,
            border: `1px solid ${a.accent}30`, background: `${a.accent}08`,
            color: a.accent, fontFamily: 'Lato', fontSize: 13, fontWeight: 700,
            textAlign: 'left', cursor: 'pointer', marginBottom: 8,
            transition: 'background 0.15s',
          },
          onMouseEnter: e => e.currentTarget.style.background = `${a.accent}14`,
          onMouseLeave: e => e.currentTarget.style.background = `${a.accent}08`,
        }, a.label)),
      ),
    ),
  );
}

// ─── Course CRUD ──────────────────────────────────────────────────────────────
// FILEMAKER: Layout "Admin_Cursos". Tabla Cursos. Scripts:
//   "Crear_Curso", "Editar_Curso", "Archivar_Curso".
function AdminCoursesView() {
  const { courses, createCourse, updateCourse, archiveCourse } = React.useContext(AppContext);
  const [filter, setFilter]         = React.useState('');
  const [areaFilter, setAreaFilter] = React.useState('all');
  const [editing, setEditing]       = React.useState(null); // null | 'new' | {id,...}

  const areas = ['all', ...Array.from(new Set(courses.map(c => c.area)))];
  const filtered = courses.filter(c =>
    (areaFilter === 'all' || c.area === areaFilter) &&
    (!filter || (c.title + ' ' + c.subtitle).toLowerCase().includes(filter.toLowerCase()))
  );

  return React.createElement('div', null,
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 12 } },
      React.createElement('div', null,
        React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 24, fontWeight: 800, color: COLORS.dark, margin: '0 0 4px' } }, 'Gestión de cursos'),
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight } },
          courses.length + ' cursos en catálogo · crea, edita o archiva.'
        ),
      ),
      React.createElement('button', {
        onClick: () => setEditing('new'),
        style: { padding: '11px 18px', borderRadius: 10, border: 'none', background: COLORS.gradient, color: '#fff', fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 18px rgba(244,120,9,0.28)' }
      }, '+ Crear curso'),
    ),
    // Filters
    React.createElement('div', { style: { display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' } },
      React.createElement('input', {
        placeholder: 'Buscar por título o descripción…',
        value: filter, onChange: e => setFilter(e.target.value),
        style: { flex: 1, minWidth: 240, padding: '10px 14px', borderRadius: 10, border: '1px solid #e4e7ef', fontSize: 13, fontFamily: 'Lato', outline: 'none' }
      }),
      React.createElement('select', {
        value: areaFilter, onChange: e => setAreaFilter(e.target.value),
        style: { padding: '10px 14px', borderRadius: 10, border: '1px solid #e4e7ef', fontSize: 13, fontFamily: 'Lato', background: '#fff', cursor: 'pointer' }
      },
        ...areas.map(a => React.createElement('option', { key: a, value: a }, a === 'all' ? 'Todos los grupos de acciones' : a))
      ),
    ),
    // Table
    React.createElement('div', { style: { background: '#fff', borderRadius: 14, border: '1px solid #eceef4', overflow: 'hidden' } },
      React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', borderSpacing: 0 } },
        React.createElement('thead', null,
          React.createElement('tr', { style: { background: '#fafbfc' } },
            ...['Curso', 'Grupo de acciones', 'Modalidad', 'Horas', 'Estado', ''].map(h =>
              React.createElement('th', {
                key: h,
                style: { padding: '12px 16px', textAlign: 'left', fontFamily: 'Lato', fontSize: 10, fontWeight: 700, color: COLORS.textLight, letterSpacing: 1, textTransform: 'uppercase', borderBottom: '1px solid #eceef4' }
              }, h)
            ),
          ),
        ),
        React.createElement('tbody', null,
          ...filtered.slice(0, 60).map(c => {
            const st = statusColor(c.status);
            return React.createElement('tr', {
              key: c.id,
              style: { borderBottom: '1px solid #f4f5f9' }
            },
              React.createElement('td', { style: { padding: '14px 16px' } },
                React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, fontWeight: 700, color: COLORS.dark, maxWidth: 360 } }, c.title),
                React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, marginTop: 2, maxWidth: 360, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, c.category),
              ),
              React.createElement('td', { style: { padding: '14px 16px', fontFamily: 'Lato', fontSize: 12, color: COLORS.text } }, c.area),
              React.createElement('td', { style: { padding: '14px 16px', fontFamily: 'Lato', fontSize: 12, color: COLORS.text } }, c.modality),
              React.createElement('td', { style: { padding: '14px 16px', fontFamily: 'Lato', fontSize: 12, color: COLORS.text } }, c.hours + 'h'),
              React.createElement('td', { style: { padding: '14px 16px' } }, React.createElement(Pill, { text: st.label, color: st.c, bg: st.bg })),
              React.createElement('td', { style: { padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' } },
                React.createElement('button', {
                  onClick: () => setEditing(c),
                  style: { padding: '6px 12px', borderRadius: 7, border: '1px solid #e4e7ef', background: '#fff', color: COLORS.text, fontSize: 11, fontWeight: 700, cursor: 'pointer', marginRight: 6, fontFamily: 'Lato' }
                }, 'Editar'),
                c.status !== 'archived' && React.createElement('button', {
                  onClick: () => { if (confirm('¿Archivar este curso? No se eliminará, pero dejará de mostrarse a los formadores.')) archiveCourse(c.id); },
                  style: { padding: '6px 12px', borderRadius: 7, border: `1px solid ${COLORS.red}30`, background: `${COLORS.red}08`, color: COLORS.red, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato' }
                }, 'Archivar'),
              ),
            );
          }),
          filtered.length === 0 && React.createElement('tr', null,
            React.createElement('td', {
              colSpan: 6,
              style: { padding: 36, textAlign: 'center', fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight }
            }, 'No se encontraron cursos con esos filtros.')
          ),
        ),
      ),
    ),
    editing && React.createElement(CourseEditorModal, {
      course: editing === 'new' ? null : editing,
      onClose: () => setEditing(null),
      onSave: (data) => {
        if (editing === 'new') createCourse(data);
        else updateCourse(editing.id, data);
        setEditing(null);
      },
    }),
  );
}

// ─── Course editor modal ─────────────────────────────────────────────────────
// FILEMAKER: Equivale a un layout "Admin_Curso_Edit" con campos editables +
//   scripts "Guardar_Curso" (New o Commit Record).
function CourseEditorModal({ course, onClose, onSave }) {
  const [form, setForm] = React.useState({
    title:    course?.title    || '',
    subtitle: course?.subtitle || '',
    area:     course?.area     || 'Área técnica',
    category: course?.category || '',
    modality: course?.modality || 'Online',
    hours:    course?.hours    || 8,
    time:     course?.time     || '10:00 - 15:00',
    location: course?.location || 'Plataforma Zoom',
    dates:    course?.dates    || '1 enero 2026',
  });
  const field = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e4e7ef', fontSize: 13, fontFamily: 'Lato', outline: 'none', boxSizing: 'border-box', background: '#fff' };
  const label = { display: 'block', fontSize: 10, fontWeight: 700, color: COLORS.textLight, fontFamily: 'Lato', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 };

  const areas = ['Área técnica', 'Competencias', 'ACP y Modelo de Atención', 'Área de autocuidados'];

  return React.createElement('div', {
    onClick: onClose,
    style: {
      position: 'fixed', inset: 0, background: 'rgba(15,16,32,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400,
      padding: 20,
    }
  },
    React.createElement('div', {
      onClick: e => e.stopPropagation(),
      style: {
        background: '#fff', borderRadius: 14, padding: 28, width: '100%', maxWidth: 620,
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }
    },
      React.createElement('h2', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 20, fontWeight: 800, color: COLORS.dark, margin: '0 0 4px' } }, course ? 'Editar curso' : 'Crear nuevo curso'),
      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, marginBottom: 20 } }, 'Los cambios se publican inmediatamente en el catálogo visible para los formadores.'),

      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr', gap: 14 } },
        React.createElement('div', null,
          React.createElement('label', { style: label }, 'Título del curso'),
          React.createElement('input', { style: field, value: form.title, onChange: e => setForm({ ...form, title: e.target.value }) }),
        ),
        React.createElement('div', null,
          React.createElement('label', { style: label }, 'Descripción / subtítulo'),
          React.createElement('textarea', { style: { ...field, minHeight: 70, resize: 'vertical', fontFamily: 'Lato' }, value: form.subtitle, onChange: e => setForm({ ...form, subtitle: e.target.value }) }),
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 } },
          React.createElement('div', null,
            React.createElement('label', { style: label }, 'Grupo de acciones'),
            React.createElement('select', { style: field, value: form.area, onChange: e => setForm({ ...form, area: e.target.value }) },
              ...areas.map(a => React.createElement('option', { key: a, value: a }, a)),
            ),
          ),
          React.createElement('div', null,
            React.createElement('label', { style: label }, 'Familia de acciones'),
            React.createElement('input', { style: field, value: form.category, onChange: e => setForm({ ...form, category: e.target.value }) }),
          ),
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 } },
          React.createElement('div', null,
            React.createElement('label', { style: label }, 'Modalidad'),
            React.createElement('select', { style: field, value: form.modality, onChange: e => setForm({ ...form, modality: e.target.value }) },
              ...['Online', 'Presencial', 'Híbrido'].map(m => React.createElement('option', { key: m, value: m }, m)),
            ),
          ),
          React.createElement('div', null,
            React.createElement('label', { style: label }, 'Horas'),
            React.createElement('input', { type: 'number', min: 1, style: field, value: form.hours, onChange: e => setForm({ ...form, hours: parseInt(e.target.value, 10) || 0 }) }),
          ),
          React.createElement('div', null,
            React.createElement('label', { style: label }, 'Horario'),
            React.createElement('input', { style: field, value: form.time, onChange: e => setForm({ ...form, time: e.target.value }) }),
          ),
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 } },
          React.createElement('div', null,
            React.createElement('label', { style: label }, 'Ubicación'),
            React.createElement('input', { style: field, value: form.location, onChange: e => setForm({ ...form, location: e.target.value }) }),
          ),
          React.createElement('div', null,
            React.createElement('label', { style: label }, 'Fechas'),
            React.createElement('input', { style: field, value: form.dates, onChange: e => setForm({ ...form, dates: e.target.value }) }),
          ),
        ),
      ),

      React.createElement('div', { style: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 22, paddingTop: 18, borderTop: '1px solid #eceef4' } },
        React.createElement('button', {
          onClick: onClose,
          style: { padding: '10px 18px', borderRadius: 9, border: '1px solid #e4e7ef', background: '#fff', color: COLORS.text, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato' }
        }, 'Cancelar'),
        React.createElement('button', {
          onClick: () => { if (!form.title.trim()) return alert('El título es obligatorio.'); onSave(form); },
          style: { padding: '10px 20px', borderRadius: 9, border: 'none', background: COLORS.gradient, color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Bricolage Grotesque', boxShadow: '0 4px 14px rgba(244,120,9,0.28)' }
        }, course ? 'Guardar cambios' : 'Crear curso'),
      ),
    ),
  );
}

// ─── Requests ─────────────────────────────────────────────────────────────────
// FILEMAKER: Layout "Admin_Solicitudes" con portal a Solicitudes filtrado por
//   estado = "pendiente". Botones aprobar/rechazar disparan scripts
//   "Aprobar_Solicitud" / "Rechazar_Solicitud".
function AdminRequestsView() {
  const { pendingRequests, approveRequest, rejectRequest } = React.useContext(AppContext);
  const typeMeta = {
    change:   { label: 'Cambio de curso',   color: COLORS.orange  },
    new:      { label: 'Aceptación',        color: '#16a34a'      },
    hours:    { label: 'Reporte de horas',  color: COLORS.yellow  },
    register: { label: 'Alta de formador',  color: COLORS.cyan    },
  };

  return React.createElement('div', null,
    React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 24, fontWeight: 800, color: COLORS.dark, margin: '0 0 4px' } }, 'Solicitudes pendientes'),
    React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight, marginBottom: 20 } },
      pendingRequests.length + ' solicitudes esperando tu revisión.'
    ),
    pendingRequests.length === 0
      ? React.createElement('div', {
          style: { padding: 60, textAlign: 'center', background: '#fff', borderRadius: 14, border: '1px solid #eceef4' }
        },
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 40, marginBottom: 10 } }, '✓'),
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 16, fontWeight: 700, color: COLORS.dark, marginBottom: 4 } }, 'Todo al día'),
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight } }, 'No hay solicitudes pendientes.'),
        )
      : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
          ...pendingRequests.map(r => {
            const m = typeMeta[r.type] || { label: r.type, color: COLORS.textLight };
            return React.createElement('div', {
              key: r.id,
              style: { background: '#fff', borderRadius: 12, padding: '18px 22px', border: '1px solid #eceef4', display: 'flex', alignItems: 'center', gap: 20, position: 'relative' }
            },
              React.createElement('div', { style: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 3, background: m.color, borderRadius: '12px 0 0 12px' } }),
              React.createElement('div', { style: { flex: 1 } },
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 } },
                  React.createElement(Pill, { text: m.label, color: m.color, bg: `${m.color}15` }),
                  React.createElement('span', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight } }, r.date),
                ),
                React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 15, fontWeight: 700, color: COLORS.dark, marginBottom: 2 } }, r.trainer),
                r.courseTitle && r.courseTitle !== '—' && React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.text, marginBottom: 4 } }, r.courseTitle),
                React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight } }, r.detail),
              ),
              React.createElement('div', { style: { display: 'flex', gap: 8, flexShrink: 0 } },
                React.createElement('button', {
                  onClick: () => rejectRequest(r.id),
                  style: { padding: '9px 14px', borderRadius: 9, border: `1px solid ${COLORS.red}30`, background: '#fff', color: COLORS.red, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato' }
                }, 'Rechazar'),
                React.createElement('button', {
                  onClick: () => approveRequest(r.id),
                  style: { padding: '9px 18px', borderRadius: 9, border: 'none', background: COLORS.gradient, color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'Bricolage Grotesque', letterSpacing: 0.3 }
                }, 'Aprobar'),
              ),
            );
          }),
        ),
  );
}

// ─── Hours validation ─────────────────────────────────────────────────────────
// FILEMAKER: Layout "Admin_Horas". Tabla Horas_Impartidas. Scripts:
//   "Validar_Horas" (estado = Validado), "Rechazar_Horas" (estado = Rechazado).
function AdminHoursView() {
  const { hoursLog, validateHours, rejectHours } = React.useContext(AppContext);
  const [filter, setFilter] = React.useState('all');
  const tabs = [
    { id: 'all',        label: 'Todas',       color: COLORS.textLight },
    { id: 'Pendiente',  label: 'Pendientes',  color: COLORS.orange    },
    { id: 'En revisión',label: 'En revisión', color: COLORS.yellow    },
    { id: 'Validado',   label: 'Validadas',   color: '#16a34a'        },
  ];
  const filtered = filter === 'all' ? hoursLog : hoursLog.filter(h => h.status === filter);

  const statusPill = (s) => {
    const map = {
      'Validado':    { c: '#16a34a',       bg: '#16a34a15' },
      'Pendiente':   { c: COLORS.orange,   bg: `${COLORS.orange}15` },
      'En revisión': { c: COLORS.yellow,   bg: `${COLORS.yellow}22` },
      'Rechazado':   { c: COLORS.red,      bg: `${COLORS.red}15`    },
    };
    const { c, bg } = map[s] || { c: COLORS.textLight, bg: '#eceef4' };
    return React.createElement(Pill, { text: s, color: c, bg });
  };

  return React.createElement('div', null,
    React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 24, fontWeight: 800, color: COLORS.dark, margin: '0 0 4px' } }, 'Validación de horas impartidas'),
    React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight, marginBottom: 18 } }, 'Revisa y valida las horas reportadas por los formadores.'),
    React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 16 } },
      ...tabs.map(t => React.createElement('button', {
        key: t.id,
        onClick: () => setFilter(t.id),
        style: {
          padding: '8px 14px', borderRadius: 8,
          border: `1px solid ${filter === t.id ? t.color : '#e4e7ef'}`,
          background: filter === t.id ? `${t.color}12` : '#fff',
          color: filter === t.id ? t.color : COLORS.text,
          fontFamily: 'Lato', fontSize: 12, fontWeight: 700, cursor: 'pointer',
        }
      }, t.label)),
    ),
    React.createElement('div', { style: { background: '#fff', borderRadius: 14, border: '1px solid #eceef4', overflow: 'hidden' } },
      React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', borderSpacing: 0 } },
        React.createElement('thead', null,
          React.createElement('tr', { style: { background: '#fafbfc' } },
            ...['Curso', 'Fecha', 'Horas', 'Modalidad', 'Estado', ''].map(h =>
              React.createElement('th', {
                key: h,
                style: { padding: '12px 16px', textAlign: 'left', fontFamily: 'Lato', fontSize: 10, fontWeight: 700, color: COLORS.textLight, letterSpacing: 1, textTransform: 'uppercase', borderBottom: '1px solid #eceef4' }
              }, h)
            ),
          ),
        ),
        React.createElement('tbody', null,
          ...filtered.map(h => React.createElement('tr', {
            key: h.id,
            style: { borderBottom: '1px solid #f4f5f9' }
          },
            React.createElement('td', { style: { padding: '14px 16px', maxWidth: 360 } },
              React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, fontWeight: 700, color: COLORS.dark } }, h.course),
              React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, marginTop: 2 } }, h.area),
            ),
            React.createElement('td', { style: { padding: '14px 16px', fontFamily: 'Lato', fontSize: 12, color: COLORS.text, whiteSpace: 'nowrap' } }, h.date),
            React.createElement('td', { style: { padding: '14px 16px', fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: COLORS.dark } }, h.hours + 'h'),
            React.createElement('td', { style: { padding: '14px 16px', fontFamily: 'Lato', fontSize: 12, color: COLORS.text } }, h.modality),
            React.createElement('td', { style: { padding: '14px 16px' } }, statusPill(h.status)),
            React.createElement('td', { style: { padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' } },
              h.status !== 'Validado' && React.createElement('button', {
                onClick: () => validateHours(h.id),
                style: { padding: '6px 12px', borderRadius: 7, border: 'none', background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginRight: 6, fontFamily: 'Lato' }
              }, '✓ Validar'),
              h.status !== 'Rechazado' && h.status !== 'Validado' && React.createElement('button', {
                onClick: () => rejectHours(h.id),
                style: { padding: '6px 12px', borderRadius: 7, border: `1px solid ${COLORS.red}30`, background: '#fff', color: COLORS.red, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato' }
              }, 'Rechazar'),
            ),
          )),
          filtered.length === 0 && React.createElement('tr', null,
            React.createElement('td', {
              colSpan: 6,
              style: { padding: 36, textAlign: 'center', fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight }
            }, 'No hay registros en este estado.'),
          ),
        ),
      ),
    ),
  );
}

// ─── Trainers ─────────────────────────────────────────────────────────────────
// FILEMAKER: Layout "Admin_Formadores". Tabla Formadores. Script
//   "Cambiar_Estado_Formador" actualiza el campo estado.
function AdminTrainersView() {
  const { trainers, setTrainerStatus } = React.useContext(AppContext);
  const statusPill = (s) => {
    const map = {
      'Activo':    { c: '#16a34a',       bg: '#16a34a15' },
      'En pausa':  { c: COLORS.yellow,   bg: `${COLORS.yellow}22` },
      'Pendiente': { c: COLORS.orange,   bg: `${COLORS.orange}15` },
      'Inactivo':  { c: COLORS.textLight,bg: '#e8eaf0'            },
    };
    const { c, bg } = map[s] || { c: COLORS.textLight, bg: '#eceef4' };
    return React.createElement(Pill, { text: s, color: c, bg });
  };

  return React.createElement('div', null,
    React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 24, fontWeight: 800, color: COLORS.dark, margin: '0 0 4px' } }, 'Formadores'),
    React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight, marginBottom: 20 } },
      trainers.length + ' formadores registrados en la plataforma.'
    ),
    React.createElement('div', { style: { background: '#fff', borderRadius: 14, border: '1px solid #eceef4', overflow: 'hidden' } },
      React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse', borderSpacing: 0 } },
        React.createElement('thead', null,
          React.createElement('tr', { style: { background: '#fafbfc' } },
            ...['Formador/a', 'Especialidad', 'Horas YTD', 'Alta', 'Estado', ''].map(h =>
              React.createElement('th', {
                key: h,
                style: { padding: '12px 16px', textAlign: 'left', fontFamily: 'Lato', fontSize: 10, fontWeight: 700, color: COLORS.textLight, letterSpacing: 1, textTransform: 'uppercase', borderBottom: '1px solid #eceef4' }
              }, h)
            ),
          ),
        ),
        React.createElement('tbody', null,
          ...trainers.map(t => React.createElement('tr', {
            key: t.id,
            style: { borderBottom: '1px solid #f4f5f9' }
          },
            React.createElement('td', { style: { padding: '14px 16px' } },
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
                React.createElement('div', {
                  style: { width: 34, height: 34, borderRadius: 8, background: COLORS.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12, fontFamily: 'Bricolage Grotesque', flexShrink: 0 }
                }, t.name.split(' ').map(n => n[0]).slice(0, 2).join('')),
                React.createElement('div', null,
                  React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, fontWeight: 700, color: COLORS.dark } }, t.name),
                  React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight } }, t.email),
                ),
              ),
            ),
            React.createElement('td', { style: { padding: '14px 16px', fontFamily: 'Lato', fontSize: 12, color: COLORS.text, maxWidth: 220 } }, t.specialty),
            React.createElement('td', { style: { padding: '14px 16px', fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: COLORS.dark } }, t.hoursYTD + 'h'),
            React.createElement('td', { style: { padding: '14px 16px', fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight } }, t.joinDate),
            React.createElement('td', { style: { padding: '14px 16px' } }, statusPill(t.status)),
            React.createElement('td', { style: { padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' } },
              React.createElement('select', {
                value: t.status,
                onChange: e => setTrainerStatus(t.id, e.target.value),
                style: { padding: '6px 10px', borderRadius: 7, border: '1px solid #e4e7ef', fontSize: 11, fontFamily: 'Lato', background: '#fff', cursor: 'pointer', color: COLORS.text }
              },
                ...['Activo', 'En pausa', 'Pendiente', 'Inactivo'].map(s => React.createElement('option', { key: s, value: s }, s))
              ),
            ),
          )),
        ),
      ),
    ),
  );
}

window.AdminLayout = AdminLayout;
