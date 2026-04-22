// ─── CESEA Formación · Alumnado — FAQ + Contacto ─────────────────────────────
//
// Preguntas frecuentes (acordeón) + formulario de contacto mock.
//
// FILEMAKER: Layout "Alumno_Ayuda". El formulario dispara el script
//   "Enviar_Mensaje_Soporte" que crea un ticket en Tickets_Soporte y envía
//   email a formacion@cesea.com.
// ─────────────────────────────────────────────────────────────────────────────

function AlumnoFAQView() {
  const { faq, theme, showToast } = React.useContext(AppContext);
  const [open, setOpen] = React.useState(0);
  const [form, setForm] = React.useState({ subject: '', message: '' });
  const [sent, setSent] = React.useState(false);

  const send = (e) => {
    e.preventDefault();
    if (!form.subject || !form.message) return;
    // FILEMAKER: POST /fmi/data/vLatest/databases/CESEA/layouts/Tickets_Soporte/records
    setSent(true);
    showToast('Mensaje enviado. Te contestaremos en menos de 24h.');
    setForm({ subject: '', message: '' });
  };

  return React.createElement('div', null,
    React.createElement('div', { style: { marginBottom: 22 } },
      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: theme.textLight, fontWeight: 700, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 4 } }, 'Centro de ayuda'),
      React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 28, fontWeight: 800, color: theme.text, letterSpacing: -0.5 } }, '¿Necesitas ayuda?'),
      React.createElement('p', { style: { fontFamily: 'Lato', fontSize: 13, color: theme.textLight, marginTop: 4 } }, 'Consulta las preguntas más comunes o escríbenos — respondemos en menos de 24h laborables.'),
    ),

    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 18 } },
      // ── FAQ ──
      React.createElement('div', {
        style: { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 8, boxShadow: theme.cardShadow },
      },
        faq.map((item, i) => React.createElement('div', {
          key: i,
          style: { borderBottom: i === faq.length - 1 ? 'none' : `1px solid ${theme.border}` },
        },
          React.createElement('button', {
            onClick: () => setOpen(open === i ? -1 : i),
            style: {
              width: '100%', textAlign: 'left', background: 'none', border: 'none',
              padding: '18px 20px', cursor: 'pointer',
              fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 700, color: theme.text,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
            },
          },
            React.createElement('span', null, item.q),
            React.createElement('span', { style: { color: COLORS.orange, fontSize: 20, transition: 'transform 0.2s', transform: open === i ? 'rotate(45deg)' : 'rotate(0)' } }, '+'),
          ),
          open === i && React.createElement('div', {
            style: { padding: '0 20px 18px', fontFamily: 'Lato', fontSize: 13, color: theme.text, lineHeight: 1.6 },
          }, item.a),
        )),
      ),

      // ── Contacto ──
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
        React.createElement('div', {
          style: { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 22, boxShadow: theme.cardShadow },
        },
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 15, fontWeight: 800, color: theme.text, marginBottom: 6 } }, 'Contacto directo'),
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: theme.textLight, marginBottom: 18, lineHeight: 1.5 } },
            '¿No encuentras lo que buscas? Escríbenos y uno de nuestros responsables te atenderá personalmente.',
          ),
          React.createElement('form', { onSubmit: send },
            React.createElement('input', {
              type: 'text', placeholder: 'Asunto', required: true,
              value: form.subject, onChange: e => setForm({ ...form, subject: e.target.value }),
              style: { width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${theme.border}`, fontFamily: 'Lato', fontSize: 13, marginBottom: 8, background: theme.surface2 || '#fafbfc', color: theme.text },
            }),
            React.createElement('textarea', {
              placeholder: 'Cuéntanos tu consulta…', required: true, rows: 5,
              value: form.message, onChange: e => setForm({ ...form, message: e.target.value }),
              style: { width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${theme.border}`, fontFamily: 'Lato', fontSize: 13, resize: 'vertical', background: theme.surface2 || '#fafbfc', color: theme.text },
            }),
            React.createElement('button', {
              type: 'submit',
              style: { width: '100%', marginTop: 10, padding: 11, borderRadius: 9, background: COLORS.gradient, color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 13, cursor: 'pointer' },
            }, sent ? 'Mensaje enviado ✓' : 'Enviar mensaje'),
          ),
        ),
        React.createElement('div', {
          style: { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 22, boxShadow: theme.cardShadow, fontFamily: 'Lato', fontSize: 13, lineHeight: 1.9, color: theme.text },
        },
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: theme.text, marginBottom: 8 } }, 'Otros canales'),
          React.createElement('div', null, '✉ ', React.createElement('b', null, 'formacion@cesea.com')),
          React.createElement('div', null, '☏ ', React.createElement('b', null, '+34 900 000 000')),
          React.createElement('div', { style: { color: theme.textLight, fontSize: 12 } }, 'Lunes a viernes · 9:00 – 18:00'),
        ),
      ),
    ),
  );
}

window.AlumnoFAQView = AlumnoFAQView;
