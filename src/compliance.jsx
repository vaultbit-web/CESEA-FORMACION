// ─── Compliance Modal ─────────────────────────────────────────────────────────
function ComplianceModal() {
  const { complianceModal, setComplianceModal, completeCourse } = React.useContext(AppContext);
  const [tab,      setTab]      = React.useState('file');
  const [fileName, setFileName] = React.useState('');
  const [feedback, setFeedback] = React.useState('');
  const [done,     setDone]     = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const MIN_CHARS = 30;

  React.useEffect(() => {
    if (complianceModal) { setDone(false); setTab('file'); setFileName(''); setFeedback(''); }
  }, [complianceModal]);

  if (!complianceModal) return null;

  const ok = tab === 'file' ? !!fileName : feedback.length >= MIN_CHARS;

  return React.createElement('div', {
    style: { position: 'fixed', inset: 0, background: 'rgba(26,26,46,0.3)', backdropFilter: 'blur(7px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400 },
    onClick: e => { if (e.target === e.currentTarget) setComplianceModal(null); }
  },
    React.createElement('div', {
      style: { background: '#fff', borderRadius: 32, padding: '40px 40px 36px', width: 480, maxWidth: '94vw', boxShadow: '0 28px 90px rgba(0,0,0,0.14)', position: 'relative', overflow: 'hidden' }
    },
      // Top gradient bar
      React.createElement('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, height: 5, background: COLORS.gradient } }),

      // Close button
      React.createElement('button', {
        onClick: () => setComplianceModal(null),
        style: { position: 'absolute', top: 18, right: 18, width: 30, height: 30, borderRadius: 10, background: '#f0f1f5', border: 'none', cursor: 'pointer', fontSize: 14, color: COLORS.textLight, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }
      }, '✕'),

      done
        ? React.createElement('div', { style: { textAlign: 'center', padding: '28px 0 12px' } },
            React.createElement('div', { style: { width: 64, height: 64, borderRadius: 22, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: 28, border: '2px solid #dcfce7' } }, '✓'),
            React.createElement('h2', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 22, fontWeight: 800, color: COLORS.dark, margin: '0 0 8px' } }, 'Formación completada al 100%'),
            React.createElement('p', { style: { color: COLORS.textLight, fontFamily: 'Lato', fontSize: 14, margin: 0 } }, 'El registro ha sido actualizado correctamente.'),
          )
        : React.createElement(React.Fragment, null,
            React.createElement('div', { style: { marginBottom: 22 } },
              React.createElement('h2', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 19, fontWeight: 800, color: COLORS.dark, margin: '0 0 6px' } }, 'Cierre de Formación'),
              React.createElement('p', { style: { color: COLORS.textLight, fontSize: 13, fontFamily: 'Lato', margin: 0 } }, complianceModal.title),
            ),

            // Tabs
            React.createElement('div', { style: { display: 'flex', gap: 4, marginBottom: 22, background: '#f3f4f6', borderRadius: 16, padding: 4 } },
              ...([['file','📎 Adjuntar documento'], ['text','✏️ Escribir feedback']]).map(([id, lbl]) =>
                React.createElement('button', {
                  key: id, onClick: () => setTab(id),
                  style: {
                    flex: 1, padding: '10px 12px', borderRadius: 12, border: 'none',
                    background: tab === id ? '#fff' : 'transparent',
                    color: tab === id ? COLORS.dark : COLORS.textLight,
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Lato',
                    boxShadow: tab === id ? '0 1px 6px rgba(0,0,0,0.07)' : 'none',
                    transition: 'all 0.18s',
                  }
                }, lbl),
              ),
            ),

            // File tab
            tab === 'file'
              ? React.createElement('label', {
                  onDragOver:  e => { e.preventDefault(); setDragOver(true);  },
                  onDragLeave: () => setDragOver(false),
                  onDrop: e => {
                    e.preventDefault(); setDragOver(false);
                    const f = e.dataTransfer.files?.[0];
                    if (f) setFileName(f.name);
                  },
                  style: {
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '40px 20px',
                    borderRadius: 20, border: `2px dashed ${dragOver ? COLORS.orange : COLORS.lavender}60`,
                    cursor: 'pointer', background: dragOver ? `${COLORS.orange}06` : `${COLORS.lavender}06`,
                    transition: 'all 0.2s',
                  }
                },
                  React.createElement('div', {
                    style: { width: 52, height: 52, borderRadius: 16, background: fileName ? `${COLORS.cyan}14` : `${COLORS.orange}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: fileName ? COLORS.cyan : COLORS.orange, transition: 'all 0.2s' }
                  }, fileName ? '✓' : '↑'),
                  React.createElement('div', { style: { textAlign: 'center' } },
                    React.createElement('div', { style: { fontSize: 14, color: fileName ? COLORS.dark : COLORS.textLight, fontFamily: 'Lato', fontWeight: fileName ? 700 : 400, marginBottom: 4 } }, fileName || 'Arrastra o selecciona un archivo'),
                    !fileName && React.createElement('div', { style: { fontSize: 12, color: COLORS.textLight, fontFamily: 'Lato' } }, 'PDF, DOC, JPG — máx. 10MB'),
                  ),
                  React.createElement('input', { type: 'file', style: { display: 'none' }, onChange: e => setFileName(e.target.files?.[0]?.name || '') }),
                )
              // Feedback tab
              : React.createElement('div', null,
                  React.createElement('textarea', {
                    placeholder: `Describe la finalización, posibles incidencias o feedback detallado (mín. ${MIN_CHARS} caracteres)…`,
                    value: feedback, onChange: e => setFeedback(e.target.value),
                    style: {
                      padding: '14px 16px', borderRadius: 18, border: `2px solid ${feedback.length >= MIN_CHARS ? COLORS.cyan + '60' : '#e8eaf0'}`,
                      fontSize: 14, fontFamily: 'Lato', resize: 'vertical', minHeight: 130, outline: 'none',
                      width: '100%', boxSizing: 'border-box', color: COLORS.dark, transition: 'border-color 0.2s',
                    },
                  }),
                  React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, fontFamily: 'Lato' } },
                    React.createElement('span', { style: { color: feedback.length >= MIN_CHARS ? '#16a34a' : COLORS.textLight } },
                      feedback.length >= MIN_CHARS ? '✓ Mínimo alcanzado' : `Mínimo ${MIN_CHARS} caracteres`
                    ),
                    React.createElement('span', { style: { color: COLORS.textLight } }, feedback.length + ' / ' + MIN_CHARS),
                  ),
                ),

            // Actions
            React.createElement('div', { style: { display: 'flex', gap: 10, marginTop: 24 } },
              React.createElement('button', {
                onClick: () => {
                  if (ok) { setDone(true); setTimeout(() => completeCourse(complianceModal.id), 1600); }
                },
                disabled: !ok,
                style: {
                  flex: 1, padding: '14px', borderRadius: 18, border: 'none',
                  background: ok ? COLORS.gradient : '#e8eaf0',
                  color: ok ? '#fff' : '#c0c4cc', fontSize: 14, fontWeight: 700,
                  cursor: ok ? 'pointer' : 'not-allowed', fontFamily: 'Bricolage Grotesque',
                  boxShadow: ok ? '0 4px 18px rgba(244,120,9,0.28)' : 'none', transition: 'all 0.2s',
                }
              }, 'Completar formación'),
              React.createElement('button', {
                onClick: () => setComplianceModal(null),
                style: { padding: '14px 22px', borderRadius: 18, border: '1px solid #e8eaf0', background: '#fff', color: COLORS.textLight, fontSize: 14, cursor: 'pointer', fontFamily: 'Lato' }
              }, 'Cancelar'),
            ),
          ),
    ),
  );
}
window.ComplianceModal = ComplianceModal;
