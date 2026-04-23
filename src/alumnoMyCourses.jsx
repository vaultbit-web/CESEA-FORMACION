// ─── CESEA Formación · Alumnado — Mis cursos ─────────────────────────────────
//
// Vista personal del alumno: tabs para cursos en progreso, completados y
// certificados (shortcut visual a los diplomas). Desde aquí se navega al
// detalle del curso para continuar o marcar como completado.
//
// FILEMAKER: Layout "Alumno_MisCursos" con portal a Inscripciones_Alumno
//   filtrado por id_alumno y ordenado por ultima_sesion descendente.
// ─────────────────────────────────────────────────────────────────────────────

function AlumnoMyCoursesView() {
  const {
    courses, enrollments, diplomas, user, theme, showToast,
    setDetailCourseId, setCurrentView,
  } = React.useContext(AppContext);
  const [tab, setTab] = React.useState('en_progreso');

  // FILEMAKER: Tabs simplificadas — "Certificados" se ha fusionado dentro de
  //   "Completados" (cada curso completado expone el botón de descarga del diploma
  //   asociado mediante el FK Inscripciones_Alumno → Diplomas).
  const tabs = [
    { id: 'en_progreso', label: 'En progreso', filter: e => e.status === 'en_progreso' || e.status === 'inscrito' },
    { id: 'completado',  label: 'Completados', filter: e => e.status === 'completado' },
  ];
  const activeTab = tabs.find(t => t.id === tab);
  const items = activeTab.filter ? enrollments.filter(activeTab.filter) : [];

  const getCourse  = id => courses.find(c => c.id === id);
  const getDiploma = enrollmentId => diplomas.find(d => d.enrollmentId === enrollmentId);
  const openCourse = (id) => { setDetailCourseId(id); setCurrentView('detalle-curso'); };

  const downloadDiploma = (diploma) => {
    if (!diploma) { showToast && showToast('Diploma en proceso', 'info'); return; }
    if (typeof window.downloadDiplomaPDF === 'function') {
      window.downloadDiplomaPDF(diploma, user, showToast);
    } else {
      setCurrentView('diplomas');
    }
  };

  return React.createElement('div', null,
    React.createElement('div', { style: { marginBottom: 22 } },
      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: theme.textLight, fontWeight: 700, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 4 } }, 'Mi formación'),
      React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 28, fontWeight: 800, color: theme.text, letterSpacing: -0.5 } }, 'Mis cursos'),
      React.createElement('p', { style: { fontFamily: 'Lato', fontSize: 13, color: theme.textLight, marginTop: 4 } }, 'Sigue tu progreso y retoma el aprendizaje donde lo dejaste.'),
    ),

    // Tabs
    React.createElement('div', {
      style: { display: 'flex', gap: 4, marginBottom: 18, background: theme.surface2 || '#fafbfc', padding: 5, borderRadius: 10, border: `1px solid ${theme.border}`, width: 'fit-content' },
    },
      tabs.map(t => {
        const count = enrollments.filter(t.filter).length;
        return React.createElement('button', {
          key: t.id,
          onClick: () => setTab(t.id),
          style: {
            padding: '9px 16px', borderRadius: 7, border: 'none',
            background: tab === t.id ? theme.surface : 'transparent',
            color: tab === t.id ? COLORS.orange : theme.textLight,
            fontFamily: 'Bricolage Grotesque', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', letterSpacing: 0.3,
            boxShadow: tab === t.id ? '0 2px 8px rgba(15,16,32,0.05)' : 'none',
            transition: 'all 0.18s',
          },
        }, t.label, ' · ', count);
      }),
    ),

    // Content
    items.length === 0
        ? React.createElement(EmptyState, {
            theme, icon: '◌',
            title: tab === 'en_progreso' ? 'No tienes cursos activos' : 'Aún no has completado ningún curso',
            text: 'Explora el catálogo para empezar a formarte.',
            action: React.createElement('button', {
              onClick: () => setCurrentView('catalogo'),
              style: { padding: '11px 20px', borderRadius: 10, background: COLORS.gradient, color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontWeight: 700, cursor: 'pointer' },
            }, 'Ver catálogo'),
          })
        : React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 } },
            items.map(e => {
              const c = getCourse(e.courseId);
              if (!c) return null;
              const isDone = e.status === 'completado';
              return React.createElement('div', {
                key: e.id,
                style: {
                  background: theme.surface, border: `1px solid ${theme.border}`,
                  borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column',
                  gap: 14, boxShadow: theme.cardShadow,
                },
              },
                React.createElement('div', { style: { display: 'flex', gap: 14 } },
                  React.createElement('div', {
                    style: { width: 56, height: 56, borderRadius: 12, flexShrink: 0, background: `linear-gradient(135deg, ${COLORS.orange}, ${COLORS.pink})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: 18 },
                  }, (c.area || '').charAt(0)),
                  React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                    React.createElement(Pill, { text: c.area, small: true, color: COLORS.orange, bg: `${COLORS.orange}15` }),
                    React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: theme.text, marginTop: 6, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } }, c.title),
                    React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: theme.textLight, marginTop: 4 } }, c.modality, ' · ', c.hours, ' h · ', c.instructor),
                  ),
                ),
                React.createElement('div', null,
                  React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontFamily: 'Lato', fontSize: 11, color: theme.textLight, fontWeight: 700, marginBottom: 6 } },
                    React.createElement('span', null, 'Progreso'),
                    React.createElement('span', { style: { color: isDone ? '#16a34a' : COLORS.orange } }, (e.progress || 0) + '%'),
                  ),
                  React.createElement(Progress, { value: e.progress || 0, color: isDone ? '#16a34a' : undefined }),
                ),
                React.createElement('div', {
                  style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, fontFamily: 'Lato', fontSize: 11, color: theme.textLight, paddingTop: 6 },
                },
                  React.createElement('span', { style: { flex: 1, minWidth: 0 } },
                    isDone ? ('Completado el ' + (e.completedAt || '—'))
                           : ('Última actividad: ' + (e.lastAccess || 'sin registro')),
                  ),
                  React.createElement('div', { style: { display: 'flex', gap: 6, flexShrink: 0 } },
                    // FILEMAKER: al completar, Script "Generar_Diploma" crea el registro
                    //   en tabla Diplomas. Si aún no existe, el botón queda deshabilitado.
                    isDone && React.createElement('button', {
                      onClick: () => downloadDiploma(getDiploma(e.id)),
                      disabled: !getDiploma(e.id),
                      title: getDiploma(e.id) ? 'Descargar diploma en PDF' : 'Diploma en proceso',
                      style: {
                        padding: '8px 12px', borderRadius: 7,
                        background: getDiploma(e.id) ? COLORS.gradient : '#e4e7ef',
                        color: getDiploma(e.id) ? '#fff' : theme.textLight,
                        border: 'none', fontFamily: 'Bricolage Grotesque', fontSize: 11, fontWeight: 700,
                        cursor: getDiploma(e.id) ? 'pointer' : 'not-allowed',
                      },
                    }, '↓ Diploma'),
                    React.createElement('button', {
                      onClick: () => openCourse(c.id),
                      style: {
                        padding: '8px 14px', borderRadius: 7,
                        background: isDone ? (theme.surface2 || '#fafbfc') : COLORS.orange,
                        color: isDone ? theme.text : '#fff',
                        border: isDone ? `1px solid ${theme.border}` : 'none',
                        fontFamily: 'Bricolage Grotesque', fontSize: 11, fontWeight: 700,
                        cursor: 'pointer',
                      },
                    }, isDone ? 'Revisar' : 'Continuar →'),
                  ),
                ),
              );
            }),
          ),
  );
}

window.AlumnoMyCoursesView = AlumnoMyCoursesView;
