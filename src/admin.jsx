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
  { id: 'inicio',         label: 'Panel admin',      icon: '▤' },
  { id: 'cursos',         label: 'Cursos',           icon: '▦' },
  { id: 'solicitudes',    label: 'Solicitudes',      icon: '◉' },
  { id: 'horas',          label: 'Validar horas',    icon: '◷' },
  { id: 'formadores',     label: 'Formadores',       icon: '◈' },
  { id: 'alumnos',        label: 'Alumnos',          icon: '◌' },
  { id: 'ofertas-empleo', label: 'Ofertas empleo',   icon: '★' },
  { id: 'configuracion',  label: 'Configuración',    icon: '⚙' },
];

// ─── Top Nav (admin) ──────────────────────────────────────────────────────────
function AdminTopNav() {
  const {
    currentView, setCurrentView, user, logout,
    adminNotifications, markAllAdminRead, pendingRequests,
  } = React.useContext(AppContext);
  const [showProfile, setShowProfile] = React.useState(false);
  const [showNotif,   setShowNotif]   = React.useState(false);
  const [showMenu,    setShowMenu]    = React.useState(false);
  const unread = (adminNotifications || []).filter(n => !n.read).length;
  const pending = pendingRequests?.length || 0;
  const vp = window.useViewport ? window.useViewport() : { isSmall: false };
  const isSmall = vp.isSmall;

  const closeAll = () => { setShowProfile(false); setShowNotif(false); setShowMenu(false); };

  return React.createElement('nav', {
    style: {
      position: 'sticky', top: 0, zIndex: 100,
      background: '#0f1020',
      borderBottom: '1px solid #1d1f38',
      padding: isSmall ? '0 14px' : '0 40px', height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }
  },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: isSmall ? 10 : 36 } },
      // Hamburger (móvil/tablet)
      isSmall && React.createElement('button', {
        onClick: () => { setShowMenu(!showMenu); setShowProfile(false); setShowNotif(false); },
        'aria-label': 'Abrir menú',
        style: {
          width: 38, height: 38, borderRadius: 10, background: showMenu ? 'rgba(244,120,9,0.2)' : 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4, padding: 0, position: 'relative',
        },
      },
        React.createElement('span', { style: { width: 16, height: 2, background: '#fff', borderRadius: 2 } }),
        React.createElement('span', { style: { width: 16, height: 2, background: '#fff', borderRadius: 2 } }),
        React.createElement('span', { style: { width: 16, height: 2, background: '#fff', borderRadius: 2 } }),
        pending > 0 && React.createElement('span', {
          style: { position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: COLORS.red, border: '2px solid #0f1020' },
        }),
      ),
      React.createElement('div', {
        style: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' },
        onClick: () => { closeAll(); setCurrentView('inicio'); },
      },
        React.createElement('img', {
          src: 'assets/logotipo-blanco.png', alt: 'CESEA',
          style: { height: isSmall ? 26 : 30, width: 'auto' },
          onError: e => { e.target.style.display = 'none'; },
        }),
        !isSmall && React.createElement('span', {
          style: {
            padding: '3px 9px', borderRadius: 5, background: COLORS.gradient,
            color: '#fff', fontSize: 9.5, fontWeight: 800, letterSpacing: 1,
            fontFamily: 'Bricolage Grotesque', textTransform: 'uppercase',
          }
        }, 'Superadmin'),
      ),
      !isSmall && React.createElement('div', { style: { display: 'flex', gap: 2 } },
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

      // Drawer móvil
      isSmall && showMenu && React.createElement('div', {
        style: { position: 'fixed', top: 64, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.55)', zIndex: 95 },
        onClick: () => setShowMenu(false),
      },
        React.createElement('div', {
          onClick: e => e.stopPropagation(),
          style: { background: '#0f1020', padding: '14px 12px 20px', borderBottom: '1px solid #1d1f38', animation: 'fadeInUp 0.22s ease-out both', boxShadow: '0 12px 32px rgba(0,0,0,0.4)' },
        },
          ...ADMIN_NAV_ITEMS.map(item => {
            const active = currentView === item.id;
            const showBadge = item.id === 'solicitudes' && pending > 0;
            return React.createElement('button', {
              key: item.id,
              onClick: () => { setCurrentView(item.id); setShowMenu(false); },
              style: {
                width: '100%', padding: '13px 14px', borderRadius: 10, border: 'none',
                background: active ? 'rgba(244,120,9,0.18)' : 'transparent',
                color: active ? COLORS.yellow : 'rgba(255,255,255,0.9)',
                fontFamily: 'Lato', fontSize: 14, fontWeight: active ? 700 : 600,
                cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 12,
                marginBottom: 4,
              },
            },
              React.createElement('span', { style: { fontSize: 15, width: 22, textAlign: 'center', opacity: active ? 1 : 0.7 } }, item.icon),
              React.createElement('span', { style: { flex: 1 } }, item.label),
              showBadge && React.createElement('span', {
                style: { padding: '2px 8px', borderRadius: 999, background: COLORS.red, color: '#fff', fontSize: 10, fontWeight: 800, fontFamily: 'Bricolage Grotesque' },
              }, pending),
            );
          }),
        ),
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
  const { currentView, toast } = React.useContext(AppContext);
  // Router admin con fallback: si currentView no coincide, vuelve al dashboard
  const KNOWN = ['inicio', 'cursos', 'solicitudes', 'horas', 'formadores', 'alumnos', 'ofertas-empleo', 'configuracion'];
  const safeView = KNOWN.includes(currentView) ? currentView : 'inicio';
  return React.createElement('div', { style: { minHeight: '100vh', background: '#f6f7fb' } },
    React.createElement(AdminTopNav),
    React.createElement('main', { style: { padding: '28px 40px 56px', maxWidth: 1360, margin: '0 auto' } },
      safeView === 'inicio'         && React.createElement(AdminDashboardView),
      safeView === 'cursos'         && React.createElement(AdminCoursesView),
      safeView === 'solicitudes'    && React.createElement(AdminRequestsView),
      safeView === 'horas'          && React.createElement(AdminHoursView),
      safeView === 'formadores'     && React.createElement(AdminTrainersView),
      safeView === 'alumnos'        && React.createElement(AdminAlumnosView),
      safeView === 'ofertas-empleo' && React.createElement(AdminOfertasView),
      safeView === 'configuracion'  && React.createElement(AdminConfigView),
    ),
    // Toast global (reutiliza el widget)
    toast && window.Toast && React.createElement(window.Toast, { toast }),
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
    // KPI cards (responsive: 4 cols > 2 cols > 1 col)
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 22 } },
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
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 } },
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
  const { courses, createCourse, updateCourse, archiveCourse, bulkUpsertCourses, showToast } = React.useContext(AppContext);
  const [filter, setFilter]         = React.useState('');
  const [areaFilter, setAreaFilter] = React.useState('all');
  const [editing, setEditing]       = React.useState(null); // null | 'new' | {id,...}
  const [csvPreview, setCsvPreview] = React.useState(null); // { rows, created, updated, errors }
  const csvInputRef = React.useRef(null);

  const areas = ['all', ...Array.from(new Set(courses.map(c => c.area)))];
  const filtered = courses.filter(c =>
    (areaFilter === 'all' || c.area === areaFilter) &&
    (!filter || (c.title + ' ' + c.subtitle).toLowerCase().includes(filter.toLowerCase()))
  );

  // FILEMAKER: utilidades CSV (equivalen a Import Records / Export Records).
  const CSV_HEADERS = ['titulo','subtitulo','area','categoria','modalidad','horas','fechas','ubicacion','tipologia','plazas','objetivos','contenidos'];

  // Parser naive que respeta comillas dobles (suficiente para el prototipo).
  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return [];
    const splitLine = (line) => {
      const out = []; let cur = ''; let inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQ = !inQ; continue; }
        if (ch === ',' && !inQ) { out.push(cur); cur = ''; continue; }
        cur += ch;
      }
      out.push(cur);
      return out.map(s => s.trim());
    };
    const headers = splitLine(lines[0]).map(h => h.toLowerCase());
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = splitLine(lines[i]);
      const obj = {};
      headers.forEach((h, idx) => { obj[h] = (cells[idx] || '').trim(); });
      rows.push(obj);
    }
    return rows;
  };

  const csvRowToCourse = (row) => ({
    title:     row.titulo     || '',
    subtitle:  row.subtitulo  || '',
    area:      row.area       || 'Área técnica',
    category:  row.categoria  || '',
    modality:  row.modalidad  || 'Online',
    hours:     parseInt(row.horas, 10) || 8,
    dates:     row.fechas     || '1 enero 2026',
    location:  row.ubicacion  || 'Plataforma Zoom',
    tipologia: row.tipologia  || '',
    students:  parseInt(row.plazas, 10) || 0,
    objectives: row.objetivos || '',
    contents:   row.contenidos || '',
  });

  const onImportFile = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = String(ev.target?.result || '');
        const rows = parseCSV(text).map(csvRowToCourse);
        const errors = [];
        rows.forEach((r, idx) => {
          if (!r.title.trim()) errors.push(`Fila ${idx + 2}: falta título`);
        });
        const valid = rows.filter(r => r.title.trim());
        const existingTitles = new Set(courses.map(c => (c.title || '').trim().toLowerCase()));
        const created = valid.filter(r => !existingTitles.has(r.title.trim().toLowerCase())).length;
        const updated = valid.length - created;
        setCsvPreview({ rows: valid, created, updated, errors });
      } catch (err) {
        showToast('Error al leer el CSV: ' + (err.message || 'formato inválido'), 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // permite re-seleccionar el mismo archivo
  };

  const applyCsvImport = () => {
    if (!csvPreview) return;
    bulkUpsertCourses(csvPreview.rows);
    setCsvPreview(null);
  };

  // Exportar CSV (todos o últimos)
  const escapeCsv = (v) => {
    const s = v == null ? '' : String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const downloadCSV = (rows, filename) => {
    const lines = [CSV_HEADERS.join(',')];
    rows.forEach(c => {
      lines.push([
        c.title, c.subtitle, c.area, c.category, c.modality, c.hours,
        c.dates, c.location, c.tipologia || '', c.students || 0,
        c.objectives || '', c.contents || '',
      ].map(escapeCsv).join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a); }, 100);
  };

  const exportAll = () => {
    const today = new Date().toISOString().slice(0, 10);
    downloadCSV(courses, `cursos_${today}.csv`);
    showToast(`Exportados ${courses.length} cursos`);
  };
  const exportRecent = () => {
    const cutoff = Date.now() - 24 * 3600 * 1000;
    const recent = courses.filter(c => c.createdAt && new Date(c.createdAt).getTime() >= cutoff);
    if (recent.length === 0) { showToast('No hay cursos creados en las últimas 24 horas', 'info'); return; }
    const today = new Date().toISOString().slice(0, 10);
    downloadCSV(recent, `cursos_nuevos_${today}.csv`);
    showToast(`Exportados ${recent.length} cursos nuevos`);
  };
  const downloadTemplate = () => {
    downloadCSV([{ title: 'Título ejemplo', subtitle: 'Breve descripción', area: 'Área técnica', category: 'Movilizaciones', modality: 'Presencial', hours: 8, dates: '15, 16 Junio 2026', location: 'Madrid', tipologia: 'Movilizaciones seguras', students: 0, objectives: '', contents: '' }], 'plantilla_cursos.csv');
  };

  return React.createElement('div', null,
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 12 } },
      React.createElement('div', null,
        React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 24, fontWeight: 800, color: COLORS.dark, margin: '0 0 4px' } }, 'Gestión de cursos'),
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight } },
          courses.length + ' cursos en catálogo · crea, edita, importa/exporta CSV.'
        ),
      ),
      React.createElement('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
        React.createElement('button', {
          onClick: () => setEditing('new'),
          style: { padding: '10px 16px', borderRadius: 9, border: 'none', background: COLORS.gradient, color: '#fff', fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: 12, cursor: 'pointer', boxShadow: '0 4px 18px rgba(244,120,9,0.24)' }
        }, '+ Nuevo curso'),
        React.createElement('button', {
          onClick: () => csvInputRef.current?.click(),
          style: { padding: '10px 14px', borderRadius: 9, border: `1px solid ${COLORS.cyan}40`, background: `${COLORS.cyan}0d`, color: COLORS.cyan, fontFamily: 'Lato', fontWeight: 800, fontSize: 12, cursor: 'pointer' }
        }, '⬆ Importar CSV'),
        React.createElement('input', { ref: csvInputRef, type: 'file', accept: '.csv', style: { display: 'none' }, onChange: onImportFile }),
        React.createElement('button', {
          onClick: exportAll,
          style: { padding: '10px 14px', borderRadius: 9, border: '1px solid #e4e7ef', background: '#fff', color: COLORS.text, fontFamily: 'Lato', fontWeight: 800, fontSize: 12, cursor: 'pointer' }
        }, '⬇ Exportar CSV'),
        React.createElement('button', {
          onClick: exportRecent,
          title: 'Cursos creados en las últimas 24 horas',
          style: { padding: '10px 14px', borderRadius: 9, border: '1px solid #e4e7ef', background: '#fff', color: COLORS.text, fontFamily: 'Lato', fontWeight: 800, fontSize: 12, cursor: 'pointer' }
        }, '⬇ Últimos subidos'),
        React.createElement('button', {
          onClick: downloadTemplate,
          style: { padding: '10px 14px', borderRadius: 9, border: '1px solid #e4e7ef', background: '#fff', color: COLORS.textLight, fontFamily: 'Lato', fontWeight: 600, fontSize: 12, cursor: 'pointer' }
        }, '⬇ Plantilla'),
      ),
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
    React.createElement('div', { style: { background: '#fff', borderRadius: 14, border: '1px solid #eceef4', overflowX: 'auto', WebkitOverflowScrolling: 'touch' } },
      React.createElement('table', { style: { width: '100%', minWidth: 560, borderCollapse: 'collapse', borderSpacing: 0 } },
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

    // ── Modal de preview CSV ─────────────────────────────────────────────────
    // FILEMAKER: Pre-visualización de Import Records. Permite confirmar antes de
    //   comitear los nuevos registros. Script "Import_Cursos_CSV" con show field
    //   mapping = yes y confirmation = yes.
    csvPreview && React.createElement('div', {
      style: { position: 'fixed', inset: 0, background: 'rgba(15,16,32,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: 20 },
      onClick: e => { if (e.target === e.currentTarget) setCsvPreview(null); },
    },
      React.createElement('div', {
        style: { background: '#fff', borderRadius: 16, width: '100%', maxWidth: 760, maxHeight: '90vh', overflowY: 'auto', padding: 28, boxShadow: '0 30px 80px rgba(0,0,0,0.3)' },
      },
        React.createElement('h2', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 20, fontWeight: 800, color: COLORS.dark, margin: '0 0 6px' } }, 'Previsualización de importación'),
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight, marginBottom: 16 } },
          React.createElement('b', { style: { color: '#16a34a' } }, csvPreview.created), ' cursos nuevos · ',
          React.createElement('b', { style: { color: COLORS.orange } }, csvPreview.updated), ' actualizados',
          csvPreview.errors.length > 0 && React.createElement('span', { style: { color: COLORS.red } }, ' · ', csvPreview.errors.length, ' errores'),
        ),
        csvPreview.errors.length > 0 && React.createElement('div', {
          style: { marginBottom: 14, padding: 10, background: `${COLORS.red}0d`, border: `1px solid ${COLORS.red}30`, borderRadius: 8, fontFamily: 'Lato', fontSize: 11, color: COLORS.red },
        },
          ...csvPreview.errors.map((err, i) => React.createElement('div', { key: i }, '• ', err)),
        ),
        React.createElement('div', { style: { maxHeight: 360, overflowY: 'auto', border: '1px solid #eceef4', borderRadius: 10 } },
          React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse' } },
            React.createElement('thead', null,
              React.createElement('tr', { style: { background: '#fafbfc' } },
                ...['#', 'Título', 'Área', 'Modalidad', 'Horas', 'Acción'].map(h =>
                  React.createElement('th', { key: h, style: { padding: '10px 12px', textAlign: 'left', fontFamily: 'Lato', fontSize: 10, fontWeight: 700, color: COLORS.textLight, letterSpacing: 0.8, textTransform: 'uppercase', borderBottom: '1px solid #eceef4' } }, h),
                ),
              ),
            ),
            React.createElement('tbody', null,
              ...csvPreview.rows.map((r, idx) => {
                const exists = courses.some(c => (c.title || '').trim().toLowerCase() === r.title.trim().toLowerCase());
                return React.createElement('tr', { key: idx, style: { borderTop: '1px solid #f4f5f9' } },
                  React.createElement('td', { style: { padding: '10px 12px', fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight } }, idx + 1),
                  React.createElement('td', { style: { padding: '10px 12px', fontFamily: 'Lato', fontSize: 12, color: COLORS.dark, fontWeight: 700, maxWidth: 320, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, r.title),
                  React.createElement('td', { style: { padding: '10px 12px', fontFamily: 'Lato', fontSize: 11, color: COLORS.text } }, r.area),
                  React.createElement('td', { style: { padding: '10px 12px', fontFamily: 'Lato', fontSize: 11, color: COLORS.text } }, r.modality),
                  React.createElement('td', { style: { padding: '10px 12px', fontFamily: 'Lato', fontSize: 11, color: COLORS.text } }, r.hours + 'h'),
                  React.createElement('td', { style: { padding: '10px 12px' } },
                    React.createElement('span', { style: { padding: '3px 8px', borderRadius: 5, fontFamily: 'Lato', fontSize: 10, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', background: exists ? `${COLORS.orange}15` : '#16a34a20', color: exists ? COLORS.orange : '#16a34a' } }, exists ? 'Actualizar' : 'Nuevo'),
                  ),
                );
              }),
            ),
          ),
        ),
        React.createElement('div', { style: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 } },
          React.createElement('button', { onClick: () => setCsvPreview(null), style: { padding: '10px 18px', borderRadius: 9, border: '1px solid #e4e7ef', background: '#fff', color: COLORS.text, fontFamily: 'Lato', fontSize: 13, fontWeight: 700, cursor: 'pointer' } }, 'Cancelar'),
          React.createElement('button', { onClick: applyCsvImport, style: { padding: '10px 20px', borderRadius: 9, border: 'none', background: COLORS.gradient, color: '#fff', fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 800, cursor: 'pointer' } }, 'Confirmar importación'),
        ),
      ),
    ),
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
// FILEMAKER: AdminRequestsView agrupa las solicitudes por Cursos::titulo para
//   que el superadmin vea a todos los formadores que han pedido la misma
//   propuesta y los apruebe/rechace individualmente. Equivale a sort ascending
//   por id_curso con encabezado de grupo (GetSummary).
function AdminRequestsView() {
  const { pendingRequests, approveRequest, rejectRequest, trainers } = React.useContext(AppContext);
  const typeMeta = {
    change:      { label: 'Cambio de curso',   color: COLORS.orange  },
    new:         { label: 'Aceptación',        color: '#16a34a'      },
    hours:       { label: 'Reporte de horas',  color: COLORS.yellow  },
    register:    { label: 'Alta de formador',  color: COLORS.cyan    },
    proposal:    { label: 'Propuesta nueva',   color: COLORS.pink    },
    incidencia:  { label: 'Incidencia',        color: COLORS.red     },
  };

  const [typeFilter, setTypeFilter] = React.useState('all');

  const filtered = typeFilter === 'all'
    ? pendingRequests
    : pendingRequests.filter(r => r.type === typeFilter);

  // Agrupar por courseTitle (las register se agrupan en "Otras solicitudes")
  const groups = {};
  filtered.forEach(r => {
    const key = (r.courseTitle && r.courseTitle !== '—') ? r.courseTitle : '__other__';
    groups[key] = groups[key] || [];
    groups[key].push(r);
  });

  const findTrainer = (r) =>
    (trainers || []).find(t => t.id === r.trainerId || t.name === r.trainer) || null;

  const renderRating = (trainer) => trainer && trainer.rating > 0
    ? React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'Lato', fontSize: 11, color: COLORS.yellow, fontWeight: 800 } },
        '★ ', trainer.rating.toFixed(1),
        React.createElement('span', { style: { color: COLORS.textLight, fontWeight: 600, marginLeft: 2 } }, `(trust ${trainer.trustScore || 0}%)`),
      )
    : React.createElement('span', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, fontStyle: 'italic' } }, 'sin valoración');

  const renderTarifa = (r, trainer) => {
    const h = r.rate || trainer?.tarifaVentaDirecta;
    return h ? React.createElement('span', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, fontWeight: 700 } }, h + ' €/h') : null;
  };

  return React.createElement('div', null,
    React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 24, fontWeight: 800, color: COLORS.dark, margin: '0 0 4px' } }, 'Solicitudes pendientes'),
    React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight, marginBottom: 16 } },
      filtered.length + ' solicitudes agrupadas por curso/propuesta.'
    ),

    // Chips tipo filtro
    React.createElement('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 } },
      ...[{ id: 'all', label: 'Todas', color: COLORS.textLight }, ...Object.entries(typeMeta).map(([id, m]) => ({ id, label: m.label, color: m.color }))].map(f =>
        React.createElement('button', {
          key: f.id,
          onClick: () => setTypeFilter(f.id),
          style: {
            padding: '6px 12px', borderRadius: 8,
            border: `1px solid ${typeFilter === f.id ? f.color : '#e4e7ef'}`,
            background: typeFilter === f.id ? `${f.color}10` : '#fff',
            color: typeFilter === f.id ? f.color : COLORS.text,
            fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato',
          },
        }, f.label),
      ),
    ),

    filtered.length === 0
      ? React.createElement('div', {
          style: { padding: 60, textAlign: 'center', background: '#fff', borderRadius: 14, border: '1px solid #eceef4' }
        },
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 40, marginBottom: 10 } }, '✓'),
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 16, fontWeight: 700, color: COLORS.dark, marginBottom: 4 } }, 'Todo al día'),
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight } }, 'No hay solicitudes en este filtro.'),
        )
      : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
          ...Object.entries(groups).map(([groupKey, rows]) => {
            const isOther = groupKey === '__other__';
            return React.createElement('div', {
              key: groupKey,
              style: { background: '#fff', borderRadius: 14, border: '1px solid #eceef4', overflow: 'hidden' },
            },
              // Cabecera del grupo
              React.createElement('div', {
                style: { padding: '14px 20px', borderBottom: '1px solid #f0f1f5', display: 'flex', alignItems: 'center', gap: 10, background: '#fafbfc' },
              },
                React.createElement('span', { style: { fontFamily: 'Lato', fontSize: 10, color: COLORS.orange, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' } }, isOther ? 'Otras solicitudes' : 'Propuesta'),
                React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 15, fontWeight: 800, color: COLORS.dark, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } },
                  isOther ? 'Altas, reportes de horas y otros' : groupKey,
                ),
                React.createElement('span', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, fontWeight: 700 } }, rows.length + ' formador' + (rows.length === 1 ? '' : 'es')),
              ),
              // Rows de formadores
              React.createElement('div', { style: { display: 'flex', flexDirection: 'column' } },
                ...rows.map((r, idx) => {
                  const m = typeMeta[r.type] || { label: r.type, color: COLORS.textLight };
                  const trainer = findTrainer(r);
                  return React.createElement('div', {
                    key: r.id,
                    style: {
                      padding: '14px 20px',
                      borderTop: idx === 0 ? 'none' : '1px solid #f4f5f9',
                      display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                    },
                  },
                    React.createElement('div', { style: { flex: 1, minWidth: 200 } },
                      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' } },
                        React.createElement(Pill, { text: m.label, color: m.color, bg: `${m.color}15` }),
                        React.createElement('span', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight } }, r.date),
                      ),
                      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } },
                        React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: COLORS.dark } }, r.trainer),
                        renderRating(trainer),
                        renderTarifa(r, trainer),
                      ),
                      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, marginTop: 4 } }, r.detail),
                      r.proposedDates && React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.orange, fontWeight: 700, marginTop: 4 } }, '📅 Fechas propuestas: ', r.proposedDates),
                      r.type === 'proposal' && (r.objectives || r.contents) && React.createElement('div', { style: { marginTop: 8, padding: '8px 10px', background: '#fafbfc', borderLeft: `3px solid ${COLORS.pink}`, borderRadius: 6, fontFamily: 'Lato', fontSize: 11, color: COLORS.text } },
                        r.objectives && React.createElement('div', null, React.createElement('b', null, 'Objetivos: '), r.objectives.slice(0, 160), r.objectives.length > 160 ? '…' : ''),
                        r.contents && React.createElement('div', { style: { marginTop: 4 } }, React.createElement('b', null, 'Contenidos: '), r.contents.slice(0, 160), r.contents.length > 160 ? '…' : ''),
                      ),
                    ),
                    React.createElement('div', { style: { display: 'flex', gap: 8, flexShrink: 0 } },
                      React.createElement('button', {
                        onClick: () => rejectRequest(r.id),
                        style: { padding: '8px 14px', borderRadius: 8, border: `1px solid ${COLORS.red}30`, background: '#fff', color: COLORS.red, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato' }
                      }, 'Rechazar'),
                      React.createElement('button', {
                        onClick: () => approveRequest(r.id),
                        style: { padding: '8px 16px', borderRadius: 8, border: 'none', background: COLORS.gradient, color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'Bricolage Grotesque', letterSpacing: 0.3 }
                      }, 'Aprobar'),
                    ),
                  );
                }),
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
  const { hoursLog, validateHours, rejectHours, courses, bitacoras, attendance, tasks, pendingRequests, closedExpedientes, closeExpediente, returnExpediente } = React.useContext(AppContext);
  const [mode, setMode]     = React.useState('list'); // 'list' | 'expedientes'
  const [filter, setFilter] = React.useState('all');
  const [openExp, setOpenExp] = React.useState(null); // courseId
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

  // FILEMAKER: Listado de cursos finalizados (status="completed") para el modo
  //   expediente. Cada expediente agrega bitácora, asistencia, tareas e incidencias.
  const finishedCourses = (courses || []).filter(c => c.status === 'completed' || c.status === 'accepted');
  const openCourse = finishedCourses.find(c => c.id === openExp);
  const isExpClosed = (cid) => (closedExpedientes || []).some(e => e.courseId === cid && e.status === 'cerrado');

  return React.createElement('div', null,
    React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 24, fontWeight: 800, color: COLORS.dark, margin: '0 0 4px' } }, 'Validación de horas impartidas'),
    React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight, marginBottom: 16 } }, 'Revisa las horas reportadas o abre el expediente completo del curso.'),

    // Toggle modo
    React.createElement('div', { style: { display: 'inline-flex', gap: 4, marginBottom: 16, padding: 4, background: '#f4f5f9', borderRadius: 9 } },
      ...[{ id: 'list', label: '≡ Listado' }, { id: 'expedientes', label: '▦ Expedientes' }].map(m => React.createElement('button', {
        key: m.id,
        onClick: () => setMode(m.id),
        style: {
          padding: '7px 16px', borderRadius: 6, border: 'none',
          background: mode === m.id ? '#fff' : 'transparent',
          color: mode === m.id ? COLORS.orange : COLORS.textLight,
          fontFamily: 'Lato', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          boxShadow: mode === m.id ? '0 1px 3px rgba(18,20,35,0.08)' : 'none',
        },
      }, m.label)),
    ),

    mode === 'list' && React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' } },
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

    mode === 'expedientes' && React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12, marginBottom: 18 } },
      ...finishedCourses.map(c => {
        const sessions = (bitacoras || []).filter(b => b.courseId === c.id);
        const totalHours = sessions.reduce((s, b) => {
          const parseT = (t) => { const [h, m = '00'] = (t || '').split(':'); return parseInt(h, 10) + (parseInt(m, 10) || 0) / 60; };
          const dur = parseT(b.timeTo) - parseT(b.timeFrom);
          return s + (isNaN(dur) ? 0 : dur);
        }, 0);
        const closed = isExpClosed(c.id);
        return React.createElement('div', {
          key: c.id,
          onClick: () => setOpenExp(c.id),
          style: {
            background: '#fff', border: `1px solid ${closed ? '#16a34a40' : '#eceef4'}`, borderRadius: 12, padding: 16,
            cursor: 'pointer', transition: 'transform 0.18s, box-shadow 0.18s',
            boxShadow: '0 1px 3px rgba(18,20,35,0.04)',
          },
          onMouseEnter: e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(18,20,35,0.08)'; },
          onMouseLeave: e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(18,20,35,0.04)'; },
        },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 } },
            React.createElement('span', { style: { padding: '3px 9px', borderRadius: 5, background: closed ? '#16a34a18' : `${COLORS.lavender}18`, color: closed ? '#16a34a' : COLORS.lavender, fontSize: 10, fontWeight: 800, fontFamily: 'Lato', textTransform: 'uppercase', letterSpacing: 0.6 } }, closed ? 'Cerrado' : (c.status === 'completed' ? 'Finalizado' : 'En curso')),
            React.createElement('span', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight } }, sessions.length, ' sesion', sessions.length === 1 ? '' : 'es'),
          ),
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: COLORS.dark, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 36 } }, c.title),
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, marginTop: 6 } }, c.instructor, ' · ', c.dates),
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.text, marginTop: 4, fontWeight: 700 } }, totalHours.toFixed(1), ' h impartidas'),
        );
      }),
      finishedCourses.length === 0 && React.createElement('div', { style: { gridColumn: '1 / -1', padding: 40, textAlign: 'center', fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight, background: '#fff', border: '1px dashed #e4e7ef', borderRadius: 12 } }, 'No hay cursos finalizados para revisar.'),
    ),

    mode === 'list' &&
    React.createElement('div', { style: { background: '#fff', borderRadius: 14, border: '1px solid #eceef4', overflowX: 'auto', WebkitOverflowScrolling: 'touch' } },
      React.createElement('table', { style: { width: '100%', minWidth: 560, borderCollapse: 'collapse', borderSpacing: 0 } },
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

    // ── Drawer de Expediente ──────────────────────────────────────────────
    openCourse && React.createElement(ExpedienteDrawer, {
      course: openCourse,
      bitacora: (bitacoras || []).filter(b => b.courseId === openCourse.id),
      attendance: (attendance || []).filter(a => a.courseId === openCourse.id),
      tasks: (tasks || []).filter(t => t.courseId === openCourse.id || (t.title || '').toLowerCase().includes((openCourse.title || '').toLowerCase().slice(0, 20))),
      incidencias: (pendingRequests || []).filter(r => r.type === 'incidencia' && (r.courseId === openCourse.id || r.courseTitle === openCourse.title)),
      closed: isExpClosed(openCourse.id),
      onClose: () => setOpenExp(null),
      onCloseExp: (note) => { closeExpediente(openCourse.id, note); setOpenExp(null); },
      onReturn: (note) => { returnExpediente(openCourse.id, note); setOpenExp(null); },
    }),
  );
}

// FILEMAKER: Layout "Admin_Expediente_Curso" con portales anidados a Sesiones,
//   Bitacora, Asistencia, Tareas_Firmadas e Incidencias. Scripts
//   "Cerrar_Expediente" y "Devolver_Expediente_Formador".
function ExpedienteDrawer({ course, bitacora, attendance, tasks, incidencias, closed, onClose, onCloseExp, onReturn }) {
  const [note, setNote] = React.useState('');
  const [sessionStates, setSessionStates] = React.useState(
    (bitacora || []).reduce((acc, b) => { acc[b.id] = 'Validado'; return acc; }, {})
  );
  const setSess = (id, st) => setSessionStates(prev => ({ ...prev, [id]: st }));
  const totalHours = (bitacora || []).reduce((s, b) => {
    const p = (t) => { const [h, m = '00'] = (t || '').split(':'); return parseInt(h, 10) + (parseInt(m, 10) || 0) / 60; };
    const d = p(b.timeTo) - p(b.timeFrom);
    return s + (isNaN(d) ? 0 : d);
  }, 0);

  return React.createElement('div', {
    style: { position: 'fixed', inset: 0, background: 'rgba(15,16,32,0.44)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end', zIndex: 300 },
    onClick: e => { if (e.target === e.currentTarget) onClose(); },
  },
    React.createElement('div', {
      style: { width: '100%', maxWidth: 640, background: '#fff', height: '100%', overflowY: 'auto', boxShadow: '-18px 0 50px rgba(15,16,32,0.22)', padding: 26 },
    },
      // Header
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 } },
        React.createElement('div', null,
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 10, color: COLORS.orange, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 } }, 'Expediente del curso'),
          React.createElement('h2', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 18, fontWeight: 800, color: COLORS.dark, margin: 0, lineHeight: 1.3 } }, course.title),
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, marginTop: 4 } },
            course.instructor, ' · ', course.dates, ' · ', course.modality,
            closed && React.createElement('span', { style: { marginLeft: 8, padding: '2px 8px', borderRadius: 5, background: '#16a34a18', color: '#16a34a', fontSize: 10, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase' } }, 'Cerrado'),
          ),
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.text, marginTop: 6, fontWeight: 700 } }, 'Total impartido: ', totalHours.toFixed(1), ' horas'),
        ),
        React.createElement('button', { onClick: onClose, style: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: COLORS.textLight, lineHeight: 1 } }, '✕'),
      ),

      // Sesiones
      React.createElement('h3', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 800, color: COLORS.dark, margin: '12px 0 10px', textTransform: 'uppercase', letterSpacing: 0.8 } }, 'Sesiones impartidas'),
      (bitacora || []).length === 0
        ? React.createElement('div', { style: { padding: 16, fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, background: '#fafbfc', borderRadius: 10, border: '1px dashed #e4e7ef', marginBottom: 18 } }, 'Sin sesiones registradas en bitácora para este curso.')
        : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 } },
            ...bitacora.map(b => React.createElement('div', {
              key: b.id,
              style: { background: '#fafbfc', border: '1px solid #eceef4', borderRadius: 10, padding: '12px 14px' },
            },
              React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
                React.createElement('div', null,
                  React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 800, color: COLORS.dark } }, b.sessionDate, ' · ', b.timeFrom, '-', b.timeTo),
                  React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, marginTop: 2 } }, 'Asistencia: ', b.present, '/', b.total),
                ),
                React.createElement('div', { style: { display: 'flex', gap: 6 } },
                  React.createElement('button', {
                    onClick: () => setSess(b.id, 'Validado'),
                    style: { padding: '5px 10px', borderRadius: 6, border: 'none', background: sessionStates[b.id] === 'Validado' ? '#16a34a' : '#fff', color: sessionStates[b.id] === 'Validado' ? '#fff' : '#16a34a', fontSize: 10, fontWeight: 800, cursor: 'pointer', fontFamily: 'Lato', borderWidth: 1, borderStyle: 'solid', borderColor: '#16a34a' },
                  }, '✓ Validar'),
                  React.createElement('button', {
                    onClick: () => setSess(b.id, 'Rechazado'),
                    style: { padding: '5px 10px', borderRadius: 6, background: sessionStates[b.id] === 'Rechazado' ? COLORS.red : '#fff', color: sessionStates[b.id] === 'Rechazado' ? '#fff' : COLORS.red, fontSize: 10, fontWeight: 800, cursor: 'pointer', fontFamily: 'Lato', border: `1px solid ${COLORS.red}` },
                  }, '✕ Rechazar'),
                ),
              ),
              b.notes && React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.text, marginTop: 8, lineHeight: 1.5 } },
                React.createElement('b', null, 'Notas: '), b.notes,
              ),
              b.incidents && React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.orange, marginTop: 6, lineHeight: 1.5 } },
                React.createElement('b', null, '⚠ Incidencias sesión: '), b.incidents,
              ),
            )),
          ),

      // Incidencias
      React.createElement('h3', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 800, color: COLORS.dark, margin: '12px 0 10px', textTransform: 'uppercase', letterSpacing: 0.8 } }, 'Incidencias asociadas'),
      (incidencias || []).length === 0
        ? React.createElement('div', { style: { padding: 12, fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, background: '#f4fdf6', borderRadius: 10, border: '1px solid #d4e8d9', marginBottom: 18 } }, 'Sin incidencias reportadas para este curso.')
        : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 } },
            ...incidencias.map(i => React.createElement('div', {
              key: i.id,
              style: { background: `${COLORS.red}0a`, border: `1px solid ${COLORS.red}30`, borderRadius: 10, padding: '10px 14px' },
            },
              React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.red, fontWeight: 800, marginBottom: 3 } }, i.incidenciaType || 'Incidencia', ' · ', i.date),
              React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.text, lineHeight: 1.4 } }, i.description || i.detail),
            )),
          ),

      // Asistencia / tareas (resumen)
      React.createElement('h3', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 800, color: COLORS.dark, margin: '12px 0 10px', textTransform: 'uppercase', letterSpacing: 0.8 } }, 'Material complementario'),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 } },
        React.createElement('div', { style: { padding: 12, background: '#fafbfc', border: '1px solid #eceef4', borderRadius: 10 } },
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 10, color: COLORS.textLight, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 } }, 'Asistencia'),
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 16, fontWeight: 800, color: COLORS.dark } }, (attendance || []).length, ' sesiones registradas'),
        ),
        React.createElement('div', { style: { padding: 12, background: '#fafbfc', border: '1px solid #eceef4', borderRadius: 10 } },
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 10, color: COLORS.textLight, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 } }, 'Tareas/firmas'),
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 16, fontWeight: 800, color: COLORS.dark } }, (tasks || []).length),
        ),
      ),

      // Acciones finales
      !closed && React.createElement('div', { style: { paddingTop: 16, borderTop: '1px solid #eceef4' } },
        React.createElement('label', { style: { fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, display: 'block', marginBottom: 4 } }, 'Observaciones'),
        React.createElement('textarea', {
          value: note, onChange: e => setNote(e.target.value),
          placeholder: 'Nota para cerrar o devolver al formador…',
          style: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e4e7ef', fontSize: 13, fontFamily: 'Lato', outline: 'none', minHeight: 70, resize: 'vertical', boxSizing: 'border-box' },
        }),
        React.createElement('div', { style: { display: 'flex', gap: 10, marginTop: 12, justifyContent: 'flex-end' } },
          React.createElement('button', {
            onClick: () => onReturn(note),
            style: { padding: '10px 18px', borderRadius: 9, border: `1px solid ${COLORS.orange}40`, background: '#fff', color: COLORS.orange, fontFamily: 'Lato', fontSize: 13, fontWeight: 800, cursor: 'pointer' },
          }, '⚠ Devolver al formador'),
          React.createElement('button', {
            onClick: () => onCloseExp(note),
            style: { padding: '10px 20px', borderRadius: 9, border: 'none', background: '#16a34a', color: '#fff', fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 800, cursor: 'pointer' },
          }, '✓ Cerrar expediente'),
        ),
      ),
      closed && React.createElement('div', { style: { padding: 14, background: '#16a34a12', border: '1px solid #16a34a40', borderRadius: 10, fontFamily: 'Lato', fontSize: 12, color: '#166534' } },
        'Expediente cerrado — todas las horas han sido validadas.'
      ),
    ),
  );
}

// ─── Trainers ─────────────────────────────────────────────────────────────────
// FILEMAKER: Layout "Admin_Formadores". Tabla Formadores. Script
//   "Cambiar_Estado_Formador" actualiza el campo estado.
// FILEMAKER: Layout "Admin_Formadores". Tabla con portal al detalle del
//   formador (TrainerProfileDrawer). Las tarifas se editan aquí — el formador
//   sólo las ve en read-only.
function AdminTrainersView() {
  const { trainers, setTrainerStatus, updateTrainer, tipologias, addTipologia, courses } = React.useContext(AppContext);
  const [openId, setOpenId] = React.useState(null);
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

  const openTrainer = trainers.find(t => t.id === openId);

  return React.createElement('div', null,
    React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 24, fontWeight: 800, color: COLORS.dark, margin: '0 0 4px' } }, 'Formadores'),
    React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight, marginBottom: 20 } },
      trainers.length + ' formadores registrados. Haz clic en una fila para editar sus tarifas, tipologías y asignaciones.'
    ),
    React.createElement('div', { style: { background: '#fff', borderRadius: 14, border: '1px solid #eceef4', overflowX: 'auto', WebkitOverflowScrolling: 'touch' } },
      React.createElement('table', { style: { width: '100%', minWidth: 820, borderCollapse: 'collapse', borderSpacing: 0 } },
        React.createElement('thead', null,
          React.createElement('tr', { style: { background: '#fafbfc' } },
            ...['Formador/a', 'Especialidad', 'Valoración', 'Tarifa directa', 'Horas YTD', 'Estado', ''].map(h =>
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
            onClick: () => setOpenId(t.id),
            style: { borderBottom: '1px solid #f4f5f9', cursor: 'pointer' },
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
            React.createElement('td', { style: { padding: '14px 16px' } },
              t.rating > 0
                ? React.createElement('div', null,
                    React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: COLORS.yellow } }, '★ ' + t.rating.toFixed(1)),
                    React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 10, color: COLORS.textLight } }, 'trust ', t.trustScore || 0, '%'),
                  )
                : React.createElement('span', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, fontStyle: 'italic' } }, '—'),
            ),
            React.createElement('td', { style: { padding: '14px 16px', fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 800, color: COLORS.dark } }, t.tarifaVentaDirecta ? t.tarifaVentaDirecta + ' €/h' : '—'),
            React.createElement('td', { style: { padding: '14px 16px', fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: COLORS.dark } }, t.hoursYTD + 'h'),
            React.createElement('td', { style: { padding: '14px 16px' } }, statusPill(t.status)),
            React.createElement('td', { style: { padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' } },
              React.createElement('button', {
                onClick: e => { e.stopPropagation(); setOpenId(t.id); },
                style: { padding: '6px 12px', borderRadius: 7, border: '1px solid #e4e7ef', background: '#fff', fontSize: 11, fontFamily: 'Lato', cursor: 'pointer', color: COLORS.text, fontWeight: 700 },
              }, 'Editar'),
            ),
          )),
        ),
      ),
    ),

    // Drawer perfil formador
    openTrainer && React.createElement(TrainerProfileDrawer, {
      trainer: openTrainer,
      onClose: () => setOpenId(null),
      onUpdate: (patch) => updateTrainer(openTrainer.id, patch),
      onStatus: (status) => setTrainerStatus(openTrainer.id, status),
      tipologias: tipologias || [],
      onAddTipologia: addTipologia,
      courses,
    }),
  );
}

// ─── Drawer de perfil del formador (superadmin edit) ─────────────────────────
// FILEMAKER: Layout "Admin_Formador_Detalle". Edita tarifa_venta_directa,
//   tarifa_venta_indirecta, tarifa_km, tipologias (multi-valor) y cursos_asignados.
function TrainerProfileDrawer({ trainer, onClose, onUpdate, onStatus, tipologias, onAddTipologia, courses }) {
  const [form, setForm] = React.useState({
    tarifaVentaDirecta:   trainer.tarifaVentaDirecta   || 0,
    tarifaVentaIndirecta: trainer.tarifaVentaIndirecta || 0,
    tarifaKm:             trainer.tarifaKm             || 0,
    rating:               trainer.rating               || 0,
    trustScore:           trainer.trustScore           || 0,
    tipologias:           trainer.tipologias           || [],
    cursosAsignados:      trainer.cursosAsignados      || [],
  });
  const [newTipologia, setNewTipologia] = React.useState('');

  const inp = { padding: '9px 12px', borderRadius: 8, border: '1px solid #e4e7ef', fontSize: 13, fontFamily: 'Lato', outline: 'none', width: '100%', boxSizing: 'border-box', color: COLORS.dark, background: '#fff' };

  const toggleTipologia = (t) => setForm(prev => ({
    ...prev,
    tipologias: prev.tipologias.includes(t) ? prev.tipologias.filter(x => x !== t) : [...prev.tipologias, t],
  }));
  const toggleCurso = (id) => setForm(prev => ({
    ...prev,
    cursosAsignados: prev.cursosAsignados.includes(id) ? prev.cursosAsignados.filter(x => x !== id) : [...prev.cursosAsignados, id],
  }));

  const save = () => {
    onUpdate({
      tarifaVentaDirecta:   parseFloat(form.tarifaVentaDirecta)   || 0,
      tarifaVentaIndirecta: parseFloat(form.tarifaVentaIndirecta) || 0,
      tarifaKm:             parseFloat(form.tarifaKm)             || 0,
      rating:               parseFloat(form.rating)               || 0,
      trustScore:           parseInt(form.trustScore, 10)         || 0,
      tipologias:           form.tipologias,
      cursosAsignados:      form.cursosAsignados,
    });
    onClose();
  };

  return React.createElement('div', {
    style: { position: 'fixed', inset: 0, background: 'rgba(15,16,32,0.44)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end', zIndex: 300 },
    onClick: e => { if (e.target === e.currentTarget) onClose(); },
  },
    React.createElement('div', {
      style: { width: '100%', maxWidth: 540, background: '#fff', height: '100%', overflowY: 'auto', boxShadow: '-18px 0 50px rgba(15,16,32,0.22)', padding: 26 },
    },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 } },
        React.createElement('div', null,
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 10, color: COLORS.orange, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' } }, 'Perfil de formador'),
          React.createElement('h2', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 20, fontWeight: 800, color: COLORS.dark, margin: '2px 0 0' } }, trainer.name),
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight } }, trainer.email, ' · ', trainer.specialty),
        ),
        React.createElement('button', { onClick: onClose, style: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: COLORS.textLight, lineHeight: 1 } }, '✕'),
      ),

      // Estado
      React.createElement('div', { style: { marginBottom: 18 } },
        React.createElement('label', { style: { fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, display: 'block', marginBottom: 4 } }, 'Estado'),
        React.createElement('select', { style: { ...inp, cursor: 'pointer' }, value: trainer.status, onChange: e => onStatus(e.target.value) },
          ...['Activo', 'En pausa', 'Pendiente', 'Inactivo'].map(s => React.createElement('option', { key: s, value: s }, s)),
        ),
      ),

      // Tarifas
      React.createElement('h3', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: COLORS.dark, margin: '4px 0 10px', textTransform: 'uppercase', letterSpacing: 0.8 } }, 'Tarifas'),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 } },
        ...[
          { key: 'tarifaVentaDirecta',   label: 'Venta directa (€/h)' },
          { key: 'tarifaVentaIndirecta', label: 'Venta indirecta (€/h)' },
          { key: 'tarifaKm',             label: 'Kilometraje (€/km)' },
        ].map(f => React.createElement('div', { key: f.key },
          React.createElement('label', { style: { fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, display: 'block', marginBottom: 4 } }, f.label),
          React.createElement('input', { type: 'number', step: '0.01', style: inp, value: form[f.key], onChange: e => setForm(p => ({ ...p, [f.key]: e.target.value })) }),
        )),
      ),

      // Valoración / trust
      React.createElement('h3', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: COLORS.dark, margin: '4px 0 10px', textTransform: 'uppercase', letterSpacing: 0.8 } }, 'Valoración'),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 } },
        React.createElement('div', null,
          React.createElement('label', { style: { fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, display: 'block', marginBottom: 4 } }, 'Rating (0-5)'),
          React.createElement('input', { type: 'number', step: '0.1', min: 0, max: 5, style: inp, value: form.rating, onChange: e => setForm(p => ({ ...p, rating: e.target.value })) }),
        ),
        React.createElement('div', null,
          React.createElement('label', { style: { fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, display: 'block', marginBottom: 4 } }, 'Trust score (%)'),
          React.createElement('input', { type: 'number', min: 0, max: 100, style: inp, value: form.trustScore, onChange: e => setForm(p => ({ ...p, trustScore: e.target.value })) }),
        ),
      ),

      // Tipologías
      React.createElement('h3', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: COLORS.dark, margin: '4px 0 10px', textTransform: 'uppercase', letterSpacing: 0.8 } }, 'Tipologías que imparte'),
      React.createElement('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 } },
        ...(tipologias || []).map(t => {
          const on = form.tipologias.includes(t);
          return React.createElement('button', {
            key: t, type: 'button',
            onClick: () => toggleTipologia(t),
            style: {
              padding: '6px 10px', borderRadius: 7,
              border: `1px solid ${on ? COLORS.orange : '#e4e7ef'}`,
              background: on ? `${COLORS.orange}0f` : '#fff',
              color: on ? COLORS.orange : COLORS.text,
              fontSize: 11, fontWeight: on ? 800 : 600, cursor: 'pointer', fontFamily: 'Lato',
            },
          }, t);
        }),
      ),
      React.createElement('div', { style: { display: 'flex', gap: 6, marginBottom: 18 } },
        React.createElement('input', { style: { ...inp, flex: 1 }, placeholder: 'Nueva tipología…', value: newTipologia, onChange: e => setNewTipologia(e.target.value) }),
        React.createElement('button', {
          type: 'button',
          onClick: () => { if (newTipologia.trim()) { onAddTipologia(newTipologia.trim()); setNewTipologia(''); } },
          style: { padding: '9px 14px', borderRadius: 8, border: 'none', background: COLORS.gradient, color: '#fff', fontFamily: 'Bricolage Grotesque', fontSize: 12, fontWeight: 800, cursor: 'pointer' },
        }, '+ Añadir'),
      ),

      // Cursos asignados
      React.createElement('h3', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: COLORS.dark, margin: '4px 0 10px', textTransform: 'uppercase', letterSpacing: 0.8 } }, 'Cursos asignados'),
      React.createElement('div', { style: { maxHeight: 220, overflowY: 'auto', border: '1px solid #eceef4', borderRadius: 8, padding: 8, marginBottom: 20 } },
        ...(courses || []).slice(0, 80).map(c => {
          const on = form.cursosAsignados.includes(c.id);
          return React.createElement('label', {
            key: c.id,
            style: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px', cursor: 'pointer', fontFamily: 'Lato', fontSize: 12, color: COLORS.text },
          },
            React.createElement('input', { type: 'checkbox', checked: on, onChange: () => toggleCurso(c.id), style: { accentColor: COLORS.orange } }),
            React.createElement('span', { style: { flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, c.title.slice(0, 60)),
          );
        }),
      ),

      React.createElement('div', { style: { display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 10, borderTop: '1px solid #eceef4' } },
        React.createElement('button', { onClick: onClose, style: { padding: '10px 18px', borderRadius: 9, border: '1px solid #e4e7ef', background: '#fff', color: COLORS.text, fontFamily: 'Lato', fontSize: 13, fontWeight: 700, cursor: 'pointer' } }, 'Cancelar'),
        React.createElement('button', { onClick: save, style: { padding: '10px 20px', borderRadius: 9, border: 'none', background: COLORS.gradient, color: '#fff', fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 800, cursor: 'pointer', letterSpacing: 0.3 } }, 'Guardar cambios'),
      ),
    ),
  );
}

window.AdminLayout = AdminLayout;
