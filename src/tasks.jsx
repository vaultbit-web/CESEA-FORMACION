// ─── CESEA Formación · Formador — Módulo Tareas (consultorías + sesiones) ────
//
// Agrupa cualquier encargo no-curso que el superadmin asigna al formador:
// consultorías, sesiones individuales de mentoring, supervisión, etc.
// Funcionalidades:
//   • Listado con filtros por tipo y estado.
//   • Detalle con 4 tabs: resumen, contrato, documentación, entregables.
//   • Firma del contrato con canvas (mock) o subida de PDF firmado.
//   • Subida de entregables cuando la tarea está en progreso o firmada.
//
// FILEMAKER: Layout "Formador_Tareas" con portal a Tareas y sub-portales a
//   Tareas_Documentos y Tareas_Entregables. Scripts:
//   - "Firmar_Contrato_Tarea" (canvas → contenedor)
//   - "Subir_PDF_Firmado"     (Insert from URL → contenedor)
//   - "Subir_Entregable"      (Insert from URL → contenedor)
//   - "Cambiar_Estado_Tarea"  (Set Field → vl_EstadoTarea)
//
// ⚠ FIRMA DIGITAL — ATENCIÓN AL EQUIPO FM:
//   La firma canvas del prototipo NO tiene valor legal. En producción debe
//   sustituirse por una de estas soluciones:
//     1. AutoFirma (FNMT / DNIe) — integración vía protocolo URL afirma://
//     2. Firma cualificada cloud (DocuSign, Adobe Sign, Viafirma)
//     3. Certificado digital embebido en PDF mediante backend de FM Server
//   El canvas se mantiene como UX placeholder para validar el flujo visual.
// ─────────────────────────────────────────────────────────────────────────────

const TASK_STATUS = {
  asignada:            { label: 'Asignada',            color: COLORS.textLight, bg: '#eceef4' },
  contrato_pendiente:  { label: 'Contrato pendiente',  color: COLORS.red,       bg: `${COLORS.red}15` },
  en_progreso:         { label: 'En progreso',         color: COLORS.orange,    bg: `${COLORS.orange}15` },
  firmada:             { label: 'Firmada',             color: COLORS.cyan,      bg: `${COLORS.cyan}15` },
  completada:          { label: 'Completada',          color: '#16a34a',        bg: '#16a34a15' },
  cancelada:           { label: 'Cancelada',           color: COLORS.textLight, bg: '#e4e7ef' },
};

const TASK_TYPES = [
  { id: 'all',         label: 'Todas' },
  { id: 'consultoria', label: 'Consultoría' },
  { id: 'sesion',      label: 'Sesión' },
  { id: 'otro',        label: 'Otro' },
];

function TasksView() {
  const { tasks } = React.useContext(AppContext);
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [detailTaskId, setDetailTaskId] = React.useState(null);

  const filtered = tasks.filter(t => {
    if (typeFilter   !== 'all' && t.type   !== typeFilter)   return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  });

  return React.createElement('div', null,
    // Header
    React.createElement('div', { style: { marginBottom: 22 } },
      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, fontWeight: 700, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 4 } }, 'Encargos del superadmin'),
      React.createElement('h1', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 28, fontWeight: 800, color: COLORS.dark, letterSpacing: -0.5 } },
        'Tareas y ',
        React.createElement('span', { style: { background: COLORS.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } }, 'consultorías'),
        '.',
      ),
      React.createElement('p', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight, marginTop: 4 } }, 'Todos los encargos profesionales fuera del catálogo de cursos: consultorías, sesiones individuales, supervisiones.'),
    ),

    // Filtros
    React.createElement('div', { style: { display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 18, alignItems: 'center' } },
      React.createElement('div', { style: { display: 'flex', gap: 6, alignItems: 'center' } },
        React.createElement('span', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' } }, 'Tipo:'),
        ...TASK_TYPES.map(t => React.createElement('button', {
          key: t.id,
          onClick: () => setTypeFilter(t.id),
          style: {
            padding: '7px 14px', borderRadius: 9,
            border: typeFilter === t.id ? `1px solid ${COLORS.orange}` : '1px solid #e4e7ef',
            background: typeFilter === t.id ? `${COLORS.orange}0c` : '#fff',
            color: typeFilter === t.id ? COLORS.orange : COLORS.text,
            fontFamily: 'Lato', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          },
        }, t.label)),
      ),
      React.createElement('div', { style: { width: 1, height: 22, background: '#eceef4' } }),
      React.createElement('div', { style: { display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' } },
        React.createElement('span', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' } }, 'Estado:'),
        ...['all', 'asignada', 'contrato_pendiente', 'en_progreso', 'firmada', 'completada'].map(s => {
          const lbl = s === 'all' ? 'Todos' : (TASK_STATUS[s]?.label || s);
          return React.createElement('button', {
            key: s,
            onClick: () => setStatusFilter(s),
            style: {
              padding: '7px 12px', borderRadius: 9,
              border: statusFilter === s ? `1px solid ${COLORS.cyan}` : '1px solid #e4e7ef',
              background: statusFilter === s ? `${COLORS.cyan}0c` : '#fff',
              color: statusFilter === s ? COLORS.cyan : COLORS.text,
              fontFamily: 'Lato', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            },
          }, lbl);
        }),
      ),
    ),

    // Grid de tareas
    filtered.length === 0
      ? React.createElement('div', {
          style: { padding: '48px 24px', textAlign: 'center', color: COLORS.textLight, fontFamily: 'Lato', background: '#fff', borderRadius: 14, border: '1px solid #eceef4' },
        },
          React.createElement('div', { style: { fontSize: 36, marginBottom: 8, opacity: 0.5 } }, '◆'),
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 16, color: COLORS.dark, marginBottom: 4 } }, 'Sin tareas con esos filtros'),
          React.createElement('div', { style: { fontSize: 13 } }, 'Ajusta los filtros o espera a que el superadmin te asigne nuevos encargos.'),
        )
      : React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 } },
          filtered.map(t => {
            const st = TASK_STATUS[t.status] || TASK_STATUS.asignada;
            return React.createElement('div', {
              key: t.id,
              onClick: () => setDetailTaskId(t.id),
              style: {
                background: '#fff', border: '1px solid #eceef4', borderRadius: 14, padding: 22,
                cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10,
                transition: 'transform 0.18s, box-shadow 0.18s', boxShadow: '0 4px 18px rgba(15,16,32,0.04)',
                minHeight: 180,
              },
              onMouseEnter: e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 20px 44px rgba(15,16,32,0.1)'; },
              onMouseLeave: e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = '0 4px 18px rgba(15,16,32,0.04)'; },
            },
              React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 } },
                React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                  React.createElement('span', {
                    style: { display: 'inline-block', padding: '3px 10px', borderRadius: 6, background: t.type === 'consultoria' ? `${COLORS.orange}15` : `${COLORS.cyan}15`, color: t.type === 'consultoria' ? COLORS.orange : COLORS.cyan, fontSize: 10, fontWeight: 700, fontFamily: 'Lato', textTransform: 'uppercase', letterSpacing: 0.6 },
                  }, t.type),
                  React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 16, fontWeight: 800, color: COLORS.dark, marginTop: 8, lineHeight: 1.3 } }, t.title),
                  React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: COLORS.textLight, marginTop: 2 } }, t.client, ' · ', t.location),
                ),
                React.createElement('span', {
                  style: { padding: '3px 10px', borderRadius: 6, background: st.bg, color: st.color, fontSize: 10, fontWeight: 700, fontFamily: 'Lato', textTransform: 'uppercase', letterSpacing: 0.6, whiteSpace: 'nowrap' },
                }, st.label),
              ),
              React.createElement('p', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.text, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 } }, t.description),
              React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, paddingTop: 10, borderTop: '1px solid #f4f5f9' } },
                React.createElement('span', null, '◷ ', t.startDate, t.endDate !== t.startDate ? ' → ' + t.endDate : ''),
                React.createElement('span', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 16, fontWeight: 800, color: COLORS.orange } }, t.amount, ' €'),
              ),
            );
          }),
        ),

    // Detalle de tarea
    detailTaskId && React.createElement(TaskDetail, {
      taskId: detailTaskId,
      onClose: () => setDetailTaskId(null),
    }),
  );
}

// ─── Detalle con tabs + firma canvas ─────────────────────────────────────────
function TaskDetail({ taskId, onClose }) {
  const { tasks, signTask, uploadSignedPdf, addTaskDeliverable, setTaskStatus } = React.useContext(AppContext);
  const task = tasks.find(t => t.id === taskId);
  const [tab, setTab] = React.useState('overview');

  if (!task) return null;

  const st = TASK_STATUS[task.status] || TASK_STATUS.asignada;

  return React.createElement('div', {
    onClick: onClose,
    style: { position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,16,32,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  },
    React.createElement('div', {
      onClick: e => e.stopPropagation(),
      style: { background: '#fff', borderRadius: 16, width: '100%', maxWidth: 780, maxHeight: '92vh', overflow: 'auto', animation: 'fadeInUp 0.32s cubic-bezier(0.22,1,0.36,1) both' },
    },
      // Header
      React.createElement('div', {
        style: { padding: '24px 28px', borderBottom: '1px solid #eceef4', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
      },
        React.createElement('div', { style: { flex: 1, minWidth: 0 } },
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 10, color: COLORS.textLight, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 } },
            task.type, ' · ', task.id,
          ),
          React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 20, fontWeight: 800, color: COLORS.dark, lineHeight: 1.3 } }, task.title),
          React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 13, color: COLORS.textLight, marginTop: 4 } }, task.client, ' · ', task.location),
        ),
        React.createElement('span', {
          style: { padding: '5px 12px', borderRadius: 6, background: st.bg, color: st.color, fontSize: 11, fontWeight: 700, fontFamily: 'Lato', textTransform: 'uppercase', letterSpacing: 0.6, whiteSpace: 'nowrap' },
        }, st.label),
        React.createElement('button', {
          onClick: onClose,
          style: { background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: COLORS.textLight, padding: 0, lineHeight: 1 },
        }, '×'),
      ),
      // Tabs
      React.createElement('div', { style: { display: 'flex', borderBottom: '1px solid #eceef4', background: '#fafbfc' } },
        [
          { id: 'overview',      label: 'Resumen' },
          { id: 'contract',      label: 'Contrato y firma' },
          { id: 'docs',          label: 'Documentación (' + (task.attachments?.length || 0) + ')' },
          { id: 'deliverables',  label: 'Entregables (' + (task.deliverables?.length || 0) + ')' },
        ].map(t => React.createElement('button', {
          key: t.id,
          onClick: () => setTab(t.id),
          style: {
            padding: '12px 18px', background: tab === t.id ? '#fff' : 'transparent', border: 'none',
            borderBottom: tab === t.id ? `2px solid ${COLORS.orange}` : '2px solid transparent',
            color: tab === t.id ? COLORS.orange : COLORS.textLight,
            fontFamily: 'Bricolage Grotesque', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          },
        }, t.label)),
      ),
      // Content
      React.createElement('div', { style: { padding: '24px 28px' } },
        tab === 'overview'     && React.createElement(TaskOverview,    { task }),
        tab === 'contract'     && React.createElement(TaskContract,    { task, signTask, uploadSignedPdf, setTaskStatus }),
        tab === 'docs'         && React.createElement(TaskDocs,        { task }),
        tab === 'deliverables' && React.createElement(TaskDeliverables,{ task, addTaskDeliverable, setTaskStatus }),
      ),
    ),
  );
}

// Sub-componentes del detalle
function TaskOverview({ task }) {
  const rows = [
    ['Cliente',          task.client],
    ['Contacto cliente', task.clientContact],
    ['Ubicación',        task.location],
    ['Fechas',           task.startDate + (task.endDate !== task.startDate ? ' → ' + task.endDate : '')],
    ['Importe bruto',    task.amount + ' €'],
  ];
  return React.createElement('div', null,
    React.createElement('p', { style: { fontFamily: 'Lato', fontSize: 14, color: COLORS.text, lineHeight: 1.6, marginBottom: 20 } }, task.description),
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '140px 1fr', gap: '10px 16px', fontFamily: 'Lato', fontSize: 13 } },
      ...rows.flatMap(([k, v]) => [
        React.createElement('div', { key: k + '-k', style: { color: COLORS.textLight, fontWeight: 700 } }, k),
        React.createElement('div', { key: k + '-v', style: { color: COLORS.dark } }, v || '—'),
      ]),
    ),
  );
}

function TaskContract({ task, signTask, uploadSignedPdf, setTaskStatus }) {
  const [signing, setSigning] = React.useState(false);
  const canvasRef = React.useRef(null);
  const [drawing, setDrawing] = React.useState(false);
  const [hasSignature, setHasSignature] = React.useState(false);
  const fileInputRef = React.useRef(null);

  // Canvas simple para dibujar la firma
  React.useEffect(() => {
    if (!signing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    setHasSignature(false);
  }, [signing]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    return { x: x * (canvas.width / rect.width), y: y * (canvas.height / rect.height) };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getPos(e);
    ctx.beginPath(); ctx.moveTo(x, y);
    setDrawing(true); setHasSignature(true);
  };
  const draw = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getPos(e);
    ctx.lineTo(x, y); ctx.stroke();
  };
  const endDraw = () => setDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const confirmSignature = () => {
    const dataUrl = canvasRef.current.toDataURL('image/png');
    signTask(task.id, dataUrl);
    setSigning(false);
  };

  const downloadContract = () => {
    // Prototipo: genera un PDF mock con el contenido básico del contrato.
    const content = [
      '%PDF-1.4',
      '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
      '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
      '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj',
      '4 0 obj << /Length 260 >> stream',
      'BT /F1 14 Tf 60 780 Td (CONTRATO DE PRESTACION DE SERVICIOS) Tj ET',
      'BT /F1 11 Tf 60 740 Td (Tarea: ' + (task.title || '').slice(0,70) + ') Tj ET',
      'BT /F1 11 Tf 60 720 Td (Cliente: ' + (task.client || '') + ') Tj ET',
      'BT /F1 11 Tf 60 700 Td (Fechas: ' + task.startDate + ' - ' + task.endDate + ') Tj ET',
      'BT /F1 11 Tf 60 680 Td (Importe: ' + task.amount + ' EUR) Tj ET',
      'endstream endobj',
      '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
      'xref 0 6', '0000000000 65535 f ',
      'trailer << /Size 6 /Root 1 0 R >>', 'startxref', '0', '%%EOF',
    ].join('\n');
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'contrato-' + task.id + '.pdf';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const onUploadSigned = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { alert('Solo se aceptan PDFs.'); return; }
    uploadSignedPdf(task.id, file.name);
  };

  return React.createElement('div', null,
    React.createElement('div', {
      style: { padding: 18, borderRadius: 10, background: '#fafbfc', border: '1px solid #eceef4', marginBottom: 18 },
    },
      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 } }, 'Contrato'),
      React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 14, fontWeight: 700, color: COLORS.dark, marginBottom: 4 } }, task.contractPdf || 'Aún no disponible'),
      task.signedPdf && React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 12, color: '#16a34a', fontWeight: 700 } }, '✓ Firmado: ', task.signedPdf),
      task.signatureImg && React.createElement('div', { style: { marginTop: 10 } },
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, marginBottom: 4 } }, 'Firma registrada:'),
        React.createElement('img', { src: task.signatureImg, alt: 'Firma', style: { maxWidth: 200, maxHeight: 80, background: '#fff', borderRadius: 6, border: '1px solid #e4e7ef' } }),
      ),
    ),

    // ⚠ Aviso FILEMAKER
    React.createElement('div', {
      style: { padding: 12, borderRadius: 8, background: '#fef3c7', border: '1px solid #fde68a', fontFamily: 'Lato', fontSize: 11, color: '#92400e', marginBottom: 16, lineHeight: 1.5 },
    },
      React.createElement('b', null, '⚠ Prototipo: '),
      'la firma canvas del prototipo no tiene valor legal. En producción se integrará con AutoFirma (FNMT / DNIe) o con firma cualificada en la nube (DocuSign, Adobe Sign). Ver anotación ',
      React.createElement('code', { style: { background: '#fde68a', padding: '1px 4px', borderRadius: 3 } }, 'FILEMAKER:'),
      ' en el código.',
    ),

    // Acciones de contrato
    !signing && React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 } },
      React.createElement('button', {
        onClick: downloadContract,
        style: { padding: '12px 14px', borderRadius: 9, background: '#fff', color: COLORS.text, border: '1px solid #e4e7ef', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 12, cursor: 'pointer' },
      }, '↓ Descargar contrato'),
      React.createElement('button', {
        onClick: () => setSigning(true),
        style: { padding: '12px 14px', borderRadius: 9, background: COLORS.gradient, color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 12, cursor: 'pointer' },
      }, '✍ Firmar en plataforma'),
      React.createElement('button', {
        onClick: () => fileInputRef.current?.click(),
        style: { padding: '12px 14px', borderRadius: 9, background: '#fff', color: COLORS.text, border: '1px solid #e4e7ef', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 12, cursor: 'pointer' },
      }, '↑ Subir PDF firmado'),
      React.createElement('input', { ref: fileInputRef, type: 'file', accept: 'application/pdf', style: { display: 'none' }, onChange: onUploadSigned }),
    ),

    // Canvas de firma
    signing && React.createElement('div', null,
      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6 } }, 'Dibuja tu firma'),
      React.createElement('canvas', {
        ref: canvasRef,
        width: 700, height: 220,
        onMouseDown:  startDraw, onMouseMove:  draw, onMouseUp:  endDraw, onMouseLeave: endDraw,
        onTouchStart: startDraw, onTouchMove:  draw, onTouchEnd: endDraw,
        style: { width: '100%', height: 200, background: '#fff', border: '2px dashed #d8dce6', borderRadius: 10, cursor: 'crosshair', touchAction: 'none' },
      }),
      React.createElement('div', { style: { display: 'flex', gap: 10, marginTop: 12, justifyContent: 'flex-end' } },
        React.createElement('button', {
          onClick: clearSignature,
          style: { padding: '10px 14px', borderRadius: 9, background: '#fff', color: COLORS.text, border: '1px solid #e4e7ef', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 12, cursor: 'pointer' },
        }, 'Borrar'),
        React.createElement('button', {
          onClick: () => setSigning(false),
          style: { padding: '10px 14px', borderRadius: 9, background: '#fff', color: COLORS.text, border: '1px solid #e4e7ef', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 12, cursor: 'pointer' },
        }, 'Cancelar'),
        React.createElement('button', {
          onClick: confirmSignature,
          disabled: !hasSignature,
          style: { padding: '10px 18px', borderRadius: 9, background: hasSignature ? COLORS.gradient : '#e4e7ef', color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 12, cursor: hasSignature ? 'pointer' : 'not-allowed' },
        }, 'Confirmar firma'),
      ),
    ),

    // Cambiar estado
    !signing && React.createElement('div', { style: { marginTop: 22, paddingTop: 18, borderTop: '1px solid #f0f1f5' } },
      React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 } }, 'Cambiar estado de la tarea'),
      React.createElement('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
        ['asignada', 'contrato_pendiente', 'en_progreso', 'firmada', 'completada'].map(s => React.createElement('button', {
          key: s,
          onClick: () => setTaskStatus(task.id, s),
          style: {
            padding: '6px 12px', borderRadius: 7,
            border: task.status === s ? `1.5px solid ${TASK_STATUS[s].color}` : '1px solid #e4e7ef',
            background: task.status === s ? TASK_STATUS[s].bg : '#fff',
            color: task.status === s ? TASK_STATUS[s].color : COLORS.text,
            fontFamily: 'Lato', fontSize: 11, fontWeight: 700, cursor: 'pointer',
          },
        }, TASK_STATUS[s].label)),
      ),
    ),
  );
}

function TaskDocs({ task }) {
  if (!task.attachments?.length) return React.createElement('div', {
    style: { padding: '20px 0', textAlign: 'center', color: COLORS.textLight, fontFamily: 'Lato', fontSize: 13 },
  }, 'El superadmin aún no ha adjuntado documentación para esta tarea.');
  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
    task.attachments.map((a, i) => React.createElement('div', {
      key: i,
      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fafbfc', border: '1px solid #eceef4', borderRadius: 10 },
    },
      React.createElement('div', null,
        React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 700, color: COLORS.dark } }, '📄 ', a.name),
        React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, marginTop: 2 } }, 'Subido por ', a.uploadedBy, ' · ', a.date, ' · ', a.size),
      ),
      React.createElement('button', {
        style: { padding: '8px 14px', borderRadius: 8, background: '#fff', color: COLORS.text, border: '1px solid #e4e7ef', fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 11, cursor: 'pointer' },
      }, '↓ Descargar'),
    )),
  );
}

function TaskDeliverables({ task, addTaskDeliverable, setTaskStatus }) {
  const ref = React.useRef(null);
  const onFile = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    addTaskDeliverable(task.id, f.name);
  };
  return React.createElement('div', null,
    React.createElement('div', {
      style: { padding: 14, background: '#fafbfc', border: '1px dashed #d8dce6', borderRadius: 10, textAlign: 'center', cursor: 'pointer', marginBottom: 14 },
      onClick: () => ref.current?.click(),
    },
      React.createElement('div', { style: { fontSize: 22, color: COLORS.orange, marginBottom: 4 } }, '↥'),
      React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 700, color: COLORS.dark } }, 'Subir entregable'),
      React.createElement('div', { style: { fontSize: 11, color: COLORS.textLight } }, 'Informes, materiales, evaluaciones… (PDF, DOCX, XLSX)'),
      React.createElement('input', { ref, type: 'file', style: { display: 'none' }, onChange: onFile }),
    ),
    (task.deliverables || []).length === 0
      ? React.createElement('div', { style: { padding: '20px 0', textAlign: 'center', color: COLORS.textLight, fontFamily: 'Lato', fontSize: 13 } }, 'Aún no has subido entregables.')
      : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          task.deliverables.map((d, i) => React.createElement('div', {
            key: i,
            style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fff', border: '1px solid #eceef4', borderRadius: 10 },
          },
            React.createElement('div', null,
              React.createElement('div', { style: { fontFamily: 'Bricolage Grotesque', fontSize: 13, fontWeight: 700, color: COLORS.dark } }, '✓ ', d.name),
              React.createElement('div', { style: { fontFamily: 'Lato', fontSize: 11, color: COLORS.textLight, marginTop: 2 } }, 'Subido ', d.uploadedAt),
            ),
          )),
        ),
    task.status !== 'completada' && (task.deliverables || []).length > 0 && React.createElement('button', {
      onClick: () => setTaskStatus(task.id, 'completada'),
      style: { marginTop: 16, width: '100%', padding: 12, borderRadius: 10, background: '#16a34a', color: '#fff', border: 'none', fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: 13, cursor: 'pointer' },
    }, 'Marcar tarea como completada ✓'),
  );
}

window.TasksView = TasksView;
