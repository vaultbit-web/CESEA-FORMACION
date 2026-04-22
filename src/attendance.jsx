// ─── CESEA Formación · Formador — Asistencia de sesión ───────────────────────
//
// Panel de asistencia para una sesión concreta. El formador ve:
//   1) La lista oficial de inscritos con 3 estados clicables por alumno:
//      ✓ Asiste · ◐ Parcial · ✗ No asiste.
//   2) Los check-ins pendientes entrantes del bus cross-app (alumnos que
//      pulsaron «Estoy aquí» desde su app). Los valida con un solo clic.
//
// FILEMAKER: Layout "Formador_Pasar_Lista". Portal a Asistencias filtrado
//   por id_sesion. El bus cross-app se reemplaza en producción por polling
//   o WebSocket sobre layout "Asistencia_CheckIns".
// ─────────────────────────────────────────────────────────────────────────────

const ATTENDANCE_STATUS = {
  asiste:    { label: '✓ Asiste',    color: '#16a34a',        bg: '#16a34a15' },
  parcial:   { label: '◐ Parcial',   color: COLORS.orange,    bg: `${COLORS.orange}15` },
  no_asiste: { label: '✗ No asiste', color: COLORS.red,       bg: `${COLORS.red}15` },
  pendiente: { label: '… Pendiente', color: COLORS.textLight, bg: '#eceef4' },
};

function AttendanceView() {
  const {
    attendance, courses, setStudentAttendance, addAttendanceRecord, showToast,
  } = React.useContext(AppContext);

  const [selectedSession, setSelectedSession] = React.useState(attendance[0]?.id || null);
  const [busCheckIns, setBusCheckIns] = React.useState([]);

  // Suscripción al bus cross-app del alumnado.
  React.useEffect(() => {
    if (!window.AttendanceBus) return;
    return window.AttendanceBus.subscribe(setBusCheckIns);
  }, []);

  const session = attendance.find(s => s.id === selectedSession);
  const course = session && courses.find(c => c.id === session.courseId);

  // Filtra los check-ins que aplican a esta sesión (por fecha y curso)
  const applicable = session
    ? busCheckIns.filter(c => c.courseId === session.courseId && c.sessionDate === session.sessionDate)
    : [];

  const pending = applicable.filter(c => c.status === 'pending');

  const acceptCheckIn = (checkIn, finalStatus = 'asiste') => {
    // 1. Actualiza el bus → valida el check-in
    window.AttendanceBus?.validate(checkIn.id, finalStatus === 'asiste' ? 'confirmed' : 'partial');
    // 2. Añade el registro en la asistencia local
    addAttendanceRecord(session.id, {
      studentId:   checkIn.studentId,
      studentName: checkIn.studentName,
      status:      finalStatus,
      origin:      'match',
      notes:       'Check-in aprobado desde self check-in del alumno',
    });
    showToast(checkIn.studentName + ' marcado como ' + (finalStatus === 'asiste' ? 'presente' : 'asistencia parcial'));
  };
  const rejectCheckIn = (checkIn) => {
    window.AttendanceBus?.validate(checkIn.id, 'rejected');
    showToast('Check-in rechazado', 'info');
  };

  return React.createElement('div', null,
    React.createElement('div', { style: { marginBottom: 22 } },
      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, fontWeight: 700, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 4 } }, 'Pasar lista'),
      React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 28, fontWeight: 800, color: COLORS.dark, letterSpacing: -0.5 } }, 'Asistencia a la sesión'),
      React.createElement('p', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight, marginTop: 4 } },
        'Marca la asistencia manualmente o acepta los check-ins entrantes de los alumnos (',
        React.createElement('b', null, applicable.length), ' recibidos, ',
        React.createElement('b', { style: { color: COLORS.red } }, pending.length), ' pendientes',
        ').',
      ),
    ),

    // Selector de sesión
    React.createElement('div', {
      style: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' },
    },
      React.createElement('span', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, fontWeight: 700 } }, 'Sesión:'),
      React.createElement('select', {
        value: selectedSession || '', onChange: e => setSelectedSession(e.target.value),
        style: { padding: '9px 12px', borderRadius: 9, border: '1px solid #e4e7ef', fontSize: 13, fontFamily: 'Lato', background: '#fff', cursor: 'pointer', minWidth: 340 },
      },
        attendance.length === 0 && React.createElement('option', { value: '' }, 'No hay sesiones'),
        attendance.map(s => {
          const c = courses.find(c => c.id === s.courseId);
          return React.createElement('option', { key: s.id, value: s.id }, (c?.title || 'Curso').slice(0, 55) + ' · ' + s.sessionDate);
        }),
      ),
    ),

    !session
      ? React.createElement('div', {
          style: { padding: '48px 24px', textAlign: 'center', color: COLORS.textLight, fontFamily: 'Lato', background: '#fff', borderRadius: 14, border: '1px solid #eceef4' },
        }, 'Selecciona una sesión para pasar lista.')
      : React.createElement(React.Fragment, null,
          // Check-ins pendientes del bus cross-app
          pending.length > 0 && React.createElement('div', {
            style: { background: `${COLORS.orange}06`, border: `1px solid ${COLORS.orange}30`, borderRadius: 14, padding: 18, marginBottom: 18 },
          },
            React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: COLORS.dark, marginBottom: 10 } },
              '📍 ', pending.length, ' check-in', pending.length === 1 ? '' : 's', ' pendiente', pending.length === 1 ? '' : 's', ' de validar',
            ),
            ...pending.map(c => React.createElement('div', {
              key: c.id,
              style: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#fff', border: '1px solid #eceef4', borderRadius: 10, marginBottom: 8 },
            },
              React.createElement('div', { style: { width: 34, height: 34, borderRadius: 8, background: COLORS.gradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: 12 } },
                c.studentName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase(),
              ),
              React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 700, color: COLORS.dark } }, c.studentName),
                React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight } }, 'Check-in hace ', relTime(c.checkedInAt)),
              ),
              React.createElement('button', {
                onClick: () => acceptCheckIn(c, 'asiste'),
                style: { padding: '8px 12px', borderRadius: 7, background: '#16a34a', color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontSize: 11, fontWeight: 700, cursor: 'pointer' },
              }, '✓ Asiste'),
              React.createElement('button', {
                onClick: () => acceptCheckIn(c, 'parcial'),
                style: { padding: '8px 12px', borderRadius: 7, background: COLORS.orange, color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontSize: 11, fontWeight: 700, cursor: 'pointer' },
              }, '◐ Parcial'),
              React.createElement('button', {
                onClick: () => rejectCheckIn(c),
                style: { padding: '8px 12px', borderRadius: 7, background: '#fff', color: COLORS.red, border: `1px solid ${COLORS.red}40`, fontFamily: 'Bricolage Grotesque', fontSize: 11, fontWeight: 700, cursor: 'pointer' },
              }, '✗ Rechazar'),
            )),
          ),

          // Lista oficial
          React.createElement('div', {
            style: { background: '#fff', borderRadius: 14, border: '1px solid #eceef4', overflow: 'hidden' },
          },
            React.createElement('div', {
              style: { padding: '14px 18px', borderBottom: '1px solid #eceef4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
            },
              React.createElement('div', null,
                React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: COLORS.dark } },
                  course?.title?.slice(0, 60) || 'Curso',
                ),
                React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, marginTop: 2 } }, 'Sesión del ', session.sessionDate, ' · ', session.records.length, ' inscritos'),
              ),
              React.createElement('div', { style: { display: 'flex', gap: 8, fontFamily: 'Lato', fontSize: 11 } },
                React.createElement('span', { style: { color: '#16a34a', fontWeight: 700 } }, '✓ ', session.records.filter(r => r.status === 'asiste').length),
                React.createElement('span', { style: { color: COLORS.orange, fontWeight: 700 } }, '◐ ', session.records.filter(r => r.status === 'parcial').length),
                React.createElement('span', { style: { color: COLORS.red, fontWeight: 700 } }, '✗ ', session.records.filter(r => r.status === 'no_asiste').length),
              ),
            ),
            React.createElement('div', null,
              session.records.map(r => React.createElement(AttendanceRow, {
                key: r.studentId,
                record: r,
                onChange: (status, notes) => setStudentAttendance(session.id, r.studentId, status, notes),
              })),
            ),
          ),
        ),
  );
}

function AttendanceRow({ record, onChange }) {
  const [notesOpen, setNotesOpen] = React.useState(false);
  const [notes, setNotes] = React.useState(record.notes || '');
  return React.createElement('div', {
    style: { padding: '14px 18px', borderBottom: '1px solid #f4f5f9' },
  },
    React.createElement('div', {
      style: { display: 'flex', alignItems: 'center', gap: 12 },
    },
      React.createElement('div', {
        style: { width: 34, height: 34, borderRadius: 8, background: record.origin === 'match' ? COLORS.gradient : `${COLORS.cyan}24`, color: record.origin === 'match' ? '#fff' : COLORS.cyan, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: 12 },
      }, record.studentName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()),
      React.createElement('div', { style: { flex: 1, minWidth: 0 } },
        React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 700, color: COLORS.dark } }, record.studentName),
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight } },
          record.origin === 'match' ? '🔗 Origen: match con self check-in del alumno' : '✎ Origen: manual',
          record.notes ? ' · ' + record.notes : '',
        ),
      ),
      React.createElement('div', { style: { display: 'flex', gap: 6 } },
        ...['asiste', 'parcial', 'no_asiste'].map(s => React.createElement('button', {
          key: s,
          onClick: () => onChange(s, record.notes),
          style: {
            padding: '7px 12px', borderRadius: 7,
            border: record.status === s ? `1.5px solid ${ATTENDANCE_STATUS[s].color}` : '1px solid #e4e7ef',
            background: record.status === s ? ATTENDANCE_STATUS[s].bg : '#fff',
            color: record.status === s ? ATTENDANCE_STATUS[s].color : COLORS.textLight,
            fontFamily: 'Bricolage Grotesque', fontSize: 11, fontWeight: 700, cursor: 'pointer',
          },
        }, ATTENDANCE_STATUS[s].label)),
        React.createElement('button', {
          onClick: () => setNotesOpen(o => !o),
          title: 'Notas',
          style: { padding: '7px 10px', borderRadius: 7, background: '#fff', color: COLORS.textLight, border: '1px solid #e4e7ef', fontFamily: 'Bricolage Grotesque', fontSize: 11, fontWeight: 700, cursor: 'pointer' },
        }, '✎'),
      ),
    ),
    notesOpen && React.createElement('div', { style: { marginTop: 10, paddingLeft: 46 } },
      React.createElement('input', {
        type: 'text', value: notes, onChange: e => setNotes(e.target.value),
        onBlur: () => onChange(record.status, notes),
        placeholder: 'Notas sobre la asistencia (llegó tarde, se fue antes, etc.)',
        style: { width: '100%', padding: '8px 12px', borderRadius: 7, border: '1px solid #e4e7ef', fontFamily: 'Lato', fontSize: 12, background: '#fafbfc' },
      }),
    ),
  );
}

// Helper: "hace X min/h"
function relTime(iso) {
  if (!iso) return '—';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)    return diff + ' s';
  if (diff < 3600)  return Math.floor(diff / 60) + ' min';
  if (diff < 86400) return Math.floor(diff / 3600) + ' h';
  return Math.floor(diff / 86400) + ' días';
}

window.AttendanceView = AttendanceView;
