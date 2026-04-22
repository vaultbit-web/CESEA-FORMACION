// ─── CESEA Formación · Alumnado — Onboarding (tour inicial) ──────────────────
//
// Tour de 3 pasos que se muestra al primer inicio de sesión. Explica los
// puntos clave de la plataforma en un modal y se marca como completado al
// cerrarlo.
//
// FILEMAKER: Campo Alumnos::onboarding_completado (booleano). Cambia a 1 al
//   finalizar y no se vuelve a mostrar en futuros logins.
// ─────────────────────────────────────────────────────────────────────────────

const ONBOARDING_STEPS = [
  {
    icon: '◆',
    title: 'Explora el catálogo completo',
    text:  'Más de 65 cursos acreditados en cuatro áreas: técnica, competencias, ACP y autocuidados. Filtra por modalidad, precio o nivel para encontrar el que mejor se adapta a ti.',
  },
  {
    icon: '◉',
    title: 'Sigue tu progreso, gana logros',
    text:  'Cada curso completado suma horas formativas, desbloquea badges y queda disponible como diploma oficial descargable en PDF.',
  },
  {
    icon: '★',
    title: 'Accede a la bolsa de empleo',
    text:  'Recibimos ofertas exclusivas de empresas colaboradoras del sector dental y sociosanitario. Filtradas por tu sector, postulación con un clic usando tu CV.',
  },
];

function AlumnoOnboardingModal() {
  const { user, onboardingDone, completeOnboarding, theme } = React.useContext(AppContext);
  const [step, setStep] = React.useState(0);
  const [dismissed, setDismissed] = React.useState(false);

  if (!user || onboardingDone || dismissed) return null;

  const isLast = step === ONBOARDING_STEPS.length - 1;
  const curr = ONBOARDING_STEPS[step];

  const close = () => { setDismissed(true); completeOnboarding(); };

  return React.createElement(Modal, { open: true, onClose: close, theme, maxWidth: 480 },
    React.createElement('div', { style: { padding: 36, textAlign: 'center', background: theme.surface } },
      // Icon grande
      React.createElement('div', {
        style: { width: 72, height: 72, borderRadius: 20, background: COLORS.gradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', fontSize: 32, boxShadow: '0 12px 28px rgba(244,120,9,0.32)' },
      }, curr.icon),

      // Title + text
      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.orange, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 } }, 'Paso ' + (step + 1) + ' de ' + ONBOARDING_STEPS.length),
      React.createElement('h3', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 22, fontWeight: 800, color: theme.text, marginBottom: 10, letterSpacing: -0.3 } }, curr.title),
      React.createElement('p', { style: { fontFamily: 'Lato', fontSize: 14, color: theme.textLight, lineHeight: 1.6, marginBottom: 26, maxWidth: 360, margin: '0 auto 26px' } }, curr.text),

      // Progress dots
      React.createElement('div', { style: { display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 } },
        ONBOARDING_STEPS.map((_, i) =>
          React.createElement('div', {
            key: i,
            style: {
              width: i === step ? 28 : 8, height: 8, borderRadius: 4,
              background: i === step ? COLORS.orange : theme.border,
              transition: 'all 0.25s',
            },
          }),
        ),
      ),

      // Actions
      React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', gap: 10 } },
        React.createElement('button', {
          onClick: close,
          style: { background: 'none', border: 'none', color: theme.textLight, fontFamily: 'Lato', fontSize: 12, cursor: 'pointer', fontWeight: 700 },
        }, 'Saltar tour'),
        React.createElement('button', {
          onClick: () => isLast ? close() : setStep(step + 1),
          style: { padding: '11px 24px', borderRadius: 9, background: COLORS.gradient, color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.3 },
        }, isLast ? '¡Empezar! →' : 'Siguiente →'),
      ),
    ),
  );
}

window.AlumnoOnboardingModal = AlumnoOnboardingModal;
