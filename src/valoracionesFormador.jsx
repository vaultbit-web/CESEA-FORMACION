// ─── CESEA Formación · Formador — Valoraciones recibidas ─────────────────────
//
// Reseñas que los alumnos han dejado sobre los cursos impartidos por el
// formador. Muestra:
//   • Rating medio + número total
//   • Distribución por estrellas (mini barras 1★-5★)
//   • Lista ordenable: recientes / mejor valoradas / peor valoradas
//
// FILEMAKER: Script "Valoraciones_Por_Formador" ejecuta un join entre
//   Valoraciones ⨯ Inscripciones_Alumno ⨯ Cursos para traer solo las reseñas
//   de los cursos del formador autenticado. Layout "Formador_Valoraciones".
// ─────────────────────────────────────────────────────────────────────────────

function ValoracionesRecibidasView() {
  const { reviewsPublic, courses, user } = React.useContext(AppContext);
  const vp = window.useViewport ? window.useViewport() : { isSmall: false };
  const isSmall = vp.isSmall;
  const [sort, setSort] = React.useState('recent');

  // Filtrar reseñas cuyo instructor coincide con el formador actual.
  // Demo: si el user es MOCK_FORMADOR (Ana García López), verá las suyas.
  const myReviews = React.useMemo(() => {
    return reviewsPublic.filter(r => r.instructor === user?.name);
  }, [reviewsPublic, user]);

  const sorted = React.useMemo(() => {
    const arr = [...myReviews];
    if (sort === 'recent')  arr.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    if (sort === 'best')    arr.sort((a, b) => b.rating - a.rating);
    if (sort === 'worst')   arr.sort((a, b) => a.rating - b.rating);
    return arr;
  }, [myReviews, sort]);

  const avg = myReviews.length
    ? +(myReviews.reduce((s, r) => s + r.rating, 0) / myReviews.length).toFixed(2)
    : 0;
  const distribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: myReviews.filter(r => r.rating === stars).length,
    pct: myReviews.length ? Math.round((myReviews.filter(r => r.rating === stars).length / myReviews.length) * 100) : 0,
  }));

  const getCourseTitle = (id) => courses.find(c => c.id === id)?.title || 'Curso';

  const TABS = [
    { id: 'recent', label: 'Más recientes' },
    { id: 'best',   label: 'Mejor valoradas' },
    { id: 'worst',  label: 'Peor valoradas' },
  ];

  return React.createElement('div', null,
    // Header
    React.createElement('div', { style: { marginBottom: 22 } },
      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, fontWeight: 700, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 4 } }, 'Feedback de tus alumnos'),
      React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 28, fontWeight: 800, color: COLORS.dark, letterSpacing: -0.5 } }, 'Valoraciones recibidas'),
      React.createElement('p', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight, marginTop: 4 } },
        'Todas las reseñas de tus alumnos sobre los cursos que impartes.',
      ),
    ),

    myReviews.length === 0
      ? React.createElement(EmptyState, { icon: '★', title: 'Sin valoraciones aún', text: 'Las reseñas que dejen tus alumnos aparecerán aquí. Al completar un curso, se les invita a valorarlo.' })
      : React.createElement(React.Fragment, null,
          // ── Panel resumen: media + distribución ──
          React.createElement('div', {
            style: {
              background: '#fff', border: '1px solid #eceef4', borderRadius: 14,
              padding: 22, marginBottom: 18,
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 28, alignItems: 'center',
            },
          },
            // Izquierda: media grande
            React.createElement('div', { style: { textAlign: 'center' } },
              React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 52, fontWeight: 800, color: COLORS.dark, letterSpacing: -1.5, lineHeight: 1 } }, avg.toFixed(1).replace('.', ',')),
              React.createElement('div', { style: { marginTop: 4 } },
                React.createElement(StarRating, { value: Math.round(avg), readOnly: true, size: 20 }),
              ),
              React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, marginTop: 6 } },
                myReviews.length, ' reseña', myReviews.length === 1 ? '' : 's', ' · media global',
              ),
            ),
            // Derecha: distribución barras
            React.createElement('div', null,
              ...distribution.map(d => React.createElement('div', {
                key: d.stars,
                style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 },
              },
                React.createElement('span', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, fontWeight: 700, width: 32 } }, d.stars, '★'),
                React.createElement('div', { style: { flex: 1, height: 8, borderRadius: 4, background: '#f4f5f9', overflow: 'hidden' } },
                  React.createElement('div', { style: { width: d.pct + '%', height: '100%', background: d.stars >= 4 ? '#16a34a' : d.stars === 3 ? COLORS.yellow : COLORS.red, borderRadius: 4, transition: 'width 0.5s ease' } }),
                ),
                React.createElement('span', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 12, fontWeight: 800, color: COLORS.dark, width: 40, textAlign: 'right' } }, d.count),
              )),
            ),
          ),

          // ── Tabs de ordenación ──
          React.createElement('div', {
            style: { display: 'flex', gap: 4, marginBottom: 14, background: '#fafbfc', padding: 5, borderRadius: 10, border: '1px solid #eceef4', width: 'fit-content' },
          },
            TABS.map(t => React.createElement('button', {
              key: t.id,
              onClick: () => setSort(t.id),
              style: {
                padding: '8px 14px', borderRadius: 7, border: 'none',
                background: sort === t.id ? '#fff' : 'transparent',
                color: sort === t.id ? COLORS.orange : COLORS.textLight,
                fontFamily: 'Bricolage Grotesque', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', letterSpacing: 0.3,
                boxShadow: sort === t.id ? '0 2px 8px rgba(15,16,32,0.05)' : 'none',
                transition: 'all 0.18s',
              },
            }, t.label)),
          ),

          // ── Lista de reseñas ──
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
            sorted.map(r => React.createElement('div', {
              key: r.id,
              style: { background: '#fff', border: '1px solid #eceef4', borderRadius: 12, padding: 18, boxShadow: '0 1px 3px rgba(18,20,35,0.03)' },
            },
              React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10, flexWrap: 'wrap' } },
                React.createElement('div', null,
                  React.createElement(StarRating, { value: r.rating, readOnly: true, size: 16 }),
                  React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 800, color: COLORS.dark, marginTop: 6, lineHeight: 1.3 } }, getCourseTitle(r.courseId)),
                ),
                React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, whiteSpace: 'nowrap' } }, r.date),
              ),
              React.createElement('p', {
                style: { fontFamily: 'Lato', fontSize: 14, color: COLORS.text, lineHeight: 1.55, marginBottom: 10, fontStyle: 'italic' },
              }, '“', r.comment, '”'),
              React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight } },
                '— ', React.createElement('b', { style: { color: COLORS.text } }, r.studentName),
              ),
            )),
          ),
        ),
  );
}

window.ValoracionesRecibidasView = ValoracionesRecibidasView;
