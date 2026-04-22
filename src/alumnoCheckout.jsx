// ─── CESEA Formación · Alumnado — Checkout (pago demo) ───────────────────────
//
// Flujo de pago de demostración. NO integra con ninguna pasarela real:
// todo se simula con un spinner de 1.6 s y siempre devuelve éxito. Al cerrar
// crea la inscripción + registra el pago confirmado.
//
// FILEMAKER: Sustituir por integración real con Redsys / Stripe / Bizum.
//   Llamar a script "Procesar_Pago_TPV" que devuelve el estado y el número
//   de factura. En producción: el pago debe confirmarse server-side.
// ─────────────────────────────────────────────────────────────────────────────

function AlumnoCheckoutModal() {
  const {
    checkoutCourse, setCheckoutCourse, enrollInCourse,
    validateDiscount, user, theme, setCurrentView,
  } = React.useContext(AppContext);

  const [method,   setMethod]   = React.useState('tarjeta');
  const [step,     setStep]     = React.useState('form');   // form | processing | success
  const [code,     setCode]     = React.useState('');
  const [discount, setDiscount] = React.useState(null);
  const [codeErr,  setCodeErr]  = React.useState('');
  const [cardData, setCardData] = React.useState({ number: '', name: '', exp: '', cvv: '' });

  React.useEffect(() => {
    if (checkoutCourse) { setStep('form'); setCode(''); setDiscount(null); setCodeErr(''); setMethod('tarjeta'); setCardData({ number: '', name: '', exp: '', cvv: '' }); }
  }, [checkoutCourse]);

  if (!checkoutCourse) return null;
  const basePrice   = checkoutCourse.price;
  const discountAmt = discount ? Math.round(basePrice * discount.percent) / 100 : 0;
  const totalPrice  = Math.max(0, basePrice - discountAmt);

  const applyCode = () => {
    const d = validateDiscount(code);
    if (d) { setDiscount(d); setCodeErr(''); }
    else   { setDiscount(null); setCodeErr('Código no válido o expirado'); }
  };

  const processPayment = () => {
    // Validación mínima para el modo tarjeta
    if (method === 'tarjeta') {
      if (!cardData.number || !cardData.name || !cardData.exp || !cardData.cvv) {
        setCodeErr('Completa los datos de la tarjeta para continuar');
        return;
      }
    }
    setCodeErr('');
    setStep('processing');
    // FILEMAKER: POST /fmi/data/vLatest/databases/CESEA/layouts/Pagos/records
    setTimeout(() => {
      enrollInCourse(checkoutCourse.id, { amount: totalPrice, method });
      setStep('success');
    }, 1600);
  };

  const close = () => {
    setCheckoutCourse(null);
    if (step === 'success') setCurrentView('mis-cursos');
  };

  const methodOptions = [
    { id: 'tarjeta',        label: 'Tarjeta de crédito / débito', icon: '◨' },
    { id: 'bizum',          label: 'Bizum',                        icon: '◆' },
    { id: 'transferencia',  label: 'Transferencia bancaria',       icon: '◉' },
  ];

  return React.createElement(Modal, { open: true, onClose: close, theme, maxWidth: 560 },
    React.createElement('div', { style: { padding: 28, background: theme.surface, color: theme.text } },
      // ── Header ──
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 } },
        React.createElement('div', null,
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: theme.textLight, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 } }, 'Inscripción'),
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 18, fontWeight: 800, color: theme.text, lineHeight: 1.3, maxWidth: 400, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } }, checkoutCourse.title),
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: theme.textLight, marginTop: 4 } }, checkoutCourse.modality, ' · ', checkoutCourse.hours, ' h · ', checkoutCourse.dates),
        ),
        React.createElement('button', {
          onClick: close,
          style: { background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: theme.textLight, padding: 0, lineHeight: 1 },
        }, '×'),
      ),

      // ── Processing ──
      step === 'processing' && React.createElement('div', {
        style: { padding: '40px 20px', textAlign: 'center' },
      },
        React.createElement('div', {
          style: { width: 52, height: 52, borderRadius: '50%', border: `4px solid ${theme.border}`, borderTopColor: COLORS.orange, margin: '0 auto 18px', animation: 'spin 0.9s linear infinite' },
        }),
        React.createElement('style', { dangerouslySetInnerHTML: { __html: '@keyframes spin { to { transform: rotate(360deg); } }' } }),
        React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 15, fontWeight: 800, color: theme.text } }, 'Procesando tu pago…'),
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: theme.textLight, marginTop: 6 } }, 'Esto es una demo · no se realiza ningún cobro real'),
      ),

      // ── Success ──
      step === 'success' && React.createElement('div', { style: { padding: '30px 10px', textAlign: 'center' } },
        React.createElement('div', {
          style: { width: 64, height: 64, borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 34, fontWeight: 800 },
        }, '✓'),
        React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 20, fontWeight: 800, color: theme.text, marginBottom: 6 } }, '¡Inscripción confirmada!'),
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: theme.textLight, marginBottom: 22 } }, 'Te hemos enviado una copia de tu factura al correo. Ya puedes acceder al curso.'),
        React.createElement('div', { style: { padding: 18, borderRadius: 10, background: theme.surface2 || '#fafbfc', border: `1px solid ${theme.border}`, marginBottom: 20, textAlign: 'left' } },
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: theme.textLight, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 } }, 'Resumen'),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontFamily: 'Lato', fontSize: 13, marginBottom: 4 } },
            React.createElement('span', { style: { color: theme.textLight } }, 'Curso'),
            React.createElement('span', { style: { color: theme.text, fontWeight: 700 } }, checkoutCourse.title.slice(0, 30) + '…'),
          ),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontFamily: 'Lato', fontSize: 13 } },
            React.createElement('span', { style: { color: theme.textLight } }, 'Importe'),
            React.createElement('span', { style: { color: theme.text, fontWeight: 700 } }, totalPrice, ' € IVA incl.'),
          ),
        ),
        React.createElement('button', {
          onClick: close,
          style: { width: '100%', padding: 12, borderRadius: 10, background: COLORS.gradient, color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 13, cursor: 'pointer' },
        }, 'Ir a mis cursos →'),
      ),

      // ── Form ──
      step === 'form' && React.createElement('div', null,
        // Método de pago
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: theme.textLight, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 10 } }, 'Método de pago'),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 } },
          methodOptions.map(m => React.createElement('button', {
            key: m.id, type: 'button',
            onClick: () => setMethod(m.id),
            style: {
              padding: '12px 10px', borderRadius: 10,
              border: method === m.id ? `2px solid ${COLORS.orange}` : `1px solid ${theme.border}`,
              background: method === m.id ? `${COLORS.orange}0c` : theme.surface,
              color: method === m.id ? COLORS.orange : theme.text,
              fontFamily: 'Lato', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', textAlign: 'center',
            },
          },
            React.createElement('div', { style: { fontSize: 20, marginBottom: 4 } }, m.icon),
            m.label,
          )),
        ),

        // Datos del método
        method === 'tarjeta' && React.createElement('div', { style: { marginBottom: 18 } },
          React.createElement('input', {
            type: 'text', placeholder: 'Número de tarjeta',
            value: cardData.number, onChange: e => setCardData({ ...cardData, number: e.target.value }),
            style: { width: '100%', padding: '11px 14px', borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.surface2 || '#fafbfc', fontSize: 13, fontFamily: 'Lato', marginBottom: 8, color: theme.text },
          }),
          React.createElement('input', {
            type: 'text', placeholder: 'Titular de la tarjeta',
            value: cardData.name, onChange: e => setCardData({ ...cardData, name: e.target.value }),
            style: { width: '100%', padding: '11px 14px', borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.surface2 || '#fafbfc', fontSize: 13, fontFamily: 'Lato', marginBottom: 8, color: theme.text },
          }),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
            React.createElement('input', {
              type: 'text', placeholder: 'MM/AA',
              value: cardData.exp, onChange: e => setCardData({ ...cardData, exp: e.target.value }),
              style: { padding: '11px 14px', borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.surface2 || '#fafbfc', fontSize: 13, fontFamily: 'Lato', color: theme.text },
            }),
            React.createElement('input', {
              type: 'text', placeholder: 'CVV',
              value: cardData.cvv, onChange: e => setCardData({ ...cardData, cvv: e.target.value }),
              style: { padding: '11px 14px', borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.surface2 || '#fafbfc', fontSize: 13, fontFamily: 'Lato', color: theme.text },
            }),
          ),
        ),

        method === 'bizum' && React.createElement('div', { style: { padding: '14px 16px', borderRadius: 9, background: theme.surface2 || '#fafbfc', border: `1px solid ${theme.border}`, fontFamily: 'Lato', fontSize: 13, color: theme.text, marginBottom: 18 } },
          'Te enviaremos una notificación Bizum al número registrado en tu perfil: ', React.createElement('b', null, user.phone),
        ),
        method === 'transferencia' && React.createElement('div', { style: { padding: '14px 16px', borderRadius: 9, background: theme.surface2 || '#fafbfc', border: `1px solid ${theme.border}`, fontFamily: 'Lato', fontSize: 12, color: theme.text, marginBottom: 18, lineHeight: 1.7 } },
          React.createElement('b', null, 'Cuenta CESEA Formación'), React.createElement('br'),
          'ES12 3456 7890 1234 5678 9012', React.createElement('br'),
          React.createElement('span', { style: { color: theme.textLight } }, 'Incluye en concepto: ', React.createElement('b', null, 'CESEA-' + checkoutCourse.id + '-' + user.id)),
        ),

        // Código descuento
        React.createElement('div', { style: { marginBottom: 16 } },
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, fontWeight: 700, color: theme.textLight, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 } }, 'Código promocional'),
          React.createElement('div', { style: { display: 'flex', gap: 8 } },
            React.createElement('input', {
              type: 'text', value: code, onChange: e => setCode(e.target.value.toUpperCase()),
              placeholder: 'Ej. BIENVENIDA10',
              style: { flex: 1, padding: '10px 14px', borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.surface2 || '#fafbfc', fontSize: 13, fontFamily: 'Lato', color: theme.text },
            }),
            React.createElement('button', {
              type: 'button', onClick: applyCode,
              style: { padding: '10px 16px', borderRadius: 9, background: theme.surface, color: theme.text, border: `1px solid ${theme.border}`, fontFamily: 'Bricolage Grotesque', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
            }, 'Aplicar'),
          ),
          discount && React.createElement('div', { style: { marginTop: 6, fontSize: 11, color: '#16a34a', fontWeight: 700, fontFamily: 'Lato' } }, '✓ ', discount.label, ' aplicado'),
          codeErr && React.createElement('div', { style: { marginTop: 6, fontSize: 11, color: COLORS.red, fontFamily: 'Lato' } }, codeErr),
        ),

        // Resumen
        React.createElement('div', {
          style: { padding: 16, borderRadius: 10, background: theme.surface2 || '#fafbfc', border: `1px solid ${theme.border}`, marginBottom: 16 },
        },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontFamily: 'Lato', fontSize: 12, color: theme.textLight, marginBottom: 6 } },
            React.createElement('span', null, 'Precio del curso'),
            React.createElement('span', null, basePrice, ' €'),
          ),
          discount && React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontFamily: 'Lato', fontSize: 12, color: '#16a34a', marginBottom: 6 } },
            React.createElement('span', null, 'Descuento ', discount.percent, '%'),
            React.createElement('span', null, '− ', discountAmt.toFixed(2), ' €'),
          ),
          React.createElement('div', { style: { paddingTop: 8, marginTop: 4, borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
            React.createElement('span', { style: { fontFamily: 'Lato', fontSize: 11, color: theme.textLight, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' } }, 'Total a pagar'),
            React.createElement('span', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 22, fontWeight: 800, color: COLORS.orange } }, totalPrice.toFixed(2), ' €'),
          ),
        ),

        React.createElement('button', {
          onClick: processPayment,
          style: { width: '100%', padding: 14, borderRadius: 10, background: COLORS.gradient, color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: '0 10px 24px rgba(244,120,9,0.28)', letterSpacing: 0.2 },
        }, 'Confirmar y pagar'),
        React.createElement('div', { style: { textAlign: 'center', fontFamily: 'Lato', fontSize: 11, color: theme.textLight, marginTop: 10 } }, '⚬ Pago seguro · los datos se transmiten cifrados (demo)'),
      ),
    ),
  );
}

window.AlumnoCheckoutModal = AlumnoCheckoutModal;
