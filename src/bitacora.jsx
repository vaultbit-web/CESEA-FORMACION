// ─── CESEA Formación · Formador — Bitácora de sesiones ───────────────────────
//
// Timeline de las sesiones impartidas por el formador. Por cada fecha de
// impartición puede registrar incidencias, observaciones y el número de
// asistentes (presentes vs totales). Los cursos con 1 fecha tienen 1 entrada;
// los cursos con 2 fechas tienen 2 entradas.
//
// FILEMAKER: Layout "Formador_Bitacora". Portal a Bitacora_Sesiones filtrado
//   por id_formador = Get(AccountName). Script "Guardar_Entrada_Bitacora".
// ─────────────────────────────────────────────────────────────────────────────

const { motion: bMotion } = window.Motion || {};

function BitacoraView() {
  const { bitacoras, addBitacoraEntry, updateBitacoraEntry, courses, user } = React.useContext(AppContext);

  const acceptedCourses = courses.filter(c => c.status === 'accepted' || c.status === 'review' || c.status === 'completed');
  const [courseFilter, setCourseFilter] = React.useState('all');
  const [newOpen, setNewOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);

  const [form, setForm] = React.useState({
    courseId: acceptedCourses[0]?.id || '',
    sessionDate: new Date().toISOString().slice(0, 10),
    timeFrom: '09:00',
    timeTo: '14:00',
    incidents: '',
    notes: '',
    present: 0,
    total: 0,
  });

  const filtered = bitacoras.filter(b => courseFilter === 'all' || b.courseId === Number(courseFilter));

  const getCourse = (id) => courses.find(c => c.id === id);

  const openNew = () => {
    setEditingId(null);
    setForm({
      courseId: acceptedCourses[0]?.id || '',
      sessionDate: new Date().toISOString().slice(0, 10),
      timeFrom: '09:00', timeTo: '14:00',
      incidents: '', notes: '', present: 0, total: 0,
    });
    setNewOpen(true);
  };

  const openEdit = (entry) => {
    setEditingId(entry.id);
    setForm({
      courseId:     entry.courseId,
      sessionDate:  entry.sessionDate,
      timeFrom:     entry.timeFrom,
      timeTo:       entry.timeTo,
      incidents:    entry.incidents,
      notes:        entry.notes,
      present:      entry.present,
      total:        entry.total,
    });
    setNewOpen(true);
  };

  const save = () => {
    if (!form.courseId) return;
    if (editingId) updateBitacoraEntry(editingId, form);
    else           addBitacoraEntry(form);
    setNewOpen(false);
  };

  const field = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e4e7ef', fontSize: 13, fontFamily: 'Lato', outline: 'none', background: '#fff', color: COLORS.dark };
  const lbl   = { display: 'block', fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, marginBottom: 6, letterSpacing: 0.6, textTransform: 'uppercase' };

  return React.createElement('div', null,
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22, flexWrap: 'wrap', gap: 12 } },
      React.createElement('div', null,
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, fontWeight: 700, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 4 } }, 'Diario del formador'),
        React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 28, fontWeight: 800, color: COLORS.dark, letterSpacing: -0.5 } }, 'Bitácora de sesiones'),
        React.createElement('p', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight, marginTop: 4 } }, 'Registra incidencias, observaciones y asistencia de cada sesión impartida.'),
      ),
      React.createElement('button', {
        onClick: openNew,
        style: { padding: '11px 20px', borderRadius: 10, background: COLORS.gradient, color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontWeight: 700, cursor: 'pointer', fontSize: 13, boxShadow: '0 8px 20px rgba(244,120,9,0.28)' },
      }, '+ Nueva entrada'),
    ),

    // Filtro por curso
    React.createElement('div', {
      style: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' },
    },
      React.createElement('span', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, fontWeight: 700 } }, 'Curso:'),
      React.createElement('select', {
        value: courseFilter, onChange: e => setCourseFilter(e.target.value),
        style: { padding: '9px 12px', borderRadius: 9, border: '1px solid #e4e7ef', fontSize: 13, fontFamily: 'Lato', background: '#fff', cursor: 'pointer' },
      },
        React.createElement('option', { value: 'all' }, 'Todos los cursos'),
        ...acceptedCourses.map(c => React.createElement('option', { key: c.id, value: c.id }, c.title.slice(0, 60) + (c.title.length > 60 ? '…' : ''))),
      ),
    ),

    // Timeline de entradas
    filtered.length === 0
      ? React.createElement('div', {
          style: { padding: '48px 24px', textAlign: 'center', color: COLORS.textLight, fontFamily: 'Lato', background: '#fff', borderRadius: 14, border: '1px solid #eceef4' },
        },
          React.createElement('div', { style: { fontSize: 36, marginBottom: 8, opacity: 0.5 } }, '✎'),
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 16, color: COLORS.dark, marginBottom: 4 } }, 'Sin entradas aún'),
          React.createElement('div', { style: { fontSize: 13 } }, 'Pulsa «Nueva entrada» para registrar tu primera sesión.'),
        )
      : React.createElement('div', { style: { position: 'relative', paddingLeft: 32 } },
          // Línea vertical del timeline
          React.createElement('div', {
            style: { position: 'absolute', left: 10, top: 8, bottom: 8, width: 2, background: '#eceef4', borderRadius: 2 },
          }),
          filtered.sort((a, b) => (b.sessionDate || '').localeCompare(a.sessionDate || '')).map(b => {
            const c = getCourse(b.courseId);
            return React.createElement('div', {
              key: b.id,
              style: { position: 'relative', marginBottom: 18 },
            },
              // Punto del timeline
              React.createElement('div', {
                style: { position: 'absolute', left: -28, top: 18, width: 14, height: 14, borderRadius: '50%', background: COLORS.gradient, border: '3px solid #fff', boxShadow: '0 0 0 2px #eceef4' },
              }),
              // Card
              React.createElement('div', {
                style: { background: '#fff', border: '1px solid #eceef4', borderRadius: 14, padding: 20, boxShadow: '0 4px 18px rgba(15,16,32,0.04)' },
              },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 } },
                  React.createElement('div', null,
                    React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 18, fontWeight: 800, color: COLORS.dark, letterSpacing: -0.3 } },
                      new Date(b.sessionDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
                    ),
                    React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, marginTop: 2 } }, '◷ ', b.timeFrom, ' – ', b.timeTo, c ? ' · ' + c.title : ''),
                  ),
                  React.createElement('div', { style: { display: 'flex', gap: 6, alignItems: 'center' } },
                    React.createElement('div', {
                      style: { padding: '6px 12px', borderRadius: 999, background: `${COLORS.cyan}15`, color: COLORS.cyan, fontFamily: 'Bricolage Grotesque', fontSize: 12, fontWeight: 800 },
                    }, b.present, '/', b.total, ' asistentes'),
                    React.createElement('button', {
                      onClick: () => openEdit(b),
                      style: { padding: '6px 12px', borderRadius: 7, border: '1px solid #e4e7ef', background: '#fff', color: COLORS.text, fontFamily: 'Lato', fontSize: 11, fontWeight: 700, cursor: 'pointer' },
                    }, 'Editar'),
                  ),
                ),
                b.incidents && React.createElement('div', { style: { marginBottom: 10 } },
                  React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 10, color: COLORS.orange, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 } }, '▲ Incidencias'),
                  React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.text, lineHeight: 1.5 } }, b.incidents),
                ),
                b.notes && React.createElement('div', null,
                  React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 10, color: COLORS.cyan, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 } }, '◉ Observaciones'),
                  React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.text, lineHeight: 1.5 } }, b.notes),
                ),
              ),
            );
          }),
        ),

    // Modal alta/edición
    newOpen && React.createElement('div', {
      onClick: () => setNewOpen(false),
      style: { position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,16,32,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
    },
      React.createElement('div', {
        onClick: e => e.stopPropagation(),
        style: { background: '#fff', borderRadius: 16, width: '100%', maxWidth: 600, padding: 28, maxHeight: '90vh', overflowY: 'auto', animation: 'fadeInUp 0.32s cubic-bezier(0.22,1,0.36,1) both' },
      },
        React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 18, fontWeight: 800, color: COLORS.dark, marginBottom: 18 } }, editingId ? 'Editar entrada' : 'Nueva entrada de bitácora'),

        React.createElement('div', { style: { marginBottom: 14 } },
          React.createElement('label', { style: lbl }, 'Curso'),
          React.createElement('select', {
            value: form.courseId, onChange: e => setForm({ ...form, courseId: Number(e.target.value) }),
            style: field,
          },
            acceptedCourses.map(c => React.createElement('option', { key: c.id, value: c.id }, c.title)),
          ),
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 12, marginBottom: 14 } },
          React.createElement('div', null,
            React.createElement('label', { style: lbl }, 'Fecha'),
            React.createElement('input', { type: 'date', value: form.sessionDate, onChange: e => setForm({ ...form, sessionDate: e.target.value }), style: field }),
          ),
          React.createElement('div', null,
            React.createElement('label', { style: lbl }, 'Hora inicio'),
            React.createElement('input', { type: 'time', value: form.timeFrom, onChange: e => setForm({ ...form, timeFrom: e.target.value }), style: field }),
          ),
          React.createElement('div', null,
            React.createElement('label', { style: lbl }, 'Hora fin'),
            React.createElement('input', { type: 'time', value: form.timeTo, onChange: e => setForm({ ...form, timeTo: e.target.value }), style: field }),
          ),
        ),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 } },
          React.createElement('div', null,
            React.createElement('label', { style: lbl }, 'Asistentes presentes'),
            React.createElement('input', { type: 'number', min: 0, value: form.present, onChange: e => setForm({ ...form, present: Number(e.target.value) }), style: field }),
          ),
          React.createElement('div', null,
            React.createElement('label', { style: lbl }, 'Asistentes totales (inscritos)'),
            React.createElement('input', { type: 'number', min: 0, value: form.total, onChange: e => setForm({ ...form, total: Number(e.target.value) }), style: field }),
          ),
        ),
        React.createElement('div', { style: { marginBottom: 14 } },
          React.createElement('label', { style: lbl }, 'Incidencias'),
          React.createElement('textarea', {
            value: form.incidents, onChange: e => setForm({ ...form, incidents: e.target.value }),
            placeholder: '¿Ha pasado algo reseñable? Llegadas tarde, problemas técnicos, ausencias…',
            rows: 3, style: { ...field, resize: 'vertical' },
          }),
        ),
        React.createElement('div', { style: { marginBottom: 20 } },
          React.createElement('label', { style: lbl }, 'Observaciones'),
          React.createElement('textarea', {
            value: form.notes, onChange: e => setForm({ ...form, notes: e.target.value }),
            placeholder: '¿Cómo ha ido la sesión? Aspectos a destacar, ideas para próximas sesiones…',
            rows: 4, style: { ...field, resize: 'vertical' },
          }),
        ),
        React.createElement('div', { style: { display: 'flex', gap: 10, justifyContent: 'flex-end' } },
          React.createElement('button', {
            onClick: () => setNewOpen(false),
            style: { padding: '10px 18px', borderRadius: 9, background: '#fff', color: COLORS.text, border: '1px solid #e4e7ef', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 12, cursor: 'pointer' },
          }, 'Cancelar'),
          React.createElement('button', {
            onClick: save,
            style: { padding: '10px 20px', borderRadius: 9, background: COLORS.gradient, color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 12, cursor: 'pointer' },
          }, editingId ? 'Guardar cambios' : 'Añadir entrada'),
        ),
      ),
    ),
  );
}

window.BitacoraView = BitacoraView;
