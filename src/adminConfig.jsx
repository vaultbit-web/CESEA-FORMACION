// ─── CESEA Formación · Superadmin — Configuración ────────────────────────────
//
// Panel de configuración general de la plataforma: datos corporativos,
// precios base, notificaciones automáticas, enlaces legales.
//
// FILEMAKER: Layout "Admin_Configuracion". Tabla Organizacion con un único
//   registro. Scripts:
//     • "Actualizar_Config_Organizacion" - Modify Record
//     • "Previsualizar_Legal_PDF"         - Save as PDF de layouts legales
// ─────────────────────────────────────────────────────────────────────────────

function AdminConfigView() {
  const { companyConfig, updateCompanyConfig, showToast, tipologias, addTipologia, removeTipologia } = React.useContext(AppContext);
  const [newTipologia, setNewTipologia] = React.useState('');
  const [form, setForm] = React.useState({
    legalName:    companyConfig?.legalName    || '',
    brandName:    companyConfig?.brandName    || '',
    cif:          companyConfig?.cif          || '',
    address:      companyConfig?.address      || '',
    addressRGPD:  companyConfig?.addressRGPD  || '',
    phone:        companyConfig?.phone        || '',
    emailOps:     companyConfig?.emailOps     || '',
    emailBiz:     companyConfig?.emailBiz     || '',
    jurisdiction: companyConfig?.jurisdiction || '',
  });
  const [legalDoc, setLegalDoc] = React.useState(null);
  const [notifs, setNotifs] = React.useState({
    newCourse:     true,
    hoursValidated:true,
    newJobOffer:   true,
    newDiploma:    true,
    paymentConfirm:true,
  });
  const [priceRange, setPriceRange] = React.useState({ min: 49, max: 249 });

  const field = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e4e7ef', fontFamily: 'Lato', fontSize: 13, outline: 'none', background: '#fff', color: COLORS.dark };
  const lbl = { display: 'block', fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: COLORS.textLight, marginBottom: 6, letterSpacing: 0.6, textTransform: 'uppercase' };

  const saveOrg = () => {
    updateCompanyConfig(form);
  };

  const LEGAL_LINKS = [
    { label: 'Aviso legal',          doc: 'avisoLegal' },
    { label: 'Política de privacidad', doc: 'privacidad' },
    { label: 'Política de cookies',    doc: 'cookies' },
  ];

  return React.createElement('div', null,
    React.createElement('div', { style: { marginBottom: 22 } },
      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.3, marginBottom: 4 } }, 'Configuración de la plataforma'),
      React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 26, fontWeight: 800, color: COLORS.dark, margin: 0 } },
        'Ajustes ',
        React.createElement('span', { style: { background: COLORS.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } }, 'generales'),
      ),
      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight, marginTop: 4 } }, 'Datos corporativos, políticas y opciones que afectan a toda la plataforma.'),
    ),

    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 18 } },
      // ── Tarjeta Organización ──
      React.createElement('div', {
        style: { background: '#fff', border: '1px solid #eceef4', borderRadius: 14, padding: 22, boxShadow: '0 4px 18px rgba(15,16,32,0.04)' },
      },
        React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 16, fontWeight: 800, color: COLORS.dark, marginBottom: 6 } }, '◉ Organización'),
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, marginBottom: 18 } }, 'Datos corporativos de la empresa titular. Aparecen en facturas, footer legal y documentos.'),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 } },
          React.createElement('div', { style: { gridColumn: '1 / -1' } },
            React.createElement('label', { style: lbl }, 'Razón social'),
            React.createElement('input', { value: form.legalName, onChange: e => setForm({ ...form, legalName: e.target.value }), style: field }),
          ),
          React.createElement('div', null,
            React.createElement('label', { style: lbl }, 'Marca comercial'),
            React.createElement('input', { value: form.brandName, onChange: e => setForm({ ...form, brandName: e.target.value }), style: field }),
          ),
          React.createElement('div', null,
            React.createElement('label', { style: lbl }, 'CIF / NIF'),
            React.createElement('input', { value: form.cif, onChange: e => setForm({ ...form, cif: e.target.value.toUpperCase() }), style: field }),
          ),
          React.createElement('div', { style: { gridColumn: '1 / -1' } },
            React.createElement('label', { style: lbl }, 'Domicilio social'),
            React.createElement('input', { value: form.address, onChange: e => setForm({ ...form, address: e.target.value }), style: field }),
          ),
          React.createElement('div', { style: { gridColumn: '1 / -1' } },
            React.createElement('label', { style: lbl }, 'Dirección RGPD (ejercicio de derechos)'),
            React.createElement('input', { value: form.addressRGPD, onChange: e => setForm({ ...form, addressRGPD: e.target.value }), style: field }),
          ),
          React.createElement('div', null,
            React.createElement('label', { style: lbl }, 'Teléfono'),
            React.createElement('input', { value: form.phone, onChange: e => setForm({ ...form, phone: e.target.value }), style: field }),
          ),
          React.createElement('div', null,
            React.createElement('label', { style: lbl }, 'Jurisdicción'),
            React.createElement('input', { value: form.jurisdiction, onChange: e => setForm({ ...form, jurisdiction: e.target.value }), style: field }),
          ),
          React.createElement('div', null,
            React.createElement('label', { style: lbl }, 'Email operaciones'),
            React.createElement('input', { type: 'email', value: form.emailOps, onChange: e => setForm({ ...form, emailOps: e.target.value }), style: field }),
          ),
          React.createElement('div', null,
            React.createElement('label', { style: lbl }, 'Email consultoría / comercial'),
            React.createElement('input', { type: 'email', value: form.emailBiz, onChange: e => setForm({ ...form, emailBiz: e.target.value }), style: field }),
          ),
        ),
        React.createElement('button', {
          onClick: saveOrg,
          style: { marginTop: 14, padding: '10px 18px', borderRadius: 9, background: COLORS.gradient, color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 12, cursor: 'pointer' },
        }, 'Guardar cambios'),
      ),

      // ── Tarjeta Precios base ──
      React.createElement('div', {
        style: { background: '#fff', border: '1px solid #eceef4', borderRadius: 14, padding: 22, boxShadow: '0 4px 18px rgba(15,16,32,0.04)' },
      },
        React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 16, fontWeight: 800, color: COLORS.dark, marginBottom: 6 } }, '€ Precios base'),
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, marginBottom: 18 } }, 'Rangos sugeridos al crear un nuevo curso. El superadmin puede saltárselos.'),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
          React.createElement('div', null,
            React.createElement('label', { style: lbl }, 'Precio mínimo (€)'),
            React.createElement('input', { type: 'number', value: priceRange.min, onChange: e => setPriceRange({ ...priceRange, min: Number(e.target.value) }), style: field }),
          ),
          React.createElement('div', null,
            React.createElement('label', { style: lbl }, 'Precio máximo (€)'),
            React.createElement('input', { type: 'number', value: priceRange.max, onChange: e => setPriceRange({ ...priceRange, max: Number(e.target.value) }), style: field }),
          ),
        ),
        React.createElement('button', {
          onClick: () => showToast('Rangos de precio actualizados'),
          style: { marginTop: 14, padding: '10px 18px', borderRadius: 9, background: COLORS.gradient, color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 12, cursor: 'pointer' },
        }, 'Guardar rango'),
      ),

      // ── Tarjeta Notificaciones ──
      React.createElement('div', {
        style: { background: '#fff', border: '1px solid #eceef4', borderRadius: 14, padding: 22, boxShadow: '0 4px 18px rgba(15,16,32,0.04)' },
      },
        React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 16, fontWeight: 800, color: COLORS.dark, marginBottom: 6 } }, '◔ Notificaciones automáticas'),
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, marginBottom: 18 } }, 'Eventos que generan notificaciones automáticas para los usuarios.'),
        ...[
          { key: 'newCourse',      label: 'Nuevo curso publicado' },
          { key: 'hoursValidated', label: 'Horas del formador validadas' },
          { key: 'newJobOffer',    label: 'Nueva oferta de empleo' },
          { key: 'newDiploma',     label: 'Diploma emitido' },
          { key: 'paymentConfirm', label: 'Pago confirmado' },
        ].map(n => React.createElement('label', {
          key: n.key,
          style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f4f5f9', cursor: 'pointer' },
        },
          React.createElement('span', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.text } }, n.label),
          React.createElement('input', {
            type: 'checkbox', checked: notifs[n.key],
            onChange: e => setNotifs({ ...notifs, [n.key]: e.target.checked }),
            style: { accentColor: COLORS.orange, width: 18, height: 18, cursor: 'pointer' },
          }),
        )),
      ),

      // ── Tarjeta Tipologías de formación ──
      // FILEMAKER: Value List "Tipologias_Formacion". Alimenta dropdown del
      //   formador ("Añadir propuesta formativa") y multiselect del perfil.
      React.createElement('div', {
        style: { background: '#fff', border: '1px solid #eceef4', borderRadius: 14, padding: 22, boxShadow: '0 4px 18px rgba(15,16,32,0.04)' },
      },
        React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 16, fontWeight: 800, color: COLORS.dark, marginBottom: 6 } }, '◆ Tipologías de formación'),
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, marginBottom: 14 } }, 'Catálogo común de tipologías. Se usa en el formulario "Añadir propuesta formativa" del formador y en el multiselect de su perfil.'),
        React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 14 } },
          React.createElement('input', { value: newTipologia, onChange: e => setNewTipologia(e.target.value), placeholder: 'Nueva tipología…', style: { ...field } }),
          React.createElement('button', {
            onClick: () => { const v = newTipologia.trim(); if (v) { addTipologia(v); setNewTipologia(''); showToast('Tipología añadida'); } },
            style: { padding: '10px 16px', borderRadius: 9, background: COLORS.gradient, color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' },
          }, '+ Añadir'),
        ),
        React.createElement('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
          ...(tipologias || []).map(t => React.createElement('span', {
            key: t,
            style: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 7, background: `${COLORS.orange}0d`, color: COLORS.orange, fontFamily: 'Lato', fontSize: 11, fontWeight: 700, border: `1px solid ${COLORS.orange}30` },
          },
            t,
            React.createElement('button', {
              onClick: () => removeTipologia(t),
              style: { background: 'none', border: 'none', color: COLORS.orange, cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: 0 },
              title: 'Eliminar tipología',
            }, '×'),
          )),
        ),
      ),

      // ── Tarjeta Legal ──
      React.createElement('div', {
        style: { background: '#fff', border: '1px solid #eceef4', borderRadius: 14, padding: 22, boxShadow: '0 4px 18px rgba(15,16,32,0.04)' },
      },
        React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 16, fontWeight: 800, color: COLORS.dark, marginBottom: 6 } }, '◈ Documentos legales'),
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, marginBottom: 18 } }, 'Textos vigentes publicados en la plataforma. Haz click para previsualizar.'),
        ...LEGAL_LINKS.map(l => React.createElement('button', {
          key: l.doc,
          onClick: () => setLegalDoc(l.doc),
          style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px 14px', marginBottom: 8, background: '#fafbfc', border: '1px solid #eceef4', borderRadius: 10, cursor: 'pointer', textAlign: 'left' },
        },
          React.createElement('span', { style: { fontFamily: 'Lato', fontSize: 13, fontWeight: 700, color: COLORS.text } }, '📄 ', l.label),
          React.createElement('span', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 11, fontWeight: 700, color: COLORS.orange } }, 'Ver →'),
        )),
        React.createElement('div', { style: { marginTop: 8, padding: 12, background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, fontFamily: 'Lato', fontSize: 11, color: '#92400e', lineHeight: 1.5 } },
          React.createElement('b', null, '⚠ FILEMAKER: '), 'Los textos legales se mantienen en layouts dedicados. Cambios afectan a aviso legal, privacidad y política de cookies visibles en el login y footer.',
        ),
      ),
    ),

    legalDoc && React.createElement(LegalModal, { doc: legalDoc, onClose: () => setLegalDoc(null) }),
  );
}

window.AdminConfigView = AdminConfigView;
