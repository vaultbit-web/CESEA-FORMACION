// ─── CESEA Formación · Superadmin — Gestión de alumnos ───────────────────────
//
// CRUD de alumnos. Búsqueda, filtros por sector/estado, modal de edición,
// y cambio de estado inline.
//
// FILEMAKER: Layout "Admin_Alumnos". Privilegio [priv_Superadmin]. Scripts:
//   • "Crear_Alumno"        - New Record en Alumnos + envío email bienvenida
//   • "Editar_Alumno"       - Modify Record con validaciones
//   • "Cambiar_Estado_Alumno" - Set Field estado (activo/inactivo/pendiente)
// ─────────────────────────────────────────────────────────────────────────────

function AdminAlumnosView() {
  const { students, createStudent, updateStudent, setStudentStatus } = React.useContext(AppContext);
  const vp = window.useViewport ? window.useViewport() : { isSmall: false };
  const isSmall = vp.isSmall;

  const [query, setQuery]             = React.useState('');
  const [sectorFilter, setSector]     = React.useState('all');
  const [statusFilter, setStatus]     = React.useState('all');
  const [editorOpen, setEditorOpen]   = React.useState(false);
  const [editing, setEditing]         = React.useState(null);   // null = crear, object = editar

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter(s => {
      if (sectorFilter !== 'all' && s.sector !== sectorFilter) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (q && !(s.name + ' ' + s.email + ' ' + (s.location || '')).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [students, query, sectorFilter, statusFilter]);

  const statusPalette = {
    activo:    { label: 'Activo',    color: '#16a34a',    bg: '#16a34a15' },
    inactivo:  { label: 'Inactivo',  color: COLORS.red,   bg: `${COLORS.red}14` },
    pendiente: { label: 'Pendiente', color: COLORS.yellow,bg: `${COLORS.yellow}22` },
  };

  const openNew = () => { setEditing(null); setEditorOpen(true); };
  const openEdit = (s) => { setEditing(s); setEditorOpen(true); };

  return React.createElement('div', null,
    // Header
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22, flexWrap: 'wrap', gap: 12 } },
      React.createElement('div', null,
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.3, marginBottom: 4 } }, 'Gestión de alumnos'),
        React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 26, fontWeight: 800, color: COLORS.dark, margin: 0 } },
          React.createElement('span', { style: { background: COLORS.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } }, students.length),
          ' alumnos registrados',
        ),
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight, marginTop: 4 } }, 'Da de alta, edita y gestiona el estado de todos los alumnos de la plataforma.'),
      ),
      React.createElement('button', {
        onClick: openNew,
        style: { padding: '11px 20px', borderRadius: 10, background: COLORS.gradient, color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontWeight: 700, cursor: 'pointer', fontSize: 13, boxShadow: '0 6px 18px rgba(244,120,9,0.28)' },
      }, '+ Añadir alumno'),
    ),

    // Filtros
    React.createElement('div', {
      style: { background: '#fff', border: '1px solid #eceef4', borderRadius: 14, padding: 14, marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 },
    },
      React.createElement('input', {
        type: 'search', value: query, onChange: e => setQuery(e.target.value),
        placeholder: '🔍 Buscar por nombre, email, ciudad…',
        style: { padding: '10px 14px', borderRadius: 9, border: '1px solid #e4e7ef', background: '#fafbfc', fontSize: 13, fontFamily: 'Lato', outline: 'none' },
      }),
      React.createElement('select', {
        value: sectorFilter, onChange: e => setSector(e.target.value),
        style: { padding: '10px 12px', borderRadius: 9, border: '1px solid #e4e7ef', background: '#fafbfc', fontSize: 13, fontFamily: 'Lato', cursor: 'pointer' },
      },
        React.createElement('option', { value: 'all' }, 'Todos los sectores'),
        React.createElement('option', { value: 'dental' }, 'Dental'),
        React.createElement('option', { value: 'sanidad' }, 'Sanidad'),
      ),
      React.createElement('select', {
        value: statusFilter, onChange: e => setStatus(e.target.value),
        style: { padding: '10px 12px', borderRadius: 9, border: '1px solid #e4e7ef', background: '#fafbfc', fontSize: 13, fontFamily: 'Lato', cursor: 'pointer' },
      },
        React.createElement('option', { value: 'all' }, 'Cualquier estado'),
        React.createElement('option', { value: 'activo' }, 'Activo'),
        React.createElement('option', { value: 'inactivo' }, 'Inactivo'),
        React.createElement('option', { value: 'pendiente' }, 'Pendiente'),
      ),
    ),

    // Tabla de alumnos
    filtered.length === 0
      ? React.createElement('div', {
          style: { padding: '48px 24px', textAlign: 'center', color: COLORS.textLight, fontFamily: 'Lato', background: '#fff', borderRadius: 14, border: '1px solid #eceef4' },
        }, 'Sin alumnos que coincidan con los filtros.')
      : React.createElement('div', { style: { background: '#fff', borderRadius: 14, border: '1px solid #eceef4', overflowX: 'auto', WebkitOverflowScrolling: 'touch' } },
          React.createElement('table', { style: { width: '100%', minWidth: 780, borderCollapse: 'collapse' } },
            React.createElement('thead', null,
              React.createElement('tr', { style: { background: '#fafbfc' } },
                ...['Alumno', 'Sector', 'Nº cursos', 'Última actividad', 'Estado', ''].map(h =>
                  React.createElement('th', { key: h, style: { padding: '12px 16px', textAlign: 'left', fontFamily: 'Lato', fontSize: 10, fontWeight: 700, color: COLORS.textLight, letterSpacing: 1, textTransform: 'uppercase', borderBottom: '1px solid #eceef4' } }, h),
                ),
              ),
            ),
            React.createElement('tbody', null,
              ...filtered.map(s => {
                const st = statusPalette[s.status] || statusPalette.activo;
                return React.createElement('tr', { key: s.id, style: { borderBottom: '1px solid #f4f5f9' } },
                  React.createElement('td', { style: { padding: '14px 16px' } },
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
                      React.createElement('div', {
                        style: { width: 34, height: 34, borderRadius: 8, background: COLORS.gradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: 12, flexShrink: 0 },
                      }, s.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()),
                      React.createElement('div', null,
                        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, fontWeight: 700, color: COLORS.dark } }, s.name),
                        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight } }, s.email),
                      ),
                    ),
                  ),
                  React.createElement('td', { style: { padding: '14px 16px' } },
                    React.createElement(Pill, { text: s.sector, small: true, color: s.sector === 'dental' ? COLORS.orange : COLORS.cyan, bg: s.sector === 'dental' ? `${COLORS.orange}15` : `${COLORS.cyan}15` }),
                  ),
                  React.createElement('td', { style: { padding: '14px 16px', fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 800, color: COLORS.dark } }, s.coursesCount || 0),
                  React.createElement('td', { style: { padding: '14px 16px', fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight } }, s.lastActivity || '—'),
                  React.createElement('td', { style: { padding: '14px 16px' } },
                    React.createElement(Pill, { text: st.label, color: st.color, bg: st.bg, small: true }),
                  ),
                  React.createElement('td', { style: { padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' } },
                    React.createElement('select', {
                      value: s.status, onChange: e => setStudentStatus(s.id, e.target.value),
                      style: { padding: '6px 10px', borderRadius: 7, border: '1px solid #e4e7ef', fontSize: 11, fontFamily: 'Lato', background: '#fff', cursor: 'pointer', color: COLORS.text, marginRight: 6 },
                    },
                      React.createElement('option', { value: 'activo' }, 'Activo'),
                      React.createElement('option', { value: 'inactivo' }, 'Inactivo'),
                      React.createElement('option', { value: 'pendiente' }, 'Pendiente'),
                    ),
                    React.createElement('button', {
                      onClick: () => openEdit(s),
                      style: { padding: '6px 12px', borderRadius: 7, background: '#fff', color: COLORS.text, border: '1px solid #e4e7ef', fontFamily: 'Bricolage Grotesque', fontSize: 11, fontWeight: 700, cursor: 'pointer' },
                    }, 'Editar'),
                  ),
                );
              }),
            ),
          ),
        ),

    // Modal de edición / creación
    editorOpen && React.createElement(AlumnoEditorModal, {
      editing,
      onClose: () => setEditorOpen(false),
      onSave: (data) => {
        if (editing) updateStudent(editing.id, data);
        else         createStudent(data);
        setEditorOpen(false);
      },
    }),
  );
}

function AlumnoEditorModal({ editing, onClose, onSave }) {
  const [form, setForm] = React.useState({
    name:     editing?.name     || '',
    email:    editing?.email    || '',
    phone:    editing?.phone    || '',
    location: editing?.location || '',
    sector:   editing?.sector   || 'dental',
    status:   editing?.status   || 'activo',
  });
  const field = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e4e7ef', fontFamily: 'Lato', fontSize: 13, outline: 'none', background: '#fff', color: COLORS.dark };
  const lbl = { display: 'block', fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, marginBottom: 6, letterSpacing: 0.6, textTransform: 'uppercase' };

  const canSave = form.name && form.email;

  return React.createElement(Modal, { open: true, onClose, maxWidth: 560 },
    React.createElement('div', { style: { padding: 28 } },
      React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 18, fontWeight: 800, color: COLORS.dark, marginBottom: 18 } },
        editing ? 'Editar alumno' : 'Añadir nuevo alumno',
      ),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 } },
        React.createElement('div', { style: { gridColumn: '1 / -1' } },
          React.createElement('label', { style: lbl }, 'Nombre completo'),
          React.createElement('input', { type: 'text', value: form.name, onChange: e => setForm({ ...form, name: e.target.value }), style: field }),
        ),
        React.createElement('div', { style: { gridColumn: '1 / -1' } },
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
        React.createElement('div', null,
          React.createElement('label', { style: lbl }, 'Sector'),
          React.createElement('select', { value: form.sector, onChange: e => setForm({ ...form, sector: e.target.value }), style: field },
            React.createElement('option', { value: 'dental' }, 'Dental'),
            React.createElement('option', { value: 'sanidad' }, 'Sanidad'),
          ),
        ),
        React.createElement('div', null,
          React.createElement('label', { style: lbl }, 'Estado'),
          React.createElement('select', { value: form.status, onChange: e => setForm({ ...form, status: e.target.value }), style: field },
            React.createElement('option', { value: 'activo' }, 'Activo'),
            React.createElement('option', { value: 'inactivo' }, 'Inactivo'),
            React.createElement('option', { value: 'pendiente' }, 'Pendiente'),
          ),
        ),
      ),
      React.createElement('div', { style: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 } },
        React.createElement('button', {
          onClick: onClose,
          style: { padding: '10px 18px', borderRadius: 9, background: '#fff', color: COLORS.text, border: '1px solid #e4e7ef', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 12, cursor: 'pointer' },
        }, 'Cancelar'),
        React.createElement('button', {
          onClick: () => onSave(form), disabled: !canSave,
          style: { padding: '10px 20px', borderRadius: 9, background: canSave ? COLORS.gradient : '#e4e7ef', color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 12, cursor: canSave ? 'pointer' : 'not-allowed' },
        }, editing ? 'Guardar cambios' : 'Crear alumno'),
      ),
    ),
  );
}

window.AdminAlumnosView = AdminAlumnosView;
