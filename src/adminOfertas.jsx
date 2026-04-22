// ─── CESEA Formación · Superadmin — Ofertas de empleo ────────────────────────
//
// CRUD de ofertas de empleo que publican empresas colaboradoras. Los alumnos
// las ven en `AlumnoJobsView` filtradas por sector. El superadmin crea,
// edita y archiva. Cambiar una oferta afecta inmediatamente a lo que ven
// los alumnos.
//
// FILEMAKER: Layout "Admin_Ofertas_Empleo". Tabla Ofertas_Empleo con CRUD
//   completo bajo [priv_Superadmin]. Scripts:
//     • "Crear_Oferta"   - New Record con estado = "activa"
//     • "Editar_Oferta"  - Modify Record con validaciones
//     • "Archivar_Oferta" - Set estado = "archivada" (no delete físico)
// ─────────────────────────────────────────────────────────────────────────────

function AdminOfertasView() {
  const { jobs, createJobOffer, updateJobOffer, archiveJobOffer, applications } = React.useContext(AppContext);

  const [sectorFilter, setSector] = React.useState('all');
  const [statusFilter, setStatus] = React.useState('all');
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);

  const filtered = React.useMemo(() => {
    return jobs.filter(j => {
      if (sectorFilter !== 'all' && j.sector !== sectorFilter) return false;
      const s = j.status || 'activa';
      if (statusFilter !== 'all' && s !== statusFilter) return false;
      return true;
    });
  }, [jobs, sectorFilter, statusFilter]);

  const applicationsByJob = React.useMemo(() => {
    const map = {};
    applications.forEach(a => { map[a.jobId] = (map[a.jobId] || 0) + 1; });
    return map;
  }, [applications]);

  const openNew = () => { setEditing(null); setEditorOpen(true); };
  const openEdit = (j) => { setEditing(j); setEditorOpen(true); };

  const statusPalette = {
    activa:     { label: 'Activa',     color: '#16a34a',    bg: '#16a34a15' },
    archivada:  { label: 'Archivada',  color: COLORS.textLight, bg: '#eceef4' },
  };

  return React.createElement('div', null,
    // Header
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22, flexWrap: 'wrap', gap: 12 } },
      React.createElement('div', null,
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.3, marginBottom: 4 } }, 'Bolsa de empleo'),
        React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 26, fontWeight: 800, color: COLORS.dark, margin: 0 } },
          'Ofertas ',
          React.createElement('span', { style: { background: COLORS.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } }, 'publicadas'),
        ),
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight, marginTop: 4 } }, 'Publica, edita y archiva ofertas. Los alumnos las ven filtradas por su sector (dental/sanidad).'),
      ),
      React.createElement('button', {
        onClick: openNew,
        style: { padding: '11px 20px', borderRadius: 10, background: COLORS.gradient, color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontWeight: 700, cursor: 'pointer', fontSize: 13, boxShadow: '0 6px 18px rgba(244,120,9,0.28)' },
      }, '+ Nueva oferta'),
    ),

    // Filtros
    React.createElement('div', { style: { display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' } },
      React.createElement('div', { style: { display: 'flex', gap: 6 } },
        ...['all', 'dental', 'sanidad'].map(s => React.createElement('button', {
          key: s, onClick: () => setSector(s),
          style: {
            padding: '9px 16px', borderRadius: 9,
            border: sectorFilter === s ? `1px solid ${COLORS.orange}` : '1px solid #e4e7ef',
            background: sectorFilter === s ? `${COLORS.orange}0c` : '#fff',
            color: sectorFilter === s ? COLORS.orange : COLORS.text,
            fontFamily: 'Lato', fontSize: 12, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize',
          },
        }, s === 'all' ? 'Todos los sectores' : s)),
      ),
      React.createElement('div', { style: { width: 1, height: 22, background: '#eceef4' } }),
      React.createElement('div', { style: { display: 'flex', gap: 6 } },
        ...['all', 'activa', 'archivada'].map(s => React.createElement('button', {
          key: s, onClick: () => setStatus(s),
          style: {
            padding: '9px 16px', borderRadius: 9,
            border: statusFilter === s ? `1px solid ${COLORS.cyan}` : '1px solid #e4e7ef',
            background: statusFilter === s ? `${COLORS.cyan}0c` : '#fff',
            color: statusFilter === s ? COLORS.cyan : COLORS.text,
            fontFamily: 'Lato', fontSize: 12, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize',
          },
        }, s === 'all' ? 'Todos los estados' : s)),
      ),
    ),

    // Tabla
    filtered.length === 0
      ? React.createElement('div', { style: { padding: '48px 24px', textAlign: 'center', color: COLORS.textLight, fontFamily: 'Lato', background: '#fff', borderRadius: 14, border: '1px solid #eceef4' } },
          'Sin ofertas con esos filtros. Pulsa «+ Nueva oferta» para publicar la primera.',
        )
      : React.createElement('div', { style: { background: '#fff', borderRadius: 14, border: '1px solid #eceef4', overflowX: 'auto', WebkitOverflowScrolling: 'touch' } },
          React.createElement('table', { style: { width: '100%', minWidth: 820, borderCollapse: 'collapse' } },
            React.createElement('thead', null,
              React.createElement('tr', { style: { background: '#fafbfc' } },
                ...['Puesto', 'Sector', 'Ubicación', 'Salario', 'Postulados', 'Estado', ''].map(h =>
                  React.createElement('th', { key: h, style: { padding: '12px 16px', textAlign: 'left', fontFamily: 'Lato', fontSize: 10, fontWeight: 700, color: COLORS.textLight, letterSpacing: 1, textTransform: 'uppercase', borderBottom: '1px solid #eceef4' } }, h),
                ),
              ),
            ),
            React.createElement('tbody', null,
              ...filtered.map(j => {
                const st = statusPalette[j.status || 'activa'] || statusPalette.activa;
                return React.createElement('tr', { key: j.id, style: { borderBottom: '1px solid #f4f5f9' } },
                  React.createElement('td', { style: { padding: '14px 16px', maxWidth: 280 } },
                    React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, fontWeight: 700, color: COLORS.dark } }, j.title),
                    React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, marginTop: 2 } }, j.company),
                  ),
                  React.createElement('td', { style: { padding: '14px 16px' } },
                    React.createElement(Pill, { text: j.sector, small: true, color: j.sector === 'dental' ? COLORS.orange : COLORS.cyan, bg: j.sector === 'dental' ? `${COLORS.orange}15` : `${COLORS.cyan}15` }),
                  ),
                  React.createElement('td', { style: { padding: '14px 16px', fontFamily: 'Lato', fontSize: 12, color: COLORS.text } }, j.location || '—'),
                  React.createElement('td', { style: { padding: '14px 16px', fontFamily: 'Lato', fontSize: 12, color: COLORS.text } }, j.salary || '—'),
                  React.createElement('td', { style: { padding: '14px 16px', fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: COLORS.dark } },
                    applicationsByJob[j.id] || 0,
                  ),
                  React.createElement('td', { style: { padding: '14px 16px' } },
                    React.createElement(Pill, { text: st.label, color: st.color, bg: st.bg, small: true }),
                  ),
                  React.createElement('td', { style: { padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' } },
                    React.createElement('button', {
                      onClick: () => openEdit(j),
                      style: { padding: '6px 12px', borderRadius: 7, background: '#fff', color: COLORS.text, border: '1px solid #e4e7ef', fontFamily: 'Bricolage Grotesque', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginRight: 6 },
                    }, 'Editar'),
                    (j.status !== 'archivada') && React.createElement('button', {
                      onClick: () => archiveJobOffer(j.id),
                      style: { padding: '6px 12px', borderRadius: 7, background: '#fff', color: COLORS.red, border: `1px solid ${COLORS.red}40`, fontFamily: 'Bricolage Grotesque', fontSize: 11, fontWeight: 700, cursor: 'pointer' },
                    }, 'Archivar'),
                  ),
                );
              }),
            ),
          ),
        ),

    editorOpen && React.createElement(OfertaEditorModal, {
      editing,
      onClose: () => setEditorOpen(false),
      onSave: (data) => {
        if (editing) updateJobOffer(editing.id, data);
        else         createJobOffer(data);
        setEditorOpen(false);
      },
    }),
  );
}

function OfertaEditorModal({ editing, onClose, onSave }) {
  const [form, setForm] = React.useState({
    title:    editing?.title    || '',
    company:  editing?.company  || '',
    sector:   editing?.sector   || 'dental',
    location: editing?.location || '',
    modality: editing?.modality || 'Presencial',
    salary:   editing?.salary   || '',
    hours:    editing?.hours    || 'Jornada completa',
    desc:     editing?.desc     || '',
    status:   editing?.status   || 'activa',
  });
  const field = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e4e7ef', fontFamily: 'Lato', fontSize: 13, outline: 'none', background: '#fff', color: COLORS.dark };
  const lbl = { display: 'block', fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, marginBottom: 6, letterSpacing: 0.6, textTransform: 'uppercase' };

  const canSave = form.title && form.company;

  return React.createElement(Modal, { open: true, onClose, maxWidth: 640 },
    React.createElement('div', { style: { padding: 28 } },
      React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 18, fontWeight: 800, color: COLORS.dark, marginBottom: 18 } },
        editing ? 'Editar oferta' : 'Nueva oferta de empleo',
      ),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 } },
        React.createElement('div', { style: { gridColumn: '1 / -1' } },
          React.createElement('label', { style: lbl }, 'Título del puesto'),
          React.createElement('input', { type: 'text', value: form.title, onChange: e => setForm({ ...form, title: e.target.value }), style: field, placeholder: 'Ej. Higienista dental' }),
        ),
        React.createElement('div', null,
          React.createElement('label', { style: lbl }, 'Empresa'),
          React.createElement('input', { type: 'text', value: form.company, onChange: e => setForm({ ...form, company: e.target.value }), style: field }),
        ),
        React.createElement('div', null,
          React.createElement('label', { style: lbl }, 'Ubicación'),
          React.createElement('input', { type: 'text', value: form.location, onChange: e => setForm({ ...form, location: e.target.value }), style: field, placeholder: 'Ciudad' }),
        ),
        React.createElement('div', null,
          React.createElement('label', { style: lbl }, 'Sector'),
          React.createElement('select', { value: form.sector, onChange: e => setForm({ ...form, sector: e.target.value }), style: field },
            React.createElement('option', { value: 'dental' }, 'Dental'),
            React.createElement('option', { value: 'sanidad' }, 'Sanidad'),
          ),
        ),
        React.createElement('div', null,
          React.createElement('label', { style: lbl }, 'Modalidad'),
          React.createElement('select', { value: form.modality, onChange: e => setForm({ ...form, modality: e.target.value }), style: field },
            React.createElement('option', { value: 'Presencial' }, 'Presencial'),
            React.createElement('option', { value: 'Híbrido' }, 'Híbrido'),
            React.createElement('option', { value: 'Remoto' }, 'Remoto'),
          ),
        ),
        React.createElement('div', null,
          React.createElement('label', { style: lbl }, 'Salario'),
          React.createElement('input', { type: 'text', value: form.salary, onChange: e => setForm({ ...form, salary: e.target.value }), style: field, placeholder: 'Ej. 24.000 €/año' }),
        ),
        React.createElement('div', null,
          React.createElement('label', { style: lbl }, 'Jornada'),
          React.createElement('input', { type: 'text', value: form.hours, onChange: e => setForm({ ...form, hours: e.target.value }), style: field }),
        ),
        React.createElement('div', { style: { gridColumn: '1 / -1' } },
          React.createElement('label', { style: lbl }, 'Descripción del puesto'),
          React.createElement('textarea', { value: form.desc, onChange: e => setForm({ ...form, desc: e.target.value }), rows: 4, style: { ...field, resize: 'vertical', fontFamily: 'Lato' } }),
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
        }, editing ? 'Guardar cambios' : 'Publicar oferta'),
      ),
    ),
  );
}

window.AdminOfertasView = AdminOfertasView;
