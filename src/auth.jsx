// ─── CESEA Formación · Plataforma — Login unificado ──────────────────────────
//
// Pantalla única de entrada. Presenta:
//   • Selector de rol con 4 tarjetas demo (alumna, alumno, formadora, superadm.)
//   • Formulario manual de email + contraseña (login o registro)
// El contexto detecta el rol tras login y el router de index.html decide qué
// layout renderizar.
//
// FILEMAKER: Layout "Login_Global". Campo visible "account" y "password".
//   Script "Autenticar_Usuario" hace POST /sessions. El rol del usuario
//   (Privilege Set) determina el layout destino tras la validación.
// ─────────────────────────────────────────────────────────────────────────────

function AuthScreens() {
  const { login, loginAs, register, COMPANY } = React.useContext(AppContext);
  const { motion: aMotion } = window.Motion || {};
  const viewport = window.useViewport ? window.useViewport() : { isMobile: false, isTablet: false, isSmall: false };
  const isSmall = viewport.isSmall;    // móvil + tablet
  const isMobile = viewport.isMobile;

  const [mode,      setMode]      = React.useState('login');  // 'login' | 'register' | 'recover'
  const [email,     setEmail]     = React.useState('');
  const [pass,      setPass]      = React.useState('');
  const [pass2,     setPass2]     = React.useState('');
  const [name,      setName]      = React.useState('');
  const [sector,    setSector]    = React.useState('dental');
  const [acceptsT,  setAcceptsT]  = React.useState(false);
  const [loading,   setLoading]   = React.useState(false);
  const [recovered, setRecovered] = React.useState(false);
  const [showPass,  setShowPass]  = React.useState(false);
  const [shake,     setShake]     = React.useState(false);
  const [err,       setErr]       = React.useState('');
  const [legalDoc,  setLegalDoc]  = React.useState(null);

  // Atajo: pulsar una tarjeta → auto-login con esas credenciales demo
  const onCardClick = (cred) => {
    setEmail(cred.email); setPass(cred.password);
    setLoading(true); setErr('');
    setTimeout(() => { loginAs(cred); setLoading(false); }, 450);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setErr('');
    if (mode === 'recover') { setRecovered(true); return; }
    if (!email) { setShake(true); setTimeout(() => setShake(false), 400); return; }
    if (mode === 'register') {
      if (!name)           { setErr('Indica tu nombre completo'); return; }
      if (pass.length < 8) { setErr('La contraseña debe tener al menos 8 caracteres'); return; }
      if (pass !== pass2)  { setErr('Las contraseñas no coinciden'); return; }
      if (!acceptsT)       { setErr('Debes aceptar los términos'); return; }
    }
    setLoading(true);
    setTimeout(() => {
      let role = null;
      if (mode === 'register') role = register({ email, name, sector });
      else                     role = login(email, pass);
      if (!role && mode === 'login') setErr('Credenciales incorrectas. Prueba con las tarjetas demo.');
      setLoading(false);
    }, 600);
  };

  const field = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: '1.5px solid #e4e7ef', fontSize: 14, fontFamily: 'Lato',
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
    background: '#fff', boxSizing: 'border-box', color: COLORS.dark,
  };

  const modeLabels = {
    login:    ['Accede a tu panel',        'Usa las tarjetas demo o tus credenciales.'],
    register: ['Crea tu cuenta de alumno', 'Únete a CESEA Formación y empieza a formarte.'],
    recover:  ['Recuperar acceso',         'Te enviaremos un enlace de restablecimiento.'],
  };
  const [title, subtitle] = modeLabels[mode];

  const isLogin    = mode === 'login';
  const isRegister = mode === 'register';
  const isRecover  = mode === 'recover';

  // ── Tarjetas demo (agrupadas por rol; alumno muestra 2 perfiles) ───────────
  const roleCardDef = [
    { id: 'alumno',     icon: '◌', title: 'Soy alumno',       color: COLORS.cyan,   roles: ['alumno'] },
    { id: 'formador',   icon: '☯', title: 'Soy formador',     color: COLORS.orange, roles: ['formador'] },
    { id: 'superadmin', icon: '▣', title: 'Soy superadmin',   color: COLORS.pink,   roles: ['superadmin'] },
  ];
  const credsByRole = (roles) => (window.DEMO_CREDENTIALS || []).filter(c => roles.includes(c.roleType));

  const C = COMPANY || {};
  const Card = aMotion ? aMotion.div : 'div';
  const cardProps = aMotion ? { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } } : {};

  return React.createElement('div', {
    style: {
      minHeight: '100vh', display: 'grid',
      gridTemplateColumns: isSmall ? '1fr' : '1.1fr 1fr',
      background: '#f6f7fb', fontFamily: 'Lato',
    },
  },
    // ── Panel izquierdo (marca) — compacto en móvil ──────────────────────────
    React.createElement('div', {
      style: {
        background: '#0f1020', position: 'relative', overflow: 'hidden',
        padding: isMobile ? '28px 20px' : isSmall ? '36px 32px' : '56px 64px',
        display: 'flex', flexDirection: 'column',
        justifyContent: isSmall ? 'flex-start' : 'space-between',
        color: '#fff',
      },
    },
      React.createElement('div', { style: { position: 'absolute', top: -140, left: -120, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(252,173,0,0.22) 0%, transparent 65%)', filter: 'blur(32px)', pointerEvents: 'none' } }),
      React.createElement('div', { style: { position: 'absolute', bottom: -120, right: -80, width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(53,169,205,0.22) 0%, transparent 65%)', filter: 'blur(32px)', pointerEvents: 'none' } }),

      React.createElement('div', { style: { position: 'relative', zIndex: 1 } },
        React.createElement('img', {
          src: 'assets/logotipo-blanco.png', alt: 'CESEA Formación',
          style: { height: isMobile ? 42 : 56, width: 'auto', marginBottom: isMobile ? 14 : 28 },
          onError: e => { e.target.style.display = 'none'; },
        }),
        React.createElement('div', {
          style: { fontFamily: 'Bricolage Grotesque', fontSize: isMobile ? 11 : 13, color: 'rgba(255,255,255,0.72)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: isMobile ? 12 : 24 },
        }, 'Plataforma única'),
        React.createElement('h1', {
          style: { fontFamily: 'Bricolage Grotesque', fontSize: isMobile ? 28 : isSmall ? 34 : 44, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1, marginBottom: isMobile ? 10 : 18 },
        },
          'Forma, ',
          React.createElement('span', { style: { background: COLORS.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } }, 'cuida'),
          ',', isMobile ? ' ' : React.createElement('br'),
          'transforma vidas.',
        ),
        !isMobile && React.createElement('p', {
          style: { fontFamily: 'Lato', fontSize: 15, lineHeight: 1.6, maxWidth: 460, color: 'rgba(255,255,255,0.78)' },
        }, 'Un único acceso para alumnos, formadores y administración. Gestiona tus cursos, diplomas, tareas, asistencia y empleo desde la misma plataforma.'),
      ),

      !isMobile && React.createElement('div', { style: { position: 'relative', zIndex: 1, display: 'flex', gap: 28, flexWrap: 'wrap', color: 'rgba(255,255,255,0.72)', fontSize: 12, fontFamily: 'Lato', marginTop: isSmall ? 20 : 0 } },
        React.createElement('div', null,
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 22, fontWeight: 800, color: '#fff' } }, '8.400+'),
          'alumnos formados',
        ),
        React.createElement('div', null,
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 22, fontWeight: 800, color: '#fff' } }, '65'),
          'cursos acreditados',
        ),
        React.createElement('div', null,
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 22, fontWeight: 800, color: '#fff' } }, '4.8/5'),
          'valoración media',
        ),
      ),
    ),

    // ── Panel derecho (formulario + tarjetas) ───────────────────────────────
    React.createElement('div', {
      style: { display: 'flex', alignItems: isSmall ? 'flex-start' : 'center', justifyContent: 'center', padding: isMobile ? '20px 14px' : '28px 24px', background: '#f6f7fb', overflowY: 'auto' },
    },
      React.createElement(Card, Object.assign({
        style: { width: '100%', maxWidth: 500, padding: isMobile ? '22px 20px' : '32px 30px 26px', background: '#fff', borderRadius: 18, boxShadow: '0 16px 48px rgba(15,16,32,0.07)', animation: shake ? 'shake 0.4s' : undefined },
      }, cardProps),
        React.createElement('h2', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 24, fontWeight: 800, color: COLORS.dark, marginBottom: 4 } }, title),
        React.createElement('p', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight, marginBottom: 20 } }, subtitle),

        // ── Tarjetas de rol (solo en login) ────────────────────────────────
        isLogin && !recovered && React.createElement('div', {
          style: { marginBottom: 20, padding: '14px 14px 10px', borderRadius: 12, background: '#fafbfc', border: '1px dashed #d8dce6' },
        },
          React.createElement('div', {
            style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '0 2px' },
          },
            React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 10, color: COLORS.textLight, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase' } }, 'Acceso rápido · demo'),
            React.createElement('span', { style: { fontFamily: 'Lato', fontSize: 10, color: COLORS.textLight, fontStyle: 'italic' } }, 'Solo prototipo'),
          ),
          roleCardDef.map(rc => {
            const creds = credsByRole(rc.roles);
            return React.createElement('div', {
              key: rc.id,
              style: { marginBottom: 6 },
            },
              creds.map((cred, i) => React.createElement('button', {
                key: cred.email,
                type: 'button',
                onClick: () => onCardClick(cred),
                disabled: loading,
                style: {
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 10px', borderRadius: 8, marginBottom: 4,
                  background: '#fff', border: `1px solid ${rc.color}30`,
                  cursor: loading ? 'wait' : 'pointer', textAlign: 'left',
                  transition: 'all 0.18s',
                },
                onMouseEnter: e => { if (!loading) { e.currentTarget.style.borderColor = rc.color; e.currentTarget.style.background = `${rc.color}06`; } },
                onMouseLeave: e => { e.currentTarget.style.borderColor = `${rc.color}30`; e.currentTarget.style.background = '#fff'; },
              },
                React.createElement('div', {
                  style: { width: 30, height: 30, borderRadius: 7, flexShrink: 0, background: `${rc.color}18`, color: rc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: 13 },
                }, rc.icon),
                React.createElement('div', { style: { flex: 1, minWidth: 0, lineHeight: 1.25 } },
                  React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, fontWeight: 700, color: COLORS.dark } }, cred.label || rc.title),
                  React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 10.5, color: COLORS.textLight, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, cred.email, ' · ', cred.password),
                ),
                React.createElement('span', {
                  style: { padding: '5px 10px', borderRadius: 6, background: rc.color, color: '#fff', fontSize: 10, fontWeight: 700, fontFamily: 'Bricolage Grotesque', letterSpacing: 0.3 },
                }, 'Entrar →'),
              )),
            );
          }),
        ),

        // ── Divider ────────────────────────────────────────────────────────
        isLogin && !recovered && React.createElement('div', {
          style: { display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0 18px', color: COLORS.textLight, fontSize: 11, fontFamily: 'Lato', fontWeight: 600 },
        },
          React.createElement('div', { style: { flex: 1, height: 1, background: '#eceef4' } }),
          'o con tu email',
          React.createElement('div', { style: { flex: 1, height: 1, background: '#eceef4' } }),
        ),

        // ── Mensaje de éxito (recover) ─────────────────────────────────────
        recovered && React.createElement('div', {
          style: { background: '#f0fdf4', borderRadius: 12, padding: '20px', textAlign: 'center', border: '1px solid #bbf7d0', marginBottom: 12 },
        },
          React.createElement('div', { style: { fontSize: 24, marginBottom: 8 } }, '✓'),
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontWeight: 700, color: '#166534', marginBottom: 4 } }, 'Enlace enviado'),
          React.createElement('div', { style: { fontSize: 12, color: '#166534' } }, 'Revisa tu bandeja de entrada.'),
        ),

        // ── Formulario ─────────────────────────────────────────────────────
        !recovered && React.createElement('form', { onSubmit },
          isRegister && React.createElement('div', { style: { marginBottom: 12 } },
            React.createElement('label', { style: { display: 'block', fontSize: 11, fontWeight: 700, color: COLORS.text, marginBottom: 5 } }, 'Nombre completo'),
            React.createElement('input', { type: 'text', value: name, onChange: e => setName(e.target.value), placeholder: 'Tu nombre y apellidos', style: field }),
          ),
          React.createElement('div', { style: { marginBottom: 12 } },
            React.createElement('label', { style: { display: 'block', fontSize: 11, fontWeight: 700, color: COLORS.text, marginBottom: 5 } }, 'Correo electrónico'),
            React.createElement('input', { type: 'email', value: email, onChange: e => setEmail(e.target.value), placeholder: 'tu@email.com', style: field }),
          ),
          !isRecover && React.createElement('div', { style: { marginBottom: 12 } },
            React.createElement('label', { style: { display: 'block', fontSize: 11, fontWeight: 700, color: COLORS.text, marginBottom: 5 } }, 'Contraseña'),
            React.createElement('div', { style: { position: 'relative' } },
              React.createElement('input', { type: showPass ? 'text' : 'password', value: pass, onChange: e => setPass(e.target.value), placeholder: '••••••••', style: { ...field, paddingRight: 52 } }),
              React.createElement('button', {
                type: 'button', onClick: () => setShowPass(p => !p),
                style: { position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.textLight, fontSize: 11, fontFamily: 'Lato', fontWeight: 700 },
              }, showPass ? 'ocultar' : 'mostrar'),
            ),
          ),
          isRegister && React.createElement('div', { style: { marginBottom: 12 } },
            React.createElement('label', { style: { display: 'block', fontSize: 11, fontWeight: 700, color: COLORS.text, marginBottom: 5 } }, 'Repetir contraseña'),
            React.createElement('input', { type: 'password', value: pass2, onChange: e => setPass2(e.target.value), placeholder: '••••••••', style: field }),
          ),
          // FILEMAKER: el campo Alumnos::sector se asigna internamente
          //   (por email corporativo o política del cliente). No se expone en el formulario.
          isRegister && React.createElement('label', {
            style: { display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: COLORS.textLight, margin: '4px 0 12px', cursor: 'pointer' },
          },
            React.createElement('input', { type: 'checkbox', checked: acceptsT, onChange: e => setAcceptsT(e.target.checked), style: { marginTop: 3, accentColor: COLORS.orange } }),
            React.createElement('span', null, 'Acepto los ',
              React.createElement('span', { onClick: (e) => { e.preventDefault(); setLegalDoc('avisoLegal'); }, style: { color: COLORS.orange, fontWeight: 700, cursor: 'pointer' } }, 'términos'),
              ' y la ',
              React.createElement('span', { onClick: (e) => { e.preventDefault(); setLegalDoc('privacidad'); }, style: { color: COLORS.orange, fontWeight: 700, cursor: 'pointer' } }, 'política de privacidad'),
              '.',
            ),
          ),
          err && React.createElement('div', {
            style: { background: '#fef2f2', color: '#991b1b', fontSize: 12, padding: '8px 12px', borderRadius: 8, marginBottom: 10, fontFamily: 'Lato' },
          }, err),
          isLogin && React.createElement('div', { style: { textAlign: 'right', marginBottom: 12 } },
            React.createElement('span', { onClick: () => setMode('recover'), style: { color: COLORS.orange, fontSize: 12, cursor: 'pointer', fontWeight: 700 } }, '¿Has olvidado tu contraseña?'),
          ),
          React.createElement('button', {
            type: 'submit', disabled: loading,
            style: { width: '100%', padding: 13, borderRadius: 10, border: 'none', background: COLORS.gradient, color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'Bricolage Grotesque', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.8 : 1, boxShadow: '0 4px 18px rgba(244,120,9,0.28)', letterSpacing: 0.2 },
          }, loading ? 'Accediendo…' : isLogin ? 'Iniciar sesión' : isRegister ? 'Crear cuenta' : 'Enviar enlace'),
        ),

        // ── Switch entre modos ─────────────────────────────────────────────
        React.createElement('div', {
          style: { textAlign: 'center', fontSize: 13, marginTop: 16, fontFamily: 'Lato', color: COLORS.textLight },
        },
          isLogin && React.createElement('span', null,
            '¿Aún no tienes cuenta? ',
            React.createElement('span', { onClick: () => setMode('register'), style: { color: COLORS.orange, cursor: 'pointer', fontWeight: 700 } }, 'Regístrate'),
          ),
          !isLogin && React.createElement('span', {
            onClick: () => { setMode('login'); setRecovered(false); },
            style: { color: COLORS.orange, cursor: 'pointer', fontWeight: 700 },
          }, '← Volver al inicio de sesión'),
        ),

        // ── Footer legal ───────────────────────────────────────────────────
        React.createElement('div', {
          style: { marginTop: 22, paddingTop: 16, borderTop: '1px solid #f0f1f5', display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', fontFamily: 'Lato', fontSize: 10.5, color: COLORS.textLight },
        },
          React.createElement('span', { onClick: () => setLegalDoc('avisoLegal'), style: { cursor: 'pointer' }, onMouseEnter: e => e.currentTarget.style.color = COLORS.orange, onMouseLeave: e => e.currentTarget.style.color = COLORS.textLight }, 'Aviso legal'),
          '·',
          React.createElement('span', { onClick: () => setLegalDoc('privacidad'), style: { cursor: 'pointer' }, onMouseEnter: e => e.currentTarget.style.color = COLORS.orange, onMouseLeave: e => e.currentTarget.style.color = COLORS.textLight }, 'Privacidad'),
          '·',
          React.createElement('span', { onClick: () => setLegalDoc('cookies'), style: { cursor: 'pointer' }, onMouseEnter: e => e.currentTarget.style.color = COLORS.orange, onMouseLeave: e => e.currentTarget.style.color = COLORS.textLight }, 'Cookies'),
        ),
        React.createElement('div', { style: { textAlign: 'center', fontFamily: 'Lato', fontSize: 10, color: COLORS.textLight, marginTop: 10 } },
          C.legalName || 'WISHIT CSA SUPPLY SL', ' · CIF ', C.cif || 'B06842256', ' · ', C.copyright || '© 2026 CSA Formación',
        ),

        // ── Footer discreto: acceso al Kit Comercial (para vender la plataforma a otras empresas) ──
        // Sólo visible en el login; enlace estático a la carpeta RECURSOS PARA MARKETING servida
        // como static assets junto al index.html (funciona tanto en file:// local como en Vercel).
        React.createElement('div', {
          style: {
            marginTop: 18, paddingTop: 14, borderTop: '1px dashed #e5e7eb',
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10,
            flexWrap: 'wrap', fontFamily: 'Lato', fontSize: 11,
          },
        },
          React.createElement('span', { style: { color: COLORS.textLight, letterSpacing: 0.3 } }, '¿Tu empresa necesita una plataforma como esta?'),
          React.createElement('a', {
            href: 'RECURSOS%20PARA%20MARKETING/INDEX.html',
            target: '_blank', rel: 'noopener noreferrer',
            style: {
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 100,
              background: 'linear-gradient(135deg, #fcad00 0%, #f47809 100%)',
              color: '#fff', textDecoration: 'none', fontWeight: 800,
              fontSize: 11, letterSpacing: 0.3,
              boxShadow: '0 4px 14px -4px rgba(244,120,9,0.55)',
            },
            onMouseEnter: e => { e.currentTarget.style.transform = 'translateY(-1px)'; },
            onMouseLeave: e => { e.currentTarget.style.transform = 'translateY(0)'; },
          }, 'Descubre el Kit Comercial →'),
        ),
      ),
    ),

    // ── Modal legal ─────────────────────────────────────────────────────────
    legalDoc && React.createElement(LegalModal, { doc: legalDoc, onClose: () => setLegalDoc(null) }),
  );
}

window.AuthScreens = AuthScreens;
