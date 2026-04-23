# Kit comercial — Plataforma de formación corporativa

Este kit vende la plataforma (basada en CESEA Formación) a **otras empresas de cualquier sector**. Todo el material está alineado con la identidad visual del producto (naranja `#fcad00 → #f47809`, cian `#35a9cd`, tipografías Bricolage Grotesque + Lato) y es directamente reutilizable: HTML autónomos que se abren en navegador, se imprimen a PDF, se capturan en PNG o se embeben en emails.

## Acceso rápido

Desde la propia plataforma hay un enlace al kit: en el **login** (`index.html` de la app) aparece al pie un botón discreto **"Descubre el Kit Comercial →"** que abre este INDEX. Una vez desplegado a Vercel, tu equipo comercial entra a la app, hace clic en ese botón y tiene todo el material a mano.

Abre siempre primero **[INDEX.html](INDEX.html)**.

## Contenido del kit

| Archivo | Uso | Formato de entrega |
|---|---|---|
| `INDEX.html` | Menú maestro del kit | Navegación interna |
| `01-landing-comercial.html` | Microsite de ventas (hero, 3 roles, módulos, flujo, alcance, cómo se vende, precios, FAQ, CTA) | Link o PDF |
| `02-presentacion-comercial.html` | Pitch deck navegable de 14 slides (← →) | Reunión o exportar a PDF |
| `03-mockups-dispositivos.html` | **Mockups en vivo** con la plataforma real dentro de laptop/tablet/móvil (vía iframe) | Capturas PNG para email |
| `04-one-pager.html` | Resumen ejecutivo A4 | Imprimir a PDF y adjuntar |
| `emails/` | 4 plantillas con **diseño unificado** (frío, seguimiento, demo, propuesta) | Copiar HTML inline o texto |
| `social/` | 3 tarjetas (2 cuadradas 1080×1080 + 1 vertical 1080×1920) | Capturar como PNG |
| `guion-video-demo.md` | Storyboard de 90 s + variantes de 30 s y 15 s | Grabar con Loom/OBS |
| `prompts-ia-flow.md` | Prompts en inglés para generar imágenes con Flow/Nano Banana | Copiar al generador |

## Cómo exportar cada pieza

- **PDF**: abrir HTML → `Ctrl+P` → *Guardar como PDF*. La landing, el one-pager y la presentación están calibrados para PDF.
- **PNG/JPG**: Chrome → botón derecho → *Capturar captura de página completa* (o extensión GoFullPage). Para una sección concreta, `Inspeccionar` → selecciona el nodo → botón derecho → *Capture node screenshot*.
- **Vídeo**: graba siguiendo `guion-video-demo.md` con Loom (rápido) o OBS + DaVinci/CapCut (más control).
- **Imágenes IA**: copia un prompt de `prompts-ia-flow.md` en Flow, genera 3–4 variantes, descarga la mejor en JPG y guárdala en `assets/generated/`.

## Mockups en vivo

`03-mockups-dispositivos.html` embebe la **aplicación real** dentro de marcos de laptop, tablet y móvil vía iframe. Esto te ahorra mantener capturas: si mañana actualizas la app, los mockups reflejan el cambio automáticamente. Funciona cuando el archivo se sirve desde el mismo origen que la app (local con `python -m http.server` o desplegado en Vercel).

## Positioning

No vendemos "software para clínicas dentales". Vendemos una **plataforma de formación corporativa configurable por sector** adaptable a sanidad, industria, retail, logística, consultoría, educación, AAPP y hostelería.

Ángulos clave de venta:
- Tres roles pensados entre sí (alumno ↔ formador ↔ admin), no tres portales aislados.
- Operativa real: propuestas de fecha con solape, bitácora→expediente, CSV masivo, validación sesión a sesión.
- Configurable sin código (valor-listas editables desde admin).
- Compatible con FileMaker Pro si ya es tu stack.
- 15 módulos de serie · actualizaciones continuas sin coste extra.

## Modelo comercial

| Plan | Alumnos activos | €/mes | Setup único |
|---|---:|---:|---:|
| Starter | 50 | 79€ | Incluida |
| **Business** *(más popular)* | 250 | **249€** | 390€ opcional |
| Scale | 750 | 499€ | 990€ |
| Enterprise | Ilimitados | desde 990€ | A medida |

Sin IVA · sin permanencia · 20% de descuento en contrato anual · ampliable sin cambiar de plan.

Referencias de mercado (2026) — TalentLMS $89–459, LearnWorlds $24–299, Thinkific $49–199, 360Learning ~$8/usuario, Docebo/Absorb enterprise desde $1,500+. Nuestra tarifa está alineada al rango competitivo con una propuesta más completa que los LMS genéricos por la integración nativa de los 3 roles.

## Personalización antes de enviar

Cada plantilla tiene placeholders marcados con `{{DOBLE_LLAVE}}`:

- `{{NOMBRE}}` — nombre del contacto
- `{{EMPRESA}}` — empresa del destinatario
- `{{SECTOR}}` — sector de la empresa
- `{{EMPRESA_EMISORA}}` — tu propia empresa
- `{{TU_NOMBRE}}`, `{{TU_ROL}}` — firma
- `{{FECHA}}`, `{{HORA}}`, `{{LINK_MEET}}` — en invitación demo
- `{{PLAN}}`, `{{PRECIO_MES}}`, `{{SETUP}}`, `{{FECHA_CIERRE}}`, `{{ALUMNOS_ESTIMADOS}}` — en propuesta

Sustitúyelos todos antes de enviar. Usa *buscar y reemplazar* en tu editor.

## Versiones

- **v1.0** — Primera versión del kit: landing + presentación + mockups simulados + emails + one-pager + social + guion.
- **v1.1** — Precios realineados al mercado LMS real, emails con diseño unificado, mockups en vivo con iframe del producto real, sección "Qué se vende / Cómo se vende", FAQ, prompts IA para Flow, enlace discreto al kit desde el footer del login de la app.
