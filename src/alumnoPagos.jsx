// ─── CESEA Formación · Alumno — Historial de pagos ───────────────────────────
//
// Tabla completa con todas las facturas/pagos del alumno. Cada registro se
// liga a su inscripción y permite descargar un PDF de factura (mock dinámico).
//
// FILEMAKER: Layout "Alumno_Pagos". Portal a tabla Pagos filtrado por
//   id_alumno = Get(AccountID). Script "Descargar_Factura_PDF" genera el PDF
//   via Save as PDF del layout "Factura_Oficial".
// ─────────────────────────────────────────────────────────────────────────────

function AlumnoPagosView() {
  const { payments, enrollments, courses, user, theme, showToast, COMPANY } = React.useContext(AppContext);
  const vp = window.useViewport ? window.useViewport() : { isSmall: false };
  const isSmall = vp.isSmall;

  const [yearFilter, setYearFilter] = React.useState('all');

  // Cruzamos pagos con inscripciones y cursos
  const rows = React.useMemo(() => {
    return payments.map(p => {
      const enr = enrollments.find(e => e.id === p.enrollmentId);
      const course = enr ? courses.find(c => c.id === enr.courseId) : null;
      return { payment: p, course };
    });
  }, [payments, enrollments, courses]);

  const years = React.useMemo(() => {
    const set = new Set(rows.map(r => (r.payment.date || '').slice(0, 4)).filter(Boolean));
    return ['all', ...Array.from(set).sort().reverse()];
  }, [rows]);

  const filtered = rows.filter(r => yearFilter === 'all' || (r.payment.date || '').startsWith(yearFilter));

  const totalAmount = filtered.reduce((s, r) => s + (r.payment.amount || 0), 0);
  const lastPayment = rows[0]; // ya vienen ordenados por fecha descendente

  // Descarga factura PDF (mock — genera PDF-1.4 válido mínimo)
  const downloadInvoice = async (row) => {
    const { payment: p, course } = row;
    const lines = [
      '%PDF-1.4',
      '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
      '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
      '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj',
      '4 0 obj << /Length 600 >> stream',
      'BT /F1 18 Tf 60 790 Td (FACTURA CESEA Formacion) Tj ET',
      'BT /F1 10 Tf 60 760 Td (' + (COMPANY?.legalName || 'WISHIT CSA SUPPLY SL') + ' - CIF ' + (COMPANY?.cif || 'B06842256') + ') Tj ET',
      'BT /F1 10 Tf 60 745 Td (' + (COMPANY?.address || 'C/ Gomis, 86 local 8, Barcelona') + ') Tj ET',
      'BT /F1 14 Tf 60 700 Td (Numero de factura: ' + p.invoiceNo + ') Tj ET',
      'BT /F1 11 Tf 60 680 Td (Fecha: ' + p.date + ') Tj ET',
      'BT /F1 11 Tf 60 660 Td (Cliente: ' + (user?.name || '') + ' - ' + (user?.email || '') + ') Tj ET',
      'BT /F1 11 Tf 60 640 Td (NIF: ' + (user?.fiscalData?.nif || '') + ') Tj ET',
      'BT /F1 11 Tf 60 620 Td (Direccion: ' + (user?.fiscalData?.address || user?.location || '') + ') Tj ET',
      'BT /F1 14 Tf 60 580 Td (Concepto) Tj ET',
      'BT /F1 11 Tf 60 560 Td (' + ((course?.title || 'Inscripcion formativa').slice(0, 80)) + ') Tj ET',
      'BT /F1 11 Tf 60 540 Td (Modalidad: ' + (course?.modality || '-') + '  Horas: ' + (course?.hours || '-') + ') Tj ET',
      'BT /F1 14 Tf 60 500 Td (Importe: ' + p.amount + ' EUR  IVA incluido) Tj ET',
      'BT /F1 11 Tf 60 480 Td (Metodo de pago: ' + p.method + ') Tj ET',
      'BT /F1 11 Tf 60 460 Td (Estado: ' + p.status + ') Tj ET',
      'BT /F1 9 Tf 60 100 Td (Factura generada electronicamente por CESEA Formacion.) Tj ET',
      'endstream endobj',
      '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
      'xref 0 6', '0000000000 65535 f ',
      'trailer << /Size 6 /Root 1 0 R >>', 'startxref', '0', '%%EOF',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'factura-' + p.invoiceNo + '.pdf';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Factura descargada');
  };

  const methodLabels = {
    tarjeta:        { label: 'Tarjeta',        icon: '◨' },
    bizum:          { label: 'Bizum',          icon: '◆' },
    transferencia:  { label: 'Transferencia',  icon: '◉' },
  };

  return React.createElement('div', null,
    // Header
    React.createElement('div', { style: { marginBottom: 22 } },
      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: theme.textLight, fontWeight: 700, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 4 } }, 'Facturas y pagos'),
      React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 28, fontWeight: 800, color: theme.text, letterSpacing: -0.5 } }, 'Historial de pagos'),
      React.createElement('p', { style: { fontFamily: 'Lato', fontSize: 13, color: theme.textLight, marginTop: 4 } },
        'Todas tus inscripciones pagadas y sus facturas. Descarga el PDF oficial de cada factura con un clic.',
      ),
    ),

    // KPIs
    React.createElement('div', {
      style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 18 },
    },
      React.createElement('div', { style: { background: theme.surface, borderRadius: 14, padding: 18, border: `1px solid ${theme.border}`, boxShadow: theme.cardShadow } },
        React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: theme.textLight, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 } }, 'Facturas'),
        React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 32, fontWeight: 800, color: theme.text, letterSpacing: -1, lineHeight: 1 } }, filtered.length),
      ),
      React.createElement('div', { style: { background: theme.surface, borderRadius: 14, padding: 18, border: `1px solid ${theme.border}`, boxShadow: theme.cardShadow } },
        React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: theme.textLight, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 } }, 'Importe total'),
        React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 32, fontWeight: 800, color: COLORS.orange, letterSpacing: -1, lineHeight: 1 } }, totalAmount.toFixed(2), ' €'),
      ),
      lastPayment && React.createElement('div', { style: { background: theme.surface, borderRadius: 14, padding: 18, border: `1px solid ${theme.border}`, boxShadow: theme.cardShadow } },
        React.createElement('div', { style: { fontSize: 10, fontWeight: 700, color: theme.textLight, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 } }, 'Último pago'),
        React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 18, fontWeight: 800, color: theme.text, letterSpacing: -0.3 } }, lastPayment.payment.amount, ' €'),
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: theme.textLight, marginTop: 2 } }, lastPayment.payment.date),
      ),
    ),

    // Filtro por año
    React.createElement('div', {
      style: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' },
    },
      React.createElement('span', { style: { fontSize: 11, fontWeight: 700, color: theme.textLight, letterSpacing: 0.8, textTransform: 'uppercase' } }, 'Filtrar por año:'),
      ...years.map(y => React.createElement('button', {
        key: y,
        onClick: () => setYearFilter(y),
        style: {
          padding: '7px 14px', borderRadius: 9,
          border: yearFilter === y ? `1px solid ${COLORS.orange}` : `1px solid ${theme.border}`,
          background: yearFilter === y ? `${COLORS.orange}0c` : theme.surface,
          color: yearFilter === y ? COLORS.orange : theme.text,
          fontFamily: 'Lato', fontSize: 12, fontWeight: 700, cursor: 'pointer',
        },
      }, y === 'all' ? 'Todos' : y)),
    ),

    // Lista / tabla
    filtered.length === 0
      ? React.createElement(EmptyState, { theme, icon: '◉', title: 'Sin facturas', text: 'No hay pagos registrados en este filtro.' })
      : isSmall
        ? React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
            filtered.map(r => {
              const m = methodLabels[r.payment.method] || { label: r.payment.method, icon: '◆' };
              return React.createElement('div', {
                key: r.payment.id,
                style: { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 16, boxShadow: theme.cardShadow },
              },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 } },
                  React.createElement('div', null,
                    React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 800, color: theme.text } }, r.payment.invoiceNo),
                    React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: theme.textLight, marginTop: 2 } }, r.payment.date, ' · ', m.icon, ' ', m.label),
                  ),
                  React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 18, fontWeight: 800, color: COLORS.orange } }, r.payment.amount, ' €'),
                ),
                React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: theme.text, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } }, r.course?.title || '—'),
                React.createElement('button', {
                  onClick: () => downloadInvoice(r),
                  style: { width: '100%', padding: 10, borderRadius: 8, background: COLORS.gradient, color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
                }, '↓ Descargar factura'),
              );
            }),
          )
        : React.createElement('div', { style: { background: theme.surface, borderRadius: 14, border: `1px solid ${theme.border}`, overflowX: 'auto', WebkitOverflowScrolling: 'touch', boxShadow: theme.cardShadow } },
            React.createElement('table', { style: { width: '100%', minWidth: 720, borderCollapse: 'collapse' } },
              React.createElement('thead', null,
                React.createElement('tr', { style: { background: theme.surface2 || '#fafbfc' } },
                  ...['Factura', 'Fecha', 'Curso', 'Método', 'Importe', ''].map(h =>
                    React.createElement('th', { key: h, style: { padding: '12px 16px', textAlign: 'left', fontFamily: 'Lato', fontSize: 10, fontWeight: 700, color: theme.textLight, letterSpacing: 1, textTransform: 'uppercase', borderBottom: `1px solid ${theme.border}` } }, h),
                  ),
                ),
              ),
              React.createElement('tbody', null,
                ...filtered.map(r => {
                  const m = methodLabels[r.payment.method] || { label: r.payment.method, icon: '◆' };
                  return React.createElement('tr', { key: r.payment.id, style: { borderBottom: `1px solid ${theme.border}` } },
                    React.createElement('td', { style: { padding: '14px 16px', fontFamily: 'Bricolage Grotesque', fontSize: 12, fontWeight: 800, color: theme.text } }, r.payment.invoiceNo),
                    React.createElement('td', { style: { padding: '14px 16px', fontFamily: 'Lato', fontSize: 12, color: theme.textLight } }, r.payment.date),
                    React.createElement('td', { style: { padding: '14px 16px', fontFamily: 'Lato', fontSize: 12, color: theme.text, maxWidth: 320 } },
                      React.createElement('div', { style: { display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' } }, r.course?.title || '—'),
                    ),
                    React.createElement('td', { style: { padding: '14px 16px', fontFamily: 'Lato', fontSize: 12, color: theme.text } },
                      React.createElement('span', { style: { marginRight: 6 } }, m.icon), m.label,
                    ),
                    React.createElement('td', { style: { padding: '14px 16px', fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 800, color: COLORS.orange } }, r.payment.amount, ' €'),
                    React.createElement('td', { style: { padding: '14px 16px', textAlign: 'right' } },
                      React.createElement('button', {
                        onClick: () => downloadInvoice(r),
                        style: { padding: '7px 14px', borderRadius: 7, background: COLORS.gradient, color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },
                      }, '↓ PDF'),
                    ),
                  );
                }),
              ),
            ),
          ),
  );
}

window.AlumnoPagosView = AlumnoPagosView;
