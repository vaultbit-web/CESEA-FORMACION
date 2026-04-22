// ─── CESEA Formación · Alumnado — Perfil ─────────────────────────────────────
//
// Panel de perfil del alumno. Permite editar datos personales, datos fiscales
// (para factura), sector profesional, subir CV (drag & drop, solo nombre en
// prototipo) y ver horas acumuladas / badges conseguidos.
//
// FILEMAKER: Layout "Alumno_Perfil". El CV se almacena en contenedor FM.
//   El cambio de sector propaga al filtro de ofertas de empleo.
// ─────────────────────────────────────────────────────────────────────────────

function AlumnoProfileView() {
  const {
    user, updateProfile, uploadCV, theme,
    courses, enrollments, diplomas, badges, reviews,
    payments, showToast,
  } = React.useContext(AppContext);

  const [form, setForm] = React.useState({
    name:     user.name,
    email:    user.email,
    phone:    user.phone,
    location: user.location,
    bio:      user.bio,
    sector:   user.sector,
    fiscalName:    user.fiscalData?.fullName || '',
    fiscalNif:     user.fiscalData?.nif      || '',
    fiscalAddress: user.fiscalData?.address  || '',
  });
  const [dragOver, setDragOver] = React.useState(false);
  const fileRef = React.useRef(null);

  const save = () => {
    updateProfile({
      name: form.name, email: form.email, phone: form.phone,
      location: form.location, bio: form.bio, sector: form.sector,
      initials: form.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase(),
      fiscalData: { fullName: form.fiscalName, nif: form.fiscalNif, address: form.fiscalAddress },
    });
    showToast('Perfil guardado');
  };

  const handleFile = (file) => {
    if (!file) return;
    if (file.type && file.type !== 'application/pdf') { showToast('Solo se aceptan archivos PDF', 'error'); return; }
    uploadCV(file.name);
    showToast('CV actualizado correctamente');
  };
  const onDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); };

  // Métricas
  const completed = enrollments.filter(e => e.status === 'completado');
  const totalHours = completed.reduce((s, e) => {
    const c = courses.find(c => c.id === e.courseId);
    return s + (c?.hours || 0);
  }, 0);
  const earnedBadges = badges.filter(b => {
    if (b.metric === 'hours')   return totalHours      >= b.threshold;
    if (b.metric === 'reviews') return reviews.length  >= b.threshold;
    return completed.length >= b.threshold;
  });

  const field = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: `1px solid ${theme.border}`, fontFamily: 'Lato', fontSize: 13,
    background: theme.surface2 || '#fafbfc', color: theme.text, outline: 'none',
  };
  const lbl = { display: 'block', fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: theme.textLight, marginBottom: 6, letterSpacing: 0.6, textTransform: 'uppercase' };

  return React.createElement('div', null,
    React.createElement('div', { style: { marginBottom: 22 } },
      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: theme.textLight, fontWeight: 700, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 4 } }, 'Mi cuenta'),
      React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 28, fontWeight: 800, color: theme.text, letterSpacing: -0.5 } }, 'Mi perfil'),
    ),

    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 } },
      // ── Columna izquierda: datos ──
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
        // Datos personales
        React.createElement('div', {
          style: { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 22, boxShadow: theme.cardShadow },
        },
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 16, fontWeight: 800, color: theme.text, marginBottom: 18 } }, 'Datos personales'),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 } },
            React.createElement('div', null,
              React.createElement('label', { style: lbl }, 'Nombre completo'),
              React.createElement('input', { type: 'text', value: form.name, onChange: e => setForm({ ...form, name: e.target.value }), style: field }),
            ),
            React.createElement('div', null,
              React.createElement('label', { style: lbl }, 'Email'),
              React.createElement('input', { type: 'email', value: form.email, onChange: e => setForm({ ...form, email: e.target.value }), style: field }),
            ),
            React.createElement('div', null,
              React.createElement('label', { style: lbl }, 'Teléfono'),
              React.createElement('input', { type: 'tel', value: form.phone, onChange: e => setForm({ ...form, phone: e.target.value }), style: field }),
            ),
            React.createElement('div', null,
              React.createElement('label', { style: lbl }, 'Ubicación'),
              React.createElement('input', { type: 'text', value: form.location, onChange: e => setForm({ ...form, location: e.target.value }), style: field }),
            ),
            React.createElement('div', { style: { gridColumn: '1 / -1' } },
              React.createElement('label', { style: lbl }, 'Sector profesional'),
              React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } },
                ['dental', 'sanidad'].map(s => React.createElement('button', {
                  key: s, type: 'button',
                  onClick: () => setForm({ ...form, sector: s }),
                  style: {
                    padding: '10px 14px', borderRadius: 9,
                    border: form.sector === s ? `2px solid ${COLORS.orange}` : `1px solid ${theme.border}`,
                    background: form.sector === s ? `${COLORS.orange}10` : theme.surface,
                    color: form.sector === s ? COLORS.orange : theme.text,
                    fontFamily: 'Lato', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', textTransform: 'capitalize',
                  },
                }, s)),
              ),
            ),
            React.createElement('div', { style: { gridColumn: '1 / -1' } },
              React.createElement('label', { style: lbl }, 'Biografía / nota profesional'),
              React.createElement('textarea', { value: form.bio, onChange: e => setForm({ ...form, bio: e.target.value }), rows: 3, style: { ...field, resize: 'vertical' } }),
            ),
          ),
        ),

        // Datos fiscales (para factura)
        React.createElement('div', {
          style: { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 22, boxShadow: theme.cardShadow },
        },
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 16, fontWeight: 800, color: theme.text, marginBottom: 4 } }, 'Datos fiscales'),
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: theme.textLight, marginBottom: 18 } }, 'Se usarán exclusivamente para la emisión de facturas.'),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 } },
            React.createElement('div', null,
              React.createElement('label', { style: lbl }, 'Nombre / razón social'),
              React.createElement('input', { type: 'text', value: form.fiscalName, onChange: e => setForm({ ...form, fiscalName: e.target.value }), style: field }),
            ),
            React.createElement('div', null,
              React.createElement('label', { style: lbl }, 'NIF / CIF'),
              React.createElement('input', { type: 'text', value: form.fiscalNif, onChange: e => setForm({ ...form, fiscalNif: e.target.value.toUpperCase() }), style: field }),
            ),
            React.createElement('div', { style: { gridColumn: '1 / -1' } },
              React.createElement('label', { style: lbl }, 'Dirección fiscal'),
              React.createElement('input', { type: 'text', value: form.fiscalAddress, onChange: e => setForm({ ...form, fiscalAddress: e.target.value }), style: field }),
            ),
          ),
        ),

        // CV
        React.createElement('div', {
          style: { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 22, boxShadow: theme.cardShadow },
        },
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 16, fontWeight: 800, color: theme.text, marginBottom: 4 } }, 'Currículum vitae'),
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: theme.textLight, marginBottom: 18 } }, 'Sube tu CV en PDF para postularte a ofertas con un solo clic.'),

          React.createElement('div', {
            onDragOver: e => { e.preventDefault(); setDragOver(true); },
            onDragLeave: () => setDragOver(false),
            onDrop: onDrop,
            onClick: () => fileRef.current?.click(),
            style: {
              padding: '28px 18px', borderRadius: 12,
              border: `2px dashed ${dragOver ? COLORS.orange : theme.border}`,
              background: dragOver ? `${COLORS.orange}08` : (theme.surface2 || '#fafbfc'),
              textAlign: 'center', cursor: 'pointer',
              transition: 'all 0.18s', fontFamily: 'Lato',
            },
          },
            React.createElement('div', { style: { fontSize: 32, color: COLORS.orange, marginBottom: 10 } }, '↥'),
            React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: theme.text, marginBottom: 4 } },
              user.cvFileName ? user.cvFileName : 'Arrastra tu CV aquí',
            ),
            React.createElement('div', { style: { fontSize: 11, color: theme.textLight } },
              user.cvFileName
                ? ('Subido el ' + user.cvUploadDate + ' · haz clic para reemplazar')
                : 'o haz clic para seleccionar · solo PDF · máx. 5 MB',
            ),
            React.createElement('input', {
              ref: fileRef, type: 'file', accept: 'application/pdf',
              style: { display: 'none' },
              onChange: e => handleFile(e.target.files?.[0]),
            }),
          ),
        ),

        // Botón guardar
        React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end' } },
          React.createElement('button', {
            onClick: save,
            style: { padding: '12px 28px', borderRadius: 10, background: COLORS.gradient, color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 6px 18px rgba(244,120,9,0.28)' },
          }, 'Guardar cambios'),
        ),
      ),

      // ── Columna derecha: avatar + métricas + pagos ──
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
        // Avatar + resumen
        React.createElement('div', {
          style: { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 22, boxShadow: theme.cardShadow, textAlign: 'center' },
        },
          React.createElement('div', {
            style: { width: 80, height: 80, borderRadius: 18, background: COLORS.gradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: 30, letterSpacing: 1 },
          }, user.initials),
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 17, fontWeight: 800, color: theme.text } }, user.name),
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: theme.textLight, textTransform: 'capitalize', marginTop: 2 } }, user.role, ' · ', user.sector),
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: theme.textLight, marginTop: 2 } }, 'Alumno desde ' + user.joinDate),
        ),

        // Horas + badges
        React.createElement('div', {
          style: { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 22, boxShadow: theme.cardShadow },
        },
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: theme.text, marginBottom: 16 } }, 'Mi progreso formativo'),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 } },
            React.createElement('div', { style: { padding: '14px 14px', borderRadius: 10, background: theme.surface2 || '#fafbfc', border: `1px solid ${theme.border}`, textAlign: 'center' } },
              React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 28, fontWeight: 800, color: COLORS.orange, letterSpacing: -0.5 } }, totalHours),
              React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 10, color: theme.textLight, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' } }, 'Horas lectivas'),
            ),
            React.createElement('div', { style: { padding: '14px 14px', borderRadius: 10, background: theme.surface2 || '#fafbfc', border: `1px solid ${theme.border}`, textAlign: 'center' } },
              React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 28, fontWeight: 800, color: COLORS.cyan, letterSpacing: -0.5 } }, completed.length),
              React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 10, color: theme.textLight, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' } }, 'Cursos finalizados'),
            ),
          ),
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: theme.textLight, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 10 } }, 'Logros (' + earnedBadges.length + '/' + badges.length + ')'),
          React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
            badges.map(b => {
              const earned = earnedBadges.some(e => e.id === b.id);
              return React.createElement('div', {
                key: b.id, title: b.name + ' — ' + b.desc,
                style: {
                  width: 38, height: 38, borderRadius: 9,
                  background: earned ? COLORS.gradientSoft : (theme.surface2 || '#fafbfc'),
                  color: earned ? COLORS.orange : theme.textLight,
                  border: `1px solid ${earned ? COLORS.orange : theme.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, opacity: earned ? 1 : 0.52,
                },
              }, b.icon);
            }),
          ),
        ),

        // Historial de pagos / facturas
        React.createElement('div', {
          style: { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 22, boxShadow: theme.cardShadow },
        },
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: theme.text, marginBottom: 4 } }, 'Historial de pagos'),
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: theme.textLight, marginBottom: 14 } }, payments.length, ' facturas disponibles'),
          payments.slice(0, 4).map(p =>
            React.createElement('div', {
              key: p.id,
              style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: `1px solid ${theme.border}`, fontFamily: 'Lato', fontSize: 12 },
            },
              React.createElement('div', null,
                React.createElement('div', { style: { color: theme.text, fontWeight: 700 } }, p.invoiceNo),
                React.createElement('div', { style: { color: theme.textLight, fontSize: 10, textTransform: 'capitalize' } }, p.date, ' · ', p.method),
              ),
              React.createElement('div', { style: { color: theme.text, fontFamily: 'Bricolage Grotesque', fontWeight: 800 } }, p.amount, ' €'),
            ),
          ),
        ),
      ),
    ),
  );
}

window.AlumnoProfileView = AlumnoProfileView;
