// ─── CESEA Formación · Alumnado — Catálogo de cursos ─────────────────────────
//
// Grid con todos los cursos del catálogo. Incluye:
//   • Búsqueda por texto (título + subtítulo + categoría + instructor)
//   • Filtros: área, modalidad, nivel, precio (rangos)
//   • Marca de favoritos
//   • Orden: popularidad (rating) / precio / horas / recientes
//
// FILEMAKER: Layout "Alumno_Catalogo" — Find Mode con criterios combinados.
//   El filtro de precio usa Find con rangos (ej. 0...100).
// ─────────────────────────────────────────────────────────────────────────────

function AlumnoCatalogView() {
  const {
    courses, favorites, toggleFavorite, theme,
    setDetailCourseId, setCurrentView, enrollments,
  } = React.useContext(AppContext);

  const [query,     setQuery]     = React.useState('');
  const [area,      setArea]      = React.useState('all');
  const [modality,  setModality]  = React.useState('all');
  const [level,     setLevel]     = React.useState('all');
  const [priceRange,setPriceRange]= React.useState('all');
  const [sortBy,    setSortBy]    = React.useState('popular');
  const [onlyFav,   setOnlyFav]   = React.useState(false);

  const areas      = React.useMemo(() => ['all', ...Array.from(new Set(courses.map(c => c.area)))], [courses]);
  const modalities = ['all', 'Online', 'Presencial', 'Híbrido'];
  const levels     = ['all', 'Básico', 'Intermedio', 'Avanzado'];
  const priceRanges= [
    { id: 'all',  label: 'Cualquier precio' },
    { id: '0-79',   label: 'Hasta 79 €',    min: 0,   max: 79  },
    { id: '80-149', label: '80 – 149 €',    min: 80,  max: 149 },
    { id: '150-99',label: 'Más de 150 €',  min: 150, max: 9999 },
  ];

  const isEnrolled = (courseId) => enrollments.some(e => e.courseId === courseId);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const pr = priceRanges.find(p => p.id === priceRange);
    let result = courses.filter(c => {
      if (area     !== 'all' && c.area     !== area)     return false;
      if (modality !== 'all' && c.modality !== modality) return false;
      if (level    !== 'all' && c.level    !== level)    return false;
      if (pr && pr.min != null && (c.price < pr.min || c.price > pr.max)) return false;
      if (onlyFav  && !favorites.includes(c.id))         return false;
      if (q) {
        const hay = (c.title + ' ' + c.subtitle + ' ' + c.category + ' ' + c.instructor).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (sortBy === 'popular')   result = [...result].sort((a, b) => b.rating - a.rating);
    if (sortBy === 'price-asc') result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc')result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === 'hours')     result = [...result].sort((a, b) => b.hours - a.hours);
    return result;
  }, [courses, query, area, modality, level, priceRange, sortBy, onlyFav, favorites]);

  const areaAccent = {
    'Área técnica':               COLORS.orange,
    'Competencias':               COLORS.cyan,
    'ACP y Modelo de Atención':   COLORS.pink,
    'Área de autocuidados':       COLORS.fuchsia,
  };

  // FILEMAKER: Portal "Cursos_Relacionados" — filtra cursos cuyo area
  //   pertenezca al conjunto de áreas ya cursadas por el alumno, excluyendo
  //   los que ya tiene inscritos. Limit 4, ordenado por rating desc.
  const relatedCourses = React.useMemo(() => {
    const userAreas = new Set(
      enrollments
        .map(en => courses.find(c => c.id === en.courseId)?.area)
        .filter(Boolean)
    );
    const pool = courses.filter(c => !isEnrolled(c.id));
    if (userAreas.size === 0) {
      return [...pool].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);
    }
    return pool.filter(c => userAreas.has(c.area))
               .sort((a, b) => (b.rating || 0) - (a.rating || 0))
               .slice(0, 4);
  }, [courses, enrollments]);

  // Contador por área para los chips (cursos disponibles no inscritos en esa área)
  const areaCounts = React.useMemo(() => {
    const counts = {};
    courses.forEach(c => {
      if (isEnrolled(c.id)) return;
      counts[c.area] = (counts[c.area] || 0) + 1;
    });
    return counts;
  }, [courses, enrollments]);

  const openCourse = (id) => { setDetailCourseId(id); setCurrentView('detalle-curso'); };

  return React.createElement('div', null,
    // ── Header ──
    React.createElement('div', { style: { marginBottom: 22 } },
      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: theme.textLight, fontWeight: 700, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 4 } }, 'Catálogo'),
      React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 28, fontWeight: 800, color: theme.text, letterSpacing: -0.5, marginBottom: 6 } },
        'Explora la ',
        React.createElement('span', { style: { background: COLORS.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } }, 'formación completa'),
        '.',
      ),
      React.createElement('p', { style: { fontFamily: 'Lato', fontSize: 13, color: theme.textLight } }, courses.length, ' cursos disponibles. Filtra, busca y encuentra la próxima formación que impulse tu carrera.'),
    ),

    // ── Cursos relacionados ──
    relatedCourses.length > 0 && React.createElement('div', { style: { marginBottom: 22 } },
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 } },
        React.createElement('div', null,
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.orange, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 2 } }, 'Para ti'),
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 18, fontWeight: 800, color: theme.text } }, 'Relacionados con tu formación'),
        ),
        React.createElement('a', {
          href: 'https://csaformacion.com/formacion/', target: '_blank', rel: 'noopener noreferrer',
          style: { fontFamily: 'Bricolage Grotesque', fontSize: 12, fontWeight: 700, color: COLORS.orange, textDecoration: 'none' },
        }, 'Ver catálogo completo →'),
      ),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 } },
        relatedCourses.map(c => React.createElement('div', {
          key: c.id,
          onClick: () => openCourse(c.id),
          style: {
            background: theme.surface, border: `1px solid ${theme.border}`,
            borderRadius: 10, padding: 12, cursor: 'pointer',
            boxShadow: theme.cardShadow, transition: 'transform 0.18s',
          },
          onMouseEnter: e => e.currentTarget.style.transform = 'translateY(-2px)',
          onMouseLeave: e => e.currentTarget.style.transform = 'translateY(0)',
        },
          React.createElement('div', { style: { height: 56, borderRadius: 7, background: `linear-gradient(135deg, ${areaAccent[c.area] || COLORS.orange}, ${COLORS.pink})`, marginBottom: 8, display: 'flex', alignItems: 'flex-end', padding: 6 } },
            React.createElement('span', { style: { fontFamily: 'Lato', fontSize: 9, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 1 } }, c.area),
          ),
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 12, fontWeight: 800, color: theme.text, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 30 } }, c.title),
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 10, color: theme.textLight, marginTop: 4 } }, c.hours, ' h · ', c.price, ' €'),
        )),
      ),
    ),

    // ── Chips de áreas con contador ──
    React.createElement('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 } },
      areas.filter(a => a !== 'all').map(a => {
        const count = areaCounts[a] || 0;
        const active = area === a;
        const dim = count === 0;
        return React.createElement('button', {
          key: a,
          onClick: () => setArea(active ? 'all' : a),
          style: {
            padding: '8px 14px', borderRadius: 999,
            border: `1px solid ${active ? (areaAccent[a] || COLORS.orange) : theme.border}`,
            background: active ? `${areaAccent[a] || COLORS.orange}12` : theme.surface,
            color: active ? (areaAccent[a] || COLORS.orange) : (dim ? theme.textLight : theme.text),
            fontFamily: 'Lato', fontSize: 12, fontWeight: active ? 800 : 600,
            cursor: 'pointer', opacity: dim ? 0.55 : 1,
            display: 'inline-flex', alignItems: 'center', gap: 7,
          },
        },
          a,
          React.createElement('span', {
            style: {
              padding: '1px 8px', borderRadius: 999,
              background: active ? (areaAccent[a] || COLORS.orange) : theme.surface2 || '#f0f1f5',
              color: active ? '#fff' : theme.textLight,
              fontSize: 10, fontWeight: 800, minWidth: 18, textAlign: 'center',
            },
          }, count),
        );
      }),
      area !== 'all' && React.createElement('button', {
        onClick: () => setArea('all'),
        style: { padding: '8px 14px', borderRadius: 999, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textLight, fontFamily: 'Lato', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
      }, 'Limpiar área'),
    ),

    // ── Barra de búsqueda + filtros (sin select de área, reemplazado por chips) ──
    React.createElement('div', {
      style: {
        background: theme.surface, border: `1px solid ${theme.border}`,
        borderRadius: 14, padding: 16, marginBottom: 18,
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10,
        boxShadow: theme.cardShadow,
      },
    },
      React.createElement('input', {
        type: 'search', value: query, onChange: e => setQuery(e.target.value),
        placeholder: '🔍 Busca por título, categoría, formador…',
        style: { padding: '11px 14px', borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.surface2 || '#fafbfc', fontSize: 13, fontFamily: 'Lato', outline: 'none', color: theme.text },
      }),
      React.createElement('select', {
        value: modality, onChange: e => setModality(e.target.value),
        style: { padding: '11px 12px', borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.surface2 || '#fafbfc', fontSize: 13, fontFamily: 'Lato', cursor: 'pointer', color: theme.text },
      },
        modalities.map(m => React.createElement('option', { key: m, value: m }, m === 'all' ? 'Cualquier modalidad' : m)),
      ),
      React.createElement('select', {
        value: level, onChange: e => setLevel(e.target.value),
        style: { padding: '11px 12px', borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.surface2 || '#fafbfc', fontSize: 13, fontFamily: 'Lato', cursor: 'pointer', color: theme.text },
      },
        levels.map(l => React.createElement('option', { key: l, value: l }, l === 'all' ? 'Cualquier nivel' : l)),
      ),
      React.createElement('select', {
        value: priceRange, onChange: e => setPriceRange(e.target.value),
        style: { padding: '11px 12px', borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.surface2 || '#fafbfc', fontSize: 13, fontFamily: 'Lato', cursor: 'pointer', color: theme.text },
      },
        priceRanges.map(p => React.createElement('option', { key: p.id, value: p.id }, p.label)),
      ),
    ),

    // ── Toolbar resultado + orden ──
    React.createElement('div', {
      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 },
    },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
        React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 700, color: theme.text } }, filtered.length, ' resultado', filtered.length === 1 ? '' : 's'),
        React.createElement('label', {
          style: { display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: 'Lato', fontSize: 12, color: theme.text },
        },
          React.createElement('input', {
            type: 'checkbox', checked: onlyFav, onChange: e => setOnlyFav(e.target.checked),
            style: { accentColor: COLORS.orange },
          }),
          'Solo favoritos (', favorites.length, ')',
        ),
      ),
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
        React.createElement('span', { style: { fontFamily: 'Lato', fontSize: 12, color: theme.textLight } }, 'Ordenar:'),
        React.createElement('select', {
          value: sortBy, onChange: e => setSortBy(e.target.value),
          style: { padding: '7px 10px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.surface, fontSize: 12, fontFamily: 'Lato', cursor: 'pointer', color: theme.text },
        },
          React.createElement('option', { value: 'popular' }, 'Más valorados'),
          React.createElement('option', { value: 'price-asc' }, 'Precio: menor a mayor'),
          React.createElement('option', { value: 'price-desc' }, 'Precio: mayor a menor'),
          React.createElement('option', { value: 'hours' }, 'Más horas'),
        ),
      ),
    ),

    // ── Grid de cursos ──
    filtered.length === 0
      ? React.createElement(EmptyState, {
          theme, icon: '◌', title: 'Sin resultados',
          text: 'Prueba con otros filtros o borra la búsqueda.',
          action: React.createElement('button', {
            onClick: () => { setQuery(''); setArea('all'); setModality('all'); setLevel('all'); setPriceRange('all'); setOnlyFav(false); },
            style: { padding: '11px 20px', borderRadius: 10, background: COLORS.orange, color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontWeight: 700, cursor: 'pointer', fontSize: 13 },
          }, 'Limpiar filtros'),
        })
      : React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 } },
          filtered.map(c => {
            const fav = favorites.includes(c.id);
            const enrolled = isEnrolled(c.id);
            return React.createElement('div', {
              key: c.id,
              style: {
                background: theme.surface, borderRadius: 14,
                border: `1px solid ${theme.border}`, overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: theme.cardShadow,
              },
              onMouseEnter: e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 20px 44px rgba(15,16,32,0.1)'; },
              onMouseLeave: e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = theme.cardShadow; },
            },
              // Media header
              React.createElement('div', {
                style: { height: 128, background: `linear-gradient(135deg, ${areaAccent[c.area] || COLORS.orange}, ${COLORS.pink})`, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: 14 },
              },
                React.createElement('button', {
                  onClick: (ev) => { ev.stopPropagation(); toggleFavorite(c.id); },
                  title: fav ? 'Quitar de favoritos' : 'Añadir a favoritos',
                  style: {
                    position: 'absolute', top: 10, right: 10,
                    width: 34, height: 34, borderRadius: 10,
                    background: fav ? '#fff' : 'rgba(15,16,32,0.35)',
                    color: fav ? COLORS.red : '#fff',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, backdropFilter: 'blur(4px)',
                  },
                }, fav ? '♥' : '♡'),
                React.createElement('div', { style: { position: 'absolute', top: 10, left: 10, padding: '3px 10px', background: 'rgba(15,16,32,0.35)', borderRadius: 999, color: '#fff', fontFamily: 'Lato', fontSize: 10, fontWeight: 700, letterSpacing: 0.8, backdropFilter: 'blur(4px)' } }, c.modality),
                React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 10, color: 'rgba(255,255,255,0.92)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.1 } }, c.area),
              ),
              // Body
              React.createElement('div', { style: { padding: '16px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column' } },
                React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: theme.text, lineHeight: 1.3, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 36 } }, c.title),
                React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: theme.textLight, lineHeight: 1.5, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1, minHeight: 30 } }, c.subtitle),
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Lato', fontSize: 11, color: theme.textLight, marginBottom: 14 } },
                  React.createElement('span', { style: { color: COLORS.yellow } }, '★ ' + c.rating),
                  React.createElement('span', null, c.students + ' alumnos'),
                  React.createElement('span', null, '· ', c.level),
                ),
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${theme.border}` } },
                  React.createElement('div', null,
                    React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 20, fontWeight: 800, color: COLORS.orange, letterSpacing: -0.3 } }, c.price + ' €'),
                    React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 10, color: theme.textLight } }, c.hours + ' h · IVA incl.'),
                  ),
                  React.createElement('button', {
                    onClick: () => openCourse(c.id),
                    style: {
                      padding: '9px 14px', borderRadius: 8,
                      background: enrolled ? theme.surface2 : COLORS.gradient,
                      color: enrolled ? theme.text : '#fff',
                      border: enrolled ? `1px solid ${theme.border}` : 'none',
                      fontFamily: 'Bricolage Grotesque', fontSize: 11, fontWeight: 700,
                      cursor: 'pointer', letterSpacing: 0.3,
                    },
                  }, enrolled ? 'Ya inscrito' : 'Ver curso →'),
                ),
              ),
            );
          }),
        ),
  );
}

window.AlumnoCatalogView = AlumnoCatalogView;
