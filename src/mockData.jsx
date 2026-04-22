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

// ─── Catálogo (sincronizado con csaformacion.com) ────────────────────────────
const CATALOG = [
  { area: 'Área técnica', sub: 'Movilizaciones',          title: 'MOVILIZACIÓN SEGURA CON GRÚAS PARA EL TRASLADO DE PERSONAS',                     subtitle: 'Profesionales de atención directa en residencias, auxiliares, gerocultores, fisioterapeutas, terapeuta ocupacional, enfermeros.' },
  { area: 'Área técnica', sub: 'Movilizaciones',          title: 'PREVENCIÓN DE CAÍDAS EN PERSONAS MAYORES Y DEPENDIENTES',                        subtitle: 'Prevenir caídas es preservar vidas: conocimiento y acción para un envejecimiento seguro, saludable y activo.' },
  { area: 'Área técnica', sub: 'Movilizaciones',          title: 'MOVILIZACIONES SEGURAS',                                                          subtitle: 'Mover con respeto, cuidar con técnica: seguridad y dignidad en cada movilización.' },
  { area: 'Área técnica', sub: 'Movilizaciones',          title: 'MEDIDAS ALTERNATIVAS AL USO DE SUJECIONES',                                       subtitle: 'Más libertad, más dignidad: cuidar sin sujeciones es cuidar mejor.' },
  { area: 'Área técnica', sub: 'Movilizaciones',          title: 'INTERVENCIÓN ANTE LAS CAÍDAS DEL PACIENTE COMPLEJO',                              subtitle: 'Anticiparse a la caída es proteger la vida: prevención, valoración y acción a tiempo.' },
  { area: 'Área técnica', sub: 'Movilizaciones',          title: 'INTERVENCIÓN ANTE LAS CAÍDAS DEL ADULTO MAYOR',                                   subtitle: 'Prevenir hoy para no lamentar mañana: seguridad y cuidado ante las caídas.' },
  { area: 'Área técnica', sub: 'Atención médica y cuidados', title: 'MARCHA NORMAL Y MARCHA PATOLÓGICA DEL/LA NIÑO/A CON ALTERACIONES NEURO-MUSCULOESQUELÉTICAS', subtitle: 'De la evaluación de la marcha a la ortesis funcional: herramientas clave para mejorar la movilidad infantil.' },
  { area: 'Área técnica', sub: 'Atención médica y cuidados', title: 'NEUROFISIOLOGÍA EN NIÑOS/AS CON TRASTORNOS NEURO-MÚSCULO ESQUELÉTICOS',        subtitle: 'Del cerebro al movimiento: aprende a intervenir con precisión en niños con trastornos neuromúsculo-esqueléticos.' },
  { area: 'Área técnica', sub: 'Atención médica y cuidados', title: 'PODOLOGÍA — PROTEGER LA SALUD DESDE LA BASE',                                  subtitle: 'Detectar, prevenir y cuidar: la clave en el manejo del pie de riesgo.' },
  { area: 'Área técnica', sub: 'Atención médica y cuidados', title: 'MÚSICA Y CONEXIÓN. LA MÚSICA COMO HERRAMIENTA TERAPÉUTICA EN EL CUIDADO',      subtitle: 'Eleva la calidad de tus cuidados integrando la musicoterapia como una herramienta clave para la salud emocional.' },
  { area: 'Área técnica', sub: 'Atención médica y cuidados', title: 'ABORDAJE POSITIVO DE LOS TRASTORNOS DE CONDUCTA',                              subtitle: 'Transforma el desafío en oportunidad: herramientas prácticas para un abordaje humano, positivo y eficaz.' },
  { area: 'Área técnica', sub: 'Acompañamiento',          title: 'SKIN CARE COMO PRÁCTICA DE AUTOCUIDADO Y AUTOPERCEPCIÓN SALUDABLE',                subtitle: 'Autocuidado consciente frente al espejo.' },
  { area: 'Área técnica', sub: 'Acompañamiento',          title: 'SENTIR PARA CONECTAR: LA SENSOBIOGRAFÍA COMO PUENTE RELACIONAL',                  subtitle: 'Más allá de los cuidados, conecta con su esencia: transforma la atención en un diálogo de sentidos.' },
  { area: 'Área técnica', sub: 'Ética',                   title: 'ATENCIÓN LGTBI+ Y NECESIDADES SEXUALES EN RESIDENCIAS DE PERSONAS MAYORES',       subtitle: 'Cuidar es respetar la historia de vida de cada persona.' },
  { area: 'Área técnica', sub: 'Ética',                   title: 'HACIA UN MODELO DE ATENCIÓN LIBRE DE SUJECIONES',                                 subtitle: 'La verdadera seguridad no sujeta, acompaña.' },
  { area: 'Área técnica', sub: 'Voluntariado',            title: 'COORDINACIÓN DE EQUIPOS DE VOLUNTARIADO',                                         subtitle: 'Coordinar el voluntariado es multiplicar el impacto: gestión, organización y corazón en acción.' },
  { area: 'Área técnica', sub: 'Voluntariado',            title: 'VOLUNTARIADO Y DISCAPACIDAD',                                                     subtitle: 'Acompañar con respeto es transformar vidas: voluntariado inclusivo que hace la diferencia.' },
  { area: 'Área técnica', sub: 'Voluntariado',            title: 'INTRODUCCIÓN AL VOLUNTARIADO',                                                    subtitle: 'Conocer tus derechos y deberes es el primer paso para transformar vidas a través del voluntariado.' },
  { area: 'Área técnica', sub: 'Nutrición',               title: 'NUTRICIÓN',                                                                       subtitle: 'Alimentarse bien es cuidar mejor: nutrición segura y consciente para una vejez saludable.' },
  { area: 'Área técnica', sub: 'Nutrición',               title: 'TÉCNICAS CULINARIAS',                                                             subtitle: 'Cocinar bien también es cuidar: técnica, sabor y nutrición al servicio de las personas.' },
  { area: 'Competencias', sub: 'Liderazgo y Trabajo en equipo', title: 'ARMONÍA EN LA GESTIÓN. LA MÚSICA COMO HERRAMIENTA PARA LA COHESIÓN Y EL LIDERAZGO DE EQUIPOS', subtitle: 'La música como herramienta para la cohesión de equipos.' },
  { area: 'Competencias', sub: 'Liderazgo y Trabajo en equipo', title: 'LA VOZ EN EL LIDERAZGO. REGULANDO LA VOZ Y LAS EMOCIONES PARA UNA GESTIÓN DE EQUIPOS EFECTIVA', subtitle: 'Tu voz no solo comunica: lidera, inspira y transforma.' },
  { area: 'Competencias', sub: 'Liderazgo y Trabajo en equipo', title: 'EL ROL DEL CEO: LIDERAZGO Y DESARROLLO PROFESIONAL',                         subtitle: 'Valores de integridad, comprensión y respeto en el liderazgo.' },
  { area: 'Competencias', sub: 'Liderazgo y Trabajo en equipo', title: 'ORGANIZACIONES SALUDABLES Y SOSTENIBLES',                                   subtitle: 'Mejora del clima, compromiso y productividad organizacional.' },
  { area: 'Competencias', sub: 'Liderazgo y Trabajo en equipo', title: 'EMPODERAMIENTO DE EQUIPOS',                                                 subtitle: 'El juego como herramienta para empoderar equipos.' },
  { area: 'Competencias', sub: 'Liderazgo y Trabajo en equipo', title: 'EFICACIA LABORAL. COMPETENCIAS TRANSVERSALES EN LAS ORGANIZACIONES',        subtitle: 'Aptitudes que mejoran el rendimiento y la eficacia laboral.' },
  { area: 'Competencias', sub: 'Liderazgo y Trabajo en equipo', title: 'LIDERAZGO INTERGENERACIONAL',                                               subtitle: 'Liderar con comprensión generacional transforma la diversidad.' },
  { area: 'Competencias', sub: 'Liderazgo y Trabajo en equipo', title: 'GESTIÓN DE CONFLICTOS',                                                     subtitle: 'Transformar retos en oportunidades de crecimiento.' },
  { area: 'Competencias', sub: 'Liderazgo y Trabajo en equipo', title: 'EQUIPO DE ALTO RENDIMIENTO',                                                subtitle: 'Convertir talento individual en éxito compartido.' },
  { area: 'Competencias', sub: 'Liderazgo y Trabajo en equipo', title: 'COHESIÓN DE EQUIPOS Y LIDERAZGO COMPARTIDO',                                subtitle: 'Un equipo unido transforma retos en logros compartidos.' },
  { area: 'Competencias', sub: 'Competencias Comunicativas',    title: 'INTERVENCIÓN CON FAMILIAS',                                                 subtitle: 'Comunicar con empatía construye puentes en las relaciones.' },
  { area: 'Competencias', sub: 'Competencias Comunicativas',    title: 'HABILIDADES COMUNICATIVAS',                                                 subtitle: 'Comunicar bien es conectar mejor con comprensión.' },
  { area: 'Competencias', sub: 'Competencias Comunicativas',    title: 'GESTIÓN EMOCIONAL Y COMUNICACIÓN DE MALAS NOTICIAS',                        subtitle: 'Comunicar con empatía incluso en los momentos difíciles.' },
  { area: 'ACP y Modelo de Atención', sub: 'ACP',                    title: 'INTRODUCCIÓ A LA TERAPIA BREU — TBCS',                                 subtitle: 'Modelo de intervención transformador centrado en recursos y potencial.' },
  { area: 'ACP y Modelo de Atención', sub: 'ACP',                    title: 'COMUNICACIÓN ASERTIVA PARA PROMOVER UNA CULTURA DEL DIÁLOGO SALUDABLE',subtitle: 'Crea un clima de respeto para una comunicación productiva y eficaz.' },
  { area: 'ACP y Modelo de Atención', sub: 'Perspectiva de género',  title: 'VIOLENCIA MACHISTA',                                                   subtitle: 'Actuar contra la violencia machista protegiendo vidas.' },
  { area: 'ACP y Modelo de Atención', sub: 'Perspectiva de género',  title: 'SALUD MENTAL CON PERSPECTIVA DE GÉNERO',                               subtitle: 'Garantizar justicia, comprensión y apoyo para todas las mujeres.' },
  { area: 'ACP y Modelo de Atención', sub: 'Perspectiva de género',  title: 'PROMOCIÓN PARA LA IGUALDAD EFECTIVA ENTRE MUJERES Y HOMBRES',          subtitle: 'Transformar conocimiento en acción sin discriminación de género.' },
  { area: 'ACP y Modelo de Atención', sub: 'ACP',                    title: 'VIOLÈNCIA MASCLISTA',                                                  subtitle: 'Actuar contra la violencia protegiendo vidas con justicia.' },
  { area: 'ACP y Modelo de Atención', sub: 'ACP',                    title: 'IMPLEMENTACIÓN DE ACP',                                                subtitle: 'Poner a la persona en el centro transformando el cuidado en dignidad.' },
  { area: 'ACP y Modelo de Atención', sub: 'ACP',                    title: 'SENSIBILIZACIÓN EN EL MODELO ACP',                                     subtitle: 'Colocar a la persona en el centro con respeto y bienestar.' },
  { area: 'ACP y Modelo de Atención', sub: 'ACP',                    title: 'PREVENCIÓ, DETECCIÓ E INTERVENCIÓ EN CASOS DE MALTRACTAMENT A PERSONES GRANS', subtitle: 'Garantizar seguridad, dignidad y respeto para los mayores.' },
  { area: 'ACP y Modelo de Atención', sub: 'ACP',                    title: 'PLAN DE ATENCIÓN Y VIDA',                                              subtitle: 'Planificar la vida poniendo verdaderamente a la persona en el centro.' },
  { area: 'ACP y Modelo de Atención', sub: 'ACP',                    title: 'HUMANIZACIÓN EN ASISTENCIA SANITARIA',                                 subtitle: 'Transformar la atención en respeto, empatía y dignidad.' },
  { area: 'ACP y Modelo de Atención', sub: 'ACP',                    title: 'HUMANIZACIÓN EN ASISTENCIA SOCIOSANITARIA PARA ADULTOS CON ENFERMEDAD MENTAL', subtitle: 'Reconocer el valor, la voz y el derecho a decidir en cada persona.' },
  { area: 'ACP y Modelo de Atención', sub: 'ACP',                    title: 'FISIOTERAPEANDO CON EL JUEGO',                                         subtitle: 'Unir fisioterapia y juego en una rehabilitación motivadora.' },
  { area: 'ACP y Modelo de Atención', sub: 'ACP',                    title: 'ENTORNOS SEGUROS Y PROTECTORES CON ADULTOS VULNERABLES',               subtitle: 'Proteger la dignidad construyendo entornos de confianza.' },
  { area: 'ACP y Modelo de Atención', sub: 'ACP',                    title: 'BUENAS PRÁCTICAS ASISTENCIALES',                                       subtitle: 'Cuidar con profesionalidad, respeto y cercanía.' },
  { area: 'Área de autocuidados', sub: 'Seguridad laboral y protocolos', title: 'PREVENCIÓN DE PANDEMIAS Y EMERGENCIA EN ENTORNOS RESIDENCIALES',     subtitle: 'Formación avanzada en prevención de pandemias para cuidados residenciales.' },
  { area: 'Área de autocuidados', sub: 'Bienestar emocional y autocuidado', title: 'JOURNALING TERAPÉUTICO',                                        subtitle: 'Método de autocuidado mental mediante la escritura.' },
  { area: 'Área de autocuidados', sub: 'Bienestar emocional y autocuidado', title: 'DÉTOX — DESCONEXIÓN DIGITAL',                                   subtitle: 'Una forma de autocuidado digital sin pantallas.' },
  { area: 'Área de autocuidados', sub: 'Bienestar emocional y autocuidado', title: 'MOVE YOUR EMOTIONS. MOVIMIENTO CONSCIENTE Y TRANSFORMACIÓN EMOCIONAL', subtitle: 'El movimiento como herramienta profesional para transformar emociones.' },
  { area: 'Área de autocuidados', sub: 'Bienestar emocional y autocuidado', title: 'EXPRESIÓN CREATIVA EN SALUD. ARTE Y ARTETERAPIA EN EL CUIDADO INTEGRAL', subtitle: 'El arte como acompañamiento y transformación en el cuidado integral.' },
  { area: 'Área de autocuidados', sub: 'Bienestar emocional y autocuidado', title: 'DANZANDO EL BIENESTAR. MÚSICA Y MOVIMIENTO TERAPÉUTICO EN EL CUIDADO INTEGRAL', subtitle: 'Música y movimiento como herramientas de salud.' },
  { area: 'Área de autocuidados', sub: 'Bienestar emocional y autocuidado', title: 'LA INFLUENCIA DE LA MÚSICA EN EL BIENESTAR EMOCIONAL',           subtitle: 'La música como aliada para la salud mental y la reducción del estrés.' },
  { area: 'Área de autocuidados', sub: 'Bienestar emocional y autocuidado', title: 'RISOTERAPIA. EL PODER DE LA RISA EN EL BIENESTAR DIARIO',        subtitle: 'Estimulación del sistema nervioso mediante la risa.' },
  { area: 'Área de autocuidados', sub: 'Bienestar emocional y autocuidado', title: 'RESPIRA, VIVE EL ARTE DE ESTAR PRESENTE',                       subtitle: 'Práctica de mindfulness para cultivar la estabilidad mental.' },
  { area: 'Área de autocuidados', sub: 'Seguridad laboral y protocolos',    title: 'PREVENCIÓN CONTRA EL ACOSO LABORAL E IGUALDAD',                 subtitle: 'Prevención del acoso para garantizar respeto y bienestar laboral.' },
  { area: 'Área de autocuidados', sub: 'Seguridad laboral y protocolos',    title: 'PLAN DE DEMOCRATIZACIÓN EMPRESARIAL CONTRA EL ACOSO Y LA VIOLENCIA EN ESPAÑA', subtitle: 'Construcción de empresas seguras e inclusivas.' },
  { area: 'Área de autocuidados', sub: 'Seguridad laboral y protocolos',    title: 'MEDIDAS DE CONCILIACIÓN Y CORRESPONSABILIDAD EN LA EMPRESA',    subtitle: 'Equilibrio de vidas y responsabilidades empresariales.' },
  { area: 'Área de autocuidados', sub: 'Seguridad laboral y protocolos',    title: 'MEDIDAS DE ACTUACIÓN EN CASO DE EMERGENCIA Y EXTINCIÓN DE INCENDIOS', subtitle: 'Preparación y procedimientos para emergencias.' },
  { area: 'Área de autocuidados', sub: 'Seguridad laboral y protocolos',    title: 'IMPLEMENTACIÓN DEL PLAN DE EMERGENCIAS',                        subtitle: 'Implementación de planes para salvar vidas.' },
  { area: 'Área de autocuidados', sub: 'Ética profesional',                 title: 'LOS ESPACIOS DE REFLEXIÓN ÉTICA EN SERVICIOS SOCIALES Y SANITARIOS (ERESS)', subtitle: 'La ética como brújula en las decisiones de cuidado.' },
  { area: 'Área de autocuidados', sub: 'Ética profesional',                 title: 'INTRODUCCIÓN A LA ÉTICA ASISTENCIAL',                           subtitle: 'La ética transformando actos en respeto y dignidad.' },
  { area: 'Área de autocuidados', sub: 'Bienestar emocional y autocuidado', title: 'TECNOESTRÉS: GESTIÓN DEL TIEMPO Y LADRONES DEL TIEMPO',         subtitle: 'Control del tecnoestrés en un mundo hiperconectado.' },
  { area: 'Área de autocuidados', sub: 'Bienestar emocional y autocuidado', title: 'GESTIÓN DEL TIEMPO',                                            subtitle: 'Control de la productividad y el bienestar personal.' },
  { area: 'Área de autocuidados', sub: 'Bienestar emocional y autocuidado', title: 'GESTIÓN EMOCIONAL',                                             subtitle: 'Conocimiento y gestión emocional para transformar el bienestar.' },
  { area: 'Área de autocuidados', sub: 'Bienestar emocional y autocuidado', title: 'GESTIÓN DEL ESTRÉS',                                            subtitle: 'Transformación de la presión en energía y bienestar.' },
];

const MODALITIES = ['Online', 'Presencial', 'Híbrido'];
const TIMES      = ['09:00 - 14:00', '10:00 - 15:00', '16:00 - 20:00', '17:00 - 20:00'];
const LOCATIONS  = ['Plataforma Zoom', 'Madrid · C/ Gran Vía 45', 'Barcelona · Centro formativo', 'Valencia · C/ Colón 88', 'Google Meet', 'Microsoft Teams', 'Bilbao · Centro CESEA', 'Sevilla · Aula 3'];
const HOURS      = [8, 10, 12, 15, 16, 20];
const PRICES     = [49, 79, 99, 129, 149, 179, 199, 249];
const LEVELS     = ['Básico', 'Intermedio', 'Avanzado'];

const INSTRUCTORS = [
  'Aurora Martínez', 'Jesús Santiago', 'María Elena',             // reales
  'Ana García López', 'Luis Mendoza Vargas', 'Marta Ibáñez Reyes', 'Jorge Pascual Torres',
];

const OFFICIAL_TITLES = new Set([
  'TÉCNICAS CULINARIAS',
  'HUMANIZACIÓN EN ASISTENCIA SANITARIA',
  'PLAN DE ATENCIÓN Y VIDA',
  'NUTRICIÓN',
]);

// MOCK_COURSES — superconjunto de campos para todos los roles.
// FILEMAKER: Tabla Cursos (única para todos los roles).
const MOCK_COURSES = CATALOG.map((c, i) => ({
  id:         i + 1,
  title:      c.title,
  subtitle:   c.subtitle,
  area:       c.area,
  category:   c.sub,
  modality:   MODALITIES[i % MODALITIES.length],
  dates:      '1 enero 2026',
  startDate:  '2026-01-01',
  time:       TIMES[i % TIMES.length],
  location:   LOCATIONS[i % LOCATIONS.length],
  tags:       [c.sub, c.area],
  hours:      HOURS[i % HOURS.length],
  price:      PRICES[i % PRICES.length],
  level:      LEVELS[i % LEVELS.length],
  rating:     +(3.8 + ((i * 7) % 12) / 10).toFixed(1),
  students:   120 + ((i * 17) % 380),
  instructor: INSTRUCTORS[i % INSTRUCTORS.length],
  official:   OFFICIAL_TITLES.has(c.title),
  // Estado solo relevante para formador; los alumnos ven todos como "available".
  status:     i < 3 ? 'available' : i < 6 ? 'accepted' : i < 8 ? 'review' : i < 10 ? 'completed' : 'available',
}));

// ─── Horas impartidas (formador) ─────────────────────────────────────────────
const MOCK_HOURS_LOG = [
  { id: 'H-2026-001', course: 'MOVILIZACIÓN SEGURA CON GRÚAS PARA EL TRASLADO DE PERSONAS', area: 'Área técnica', date: '08/01/2026', hours: 8,  modality: 'Presencial', status: 'Validado' },
  { id: 'H-2026-002', course: 'SENTIR PARA CONECTAR: LA SENSOBIOGRAFÍA COMO PUENTE RELACIONAL', area: 'Área técnica', date: '14/01/2026', hours: 10, modality: 'Online',     status: 'Validado' },
  { id: 'H-2026-003', course: 'GESTIÓN DE CONFLICTOS',                                             area: 'Competencias',   date: '22/01/2026', hours: 12, modality: 'Híbrido',    status: 'Validado' },
  { id: 'H-2026-004', course: 'IMPLEMENTACIÓN DE ACP',                                             area: 'ACP y Modelo de Atención', date: '05/02/2026', hours: 15, modality: 'Presencial', status: 'Validado' },
  { id: 'H-2026-005', course: 'GESTIÓN DEL ESTRÉS',                                                area: 'Área de autocuidados',     date: '18/02/2026', hours: 8,  modality: 'Online',     status: 'Validado' },
  { id: 'H-2026-006', course: 'HABILIDADES COMUNICATIVAS',                                         area: 'Competencias',   date: '03/03/2026', hours: 10, modality: 'Presencial', status: 'Pendiente' },
  { id: 'H-2026-007', course: 'ATENCIÓN LGTBI+ Y NECESIDADES SEXUALES EN RESIDENCIAS DE PERSONAS MAYORES', area: 'Área técnica', date: '12/03/2026', hours: 8,  modality: 'Online',     status: 'Pendiente' },
  { id: 'H-2026-008', course: 'RISOTERAPIA. EL PODER DE LA RISA EN EL BIENESTAR DIARIO',           area: 'Área de autocuidados',     date: '25/03/2026', hours: 6,  modality: 'Presencial', status: 'Pendiente' },
  { id: 'H-2026-009', course: 'HUMANIZACIÓN EN ASISTENCIA SANITARIA',                              area: 'ACP y Modelo de Atención', date: '04/04/2026', hours: 12, modality: 'Híbrido',    status: 'Validado' },
  { id: 'H-2026-010', course: 'COHESIÓN DE EQUIPOS Y LIDERAZGO COMPARTIDO',                        area: 'Competencias',   date: '15/04/2026', hours: 10, modality: 'Online',     status: 'En revisión' },
];

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

// ─── Formadores (vista superadmin) ───────────────────────────────────────────
const MOCK_TRAINERS = [
  { id: 'F-R01', name: 'Aurora Martínez',         email: 'aurora.martinez@csaformacion.com',  specialty: 'Dirección de marketing',            hoursYTD:  42, status: 'Activo',     joinDate: '2024-05-12', photo: 'assets/formadores/aurora.png',         dni: '***945B', iban: 'ES51 **** **** **** ****4321', official: true },
  { id: 'F-R02', name: 'Jesús Santiago',          email: 'jesus.santiago@csaformacion.com',   specialty: 'Prótesis dental',                   hoursYTD:  96, status: 'Activo',     joinDate: '2023-11-02', photo: 'assets/formadores/jesus-santiago.png', dni: '***128J', iban: 'ES12 **** **** **** ****7788', official: true },
  { id: 'F-R03', name: 'María Elena',             email: 'maria.elena@csaformacion.com',      specialty: 'Medicina odontológica',             hoursYTD: 144, status: 'Activo',     joinDate: '2023-04-15', photo: 'assets/formadores/maria-elena.png',    dni: '***602M', iban: 'ES98 **** **** **** ****1134', official: true },
  { id: 'F-001', name: 'Ana García López',        email: 'ana.garcia@formador.com',           specialty: 'Acompañamiento, Competencias, ACP', hoursYTD:  90, status: 'Activo',     joinDate: '2025-01-15', photo: null,                                   dni: '***945B', iban: 'ES51 **** **** **** ****4321', official: false },
  { id: 'F-002', name: 'Luis Mendoza Vargas',     email: 'luis.mendoza@formador.com',         specialty: 'Movilizaciones, Atención médica',   hoursYTD:  72, status: 'Activo',     joinDate: '2024-11-02', photo: null,                                   dni: '***412V', iban: 'ES44 **** **** **** ****5566', official: false },
  { id: 'F-003', name: 'Marta Ibáñez Reyes',      email: 'marta.ibanez@formador.com',         specialty: 'Liderazgo, Gestión de equipos',     hoursYTD: 128, status: 'Activo',     joinDate: '2024-06-20', photo: null,                                   dni: '***779R', iban: 'ES77 **** **** **** ****8899', official: false },
  { id: 'F-004', name: 'Jorge Pascual Torres',    email: 'jorge.pascual@formador.com',        specialty: 'ACP, Humanización',                 hoursYTD:  54, status: 'Activo',     joinDate: '2025-02-10', photo: null,                                   dni: '***224T', iban: 'ES61 **** **** **** ****1032', official: false },
  { id: 'F-005', name: 'Elena Soriano Quintana',  email: 'elena.soriano@formador.com',        specialty: 'Nutrición, Técnicas culinarias',    hoursYTD:  38, status: 'En pausa',   joinDate: '2024-09-05', photo: null,                                   dni: '***515Q', iban: 'ES22 **** **** **** ****2211', official: false },
  { id: 'F-006', name: 'Rubén Castillo Navarro',  email: 'ruben.castillo@formador.com',       specialty: 'Autocuidados, Bienestar emocional', hoursYTD:  64, status: 'Activo',     joinDate: '2025-03-12', photo: null,                                   dni: '***881N', iban: 'ES88 **** **** **** ****4455', official: false },
  { id: 'F-007', name: 'Sofía Vargas Herrera',    email: 'sofia.vargas@formador.com',         specialty: 'Voluntariado, Ética',               hoursYTD:  22, status: 'Pendiente',  joinDate: '2026-04-01', photo: null,                                   dni: '***073H', iban: 'ES14 **** **** **** ****9900', official: false },
];

// ─── Solicitudes pendientes (superadmin) ─────────────────────────────────────
const MOCK_PENDING_REQUESTS = [
  { id: 'R-001', type: 'change',   trainer: 'Luis Mendoza Vargas',    courseTitle: 'MOVILIZACIONES SEGURAS',       detail: 'Solicita cambio de fecha: del 14/05 al 21/05', date: '2026-04-18' },
  { id: 'R-002', type: 'new',      trainer: 'Marta Ibáñez Reyes',     courseTitle: 'GESTIÓN DE CONFLICTOS',        detail: 'Acepta impartir la oferta',                     date: '2026-04-19' },
  { id: 'R-003', type: 'hours',    trainer: 'Jorge Pascual Torres',   courseTitle: 'IMPLEMENTACIÓN DE ACP',        detail: 'Reporta 15h impartidas el 05/02/2026',          date: '2026-04-20' },
  { id: 'R-004', type: 'register', trainer: 'Sofía Vargas Herrera',   courseTitle: '—',                             detail: 'Solicitud de alta como formadora',              date: '2026-04-21' },
];

// ─── Bitácora, tareas, asistencia (formador) ─────────────────────────────────
const MOCK_BITACORAS = [
  { id: 'B-001', courseId: 4, sessionDate: '2026-04-18', timeFrom: '09:00', timeTo: '14:00', incidents: 'Una alumna salió 30 min antes por urgencia familiar. Todos los ejercicios se completaron.', notes: 'Grupo muy participativo. Se ampliará el módulo 3 con más casos prácticos la próxima sesión.', present: 12, total: 14 },
  { id: 'B-002', courseId: 4, sessionDate: '2026-04-25', timeFrom: '09:00', timeTo: '14:00', incidents: 'Sin incidencias reseñables.', notes: 'Cierre del programa completado. Buen nivel en los ejercicios finales.', present: 13, total: 14 },
  { id: 'B-003', courseId: 7, sessionDate: '2026-04-20', timeFrom: '16:00', timeTo: '20:00', incidents: 'Problema puntual con el micrófono del aula. Resuelto a los 15 min.', notes: 'Excelente debate sobre casos reales aportados por los asistentes.', present: 9, total: 10 },
];

const MOCK_TASKS = [
  { id: 'T-001', type: 'consultoria', title: 'Auditoría modelo ACP residencia Los Olivos', client: 'Residencia Los Olivos', clientContact: 'direccion@residencialosolivos.es', location: 'Valencia', startDate: '2026-05-10', endDate: '2026-05-14', amount: 2800, status: 'contrato_pendiente', contractPdf: 'contratos/T-001-Auditoria-Los-Olivos.pdf', signatureImg: null, signedPdf: null, attachments: [{ name: 'Briefing_cliente.pdf', uploadedBy: 'superadmin', date: '2026-04-20', size: '1.2 MB' }, { name: 'Cuestionario_inicial.pdf', uploadedBy: 'superadmin', date: '2026-04-20', size: '340 KB' }], deliverables: [], description: 'Auditoría del modelo de Atención Centrada en la Persona. Revisión de procesos, entrevistas con equipo y redacción de informe final con recomendaciones.' },
  { id: 'T-002', type: 'sesion',      title: 'Sesión de mentoring equipo dirección',       client: 'Centro Activa Bilbao',  clientContact: 'rrhh@centroactiva.com',            location: 'Bilbao (híbrido)', startDate: '2026-04-28', endDate: '2026-04-28', amount: 350,  status: 'firmada',             contractPdf: 'contratos/T-002-Mentoring-Activa.pdf',  signatureImg: null, signedPdf: 'contratos/T-002-FIRMADO.pdf', attachments: [{ name: 'Perfiles_participantes.pdf', uploadedBy: 'superadmin', date: '2026-04-15', size: '220 KB' }], deliverables: [], description: 'Sesión de 3 horas de coaching grupal con el equipo directivo.' },
  { id: 'T-003', type: 'consultoria', title: 'Implementación protocolos movilizaciones seguras', client: 'Hospital Santa Clara', clientContact: 'formacion@santaclara.es',      location: 'Madrid', startDate: '2026-03-01', endDate: '2026-03-28', amount: 4200, status: 'completada',          contractPdf: 'contratos/T-003-Santa-Clara.pdf',       signatureImg: null, signedPdf: 'contratos/T-003-FIRMADO.pdf', attachments: [{ name: 'Informe_situacion_inicial.pdf', uploadedBy: 'superadmin', date: '2026-02-20', size: '1.8 MB' }], deliverables: [{ name: 'Informe_final_T-003.pdf', uploadedAt: '2026-03-30', size: '2.1 MB' }], description: 'Diseño e implementación de protocolos de movilizaciones seguras.' },
  { id: 'T-004', type: 'sesion',      title: 'Supervisión de caso — acompañamiento final de vida', client: 'Residencia San Rafael', clientContact: 'coordinacion@sanrafael.com', location: 'Sevilla', startDate: '2026-05-05', endDate: '2026-05-05', amount: 280, status: 'asignada', contractPdf: null, signatureImg: null, signedPdf: null, attachments: [], deliverables: [], description: 'Supervisión profesional a coordinación del centro.' },
];

const MOCK_ATTENDANCE = [
  { id: 'AT-001', courseId: 4, sessionDate: '2026-04-18', records: [
    { studentId: 'A-1001', studentName: 'María López Serrano',     status: 'asiste',    origin: 'match',  notes: '' },
    { studentId: 'A-1002', studentName: 'Javier Ruiz Márquez',     status: 'parcial',   origin: 'manual', notes: 'Llegó 15 min tarde' },
    { studentId: 'A-1003', studentName: 'Laura Sánchez',           status: 'asiste',    origin: 'manual', notes: '' },
    { studentId: 'A-1004', studentName: 'Diego Fernández',         status: 'no_asiste', origin: 'manual', notes: 'Aviso por email' },
  ] },
];

// ─── Inscripciones alumno ────────────────────────────────────────────────────
const MOCK_ENROLLMENTS = [
  { id: 'E-001', courseId: 1,  status: 'en_progreso', progress: 65, enrolledAt: '2026-01-10', lastAccess: '2026-04-18', nextSession: '2026-04-25 10:00' },
  { id: 'E-002', courseId: 9,  status: 'en_progreso', progress: 30, enrolledAt: '2026-02-05', lastAccess: '2026-04-15', nextSession: '2026-04-27 16:00' },
  { id: 'E-003', courseId: 14, status: 'completado',  progress: 100,enrolledAt: '2025-11-02', lastAccess: '2026-01-20', completedAt: '2026-01-20' },
  { id: 'E-004', courseId: 22, status: 'completado',  progress: 100,enrolledAt: '2025-09-15', lastAccess: '2025-12-10', completedAt: '2025-12-10' },
  { id: 'E-005', courseId: 33, status: 'completado',  progress: 100,enrolledAt: '2025-07-01', lastAccess: '2025-09-08', completedAt: '2025-09-08' },
  { id: 'E-006', courseId: 48, status: 'inscrito',    progress: 0,  enrolledAt: '2026-04-10', lastAccess: null, nextSession: '2026-05-02 09:00' },
];

const MOCK_DIPLOMAS = [
  { id: 'D-001', enrollmentId: 'E-003', courseId: 14, title: 'ATENCIÓN LGTBI+ Y NECESIDADES SEXUALES EN RESIDENCIAS DE PERSONAS MAYORES', issueDate: '2026-01-20', hours: 16, code: 'CESEA-2026-00014', grade: 'Apto con distinción' },
  { id: 'D-002', enrollmentId: 'E-004', courseId: 22, title: 'LA VOZ EN EL LIDERAZGO. REGULANDO LA VOZ Y LAS EMOCIONES PARA UNA GESTIÓN DE EQUIPOS EFECTIVA', issueDate: '2025-12-10', hours: 12, code: 'CESEA-2025-00082', grade: 'Apto' },
  { id: 'D-003', enrollmentId: 'E-005', courseId: 33, title: 'COMUNICACIÓN ASERTIVA PARA PROMOVER UNA CULTURA DEL DIÁLOGO SALUDABLE', issueDate: '2025-09-08', hours: 10, code: 'CESEA-2025-00047', grade: 'Apto con distinción' },
];

// ─── Empleo + postulaciones ──────────────────────────────────────────────────
const MOCK_JOB_OFFERS = [
  { id: 'J-001', sector: 'dental',  title: 'Higienista dental',              company: 'Clínica Dental Sonrisa',  location: 'Madrid',    modality: 'Presencial', salary: '22.000 – 26.000 €/año', hours: 'Jornada completa', posted: '2026-04-18', desc: 'Clínica en expansión busca higienista con experiencia en ortodoncia.' },
  { id: 'J-002', sector: 'dental',  title: 'Auxiliar de odontología',        company: 'Odontocenter Málaga',     location: 'Málaga',    modality: 'Presencial', salary: '18.000 – 21.000 €/año', hours: 'Jornada completa', posted: '2026-04-15', desc: 'Se requiere FP auxiliar de enfermería. Formación interna continua.' },
  { id: 'J-003', sector: 'dental',  title: 'Recepcionista clínica',          company: 'Dental Premium Barcelona',location: 'Barcelona', modality: 'Presencial', salary: '1.450 €/mes',           hours: '30h/semana',       posted: '2026-04-11', desc: 'Perfil orientado al paciente, con experiencia y nociones de facturación.' },
  { id: 'J-004', sector: 'sanidad', title: 'Enfermero/a en residencia',      company: 'Residencia Los Olivos',   location: 'Valencia',  modality: 'Presencial', salary: '28.000 – 32.000 €/año', hours: 'Turno mañana',     posted: '2026-04-17', desc: 'Residencia geriátrica busca enfermero/a con formación en ACP.' },
  { id: 'J-005', sector: 'sanidad', title: 'Gerocultor/a',                    company: 'Centro San Rafael',       location: 'Sevilla',   modality: 'Presencial', salary: '1.280 €/mes',           hours: 'Turno rotativo',   posted: '2026-04-14', desc: 'Cuidado integral a personas mayores, movilizaciones seguras.' },
  { id: 'J-006', sector: 'sanidad', title: 'Fisioterapeuta geriátrico',       company: 'Centro Activa',           location: 'Bilbao',    modality: 'Híbrido',   salary: '30.000 €/año',          hours: 'Jornada completa', posted: '2026-04-09', desc: 'Atención a pacientes con patologías neuromusculoesqueléticas.' },
  { id: 'J-007', sector: 'dental',  title: 'Protésico/a dental',             company: 'Laboratorio DentaLab',    location: 'Zaragoza',  modality: 'Presencial', salary: 'Según valía',           hours: 'Jornada completa', posted: '2026-04-05', desc: 'Laboratorio consolidado busca protésico con experiencia en CAD/CAM.' },
  { id: 'J-008', sector: 'sanidad', title: 'Auxiliar de enfermería noche',   company: 'Hospital Santa Clara',    location: 'Madrid',    modality: 'Presencial', salary: '1.500 €/mes + pluses',  hours: 'Turno noche',      posted: '2026-04-03', desc: 'Unidad de hospitalización, pluses de festividad y nocturnidad.' },
];

const MOCK_APPLICATIONS = [
  { id: 'AP-001', jobId: 'J-001', status: 'entrevista', date: '2026-04-19', lastUpdate: '2026-04-21', notes: 'Entrevista presencial el 28/04 a las 11:00' },
  { id: 'AP-002', jobId: 'J-003', status: 'visto',      date: '2026-04-16', lastUpdate: '2026-04-17', notes: 'CV revisado por RRHH' },
];

// ─── Reseñas + pagos + descuentos ────────────────────────────────────────────
const MOCK_REVIEWS = [
  { id: 'R-001', courseId: 14, rating: 5, comment: 'Imprescindible. Cambia la forma de mirar el cuidado.',       date: '2026-01-22' },
  { id: 'R-002', courseId: 22, rating: 4, comment: 'Muy útil para reuniones de equipo. Ejercicios prácticos.',   date: '2025-12-15' },
  { id: 'R-003', courseId: 33, rating: 5, comment: 'La profesora explica de maravilla. Recomendado al 100%.',    date: '2025-09-10' },
];

const MOCK_PAYMENTS = [
  { id: 'P-001', enrollmentId: 'E-001', amount: 149, method: 'tarjeta',      date: '2026-01-10', status: 'confirmado', invoiceNo: 'CESEA-F-2026-0112' },
  { id: 'P-002', enrollmentId: 'E-002', amount: 99,  method: 'bizum',        date: '2026-02-05', status: 'confirmado', invoiceNo: 'CESEA-F-2026-0418' },
  { id: 'P-003', enrollmentId: 'E-003', amount: 79,  method: 'transferencia',date: '2025-11-02', status: 'confirmado', invoiceNo: 'CESEA-F-2025-1842' },
  { id: 'P-004', enrollmentId: 'E-004', amount: 179, method: 'tarjeta',      date: '2025-09-15', status: 'confirmado', invoiceNo: 'CESEA-F-2025-1320' },
  { id: 'P-005', enrollmentId: 'E-005', amount: 49,  method: 'tarjeta',      date: '2025-07-01', status: 'confirmado', invoiceNo: 'CESEA-F-2025-0890' },
  { id: 'P-006', enrollmentId: 'E-006', amount: 129, method: 'bizum',        date: '2026-04-10', status: 'confirmado', invoiceNo: 'CESEA-F-2026-2105' },
];

const DISCOUNT_CODES = {
  'BIENVENIDA10': { percent: 10, label: '10% de bienvenida' },
  'CESEA20':      { percent: 20, label: '20% de alumno CESEA' },
  'VERANO25':     { percent: 25, label: '25% campaña de verano' },
};

// ─── Notificaciones por rol ──────────────────────────────────────────────────
const MOCK_NOTIFICATIONS_FORMADOR = [
  { id: 1, text: 'Nueva oferta disponible: Podología — Proteger la salud desde la base', read: false },
  { id: 2, text: 'Tus horas de enero han sido validadas por administración',              read: false },
  { id: 3, text: 'Recuerda completar el cierre de formación pendiente',                    read: true  },
];
const MOCK_NOTIFICATIONS_ADMIN = [
  { id: 1, text: '4 solicitudes pendientes de revisión',                                  read: false },
  { id: 2, text: 'Sofía Vargas Herrera ha solicitado alta como formadora',                read: false },
  { id: 3, text: 'Se han reportado 15h nuevas de Jorge Pascual',                          read: true  },
];
const MOCK_NOTIFICATIONS_ALUMNO = [
  { id: 1, icon: '◆',  text: 'Tu diploma de "ATENCIÓN LGTBI+" ya está disponible para descarga',           read: false, date: '2026-04-20' },
  { id: 2, icon: '▲',  text: 'Recuerda: próxima sesión de Movilización Segura el 25/04 a las 10:00',      read: false, date: '2026-04-19' },
  { id: 3, icon: '★',  text: 'Nueva oferta de empleo en tu sector: Higienista dental en Madrid',          read: false, date: '2026-04-18' },
  { id: 4, icon: '◉',  text: 'Pago de 129 € confirmado · inscripción a Skin Care como práctica',           read: true,  date: '2026-04-10' },
  { id: 5, icon: '✓',  text: 'Tu CV ha sido actualizado correctamente',                                    read: true,  date: '2026-02-15' },
];

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
  const [pendingRequests, setPendingRequests] = React.useState(MOCK_PENDING_REQUESTS);
  const [notifAdmin, setNotifAdmin]           = React.useState(MOCK_NOTIFICATIONS_ADMIN);

  // ── Estado ALUMNO ───────────────────────────────────────────────────────────
  const [enrollments, setEnrollments]         = React.useState(MOCK_ENROLLMENTS);
  const [diplomas, setDiplomas]               = React.useState(MOCK_DIPLOMAS);
  const [jobs]                                = React.useState(MOCK_JOB_OFFERS);
  const [applications, setApplications]       = React.useState(MOCK_APPLICATIONS);
  const [reviews, setReviews]                 = React.useState(MOCK_REVIEWS);
  const [payments, setPayments]               = React.useState(MOCK_PAYMENTS);
  const [notifAlumno, setNotifAlumno]         = React.useState(MOCK_NOTIFICATIONS_ALUMNO);
  const [favorites, setFavorites]             = React.useState([2, 9, 14]);
  const [checkoutCourse, setCheckoutCourse]   = React.useState(null);
  const [detailCourseId, setDetailCourseId]   = React.useState(null);
  const [onboardingDone, setOnboardingDone]   = React.useState(false);
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
  const swipeRight = (id) => setCourses(prev => prev.map(c => c.id === id ? { ...c, status: 'review' } : c));
  const swipeLeft  = (id) => setCourses(prev => prev.filter(c => c.id !== id));
  const submitChange = (id, data) => setCourses(prev => prev.map(c => c.id === id ? { ...c, changeRequest: data } : c));
  const addCalendarEvent = (ev) => setCalendarEvents(prev => [...prev, { ...ev, id: Date.now() }]);
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
  const createCourse = (data) => {
    const id = (courses.reduce((m, c) => Math.max(m, c.id), 0) || 0) + 1;
    setCourses(prev => [{ id, status: 'available', tags: [data.category, data.area], modality: 'Online', time: '10:00 - 15:00', location: 'Plataforma Zoom', dates: '1 enero 2026', startDate: '2026-01-01', hours: 8, price: 99, level: 'Básico', rating: 0, students: 0, instructor: 'Por asignar', official: false, ...data }, ...prev]);
  };
  const updateCourse = (id, patch) => setCourses(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  const archiveCourse = (id) => setCourses(prev => prev.map(c => c.id === id ? { ...c, status: 'archived' } : c));
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
      // Superadmin
      trainers, pendingRequests,
      createCourse, updateCourse, archiveCourse,
      approveRequest, rejectRequest,
      validateHours, rejectHours, setTrainerStatus,
      // Alumno
      enrollments, diplomas, jobs, applications, reviews, payments, favorites,
      badges: BADGES, testimonials: MOCK_TESTIMONIALS, stats: MOCK_STATS, faq: MOCK_FAQ,
      enrollInCourse, advanceProgress, completeEnrollment,
      toggleFavorite, submitReview,
      applyToJob, withdrawApplication,
      updateProfile, uploadCV, validateDiscount,
      checkoutCourse, setCheckoutCourse, detailCourseId, setDetailCourseId,
      onboardingDone, completeOnboarding, cookiesAccepted, acceptCookies,
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
