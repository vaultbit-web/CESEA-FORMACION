// ─── CESEA Formación · Alumnado — Dashboard (home tras login) ─────────────────
//
// Vista de aterrizaje del alumno autenticado. Muestra estado general, cursos
// en progreso, próxima sesión, oferta destacada del sector y diplomas recientes.
//
// FILEMAKER: Layout "Alumno_Dashboard". Usa summary fields y portales filtrados.
// ─────────────────────────────────────────────────────────────────────────────

function AlumnoDashboardView() {
  const {
    user, courses, enrollments, diplomas, jobs, applications, badges,
    theme, setCurrentView, setDetailCourseId, advanceProgress,
  } = React.useContext(AppContext);
  const vp = window.useViewport ? window.useViewport() : { isMobile: false, isSmall: false };
  const isSmall = vp.isSmall;

  // ── Cálculos agregados ──
  const completed       = enrollments.filter(e => e.status === 'completado');
  const inProgress      = enrollments.filter(e => e.status === 'en_progreso' || e.status === 'inscrito');
  const totalHours      = completed.reduce((s, e) => {
    const c = courses.find(c => c.id === e.courseId);
    return s + (c?.hours || 0);
  }, 0);
  const nextCourse      = inProgress.find(e => e.nextSession);
  const featuredJob     = jobs.find(j => j.sector === user.sector);
  const hasAppliedTo    = (jobId) => applications.some(a => a.jobId === jobId);

  // ── Badges conseguidos ──
  const earnedBadges = badges.filter(b => {
    if (b.metric === 'hours')   return totalHours    >= b.threshold;
    if (b.metric === 'reviews') return false; // Reviews computed separately if needed
    return completed.length >= b.threshold;
  });

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 20) return 'Buenas tardes';
    return 'Buenas noches';
  })();

  return React.createElement('div', null,
    // ── Saludo + resumen ──
    React.createElement('div', {
      style: {
        background: COLORS.gradient, color: '#fff',
        padding: '32px 34px', borderRadius: 18,
        marginBottom: 22, position: 'relative', overflow: 'hidden',
        boxShadow: '0 20px 48px rgba(244,120,9,0.24)',
      },
    },
      React.createElement('div', { style: { position: 'absolute', top: -60, right: -40, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', pointerEvents: 'none' } }),
      React.createElement('div', { style: { position: 'relative' } },
        React.createElement('div', {
          style: { fontFamily: 'Lato', fontSize: 12, color: 'rgba(255,255,255,0.82)', letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 },
        }, greeting + ', ' + (user.name || '').split(' ')[0]),
        React.createElement('h1', {
          style: { fontFamily: 'Bricolage Grotesque', fontSize: 30, fontWeight: 800, letterSpacing: -0.6, marginBottom: 10 },
        }, 'Tienes ', inProgress.length, ' curso' + (inProgress.length === 1 ? '' : 's') + ' en marcha.'),
        React.createElement('div', {
          style: { display: 'flex', gap: 18, flexWrap: 'wrap', fontFamily: 'Lato', fontSize: 13, color: 'rgba(255,255,255,0.92)' },
        },
          React.createElement('div', null, '▪ ', React.createElement('b', null, completed.length), ' cursos completados'),
          React.createElement('div', null, '▪ ', React.createElement('b', null, totalHours), ' horas formativas'),
          React.createElement('div', null, '▪ ', React.createElement('b', null, diplomas.length), ' diplomas disponibles'),
        ),
      ),
    ),

    // ── KPI cards ──
    React.createElement('div', {
      style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 22 },
    },
      [
        { label: 'En progreso',   value: inProgress.length,  go: 'mis-cursos',  color: COLORS.orange },
        { label: 'Completados',   value: completed.length,   go: 'mis-cursos',  color: '#16a34a' },
        { label: 'Diplomas',      value: diplomas.length,    go: 'diplomas',    color: COLORS.cyan },
        { label: 'Postulaciones', value: applications.length,go: 'empleo',      color: COLORS.pink },
      ].map(k =>
        React.createElement('div', {
          key: k.label,
          onClick: () => setCurrentView(k.go),
          style: {
            background: theme.surface, border: `1px solid ${theme.border}`,
            padding: '22px 22px 20px', borderRadius: 14,
            cursor: 'pointer', transition: 'transform 0.18s, box-shadow 0.18s',
            boxShadow: theme.cardShadow,
          },
          onMouseEnter: e => e.currentTarget.style.transform = 'translateY(-3px)',
          onMouseLeave: e => e.currentTarget.style.transform = 'translateY(0)',
        },
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: theme.textLight, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 } }, k.label),
          React.createElement('div', {
            style: { fontFamily: 'Bricolage Grotesque', fontSize: 38, fontWeight: 800, color: k.color, letterSpacing: -1, lineHeight: 1 },
          }, k.value),
        ),
      ),
    ),

    // ── Grid principal: cursos en progreso | panel lateral ──
    React.createElement('div', {
      style: { display: 'grid', gridTemplateColumns: isSmall ? '1fr' : 'minmax(0, 2fr) minmax(0, 1fr)', gap: isSmall ? 14 : 18 },
    },
      // ── Left column: cursos en progreso ──
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
        React.createElement('div', {
          style: { background: theme.surface, borderRadius: 14, border: `1px solid ${theme.border}`, padding: 22, boxShadow: theme.cardShadow },
        },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 } },
            React.createElement('div', null,
              React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 17, fontWeight: 800, color: theme.text } }, 'Continúa aprendiendo'),
              React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: theme.textLight, marginTop: 2 } }, 'Retoma donde lo dejaste.'),
            ),
            React.createElement('button', {
              onClick: () => setCurrentView('mis-cursos'),
              style: { background: 'none', border: 'none', color: COLORS.orange, fontSize: 12, fontFamily: 'Lato', fontWeight: 700, cursor: 'pointer' },
            }, 'Ver todos →'),
          ),
          inProgress.length === 0
            ? React.createElement(EmptyState, { theme, icon: '◌', title: 'Aún no tienes cursos en marcha', text: 'Explora el catálogo y comienza tu primera formación.', action: React.createElement('button', { onClick: () => setCurrentView('catalogo'), style: { padding: '11px 20px', borderRadius: 10, background: COLORS.gradient, color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontWeight: 700, cursor: 'pointer', fontSize: 13 } }, 'Ver catálogo') })
            : inProgress.slice(0, 4).map(e => {
                const c = courses.find(c => c.id === e.courseId);
                if (!c) return null;
                return React.createElement('div', {
                  key: e.id,
                  style: { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 4px', borderTop: `1px solid ${theme.border}` },
                },
                  React.createElement('div', {
                    style: { width: 54, height: 54, borderRadius: 10, background: `linear-gradient(135deg, ${COLORS.orange}, ${COLORS.pink})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: 15, flexShrink: 0 },
                  }, (c.area || '').charAt(0)),
                  React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                    React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 3, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' } }, c.title),
                    React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: theme.textLight, marginBottom: 8 } }, c.modality, ' · ', c.hours + ' h · ', e.progress || 0, '% completado'),
                    React.createElement(Progress, { value: e.progress || 0 }),
                  ),
                  React.createElement('button', {
                    onClick: () => { setDetailCourseId(c.id); setCurrentView('detalle-curso'); },
                    style: { padding: '8px 14px', borderRadius: 8, background: COLORS.orange, color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 11, cursor: 'pointer', flexShrink: 0 },
                  }, 'Continuar →'),
                );
              }),
        ),

        // ── Bloque logros / badges ──
        React.createElement('div', {
          style: { background: theme.surface, borderRadius: 14, border: `1px solid ${theme.border}`, padding: 22, boxShadow: theme.cardShadow },
        },
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 17, fontWeight: 800, color: theme.text, marginBottom: 4 } }, 'Tus logros'),
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: theme.textLight, marginBottom: 16 } }, earnedBadges.length, ' de ', badges.length, ' conseguidos'),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 } },
            badges.map(b => {
              const earned = earnedBadges.some(e => e.id === b.id);
              return React.createElement('div', {
                key: b.id,
                title: b.desc,
                style: {
                  padding: '14px 12px', borderRadius: 10, textAlign: 'center',
                  background: earned ? COLORS.gradientSoft : (theme.surface2 || '#fafbfc'),
                  border: `1px solid ${earned ? COLORS.orange : theme.border}`,
                  opacity: earned ? 1 : 0.52,
                },
              },
                React.createElement('div', { style: { fontSize: 20, marginBottom: 6, color: earned ? COLORS.orange : theme.textLight } }, b.icon),
                React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 11, fontWeight: 800, color: theme.text } }, b.name),
              );
            }),
          ),
        ),
      ),

      // ── Right column: próxima sesión + oferta + diplomas ──
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
        // Próxima sesión
        nextCourse && React.createElement('div', {
          style: { background: theme.surface, borderRadius: 14, border: `1px solid ${theme.border}`, padding: 20, boxShadow: theme.cardShadow, position: 'relative', overflow: 'hidden' },
        },
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 10, color: COLORS.cyan, fontWeight: 700, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 8 } }, '◷ Próxima sesión'),
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 15, fontWeight: 800, color: theme.text, lineHeight: 1.3, marginBottom: 6 } },
            (courses.find(c => c.id === nextCourse.courseId)?.title || '').slice(0, 70) + '…'
          ),
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: theme.textLight, marginBottom: 14 } }, nextCourse.nextSession),
          React.createElement('button', {
            onClick: () => setCurrentView('calendario'),
            style: { width: '100%', padding: 10, borderRadius: 8, background: theme.surface2 || '#fafbfc', border: `1px solid ${theme.border}`, color: theme.text, fontFamily: 'Bricolage Grotesque', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
          }, 'Ver en calendario'),
        ),
        // Oferta de empleo destacada
        featuredJob && React.createElement('div', {
          style: { background: theme.surface, borderRadius: 14, border: `1px solid ${theme.border}`, padding: 20, boxShadow: theme.cardShadow },
        },
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 10, color: COLORS.pink, fontWeight: 700, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 8 } }, '★ Oferta destacada · ', user.sector),
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 15, fontWeight: 800, color: theme.text, marginBottom: 4 } }, featuredJob.title),
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: theme.textLight, marginBottom: 8 } }, featuredJob.company, ' · ', featuredJob.location),
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: theme.text, marginBottom: 14 } }, featuredJob.salary),
          React.createElement('button', {
            onClick: () => setCurrentView('empleo'),
            style: { width: '100%', padding: 10, borderRadius: 8, background: hasAppliedTo(featuredJob.id) ? theme.surface2 : COLORS.gradient, color: hasAppliedTo(featuredJob.id) ? theme.textLight : '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
          }, hasAppliedTo(featuredJob.id) ? 'Ya postulado ✓' : 'Ver oferta'),
        ),
        // Diploma reciente
        diplomas.length > 0 && React.createElement('div', {
          style: { background: theme.surface, borderRadius: 14, border: `1px solid ${theme.border}`, padding: 20, boxShadow: theme.cardShadow },
        },
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 10, color: COLORS.yellow, fontWeight: 700, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 8 } }, '◆ Último diploma'),
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: theme.text, lineHeight: 1.3, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } }, diplomas[0].title),
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: theme.textLight, marginBottom: 14 } }, 'Emitido el ', diplomas[0].issueDate, ' · ', diplomas[0].hours, ' h'),
          React.createElement('button', {
            onClick: () => setCurrentView('diplomas'),
            style: { width: '100%', padding: 10, borderRadius: 8, background: theme.surface2 || '#fafbfc', border: `1px solid ${theme.border}`, color: theme.text, fontFamily: 'Bricolage Grotesque', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
          }, 'Ver mis diplomas'),
        ),
      ),
    ),
  );
}

window.AlumnoDashboardView = AlumnoDashboardView;
