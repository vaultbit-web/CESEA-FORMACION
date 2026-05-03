# CESEA Formación · Estado y pendientes

> Documento vivo con lo hecho, los bloqueadores y lo que falta. Actualizar conforme avanzamos.
>
> **Última actualización:** 2026-05-03

---

## ✅ Hecho hasta hoy

### Datos reales del cliente
- [x] Importados los **35 formadores** del Excel `Datos_Formadores.xlsx` (CIF, nº colegiado, email, teléfono, población)
- [x] Importados los **113 cursos** del Excel `Formadores_Curso.xlsx` con código interno, contenidos, objetivos, ciudades, formadores asignados
- [x] Cruce automático formador↔curso por nombre (32 formadores con `cursos_asignados` poblado)
- [x] Tipologías (14) cargadas

### Funcionalidades en la plataforma
- [x] Validación de fechas (fecha fin ≥ inicio, sesiones consecutivas, auto-sugerencia)
- [x] Selector "1 día / Más de un día" en propuestas formativas
- [x] Código interno como chip en formador y superadmin (no visible para alumno)
- [x] Nº de imparticiones lo fija solo el superadmin (no editable por formador)
- [x] **Registro automático de formadores pre-registrados:** al poner su email, el sistema detecta el match y lo vincula a su perfil con los cursos asignados

### Infraestructura
- [x] Supabase desplegado en VPS Dokploy
- [x] 22 tablas con RLS por rol (alumno/formador/superadmin)
- [x] 4 buckets de Storage (cv, diplomas, firmas, docs-formador)
- [x] Service layer `src/api.jsx` con 47 funciones cubriendo todos los botones
- [x] Modo híbrido: si Supabase responde → usa real; si no → modo demo automático
- [x] 4 usuarios demo creados con login real:
  - `admin@cesea.com` / `admin1234`
  - `ana.garcia@formador.com` / `demo1234`
  - `maria.lopez@alumno.com` / `demo1234`
  - `javier.ruiz@alumno.com` / `demo1234`
- [x] Limpieza completa de mocks falsos (alumnos ficticios, solicitudes inventadas, etc.)
- [x] Auto-deploy a Vercel desde GitHub funcionando

---

## 🚨 Bloqueador actual (resolver primero)

### HTTPS sin certificado válido en Supabase
**Síntoma:** Tras activar el toggle HTTPS en Dokploy, el cert es `TRAEFIK DEFAULT CERT` (auto-firmado). Los navegadores rechazan la conexión y la app está rota desde Vercel y desde local.

**Causa:** Let's Encrypt rate-limita el dominio `*.traefik.me` (compartido por miles de usuarios).

**Solución temporal (10 seg):**
- [ ] **Desactivar el toggle HTTPS en Dokploy** (Domains → Edit → HTTPS off → Update). Vuelve a HTTP-only y la app local funciona inmediatamente.

**Solución definitiva (cuando podamos):**
- [ ] Comprar/usar dominio propio (ej. `supabase.csaformacion.com`)
- [ ] DNS A record → `89.116.38.126`
- [ ] Dokploy: asignar dominio + HTTPS + Let's Encrypt
- [ ] Actualizar `index.html` con el nuevo dominio
- [ ] Verificar que Vercel conecta correctamente

---

## 📋 Pendientes — ordenados por prioridad

### 🟠 Importantes (siguiente sesión)

#### 1. Email de confirmación de registro
**Estado actual:** Desactivado (`ENABLE_EMAIL_AUTOCONFIRM=true` en Dokploy).

**Lo que falta:**
- [ ] Configurar SMTP real (opciones: Resend, Mailgun, SendGrid, AWS SES, o el SMTP del proveedor de email)
- [ ] En Dokploy variables: rellenar `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_ADMIN_EMAIL`, `SMTP_SENDER_NAME`
- [ ] Cambiar `ENABLE_EMAIL_AUTOCONFIRM=false` para que sí se exija confirmación
- [ ] Personalizar plantillas de email en Supabase Studio (Auth → Email Templates):
  - Welcome / Confirm email
  - Reset password
  - Magic link (si se usa)
- [ ] Verificar que el dominio del "from" tenga SPF/DKIM/DMARC configurados (para que no caiga en spam)

#### 2. Reset password
**Estado actual:** Botón "He olvidado mi contraseña" existe pero no envía email (porque SMTP fake).

**Lo que falta:**
- [ ] Conectado automáticamente al activar SMTP del punto anterior
- [ ] Probar el flujo: login → "olvidé contraseña" → recibir email → cambiar contraseña → login con la nueva

#### 3. Verificar flujo completo del formador pre-registrado
**Lo que falta probar:**
- [ ] Usar `mariamillanvi@gmail.com` (María Dolores Millán Vico) para registrarse
- [ ] Verificar que aparece el badge "✓ Formador identificado"
- [ ] Verificar que tras login ve sus cursos asignados (en el Excel tenía `cursosAsignados: []`, hay que comprobar si tiene cursos cruzados)
- [ ] Si no tiene cursos asignados, probar con otro formador como José Luis Buenache (`jbuenache@gmail.com`) que sí tiene 15 cursos cruzados

### 🟡 Medianas (cuando todo arriba esté ok)

#### 4. Dominio propio + SSL definitivo
- [ ] Decidir nombre de dominio (ej. `formacion.csaformacion.com`, `app.cesea.com`, etc.)
- [ ] Comprar si no se posee (Namecheap, Cloudflare, OVH ~10€/año)
- [ ] DNS: subdominio para el frontend (Vercel) + subdominio para Supabase
- [ ] Configurar HTTPS en ambos
- [ ] Probar la integración completa con HTTPS válido

#### 5. Confirmaciones por superadmin
**Lo que falta:**
- [ ] Cuando un formador se autorregistra que NO está en el pre-registro, debería pedir aprobación al superadmin antes de activarse
- [ ] El superadmin debería tener una pantalla "Pendientes de aprobación" donde acepta/rechaza nuevos formadores y nuevos alumnos

#### 6. Realtime (cambios en vivo)
**Estado actual:** Cada acción hace refetch tras enviar (1-2 segundos).

**Mejora:**
- [ ] Activar suscripciones realtime en Supabase para `cursos`, `solicitudes`, `notificaciones`
- [ ] El service layer (`src/api.jsx`) ya soporta realtime — solo activarlo en el `useEffect` de `mockData.jsx`

### 🟢 Largo plazo (cuando esté en producción)

#### 7. Pagos reales
**Estado actual:** Tabla `pagos` existe, función `createPago` registra pero NO cobra.

**Lo que falta:**
- [ ] Decidir proveedor: **Stripe** (más estándar internacional) o **Redsys** (banca española, comisión más baja)
- [ ] Integrar pasarela en el botón "Inscribirme" del alumno
- [ ] Webhook para confirmar pagos
- [ ] Generación automática de factura PDF
- [ ] Numeración secuencial de facturas

#### 8. Generación de diplomas server-side
**Estado actual:** El alumno genera el PDF en su navegador con jsPDF y se sube a Storage.

**Mejora (si alguien hace inspección y cambia el HTML, el PDF se "rompe"):**
- [ ] Edge function en Supabase que genera el PDF en el servidor cuando se completa una matrícula
- [ ] Firma digital del PDF para evitar falsificaciones
- [ ] QR de verificación en el diploma que linkee a una página pública de validación

#### 9. Importación masiva de alumnos
**Lo que falta:**
- [ ] Pantalla en superadmin "Importar alumnos desde CSV"
- [ ] Plantilla descargable
- [ ] Validación: emails únicos, formato correcto

#### 10. Notificaciones push
- [ ] Email automático al alumno cuando su diploma está listo
- [ ] Email al formador cuando su solicitud es aprobada/rechazada
- [ ] Email al superadmin cuando hay nueva solicitud pendiente

#### 11. Dashboard métricas (superadmin)
- [ ] Cursos más vendidos
- [ ] Formadores con mejor rating
- [ ] Ingresos por mes
- [ ] Solicitudes pendientes / resueltas / rechazadas

#### 12. Mobile responsive review
- [ ] Probar todos los flujos en móvil
- [ ] Ajustar dropdowns y modales para tactil
- [ ] Pruebas reales en iOS/Android

### 🔵 Mejoras técnicas (sin urgencia)

- [ ] Tests E2E con Playwright o Cypress
- [ ] CI/CD: lint + tests antes del deploy de Vercel
- [ ] Monitorización: Sentry o similar para errores en producción
- [ ] Backup automático de la base de datos
- [ ] Rate limiting en endpoints sensibles (login, registro)
- [ ] 2FA para superadmin

---

## 🔐 Pendientes de seguridad

- [ ] **Rotar secrets que pasaron por el chat:** `SERVICE_ROLE_KEY`, `POSTGRES_PASSWORD`, `JWT_SECRET`, `DASHBOARD_PASSWORD` (cambiar desde Dokploy → Variables de entorno → Restart)
- [ ] Cambiar contraseñas de los 4 usuarios demo a algo robusto (o crear usuarios reales y eliminar los demo)
- [ ] Configurar CORS en Supabase para que solo acepte el dominio de producción (no `*`)
- [ ] Audit de las RLS policies con un usuario sin permisos para confirmar que no se filtra info

---

## 📂 Archivos de referencia en el repo

| Archivo | Para qué |
|---|---|
| [SUPABASE-SETUP.md](SUPABASE-SETUP.md) | Guía paso a paso de configuración inicial (ya hecho) |
| [migrations/001_schema.sql](migrations/001_schema.sql) | Esquema de la base de datos |
| [migrations/002_rls_storage.sql](migrations/002_rls_storage.sql) | Políticas de seguridad y storage |
| [scripts/migrate-data.mjs](scripts/migrate-data.mjs) | Script de migración (re-ejecutable) |
| [src/api.jsx](src/api.jsx) | Service layer único de toda la app |
| [.env.example](.env.example) | Plantilla de variables locales (el `.env` real está gitignored) |

---

## 📞 Información del despliegue

| Recurso | URL / Acceso |
|---|---|
| **Frontend en Vercel** | https://cesea-formacion.vercel.app |
| **Repositorio GitHub** | https://github.com/vaultbit-web/CESEA-FORMACION |
| **Rama activa** | `feat/ronda-ajustes-abril` |
| **VPS Dokploy** | IP `89.116.38.126` |
| **Supabase URL** | `http://cesea-formacion-supabase-9ccf70-89-116-38-126.traefik.me` (HTTP) |
| **Supabase Studio** | Misma URL, login en credenciales (ver `.env` local) |

---

## 🎯 Para retomar la próxima sesión

1. Leer este documento de arriba a abajo
2. Confirmar el estado del bloqueador (HTTPS) — si se ha desactivado o no
3. Decidir qué punto pendiente abordar (recomiendo el orden de prioridades)
4. Actualizar este documento marcando lo hecho con `[x]` y añadiendo nuevos items que vayan apareciendo
