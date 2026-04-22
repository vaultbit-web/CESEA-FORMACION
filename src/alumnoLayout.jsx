// ─── CESEA Formación · Alumnado — App Shell (layout autenticado) ─────────────
//
// Envoltorio principal de la aplicación una vez autenticado. Contiene:
//   • Top navigation (logo + items + búsqueda global + dark toggle +
//     notificaciones + perfil dropdown)
//   • Router interno por currentView
//   • Overlays: checkout modal, onboarding modal, toast
//
// FILEMAKER: Equivalente al "Header Navigation" global. La navegación entre
//   vistas mapea a scripts de tipo "Ir_A_Layout_[Nombre]".
// ─────────────────────────────────────────────────────────────────────────────

const { motion: layMotion, AnimatePresence: layAP } = window.Motion || {};

const NAV_ITEMS = [
  { id: 'inicio',       label: 'Inicio',       icon: '▤' },
  { id: 'catalogo',     label: 'Catálogo',     icon: '▦' },
  { id: 'mis-cursos',   label: 'Mis cursos',   icon: '◈' },
  { id: 'diplomas',     label: 'Diplomas',     icon: '◆' },
  { id: 'empleo',       label: 'Empleo',       icon: '★' },
  { id: 'calendario',   label: 'Agenda',       icon: '◷' },
  { id: 'ayuda',        label: 'Ayuda',        icon: '?' },
];

// ─── Search Modal (global) ──────────────────────────────────────────────────
// FILEMAKER: Quick Find en la tabla Cursos con todos los campos indexados.
function AlumnoSearchModal({ open, onClose }) {
  const { courses, setDetailCourseId, setCurrentView, theme } = React.useContext(AppContext);
  const [q, setQ] = React.useState('');
  const inputRef = React.useRef(null);

  React.useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 80); }, [open]);

  const results = React.useMemo(() => {
    if (!q || q.length < 2) return [];
    const qq = q.toLowerCase();
    return courses.filter(c =>
      (c.title + ' ' + c.subtitle + ' ' + c.category + ' ' + c.area + ' ' + c.instructor).toLowerCase().includes(qq)
    ).slice(0, 10);
  }, [q, courses]);

  const goTo = (c) => { setDetailCourseId(c.id); setCurrentView('detalle-curso'); onClose(); };

  return React.createElement(Modal, { open, onClose, theme, maxWidth: 640 },
    React.createElement('div', { style: { padding: 18, background: theme.surface } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderBottom: `1px solid ${theme.border}`, marginBottom: 10 } },
        React.createElement('span', { style: { fontSize: 18, color: theme.textLight } }, '🔍'),
        React.createElement('input', {
          ref: inputRef,
          type: 'search', value: q, onChange: e => setQ(e.target.value),
          placeholder: 'Busca un curso por título, área, categoría…',
          style: { flex: 1, padding: '12px 0', border: 'none', outline: 'none', fontSize: 16, fontFamily: 'Lato', background: 'transparent', color: theme.text },
        }),
        React.createElement('span', { style: { fontFamily: 'Lato', fontSize: 10, color: theme.textLight, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' } }, 'Esc'),
      ),
      q.length < 2 && React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: theme.textLight, padding: 16, textAlign: 'center' } }, 'Escribe al menos 2 caracteres para buscar.'),
      q.length >= 2 && results.length === 0 && React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: theme.textLight, padding: 16, textAlign: 'center' } }, 'Sin resultados para "' + q + '".'),
      results.length > 0 && React.createElement('div', { style: { maxHeight: 380, overflowY: 'auto' } },
        results.map(c => React.createElement('div', {
          key: c.id, className: 'row-hover',
          onClick: () => goTo(c),
          style: { padding: '10px 12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 },
        },
          React.createElement('div', {
            style: { width: 38, height: 38, borderRadius: 9, background: COLORS.gradientSoft, color: COLORS.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: 14, flexShrink: 0 },
          }, (c.area || '').charAt(0)),
          React.createElement('div', { style: { flex: 1, minWidth: 0 } },
            React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 700, color: theme.text, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' } }, c.title),
            React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: theme.textLight } }, c.area, ' · ', c.modality, ' · ', c.price, ' €'),
          ),
          React.createElement('span', { style: { color: theme.textLight, fontSize: 13 } }, '→'),
        )),
      ),
    ),
  );
}

// ─── Top Navigation ──────────────────────────────────────────────────────────
function AlumnoTopNav() {
  const {
    user, currentView, setCurrentView, logout, theme,
    themeMode, toggleTheme,
    notifications, markAllRead,
  } = React.useContext(AppContext);

  const [showProfile, setShowProfile] = React.useState(false);
  const [showNotif,   setShowNotif]   = React.useState(false);
  const [searchOpen,  setSearchOpen]  = React.useState(false);

  const unread = (notifications || []).filter(n => !n.read).length;
  const closeAll = () => { setShowProfile(false); setShowNotif(false); };

  // Atajo Cmd/Ctrl+K para búsqueda
  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const navTone = themeMode === 'dark' ? '#0b0c1a' : '#0f1020';

  return React.createElement(React.Fragment, null,
    React.createElement('nav', {
      style: {
        position: 'sticky', top: 0, zIndex: 100,
        background: navTone,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 40px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      },
    },
      // ── Izquierda: logo + nav items ──
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 28 } },
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
            style: { fontFamily: 'Bricolage Grotesque', fontSize: 9.5, color: 'rgba(255,255,255,0.55)', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700 },
          }, 'Alumnado'),
        ),
        React.createElement('div', { style: { display: 'flex', gap: 2 } },
          NAV_ITEMS.map(item => {
            const activeMain = currentView === item.id ||
              (item.id === 'catalogo' && currentView === 'detalle-curso');
            return React.createElement('button', {
              key: item.id,
              onClick: () => { closeAll(); setCurrentView(item.id); },
              style: {
                padding: '8px 14px', borderRadius: 9, border: 'none',
                background: activeMain ? 'rgba(244,120,9,0.14)' : 'transparent',
                color: activeMain ? COLORS.yellow : 'rgba(255,255,255,0.62)',
                fontFamily: 'Lato', fontSize: 13, fontWeight: activeMain ? 700 : 500,
                cursor: 'pointer', transition: 'all 0.18s',
                display: 'flex', alignItems: 'center', gap: 7,
              },
              onMouseEnter: e => { if (!activeMain) e.currentTarget.style.color = '#fff'; },
              onMouseLeave: e => { if (!activeMain) e.currentTarget.style.color = 'rgba(255,255,255,0.62)'; },
            },
              React.createElement('span', { style: { fontSize: 12, opacity: activeMain ? 1 : 0.65 } }, item.icon),
              item.label,
            );
          }),
        ),
      ),

      // ── Derecha: search + dark + notif + perfil ──
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
        // Search
        React.createElement('button', {
          onClick: () => setSearchOpen(true),
          title: 'Buscar (Ctrl+K)',
          style: { width: 38, height: 38, borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 },
        }, '🔍'),

        // Dark toggle
        React.createElement('button', {
          onClick: toggleTheme,
          title: themeMode === 'dark' ? 'Modo claro' : 'Modo oscuro',
          style: { width: 38, height: 38, borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: themeMode === 'dark' ? COLORS.yellow : 'rgba(255,255,255,0.75)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 },
        }, themeMode === 'dark' ? '☀' : '☾'),

        // Notif
        React.createElement('div', { style: { position: 'relative' } },
          React.createElement('button', {
            onClick: () => { setShowProfile(false); setShowNotif(s => !s); },
            style: { width: 38, height: 38, borderRadius: 10, background: showNotif ? 'rgba(244,120,9,0.2)' : 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, position: 'relative' },
          },
            '◔',
            unread > 0 && React.createElement('span', {
              style: { position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: COLORS.red, border: '2px solid ' + navTone },
            }),
          ),
          showNotif && React.createElement('div', {
            style: {
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: 360, background: theme.surface, borderRadius: 12,
              boxShadow: '0 16px 44px rgba(0,0,0,0.2)', border: `1px solid ${theme.border}`,
              overflow: 'hidden', zIndex: 200,
            },
          },
            React.createElement('div', {
              style: { padding: '12px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
            },
              React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontWeight: 800, color: theme.text, fontSize: 13 } }, 'Notificaciones'),
              unread > 0 && React.createElement('button', {
                onClick: markAllRead,
                style: { background: 'none', border: 'none', color: COLORS.orange, fontSize: 11, fontFamily: 'Lato', cursor: 'pointer', fontWeight: 700 },
              }, 'Marcar todas como leídas'),
            ),
            React.createElement('div', { style: { maxHeight: 360, overflowY: 'auto' } },
              notifications.length === 0
                ? React.createElement('div', { style: { padding: 18, fontFamily: 'Lato', fontSize: 13, color: theme.textLight, textAlign: 'center' } }, 'Sin notificaciones')
                : notifications.map(n => React.createElement('div', {
                    key: n.id,
                    style: { padding: '12px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 10, fontFamily: 'Lato', fontSize: 12, color: theme.text, background: n.read ? theme.surface : (theme.surface2 || '#fafbfc') },
                  },
                    React.createElement('span', { style: { color: COLORS.orange, fontSize: 14, flexShrink: 0 } }, n.icon),
                    React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                      React.createElement('div', { style: { lineHeight: 1.5 } }, n.text),
                      React.createElement('div', { style: { fontSize: 10, color: theme.textLight, marginTop: 3 } }, n.date),
                    ),
                  )),
            ),
          ),
        ),

        // Perfil
        React.createElement('div', { style: { position: 'relative' } },
          React.createElement('button', {
            onClick: () => { setShowNotif(false); setShowProfile(s => !s); },
            style: { display: 'flex', alignItems: 'center', gap: 8, padding: '5px 11px 5px 6px', borderRadius: 999, background: showProfile ? 'rgba(255,255,255,0.08)' : 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer' },
          },
            React.createElement('div', {
              style: { width: 28, height: 28, borderRadius: '50%', background: COLORS.gradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: 10 },
            }, user?.initials),
            React.createElement('span', { style: { fontFamily: 'Lato', fontSize: 12, fontWeight: 700, maxWidth: 130, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, (user?.name || '').split(' ')[0]),
            React.createElement('span', { style: { fontSize: 9, opacity: 0.6 } }, '▼'),
          ),
          showProfile && React.createElement('div', {
            style: { position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 240, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, boxShadow: '0 16px 44px rgba(0,0,0,0.2)', overflow: 'hidden', zIndex: 200 },
          },
            React.createElement('div', { style: { padding: 14, borderBottom: `1px solid ${theme.border}` } },
              React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 800, color: theme.text, marginBottom: 2 } }, user?.name),
              React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: theme.textLight } }, user?.email),
              React.createElement('div', { style: { marginTop: 8 } },
                React.createElement(Pill, { text: user?.sector, small: true, color: user?.sector === 'dental' ? COLORS.orange : COLORS.cyan, bg: user?.sector === 'dental' ? `${COLORS.orange}15` : `${COLORS.cyan}15` }),
              ),
            ),
            React.createElement('div', { style: { padding: 6 } },
              React.createElement('button', {
                onClick: () => { setShowProfile(false); setCurrentView('perfil'); },
                className: 'row-hover',
                style: { width: '100%', padding: '10px 12px', borderRadius: 8, background: 'transparent', border: 'none', color: theme.text, fontFamily: 'Lato', fontSize: 13, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 },
              }, '◌ Mi perfil'),
              React.createElement('button', {
                onClick: () => { setShowProfile(false); setCurrentView('ayuda'); },
                className: 'row-hover',
                style: { width: '100%', padding: '10px 12px', borderRadius: 8, background: 'transparent', border: 'none', color: theme.text, fontFamily: 'Lato', fontSize: 13, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 },
              }, '? Centro de ayuda'),
            ),
            React.createElement('div', { style: { padding: 6, borderTop: `1px solid ${theme.border}` } },
              React.createElement('button', {
                onClick: logout,
                style: { width: '100%', padding: '10px 12px', borderRadius: 8, background: `${COLORS.red}08`, border: 'none', color: COLORS.red, fontFamily: 'Lato', fontSize: 13, fontWeight: 600, textAlign: 'left', cursor: 'pointer' },
              }, '↩ Cerrar sesión'),
            ),
          ),
        ),
      ),
    ),

    React.createElement(AlumnoSearchModal, { open: searchOpen, onClose: () => setSearchOpen(false) }),
  );
}

// ─── App Shell ───────────────────────────────────────────────────────────────
function AlumnoLayout() {
  const { currentView, theme, toast } = React.useContext(AppContext);

  const view = (() => {
    switch (currentView) {
      case 'inicio':         return React.createElement(AlumnoDashboardView);
      case 'catalogo':       return React.createElement(AlumnoCatalogView);
      case 'detalle-curso':  return React.createElement(AlumnoCourseDetailView);
      case 'mis-cursos':     return React.createElement(AlumnoMyCoursesView);
      case 'diplomas':       return React.createElement(AlumnoDiplomasView);
      case 'empleo':         return React.createElement(AlumnoJobsView);
      case 'perfil':         return React.createElement(AlumnoProfileView);
      case 'calendario':     return React.createElement(AlumnoCalendarView);
      case 'ayuda':          return React.createElement(AlumnoFAQView);
      default:               return React.createElement(AlumnoDashboardView);
    }
  })();

  return React.createElement('div', { style: { minHeight: '100vh', background: theme.bg, color: theme.text } },
    React.createElement(AlumnoTopNav),
    React.createElement('main', {
      style: { padding: '28px 40px 56px', maxWidth: 1360, margin: '0 auto' },
    }, view),

    // Overlays globales
    React.createElement(AlumnoCheckoutModal),
    React.createElement(AlumnoOnboardingModal),
    // Toast via window.* para evitar posibles problemas de resolución de
    // identificador al compilar con Babel standalone.
    toast && window.Toast && React.createElement(window.Toast, { toast }),
  );
}

window.AlumnoTopNav      = AlumnoTopNav;
window.AlumnoLayout   = AlumnoLayout;
