// ─── Widgets ──────────────────────────────────────────────────────────────────
const { motion: widgetsMotion } = window.Motion || {};

// ─── Mini Calendar Widget ─────────────────────────────────────────────────────
function MiniCalendarWidget() {
  const { courses, calendarEvents, setCurrentView } = React.useContext(AppContext);
  const [cm, setCm] = React.useState(new Date(2026, 0, 1));
  const MN = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const DN = ['L','M','X','J','V','S','D'];
  const y = cm.getFullYear(), m = cm.getMonth();
  const fd  = (new Date(y, m, 1).getDay() + 6) % 7;
  const dim = new Date(y, m + 1, 0).getDate();

  const hlDays = {};
  const booked = courses.filter(c => ['accepted','review','completed'].includes(c.status));
  booked.forEach(c => {
    // startDate first (YYYY-MM-DD), fallback to legacy dates string
    if (c.startDate) {
      const [yy, mm, dd] = c.startDate.split('-').map(Number);
      if (yy === y && mm - 1 === m) {
        hlDays[dd] = c.status === 'accepted' ? COLORS.cyan : c.status === 'review' ? COLORS.yellow : COLORS.lavender;
      }
      return;
    }
    const match = (c.dates || '').match(/(\d{1,2})(?:-(\d{1,2}))?\s+(\w+)\s+(\d{4})/);
    if (!match) return;
    const months = {Enero:0,Febrero:1,Marzo:2,Abril:3,Mayo:4,Junio:5,Julio:6,Agosto:7,Septiembre:8,Octubre:9,Noviembre:10,Diciembre:11};
    if (months[match[3]] !== m) return;
    const s = parseInt(match[1]), e = match[2] ? parseInt(match[2]) : s;
    for (let d = s; d <= e; d++) {
      hlDays[d] = c.status === 'accepted' ? COLORS.cyan : c.status === 'review' ? COLORS.yellow : COLORS.lavender;
    }
  });
  calendarEvents.forEach(ev => {
    const d = new Date(ev.date);
    if (d.getMonth() === m && d.getFullYear() === y) hlDays[d.getDate()] = COLORS.fuchsia;
  });

  const today = new Date();
  const isCurrentMonth = today.getMonth() === m && today.getFullYear() === y;
  const TODAY = isCurrentMonth ? today.getDate() : -1;

  const cells = [];
  for (let i = 0; i < fd; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);

  const Mc = widgetsMotion ? widgetsMotion.div : 'div';

  return React.createElement(Mc, {
    ...(widgetsMotion ? { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.05 } } : {}),
    style: { background: '#ffffff', borderRadius: 18, padding: '20px 22px', boxShadow: '0 1px 3px rgba(18,20,35,0.04), 0 1px 2px rgba(18,20,35,0.03)', border: '1px solid #eceef4' }
  },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 } },
      React.createElement('span', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 700, color: COLORS.dark, letterSpacing: 0.1 } }, MN[m] + ' ' + y),
      React.createElement('div', { style: { display: 'flex', gap: 4 } },
        React.createElement('button', { onClick: () => setCm(new Date(y, m-1, 1)), style: navBtn } , '‹'),
        React.createElement('button', { onClick: () => setCm(new Date(y, m+1, 1)), style: navBtn } , '›'),
      ),
    ),
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 } },
      ...DN.map(d => React.createElement('div', { key: d, style: { textAlign: 'center', fontSize: 10, fontWeight: 700, color: COLORS.textLight, padding: '4px 0', fontFamily: 'Lato', letterSpacing: 0.5 } }, d)),
    ),
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 } },
      ...cells.map((d, i) => {
        const hl      = hlDays[d];
        const isToday = d === TODAY;
        return React.createElement('div', {
          key: i,
          onClick: () => { if (d) setCurrentView('calendario'); },
          style: {
            width: '100%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 8, fontSize: 12, fontFamily: 'Lato',
            fontWeight: isToday ? 800 : hl ? 700 : 500,
            color: isToday ? '#fff' : hl ? hl : d ? COLORS.text : 'transparent',
            background: isToday ? COLORS.gradient : hl ? `${hl}14` : 'transparent',
            cursor: d ? 'pointer' : 'default', transition: 'all 0.15s',
            boxShadow: isToday ? '0 2px 6px rgba(244,120,9,0.28)' : 'none',
          }
        }, d || '');
      }),
    ),
    React.createElement('div', { style: { marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f1f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: COLORS.textLight, fontFamily: 'Lato' } },
        React.createElement('span', { style: { width: 6, height: 6, borderRadius: '50%', background: COLORS.cyan, display: 'inline-block' } }),
        'Aceptadas ',
        React.createElement('span', { style: { width: 6, height: 6, borderRadius: '50%', background: COLORS.yellow, display: 'inline-block', marginLeft: 8 } }),
        'En revisión',
      ),
      React.createElement('button', {
        onClick: () => setCurrentView('calendario'),
        style: { padding: '4px 10px', borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 11, color: COLORS.orange, fontWeight: 700, fontFamily: 'Lato' }
      }, 'Ver todo →'),
    ),
  );
}

const navBtn = { width: 24, height: 24, borderRadius: 6, background: '#f4f5f9', border: 'none', cursor: 'pointer', fontSize: 12, color: COLORS.text, display: 'flex', alignItems: 'center', justifyContent: 'center' };

// ─── Hours Widget ────────────────────────────────────────────────────────────
function HoursWidget() {
  const { hoursLog, setCurrentView } = React.useContext(AppContext);
  const total     = hoursLog.reduce((s, h) => s + h.hours, 0);
  const validated = hoursLog.filter(h => h.status === 'Validado').reduce((s, h) => s + h.hours, 0);
  const pct       = total ? Math.round((validated / total) * 100) : 0;
  const Mc        = widgetsMotion ? widgetsMotion.div : 'div';

  // Spark-line: horas por mes (6 últimos)
  const monthTotals = Array(6).fill(0);
  hoursLog.forEach(h => {
    const [_, m] = h.date.split('/');
    const idx = parseInt(m) - 1;
    if (idx >= 0 && idx < 6) monthTotals[idx] += h.hours;
  });
  const maxV = Math.max(...monthTotals, 1);
  const pts  = monthTotals.map((v, i) => {
    const x = (i / (monthTotals.length - 1)) * 380;
    const y = 72 - (v / maxV) * 58;
    return `${x},${y}`;
  }).join(' ');
  const areaPath = `M0,72 L${pts.split(' ').join(' L')} L380,72 Z`;

  return React.createElement(Mc, {
    ...(widgetsMotion ? { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 } } : {}),
    style: { background: '#ffffff', borderRadius: 18, padding: '22px 22px 0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(18,20,35,0.04), 0 1px 2px rgba(18,20,35,0.03)', border: '1px solid #eceef4', position: 'relative', cursor: 'pointer' },
    onClick: () => setCurrentView('horas'),
  },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
      React.createElement('div', null,
        React.createElement('div', { style: { fontSize: 11, color: COLORS.textLight, fontFamily: 'Lato', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 } }, 'Horas impartidas · 2026'),
        React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 34, fontWeight: 800, color: COLORS.dark, lineHeight: 1 } },
          total, React.createElement('span', { style: { fontSize: 18, fontWeight: 700, color: COLORS.textLight, marginLeft: 4 } }, 'h'),
        ),
        React.createElement('div', { style: { fontSize: 12, color: '#16a34a', fontFamily: 'Lato', fontWeight: 700, marginTop: 6 } }, validated + 'h validadas · ' + pct + '%'),
      ),
      React.createElement('div', { style: { width: 36, height: 36, borderRadius: 10, background: `${COLORS.orange}0f`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.orange, fontSize: 16 } }, '⏱'),
    ),
    // Progress bar
    React.createElement('div', { style: { height: 4, borderRadius: 4, background: '#f0f1f5', margin: '14px 0 6px', overflow: 'hidden' } },
      React.createElement('div', { style: { width: pct + '%', height: '100%', background: COLORS.gradient, borderRadius: 4, transition: 'width 0.6s ease' } }),
    ),
    // SVG area chart
    React.createElement('svg', { viewBox: '0 0 380 80', style: { width: 'calc(100% + 44px)', marginLeft: -22, height: 64, display: 'block' }, preserveAspectRatio: 'none' },
      React.createElement('defs', null,
        React.createElement('linearGradient', { id: 'hw-line', x1: '0', y1: '0', x2: '1', y2: '0' },
          React.createElement('stop', { offset: '0%',   stopColor: COLORS.orange }),
          React.createElement('stop', { offset: '100%', stopColor: COLORS.cyan   }),
        ),
        React.createElement('linearGradient', { id: 'hw-fill', x1: '0', y1: '0', x2: '0', y2: '1' },
          React.createElement('stop', { offset: '0%',   stopColor: COLORS.orange, stopOpacity: 0.18 }),
          React.createElement('stop', { offset: '100%', stopColor: COLORS.cyan,   stopOpacity: 0.02 }),
        ),
      ),
      React.createElement('path', { d: areaPath, fill: 'url(#hw-fill)' }),
      React.createElement('polyline', { points: pts, fill: 'none', stroke: 'url(#hw-line)', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' }),
    ),
  );
}

// ─── Next Classes Widget ──────────────────────────────────────────────────────
function NextClassesWidget() {
  const { courses, setCurrentView } = React.useContext(AppContext);
  const upcoming = courses.filter(c => ['accepted','review'].includes(c.status)).slice(0, 3);
  const Mc = widgetsMotion ? widgetsMotion.div : 'div';
  const Mi = widgetsMotion ? widgetsMotion.div : 'div';

  return React.createElement(Mc, {
    ...(widgetsMotion ? { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.15 } } : {}),
    style: { background: '#ffffff', borderRadius: 18, padding: '20px 22px', boxShadow: '0 1px 3px rgba(18,20,35,0.04), 0 1px 2px rgba(18,20,35,0.03)', border: '1px solid #eceef4' }
  },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 } },
      React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 700, color: COLORS.dark } }, 'Próximas formaciones'),
      React.createElement('button', { onClick: () => setCurrentView('cursos'), style: { fontSize: 11, color: COLORS.orange, fontFamily: 'Lato', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 } }, 'Ver todas →'),
    ),
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
      ...upcoming.map((c, i) =>
        React.createElement(Mi, {
          key: c.id,
          ...(widgetsMotion ? { initial: { opacity: 0, x: -8 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.18 + i * 0.06 } } : {}),
          onClick: () => setCurrentView('cursos'),
          style: {
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
            borderRadius: 12, background: '#fafbfc', border: '1px solid #f0f1f5',
            cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
          }
        },
          React.createElement('div', {
            style: { width: 34, height: 34, borderRadius: 9, background: `${c.status === 'accepted' ? COLORS.cyan : COLORS.yellow}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: c.status === 'accepted' ? COLORS.cyan : COLORS.yellow, flexShrink: 0, fontFamily: 'Bricolage Grotesque' }
          }, c.modality[0]),
          React.createElement('div', { style: { overflow: 'hidden', flex: 1 } },
            React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 12, fontWeight: 700, color: COLORS.dark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, c.title),
            React.createElement('div', { style: { fontSize: 11, color: COLORS.textLight, fontFamily: 'Lato', marginTop: 2 } }, c.dates + ' · ' + c.modality),
          ),
          React.createElement('div', {
            style: { width: 6, height: 6, borderRadius: '50%', background: c.status === 'accepted' ? '#16a34a' : COLORS.yellow, flexShrink: 0 }
          }),
        )
      ),
      upcoming.length === 0 && React.createElement('p', { style: { fontSize: 13, color: COLORS.textLight, fontFamily: 'Lato', textAlign: 'center', padding: '16px 0' } }, 'Sin formaciones próximas'),
    ),
  );
}

window.MiniCalendarWidget = MiniCalendarWidget;
window.HoursWidget        = HoursWidget;
window.NextClassesWidget  = NextClassesWidget;

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED WIDGETS (usados por todos los roles)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Pill badge ──────────────────────────────────────────────────────────────
function Pill({ text, color, bg, small }) {
  return React.createElement('span', {
    style: {
      display: 'inline-block',
      padding: small ? '2px 8px' : '3px 10px',
      borderRadius: 6, background: bg, color,
      fontSize: small ? 10 : 11, fontWeight: 700, fontFamily: 'Lato',
      textTransform: 'uppercase', letterSpacing: 0.6, whiteSpace: 'nowrap',
    },
  }, text);
}

// ─── Progress bar ────────────────────────────────────────────────────────────
function Progress({ value, color, height = 6 }) {
  const pct = Math.max(0, Math.min(100, value || 0));
  return React.createElement('div', {
    style: { width: '100%', height, background: '#eceef4', borderRadius: 999, overflow: 'hidden' }
  },
    React.createElement('div', {
      style: { width: pct + '%', height: '100%', background: color || COLORS.gradient, borderRadius: 999, transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }
    })
  );
}

// ─── StarRating ──────────────────────────────────────────────────────────────
function StarRating({ value, onChange, size = 16, readOnly }) {
  const stars = [1, 2, 3, 4, 5];
  return React.createElement('div', { style: { display: 'inline-flex', gap: 2 } },
    stars.map(n => React.createElement('button', {
      key: n,
      type: 'button',
      onClick: readOnly ? undefined : () => onChange?.(n),
      disabled: readOnly,
      'aria-label': n + ' estrella' + (n > 1 ? 's' : ''),
      style: { background: 'transparent', border: 'none', padding: 0, cursor: readOnly ? 'default' : 'pointer', color: n <= value ? COLORS.yellow : '#d8dce6', fontSize: size, lineHeight: 1 },
    }, '★'))
  );
}

// ─── Modal genérico ──────────────────────────────────────────────────────────
function Modal({ open, onClose, children, maxWidth = 560, theme }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = e => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);
  if (!open) return null;
  const surface = theme?.surface || '#fff';
  return React.createElement('div', {
    onClick: onClose,
    style: { position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,16,32,0.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  },
    React.createElement('div', {
      onClick: e => e.stopPropagation(),
      role: 'dialog', 'aria-modal': 'true',
      style: { background: surface, borderRadius: 16, width: '100%', maxWidth, maxHeight: '92vh', overflow: 'auto', boxShadow: '0 28px 64px rgba(0,0,0,0.35)', animation: 'fadeInUp 0.32s cubic-bezier(0.22, 1, 0.36, 1) both' },
    }, children),
  );
}

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const palette = {
    success: { bg: '#0f5132', border: '#14a764' },
    info:    { bg: '#1d3557', border: '#35a9cd' },
    error:   { bg: '#711c1f', border: '#e10c11' },
  }[toast.kind] || { bg: '#0f5132', border: '#14a764' };
  return React.createElement('div', {
    key: toast.id,
    style: { position: 'fixed', bottom: 24, right: 24, zIndex: 2000, padding: '12px 18px 12px 14px', background: palette.bg, color: '#fff', borderLeft: `4px solid ${palette.border}`, borderRadius: 10, fontFamily: 'Lato', fontSize: 13, fontWeight: 600, boxShadow: '0 12px 32px rgba(0,0,0,0.28)', maxWidth: 380, animation: 'fadeInUp 0.32s cubic-bezier(0.22, 1, 0.36, 1) both' },
  }, toast.text);
}

// ─── DarkToggle ──────────────────────────────────────────────────────────────
function DarkToggle({ mode, onToggle }) {
  const isDark = mode === 'dark';
  return React.createElement('button', {
    type: 'button', onClick: onToggle,
    title: isDark ? 'Modo claro' : 'Modo oscuro',
    'aria-label': isDark ? 'Activar modo claro' : 'Activar modo oscuro',
    style: { width: 38, height: 38, borderRadius: 10, background: isDark ? '#1d1f38' : '#fff', border: isDark ? '1px solid #2a2d4a' : '1px solid #eceef4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: isDark ? COLORS.yellow : COLORS.dark },
  }, isDark ? '☀' : '☾');
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
function Avatar({ initials, size = 34, gradient }) {
  return React.createElement('div', {
    style: { width: size, height: size, borderRadius: size * 0.28, flexShrink: 0, background: gradient ? COLORS.gradient : `${COLORS.cyan}18`, color: gradient ? '#fff' : COLORS.cyan, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: size * 0.38, letterSpacing: 0.3 },
  }, initials || '—');
}

// ─── Card ────────────────────────────────────────────────────────────────────
function Card({ theme, style, children, padded = true }) {
  return React.createElement('div', {
    style: { background: theme?.surface || '#fff', border: `1px solid ${theme?.border || '#eceef4'}`, borderRadius: 14, boxShadow: theme?.cardShadow || '0 4px 18px rgba(15,16,32,0.06)', padding: padded ? 20 : 0, ...style },
  }, children);
}

// ─── EmptyState ──────────────────────────────────────────────────────────────
function EmptyState({ icon, title, text, action, theme }) {
  return React.createElement('div', {
    style: { padding: '48px 24px', textAlign: 'center', color: theme?.textLight || COLORS.textLight, fontFamily: 'Lato' },
  },
    React.createElement('div', { style: { fontSize: 40, marginBottom: 10, opacity: 0.55 } }, icon || '◌'),
    React.createElement('div', {
      style: { fontFamily: 'Bricolage Grotesque', fontSize: 18, fontWeight: 700, color: theme?.text || COLORS.dark, marginBottom: 6 },
    }, title),
    text && React.createElement('div', { style: { fontSize: 13, maxWidth: 440, margin: '0 auto 14px' } }, text),
    action,
  );
}

// ─── LegalModal ──────────────────────────────────────────────────────────────
// Muestra los textos legales íntegros (Aviso legal, Privacidad, Cookies).
const LEGAL_TITLES = {
  avisoLegal: 'Aviso legal',
  privacidad: 'Política de privacidad y protección de datos',
  cookies:    'Política de cookies',
};
function LegalModal({ doc, onClose, theme }) {
  if (!doc) return null;
  const text = (window.LEGAL_TEXTS || {})[doc] || '';
  const title = LEGAL_TITLES[doc] || 'Documento legal';
  const surface = theme?.surface || '#fff';
  return React.createElement(Modal, { open: true, onClose, theme, maxWidth: 780 },
    React.createElement('div', { style: { background: surface, display: 'flex', flexDirection: 'column', maxHeight: '88vh' } },
      React.createElement('div', {
        style: { padding: '22px 28px', borderBottom: `1px solid ${theme?.border || '#eceef4'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: surface, zIndex: 1 },
      },
        React.createElement('div', null,
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 10, color: COLORS.orange, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 4 } }, 'Información legal'),
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 18, fontWeight: 800, color: theme?.text || COLORS.dark } }, title),
        ),
        React.createElement('button', {
          onClick: onClose, 'aria-label': 'Cerrar',
          style: { background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: theme?.textLight || COLORS.textLight, padding: 0, lineHeight: 1 },
        }, '×'),
      ),
      React.createElement('div', {
        style: { padding: '22px 28px 28px', overflowY: 'auto', flex: 1, fontFamily: 'Lato', fontSize: 13.5, lineHeight: 1.7, color: theme?.text || COLORS.text, whiteSpace: 'pre-wrap' },
      }, text),
    ),
  );
}

// ─── useViewport hook (responsive foundation) ────────────────────────────────
// Breakpoints: mobile <640 · tablet 640-1023 · desktop ≥1024
// Todos los componentes deben usar este hook para decidir layouts en lugar de
// media queries (que no pueden sobrescribir estilos inline).
function useViewport() {
  const getW = () => typeof window !== 'undefined' ? window.innerWidth  : 1200;
  const getH = () => typeof window !== 'undefined' ? window.innerHeight : 800;
  const [dim, setDim] = React.useState({ w: getW(), h: getH() });
  React.useEffect(() => {
    const onResize = () => setDim({ w: getW(), h: getH() });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);
  return {
    width:      dim.w,
    height:     dim.h,
    isMobile:   dim.w < 640,
    isTablet:   dim.w >= 640 && dim.w < 1024,
    isDesktop:  dim.w >= 1024,
    // Helpers frecuentes
    isSmall:    dim.w < 1024,    // móvil + tablet
    isPortrait: dim.h > dim.w,
  };
}

window.Pill        = Pill;
window.Progress    = Progress;
window.StarRating  = StarRating;
window.Modal       = Modal;
window.Toast       = Toast;
window.DarkToggle  = DarkToggle;
window.Avatar      = Avatar;
window.Card        = Card;
window.EmptyState  = EmptyState;
window.LegalModal  = LegalModal;
window.useViewport = useViewport;
