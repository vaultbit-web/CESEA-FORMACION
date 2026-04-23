// ─── CESEA Formación · Alumno — Diplomas ─────────────────────────────────────
//
// Listado de diplomas. Cada diploma se renderiza en un <div> oculto a tamaño
// real (1100×780) usando la plantilla PNG oficial como fondo y Nunito como
// tipografía (nombre 30 pt, curso 24 pt).
//
// Descarga del PDF — flujo robusto:
//   1. Esperar a que la fuente Nunito esté cargada (document.fonts).
//   2. Esperar a que la imagen de fondo esté cargada (onload).
//   3. html2canvas con scale 2 → canvas alta resolución.
//   4. jsPDF con el mismo tamaño del canvas → PDF perfecto.
//
// Los diplomas de cursos con progreso < 100 % aparecen BLOQUEADOS: los botones
// de descargar y compartir en LinkedIn están deshabilitados.
//
// FILEMAKER: En producción el PDF lo entrega FM Server desde contenedor FM
//   (Save as PDF del layout "Diploma_Oficial"). Sustituir la generación
//   cliente por un GET al endpoint REST Data API.
// ─────────────────────────────────────────────────────────────────────────────

const DIPLOMA_WIDTH  = 1100;
const DIPLOMA_HEIGHT = 780;
const DIPLOMA_TEMPLATE_SRC = 'assets/diploma-template.png';

// ─── Helper: esperar a Nunito cargada ──────────────────────────────────────
function waitForNunito() {
  if (!document.fonts || !document.fonts.load) return Promise.resolve();
  return Promise.all([
    document.fonts.load('700 30px Nunito'),
    document.fonts.load('700 24px Nunito'),
    document.fonts.load('600 16px Nunito'),
  ]).catch(() => {});
}

// ─── Helper: esperar a la imagen de fondo ──────────────────────────────────
function waitForImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

// ─── Formateo de fecha ISO → "22 de abril de 2026" ─────────────────────────
function formatDiplomaDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return iso; }
}

// ─── Renderer del diploma (tamaño real, sin transformaciones) ──────────────
// Renderiza SIEMPRE a 1100×780 px para que html2canvas capture nítido.
// Para miniaturas usamos un wrapper con transform:scale sobre este mismo nodo.
function AlumnoDiplomaRender({ diploma, user, innerRef, loaded }) {
  return React.createElement('div', {
    ref: innerRef,
    style: {
      position: 'relative',
      width: DIPLOMA_WIDTH, height: DIPLOMA_HEIGHT,
      fontFamily: 'Nunito, sans-serif',
      color: '#1a1a2e',
      overflow: 'hidden',
      // Fondo blanco por defecto; la imagen va como <img> para garantizar carga
      background: '#ffffff',
    },
  },
    // Imagen de fondo (garantiza evento onload antes de capturar)
    React.createElement('img', {
      src: DIPLOMA_TEMPLATE_SRC, alt: '',
      crossOrigin: 'anonymous',
      style: {
        position: 'absolute', top: 0, left: 0,
        width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center',
        pointerEvents: 'none', userSelect: 'none',
      },
      onLoad: loaded,
    }),

    // Nombre del alumno — 30pt Nunito bold
    React.createElement('div', {
      style: {
        position: 'absolute', top: 312, left: 0, right: 0,
        textAlign: 'center', padding: '0 90px',
        fontSize: 30, fontWeight: 700, letterSpacing: -0.2,
        lineHeight: 1.1,
      },
    }, user?.name || ''),

    // Título del curso — 24pt Nunito bold, mayúsculas
    React.createElement('div', {
      style: {
        position: 'absolute', top: 478, left: 0, right: 0,
        textAlign: 'center', padding: '0 130px',
        fontSize: 24, fontWeight: 700, lineHeight: 1.15,
        textTransform: 'uppercase',
      },
    }, diploma?.title || ''),

    // Fecha (junto a la línea "Fecha")
    React.createElement('div', {
      style: {
        position: 'absolute', bottom: 118, left: 130,
        fontSize: 16, fontWeight: 600,
      },
    }, formatDiplomaDate(diploma?.issueDate)),
  );
}

// ─── Vista principal ─────────────────────────────────────────────────────────
function AlumnoDiplomasView() {
  const { diplomas, enrollments, user, theme, showToast } = React.useContext(AppContext);
  const [preview, setPreview] = React.useState(null);
  const [generating, setGenerating] = React.useState(null);  // id del diploma que se está descargando

  // Refs a los nodos ocultos (uno por diploma)
  const renderRefs = React.useRef({});
  // Track de carga de imagen por diploma (key: diploma.id → boolean)
  const [imageLoaded, setImageLoaded] = React.useState({});
  const markLoaded = (id) => setImageLoaded(prev => prev[id] ? prev : { ...prev, [id]: true });

  const isLocked = (diploma) => {
    const enr = enrollments.find(e => e.id === diploma.enrollmentId);
    if (!enr) return false;
    return (enr.progress || 0) < 100;
  };

  // ── Descarga del PDF ──────────────────────────────────────────────────────
  const downloadPDF = async (diploma) => {
    if (isLocked(diploma)) { showToast('Completa el curso al 100 % para descargar el diploma', 'info'); return; }
    const node = renderRefs.current[diploma.id];
    if (!node) { showToast('Error: no se encontró el nodo del diploma', 'error'); return; }
    if (!window.html2canvas || !window.jspdf) {
      showToast('No se pudieron cargar las librerías de PDF. Recarga la página.', 'error'); return;
    }

    setGenerating(diploma.id);
    try {
      // 1. Asegurar que la fuente Nunito está cargada
      await waitForNunito();
      // 2. Asegurar que la imagen de fondo está cargada
      await waitForImage(DIPLOMA_TEMPLATE_SRC);
      // Pequeño reflow adicional para garantizar layout definitivo
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

      // 3. Capturar con html2canvas (scale 2 → alta resolución)
      const canvas = await window.html2canvas(node, {
        scale: 2, useCORS: true, allowTaint: false, backgroundColor: '#ffffff',
        width: DIPLOMA_WIDTH, height: DIPLOMA_HEIGHT,
        windowWidth: DIPLOMA_WIDTH, windowHeight: DIPLOMA_HEIGHT,
      });

      // 4. Generar el PDF con el canvas (landscape, tamaño exacto)
      const imgData = canvas.toDataURL('image/png');
      const jsPDFCtor = window.jspdf.jsPDF;
      const pdf = new jsPDFCtor({ orientation: 'landscape', unit: 'px', format: [DIPLOMA_WIDTH, DIPLOMA_HEIGHT], hotfixes: ['px_scaling'] });
      pdf.addImage(imgData, 'PNG', 0, 0, DIPLOMA_WIDTH, DIPLOMA_HEIGHT, undefined, 'FAST');
      pdf.save('diploma-' + (diploma.code || diploma.id) + '.pdf');
      showToast('Diploma descargado correctamente');
    } catch (err) {
      console.error('[diplomas] download error:', err);
      showToast('No se pudo generar el PDF: ' + (err.message || 'error desconocido'), 'error');
    } finally {
      setGenerating(null);
    }
  };

  // ── Compartir en LinkedIn ─────────────────────────────────────────────────
  const shareLinkedIn = (diploma) => {
    if (isLocked(diploma)) { showToast('El diploma se libera al completar el curso', 'info'); return; }
    const d = new Date(diploma.issueDate);
    const params = new URLSearchParams({
      startTask:        'CERTIFICATION_NAME',
      name:             (diploma.title || '').slice(0, 100),
      organizationName: 'CESEA Formación',
      issueYear:        String(d.getFullYear() || new Date().getFullYear()),
      issueMonth:       String((d.getMonth() || 0) + 1),
      certId:           diploma.code,
    });
    window.open('https://www.linkedin.com/profile/add?' + params.toString(), '_blank', 'noopener,noreferrer');
  };

  return React.createElement('div', null,
    // Header
    React.createElement('div', { style: { marginBottom: 22 } },
      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: theme.textLight, fontWeight: 700, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 4 } }, 'Mis logros'),
      React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 28, fontWeight: 800, color: theme.text, letterSpacing: -0.5 } }, 'Diplomas y certificados'),
      React.createElement('p', { style: { fontFamily: 'Lato', fontSize: 13, color: theme.textLight, marginTop: 4 } },
        'Se generan automáticamente al completar el curso al 100 %. Descárgalos en PDF o añádelos a tu perfil de LinkedIn.',
      ),
    ),

    // Listado de tarjetas
    diplomas.length === 0
      ? React.createElement(EmptyState, { theme, icon: '◆', title: 'Aún no tienes diplomas', text: 'Cuando completes tu primer curso encontrarás aquí tu diploma oficial.' })
      : React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 } },
          diplomas.map(d => {
            const locked = isLocked(d);
            const enr = enrollments.find(e => e.id === d.enrollmentId);
            const progress = enr?.progress ?? 100;
            const isGenerating = generating === d.id;
            return React.createElement('div', {
              key: d.id,
              style: { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: theme.cardShadow },
            },
              // Thumbnail (preview escalado del render real)
              React.createElement('div', {
                style: { position: 'relative', aspectRatio: `${DIPLOMA_WIDTH}/${DIPLOMA_HEIGHT}`, width: '100%', overflow: 'hidden', background: '#f4f5f9', cursor: locked ? 'default' : 'pointer' },
                onClick: () => !locked && setPreview(d),
              },
                // Miniatura: imagen de fondo + texto escalado con CSS (no usamos html2canvas aquí)
                React.createElement('img', {
                  src: DIPLOMA_TEMPLATE_SRC, alt: d.title,
                  style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: locked ? 'grayscale(1) blur(1px)' : 'none', opacity: locked ? 0.6 : 1 },
                }),
                React.createElement('div', {
                  style: {
                    position: 'absolute', inset: 0, padding: '16% 12%',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    textAlign: 'center', fontFamily: 'Nunito, sans-serif', color: '#1a1a2e',
                    filter: locked ? 'grayscale(1)' : 'none', opacity: locked ? 0.5 : 1,
                  },
                },
                  React.createElement('div', { style: { fontSize: 'clamp(12px, 4.2cqw, 28px)', fontWeight: 700, marginBottom: '4%' } }, user?.name || ''),
                  React.createElement('div', { style: { fontSize: 'clamp(9px, 3.2cqw, 22px)', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1.15, maxWidth: '90%' } }, d.title),
                ),
                locked && React.createElement('div', {
                  style: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,16,32,0.55)', color: '#fff', fontFamily: 'Lato', textAlign: 'center' },
                },
                  React.createElement('div', { style: { fontSize: 36, marginBottom: 10 } }, '🔒'),
                  React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 16, fontWeight: 800 } }, 'Diploma bloqueado'),
                  React.createElement('div', { style: { fontSize: 12, opacity: 0.85, marginTop: 4 } }, 'Completa el curso (', progress, '%) para desbloquear'),
                ),
              ),
              // Info
              React.createElement('div', { style: { padding: '14px 18px', borderTop: `1px solid ${theme.border}` } },
                React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 800, color: theme.text, lineHeight: 1.3, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } }, d.title),
                React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: theme.textLight } }, 'Emitido el ', formatDiplomaDate(d.issueDate), ' · ', d.hours, ' h · ', d.code),
              ),
              // Acciones
              React.createElement('div', { style: { padding: '12px 14px', display: 'flex', gap: 8, borderTop: `1px solid ${theme.border}` } },
                React.createElement('button', {
                  onClick: () => !locked && setPreview(d),
                  disabled: locked,
                  style: { flex: 1, padding: '9px 10px', borderRadius: 8, background: theme.surface2 || '#fafbfc', color: locked ? theme.textLight : theme.text, border: `1px solid ${theme.border}`, fontFamily: 'Bricolage Grotesque', fontSize: 11, fontWeight: 700, cursor: locked ? 'not-allowed' : 'pointer', opacity: locked ? 0.55 : 1 },
                }, 'Vista previa'),
                React.createElement('button', {
                  onClick: () => downloadPDF(d),
                  disabled: locked || isGenerating,
                  style: { flex: 1, padding: '9px 10px', borderRadius: 8, background: locked ? '#e4e7ef' : COLORS.gradient, color: locked ? theme.textLight : '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontSize: 11, fontWeight: 700, cursor: locked || isGenerating ? 'not-allowed' : 'pointer', opacity: isGenerating ? 0.7 : 1 },
                }, isGenerating ? 'Generando…' : '↓ Descargar PDF'),
                React.createElement('button', {
                  onClick: () => shareLinkedIn(d),
                  disabled: locked,
                  title: locked ? 'Se libera al completar el curso' : 'Añadir a LinkedIn',
                  style: { width: 40, padding: '9px 0', borderRadius: 8, background: locked ? '#e4e7ef' : '#0A66C2', color: locked ? theme.textLight : '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 700, cursor: locked ? 'not-allowed' : 'pointer' },
                }, 'in'),
              ),
            );
          }),
        ),

    // ── Modal de preview ────────────────────────────────────────────────────
    React.createElement(Modal, { open: !!preview, onClose: () => setPreview(null), theme, maxWidth: 1160 },
      preview && React.createElement('div', { style: { padding: 0, background: theme.surface } },
        React.createElement('div', { style: { padding: 24, background: '#f4f5f9', display: 'flex', justifyContent: 'center' } },
          // Wrapper: ancho responsivo + mantiene aspect-ratio del diploma
          React.createElement('div', {
            style: { width: '100%', maxWidth: DIPLOMA_WIDTH, aspectRatio: DIPLOMA_WIDTH + '/' + DIPLOMA_HEIGHT, position: 'relative', boxShadow: '0 20px 50px rgba(15,16,32,0.2)', borderRadius: 10, overflow: 'hidden' },
          },
            // El render real a tamaño natural, escalado con CSS `transform: scale()`
            React.createElement('div', {
              style: {
                width: DIPLOMA_WIDTH, height: DIPLOMA_HEIGHT,
                transformOrigin: 'top left',
                transform: 'scale(var(--s))',
                position: 'absolute', top: 0, left: 0,
              },
            },
              React.createElement(AlumnoDiplomaRender, { diploma: preview, user, loaded: () => markLoaded(preview.id) }),
            ),
            React.createElement(DiplomaScaleFit, null),
          ),
        ),
        React.createElement('div', {
          style: { padding: 18, display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center', background: theme.surface, borderTop: `1px solid ${theme.border}` },
        },
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: theme.textLight } },
            React.createElement('b', { style: { color: theme.text } }, (preview.title || '').slice(0, 60)),
            preview.title.length > 60 ? '…' : '',
            ' · ', preview.code,
          ),
          React.createElement('div', { style: { display: 'flex', gap: 10 } },
            React.createElement('button', {
              onClick: () => setPreview(null),
              style: { padding: '10px 16px', borderRadius: 8, background: theme.surface2 || '#fafbfc', color: theme.text, border: `1px solid ${theme.border}`, fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 12, cursor: 'pointer' },
            }, 'Cerrar'),
            React.createElement('button', {
              onClick: () => downloadPDF(preview),
              disabled: generating === preview.id,
              style: { padding: '10px 16px', borderRadius: 8, background: COLORS.gradient, color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 12, cursor: generating === preview.id ? 'wait' : 'pointer', opacity: generating === preview.id ? 0.7 : 1 },
            }, generating === preview.id ? 'Generando…' : '↓ Descargar PDF'),
          ),
        ),
      ),
    ),

    // ── Render HIDDEN offscreen para todos los diplomas (fuente del PDF) ───
    // Posicionados fuera de pantalla pero presentes en el DOM para que
    // html2canvas pueda capturarlos en cualquier momento con la imagen
    // de fondo ya cargada y la tipografía aplicada.
    React.createElement('div', {
      'aria-hidden': 'true',
      style: { position: 'fixed', left: -99999, top: 0, pointerEvents: 'none', zIndex: -1 },
    },
      diplomas.map(d => React.createElement(AlumnoDiplomaRender, {
        key: d.id, diploma: d, user,
        innerRef: (el) => { if (el) renderRefs.current[d.id] = el; },
        loaded: () => markLoaded(d.id),
      })),
    ),
  );
}

// ─── Helper: ajusta --s al ancho del contenedor del preview ────────────────
function DiplomaScaleFit() {
  React.useEffect(() => {
    const update = () => {
      document.querySelectorAll('[style*="--s"]').forEach((el) => {
        const parent = el.parentElement;
        if (!parent) return;
        const scale = parent.clientWidth / DIPLOMA_WIDTH;
        el.style.setProperty('--s', scale);
      });
    };
    update();
    window.addEventListener('resize', update);
    const ro = new ResizeObserver(update);
    document.querySelectorAll('[style*="--s"]').forEach(el => el.parentElement && ro.observe(el.parentElement));
    return () => { window.removeEventListener('resize', update); ro.disconnect(); };
  }, []);
  return null;
}

// FILEMAKER: función global para descargar un diploma desde cualquier vista.
//   Equivale a llamar al script "Descargar_Diploma_PDF" pasando id_diploma.
//   Se monta un contenedor off-screen con el DiplomaRenderer, se captura
//   con html2canvas y se exporta a PDF con jsPDF.
async function downloadDiplomaPDF(diploma, user, onToast) {
  if (!diploma) { onToast && onToast('Diploma no disponible', 'error'); return; }
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-9999px';
  host.style.top = '0';
  host.style.width = DIPLOMA_WIDTH + 'px';
  host.style.height = DIPLOMA_HEIGHT + 'px';
  document.body.appendChild(host);
  try {
    const root = ReactDOM.createRoot(host);
    await new Promise(res => {
      root.render(React.createElement(DiplomaRenderer, { diploma, user, innerRef: { current: host.firstChild } }));
      setTimeout(res, 80);
    });
    await waitForNunito();
    await waitForImage(DIPLOMA_TEMPLATE_SRC);
    const node = host.firstChild;
    const canvas = await window.html2canvas(node, { scale: 2, useCORS: true, backgroundColor: null });
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) throw new Error('jsPDF no disponible');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [DIPLOMA_WIDTH, DIPLOMA_HEIGHT] });
    pdf.addImage(imgData, 'PNG', 0, 0, DIPLOMA_WIDTH, DIPLOMA_HEIGHT);
    pdf.save('diploma-' + diploma.code + '.pdf');
    onToast && onToast('Diploma descargado');
    root.unmount();
  } catch (err) {
    console.error(err);
    onToast && onToast('No se pudo generar el PDF: ' + (err.message || 'error'), 'error');
  } finally {
    setTimeout(() => document.body.removeChild(host), 200);
  }
}

window.AlumnoDiplomasView  = AlumnoDiplomasView;
window.downloadDiplomaPDF  = downloadDiplomaPDF;
