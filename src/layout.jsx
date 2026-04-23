// ─── Layout: Navigation + Page Shell ─────────────────────────────────────────
// Estética: software profesional, blanco sólido, bordes finos, sombras
// discretas. El gradiente corporativo se reserva para acentos (CTAs, estado
// activo, KPIs) — no se usa como fondo permanente.
const { motion, AnimatePresence } = window.Motion || {};

// FILEMAKER: El formador NO ve los layouts Diplomas ni Ofertas_Empleo
//   (son exclusivos del alumnado). "Incidencias" es un nuevo layout que permite
//   reportar problemas (enfermedad, cambio fecha…) al superadmin.
const NAV_ITEMS = [
  { id: 'inicio',       label: 'Resumen',          icon: '▤' },
  { id: 'cursos',       label: 'Mis formaciones',  icon: '▦' },
  { id: 'calendario',   label: 'Calendario',       icon: '▥' },
  { id: 'bitacora',     label: 'Bitácora',         icon: '✎' },
  { id: 'tareas',       label: 'Tareas',           icon: '◆' },
  { id: 'asistencia',   label: 'Asistencia',       icon: '☰' },
  { id: 'mis-alumnos',  label: 'Mis alumnos',      icon: '◌' },
  { id: 'incidencias',  label: 'Incidencias',      icon: '⚠' },
  { id: 'valoraciones', label: 'Valoraciones',     icon: '★' },
  { id: 'horas',        label: 'Horas impartidas', icon: '◷' },
  { id: 'perfil',       label: 'Mi perfil',        icon: '◎' },
];

// ─── Top Navigation ───────────────────────────────────────────────────────────
function TopNav() {
  const { currentView, setCurrentView, user, logout, notifications, markAllRead } = React.useContext(AppContext);
  const [showProfile, setShowProfile] = React.useState(false);
  const [showNotif,   setShowNotif]   = React.useState(false);
  const [showMenu,    setShowMenu]    = React.useState(false);
  const unread = (notifications || []).filter(n => !n.read).length;
  const vp = window.useViewport ? window.useViewport() : { isSmall: false, isMobile: false };
  const isSmall = vp.isSmall;

  const closeAll = () => { setShowProfile(false); setShowNotif(false); setShowMenu(false); };

  return React.createElement('nav', {
    style: {
      position: 'sticky', top: 0, zIndex: 100,
      background: '#ffffff',
      borderBottom: '1px solid #eceef4',
      padding: isSmall ? '0 16px' : '0 40px', height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }
  },
    // ── Left: logo + (nav / hamburger) ─────────────────────────────────────
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: isSmall ? 10 : 36 } },
      // Hamburger (solo móvil/tablet)
      isSmall && React.createElement('button', {
        onClick: () => { setShowMenu(!showMenu); setShowProfile(false); setShowNotif(false); },
        'aria-label': 'Abrir menú',
        style: {
          width: 38, height: 38, borderRadius: 9, background: showMenu ? `${COLORS.orange}12` : '#f4f5f9',
          border: '1px solid #eceef4', cursor: 'pointer', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', gap: 4, padding: 0,
        },
      },
        React.createElement('span', { style: { width: 16, height: 2, background: COLORS.dark, borderRadius: 2 } }),
        React.createElement('span', { style: { width: 16, height: 2, background: COLORS.dark, borderRadius: 2 } }),
        React.createElement('span', { style: { width: 16, height: 2, background: COLORS.dark, borderRadius: 2 } }),
      ),
      React.createElement('div', {
        style: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' },
        onClick: () => { closeAll(); setCurrentView('inicio'); },
        title: 'CESEA Formación',
      },
        React.createElement('img', {
          src: 'assets/logotipo-color.png',
          alt: 'CESEA Formación',
          style: { height: isSmall ? 26 : 34, width: 'auto', display: 'block' },
          onError: e => { e.target.style.display = 'none'; },
        }),
        !isSmall && React.createElement('span', {
          style: { padding: '3px 9px', borderRadius: 5, background: COLORS.gradient, color: '#fff', fontSize: 9.5, fontWeight: 800, letterSpacing: 1.5, fontFamily: 'Bricolage Grotesque', textTransform: 'uppercase' },
        }, 'Formador'),
      ),

      // Items inline (solo desktop)
      !isSmall && React.createElement('div', { style: { display: 'flex', gap: 2 } },
        ...NAV_ITEMS.map(item => {
          const active = currentView === item.id;
          return React.createElement('button', {
            key: item.id,
            onClick: () => { closeAll(); setCurrentView(item.id); },
            style: {
              padding: '8px 14px', borderRadius: 10, border: 'none',
              background: active ? `${COLORS.orange}0d` : 'transparent',
              color: active ? COLORS.orange : COLORS.textLight,
              fontFamily: 'Lato', fontSize: 13.5, fontWeight: active ? 700 : 500,
              cursor: 'pointer', transition: 'all 0.18s',
              display: 'flex', alignItems: 'center', gap: 7,
              position: 'relative',
            },
            onMouseEnter: e => { if (!active) { e.currentTarget.style.background = '#f4f5f9'; e.currentTarget.style.color = COLORS.dark; } },
            onMouseLeave: e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = COLORS.textLight; } },
          },
            React.createElement('span', { style: { fontSize: 13, opacity: active ? 1 : 0.55 } }, item.icon),
            item.label,
            active && React.createElement('span', {
              style: { position: 'absolute', bottom: -14, left: '20%', right: '20%', height: 2, borderRadius: 2, background: COLORS.gradient }
            }),
          );
        }),
      ),

      // Drawer móvil (overlay full-width debajo del nav)
      isSmall && showMenu && React.createElement('div', {
        style: { position: 'fixed', top: 64, left: 0, right: 0, bottom: 0, background: 'rgba(15,16,32,0.4)', zIndex: 95 },
        onClick: () => setShowMenu(false),
      },
        React.createElement('div', {
          onClick: e => e.stopPropagation(),
          style: { background: '#fff', borderBottom: '1px solid #eceef4', padding: '14px 12px 20px', animation: 'fadeInUp 0.22s ease-out both', boxShadow: '0 12px 32px rgba(15,16,32,0.1)' },
        },
          ...NAV_ITEMS.map(item => {
            const active = currentView === item.id;
            return React.createElement('button', {
              key: item.id,
              onClick: () => { setCurrentView(item.id); setShowMenu(false); },
              style: {
                width: '100%', padding: '13px 14px', borderRadius: 10, border: 'none',
                background: active ? `${COLORS.orange}14` : 'transparent',
                color: active ? COLORS.orange : COLORS.dark,
                fontFamily: 'Lato', fontSize: 14, fontWeight: active ? 700 : 600,
                cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 12,
                marginBottom: 4,
              },
            },
              React.createElement('span', { style: { fontSize: 16, width: 22, textAlign: 'center', color: active ? COLORS.orange : COLORS.textLight } }, item.icon),
              item.label,
            );
          }),
        ),
      ),
    ),

    // ── Right: bell + profile
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },

      // Bell
      React.createElement('div', { style: { position: 'relative' } },
        React.createElement('button', {
          onClick: () => { setShowNotif(!showNotif); setShowProfile(false); if (showNotif) markAllRead(); },
          style: {
            width: 36, height: 36, borderRadius: 9, background: '#f4f5f9', border: '1px solid #eceef4',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: COLORS.text, position: 'relative',
          }
        },
          '◔',
          unread > 0 && React.createElement('span', {
            style: { position: 'absolute', top: 5, right: 5, width: 8, height: 8, borderRadius: '50%', background: COLORS.red, border: '2px solid #f4f5f9' }
          }),
        ),
        showNotif && React.createElement('div', {
          style: { position: 'absolute', top: 46, right: 0, background: '#fff', borderRadius: 14, padding: 14, width: 320, boxShadow: '0 20px 48px rgba(18,20,35,0.12), 0 2px 8px rgba(18,20,35,0.04)', border: '1px solid #eceef4', zIndex: 300 }
        },
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 13, color: COLORS.dark, marginBottom: 10, padding: '0 4px', textTransform: 'uppercase', letterSpacing: 0.8 } }, 'Notificaciones'),
          ...(notifications || []).map(n =>
            React.createElement('div', {
              key: n.id,
              style: { padding: '10px 12px', borderRadius: 10, marginBottom: 4, background: n.read ? 'transparent' : `${COLORS.orange}08`, borderLeft: `3px solid ${n.read ? 'transparent' : COLORS.orange}` }
            },
              React.createElement('div', { style: { fontSize: 13, fontFamily: 'Lato', color: n.read ? COLORS.textLight : COLORS.text, fontWeight: n.read ? 400 : 600, lineHeight: 1.4 } }, n.text),
            )
          ),
        ),
      ),

      // Profile
      React.createElement('div', { style: { position: 'relative' } },
        React.createElement('button', {
          onClick: () => { setShowProfile(!showProfile); setShowNotif(false); },
          style: {
            display: 'flex', alignItems: 'center', gap: 10, padding: isSmall ? 4 : '4px 8px 4px 4px',
            borderRadius: 9, background: '#f4f5f9', border: '1px solid #eceef4', cursor: 'pointer',
          }
        },
          React.createElement('div', {
            style: {
              width: 30, height: 30, borderRadius: 7, background: COLORS.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 12, fontFamily: 'Bricolage Grotesque',
            }
          }, user?.initials || 'AG'),
          !isSmall && React.createElement('div', { style: { textAlign: 'left', lineHeight: 1.15 } },
            React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, fontWeight: 700, color: COLORS.dark, maxWidth: 130, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, (user?.name || '').split(' ').slice(0, 2).join(' ')),
            React.createElement('div', { style: { fontSize: 10, color: COLORS.textLight, fontFamily: 'Lato' } }, user?.role),
          ),
          !isSmall && React.createElement('span', { style: { color: COLORS.textLight, fontSize: 10, marginLeft: 2 } }, '▾'),
        ),

        showProfile && React.createElement('div', {
          style: { position: 'absolute', top: 48, right: 0, background: '#fff', borderRadius: 14, padding: 16, width: 256, boxShadow: '0 20px 48px rgba(18,20,35,0.12), 0 2px 8px rgba(18,20,35,0.04)', border: '1px solid #eceef4', zIndex: 300 }
        },
          React.createElement('div', { style: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #f0f1f5' } },
            React.createElement('div', { style: { width: 40, height: 40, borderRadius: 10, background: COLORS.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14, fontFamily: 'Bricolage Grotesque', flexShrink: 0 } }, user?.initials),
            React.createElement('div', { style: { overflow: 'hidden' } },
              React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 13, color: COLORS.dark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, user?.name),
              React.createElement('div', { style: { fontSize: 11, color: COLORS.textLight, fontFamily: 'Lato', marginTop: 2 } }, user?.email),
            ),
          ),
          React.createElement('button', {
            onClick: () => { setCurrentView('perfil'); closeAll(); },
            style: { width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid #eceef4', background: '#fafbfc', color: COLORS.dark, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Lato', marginBottom: 6, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }
          }, React.createElement('span', { style: { color: COLORS.textLight } }, '◎'), 'Ver perfil completo'),
          React.createElement('button', {
            onClick: logout,
            style: { width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid transparent', background: `${COLORS.red}08`, color: COLORS.red, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Lato', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }
          }, React.createElement('span', null, '↩'), 'Cerrar sesión'),
        ),
      ),
    ),
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
// FILEMAKER: el router del formador tiene un conjunto fijo de layouts permitidos.
//   Si llega un layout externo al rol (p.ej. "empleo", "catalogo", "pagos"), se
//   hace fallback a Formador_Dashboard para evitar pantalla en blanco.
function AppLayout() {
  const { currentView, setCurrentView } = React.useContext(AppContext);
  const KNOWN = ['inicio', 'cursos', 'calendario', 'bitacora', 'tareas', 'asistencia', 'mis-alumnos', 'incidencias', 'valoraciones', 'horas', 'perfil'];
  const safeView = KNOWN.includes(currentView) ? currentView : 'inicio';

  // Si alguien intentó entrar a una ruta ajena al rol, corregir el estado global.
  React.useEffect(() => {
    if (!KNOWN.includes(currentView)) setCurrentView('inicio');
  }, [currentView]);

  const renderView = () => {
    if (safeView === 'cursos')       return React.createElement(OfertasView);
    if (safeView === 'calendario')   return React.createElement(CalendarFullView);
    if (safeView === 'bitacora')     return React.createElement(BitacoraView);
    if (safeView === 'tareas')       return React.createElement(TasksView);
    if (safeView === 'asistencia')   return React.createElement(AttendanceView);
    if (safeView === 'mis-alumnos')  return React.createElement(AlumnosFormadorView);
    if (safeView === 'incidencias')  return React.createElement(IncidenciasView);
    if (safeView === 'valoraciones') return React.createElement(ValoracionesRecibidasView);
    if (safeView === 'horas')        return React.createElement(HoursView);
    if (safeView === 'perfil')       return React.createElement(ProfileView);
    return React.createElement(DashboardView);
  };

  return React.createElement('div', { style: { minHeight: '100vh', background: '#f6f7fb' } },
    React.createElement(TopNav),
    React.createElement('main', { style: { padding: '28px 40px 56px', maxWidth: 1360, margin: '0 auto', position: 'relative', zIndex: 1 } },
      AnimatePresence
        ? React.createElement(AnimatePresence, { mode: 'wait' },
            React.createElement(motion.div, {
              key: safeView,
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
              exit:    { opacity: 0, y: -6 },
              transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
            }, renderView()),
          )
        : React.createElement('div', null, renderView()),
    ),
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────
function DashboardView() {
  const { user, courses, hoursLog } = React.useContext(AppContext);
  const accepted  = courses.filter(c => c.status === 'accepted').length;
  const review    = courses.filter(c => c.status === 'review').length;
  const available = courses.filter(c => c.status === 'available').length;
  const hoursTotal = hoursLog.reduce((s, h) => s + h.hours, 0);
  const now       = new Date();
  const h         = now.getHours();
  const greeting  = h < 12 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches';
  const today     = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const Mc        = motion ? motion.div : 'div';

  const KPIS = [
    { label: 'Formaciones aceptadas', value: accepted,    color: COLORS.cyan,   hint: 'Confirmadas por administración' },
    { label: 'En revisión',           value: review,      color: COLORS.yellow, hint: 'A la espera de aprobación' },
    { label: 'Ofertas disponibles',   value: available,   color: COLORS.orange, hint: 'Pendientes de respuesta' },
    { label: 'Horas impartidas',      value: hoursTotal + 'h', color: COLORS.fuchsia, hint: 'Acumulado del año en curso' },
  ];

  return React.createElement('div', null,
    // ── Header ("hello bar" sobrio, sin gradiente llamativo)
    React.createElement(Mc, {
      ...(motion ? { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } } : {}),
      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22, gap: 20, flexWrap: 'wrap' }
    },
      React.createElement('div', null,
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.3, marginBottom: 4 } },
          greeting + ' · ' + today
        ),
        React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 26, fontWeight: 800, color: COLORS.dark, margin: 0, lineHeight: 1.15 } },
          'Hola, ',
          React.createElement('span', { style: { background: COLORS.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } }, (user?.name?.split(' ')[0] || 'Formador/a')),
        ),
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight, marginTop: 4 } },
          'Este es tu panel de formador. Revisa ofertas, consulta tu calendario y haz seguimiento de las horas impartidas.'
        ),
      ),
    ),

    // ── KPI cards sobrias
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 22 } },
      ...KPIS.map((k, i) => React.createElement(Mc, {
        key: k.label,
        ...(motion ? { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.04 } } : {}),
        style: {
          background: '#fff', borderRadius: 14, padding: '18px 20px',
          border: '1px solid #eceef4',
          boxShadow: '0 1px 3px rgba(18,20,35,0.04), 0 1px 2px rgba(18,20,35,0.03)',
          position: 'relative', overflow: 'hidden',
        }
      },
        React.createElement('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: k.color } }),
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 } }, k.label),
        React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 28, fontWeight: 800, color: COLORS.dark, lineHeight: 1 } }, k.value),
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, marginTop: 8 } }, k.hint),
      )),
    ),

    // ── Main grid
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, alignItems: 'start' } },
      React.createElement('div', null, React.createElement(SwipeStack)),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
        React.createElement(MiniCalendarWidget),
        React.createElement(HoursWidget),
        React.createElement(NextClassesWidget),
      ),
    ),
  );
}

// ─── Profile View ─────────────────────────────────────────────────────────────
// FILEMAKER: Layout "Formador_Perfil".
//   Datos sensibles (DNI / IBAN) siempre enmascarados para [priv_Formador].
//   Solo [priv_Superadmin] ve los campos completos. Ver anotaciones en mockData.
function ProfileView() {
  const { user, hoursLog, courses, trainers, uploadFormadorDoc, removeFormadorDoc, showToast } = React.useContext(AppContext);
  // FILEMAKER: busca el registro del formador logueado en tabla Formadores para
  //   leer las tarifas (solo lectura desde [priv_Formador]).
  const trainerRec = (trainers || []).find(t => t.id === user?.id || t.email === user?.email) || {};
  const [editMode, setEditMode] = React.useState(false);
  const [form, setForm] = React.useState({
    phone:     user?.phone     || '',
    specialty: user?.specialty || '',
    location:  user?.location  || '',
  });
  const Mc = motion ? motion.div : 'div';
  const inp = { padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${COLORS.orange}55`, fontSize: 14, fontFamily: 'Lato', outline: 'none', background: '#fff', boxSizing: 'border-box', width: '100%', color: COLORS.dark };

  const totalHours   = hoursLog.reduce((s, h) => s + h.hours, 0);
  const completed    = courses.filter(c => c.status === 'completed').length;

  // Subida de CV (reemplaza al anterior)
  const cvInputRef = React.useRef(null);
  const docInputRef = React.useRef(null);
  const onUploadCV = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.type !== 'application/pdf') { showToast && showToast('El CV debe ser un PDF', 'error'); return; }
    uploadFormadorDoc(f.name, 'cv');
  };
  const onUploadDoc = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    uploadFormadorDoc(f.name, 'otro');
  };

  const DOC_LABELS = {
    cv:         { label: 'CV',                  color: COLORS.orange, icon: '📄' },
    titulacion: { label: 'Titulación',          color: COLORS.cyan,   icon: '🎓' },
    id:         { label: 'Documento de identidad', color: COLORS.pink,icon: '🪪' },
    otro:       { label: 'Otro documento',      color: COLORS.textLight, icon: '📎' },
  };

  return React.createElement('div', { style: { maxWidth: 900, margin: '0 auto' } },
    React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 24, fontWeight: 800, color: COLORS.dark, marginBottom: 4 } }, 'Mi perfil'),
    React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight, marginBottom: 22 } }, 'Gestiona tus datos profesionales, consulta tu actividad y tu documentación personal.'),

    // Main card
    React.createElement('div', {
      style: { background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(18,20,35,0.04)', border: '1px solid #eceef4', marginBottom: 16 }
    },
      // Header strip
      React.createElement('div', {
        style: { padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 18, borderBottom: '1px solid #f0f1f5', position: 'relative' }
      },
        React.createElement('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: COLORS.gradient } }),
        React.createElement('div', {
          style: { width: 60, height: 60, borderRadius: 12, background: COLORS.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 800, fontFamily: 'Bricolage Grotesque', flexShrink: 0 }
        }, user?.initials),
        React.createElement('div', { style: { flex: 1 } },
          React.createElement('h2', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 20, fontWeight: 800, color: COLORS.dark, margin: '0 0 2px' } }, user?.name),
          React.createElement('div', { style: { fontSize: 13, color: COLORS.textLight, fontFamily: 'Lato', marginBottom: 8 } }, user?.email),
          React.createElement('span', { style: { padding: '3px 10px', borderRadius: 6, background: `${COLORS.orange}10`, color: COLORS.orange, fontSize: 11, fontWeight: 700, fontFamily: 'Lato', textTransform: 'uppercase', letterSpacing: 0.6 } }, user?.role),
        ),
      ),

      // Info section
      React.createElement('div', { style: { padding: '22px 28px', borderBottom: '1px solid #f0f1f5' } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 } },
          React.createElement('h3', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: COLORS.dark, margin: 0, textTransform: 'uppercase', letterSpacing: 0.8 } }, 'Datos de contacto'),
          React.createElement('button', {
            onClick: () => setEditMode(!editMode),
            style: { padding: '6px 16px', borderRadius: 8, border: `1px solid ${editMode ? COLORS.orange : '#e8eaf0'}`, background: editMode ? `${COLORS.orange}10` : '#fff', color: editMode ? COLORS.orange : COLORS.text, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Lato', transition: 'all 0.2s' }
          }, editMode ? 'Guardar cambios' : 'Editar'),
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 } },
          ...([
            { label: 'Teléfono',       key: 'phone',     value: form.phone     },
            { label: 'Especialidad',   key: 'specialty', value: form.specialty },
            { label: 'Ubicación',      key: 'location',  value: form.location  },
            { label: 'Miembro desde',  key: null,        value: user?.joinDate },
          ]).map(field => React.createElement('div', { key: field.label },
            React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: COLORS.textLight, fontFamily: 'Lato', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 } }, field.label),
            editMode && field.key
              ? React.createElement('input', { style: inp, value: form[field.key], onChange: e => setForm(p => ({ ...p, [field.key]: e.target.value })) })
              : React.createElement('div', { style: { fontSize: 14, fontFamily: 'Lato', color: COLORS.text, padding: '6px 0' } }, field.value || '—'),
          )),
        ),
      ),

      // ── Datos fiscales y bancarios (ENMASCARADOS) ─────────────────────────
      React.createElement('div', { style: { padding: '22px 28px', borderBottom: '1px solid #f0f1f5' } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 } },
          React.createElement('h3', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: COLORS.dark, margin: 0, textTransform: 'uppercase', letterSpacing: 0.8 } }, 'Datos fiscales y bancarios'),
          React.createElement('span', { style: { fontFamily: 'Lato', fontSize: 10, color: COLORS.textLight, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' } }, '🔒 solo lectura'),
        ),
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, marginBottom: 16 } },
          'Campos gestionados por el superadministrador. Para modificarlos, contacta con administración.',
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 18 } },
          React.createElement('div', null,
            React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: COLORS.textLight, fontFamily: 'Lato', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 } }, 'DNI'),
            React.createElement('div', { style: { fontSize: 16, fontFamily: 'Bricolage Grotesque', fontWeight: 800, color: COLORS.dark, padding: '6px 0', letterSpacing: 1.5 } }, user?.dni || '—'),
          ),
          React.createElement('div', null,
            React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: COLORS.textLight, fontFamily: 'Lato', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 } }, 'IBAN'),
            React.createElement('div', { style: { fontSize: 16, fontFamily: 'Bricolage Grotesque', fontWeight: 800, color: COLORS.dark, padding: '6px 0', letterSpacing: 0.8 } }, user?.iban || '—'),
          ),
        ),
      ),

      // ── Tarifas (fijadas por administración) ─────────────────────────────
      // FILEMAKER: campos Formadores::tarifa_venta_directa, tarifa_venta_indirecta
      //   y tarifa_km. Editables solo por [priv_Superadmin]. Aquí en solo lectura.
      React.createElement('div', { style: { padding: '22px 28px', borderBottom: '1px solid #f0f1f5' } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 } },
          React.createElement('h3', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: COLORS.dark, margin: 0, textTransform: 'uppercase', letterSpacing: 0.8 } }, 'Tarifas'),
          React.createElement('span', { style: { fontFamily: 'Lato', fontSize: 10, color: COLORS.textLight, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' } }, '🔒 fijadas por administración'),
        ),
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, marginBottom: 16 } },
          'El kilometraje lo decide el superadministrador. Para cualquier ajuste, contacta con administración.',
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 } },
          [
            { label: 'Venta directa',    value: trainerRec.tarifaVentaDirecta   ? trainerRec.tarifaVentaDirecta   + ' €/h' : '—' },
            { label: 'Venta indirecta',  value: trainerRec.tarifaVentaIndirecta ? trainerRec.tarifaVentaIndirecta + ' €/h' : '—' },
            { label: 'Kilometraje',      value: trainerRec.tarifaKm             ? trainerRec.tarifaKm.toFixed(2)  + ' €/km' : '—' },
          ].map(f => React.createElement('div', { key: f.label, style: { background: '#fafbfc', borderRadius: 10, padding: '14px 16px', border: '1px solid #eceef4' } },
            React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: COLORS.textLight, fontFamily: 'Lato', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 } }, f.label),
            React.createElement('div', { style: { fontSize: 18, fontFamily: 'Bricolage Grotesque', fontWeight: 800, color: COLORS.dark } }, f.value),
          )),
        ),
      ),

      // ── Documentación ────────────────────────────────────────────────────
      React.createElement('div', { style: { padding: '22px 28px' } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 } },
          React.createElement('h3', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: COLORS.dark, margin: 0, textTransform: 'uppercase', letterSpacing: 0.8 } }, 'Documentación'),
          React.createElement('div', { style: { display: 'flex', gap: 6 } },
            React.createElement('button', {
              onClick: () => cvInputRef.current?.click(),
              style: { padding: '7px 14px', borderRadius: 8, background: COLORS.orange, color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontSize: 11, fontWeight: 700, cursor: 'pointer' },
            }, '↻ Actualizar CV'),
            React.createElement('button', {
              onClick: () => docInputRef.current?.click(),
              style: { padding: '7px 14px', borderRadius: 8, background: '#fff', color: COLORS.text, border: '1px solid #e4e7ef', fontFamily: 'Bricolage Grotesque', fontSize: 11, fontWeight: 700, cursor: 'pointer' },
            }, '+ Añadir documento'),
            React.createElement('input', { ref: cvInputRef, type: 'file', accept: 'application/pdf', style: { display: 'none' }, onChange: onUploadCV }),
            React.createElement('input', { ref: docInputRef, type: 'file', style: { display: 'none' }, onChange: onUploadDoc }),
          ),
        ),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          (user?.documents || []).length === 0
            ? React.createElement('div', { style: { padding: '20px 0', fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight, textAlign: 'center' } }, 'Aún no has subido documentos.')
            : (user?.documents || []).map(d => {
                const meta = DOC_LABELS[d.type] || DOC_LABELS.otro;
                return React.createElement('div', {
                  key: d.id,
                  style: { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: '#fafbfc', border: '1px solid #eceef4', borderRadius: 10 },
                },
                  React.createElement('div', {
                    style: { width: 38, height: 38, borderRadius: 9, background: `${meta.color}18`, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 },
                  }, meta.icon),
                  React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                    React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 700, color: COLORS.dark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, d.name),
                    React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, marginTop: 2 } },
                      meta.label, ' · Actualizado en ', d.year || '—', ' · ', d.size || '—',
                    ),
                  ),
                  React.createElement('button', {
                    title: 'Descargar',
                    style: { padding: '8px 12px', borderRadius: 7, background: '#fff', color: COLORS.text, border: '1px solid #e4e7ef', fontFamily: 'Bricolage Grotesque', fontSize: 11, fontWeight: 700, cursor: 'pointer' },
                  }, '↓'),
                  React.createElement('button', {
                    onClick: () => removeFormadorDoc(d.id),
                    title: 'Eliminar',
                    style: { padding: '8px 12px', borderRadius: 7, background: '#fff', color: COLORS.red, border: `1px solid ${COLORS.red}40`, fontFamily: 'Bricolage Grotesque', fontSize: 11, fontWeight: 700, cursor: 'pointer' },
                  }, '×'),
                );
              }),
        ),
      ),
    ),

    // Stats row
    React.createElement(Mc, {
      ...(motion ? { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 } } : {}),
      style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }
    },
      ...[
        { label: 'Horas impartidas',   value: totalHours + 'h', color: COLORS.cyan    },
        { label: 'Cursos completados', value: String(completed), color: '#16a34a'     },
        { label: 'Valoración media',   value: '4,8 / 5',        color: COLORS.yellow  },
      ].map(s => React.createElement('div', {
        key: s.label,
        style: { background: '#fff', borderRadius: 12, padding: '18px 20px', border: '1px solid #eceef4', boxShadow: '0 1px 3px rgba(18,20,35,0.04)', position: 'relative', overflow: 'hidden' }
      },
        React.createElement('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.color } }),
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 } }, s.label),
        React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 } }, s.value),
      )),
    ),
  );
}

window.TopNav      = TopNav;
window.AppLayout   = AppLayout;
window.DashboardView = DashboardView;
window.ProfileView = ProfileView;
