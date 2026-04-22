# CESEA Formación · Plataforma unificada

Plataforma de formación para **CESEA Formación** (titular: **WISHIT CSA SUPPLY SL**,
CIF B06842256, C/ Gomis 86, Barcelona). Un único punto de entrada que integra
tres roles con sus respectivos paneles:

| Rol            | Funcionalidades |
|----------------|-----------------|
| **Alumno**     | Catálogo, inscripción con checkout, mis cursos, diplomas PDF, bolsa de empleo, perfil, calendario, FAQ |
| **Formador**   | Resumen, ofertas (swipe), calendario, bitácora de sesiones, tareas con firma digital, asistencia, horas impartidas, perfil |
| **Superadmin** | Panel admin, catálogo CRUD, solicitudes pendientes, validación de horas, gestión de formadores |

---

## Arranque rápido

La plataforma **no tiene build step**: se sirve como HTML+JS estático. El
transpilado a ES5 lo hace Babel standalone en el navegador.

```bash
# 1. Clonar
git clone https://github.com/vaultbit-web/CESEA-FORMACION.git
cd CESEA-FORMACION

# 2. Servir (cualquier servidor HTTP estático vale)
python -m http.server 3000
# o
npx serve . -l 3000

# 3. Abrir
http://localhost:3000
```

### Dependencias (solo desarrollo / testing)

```bash
npm install   # instala @babel/core, react, jsdom (solo para scripts de test)
```

---

## Credenciales demo

En producción se eliminarán. En el prototipo permiten acceder con 1 clic desde
las tarjetas del login:

| Rol        | Email                         | Contraseña |
|------------|-------------------------------|------------|
| Alumna     | `maria.lopez@alumno.com`      | `demo1234` |
| Alumno     | `javier.ruiz@alumno.com`      | `demo1234` |
| Formadora  | `ana.garcia@formador.com`     | `demo1234` |
| Superadmin | `admin@cesea.com`             | `admin1234`|

---

## Arquitectura

```
CESEA-FORMACION/
├── index.html                         # Único punto de entrada + router por rol
├── assets/                            # Logotipos + plantilla diploma + fotos reales
│   ├── diploma-template.png           # Plantilla oficial del certificado
│   ├── logotipo-{blanco,color,negro}.png
│   └── formadores/
│       ├── aurora.png                 # Aurora Martínez (real, csaformacion.com)
│       ├── jesus-santiago.png         # Jesús Santiago (real)
│       └── maria-elena.png            # María Elena (real)
└── src/
    ├── mockData.jsx                   # Estado global + AppContext + textos legales reales
    ├── widgets.jsx                    # Widgets compartidos: Pill, Modal, Toast, StarRating…
    ├── attendanceBus.jsx              # Bus cross-role de asistencia (localStorage)
    ├── auth.jsx                       # Login unificado (4 tarjetas demo + formulario)
    │
    ├── layout.jsx                     # ── FORMADOR: shell + TopNav + Dashboard + Perfil
    ├── swipe.jsx                      # Swipe de ofertas (Mis formaciones)
    ├── calendar.jsx                   # Calendario formador
    ├── finance.jsx                    # Horas impartidas
    ├── compliance.jsx                 # Cierre de formación (entrega de documentación)
    ├── bitacora.jsx                   # Diario de sesiones (incidencias + notas)
    ├── tasks.jsx                      # Encargos: consultoría/sesiones + firma digital canvas
    ├── attendance.jsx                 # Pasar lista + match con self check-in del alumno
    │
    ├── admin.jsx                      # ── SUPERADMIN: panel completo en un archivo
    │
    ├── alumnoLayout.jsx               # ── ALUMNO: shell + TopNav + búsqueda global + overlays
    ├── alumnoDashboard.jsx            # Home del alumno
    ├── alumnoCatalog.jsx              # Catálogo con filtros + favoritos
    ├── alumnoCourseDetail.jsx         # Ficha de curso + reseñas + botón "Estoy aquí"
    ├── alumnoMyCourses.jsx            # Mis cursos (en progreso / completados / certificados)
    ├── alumnoDiplomas.jsx             # Diplomas dinámicos (Nunito + html2canvas + jsPDF)
    ├── alumnoJobs.jsx                 # Bolsa de empleo + postulaciones
    ├── alumnoProfile.jsx              # Datos personales + fiscales + CV
    ├── alumnoCheckout.jsx             # Pago demo (tarjeta / Bizum / transferencia)
    ├── alumnoCalendar.jsx             # Próximas sesiones
    ├── alumnoFaq.jsx                  # FAQ + formulario de contacto
    └── alumnoOnboarding.jsx           # Tour inicial (3 pasos)
```

---

## Para el equipo de FileMaker Pro

Todo el código lleva anotaciones `FILEMAKER:` con el mapeo directo a
tablas, layouts, privilege sets, value lists y scripts de FileMaker Pro.
Puedes localizarlas con:

```bash
grep -rn "FILEMAKER:" src/
```

Resumen rápido:

- **3 Privilege Sets**: `priv_Alumno`, `priv_Formador`, `priv_Superadmin`
- **Tablas principales**: `Cursos`, `Alumnos`, `Formadores`, `Usuarios_Admin`,
  `Inscripciones_Alumno`, `Diplomas`, `Pagos`, `Ofertas_Empleo`,
  `Postulaciones`, `Valoraciones`, `Bitacora_Sesiones`, `Tareas`,
  `Asistencias`, `Notificaciones_*`, `Favoritos`, `Organizacion`
- **REST Data API** sugerida: `POST /fmi/data/vLatest/databases/CESEA/sessions`
  para auth; capas CRUD sobre los layouts correspondientes.
- **Firma digital**: el canvas del prototipo tiene valor legal **cero**;
  sustituir por integración real con AutoFirma (FNMT/DNIe), DocuSign o Adobe
  Sign (ver `src/tasks.jsx`, sección `TaskContract`).

---

## Páginas legales (reales, copiadas de csaformacion.com)

- **Aviso legal** — texto íntegro con titular WISHIT CSA SUPPLY SL
- **Política de privacidad** — RGPD + LOPDGDD + LSSI-CE, con canal de reclamación en AEPD
- **Política de cookies** — actualizada 27/01/2026, aplicable EEE + Suiza

Accesibles desde el footer del login y desde los diferentes paneles.

---

## Stack

- **React 18.3.1** (UMD desde unpkg)
- **Babel standalone 7.29.0** (transpilación JSX en navegador, sin build)
- **Framer Motion 11.0.3** (animaciones opcionales)
- **html2canvas 1.4.1 + jsPDF 2.5.1** (generación PDF de diplomas, solo demo — en producción lo entrega FM Server)
- **Tipografías**: Bricolage Grotesque (titulares), Lato (texto), Nunito (diplomas)

---

## Despliegue

Para **Vercel**: al ser HTML estático, basta con importar el repo; Vercel
detecta `index.html` en la raíz y sirve sin configuración adicional.

Para **FileMaker Pro**: ver guía arriba. Cada tabla y cada script están
anotados en los archivos `src/*.jsx`.

---

## Licencia

Proyecto propietario de WISHIT CSA SUPPLY SL. Uso restringido al equipo de
CESEA Formación y desarrolladores autorizados.

© 2026 CSA Formación. Todos los derechos reservados.
