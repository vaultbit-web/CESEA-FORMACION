# Prompts de IA para generar imágenes con Flow / Nano Banana

Cada bloque tiene el prompt en **inglés** (óptimo para Nano Banana / Flow / Midjourney / DALL-E) y el **uso sugerido** dentro del kit comercial. Todos mantienen la paleta de marca (naranja cálido `#fcad00 → #f47809`, cian `#35a9cd`, fondos claros o dark mode) y una estética **editorial, corporativa, minimalista**, evitando la mirada genérica de stock fotográfico.

Guarda las imágenes generadas en `RECURSOS PARA MARKETING/assets/generated/` con el nombre `slide-XX-descripcion.jpg`.

---

## Parámetros de marca (incluir en todos los prompts)

Añade siempre al final del prompt estas directrices para mantener coherencia:

```
Brand palette: warm orange gradient (#fcad00 to #f47809) as highlights, 
cyan accent (#35a9cd), deep navy background (#0b0c1a) or clean off-white (#f4f5f9). 
Editorial, corporate, minimal. Premium startup aesthetic, similar to Stripe, 
Linear, or Notion marketing imagery. High end. No stock-photo cliché. 
Shallow depth of field. Soft natural lighting.
Aspect ratio: 16:9 (or as specified). Ultra high detail, photorealistic, 4K.
```

---

## Imágenes para la PRESENTACIÓN COMERCIAL (`02-presentacion-comercial.html`)

### Slide 1 — COVER · hero de apertura
**Prompt:**
```
A sleek, minimalist workspace scene at golden hour: a modern laptop on a light wooden 
desk, its screen showing a soft orange gradient interface with clean typography. 
Side lit by a large window with warm afternoon light diffused through sheer curtains. 
A small plant, a leather notebook, a wireless keyboard. No people visible. 
The atmosphere feels productive, calm, and premium. Out-of-focus warm highlights 
in the background create a dreamy bokeh. 
[Add brand palette directives here]
```
**Uso:** fondo/overlay de la slide 1. Colocar con opacidad 35% bajo el título.

### Slide 2 — PROBLEM · caos de herramientas
**Prompt:**
```
A conceptual flat-lay photograph from directly above: a cluttered wooden desk 
with dozens of sticky notes, scattered papers, coffee-stained printouts, an old 
spiral notebook full of handwritten schedules, a smartphone showing a chaotic 
WhatsApp thread, and several open Excel spreadsheets on a laptop screen. 
Documents overlap chaotically. Muted tones dominate — the chaos should feel 
frustrating, not beautiful. One small pool of warm orange light illuminates 
the center. Cinematic, editorial, overhead angle, documentary style.
[Add brand palette directives here]
```
**Uso:** fondo de la slide 2 ("El problema"), overlay oscuro encima para legibilidad.

### Slide 3 — SOLUTION · orden y claridad
**Prompt:**
```
A single elegant workspace on a clean white surface: one laptop open showing 
a well-organized dashboard interface with orange accent highlights, a single 
cup of coffee, a minimalist notebook closed neatly. Everything is in its place. 
Empty whitespace dominates the composition — the message is "one system, 
everything organized". Soft morning light from the left. Shot from a slight 
three-quarter angle. Stripe/Linear aesthetic.
[Add brand palette directives here]
```
**Uso:** apoyo visual en slide 3.

### Slide 7 — SECTORS · diversidad sectorial
**Prompt:**
```
A collage-style editorial composition: four small rectangular vignettes arranged 
in a 2x2 grid, each showing a different professional setting in the same warm 
editorial style — (1) a healthcare training room with nurses, (2) a modern 
warehouse with logistics workers reviewing a tablet, (3) a retail store employee 
training, (4) a corporate meeting room with consultants. All scenes share the 
same warm orange highlight lighting and cinematic corporate aesthetic. 
Shot on 35mm film, desaturated slightly, human but not cliché.
[Add brand palette directives here]
```
**Uso:** slide 7 (sectores) como fondo con opacidad baja o como bloque lateral.

### Slide 13 — QUOTE · cliente satisfecho
**Prompt:**
```
A confident professional woman in her late 30s, business casual attire (no suit, 
no stock-photo cliché), warm smile but thoughtful expression. She is mid-sentence 
during a meeting, gesturing lightly with her hand. Soft natural window light from 
the side. Out-of-focus modern office in the background with warm orange ambient 
highlights. Shot on 85mm lens, shallow depth of field, cinematic portrait. 
Not overly corporate — feels like a real person mid-conversation, not a stock 
photo model.
[Add brand palette directives here]
```
**Uso:** portrait a la izquierda del testimonio en slide 13.

### Slide 14 — CTA · cierre optimista
**Prompt:**
```
An extreme close-up of two hands shaking in front of a blurred bright modern 
office background. The lighting is warm golden hour, orange tones dominate. 
The handshake is genuine, not forced. One hand has a minimal watch, the other 
has a simple bracelet. Depth of field isolates the handshake. Cinematic, 
editorial, premium.
[Add brand palette directives here]
```
**Uso:** fondo de la slide final. Overlay gradiente naranja con opacidad 60%.

---

## Imágenes para la LANDING (`01-landing-comercial.html`)

### HERO · banner principal
**Prompt:**
```
A cinematic wide shot of a young professional (androgynous look, late 20s) 
sitting at a modern desk in a light-filled glass office, looking at a laptop 
screen with a focused but relaxed expression. The laptop screen is visible 
and shows a clean orange-accented dashboard interface. Behind the person, 
out-of-focus colleagues are collaborating. Aspect ratio 16:9. Warm natural 
lighting from large floor-to-ceiling windows. Feels like a frame from a 
Netflix documentary about modern work. Shallow depth of field.
[Add brand palette directives here]
```
**Uso:** reemplaza el degradado decorativo del hero. Se pone a `opacity: 0.18` bajo el texto para que no compita.

### SECCIÓN SECTORES — fondo decorativo
**Prompt:**
```
An abstract geometric pattern composed of overlapping rounded rectangles in 
varying warm orange tones (#fcad00, #f47809) and subtle navy accents. Clean, 
minimal, modern. No photographic elements. Feels like a modern SaaS website 
background. Aspect ratio 16:9.
[Add brand palette directives here]
```
**Uso:** fondo sutil de la sección sectores.

### SECCIÓN TECH — imagen de dispositivos
**Prompt:**
```
A clean studio product photograph: a MacBook Pro, an iPad Pro in landscape, 
and an iPhone 15 Pro arranged in a triangular composition on a seamless 
off-white background. All three devices have screens turned on with abstract 
orange-gradient dashboard UI visible (don't make the UI too detailed, keep 
it abstract). Soft studio lighting, subtle shadows. Apple-keynote aesthetic. 
Shot from slightly above. Aspect ratio 3:2.
[Add brand palette directives here]
```
**Uso:** columna derecha de la sección tecnología.

---

## Imágenes para SOCIAL MEDIA (`social/`)

### Story vertical — background hero
**Prompt:**
```
A dramatic vertical composition (9:16 aspect ratio) of a modern workspace 
seen from a low angle: warm orange ambient light filling a room, a silhouetted 
laptop on a desk glowing with an orange interface, large windows casting 
geometric shadows. Cinematic, moody, premium. No people. The whole image 
feels like the opening shot of a product film. Aspect ratio 9:16.
[Add brand palette directives here]
```
**Uso:** fondo de `social/story-vertical.html` con opacidad baja.

### Post feed — abstracto
**Prompt:**
```
An abstract 3D render: floating translucent glass panels arranged in mid-air, 
each panel showing a different UI element (calendar, chart, list). Panels are 
rimmed with warm orange glow, floating on a navy background with soft orange 
ambient light. Modern 3D art, Linear/Notion marketing aesthetic. Aspect ratio 1:1.
[Add brand palette directives here]
```
**Uso:** background de `social/post-cuadrado-1.html`.

---

## Imágenes conceptuales adicionales (para blog, ads, etc.)

### "Tres roles, un entorno"
**Prompt:**
```
A conceptual editorial illustration (NOT photography): three stylized silhouettes 
(student with laptop, instructor with tablet, administrator with desktop) 
arranged in a triangular composition. Each figure has a different warm orange 
or cyan accent glow. Connected by thin geometric lines showing data flow 
between them. Minimal background, soft gradient from navy to deep orange. 
Modern editorial illustration style, similar to The New York Times or 
Harvard Business Review illustrations.
[Add brand palette directives here]
```
**Uso:** ilustración alternativa a fotografías de stock. Útil en blog post o artículo comercial.

### "De la carpeta al sistema"
**Prompt:**
```
A split-screen conceptual photograph: left half shows a chaotic scene of 
physical paper folders stacked messily in an old filing cabinet with handwritten 
labels. Right half shows the same information represented as a clean, 
organized digital dashboard on a modern laptop, with orange accents. 
The visual transition between chaos and order should be clear. Cinematic 
lighting. Documentary editorial style.
[Add brand palette directives here]
```
**Uso:** bloque "antes/después" en artículos o landing alternativas.

---

## Workflow recomendado con Nano Banana / Flow

1. Copia el prompt entero (incluyendo los parámetros de marca) en Flow.
2. Genera 3–4 variantes por prompt.
3. Selecciona la mejor y hazle 1 pasada de upscale.
4. Descarga en formato JPG calidad 90% para web (< 400 KB idealmente), PNG sólo si necesitas transparencia.
5. Nombra el archivo: `slide-XX-descripcion.jpg` o `landing-hero.jpg` etc.
6. Guarda en `RECURSOS PARA MARKETING/assets/generated/`.
7. Actualiza el HTML correspondiente sustituyendo los placeholders de fondo por la nueva imagen.

## Ajustes de estilo si los resultados no te convencen

- Si salen demasiado **genéricos/stock**: añade `editorial style`, `shot on film`, `grain texture`, `Kodak Portra 400`.
- Si salen demasiado **artificiales/render**: añade `real photograph`, `natural skin texture`, `ISO 400`, `50mm f/1.8`.
- Si los **colores no cuadran**: refuerza al final: `strict brand palette: warm orange #fcad00 and #f47809 only for highlights, no other warm tones`.
- Si sale **gente con cara estándar**: añade `diverse, real-looking person, unique face, imperfect skin, candid expression`.
