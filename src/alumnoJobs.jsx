// ─── CESEA Formación · Alumnado — Bolsa de empleo ────────────────────────────
//
// Ofertas laborales del sector del alumno (dental / sanidad), publicadas por
// el superadmin de la app de formadores. En prototipo están aisladas: cuando
// se quiera unir, se consumirá el mismo endpoint FM.
//
// Funcionalidades:
//   • Filtro por sector (sector del alumno es el default)
//   • Búsqueda por texto (título, empresa, ubicación)
//   • Estado de postulación por oferta (postulado → visto → entrevista → etc.)
//   • Timeline de postulaciones activas
//
// FILEMAKER: Layout "Alumno_Empleo". Portal a Ofertas_Empleo con criterios de
//   Find. Tabla puente Postulaciones (id_alumno, id_oferta) con estado.
// ─────────────────────────────────────────────────────────────────────────────

function AlumnoJobsView() {
  const { jobs, applications, applyToJob, withdrawApplication, user, theme } = React.useContext(AppContext);
  const [query, setQuery] = React.useState('');
  const [onlyMine, setOnlyMine] = React.useState(false);

  const appFor = (jobId) => applications.find(a => a.jobId === jobId);

  // FILEMAKER: filtrado por sector es interno (Alumnos::sector == Ofertas::sector),
  //   no se expone en la UI — el alumno ve sólo las ofertas de su sector.
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter(j => {
      if (j.sector !== user.sector) return false;
      if (onlyMine && !appFor(j.id)) return false;
      if (q) {
        const hay = (j.title + ' ' + j.company + ' ' + j.location + ' ' + j.desc).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [jobs, user.sector, query, onlyMine, applications]);

  const statusPalette = {
    postulado:  { color: '#1d3557', bg: '#e3f2fd', label: 'Preinscrito' },
    visto:      { color: COLORS.cyan, bg: `${COLORS.cyan}15`, label: 'CV visto' },
    entrevista: { color: COLORS.orange, bg: `${COLORS.orange}15`, label: 'Entrevista' },
    aceptado:   { color: '#16a34a', bg: '#16a34a15', label: 'Aceptada' },
    rechazado:  { color: COLORS.red, bg: `${COLORS.red}14`, label: 'Rechazada' },
  };

  return React.createElement('div', null,
    React.createElement('div', { style: { marginBottom: 22 } },
      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: theme.textLight, fontWeight: 700, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 4 } }, 'Bolsa de empleo'),
      React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 28, fontWeight: 800, color: theme.text, letterSpacing: -0.5 } },
        'Ofertas ',
        React.createElement('span', { style: { background: COLORS.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } }, 'para ti'),
        '.',
      ),
      React.createElement('p', { style: { fontFamily: 'Lato', fontSize: 13, color: theme.textLight, marginTop: 4 } },
        'Ofertas publicadas por empresas colaboradoras. Preinscríbete con un clic usando el CV de tu perfil.',
      ),
    ),

    // Resumen de preinscripciones activas
    applications.length > 0 && React.createElement('div', {
      style: { marginBottom: 20, padding: 18, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, boxShadow: theme.cardShadow },
    },
      React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: theme.text, marginBottom: 10 } },
        'Tus preinscripciones activas (', applications.length, ')',
      ),
      React.createElement('div', { style: { display: 'flex', gap: 10, flexWrap: 'wrap' } },
        applications.map(a => {
          const job = jobs.find(j => j.id === a.jobId);
          if (!job) return null;
          const p = statusPalette[a.status] || statusPalette.postulado;
          return React.createElement('div', {
            key: a.id,
            style: { padding: '10px 14px', borderRadius: 10, background: theme.surface2 || '#fafbfc', border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 12, flex: '1 1 280px' },
          },
            React.createElement('div', { style: { flex: 1, minWidth: 0 } },
              React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 12, fontWeight: 800, color: theme.text, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' } }, job.title),
              React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: theme.textLight } }, job.company),
            ),
            React.createElement(Pill, { text: p.label, color: p.color, bg: p.bg, small: true }),
            React.createElement('button', {
              onClick: () => withdrawApplication(a.id),
              title: 'Retirar preinscripción',
              style: { background: 'none', border: 'none', color: theme.textLight, cursor: 'pointer', fontSize: 18, padding: '0 4px' },
            }, '×'),
          );
        }),
      ),
    ),

    // Filtros
    React.createElement('div', {
      style: { display: 'flex', gap: 10, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' },
    },
      React.createElement('input', {
        type: 'search', value: query, onChange: e => setQuery(e.target.value),
        placeholder: '🔍 Buscar por título, empresa, ciudad…',
        style: { flex: 1, minWidth: 260, padding: '11px 14px', borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.surface, fontSize: 13, fontFamily: 'Lato', outline: 'none', color: theme.text },
      }),
      // FILEMAKER: El filtro de sector se resuelve en backend — ocultado en la UI.
      React.createElement('label', {
        style: { display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: 'Lato', fontSize: 12, color: theme.text, marginLeft: 8 },
      },
        React.createElement('input', {
          type: 'checkbox', checked: onlyMine, onChange: e => setOnlyMine(e.target.checked),
          style: { accentColor: COLORS.orange },
        }),
        'Solo mis preinscripciones',
      ),
    ),

    // Lista de ofertas
    filtered.length === 0
      ? React.createElement(EmptyState, { theme, icon: '◌', title: 'No hay ofertas que coincidan', text: 'Prueba ampliando los filtros o revísalas más tarde.' })
      : React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 } },
          filtered.map(j => {
            const app = appFor(j.id);
            const p = app && statusPalette[app.status];
            return React.createElement('div', {
              key: j.id,
              style: {
                background: theme.surface, border: `1px solid ${theme.border}`,
                borderRadius: 14, padding: 22, display: 'flex', flexDirection: 'column',
                gap: 12, boxShadow: theme.cardShadow, minHeight: 240,
              },
            },
              React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 } },
                React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                  React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 16, fontWeight: 800, color: theme.text, lineHeight: 1.3 } }, j.title),
                  React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: theme.textLight, marginTop: 2 } }, j.company, ' · ', j.location),
                ),
                p && React.createElement(Pill, { text: p.label, color: p.color, bg: p.bg, small: true }),
              ),
              React.createElement('p', { style: { fontFamily: 'Lato', fontSize: 13, color: theme.text, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 } }, j.desc),
              React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8, fontFamily: 'Lato', fontSize: 11, color: theme.textLight } },
                React.createElement('span', null, '◷ ', j.hours),
                React.createElement('span', null, '€ ', j.salary),
                React.createElement('span', null, '◈ ', j.modality),
                React.createElement('span', null, '· Publicada ', j.posted),
              ),
              app && app.status === 'entrevista' && React.createElement('div', {
                style: { padding: '8px 12px', borderRadius: 8, background: `${COLORS.orange}10`, borderLeft: `3px solid ${COLORS.orange}`, fontFamily: 'Lato', fontSize: 12, color: theme.text },
              },
                React.createElement('b', null, 'Notas: '), app.notes,
              ),
              React.createElement('div', { style: { display: 'flex', gap: 8, paddingTop: 6, borderTop: `1px solid ${theme.border}` } },
                app
                  ? React.createElement('button', {
                      onClick: () => withdrawApplication(app.id),
                      style: { flex: 1, padding: '10px 14px', borderRadius: 9, background: theme.surface2 || '#fafbfc', color: COLORS.red, border: `1px solid ${COLORS.red}40`, fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 12, cursor: 'pointer' },
                    }, 'Retirar preinscripción')
                  : React.createElement('button', {
                      onClick: () => applyToJob(j.id),
                      disabled: !user.cvFileName,
                      title: user.cvFileName ? 'Preinscribirse con tu CV actual' : 'Sube un CV desde tu perfil para preinscribirte',
                      style: {
                        flex: 1, padding: '10px 14px', borderRadius: 9,
                        background: user.cvFileName ? COLORS.gradient : '#e4e7ef',
                        color: user.cvFileName ? '#fff' : theme.textLight,
                        border: 'none', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 12,
                        cursor: user.cvFileName ? 'pointer' : 'not-allowed',
                      },
                    }, user.cvFileName ? 'Preinscribirme →' : 'Sube tu CV primero'),
              ),
            );
          }),
        ),
  );
}

window.AlumnoJobsView = AlumnoJobsView;
