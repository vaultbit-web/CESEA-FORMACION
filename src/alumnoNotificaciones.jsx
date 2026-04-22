// ─── CESEA Formación · Alumno — Notificaciones ───────────────────────────────
//
// Vista completa de notificaciones con agrupado cronológico y filtros.
// Click en una notificación la marca como leída y navega al sitio relacionado
// según el tipo (si aplica).
//
// FILEMAKER: Layout "Alumno_Notificaciones". Portal a Notificaciones_Alumno
//   ordenado por fecha DESC, filtrado por id_alumno. Scripts:
//     • "Marcar_Notificacion_Leida" (toggle read)
//     • "Marcar_Todas_Leidas"
// ─────────────────────────────────────────────────────────────────────────────

function AlumnoNotificacionesView() {
  const { notifications, markAllRead, markOneNotifRead, setCurrentView, theme } = React.useContext(AppContext);
  const [filter, setFilter] = React.useState('all');

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  // Agrupado por franja temporal
  const groups = React.useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400 * 1000).toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 86400 * 1000).toISOString().slice(0, 10);
    const buckets = { 'Hoy': [], 'Ayer': [], 'Esta semana': [], 'Anteriores': [] };
    filtered.forEach(n => {
      const d = (n.date || '').slice(0, 10);
      if (d === today) buckets['Hoy'].push(n);
      else if (d === yesterday) buckets['Ayer'].push(n);
      else if (d >= weekAgo) buckets['Esta semana'].push(n);
      else buckets['Anteriores'].push(n);
    });
    return Object.entries(buckets).filter(([, arr]) => arr.length > 0);
  }, [filtered]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Inferir destino por texto (heurística simple para el demo; en FileMaker
  // cada notificación tendría un campo `link_to_view` que el script leería).
  const inferDestination = (n) => {
    const t = (n.text || '').toLowerCase();
    if (t.includes('diploma')) return 'diplomas';
    if (t.includes('pago') || t.includes('factura') || t.includes('€')) return 'pagos';
    if (t.includes('oferta') || t.includes('empleo')) return 'empleo';
    if (t.includes('sesión') || t.includes('sesion')) return 'calendario';
    if (t.includes('cv') || t.includes('perfil')) return 'perfil';
    return null;
  };

  const onNotifClick = (n) => {
    if (!n.read) markOneNotifRead(n.id);
    const dest = inferDestination(n);
    if (dest) setCurrentView(dest);
  };

  const iconColor = {
    '◆': COLORS.orange,
    '▲': COLORS.yellow,
    '★': COLORS.pink,
    '◉': COLORS.cyan,
    '✓': '#16a34a',
  };

  return React.createElement('div', null,
    // Header
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap', gap: 12 } },
      React.createElement('div', null,
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: theme.textLight, fontWeight: 700, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 4 } }, 'Tu actividad'),
        React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 28, fontWeight: 800, color: theme.text, letterSpacing: -0.5 } }, 'Notificaciones'),
        React.createElement('p', { style: { fontFamily: 'Lato', fontSize: 13, color: theme.textLight, marginTop: 4 } },
          unreadCount > 0
            ? React.createElement('span', null, React.createElement('b', { style: { color: COLORS.orange } }, unreadCount), ' sin leer · ', notifications.length, ' totales')
            : React.createElement('span', null, 'Todas las notificaciones · ', notifications.length, ' totales'),
        ),
      ),
      unreadCount > 0 && React.createElement('button', {
        onClick: markAllRead,
        style: { padding: '10px 16px', borderRadius: 9, background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, fontFamily: 'Bricolage Grotesque', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
      }, '✓ Marcar todas como leídas'),
    ),

    // Filtros
    React.createElement('div', {
      style: { display: 'flex', gap: 6, marginBottom: 18, background: theme.surface2 || '#fafbfc', padding: 5, borderRadius: 10, border: `1px solid ${theme.border}`, width: 'fit-content' },
    },
      ...[
        { id: 'all',    label: 'Todas (' + notifications.length + ')' },
        { id: 'unread', label: 'No leídas (' + unreadCount + ')' },
      ].map(f => React.createElement('button', {
        key: f.id,
        onClick: () => setFilter(f.id),
        style: {
          padding: '8px 14px', borderRadius: 7, border: 'none',
          background: filter === f.id ? theme.surface : 'transparent',
          color: filter === f.id ? COLORS.orange : theme.textLight,
          fontFamily: 'Bricolage Grotesque', fontSize: 12, fontWeight: 700,
          cursor: 'pointer', letterSpacing: 0.3,
          boxShadow: filter === f.id ? '0 2px 8px rgba(15,16,32,0.05)' : 'none',
          transition: 'all 0.18s',
        },
      }, f.label)),
    ),

    // Lista agrupada
    groups.length === 0
      ? React.createElement(EmptyState, { theme, icon: '◔', title: 'Sin notificaciones', text: filter === 'unread' ? 'No tienes notificaciones sin leer.' : 'Aún no hay actividad.' })
      : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 22 } },
          groups.map(([groupName, items]) => React.createElement('div', { key: groupName },
            React.createElement('div', {
              style: { fontFamily: 'Lato', fontSize: 11, color: theme.textLight, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
            }, groupName),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
              items.map(n => {
                const dest = inferDestination(n);
                return React.createElement('div', {
                  key: n.id,
                  onClick: () => onNotifClick(n),
                  style: {
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px', borderRadius: 11,
                    background: n.read ? theme.surface : (theme.surface2 || '#fffbf5'),
                    border: `1px solid ${n.read ? theme.border : COLORS.orange + '40'}`,
                    cursor: dest ? 'pointer' : 'default',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    boxShadow: theme.cardShadow,
                  },
                  onMouseEnter: e => { if (dest) e.currentTarget.style.transform = 'translateY(-1px)'; },
                  onMouseLeave: e => { e.currentTarget.style.transform = 'translateY(0)'; },
                },
                  React.createElement('div', {
                    style: { width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: (iconColor[n.icon] || COLORS.orange) + '18', color: iconColor[n.icon] || COLORS.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 },
                  }, n.icon || '•'),
                  React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                    React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: theme.text, fontWeight: n.read ? 400 : 700, lineHeight: 1.45 } }, n.text),
                    React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: theme.textLight, marginTop: 4 } },
                      n.date,
                      dest && React.createElement('span', { style: { color: COLORS.orange, fontWeight: 700, marginLeft: 10 } }, '→ Ir a ', dest),
                    ),
                  ),
                  !n.read && React.createElement('div', {
                    style: { width: 8, height: 8, borderRadius: '50%', background: COLORS.orange, flexShrink: 0 },
                  }),
                );
              }),
            ),
          )),
        ),
  );
}

window.AlumnoNotificacionesView = AlumnoNotificacionesView;
