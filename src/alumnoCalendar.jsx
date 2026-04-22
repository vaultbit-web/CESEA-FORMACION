// ─── CESEA Formación · Alumnado — Calendario ─────────────────────────────────
//
// Muestra las próximas sesiones de los cursos en los que el alumno está
// inscrito + botones para añadir el evento a Google Calendar / Outlook
// (ambos abren URLs de intento reales).
//
// FILEMAKER: Layout "Alumno_Calendario" con portal filtrado a
//   Inscripciones_Alumno::next_session no vacío, ordenado ascendente.
// ─────────────────────────────────────────────────────────────────────────────

function AlumnoCalendarView() {
  const { enrollments, courses, theme } = React.useContext(AppContext);

  // Derivamos sesiones a partir de las inscripciones en progreso
  const sessions = enrollments
    .filter(e => e.nextSession && e.status !== 'completado')
    .map(e => {
      const c = courses.find(c => c.id === e.courseId);
      return c ? { ...e, course: c } : null;
    })
    .filter(Boolean)
    .sort((a, b) => (a.nextSession || '').localeCompare(b.nextSession || ''));

  const fmtDate = (iso) => {
    // iso expected 'YYYY-MM-DD HH:mm'
    if (!iso) return '';
    const [d, t] = iso.split(' ');
    const [y, m, day] = (d || '').split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${parseInt(day, 10)} de ${months[parseInt(m, 10) - 1]} · ${t || ''}`;
  };

  // Construye URL para Google Calendar
  const googleUrl = (session) => {
    const c = session.course;
    const start = (session.nextSession || '').replace(/[-: ]/g, '').slice(0, 13) + '00Z';
    const endNum = String(parseInt(start.slice(9, 11), 10) + 2).padStart(2, '0');
    const end = start.slice(0, 9) + endNum + start.slice(11);
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text:     c.title,
      details:  'Sesión del curso CESEA Formación · ' + c.modality,
      location: c.location,
      dates:    start + '/' + end,
    });
    return 'https://calendar.google.com/calendar/render?' + params.toString();
  };

  // Construye URL para Outlook
  const outlookUrl = (session) => {
    const c = session.course;
    const params = new URLSearchParams({
      path:    '/calendar/action/compose',
      rru:     'addevent',
      subject: c.title,
      body:    'Sesión del curso CESEA Formación',
      location: c.location,
      startdt: (session.nextSession || '').replace(' ', 'T'),
    });
    return 'https://outlook.live.com/calendar/0/deeplink/compose?' + params.toString();
  };

  return React.createElement('div', null,
    React.createElement('div', { style: { marginBottom: 22 } },
      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: theme.textLight, fontWeight: 700, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 4 } }, 'Agenda'),
      React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 28, fontWeight: 800, color: theme.text, letterSpacing: -0.5 } }, 'Próximas sesiones'),
      React.createElement('p', { style: { fontFamily: 'Lato', fontSize: 13, color: theme.textLight, marginTop: 4 } }, 'Tus sesiones programadas · añádelas a Google Calendar u Outlook con un clic.'),
    ),

    sessions.length === 0
      ? React.createElement(EmptyState, { theme, icon: '◷', title: 'No tienes sesiones programadas', text: 'Cuando te inscribas en cursos presenciales o híbridos verás aquí tus próximas sesiones.' })
      : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
          sessions.map(s => React.createElement('div', {
            key: s.id,
            style: {
              background: theme.surface, border: `1px solid ${theme.border}`,
              borderRadius: 14, padding: 20, display: 'flex', gap: 18,
              boxShadow: theme.cardShadow, alignItems: 'center',
            },
          },
            React.createElement('div', {
              style: { width: 68, textAlign: 'center', background: theme.surface2 || '#fafbfc', border: `1px solid ${theme.border}`, borderRadius: 10, padding: '10px 0' },
            },
              React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 24, fontWeight: 800, color: COLORS.orange, letterSpacing: -0.5 } }, parseInt((s.nextSession || '').slice(8, 10), 10) || '—'),
              React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 10, color: theme.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 } },
                ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][parseInt((s.nextSession || '').slice(5, 7), 10) - 1] || '—',
              ),
            ),
            React.createElement('div', { style: { flex: 1, minWidth: 0 } },
              React.createElement(Pill, { text: s.course.modality, small: true, color: COLORS.cyan, bg: `${COLORS.cyan}15` }),
              React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 15, fontWeight: 800, color: theme.text, marginTop: 6, lineHeight: 1.3 } }, s.course.title),
              React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: theme.textLight, marginTop: 4 } },
                '◷ ', fmtDate(s.nextSession), ' · ☯ ', s.course.location,
              ),
            ),
            React.createElement('div', { style: { display: 'flex', gap: 8 } },
              React.createElement('a', {
                href: googleUrl(s), target: '_blank', rel: 'noopener noreferrer',
                style: { padding: '9px 12px', borderRadius: 8, background: theme.surface2 || '#fafbfc', border: `1px solid ${theme.border}`, fontFamily: 'Bricolage Grotesque', fontSize: 11, fontWeight: 700, color: theme.text, textDecoration: 'none', whiteSpace: 'nowrap' },
              }, '+ Google'),
              React.createElement('a', {
                href: outlookUrl(s), target: '_blank', rel: 'noopener noreferrer',
                style: { padding: '9px 12px', borderRadius: 8, background: theme.surface2 || '#fafbfc', border: `1px solid ${theme.border}`, fontFamily: 'Bricolage Grotesque', fontSize: 11, fontWeight: 700, color: theme.text, textDecoration: 'none', whiteSpace: 'nowrap' },
              }, '+ Outlook'),
            ),
          )),
        ),
  );
}

window.AlumnoCalendarView = AlumnoCalendarView;
