// ─── CESEA Formación · Alumnado — Detalle de curso ───────────────────────────
//
// Ficha completa del curso: hero, metadata, descripción extendida, temario
// (generado a partir de la categoría/área), reseñas existentes + formulario
// para dejar la propia si está completado. Desde aquí se inscribe (lanza
// checkout) o se continúa el progreso si ya está inscrito.
//
// FILEMAKER: Layout "Alumno_Curso_Detalle" con portales:
//   • Portal a Inscripciones_Alumno (curso actual + alumno actual)
//   • Portal a Valoraciones (mismo curso, ordenado por fecha)
// ─────────────────────────────────────────────────────────────────────────────

function AlumnoCourseDetailView() {
  const {
    courses, enrollments, reviews, favorites, toggleFavorite,
    setDetailCourseId, detailCourseId, setCurrentView,
    setCheckoutCourse, advanceProgress, completeEnrollment, submitReview,
    theme,
  } = React.useContext(AppContext);

  const course = courses.find(c => c.id === detailCourseId);
  const enrollment = enrollments.find(e => e.courseId === detailCourseId);
  const courseReviews = reviews.filter(r => r.courseId === detailCourseId);
  const avgRating = courseReviews.length
    ? (courseReviews.reduce((s, r) => s + r.rating, 0) / courseReviews.length).toFixed(1)
    : null;

  const [tab, setTab] = React.useState('overview');
  const [myRating, setMyRating] = React.useState(0);
  const [myComment, setMyComment] = React.useState('');
  const alreadyReviewed = false;  // En prototipo permitimos múltiples por simplicidad

  if (!course) {
    return React.createElement('div', null,
      React.createElement(EmptyState, {
        theme, icon: '◌', title: 'Curso no encontrado',
        action: React.createElement('button', {
          onClick: () => setCurrentView('catalogo'),
          style: { padding: '11px 20px', borderRadius: 10, background: COLORS.gradient, color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontWeight: 700, cursor: 'pointer' },
        }, 'Volver al catálogo'),
      }),
    );
  }

  const fav = favorites.includes(course.id);

  // Temario sintético (4-6 módulos deducidos)
  const syllabus = [
    'Introducción y contextualización del ámbito',
    'Fundamentos teóricos y normativa aplicable',
    'Casos prácticos guiados paso a paso',
    'Dinámicas grupales y role-play',
    'Evaluación y aplicación al puesto',
  ];

  // Contenidos que se reciben
  const includes = [
    { icon: '◆', label: course.hours + ' horas lectivas' },
    { icon: '◉', label: 'Certificado acreditado al finalizar' },
    { icon: '★', label: 'Material descargable (PDFs y ejercicios)' },
    { icon: '✦', label: 'Acceso de por vida al material' },
    { icon: '◈', label: 'Soporte directo del formador' },
  ];

  const doEnroll = () => setCheckoutCourse(course);

  return React.createElement('div', null,
    // Back
    React.createElement('button', {
      onClick: () => { setDetailCourseId(null); setCurrentView('catalogo'); },
      style: { background: 'none', border: 'none', color: theme.textLight, fontFamily: 'Lato', fontSize: 12, cursor: 'pointer', marginBottom: 14, padding: 0 },
    }, '← Volver al catálogo'),

    // Hero
    React.createElement('div', {
      style: {
        background: `linear-gradient(135deg, ${COLORS.orange}, ${COLORS.pink} 60%, ${COLORS.fuchsia})`,
        color: '#fff', borderRadius: 18, padding: '30px 34px',
        marginBottom: 20, position: 'relative', overflow: 'hidden',
        boxShadow: '0 16px 40px rgba(231,61,100,0.28)',
      },
    },
      React.createElement('div', { style: { position: 'absolute', top: -40, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' } }),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'flex-end', position: 'relative' } },
        React.createElement('div', null,
          React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 14 } },
            React.createElement(Pill, { text: course.area, color: '#fff', bg: 'rgba(255,255,255,0.2)' }),
            React.createElement(Pill, { text: course.modality, color: '#fff', bg: 'rgba(255,255,255,0.2)' }),
            React.createElement(Pill, { text: course.level, color: '#fff', bg: 'rgba(255,255,255,0.2)' }),
          ),
          React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 26, fontWeight: 800, lineHeight: 1.2, letterSpacing: -0.5, marginBottom: 10 } }, course.title),
          React.createElement('p', { style: { fontFamily: 'Lato', fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.92)', maxWidth: 640, marginBottom: 16 } }, course.subtitle),
          React.createElement('div', { style: { display: 'flex', gap: 18, fontFamily: 'Lato', fontSize: 12, color: 'rgba(255,255,255,0.88)', flexWrap: 'wrap' } },
            React.createElement('div', null, '★ ', React.createElement('b', null, avgRating || course.rating), ' (', courseReviews.length + ' reseñas', ')'),
            React.createElement('div', null, '◌ ', course.students + ' alumnos'),
            React.createElement('div', null, '☯ ', course.instructor),
            React.createElement('div', null, '◷ ', course.hours + ' horas'),
          ),
        ),
        React.createElement('button', {
          onClick: () => toggleFavorite(course.id),
          title: fav ? 'Quitar de favoritos' : 'Añadir a favoritos',
          style: {
            width: 44, height: 44, borderRadius: 12,
            background: fav ? '#fff' : 'rgba(255,255,255,0.15)',
            color: fav ? COLORS.red : '#fff', border: 'none',
            cursor: 'pointer', fontSize: 20,
          },
        }, fav ? '♥' : '♡'),
      ),
    ),

    // Two-col grid: left (tabs) + right (sidebar)
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 } },
      // ── Left: tabs (overview, temario, reseñas) ──
      React.createElement('div', null,
        React.createElement('div', {
          style: { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: theme.cardShadow },
        },
          React.createElement('div', {
            style: { display: 'flex', borderBottom: `1px solid ${theme.border}` },
          },
            [
              { id: 'overview', label: 'Descripción' },
              { id: 'syllabus', label: 'Temario' },
              { id: 'reviews',  label: 'Reseñas (' + courseReviews.length + ')' },
            ].map(t => React.createElement('button', {
              key: t.id,
              onClick: () => setTab(t.id),
              style: {
                padding: '14px 22px', background: 'none',
                border: 'none', borderBottom: tab === t.id ? `2px solid ${COLORS.orange}` : '2px solid transparent',
                color: tab === t.id ? COLORS.orange : theme.textLight,
                fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', letterSpacing: 0.3,
              },
            }, t.label)),
          ),
          React.createElement('div', { style: { padding: 24 } },
            tab === 'overview' && React.createElement('div', null,
              React.createElement('h3', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 15, fontWeight: 800, color: theme.text, marginBottom: 8 } }, 'Sobre este curso'),
              React.createElement('p', { style: { fontFamily: 'Lato', fontSize: 14, lineHeight: 1.7, color: theme.text, marginBottom: 18 } }, course.subtitle, ' Esta formación está diseñada para profesionales del sector que buscan integrar herramientas aplicables desde el primer día. Combina teoría, casos prácticos y material complementario para garantizar un aprendizaje sólido y actualizado.'),
              React.createElement('h3', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 15, fontWeight: 800, color: theme.text, marginBottom: 10 } }, 'Qué incluye'),
              React.createElement('ul', { style: { listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
                includes.map((inc, i) => React.createElement('li', {
                  key: i,
                  style: { display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Lato', fontSize: 13, color: theme.text, padding: '8px 0' },
                },
                  React.createElement('span', { style: { color: COLORS.orange, fontSize: 16 } }, inc.icon),
                  inc.label,
                )),
              ),
            ),
            tab === 'syllabus' && React.createElement('div', null,
              React.createElement('h3', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 15, fontWeight: 800, color: theme.text, marginBottom: 12 } }, 'Contenidos del curso'),
              React.createElement('ol', { style: { listStyle: 'none', padding: 0, margin: 0 } },
                syllabus.map((s, i) => React.createElement('li', {
                  key: i,
                  style: {
                    padding: '14px 16px', marginBottom: 8,
                    background: theme.surface2 || '#fafbfc',
                    borderRadius: 10, border: `1px solid ${theme.border}`,
                    display: 'flex', alignItems: 'center', gap: 14,
                  },
                },
                  React.createElement('div', {
                    style: { width: 28, height: 28, borderRadius: 8, background: COLORS.gradientSoft, color: COLORS.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: 13, flexShrink: 0 },
                  }, (i + 1).toString().padStart(2, '0')),
                  React.createElement('div', {
                    style: { flex: 1, fontFamily: 'Lato', fontSize: 13, color: theme.text, fontWeight: 600 },
                  }, 'Módulo ' + (i + 1) + ' · ' + s),
                  React.createElement('div', {
                    style: { fontFamily: 'Lato', fontSize: 11, color: theme.textLight },
                  }, Math.round(course.hours / syllabus.length) + ' h'),
                )),
              ),
            ),
            tab === 'reviews' && React.createElement('div', null,
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 20, marginBottom: 22 } },
                React.createElement('div', null,
                  React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 44, fontWeight: 800, color: theme.text, letterSpacing: -1, lineHeight: 1 } }, avgRating || course.rating),
                  React.createElement(StarRating, { value: Math.round(avgRating || course.rating), readOnly: true, size: 18 }),
                  React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: theme.textLight, marginTop: 4 } }, courseReviews.length, ' reseñas de alumnos'),
                ),
              ),
              // Lista de reseñas
              courseReviews.length === 0 && React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: theme.textLight, padding: '16px 0' } }, 'Aún no hay reseñas para este curso. ¡Sé el primero!'),
              courseReviews.map(r => React.createElement('div', {
                key: r.id,
                style: { padding: '14px 0', borderTop: `1px solid ${theme.border}` },
              },
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 } },
                  React.createElement(StarRating, { value: r.rating, readOnly: true, size: 13 }),
                  React.createElement('span', { style: { fontFamily: 'Lato', fontSize: 11, color: theme.textLight } }, r.date),
                ),
                React.createElement('p', { style: { fontFamily: 'Lato', fontSize: 13, color: theme.text, lineHeight: 1.5 } }, r.comment),
              )),
              // Formulario de reseña (si el curso está completado)
              enrollment && enrollment.status === 'completado' && !alreadyReviewed && React.createElement('div', {
                style: { marginTop: 22, padding: 18, background: theme.surface2 || '#fafbfc', borderRadius: 12, border: `1px solid ${theme.border}` },
              },
                React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: theme.text, marginBottom: 8 } }, 'Deja tu valoración'),
                React.createElement('div', { style: { marginBottom: 10 } },
                  React.createElement(StarRating, { value: myRating, onChange: setMyRating, size: 22 }),
                ),
                React.createElement('textarea', {
                  value: myComment, onChange: e => setMyComment(e.target.value),
                  placeholder: 'Cuenta tu experiencia con el curso…',
                  rows: 3,
                  style: { width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${theme.border}`, fontFamily: 'Lato', fontSize: 13, resize: 'vertical', background: theme.surface, color: theme.text },
                }),
                React.createElement('button', {
                  onClick: () => { if (myRating > 0) { submitReview(course.id, myRating, myComment); setMyComment(''); setMyRating(0); } },
                  disabled: myRating === 0,
                  style: { marginTop: 10, padding: '10px 18px', borderRadius: 8, background: myRating === 0 ? '#e4e7ef' : COLORS.gradient, color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 12, cursor: myRating === 0 ? 'not-allowed' : 'pointer' },
                }, 'Publicar reseña'),
              ),
            ),
          ),
        ),
      ),

      // ── Right: sidebar ──
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
        // Tarjeta de inscripción / progreso
        React.createElement('div', {
          style: { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 22, boxShadow: theme.cardShadow, position: 'sticky', top: 84 },
        },
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 34, fontWeight: 800, color: COLORS.orange, letterSpacing: -0.5 } }, course.price + ' €'),
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: theme.textLight, marginBottom: 18 } }, 'IVA incluido · ', course.hours, ' horas lectivas'),

          enrollment
            ? React.createElement('div', null,
                React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: theme.textLight, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 } }, 'Tu progreso'),
                React.createElement(Progress, { value: enrollment.progress || 0 }),
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontFamily: 'Lato', fontSize: 11, color: theme.textLight, marginTop: 6 } },
                  React.createElement('span', null, enrollment.progress || 0, '% completado'),
                  React.createElement('span', null, 'Estado: ', enrollment.status),
                ),
                enrollment.status !== 'completado' && React.createElement('button', {
                  onClick: () => advanceProgress(enrollment.id, 10),
                  style: { width: '100%', marginTop: 14, padding: 12, borderRadius: 9, background: COLORS.gradient, color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 13, cursor: 'pointer' },
                }, 'Continuar curso · +10%'),
                enrollment.status !== 'completado' && React.createElement('button', {
                  onClick: () => completeEnrollment(enrollment.id),
                  style: { width: '100%', marginTop: 8, padding: 10, borderRadius: 9, background: theme.surface2 || '#fafbfc', color: theme.text, border: `1px solid ${theme.border}`, fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 12, cursor: 'pointer' },
                }, 'Marcar como completado'),
                enrollment.status === 'completado' && React.createElement('div', {
                  style: { marginTop: 14, padding: 14, borderRadius: 9, background: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' },
                },
                  React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: '#166534' } }, '✓ Curso completado'),
                  React.createElement('button', {
                    onClick: () => setCurrentView('diplomas'),
                    style: { marginTop: 10, padding: '8px 14px', borderRadius: 7, background: '#166534', color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 11, cursor: 'pointer' },
                  }, 'Ver diploma →'),
                ),
              )
            : React.createElement('button', {
                onClick: doEnroll,
                style: { width: '100%', padding: 14, borderRadius: 10, background: COLORS.gradient, color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: '0 8px 20px rgba(244,120,9,0.28)', letterSpacing: 0.3 },
              }, 'Inscribirme ahora →'),

          // Check-in cross-app: «Estoy aquí» + validación por el formador
          enrollment && enrollment.status !== 'completado' && React.createElement(CheckInWidget, { course, enrollment, theme }),

          React.createElement('div', { style: { marginTop: 18, paddingTop: 18, borderTop: `1px solid ${theme.border}`, fontFamily: 'Lato', fontSize: 12, color: theme.textLight, lineHeight: 1.9 } },
            React.createElement('div', null, '◷ ', React.createElement('b', { style: { color: theme.text } }, 'Inicio:'), ' ', course.dates),
            React.createElement('div', null, '◌ ', React.createElement('b', { style: { color: theme.text } }, 'Horario:'), ' ', course.time),
            React.createElement('div', null, '☯ ', React.createElement('b', { style: { color: theme.text } }, 'Lugar:'), ' ', course.location),
            React.createElement('div', null, '◆ ', React.createElement('b', { style: { color: theme.text } }, 'Categoría:'), ' ', course.category),
          ),
        ),
      ),
    ),
  );
}

// ─── Check-in widget (self check-in cross-app) ───────────────────────────────
// El alumno pulsa «Estoy aquí» al llegar al aula. Se escribe un registro en el
// bus compartido (localStorage) que la app del formador lee en tiempo real.
// El formador lo valida con ✓ / ◐ / ✗ y el alumno ve el resultado.
//
// FILEMAKER: Sustituir el bus localStorage por:
//   • WebSocket FM o Server-Sent Events, O
//   • Polling cada 10 s sobre Asistencia_CheckIns, O
//   • PushNotification API (FM 20+).
function CheckInWidget({ course, enrollment, theme }) {
  const { user, showToast } = React.useContext(AppContext);
  const today = new Date().toISOString().slice(0, 10);
  // Estado local: {null | 'pending' | 'confirmed' | 'partial' | 'rejected'}
  const [myCheckIn, setMyCheckIn] = React.useState(null);

  React.useEffect(() => {
    if (!window.AttendanceBus) return;
    return window.AttendanceBus.subscribe((bus) => {
      const mine = bus.find(e => e.courseId === course.id && e.studentId === user.id && e.sessionDate === today);
      setMyCheckIn(mine || null);
    });
  }, [course.id, user.id, today]);

  const doCheckIn = () => {
    if (!window.AttendanceBus) return;
    window.AttendanceBus.checkIn({
      courseId:     course.id,
      courseTitle:  course.title,
      sessionDate:  today,
      studentId:    user.id,
      studentName:  user.name,
    });
    showToast('Check-in enviado · pendiente de validación');
  };

  if (!myCheckIn) {
    return React.createElement('button', {
      onClick: doCheckIn,
      style: { width: '100%', marginTop: 8, padding: '11px 14px', borderRadius: 9, background: theme.surface2 || '#fafbfc', color: COLORS.orange, border: `1.5px dashed ${COLORS.orange}`, fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 12, cursor: 'pointer' },
    }, '📍 Estoy aquí · confirmar asistencia');
  }

  const status = myCheckIn.status;
  const look = {
    pending:   { bg: `${COLORS.orange}12`, color: COLORS.orange,   border: `1px solid ${COLORS.orange}30`, text: '⏳ Check-in enviado · pendiente' },
    confirmed: { bg: '#f0fdf4',            color: '#166534',       border: '1px solid #bbf7d0',            text: '✓ Asistencia confirmada' },
    partial:   { bg: `${COLORS.orange}15`, color: COLORS.orange,   border: `1px solid ${COLORS.orange}40`, text: '◐ Asistencia parcial' },
    rejected:  { bg: `${COLORS.red}12`,    color: COLORS.red,      border: `1px solid ${COLORS.red}40`,    text: '✗ No validada' },
  }[status] || { bg: '#f4f5f9', color: theme.text, border: `1px solid ${theme.border}`, text: status };

  return React.createElement('div', {
    style: { marginTop: 8, padding: '11px 14px', borderRadius: 9, background: look.bg, color: look.color, border: look.border, fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 12, textAlign: 'center' },
  }, look.text);
}

window.AlumnoCourseDetailView = AlumnoCourseDetailView;
