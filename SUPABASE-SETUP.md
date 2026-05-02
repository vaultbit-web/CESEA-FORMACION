# Setup Supabase — Guía paso a paso

> Esto te lo tiene que hacer **una sola vez**. Después yo me encargo del resto. Tarda 3-5 minutos.

---

## Paso 1 · Cambiar 1 setting en Dokploy (30 segundos)

En tu panel de Dokploy, abre las variables de entorno del servicio Supabase y cambia esta línea:

```
ENABLE_EMAIL_AUTOCONFIRM=false   ←  cámbialo a true
```

Queda así:

```
ENABLE_EMAIL_AUTOCONFIRM=true
```

**¿Por qué?** Sin esto, los formadores y alumnos no pueden registrarse porque tu Supabase intentaría enviarles un email de confirmación (y no tienes SMTP configurado todavía). Con `true`, los registros se confirman automáticamente.

> ℹ️ Cuando configures un SMTP real (Resend, Mailgun, etc.) podrás volver a `false` para que los emails se confirmen "de verdad".

Después de cambiar la variable, **reinicia el servicio Supabase** desde Dokploy (botón "Restart" o "Redeploy").

---

## Paso 2 · Abrir Supabase Studio (10 segundos)

Abre esta URL en el navegador:

```
http://cesea-formacion-supabase-9ccf70-89-116-38-126.traefik.me
```

Te pedirá usuario y contraseña:

- **Usuario:** `supabase`
- **Contraseña:** `s7elavd7uqplwgjyv8dtvzcedtko4exf`

> Las copias de tu archivo de Dokploy. **Cámbialas más adelante** cuando todo esté funcionando.

---

## Paso 3 · Crear el esquema (2 minutos)

En el Studio:

1. **Click en el icono de la izquierda con forma de "SQL"** (o ve a Settings → SQL Editor → "New query")
2. Abre el archivo [migrations/001_schema.sql](migrations/001_schema.sql) en este repositorio
3. **Selecciona TODO** (Ctrl+A) y **copia** (Ctrl+C)
4. **Pega** en el editor SQL del Studio (Ctrl+V)
5. Click en **"Run"** (botón verde abajo a la derecha) o pulsa Ctrl+Enter

Deberías ver: ✓ Success. No rows returned.

---

## Paso 4 · Aplicar las políticas de seguridad (1 minuto)

Mismo procedimiento que el paso 3, pero con el otro archivo:

1. Click "New query" para limpiar el editor
2. Abre [migrations/002_rls_storage.sql](migrations/002_rls_storage.sql)
3. **Selecciona TODO**, **copia**, **pega** en el editor
4. Click **"Run"**

Deberías ver: ✓ Success.

---

## Paso 5 · Avísame

Cuando hayas hecho los 4 pasos anteriores, **dime**:

> "Listo, schema y RLS ejecutados"

Y yo me encargo automáticamente de:

1. ✅ Importar los **35 formadores reales** del Excel
2. ✅ Importar los **113 cursos reales** del Excel
3. ✅ Crear los **4 usuarios demo** (superadmin, formadora Ana, alumna María, alumno Javier) con las contraseñas actuales
4. ✅ Cruzar formadores ↔ cursos (`cursos_asignados`) automáticamente
5. ✅ Verificar que todo está OK
6. ✅ Push final a GitHub

---

## ⚠️ Cosas a saber

- **Esto solo se hace UNA vez.** Después la app conecta a Supabase automáticamente.
- **Los SQL son idempotentes**: si por error los ejecutas dos veces, no pasa nada (usa `if not exists` y `on conflict do nothing`).
- **Si algo falla**: copia el mensaje de error rojo del Studio y mándamelo. La causa más común es que `auth.users` no esté lista (el primer paso al desplegar Supabase) — espera 30 segundos y reintenta.

---

## Cuando termine TODO el setup

Te haré un resumen con:
- Las **URLs de los 3 logins** (formador, alumno, superadmin)
- Las **contraseñas** (las puedes cambiar después)
- **Cómo abrir la app** localmente para probar
- **Lo que vendría después** (deploy a producción, dominio bonito, SSL, SMTP real)
