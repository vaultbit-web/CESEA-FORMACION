// ─── CESEA Formación · Plataforma unificada — Data Layer ─────────────────────
//
// Una sola aplicación, tres roles con contexto compartido:
//   • alumno      → panel del alumnado (cursos, diplomas, empleo…)
//   • formador    → panel del docente (ofertas, bitácora, tareas, asistencia…)
//   • superadmin  → panel de administración (catálogo, solicitudes, formadores…)
//
// El login identifica el rol por credenciales y routea al layout correcto.
//
// FILEMAKER: Una sola solución FM con tres Privilege Sets:
//   [priv_Alumno]     → Alumno_Dashboard
//   [priv_Formador]   → Formador_Dashboard
//   [priv_Superadmin] → Admin_Dashboard
// El script "Router_Por_Rol" hace Get(PrivilegeSetName) y Go to Layout.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Datos corporativos reales (verificados en csaformacion.com) ─────────────
// FILEMAKER: Tabla Organizacion con un único registro (titular del dominio).
const COMPANY = {
  legalName:   'WISHIT CSA SUPPLY SL',
  brandName:   'CESEA Formación',
  cif:         'B06842256',
  address:     'C/ Gomis, 86 local 8, Barcelona',
  addressRGPD: 'C/ Camí Ral, 552-554 – Mataró',
  phone:       '661.202.608',
  emailOps:    'contacto@wishit.es',
  emailBiz:    'consultoria@csaformacion.com',
  jurisdiction:'juzgados y tribunales de Mataró',
  copyright:   '© 2026 CSA Formación',
  website:     'https://csaformacion.com/',
};

// ─── Textos legales (íntegros de csaformacion.com) ───────────────────────────
const LEGAL_TEXTS = {
  avisoLegal: `En el presente Aviso Legal, el Usuario, podrá encontrar toda la información relativa a las condiciones legales que definen las relaciones entre los usuarios y el responsable de la página web accesible en la dirección URL https://csaformacion.com/ (en adelante, el sitio web), que WISHIT CSA SUPPLY SL (en adelante, el titular) pone a disposición de los usuarios de Internet.

1.- DATOS DEL RESPONSABLE TITULAR DEL SITIO WEB.

Nombre del titular: WISHIT CSA SUPPLY SL
Domicilio social: C/Gomis, 86 local 8, Barcelona
C.I.F.: B06842256
Teléfono de contacto: 661.202.608
Correo electrónico: contacto@wishit.es

Este Sitio Web garantiza la protección y confidencialidad de los datos personales que nos proporcionen de acuerdo con lo dispuesto en el Reglamento General de Protección de Datos de Carácter Personal (UE) 2016/679, en la Ley Orgánica 3/2018, y en la Ley de Servicios de la Sociedad de la Información y Comercio Electrónico 34/2002 (LSSI-CE).

2.- OBJETO. El sitio web facilita a los usuarios el acceso a información y servicios prestados. El acceso y la utilización del Sitio Web atribuye la condición de usuario e implica la aceptación de todas las condiciones incluidas en este Aviso Legal.

3.- ACCESO Y UTILIZACIÓN. El acceso tiene carácter gratuito para los usuarios. Con carácter general el acceso no exige la previa suscripción o registro. Los usuarios garantizan y responden de la exactitud, vigencia y autenticidad de los datos personales facilitados.

4.- CONTENIDOS. El idioma utilizado es el castellano. El sitio web podrá modificar los contenidos sin previo aviso. Se prohíbe el uso de los contenidos para promocionar, contratar o divulgar publicidad sin autorización.

5.- MEDIDAS DE SEGURIDAD. Los datos personales podrán ser almacenados en bases de datos automatizadas o no, cuya titularidad corresponde en exclusiva al sitio web.

6.- LIMITACIÓN DE RESPONSABILIDAD. Tanto el acceso a la web como el uso no consentido es de la exclusiva responsabilidad de quien lo realiza.

7.- EMPLEO DE COOKIES. El Sitio Web puede emplear cookies regidas por la Política de Cookies.

8.- NAVEGACIÓN. Los servidores pueden recoger datos no identificables como direcciones IP, utilizadas de manera anonimizada.

9.- PROPIEDAD INTELECTUAL E INDUSTRIAL. Todos los contenidos son propiedad del sitio web. Queda reservado cualquier uso que suponga copia, reproducción, distribución, transformación o comunicación pública.

10.- LEGISLACIÓN APLICABLE Y JURISDICCIÓN. El presente Aviso Legal se interpretará y regirá de conformidad con la legislación española. Las partes se someten a los juzgados y tribunales del domicilio del usuario, o en su defecto, los de Mataró.

Todos los derechos © 2026 CSA Formación.`,

  privacidad: `POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS

En cumplimiento del Reglamento (UE) 2016/679 (RGPD), de la Ley 34/2002 (LSSI-CE) y de la Ley Orgánica 3/2018 (LOPDGDD), el sitio web garantiza la protección y confidencialidad de los datos personales que nos proporcionen nuestros clientes.

Responsable del tratamiento
WISHIT CSA SUPPLY SL · C/Gomis, 86 local 8, Barcelona · C.I.F. B06842256 · Tel. 661.202.608 · contacto@wishit.es

Finalidad del tratamiento
Los datos facilitados se incluirán en registros de actividades de tratamiento de datos personales, imprescindibles para prestar los servicios solicitados o resolver las dudas de los visitantes. No elaboramos perfiles sobre los usuarios.

Legitimidad
1. Relación contractual (al contratar productos o servicios).
2. Interés legítimo (consultas, reclamaciones, cobros).
3. Consentimiento (al marcar la casilla del formulario).

Destinatarios
No cedemos datos a nadie, salvo obligación legal (p.ej. Agencia Tributaria).

Conservación
Conservamos los datos durante el tiempo necesario para los fines recabados. Tras la relación, los datos quedan bloqueados durante el plazo de prescripción de las acciones.

Seguridad
Mantenemos estrictos niveles de seguridad para proteger los datos frente a pérdidas fortuitas y accesos no autorizados.

Sus derechos
Acceso, rectificación, supresión, limitación, oposición, portabilidad y revocación del consentimiento. Para ejercerlos: C/ Camí Ral, 552-554 – Mataró, adjuntando copia del DNI.

Tutela de derechos
Puede formular una reclamación en la Agencia Española de Protección de Datos (aepd.es, Jorge Juan 6 – 28001 Madrid, Tel. 901.100.099).`,

  cookies: `POLÍTICA DE COOKIES

Fecha de actualización: 27 de enero de 2026. Aplicable a residentes del EEE y de Suiza.

Qué son las cookies
Archivos que se almacenan en el disco duro del navegador para devolver información durante una visita posterior.

Tipos utilizados
• Técnicas o funcionales: necesarias para el correcto funcionamiento. No requieren consentimiento.
• Estadísticas: miden el uso del sitio. Requieren permiso.
• Marketing/seguimiento: construyen perfiles para publicidad personalizada. Requieren permiso explícito.

Servicios de terceros
Google Analytics, PayPal, Facebook, Twitter, LinkedIn, Wistia, Google Maps, reCAPTCHA y otros. Cada uno con su propia política.

Responsable del tratamiento
WISHIT CSA SUPPLY SL · C/Gomis 86, Barcelona · Tel. 661.202.608 · contacto@wishit.es

Gestión del consentimiento
Puedes modificar o revocar en cualquier momento desde los ajustes del navegador o el banner de cookies de la web.`,
};

// ─── Helpers de seguridad ────────────────────────────────────────────────────
const sanitize = (s) =>
  String(s).replace(/[<>"'`&]/g, c =>
    ({ '<':'&lt;', '>':'&gt;', '"':'&quot;', "'": '&#39;', '`': '&#96;', '&':'&amp;' }[c])
  );

// ─── Paleta ─────────────────────────────────────────────────────────────────
const COLORS = {
  yellow:   '#fcad00',
  orange:   '#f47809',
  red:      '#e10c11',
  pink:     '#e73d64',
  fuchsia:  '#c675ae',
  lavender: '#838ebd',
  cyan:     '#35a9cd',
  bg:       '#f4f5f9',
  white:    '#ffffff',
  dark:     '#1a1a2e',
  text:     '#2d2d3a',
  textLight:'#8b8fa3',
  gradient: 'linear-gradient(135deg, #fcad00, #f47809, #e10c11, #e73d64, #c675ae, #838ebd, #35a9cd)',
  gradientSoft: 'linear-gradient(135deg, #fcad0030, #f4780930, #e73d6430, #c675ae30, #35a9cd30)',
};
const DARK = {
  bg: '#0b0c1a', surface: '#15172d', surface2: '#1d1f38',
  border: '#2a2d4a', text: '#e8eaf5', textLight: '#9ea3bd',
};
const getTheme = (mode) => mode === 'dark' ? {
  bg: DARK.bg, surface: DARK.surface, surface2: DARK.surface2,
  border: DARK.border, text: DARK.text, textLight: DARK.textLight, cardShadow: 'none',
} : {
  bg: COLORS.bg, surface: '#ffffff', surface2: '#fafbfc',
  border: '#eceef4', text: COLORS.text, textLight: COLORS.textLight,
  cardShadow: '0 4px 18px rgba(15,16,32,0.06)',
};

// ─── Catálogo (importado de assets/Formadores_Curso.xlsx vía src/dataReal.jsx) ──
// FILEMAKER: Tabla Cursos. codigoInterno (Excel: codigo) es la key que aparece
//   en la OT y en el presupuesto. num_imparticiones (default 1) lo fija el
//   superadmin desde Admin_Curso_Edit; el formador NO puede modificarlo.
const COURSES_FROM_EXCEL = (typeof window !== 'undefined' && window.MOCK_COURSES_REAL) || [];

// Los cursos del Excel arrancan SIN fechas/horarios planificados — el superadmin
// los planifica al asignar formador y crear una impartición concreta.
// FILEMAKER: en producción Cursos::estado='available' hasta que se cree una
//   Impartición vinculada con fechas reales.
const MOCK_COURSES = COURSES_FROM_EXCEL.map((c, i) => {
  const createdAt = new Date(Date.now() - (3 + (i * 7) % 90) * 86400000).toISOString().slice(0, 10);
  return { ...c, createdAt, price: 0 };
});


// ─── Horas impartidas (formador) ─────────────────────────────────────────────
// Horas impartidas — vacío hasta que un formador real reporte horas.
const MOCK_HOURS_LOG = [];

// ─── Usuarios ────────────────────────────────────────────────────────────────
// FILEMAKER: Tabla Usuarios con campos privilege_set ∈ {priv_Formador, priv_Alumno, priv_Superadmin}.
const MOCK_FORMADOR = {
  id: 'F-001', roleType: 'formador',
  name: 'Ana García López', email: 'ana.garcia@formador.com',
  role: 'Formador/a Senior', initials: 'AG',
  phone: '+34 612 345 678', specialty: 'Acompañamiento, Competencias, ACP',
  location: 'Madrid, España', joinDate: 'Enero 2025',
  photo: null,
  dni: '***945B',           dniFull: '12345945B',
  iban: 'ES51 **** **** **** ****4321', ibanFull: 'ES5112345678901234564321',
  cvFileName: 'CV-Ana-Garcia-2025.pdf', cvUploadYear: 2025,
  documents: [
    { id: 'DOC-001', name: 'CV-Ana-Garcia-2025.pdf',    type: 'cv',         uploadedAt: '2025-11-14', year: 2025, size: '312 KB' },
    { id: 'DOC-002', name: 'Titulacion-Enfermeria.pdf', type: 'titulacion', uploadedAt: '2024-03-08', year: 2024, size: '847 KB' },
    { id: 'DOC-003', name: 'DNI-frontal.pdf',           type: 'id',         uploadedAt: '2024-01-22', year: 2024, size: '220 KB' },
  ],
};

const MOCK_SUPERADMIN = {
  id: 'A-001', roleType: 'superadmin',
  name: 'Carlos Ruiz Ferrer', email: 'admin@cesea.com',
  role: 'Superadministrador', initials: 'CR',
  phone: '+34 600 112 233', specialty: 'Gestión de plataforma',
  location: 'Valencia, España', joinDate: 'Septiembre 2024',
};

const MOCK_STUDENT = {
  id: 'A-1001', roleType: 'alumno',
  name: 'María López Serrano', email: 'maria.lopez@alumno.com',
  initials: 'ML', phone: '+34 611 222 333',
  role: 'Alumna', sector: 'dental',
  joinDate: 'Marzo 2025', location: 'Madrid, España',
  bio: 'Auxiliar en clínica dental con interés en acompañamiento y cuidados.',
  cvFileName: 'cv-maria-lopez.pdf', cvUploadDate: '2026-02-15',
  fiscalData: { fullName: 'María López Serrano', nif: '12345678A', address: 'C/ Serrano 120, 28006 Madrid' },
};

const MOCK_STUDENT_B = {
  id: 'A-1002', roleType: 'alumno',
  name: 'Javier Ruiz Márquez', email: 'javier.ruiz@alumno.com',
  initials: 'JR', phone: '+34 622 333 444',
  role: 'Alumno', sector: 'sanidad',
  joinDate: 'Enero 2026', location: 'Valencia, España',
  bio: 'Enfermero especializado en geriatría, ampliando formación en ACP.',
  cvFileName: null, cvUploadDate: null,
  fiscalData: { fullName: '', nif: '', address: '' },
};

// Credenciales demo para los 4 accesos (3 roles, alumno con 2 perfiles por sector)
const DEMO_CREDENTIALS = [
  { roleType: 'alumno',     sector: 'dental',  email: 'maria.lopez@alumno.com',     password: 'demo1234',  user: MOCK_STUDENT,    label: 'Alumna (sector dental)' },
  { roleType: 'alumno',     sector: 'sanidad', email: 'javier.ruiz@alumno.com',     password: 'demo1234',  user: MOCK_STUDENT_B,  label: 'Alumno (sector sanidad)' },
  { roleType: 'formador',                      email: 'ana.garcia@formador.com',    password: 'demo1234',  user: MOCK_FORMADOR,   label: 'Formadora' },
  { roleType: 'superadmin',                    email: 'admin@cesea.com',            password: 'admin1234', user: MOCK_SUPERADMIN, label: 'Superadministrador' },
];

// ─── Formadores (importados de assets/Datos_Formadores.xlsx vía src/dataReal.jsx) ──
// FILEMAKER: Tabla Formadores. id_externo es el ID original del Excel
//   (Datos_Formadores). Los registros llegan en estado "Pre-registro" hasta que
//   el formador completa el alta y aporta DNI/IBAN/tipologías. Las tarifas y
//   trust_score son editables SOLO por [priv_Superadmin]; el formador las lee
//   en solo lectura desde su perfil.
const MOCK_TRAINERS_FROM_EXCEL = (typeof window !== 'undefined' && window.MOCK_TRAINERS_REAL) || [];

// FILEMAKER: La formadora demo Ana García López no existe en el Excel real;
//   se inyecta como "Activo" para que la sesión de prueba siga funcionando con
//   datos enriquecidos (DNI, IBAN, tarifas, tipologías, cursosAsignados).
const MOCK_FORMADOR_TRAINER = {
  id: 'F-001', idExterno: null,
  name: 'Ana García López', email: 'ana.garcia@formador.com',
  cif: '12345945B', nColegiado: null,
  phone: '+34 612 345 678', poblacion: 'Madrid',
  specialty: 'Acompañamiento, Competencias, ACP', hoursYTD: 90,
  status: 'Activo', joinDate: '2025-01-15', photo: null,
  dni: '***945B', iban: 'ES51 **** **** **** ****4321',
  official: false, rating: 4.7, trustScore: 85,
  tarifaVentaDirecta: 50, tarifaVentaIndirecta: 40, tarifaKm: 0.28,
  tipologias: ['ACP y Modelo de Atención', 'Acompañamiento emocional'],
  cursosAsignados: [3, 4, 5, 6, 7, 8],   // cursos con DEMO_OVERLAY (ver MOCK_COURSES)
};

const MOCK_TRAINERS = [...MOCK_TRAINERS_FROM_EXCEL, MOCK_FORMADOR_TRAINER];

// ─── Tipologías de formación (value list) ────────────────────────────────────
// FILEMAKER: Value List "Tipologias_Formacion" editable desde Admin_Config.
//   Alimenta: (a) dropdown "Tipología" del modal "Añadir propuesta formativa"
//   del formador, (b) multiselect "Tipologías que imparte" del perfil formador.
const MOCK_TIPOLOGIAS = [
  'ACP y Modelo de Atención',
  'Acompañamiento emocional',
  'Movilizaciones seguras',
  'Liderazgo y gestión',
  'Competencias directivas',
  'Marketing y comunicación',
  'Gestión directiva',
  'Técnica odontológica',
  'Medicina y salud',
  'Nutrición y dietética',
  'Autocuidados',
  'Bienestar emocional',
  'Risoterapia',
  'Humanización asistencial',
];

// ─── Solicitudes pendientes (superadmin) ─────────────────────────────────────
// FILEMAKER: Tabla Solicitudes. Los tipos nuevos (proposal, incidencia) son
//   generados desde el portal del formador:
//     - proposal: Modal "Añadir propuesta formativa" → crea registro con
//       campos titulo, tipologia, objetivos, contenidos, fechas_propuestas.
//     - incidencia: Pantalla "Incidencias" → crea registro con tipo_incidencia
//       (enfermedad, cambio_fecha, problema_alumnos, otro) y descripción.
// El superadmin agrupa en la UI por courseTitle (GetSummary en FM).
// Solicitudes pendientes — vacío hasta que un formador real envíe una.
const MOCK_PENDING_REQUESTS = [];

// ─── Bitácora, tareas, asistencia (formador) ─────────────────────────────────
// FILEMAKER: Tabla Bitacora. FK: id_curso, id_sesion. El superadmin consulta
//   las entradas filtradas por curso en el "Expediente del curso" (modo
//   Expedientes de Admin_Horas).
// Bitácoras / tareas / asistencia / inscripciones / diplomas / empleo /
// reseñas / pagos / notificaciones — vacíos hasta que la actividad real
// los genere (vía Supabase).
const MOCK_BITACORAS              = [];
const MOCK_TASKS                  = [];
const MOCK_ATTENDANCE             = [];
const MOCK_ENROLLMENTS            = [];
const MOCK_DIPLOMAS               = [];
const MOCK_JOB_OFFERS             = [];
const MOCK_APPLICATIONS           = [];
const MOCK_REVIEWS                = [];
const MOCK_PAYMENTS               = [];
const MOCK_NOTIFICATIONS_FORMADOR = [];
const MOCK_NOTIFICATIONS_ADMIN    = [];
const MOCK_NOTIFICATIONS_ALUMNO   = [];

// Códigos de descuento — los gestiona el superadmin desde la tabla descuentos.
const DISCOUNT_CODES = {};

// ─── Badges, testimonios, stats, FAQ (alumno) ────────────────────────────────
const BADGES = [
  { id: 'first',     name: 'Primer paso',        desc: 'Completa tu primer curso',      threshold: 1,   icon: '◆' },
  { id: 'learner',   name: 'Aprendiz constante', desc: 'Completa 3 cursos',             threshold: 3,   icon: '◈' },
  { id: 'expert',    name: 'Especialista',       desc: 'Completa 5 cursos',             threshold: 5,   icon: '✦' },
  { id: 'marathon',  name: 'Maratón formativa',  desc: 'Acumula 50 horas lectivas',     threshold: 50,  icon: '◉',  metric: 'hours' },
  { id: 'century',   name: '100 horas',          desc: 'Supera las 100 horas lectivas', threshold: 100, icon: '✪',  metric: 'hours' },
  { id: 'reviewer',  name: 'Voz activa',         desc: 'Deja tu primera valoración',    threshold: 1,   icon: '★',  metric: 'reviews' },
];
const MOCK_TESTIMONIALS = [
  { id: 1, name: 'Laura Sánchez',   role: 'Auxiliar de geriatría',    text: 'Los cursos de CESEA me dieron herramientas reales para mi día a día.', rating: 5 },
  { id: 2, name: 'Diego Fernández', role: 'Enfermero residencial',    text: 'La formación en ACP cambió por completo el trato con los residentes.', rating: 5 },
  { id: 3, name: 'Nuria Gómez',     role: 'Terapeuta ocupacional',    text: 'Formadores cercanos, contenidos actuales y aplicables desde el primer día.', rating: 5 },
  { id: 4, name: 'Carlos Mateos',   role: 'Director de residencia',   text: 'Hemos formado a todo el equipo con CESEA. Calidad y trato excepcionales.', rating: 5 },
];
const MOCK_STATS = [
  { label: 'Alumnos formados',   value: '8.400+',  caption: 'profesionales de toda España' },
  { label: 'Cursos en catálogo', value: '65',      caption: 'acreditados y actualizados'   },
  { label: 'Horas impartidas',   value: '112.000', caption: 'en 2024'                      },
  { label: 'Valoración media',   value: '4.8/5',   caption: 'sobre 2.300 reseñas'          },
];
const MOCK_FAQ = [
  { q: '¿Los cursos están acreditados?',          a: 'Sí. Todas nuestras formaciones están homologadas y acreditadas por los organismos competentes del sector sociosanitario.' },
  { q: '¿Cómo recibo mi diploma?',                a: 'Al completar el curso al 100 %, el diploma se genera automáticamente en «Mis diplomas» para descarga inmediata en PDF.' },
  { q: '¿Puedo cancelar una inscripción?',        a: 'Puedes cancelar hasta 48h antes del inicio del curso y se te devolverá el importe íntegro.' },
  { q: '¿Qué métodos de pago aceptan?',           a: 'Tarjeta (Visa/MasterCard), Bizum y transferencia bancaria. Recibirás factura por correo.' },
  { q: '¿Las ofertas de empleo son reales?',      a: 'Sí. Todas las ofertas son publicadas por empresas colaboradoras del sector dental y sociosanitario.' },
  { q: '¿Cómo puedo actualizar mi CV?',           a: 'Accede a tu perfil y sube el nuevo archivo PDF en la sección «Currículum».' },
  { q: '¿Ofrecéis formación a empresas?',         a: 'Sí. Escríbenos a formacion@cesea.com y preparamos planes corporativos a medida.' },
];

// ─── AppContext + AppProvider unificado ──────────────────────────────────────
// Alumnos: solo los 2 demo (María y Javier). Los demás se crean al registrarse.
// FILEMAKER: tabla Alumnos. Al inicio solo existen los registros demo.
const MOCK_STUDENTS_ALL = [
  { id: 'A-1001', name: 'María López Serrano',  email: 'maria.lopez@alumno.com',   sector: 'dental',  status: 'activo', joinDate: '2025-03-12', coursesCount: 0, lastActivity: null, phone: '+34 611 222 333', location: 'Madrid' },
  { id: 'A-1002', name: 'Javier Ruiz Márquez',  email: 'javier.ruiz@alumno.com',   sector: 'sanidad', status: 'activo', joinDate: '2026-01-04', coursesCount: 0, lastActivity: null, phone: '+34 622 333 444', location: 'Valencia' },
];

// Reseñas recibidas por formador — vacío hasta que un alumno deje una.
const MOCK_REVIEWS_BY_INSTRUCTOR = [];

const AppContext = React.createContext();

function AppProvider({ children }) {
  // ── Auth + routing ──────────────────────────────────────────────────────────
  const [user, setUser]                       = React.useState(null);
  const [currentView, setCurrentView]         = React.useState('inicio');

  // ── Preferencias UI ─────────────────────────────────────────────────────────
  const [themeMode, setThemeMode]             = React.useState('light');
  const theme = getTheme(themeMode);
  const toggleTheme = () => setThemeMode(m => m === 'light' ? 'dark' : 'light');

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('dark', themeMode === 'dark');
  }, [themeMode]);

  // ── Estado SHARED (cursos + toast) ──────────────────────────────────────────
  const [courses, setCourses]                 = React.useState(MOCK_COURSES);
  const [toast, setToast]                     = React.useState(null);
  const showToast = (text, kind = 'success') => {
    setToast({ text, kind, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Estado FORMADOR ─────────────────────────────────────────────────────────
  const [hoursLog, setHoursLog]               = React.useState(MOCK_HOURS_LOG);
  const [calendarEvents, setCalendarEvents]   = React.useState([]);
  const [complianceModal, setComplianceModal] = React.useState(null);
  const [notifFormador, setNotifFormador]     = React.useState(MOCK_NOTIFICATIONS_FORMADOR);
  const [bitacoras, setBitacoras]             = React.useState(MOCK_BITACORAS);
  const [tasks, setTasks]                     = React.useState(MOCK_TASKS);
  const [attendance, setAttendance]           = React.useState(MOCK_ATTENDANCE);

  // ── Estado SUPERADMIN ───────────────────────────────────────────────────────
  const [trainers, setTrainers]               = React.useState(MOCK_TRAINERS);
  const [students, setStudents]               = React.useState(MOCK_STUDENTS_ALL);
  const [pendingRequests, setPendingRequests] = React.useState(MOCK_PENDING_REQUESTS);
  const [notifAdmin, setNotifAdmin]           = React.useState(MOCK_NOTIFICATIONS_ADMIN);
  const [reviewsPublic]                       = React.useState(MOCK_REVIEWS_BY_INSTRUCTOR);
  const [companyConfig, setCompanyConfig]     = React.useState(COMPANY);
  // FILEMAKER: Value List "Tipologias_Formacion" — editable desde Admin_Config
  const [tipologias, setTipologias]           = React.useState(MOCK_TIPOLOGIAS);
  // FILEMAKER: Tabla Expedientes_Cerrados (id_curso, fecha, observaciones_admin).
  const [closedExpedientes, setClosedExpedientes] = React.useState([]);

  // ── Estado ALUMNO ───────────────────────────────────────────────────────────
  const [enrollments, setEnrollments]         = React.useState(MOCK_ENROLLMENTS);
  const [diplomas, setDiplomas]               = React.useState(MOCK_DIPLOMAS);
  // jobs ahora mutable: el superadmin puede crear/editar/archivar ofertas
  const [jobs, setJobs]                       = React.useState(MOCK_JOB_OFFERS);
  const [applications, setApplications]       = React.useState(MOCK_APPLICATIONS);
  const [reviews, setReviews]                 = React.useState(MOCK_REVIEWS);
  const [payments, setPayments]               = React.useState(MOCK_PAYMENTS);
  const [notifAlumno, setNotifAlumno]         = React.useState(MOCK_NOTIFICATIONS_ALUMNO);
  const [favorites, setFavorites]             = React.useState([2, 9, 14]);
  const [checkoutCourse, setCheckoutCourse]   = React.useState(null);
  const [detailCourseId, setDetailCourseId]   = React.useState(null);
  // Onboarding del alumno arranca cerrado para no tapar las vistas al hacer login
  const [onboardingDone, setOnboardingDone]   = React.useState(true);
  const [cookiesAccepted, setCookiesAccepted] = React.useState(false);

  // ── Auth ────────────────────────────────────────────────────────────────────
  // FILEMAKER: POST /fmi/data/vLatest/databases/CESEA/sessions. El rol se deduce
  //   del Privilege Set. El PrivilegeSetName del registro determina la vista.
  const login = (email, password) => {
    const match = DEMO_CREDENTIALS.find(c =>
      c.email.toLowerCase() === String(email || '').toLowerCase() && c.password === password
    );
    if (match) { setUser(match.user); setCurrentView('inicio'); return match.user.roleType; }
    return null;
  };
  // Atajo para entrar directo al rol (usado por las tarjetas de la pantalla login)
  const loginAs = (cred) => {
    setUser(cred.user); setCurrentView('inicio'); return cred.user.roleType;
  };
  const logout = () => { setUser(null); setCurrentView('inicio'); };
  const register = (payload) => {
    const newUser = {
      ...MOCK_STUDENT,
      id: 'A-' + Date.now(),
      name: payload.name || 'Nuevo alumno',
      email: payload.email,
      initials: (payload.name || '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase(),
      sector: payload.sector || 'dental',
      joinDate: new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
    };
    setUser(newUser); setCurrentView('inicio');
    return 'alumno';
  };

  // ── Acciones formador ───────────────────────────────────────────────────────
  // FILEMAKER: Script "Propuesta_Fecha_Formador" — al solicitar plaza, el formador
  //   puede proponer fechas propias. Se guardan en Cursos::fechas_propuestas (JSON)
  //   y se crea un registro en Solicitudes con type="new".
  const swipeRight = (id, proposal) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, status: 'review', proposedDates: proposal?.dates || null, proposedSchedule: proposal?.schedule || null, proposedNote: proposal?.note || null } : c));
    const course = MOCK_COURSES.find(c => c.id === id);
    if (course && user?.name) {
      setPendingRequests(prev => [{
        id: 'R-' + Date.now(),
        type: 'new',
        trainer: user.name,
        trainerId: user.id || 'F-001',
        courseTitle: course.title,
        detail: proposal?.dates ? `Propone fechas: ${proposal.dates}` : 'Solicita plaza',
        date: new Date().toISOString().slice(0, 10),
        proposedDates: proposal?.dates || null,
        note: proposal?.note || null,
      }, ...prev]);
    }
  };
  const swipeLeft  = (id) => setCourses(prev => prev.filter(c => c.id !== id));
  const submitChange = (id, data) => setCourses(prev => prev.map(c => c.id === id ? { ...c, changeRequest: data } : c));
  const addCalendarEvent = (ev) => setCalendarEvents(prev => [...prev, { ...ev, id: Date.now() }]);

  // FILEMAKER: Script "Crear_Propuesta_Formativa" — el formador envía una
  //   propuesta de curso nuevo al superadmin. Se guarda en Solicitudes con
  //   type="proposal" y campos extra (objetivos, contenidos, tipologia).
  const createProposal = (payload) => {
    setPendingRequests(prev => [{
      id: 'R-' + Date.now(),
      type: 'proposal',
      trainer: user?.name || 'Formador/a',
      trainerId: user?.id || 'F-001',
      courseTitle: payload.title || 'Propuesta sin título',
      detail: `Nueva propuesta formativa · ${payload.modality || '—'} · ${payload.hours || 0} h · tipología: ${payload.tipologia || '—'}`,
      date: new Date().toISOString().slice(0, 10),
      proposedDates: payload.dates || null,
      objectives: payload.objectives || '',
      contents: payload.contents || '',
      tipologia: payload.tipologia || '',
      hours: payload.hours || 0,
      modality: payload.modality || '',
    }, ...prev]);
    showToast('Propuesta enviada al superadmin');
  };

  // FILEMAKER: Script "Nueva_Incidencia" — el formador reporta una incidencia
  //   ligada a un curso. Se guarda en Solicitudes con type="incidencia".
  const createIncidencia = (payload) => {
    setPendingRequests(prev => [{
      id: 'R-' + Date.now(),
      type: 'incidencia',
      trainer: user?.name || 'Formador/a',
      trainerId: user?.id || 'F-001',
      courseTitle: payload.courseTitle || '—',
      courseId: payload.courseId,
      detail: `${payload.incidenciaType || 'Otro'}: ${payload.description || ''}`,
      description: payload.description || '',
      incidenciaType: payload.incidenciaType || 'Otro',
      status: 'abierta',
      date: new Date().toISOString().slice(0, 10),
    }, ...prev]);
    showToast('Incidencia reportada al superadmin');
  };
  const completeCourse = (id) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, status: 'completed' } : c));
    setComplianceModal(null);
  };
  const markAllReadFormador = () => setNotifFormador(prev => prev.map(n => ({ ...n, read: true })));

  const uploadFormadorDoc = (fileName, type = 'otro') => {
    const year = new Date().getFullYear();
    const newDoc = { id: 'DOC-' + Date.now(), name: fileName, type, uploadedAt: new Date().toISOString().slice(0, 10), year, size: '—' };
    setUser(u => ({ ...u, documents: [newDoc, ...(u.documents || [])], ...(type === 'cv' ? { cvFileName: fileName, cvUploadYear: year } : {}) }));
    showToast('Documento subido correctamente');
  };
  const removeFormadorDoc = (docId) =>
    setUser(u => ({ ...u, documents: (u.documents || []).filter(d => d.id !== docId) }));

  const addBitacoraEntry = (entry) => {
    const id = 'B-' + Date.now();
    setBitacoras(prev => [{ id, ...entry }, ...prev]);
    showToast('Entrada añadida a la bitácora');
  };
  const updateBitacoraEntry = (id, patch) =>
    setBitacoras(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b));

  const signTask = (taskId, signatureDataUrl) =>
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, signatureImg: signatureDataUrl, status: 'firmada' } : t));
  const uploadSignedPdf = (taskId, pdfFileName) =>
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, signedPdf: pdfFileName, status: 'firmada' } : t));
  const addTaskDeliverable = (taskId, fileName) =>
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, deliverables: [...(t.deliverables || []), { name: fileName, uploadedAt: new Date().toISOString().slice(0, 10), size: '—' }] } : t));
  const setTaskStatus = (taskId, status) =>
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));

  const setStudentAttendance = (sessionId, studentId, status, notes = '') =>
    setAttendance(prev => prev.map(s => s.id === sessionId
      ? { ...s, records: s.records.map(r => r.studentId === studentId ? { ...r, status, notes, origin: 'manual' } : r) }
      : s));
  const addAttendanceRecord = (sessionId, record) =>
    setAttendance(prev => prev.map(s => s.id === sessionId
      ? { ...s, records: s.records.some(r => r.studentId === record.studentId)
              ? s.records.map(r => r.studentId === record.studentId ? { ...r, ...record } : r)
              : [...s.records, record] }
      : s));

  // ── Acciones superadmin ─────────────────────────────────────────────────────
  // FILEMAKER: Script "Crear_Curso" — equivale a New Record en Cursos. Los
  //   campos codigo_interno y num_imparticiones son obligatorios; ambos viajan
  //   al presupuesto/OT del cliente.
  const createCourse = (data) => {
    const id = (courses.reduce((m, c) => Math.max(m, c.id), 0) || 0) + 1;
    setCourses(prev => [{
      id,
      status: 'available',
      tags: [data.category, data.area].filter(Boolean),
      modality: 'Presencial',
      numImparticiones: 1,
      time: '',
      location: 'Por asignar',
      dates: '',
      startDate: null, endDate: null,
      hours: 8, price: 99, level: 'Intermedio',
      rating: 0, students: 0,
      instructor: 'Por asignar',
      official: false,
      objetivos: '', contenidos: '',
      ciudades: [], formadoresAsignados: [],
      tipoContrato: null,
      createdAt: new Date().toISOString().slice(0, 10),
      ...data,
    }, ...prev]);
  };
  const updateCourse = (id, patch) => setCourses(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  const archiveCourse = (id) => setCourses(prev => prev.map(c => c.id === id ? { ...c, status: 'archived' } : c));

  // FILEMAKER: Script "Import_Cursos_CSV" — upsert por título.
  //   Devuelve conteo { created, updated, errors }.
  const bulkUpsertCourses = (rows) => {
    let created = 0, updated = 0;
    setCourses(prev => {
      const next = [...prev];
      rows.forEach(row => {
        const idx = next.findIndex(c => (c.title || '').trim().toLowerCase() === (row.title || '').trim().toLowerCase());
        if (idx >= 0) { next[idx] = { ...next[idx], ...row, createdAt: next[idx].createdAt }; updated++; }
        else {
          const id = next.reduce((m, c) => Math.max(m, c.id), 0) + 1;
          next.unshift({ id, status: 'available', rating: 0, students: 0, tags: [row.category, row.area].filter(Boolean), createdAt: new Date().toISOString().slice(0, 10), ...row });
          created++;
        }
      });
      return next;
    });
    showToast(`${created} nuevos · ${updated} actualizados`);
    return { created, updated };
  };

  // FILEMAKER: Scripts "Actualizar_Formador" y "Fijar_Kilometraje". Estos
  //   campos son read-only para el formador y editables solo por superadmin.
  const updateTrainer = (trainerId, patch) =>
    setTrainers(prev => prev.map(t => t.id === trainerId ? { ...t, ...patch } : t));

  // FILEMAKER: Scripts CRUD de Value List "Tipologias_Formacion".
  const addTipologia = (name) => {
    const clean = String(name || '').trim();
    if (!clean) return;
    setTipologias(prev => prev.includes(clean) ? prev : [...prev, clean]);
  };
  const removeTipologia = (name) => setTipologias(prev => prev.filter(t => t !== name));

  // FILEMAKER: Scripts "Cerrar_Expediente" y "Devolver_Expediente_Formador".
  const closeExpediente = (courseId, note = '') => {
    setClosedExpedientes(prev => [...prev, { courseId, date: new Date().toISOString().slice(0, 10), note, status: 'cerrado' }]);
    setHoursLog(prev => prev.map(h => {
      const course = MOCK_COURSES.find(c => c.id === courseId);
      return course && h.course === course.title ? { ...h, status: 'Validado' } : h;
    }));
    showToast('Expediente cerrado');
  };
  const returnExpediente = (courseId, note = '') => {
    const course = MOCK_COURSES.find(c => c.id === courseId);
    if (!course) return;
    setPendingRequests(prev => [{
      id: 'R-' + Date.now(),
      type: 'change',
      trainer: course.instructor || '—',
      courseTitle: course.title,
      detail: `Expediente devuelto por superadmin: ${note || 'revisar datos'}`,
      date: new Date().toISOString().slice(0, 10),
    }, ...prev]);
    showToast('Expediente devuelto al formador');
  };
  const approveRequest = (id) => {
    const req = pendingRequests.find(r => r.id === id);
    if (!req) return;
    if (req.type === 'new')      setCourses(prev => prev.map(c => c.title === req.courseTitle && c.status === 'review' ? { ...c, status: 'accepted' } : c));
    if (req.type === 'hours')    setHoursLog(prev => prev.map(h => h.course === req.courseTitle ? { ...h, status: 'Validado' } : h));
    if (req.type === 'register') setTrainers(prev => prev.map(t => t.name === req.trainer ? { ...t, status: 'Activo' } : t));
    setPendingRequests(prev => prev.filter(r => r.id !== id));
  };
  const rejectRequest = (id) => setPendingRequests(prev => prev.filter(r => r.id !== id));
  const validateHours = (hId) => setHoursLog(prev => prev.map(h => h.id === hId ? { ...h, status: 'Validado' } : h));
  const rejectHours = (hId) => setHoursLog(prev => prev.map(h => h.id === hId ? { ...h, status: 'Rechazado' } : h));
  const setTrainerStatus = (tid, status) => setTrainers(prev => prev.map(t => t.id === tid ? { ...t, status } : t));
  const markAllReadAdmin = () => setNotifAdmin(prev => prev.map(n => ({ ...n, read: true })));

  // ── Acciones alumno ─────────────────────────────────────────────────────────
  const enrollInCourse = (courseId, paymentData) => {
    const eid = 'E-' + Date.now();
    const course = MOCK_COURSES.find(c => c.id === courseId);
    setEnrollments(prev => [{ id: eid, courseId, status: 'inscrito', progress: 0, enrolledAt: new Date().toISOString().slice(0, 10), lastAccess: null }, ...prev]);
    const pid = 'P-' + Date.now();
    const payment = { id: pid, enrollmentId: eid, amount: paymentData?.amount ?? course?.price ?? 0, method: paymentData?.method || 'tarjeta', date: new Date().toISOString().slice(0, 10), status: 'confirmado', invoiceNo: 'CESEA-F-' + new Date().getFullYear() + '-' + String(Math.floor(1000 + Math.random() * 9000)) };
    setPayments(prev => [payment, ...prev]);
    setNotifAlumno(prev => [{ id: Date.now(), icon: '◉', text: `Pago de ${payment.amount} € confirmado · inscripción a "${course?.title}"`, read: false, date: payment.date }, ...prev]);
    showToast('¡Inscripción confirmada! Revisa tus cursos.');
    return eid;
  };
  const advanceProgress = (enrollmentId, delta = 10) =>
    setEnrollments(prev => prev.map(e => {
      if (e.id !== enrollmentId) return e;
      const progress = Math.min(100, (e.progress || 0) + delta);
      const status = progress >= 100 ? 'completado' : 'en_progreso';
      return { ...e, progress, status, lastAccess: new Date().toISOString().slice(0, 10) };
    }));
  const completeEnrollment = (enrollmentId) => {
    const enr = enrollments.find(e => e.id === enrollmentId);
    setEnrollments(prev => prev.map(e => e.id === enrollmentId ? { ...e, status: 'completado', progress: 100, completedAt: new Date().toISOString().slice(0, 10) } : e));
    if (enr) {
      const course = MOCK_COURSES.find(c => c.id === enr.courseId);
      const did = 'D-' + Date.now();
      setDiplomas(prev => [{ id: did, enrollmentId, courseId: enr.courseId, title: course?.title || '', issueDate: new Date().toISOString().slice(0, 10), hours: course?.hours || 0, code: 'CESEA-' + new Date().getFullYear() + '-' + String(Math.floor(10000 + Math.random() * 89999)), grade: 'Apto' }, ...prev]);
      showToast('¡Curso completado! Tu diploma está listo.');
    }
  };
  const toggleFavorite = (courseId) =>
    setFavorites(prev => prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]);
  const submitReview = (courseId, rating, comment) => {
    setReviews(prev => [{ id: 'R-' + Date.now(), courseId, rating, comment, date: new Date().toISOString().slice(0, 10) }, ...prev]);
    showToast('¡Gracias por tu valoración!');
  };
  const applyToJob = (jobId) => {
    if (applications.some(a => a.jobId === jobId)) { showToast('Ya te has postulado a esta oferta', 'info'); return; }
    setApplications(prev => [{ id: 'AP-' + Date.now(), jobId, status: 'postulado', date: new Date().toISOString().slice(0, 10), lastUpdate: new Date().toISOString().slice(0, 10), notes: 'Postulación enviada con tu CV más reciente' }, ...prev]);
    showToast('¡Postulación enviada con éxito!');
  };
  const withdrawApplication = (appId) => setApplications(prev => prev.filter(a => a.id !== appId));
  const updateProfile = (patch) => setUser(u => ({ ...u, ...patch }));
  const uploadCV = (fileName) => setUser(u => ({ ...u, cvFileName: fileName, cvUploadDate: new Date().toISOString().slice(0, 10) }));
  const markAllReadAlumno = () => setNotifAlumno(prev => prev.map(n => ({ ...n, read: true })));
  const validateDiscount = (code) => DISCOUNT_CODES[String(code || '').toUpperCase()] || null;
  const acceptCookies = () => setCookiesAccepted(true);
  const completeOnboarding = () => setOnboardingDone(true);

  // Notificaciones según rol actual
  const notifications = user?.roleType === 'alumno' ? notifAlumno
                      : user?.roleType === 'superadmin' ? notifAdmin
                      : notifFormador;
  const markAllRead = user?.roleType === 'alumno' ? markAllReadAlumno
                    : user?.roleType === 'superadmin' ? markAllReadAdmin
                    : markAllReadFormador;

  // ── Acciones superadmin: Alumnos CRUD ───────────────────────────────────────
  // FILEMAKER: Scripts "Crear_Alumno", "Editar_Alumno", "Cambiar_Estado_Alumno".
  //   En producción: New Record en tabla Alumnos con privilege [priv_Superadmin].
  const createStudent = (data) => {
    const id = 'A-' + Date.now();
    setStudents(prev => [{
      id, coursesCount: 0, lastActivity: null,
      status: 'pendiente', joinDate: new Date().toISOString().slice(0, 10),
      sector: 'dental', phone: '', location: '',
      ...data,
    }, ...prev]);
    showToast('Alumno añadido correctamente');
  };
  const updateStudent = (id, patch) =>
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  const setStudentStatus = (id, status) => updateStudent(id, { status });

  // ── Acciones superadmin: Ofertas de empleo CRUD ────────────────────────────
  // FILEMAKER: Scripts "Crear_Oferta", "Editar_Oferta", "Archivar_Oferta".
  //   Los alumnos consumen esta misma tabla Ofertas_Empleo vía portal filtrado.
  const createJobOffer = (data) => {
    const id = 'J-' + Date.now();
    setJobs(prev => [{
      id, posted: new Date().toISOString().slice(0, 10),
      sector: 'dental', modality: 'Presencial', hours: 'Jornada completa',
      salary: '', location: '', desc: '', company: '', title: '',
      status: 'activa',
      ...data,
    }, ...prev]);
    showToast('Oferta publicada');
  };
  const updateJobOffer = (id, patch) =>
    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...patch } : j));
  const archiveJobOffer = (id) => updateJobOffer(id, { status: 'archivada' });

  // ── Acción superadmin: actualizar configuración de la organización ─────────
  // FILEMAKER: Script "Actualizar_Config_Organizacion" — Modify Record en
  //   tabla Organizacion (registro único) con [priv_Superadmin].
  const updateCompanyConfig = (patch) => {
    setCompanyConfig(prev => ({ ...prev, ...patch }));
    showToast('Configuración actualizada');
  };

  // ── Acción alumno: marcar UNA notificación como leída ──────────────────────
  // FILEMAKER: Script "Marcar_Notificacion_Leida" — Set Field notificacion.leida.
  const markOneNotifRead = (id) =>
    setNotifAlumno(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  // ─── Supabase override block ────────────────────────────────────────────────
  // Si window.api existe (cargado por src/api.jsx), todas las acciones del
  // AppContext se redirigen a la base de datos en lugar de usar los useState
  // locales. El bloque mantiene los mocks intactos como fallback / modo demo.
  // FILEMAKER: equivale a un toggle Server Mode vs Local Mode.
  const USE_SUPABASE = !!window.api;
  const supabaseAPI  = window.api || null;

  // 1. Restaurar sesión y escuchar cambios de auth
  React.useEffect(() => {
    if (!USE_SUPABASE) return undefined;
    let mounted = true;

    const loadProfile = async (session) => {
      if (!mounted) return;
      if (!session?.user) { setUser(null); return; }
      try {
        const sb = window.supabaseClient;
        const { data: profile } = await sb.from('usuarios').select('*').eq('id', session.user.id).single();
        if (!profile) return;
        let extra = {};
        if (profile.role_type === 'formador') {
          const { data: f } = await sb.from('formadores').select('*').eq('user_id', session.user.id).maybeSingle();
          if (f) extra = { ...f, dniFull: f.dni, ibanFull: f.iban };
        } else if (profile.role_type === 'alumno') {
          const { data: a } = await sb.from('alumnos').select('*').eq('user_id', session.user.id).maybeSingle();
          if (a) extra = a;
        }
        if (!mounted) return;
        setUser({
          id: profile.id,
          roleType: profile.role_type,
          email: profile.email,
          name: profile.name,
          initials: profile.initials || (profile.name||'').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase(),
          phone: profile.phone,
          photo: profile.photo_url,
          ...extra,
        });
      } catch (e) { console.error('[supabase] load profile:', e); }
    };

    supabaseAPI.auth.getSession().then(loadProfile);
    const { data: sub } = supabaseAPI.auth.onChange(loadProfile);
    return () => { mounted = false; sub?.subscription?.unsubscribe?.(); };
  }, []);

  // 2. Cargar datos iniciales cuando hay sesión
  React.useEffect(() => {
    if (!USE_SUPABASE || !user) return undefined;
    let mounted = true;
    (async () => {
      try {
        const [cs, ts, sols, tps] = await Promise.all([
          supabaseAPI.cursos.list(),
          supabaseAPI.formadores.list(),
          supabaseAPI.solicitudes.list().catch(() => []),
          supabaseAPI.tipologias.list().catch(() => []),
        ]);
        if (!mounted) return;
        if (cs)   setCourses(cs);
        if (ts)   setTrainers(ts);
        if (sols) setPendingRequests(sols);
        if (tps && tps.length) setTipologias(tps);
      } catch (e) { console.error('[supabase] initial load:', e); }
    })();
    return () => { mounted = false; };
  }, [USE_SUPABASE, user?.id]);

  // 3. Helper genérico: llama a la api y refresca la lista local
  const sbCall = async (apiFn, refreshFn, successMsg) => {
    try {
      await apiFn();
      if (refreshFn) await refreshFn();
      if (successMsg) showToast(successMsg);
    } catch (e) {
      console.error('[supabase]', e);
      showToast('Error: ' + (e.message || 'sin detalles'), 'error');
    }
  };
  const refreshCursos        = async () => setCourses(await supabaseAPI.cursos.list());
  const refreshTrainers      = async () => setTrainers(await supabaseAPI.formadores.list());
  const refreshSolicitudes   = async () => setPendingRequests(await supabaseAPI.solicitudes.list());
  const refreshTipologias    = async () => setTipologias(await supabaseAPI.tipologias.list());

  // 4. Versiones Supabase de cada acción
  const sbActions = !USE_SUPABASE ? {} : {
    // Auth — con fallback a mocks si Supabase aún no tiene los usuarios cargados
    login: async (email, password) => {
      try {
        const u = await supabaseAPI.auth.signIn(email, password);
        setUser(u); setCurrentView('inicio'); return u.roleType;
      } catch (e) {
        // Fallback: si Supabase no tiene aún los usuarios (setup en curso),
        // permitir el login con las credenciales demo locales.
        const match = DEMO_CREDENTIALS.find(c =>
          c.email.toLowerCase() === String(email || '').toLowerCase() && c.password === password
        );
        if (match) { setUser(match.user); setCurrentView('inicio'); return match.user.roleType; }
        showToast('Credenciales inválidas', 'error');
        return null;
      }
    },
    loginAs: async (cred) => {
      try { return await sbActions.login(cred.email, cred.password); }
      catch (e) { setUser(cred.user); setCurrentView('inicio'); return cred.user.roleType; }
    },
    logout: async () => {
      await supabaseAPI.auth.signOut();
      setUser(null); setCurrentView('inicio');
    },
    register: async (payload) => {
      try {
        const r = await supabaseAPI.auth.register(payload);
        // Una vez creado en auth, hacer signIn para que la sesión quede
        // activa y el listener cargue el perfil enriquecido.
        await supabaseAPI.auth.signIn(payload.email, payload.password);
        if (r.linkedTo) {
          showToast('¡Bienvenido/a, ' + r.linkedTo + '! Vinculado a tu pre-registro.');
        } else {
          showToast('Cuenta creada como ' + r.role);
        }
        setCurrentView('inicio');
        return r.role;
      } catch (e) {
        showToast('No se pudo registrar: ' + (e.message || 'sin detalles'), 'error');
        return null;
      }
    },

    // Cursos (admin)
    createCourse: (data)        => sbCall(() => supabaseAPI.cursos.create(data),   refreshCursos, 'Curso creado'),
    updateCourse: (id, patch)   => sbCall(() => supabaseAPI.cursos.update(id, patch), refreshCursos, 'Curso actualizado'),
    archiveCourse: (id)         => sbCall(() => supabaseAPI.cursos.archive(id),    refreshCursos, 'Curso archivado'),
    bulkUpsertCourses: (rows)   => sbCall(() => supabaseAPI.cursos.bulkUpsert(rows), refreshCursos, 'Importación completada'),

    // Formadores (admin)
    updateTrainer: (id, patch)  => sbCall(() => supabaseAPI.formadores.update(id, patch), refreshTrainers),
    setTrainerStatus: (id, st)  => sbCall(() => supabaseAPI.formadores.setStatus(id, st), refreshTrainers, 'Estado actualizado'),

    // Solicitudes (formador genera, admin resuelve)
    swipeRight: (id, proposal)  => sbCall(async () => {
      await supabaseAPI.cursos.update(id, { status: 'review' });
      const course = courses.find(c => c.id === id);
      await supabaseAPI.solicitudes.create({
        type: 'new', courseId: id,
        courseTitle: course?.title,
        detail: proposal?.dates ? `Propone fechas: ${proposal.dates}` : 'Solicita plaza',
        proposedDates: proposal?.dates, proposedSchedule: proposal?.schedule,
        note: proposal?.note,
      });
      await refreshCursos(); await refreshSolicitudes();
    }, null, 'Plaza solicitada'),
    swipeLeft: (id) => {
      // Local hide only (no SQL — el formador simplemente no quiere este curso)
      setCourses(prev => prev.filter(c => c.id !== id));
    },
    submitChange: (id, data)    => sbCall(() => supabaseAPI.solicitudes.create({
      type: 'change', courseId: id, courseTitle: courses.find(c=>c.id===id)?.title, detail: data.notes, note: data.notes, proposedDates: data.dates,
    }), refreshSolicitudes, 'Solicitud de cambio enviada'),
    completeCourse: (id)        => sbCall(() => supabaseAPI.cursos.update(id, { status: 'completed' }), refreshCursos, 'Formación cerrada'),
    createProposal: (payload)   => sbCall(() => supabaseAPI.solicitudes.create({ ...payload, type: 'proposal', courseTitle: payload.title }), refreshSolicitudes, 'Propuesta enviada al superadmin'),
    createIncidencia: (payload) => sbCall(() => supabaseAPI.solicitudes.create({ ...payload, type: 'incidencia' }), refreshSolicitudes, 'Incidencia reportada al superadmin'),
    approveRequest: (id)        => sbCall(() => supabaseAPI.solicitudes.approve(id), async () => { await refreshSolicitudes(); await refreshCursos(); await refreshTrainers(); }, 'Solicitud aprobada'),
    rejectRequest: (id)         => sbCall(() => supabaseAPI.solicitudes.reject(id),  refreshSolicitudes, 'Solicitud rechazada'),
    validateHours: (id)         => sbCall(() => supabaseAPI.solicitudes.approve(id), refreshSolicitudes, 'Horas validadas'),
    rejectHours: (id)           => sbCall(() => supabaseAPI.solicitudes.reject(id),  refreshSolicitudes, 'Horas rechazadas'),

    // Bitácora
    addBitacoraEntry: (entry)         => sbCall(() => supabaseAPI.bitacoras.create(entry),     async () => setBitacoras(await supabaseAPI.bitacoras.list()), 'Entrada añadida'),
    updateBitacoraEntry: (id, patch)  => sbCall(() => supabaseAPI.bitacoras.update(id, patch), async () => setBitacoras(await supabaseAPI.bitacoras.list()), 'Entrada actualizada'),

    // Tareas
    signTask: (id, dataUrl)        => sbCall(() => supabaseAPI.tareas.sign(id, dataUrl), async () => setTasks(await supabaseAPI.tareas.list()), 'Tarea firmada'),
    uploadSignedPdf: (id, name)    => sbCall(() => supabaseAPI.tareas.setStatus(id, 'firmada'), async () => setTasks(await supabaseAPI.tareas.list()), 'PDF subido'),
    addTaskDeliverable: (id, file) => sbCall(() => supabaseAPI.tareas.addDeliverable(id, file), async () => setTasks(await supabaseAPI.tareas.list()), 'Entregable añadido'),
    setTaskStatus: (id, st)        => sbCall(() => supabaseAPI.tareas.setStatus(id, st), async () => setTasks(await supabaseAPI.tareas.list())),

    // Asistencia
    setStudentAttendance: (sid, aid, st, n) => sbCall(() => supabaseAPI.asistencia.setRecord(sid, aid, st, n), async () => setAttendance(await supabaseAPI.asistencia.list())),
    addAttendanceRecord:  (sid, rec)        => sbCall(() => supabaseAPI.asistencia.setRecord(sid, rec.studentId, rec.status, rec.notes), async () => setAttendance(await supabaseAPI.asistencia.list())),

    // Calendar
    addCalendarEvent: (ev) => sbCall(() => supabaseAPI.calendar.create(ev), async () => setCalendarEvents(await supabaseAPI.calendar.list()), 'Evento añadido'),

    // Documentos del formador
    uploadFormadorDoc: (file, type) => sbCall(() => supabaseAPI.documentos.upload(file, type), null, 'Documento subido'),
    removeFormadorDoc: (id)         => sbCall(() => supabaseAPI.documentos.remove(id),        null, 'Documento eliminado'),

    // Tipologías
    addTipologia: (name)    => sbCall(() => supabaseAPI.tipologias.add(name),    refreshTipologias, 'Tipología añadida'),
    removeTipologia: (name) => sbCall(() => supabaseAPI.tipologias.remove(name), refreshTipologias, 'Tipología eliminada'),

    // Empleo
    createJobOffer: (data)   => sbCall(() => supabaseAPI.empleo.createOferta(data), null, 'Oferta creada'),
    updateJobOffer: (id, p)  => sbCall(() => supabaseAPI.empleo.updateOferta(id, p), null, 'Oferta actualizada'),
    archiveJobOffer: (id)    => sbCall(() => supabaseAPI.empleo.archiveOferta(id),  null, 'Oferta archivada'),
    applyToJob: (jobId)      => sbCall(() => supabaseAPI.empleo.aplicar(jobId),     null, 'Solicitud enviada'),
    withdrawApplication: (id)=> sbCall(() => supabaseAPI.empleo.retirarAplicacion(id), null, 'Solicitud retirada'),

    // Alumno
    enrollInCourse: ({ courseId, paymentData }) => sbCall(() => supabaseAPI.matriculas.create({ courseId, paymentData }), null, 'Matrícula confirmada'),
    advanceProgress: (id, delta) => sbCall(() => supabaseAPI.matriculas.advance(id, delta)),
    completeEnrollment: (id) => sbCall(() => supabaseAPI.matriculas.complete(id), null, 'Curso completado'),
    updateProfile: (patch)   => sbCall(() => supabaseAPI.alumnos.updateMine(patch), null, 'Perfil actualizado'),
    uploadCV: (fileName)     => sbCall(() => supabaseAPI.alumnos.updateMine({ cvFileName: fileName }), null, 'CV subido'),
    validateDiscount: async (code) => await supabaseAPI.pagos.validateDiscount(code),

    // Notificaciones
    markAllRead:      () => sbCall(() => supabaseAPI.notif.markAllRead()),
    markOneNotifRead: (id) => sbCall(() => supabaseAPI.notif.markOne(id)),
  };

  return React.createElement(AppContext.Provider, {
    value: {
      // Shared
      user, currentView, setCurrentView, setUser,
      login, loginAs, logout, register,
      themeMode, theme, toggleTheme,
      sanitize, COMPANY, LEGAL_TEXTS,
      toast, showToast,
      courses, notifications, markAllRead,
      // Formador
      hoursLog, calendarEvents, complianceModal, setComplianceModal,
      swipeRight, swipeLeft, submitChange, addCalendarEvent, completeCourse,
      uploadFormadorDoc, removeFormadorDoc,
      bitacoras, addBitacoraEntry, updateBitacoraEntry,
      tasks, signTask, uploadSignedPdf, addTaskDeliverable, setTaskStatus,
      attendance, setStudentAttendance, addAttendanceRecord,
      createProposal, createIncidencia,
      // Superadmin
      trainers, students, pendingRequests, reviewsPublic,
      createCourse, updateCourse, archiveCourse, bulkUpsertCourses,
      approveRequest, rejectRequest,
      validateHours, rejectHours, setTrainerStatus, updateTrainer,
      createStudent, updateStudent, setStudentStatus,
      createJobOffer, updateJobOffer, archiveJobOffer,
      companyConfig, updateCompanyConfig,
      tipologias, addTipologia, removeTipologia,
      closedExpedientes, closeExpediente, returnExpediente,
      // Alumno
      enrollments, diplomas, jobs, applications, reviews, payments, favorites,
      badges: BADGES, testimonials: MOCK_TESTIMONIALS, stats: MOCK_STATS, faq: MOCK_FAQ,
      enrollInCourse, advanceProgress, completeEnrollment,
      toggleFavorite, submitReview,
      applyToJob, withdrawApplication,
      updateProfile, uploadCV, validateDiscount,
      markOneNotifRead,
      checkoutCourse, setCheckoutCourse, detailCourseId, setDetailCourseId,
      onboardingDone, completeOnboarding, cookiesAccepted, acceptCookies,
      // Flag expuesta al UI por si algun componente quiere mostrar "modo demo"
      isSupabaseMode: USE_SUPABASE,
      // ── Supabase overrides: si la api esta cargada, sustituyen a los mocks ──
      ...sbActions,
    },
  }, children);
}

// ─── Globals ─────────────────────────────────────────────────────────────────
window.AppContext       = AppContext;
window.AppProvider      = AppProvider;
window.COLORS           = COLORS;
window.COMPANY          = COMPANY;
window.LEGAL_TEXTS      = LEGAL_TEXTS;
window.getTheme         = getTheme;
window.sanitize         = sanitize;
window.DEMO_CREDENTIALS = DEMO_CREDENTIALS;
window.MOCK_COURSES     = MOCK_COURSES;
