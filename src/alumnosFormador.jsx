// ─── CESEA Formación · Formador — Mis alumnos ────────────────────────────────
//
// Lista de alumnos inscritos en los cursos que el formador imparte. Permite
// filtrar por curso concreto, buscar por nombre/email y contactar al alumno.
//
// FILEMAKER: Layout "Formador_Mis_Alumnos". Portal a Alumnos filtrado por
//   join Inscripciones_Alumno ⨯ Cursos (donde Cursos::id_formador = Get(AccountName)).
//   Script "Buscar_Alumnos_Por_Formador" ejecuta el Find compuesto.
// ─────────────────────────────────────────────────────────────────────────────

function AlumnosFormadorView() {
  const { courses, students, enrollments, user } = React.useContext(AppContext);
  const vp = window.useViewport ? window.useViewport() : { isSmall: false };
  const isSmall = vp.isSmall;

  // Cursos que imparte el formador (por simplicidad de demo: los accepted/review/completed)
  const myCourses = courses.filter(c =>
    ['accepted', 'review', 'completed'].includes(c.status)
  );

  const [courseFilter, setCourseFilter] = React.useState('all');
  const [query, setQuery] = React.useState('');

  // Mapeo alumno → cursos + progreso. Cruzamos enrollments con students y myCourses.
  // FILEMAKER: esto equivale al portal con relación compuesta.
  const rows = React.useMemo(() => {
    const myCourseIds = new Set(myCourses.map(c => c.id));
    const filteredEnrollments = enrollments.filter(e => myCourseIds.has(e.courseId));
    const map = new Map();
    filteredEnrollments.forEach(e => {
      if (courseFilter !== 'all' && e.courseId !== Number(courseFilter)) return;
      // Ligar a un alumno real (si no lo encontramos, generamos un pseudo-alumno)
      const studentIdx = enrollments.indexOf(e) % students.length;
      const student = students[studentIdx] || students[0];
      const course  = myCourses.find(c => c.id === e.courseId);
      if (!student || !course) return;
      const key = student.id + '-' + e.courseId;
      map.set(key, { enrollment: e, student, course });
    });
    let result = Array.from(map.values());
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(r =>
        (r.student.name + ' ' + r.student.email + ' ' + r.course.title).toLowerCase().includes(q)
      );
    }
    return result;
  }, [enrollments, students, myCourses, courseFilter, query]);

  const statusLabel = {
    inscrito:      { label: 'Inscrito',      color: COLORS.textLight, bg: '#eceef4' },
    en_progreso:   { label: 'En progreso',   color: COLORS.orange,    bg: `${COLORS.orange}15` },
    completado:    { label: 'Completado',    color: '#16a34a',        bg: '#16a34a15' },
    abandonado:    { label: 'Abandonado',    color: COLORS.red,       bg: `${COLORS.red}15` },
  };

  return React.createElement('div', null,
    // Header
    React.createElement('div', { style: { marginBottom: 22 } },
      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, fontWeight: 700, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 4 } }, 'Tus alumnos'),
      React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 28, fontWeight: 800, color: COLORS.dark, letterSpacing: -0.5 } },
        React.createElement('span', { style: { background: COLORS.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } }, rows.length),
        ' alumnos inscritos',
      ),
      React.createElement('p', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight, marginTop: 4 } },
        'Todos los alumnos que actualmente siguen alguno de tus cursos. Filtra por curso o busca por nombre.',
      ),
    ),

    // Filtros
    React.createElement('div', {
      style: {
        background: '#fff', border: '1px solid #eceef4', borderRadius: 14,
        padding: 16, marginBottom: 18,
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10,
      },
    },
      React.createElement('input', {
        type: 'search', value: query, onChange: e => setQuery(e.target.value),
        placeholder: '🔍 Buscar por nombre, email o curso…',
        style: { padding: '11px 14px', borderRadius: 9, border: '1px solid #e4e7ef', background: '#fafbfc', fontSize: 13, fontFamily: 'Lato', outline: 'none' },
      }),
      React.createElement('select', {
        value: courseFilter, onChange: e => setCourseFilter(e.target.value),
        style: { padding: '11px 12px', borderRadius: 9, border: '1px solid #e4e7ef', background: '#fafbfc', fontSize: 13, fontFamily: 'Lato', cursor: 'pointer' },
      },
        React.createElement('option', { value: 'all' }, 'Todos mis cursos'),
        myCourses.map(c => React.createElement('option', { key: c.id, value: c.id }, c.title.slice(0, 55) + (c.title.length > 55 ? '…' : ''))),
      ),
    ),

    // Lista / tabla
    rows.length === 0
      ? React.createElement('div', {
          style: { padding: '48px 24px', textAlign: 'center', color: COLORS.textLight, fontFamily: 'Lato', background: '#fff', borderRadius: 14, border: '1px solid #eceef4' },
        },
          React.createElement('div', { style: { fontSize: 36, marginBottom: 8, opacity: 0.5 } }, '◌'),
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 16, color: COLORS.dark, marginBottom: 4 } }, 'Sin alumnos inscritos'),
          React.createElement('div', { style: { fontSize: 13 } }, 'Ajusta los filtros o acepta nuevas ofertas para empezar a tener alumnos.'),
        )
      // En desktop: tabla. En móvil: cards
      : isSmall
        ? React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
            rows.map(r => React.createElement('div', {
              key: r.student.id + '-' + r.course.id,
              style: { background: '#fff', border: '1px solid #eceef4', borderRadius: 12, padding: 16 },
            },
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 } },
                React.createElement('div', {
                  style: { width: 40, height: 40, borderRadius: 10, background: COLORS.gradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: 13, flexShrink: 0 },
                }, r.student.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()),
                React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                  React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: COLORS.dark } }, r.student.name),
                  React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight } }, r.student.email),
                ),
              ),
              React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, marginBottom: 10 } }, '▦ ', r.course.title),
              React.createElement('div', { style: { marginBottom: 10 } },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, fontWeight: 700, marginBottom: 4 } },
                  React.createElement('span', null, 'Progreso'), React.createElement('span', null, r.enrollment.progress + '%'),
                ),
                React.createElement(Progress, { value: r.enrollment.progress }),
              ),
              React.createElement('a', {
                href: 'mailto:' + r.student.email,
                style: { display: 'inline-block', padding: '8px 14px', borderRadius: 8, background: `${COLORS.orange}10`, color: COLORS.orange, border: `1px solid ${COLORS.orange}40`, fontFamily: 'Bricolage Grotesque', fontSize: 11, fontWeight: 700, textDecoration: 'none' },
              }, '✉ Contactar'),
            )),
          )
        : React.createElement('div', { style: { background: '#fff', borderRadius: 14, border: '1px solid #eceef4', overflowX: 'auto', WebkitOverflowScrolling: 'touch' } },
            React.createElement('table', { style: { width: '100%', minWidth: 640, borderCollapse: 'collapse', borderSpacing: 0 } },
              React.createElement('thead', null,
                React.createElement('tr', { style: { background: '#fafbfc' } },
                  ...['Alumno', 'Curso', 'Progreso', 'Última actividad', ''].map(h =>
                    React.createElement('th', { key: h, style: { padding: '12px 16px', textAlign: 'left', fontFamily: 'Lato', fontSize: 10, fontWeight: 700, color: COLORS.textLight, letterSpacing: 1, textTransform: 'uppercase', borderBottom: '1px solid #eceef4' } }, h),
                  ),
                ),
              ),
              React.createElement('tbody', null,
                ...rows.map(r => React.createElement('tr', {
                  key: r.student.id + '-' + r.course.id,
                  style: { borderBottom: '1px solid #f4f5f9' },
                },
                  React.createElement('td', { style: { padding: '14px 16px' } },
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
                      React.createElement('div', {
                        style: { width: 34, height: 34, borderRadius: 8, background: COLORS.gradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: 12, flexShrink: 0 },
                      }, r.student.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()),
                      React.createElement('div', null,
                        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, fontWeight: 700, color: COLORS.dark } }, r.student.name),
                        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight } }, r.student.email),
                      ),
                    ),
                  ),
                  React.createElement('td', { style: { padding: '14px 16px', fontFamily: 'Lato', fontSize: 12, color: COLORS.text, maxWidth: 300 } },
                    React.createElement('div', { style: { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } }, r.course.title),
                  ),
                  React.createElement('td', { style: { padding: '14px 16px', minWidth: 140 } },
                    React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, marginBottom: 4 } }, r.enrollment.progress + '%'),
                    React.createElement(Progress, { value: r.enrollment.progress, height: 5 }),
                  ),
                  React.createElement('td', { style: { padding: '14px 16px', fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight } },
                    r.enrollment.lastAccess || '—',
                  ),
                  React.createElement('td', { style: { padding: '14px 16px', textAlign: 'right' } },
                    React.createElement('a', {
                      href: 'mailto:' + r.student.email,
                      style: { padding: '7px 12px', borderRadius: 7, background: '#fff', color: COLORS.orange, border: `1px solid ${COLORS.orange}40`, fontFamily: 'Bricolage Grotesque', fontSize: 11, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap' },
                    }, '✉ Contactar'),
                  ),
                )),
              ),
            ),
          ),
  );
}

window.AlumnosFormadorView = AlumnosFormadorView;
