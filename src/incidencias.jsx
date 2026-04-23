// ─── Incidencias (formador) ──────────────────────────────────────────────────
// FILEMAKER: Layout "Formador_Incidencias". Portal filtrado a Solicitudes con
//   type="incidencia" y trainer_id = Get(AccountName). El superadmin las recibe
//   en AdminRequestsView (grupo "Incidencias" dentro del curso afectado).

function IncidenciasView() {
  const { user, courses, pendingRequests, createIncidencia } = React.useContext(AppContext);
  const [showNew, setShowNew] = React.useState(false);
  const [form, setForm] = React.useState({
    courseId: '',
    incidenciaType: 'Cancelación por enfermedad',
    description: '',
  });

  // Cursos en los que el formador puede reportar (aceptados o en revisión)
  const myCourses = courses.filter(c => ['accepted', 'review'].includes(c.status));

  // Incidencias propias del formador actual
  const myIncidencias = pendingRequests
    .filter(r => r.type === 'incidencia' && (r.trainer === user?.name || r.trainerId === user?.id));

  const TYPES = [
    'Cancelación por enfermedad',
    'Cambio de fecha',
    'Problema con alumnos',
    'Infraestructura / aula',
    'Otro',
  ];

  const submit = (e) => {
    e.preventDefault();
    if (!form.description.trim()) return;
    const c = myCourses.find(cc => String(cc.id) === String(form.courseId));
    createIncidencia({
      courseId: c?.id,
      courseTitle: c?.title || '—',
      incidenciaType: form.incidenciaType,
      description: form.description.trim(),
    });
    setForm({ courseId: '', incidenciaType: 'Cancelación por enfermedad', description: '' });
    setShowNew(false);
  };

  const inp = { padding: '10px 14px', borderRadius: 9, border: '1px solid #e4e7ef', fontSize: 13, fontFamily: 'Lato', outline: 'none', width: '100%', boxSizing: 'border-box', color: COLORS.dark, background: '#fff' };

  return React.createElement('div', null,
    // Header
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 12 } },
      React.createElement('div', null,
        React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 24, fontWeight: 800, color: COLORS.dark, margin: '0 0 4px' } }, 'Incidencias'),
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight } }, 'Reporta cualquier problema que afecte a la impartición: el superadministrador lo recibirá para tomar acción.'),
      ),
      React.createElement('button', {
        onClick: () => setShowNew(true),
        style: { padding: '10px 18px', borderRadius: 10, border: 'none', background: COLORS.gradient, color: '#fff', fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 800, cursor: 'pointer', letterSpacing: 0.3, boxShadow: '0 4px 14px rgba(244,120,9,0.24)' },
      }, '+ Nueva incidencia'),
    ),

    // Lista
    myIncidencias.length === 0
      ? React.createElement('div', {
          style: { padding: 48, textAlign: 'center', background: '#fff', borderRadius: 14, border: '1px dashed #e4e7ef' },
        },
          React.createElement('div', { style: { fontSize: 32, marginBottom: 10, color: COLORS.textLight } }, '◌'),
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 15, fontWeight: 700, color: COLORS.dark, marginBottom: 4 } }, 'No hay incidencias abiertas'),
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight } }, 'Todo marcha correctamente. Si surge alguna contrariedad, usa "Nueva incidencia".'),
        )
      : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
          ...myIncidencias.map(r => React.createElement('div', {
            key: r.id,
            style: { background: '#fff', border: '1px solid #eceef4', borderLeft: `3px solid ${COLORS.red}`, borderRadius: 12, padding: '16px 20px' },
          },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 } },
              React.createElement('div', null,
                React.createElement('span', { style: { padding: '3px 9px', borderRadius: 5, background: `${COLORS.red}14`, color: COLORS.red, fontSize: 10, fontWeight: 800, fontFamily: 'Lato', textTransform: 'uppercase', letterSpacing: 0.7 } }, r.incidenciaType || 'Incidencia'),
                React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 700, color: COLORS.dark, marginTop: 6 } }, r.courseTitle),
              ),
              React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, whiteSpace: 'nowrap' } }, r.date),
            ),
            React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.text, lineHeight: 1.5 } }, r.description || r.detail),
            React.createElement('div', { style: { marginTop: 10, fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight } }, 'Estado: ', React.createElement('b', { style: { color: COLORS.yellow } }, r.status || 'abierta — en revisión por administración')),
          )),
        ),

    // Modal nueva incidencia
    showNew && React.createElement('div', {
      style: { position: 'fixed', inset: 0, background: 'rgba(15,16,32,0.44)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: 20 },
      onClick: e => { if (e.target === e.currentTarget) setShowNew(false); },
    },
      React.createElement('form', {
        onSubmit: submit,
        style: { background: '#fff', borderRadius: 18, width: '100%', maxWidth: 520, padding: 28, boxShadow: '0 30px 80px rgba(15,16,32,0.24)' },
      },
        React.createElement('h2', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 18, fontWeight: 800, color: COLORS.dark, margin: '0 0 4px' } }, 'Nueva incidencia'),
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, marginBottom: 18 } }, 'Se notifica automáticamente al superadministrador.'),

        React.createElement('div', { style: { marginBottom: 14 } },
          React.createElement('label', { style: { fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, display: 'block', marginBottom: 4 } }, 'Curso afectado'),
          React.createElement('select', { style: { ...inp, cursor: 'pointer' }, value: form.courseId, onChange: e => setForm(p => ({ ...p, courseId: e.target.value })) },
            React.createElement('option', { value: '' }, 'Selecciona un curso…'),
            ...myCourses.map(c => React.createElement('option', { key: c.id, value: c.id }, c.title.slice(0, 60))),
          ),
        ),
        React.createElement('div', { style: { marginBottom: 14 } },
          React.createElement('label', { style: { fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, display: 'block', marginBottom: 4 } }, 'Tipo de incidencia'),
          React.createElement('select', { style: { ...inp, cursor: 'pointer' }, value: form.incidenciaType, onChange: e => setForm(p => ({ ...p, incidenciaType: e.target.value })) },
            ...TYPES.map(t => React.createElement('option', { key: t, value: t }, t)),
          ),
        ),
        React.createElement('div', { style: { marginBottom: 18 } },
          React.createElement('label', { style: { fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, display: 'block', marginBottom: 4 } }, 'Descripción'),
          React.createElement('textarea', { style: { ...inp, minHeight: 100, resize: 'vertical' }, required: true, placeholder: 'Explica el motivo y, si procede, la fecha afectada.', value: form.description, onChange: e => setForm(p => ({ ...p, description: e.target.value })) }),
        ),

        React.createElement('div', { style: { display: 'flex', gap: 10, justifyContent: 'flex-end' } },
          React.createElement('button', { type: 'button', onClick: () => setShowNew(false), style: { padding: '10px 18px', borderRadius: 9, border: '1px solid #e4e7ef', background: '#fff', color: COLORS.text, fontFamily: 'Lato', fontSize: 13, fontWeight: 700, cursor: 'pointer' } }, 'Cancelar'),
          React.createElement('button', { type: 'submit', style: { padding: '10px 20px', borderRadius: 9, border: 'none', background: COLORS.gradient, color: '#fff', fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 800, cursor: 'pointer', letterSpacing: 0.3 } }, 'Enviar incidencia'),
        ),
      ),
    ),
  );
}

// ─── Modal: Añadir propuesta formativa ───────────────────────────────────────
// FILEMAKER: Layout modal "Propuesta_Formativa". Genera un registro en
//   Solicitudes con type="proposal" para que el superadmin categorice y apruebe.
function AddProposalModal({ open, onClose }) {
  const { user, trainers, tipologias, courses, createProposal } = React.useContext(AppContext);
  const trainerRec = (trainers || []).find(t => t.id === user?.id || t.email === user?.email) || {};
  // Cursos "de su catálogo" = los asignados por el superadmin (cursosAsignados)
  // + cualquier curso en el catálogo global como opción secundaria.
  const catalogAsignado = (trainerRec.cursosAsignados || [])
    .map(id => courses.find(c => c.id === id))
    .filter(Boolean);

  const [mode, setMode]     = React.useState('catalog'); // 'catalog' | 'custom'
  const [courseId, setCourseId] = React.useState('');
  const [customTitle, setCustomTitle] = React.useState('');
  const [tipologia, setTipologia] = React.useState('');
  const [modality,  setModality]  = React.useState('Presencial');
  const [hours,     setHours]     = React.useState(8);
  const [startDate, setStartDate] = React.useState('');
  const [endDate,   setEndDate]   = React.useState('');
  const [numDays,   setNumDays]   = React.useState(1);
  const [sessions,  setSessions]  = React.useState([{ day: '', from: '09:00', to: '14:00' }]);
  const [objectives, setObjectives] = React.useState('');
  const [contents,   setContents]   = React.useState('');

  React.useEffect(() => {
    setSessions(prev => {
      const copy = [...prev];
      while (copy.length < numDays) copy.push({ day: startDate, from: '09:00', to: '14:00' });
      while (copy.length > numDays) copy.pop();
      return copy;
    });
  }, [numDays, startDate]);

  React.useEffect(() => {
    if (!open) return;
    setMode('catalog');
    setCourseId(''); setCustomTitle(''); setTipologia('');
    setModality('Presencial'); setHours(8);
    setStartDate(''); setEndDate(''); setNumDays(1);
    setSessions([{ day: '', from: '09:00', to: '14:00' }]);
    setObjectives(''); setContents('');
  }, [open]);

  if (!open) return null;
  const inp = { padding: '10px 12px', borderRadius: 8, border: '1px solid #e4e7ef', fontSize: 13, fontFamily: 'Lato', outline: 'none', width: '100%', boxSizing: 'border-box', color: COLORS.dark, background: '#fff' };

  const buildDatesString = () => {
    const MN = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const days = sessions.map(s => s.day).filter(Boolean);
    if (days.length === 0) return '';
    const parsed = days.map(d => new Date(d));
    const mi = parsed[0].getMonth();
    const y  = parsed[0].getFullYear();
    return `${parsed.map(d => d.getDate()).join(', ')} ${MN[mi]} ${y}`;
  };

  const submit = (e) => {
    e.preventDefault();
    const title = mode === 'catalog'
      ? (courses.find(c => String(c.id) === String(courseId))?.title || '')
      : customTitle.trim();
    if (!title || !tipologia) return;
    createProposal({
      title, tipologia, modality, hours: parseInt(hours, 10) || 0,
      dates: buildDatesString(),
      schedule: sessions,
      objectives, contents,
    });
    onClose();
  };

  return React.createElement('div', {
    style: { position: 'fixed', inset: 0, background: 'rgba(15,16,32,0.44)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: 20 },
    onClick: e => { if (e.target === e.currentTarget) onClose(); },
  },
    React.createElement('form', {
      onSubmit: submit,
      style: { background: '#fff', borderRadius: 18, width: '100%', maxWidth: 640, padding: 28, boxShadow: '0 30px 80px rgba(15,16,32,0.24)', maxHeight: '92vh', overflowY: 'auto' },
    },
      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.orange, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 } }, 'Formador · propuesta'),
      React.createElement('h2', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 18, fontWeight: 800, color: COLORS.dark, margin: '0 0 4px' } }, 'Añadir propuesta formativa'),
      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, marginBottom: 18 } }, 'Esta propuesta llegará al superadministrador para su autorización y categorización.'),

      // Selector modo catálogo / custom
      React.createElement('div', { style: { display: 'flex', gap: 6, marginBottom: 12 } },
        ...['catalog', 'custom'].map(m => React.createElement('button', {
          key: m, type: 'button',
          onClick: () => setMode(m),
          style: {
            padding: '8px 14px', borderRadius: 8, border: `1px solid ${mode === m ? COLORS.orange : '#e4e7ef'}`,
            background: mode === m ? `${COLORS.orange}0d` : '#fff',
            color: mode === m ? COLORS.orange : COLORS.text,
            fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Lato',
          },
        }, m === 'catalog' ? 'Desde mi catálogo' : 'Nuevo (editable)')),
      ),

      mode === 'catalog'
        ? React.createElement('div', { style: { marginBottom: 14 } },
            React.createElement('label', { style: { fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, display: 'block', marginBottom: 4 } }, 'Título del curso'),
            React.createElement('select', { style: { ...inp, cursor: 'pointer' }, required: true, value: courseId, onChange: e => setCourseId(e.target.value) },
              React.createElement('option', { value: '' }, 'Selecciona un curso de los que tienes asignados…'),
              ...catalogAsignado.map(c => React.createElement('option', { key: c.id, value: c.id }, c.title.slice(0, 70))),
            ),
            catalogAsignado.length === 0 && React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, marginTop: 4 } }, 'Aún no tienes cursos asignados por administración. Usa "Nuevo (editable)".'),
          )
        : React.createElement('div', { style: { marginBottom: 14 } },
            React.createElement('label', { style: { fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, display: 'block', marginBottom: 4 } }, 'Título del curso'),
            React.createElement('input', { style: inp, required: true, placeholder: 'Ej. Acompañamiento emocional en final de vida', value: customTitle, onChange: e => setCustomTitle(e.target.value) }),
          ),

      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: 10, marginBottom: 14 } },
        React.createElement('div', null,
          React.createElement('label', { style: { fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, display: 'block', marginBottom: 4 } }, 'Tipología'),
          React.createElement('select', { style: { ...inp, cursor: 'pointer' }, required: true, value: tipologia, onChange: e => setTipologia(e.target.value) },
            React.createElement('option', { value: '' }, 'Elige…'),
            ...(tipologias || []).map(t => React.createElement('option', { key: t, value: t }, t)),
          ),
        ),
        React.createElement('div', null,
          React.createElement('label', { style: { fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, display: 'block', marginBottom: 4 } }, 'Modalidad'),
          React.createElement('select', { style: { ...inp, cursor: 'pointer' }, value: modality, onChange: e => setModality(e.target.value) },
            ...['Presencial', 'Online', 'Híbrido'].map(m => React.createElement('option', { key: m, value: m }, m)),
          ),
        ),
        React.createElement('div', null,
          React.createElement('label', { style: { fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, display: 'block', marginBottom: 4 } }, 'Horas totales'),
          React.createElement('input', { type: 'number', min: 1, style: inp, value: hours, onChange: e => setHours(e.target.value) }),
        ),
      ),

      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 } },
        React.createElement('div', null,
          React.createElement('label', { style: { fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, display: 'block', marginBottom: 4 } }, 'Fecha inicio'),
          React.createElement('input', { type: 'date', style: inp, value: startDate, onChange: e => setStartDate(e.target.value) }),
        ),
        React.createElement('div', null,
          React.createElement('label', { style: { fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, display: 'block', marginBottom: 4 } }, 'Fecha fin'),
          React.createElement('input', { type: 'date', style: inp, value: endDate, onChange: e => setEndDate(e.target.value) }),
        ),
        modality !== 'Online' && React.createElement('div', null,
          React.createElement('label', { style: { fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, display: 'block', marginBottom: 4 } }, 'Días de impartición'),
          React.createElement('select', { style: { ...inp, cursor: 'pointer' }, value: numDays, onChange: e => setNumDays(parseInt(e.target.value, 10) || 1) },
            ...[1,2,3,4,5,6,7,8,9,10].map(n => React.createElement('option', { key: n, value: n }, n)),
          ),
        ),
      ),

      modality !== 'Online' && React.createElement('div', { style: { marginBottom: 14 } },
        React.createElement('label', { style: { fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, display: 'block', marginBottom: 6 } }, 'Horarios por día (mañana corta a 14:00, tarde a partir de ese horario)'),
        ...sessions.map((s, idx) => React.createElement('div', {
          key: idx,
          style: { display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 8, marginBottom: 6 }
        },
          React.createElement('input', { type: 'date', style: inp, value: s.day, onChange: e => setSessions(prev => prev.map((ss, i) => i === idx ? { ...ss, day: e.target.value } : ss)) }),
          React.createElement('input', { type: 'time', style: inp, value: s.from, onChange: e => setSessions(prev => prev.map((ss, i) => i === idx ? { ...ss, from: e.target.value } : ss)) }),
          React.createElement('input', { type: 'time', style: inp, value: s.to,   onChange: e => setSessions(prev => prev.map((ss, i) => i === idx ? { ...ss, to: e.target.value } : ss)) }),
        )),
      ),

      React.createElement('div', { style: { marginBottom: 12 } },
        React.createElement('label', { style: { fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, display: 'block', marginBottom: 4 } }, 'Objetivos'),
        React.createElement('textarea', { style: { ...inp, minHeight: 70, resize: 'vertical' }, value: objectives, onChange: e => setObjectives(e.target.value), placeholder: 'Qué aprenderán los alumnos…' }),
      ),
      React.createElement('div', { style: { marginBottom: 18 } },
        React.createElement('label', { style: { fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, display: 'block', marginBottom: 4 } }, 'Contenidos'),
        React.createElement('textarea', { style: { ...inp, minHeight: 90, resize: 'vertical' }, value: contents, onChange: e => setContents(e.target.value), placeholder: 'Temario estructurado por módulos…' }),
      ),

      React.createElement('div', { style: { display: 'flex', gap: 10, justifyContent: 'flex-end' } },
        React.createElement('button', { type: 'button', onClick: onClose, style: { padding: '10px 18px', borderRadius: 9, border: '1px solid #e4e7ef', background: '#fff', color: COLORS.text, fontFamily: 'Lato', fontSize: 13, fontWeight: 700, cursor: 'pointer' } }, 'Cancelar'),
        React.createElement('button', { type: 'submit', style: { padding: '10px 20px', borderRadius: 9, border: 'none', background: COLORS.gradient, color: '#fff', fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 800, cursor: 'pointer', letterSpacing: 0.3 } }, 'Enviar al superadmin'),
      ),
    ),
  );
}

window.IncidenciasView  = IncidenciasView;
window.AddProposalModal = AddProposalModal;
