// ─────────────────────────────────────────────────────────────────────────────
// CESEA Formación · scripts/migrate-data.mjs
// ─────────────────────────────────────────────────────────────────────────────
//
// Importa a Supabase los datos generados por build-migrations.py + crea los
// 4 usuarios demo (superadmin, formadora Ana García, alumna María, alumno Javier).
//
// Requiere variables de entorno:
//   SUPABASE_URL=http://...
//   SERVICE_ROLE_KEY=eyJ...
//
// Pasarlas en línea o vía un .env (NUNCA commitear el .env).
//
// Uso:
//   node scripts/migrate-data.mjs
//
// Idempotente: re-ejecutable. Usa upsert por codigo_interno (cursos) y por
// id_externo (formadores). Los usuarios demo se crean con admin.createUser
// que falla con código "email_exists" si ya existe → lo ignoramos.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(__dirname);

// ── 0. Cargar .env si existe ──────────────────────────────────────────────
try {
  const envPath = path.join(ROOT, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const m = line.match(/^([A-Z_]+)\s*=\s*(.+)$/);
      if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
} catch (e) { /* ignore */ }

const SUPABASE_URL  = process.env.SUPABASE_URL;
const SERVICE_KEY   = process.env.SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('ERROR: SUPABASE_URL y SERVICE_ROLE_KEY son obligatorios. Crea un .env en la raíz del repo (ver .env.example).');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log('Conectando a:', SUPABASE_URL);

// ── 1. Importar formadores ────────────────────────────────────────────────
const formadores = JSON.parse(fs.readFileSync(path.join(ROOT, 'migrations/data-formadores.json'), 'utf8'));
console.log(`\n[1/5] Insertando ${formadores.length} formadores...`);

const formadoresPayload = formadores.map(f => ({
  id_externo:  f.idExterno,
  email:       f.email || null,
  name:        f.name,
  cif:         f.cif,
  n_colegiado: f.nColegiado,
  phone:       f.phone || null,
  poblacion:   f.poblacion || null,
  status:      'Pre-registro',
}));

// Upsert por id_externo (los positivos = del Excel real, los negativos = extras)
const { data: insertedFormadores, error: e1 } = await sb
  .from('formadores')
  .upsert(formadoresPayload, { onConflict: 'id_externo' })
  .select('id, id_externo, name');
if (e1) { console.error('Error insertando formadores:', e1); process.exit(1); }
console.log(`  OK: ${insertedFormadores.length} filas en formadores.`);

// Mapa idExterno -> uuid (lo necesitamos para resolver formadoresAsignados de cursos)
const idExtToUuid = {};
for (const f of insertedFormadores) idExtToUuid[f.id_externo] = f.id;

// ── 2. Importar cursos ────────────────────────────────────────────────────
const cursos = JSON.parse(fs.readFileSync(path.join(ROOT, 'migrations/data-cursos.json'), 'utf8'));
console.log(`\n[2/5] Insertando ${cursos.length} cursos...`);

const cursosPayload = cursos.map(c => ({
  codigo_interno:        c.codigoInterno,
  title:                 c.title,
  subtitle:              c.subtitle,
  area:                  c.area,
  category:              c.category,
  contenidos:            c.contenidos,
  objetivos:             c.objetivos,
  tipo_contrato:         c.tipoContrato,
  modality:              c.modality,
  hours:                 c.hours,
  num_imparticiones:     c.numImparticiones,
  ciudades:              c.ciudades,
  formadores_asignados:  c.formadoresIdExternos.map(ext => idExtToUuid[ext]).filter(Boolean),
  level:                 c.level,
  status:                c.status,
  location:              c.ciudades[0] || null,
}));

const { error: e2 } = await sb
  .from('cursos')
  .upsert(cursosPayload, { onConflict: 'codigo_interno' });
if (e2) { console.error('Error insertando cursos:', e2); process.exit(1); }
console.log(`  OK: ${cursos.length} cursos upserted.`);

// ── 3. Cruzar cursos_asignados desde el lado del formador ────────────────
console.log(`\n[3/5] Calculando cursos_asignados por formador...`);
const { data: allCursos } = await sb.from('cursos').select('id, codigo_interno, formadores_asignados');
const cursosByFormador = {}; // formadorUuid -> [cursoId]
for (const curso of allCursos) {
  for (const fUuid of (curso.formadores_asignados || [])) {
    if (!cursosByFormador[fUuid]) cursosByFormador[fUuid] = [];
    cursosByFormador[fUuid].push(curso.id);
  }
}

let updatedCount = 0;
for (const [fUuid, courseIds] of Object.entries(cursosByFormador)) {
  const { error } = await sb.from('formadores').update({ cursos_asignados: courseIds }).eq('id', fUuid);
  if (error) { console.error('  Error update formador', fUuid, error.message); continue; }
  updatedCount++;
}
console.log(`  OK: ${updatedCount} formadores con cursos_asignados actualizados.`);

// ── 4. Crear usuarios demo (4) ────────────────────────────────────────────
console.log(`\n[4/5] Creando usuarios demo (4 logins)...`);

const DEMO_USERS = [
  { email: 'admin@cesea.com',         password: 'admin1234', name: 'Carlos Ruiz Ferrer',  role: 'superadmin', extra: {} },
  { email: 'ana.garcia@formador.com', password: 'demo1234',  name: 'Ana García López',    role: 'formador',   extra: {} },
  { email: 'maria.lopez@alumno.com',  password: 'demo1234',  name: 'María López Serrano', role: 'alumno',     extra: { sector: 'dental',  location: 'Madrid, España' } },
  { email: 'javier.ruiz@alumno.com',  password: 'demo1234',  name: 'Javier Ruiz Márquez', role: 'alumno',     extra: { sector: 'sanidad', location: 'Valencia, España' } },
];

for (const u of DEMO_USERS) {
  const initials = u.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

  // 1. Crear (o saltar si existe) en auth.users
  let userId = null;
  const { data: created, error: eAuth } = await sb.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,    // bypass email verification
    user_metadata: { name: u.name },
  });

  if (eAuth) {
    if (eAuth.message?.includes('already') || eAuth.code === 'email_exists') {
      // Buscar usuario existente
      const { data: existing } = await sb.auth.admin.listUsers();
      const found = existing?.users?.find(x => x.email?.toLowerCase() === u.email.toLowerCase());
      if (found) {
        userId = found.id;
        console.log(`  ${u.email} ya existe, id=${userId.slice(0,8)}... (skipping auth)`);
      } else {
        console.error(`  ERROR: ${u.email} - ${eAuth.message}`);
        continue;
      }
    } else {
      console.error(`  ERROR creando ${u.email}: ${eAuth.message}`);
      continue;
    }
  } else {
    userId = created.user.id;
    console.log(`  ${u.email} creado, id=${userId.slice(0,8)}...`);
  }

  // 2. Upsert en usuarios
  const { error: eU } = await sb.from('usuarios').upsert({
    id: userId, role_type: u.role, email: u.email, name: u.name, initials,
  }, { onConflict: 'id' });
  if (eU) console.error(`    Error upsert usuarios para ${u.email}:`, eU.message);

  // 3. Crear/linkear extensión por rol
  if (u.role === 'formador') {
    // Crear formador "Ana García López" si no existe, y enlazar user_id
    const { data: existingFormador } = await sb.from('formadores').select('id').eq('email', u.email).maybeSingle();
    if (existingFormador) {
      await sb.from('formadores').update({ user_id: userId }).eq('id', existingFormador.id);
    } else {
      await sb.from('formadores').insert({
        user_id: userId, email: u.email, name: u.name,
        status: 'Activo', specialty: 'Acompañamiento, Competencias, ACP',
        poblacion: 'Madrid', dni: '***945B', iban: 'ES51 **** **** **** ****4321',
        rating: 4.7, trust_score: 85, hours_ytd: 90,
        tarifa_venta_directa: 50, tarifa_venta_indirecta: 40, tarifa_km: 0.28,
        tipologias: ['ACP y Modelo de Atención', 'Acompañamiento emocional'],
        join_date: '2025-01-15',
      });
    }
  } else if (u.role === 'alumno') {
    const { data: existingAlumno } = await sb.from('alumnos').select('id').eq('email', u.email).maybeSingle();
    if (existingAlumno) {
      await sb.from('alumnos').update({ user_id: userId, ...u.extra }).eq('id', existingAlumno.id);
    } else {
      await sb.from('alumnos').insert({
        user_id: userId, email: u.email, name: u.name,
        ...u.extra,
      });
    }
  }
}

// ── 5. Resumen ────────────────────────────────────────────────────────────
console.log(`\n[5/5] Resumen final...`);
const summary = {};
for (const t of ['organizacion','usuarios','formadores','alumnos','cursos','tipologias']) {
  const { count } = await sb.from(t).select('*', { count: 'exact', head: true });
  summary[t] = count;
}
console.log(summary);

console.log('\n✓ Migración completada.');
console.log('\nPróximos pasos:');
console.log('  1. Test login con: admin@cesea.com / admin1234');
console.log('  2. Levantar el frontend: npm start (o abrir index.html)');
console.log('  3. Verificar que cada botón funciona contra Supabase.');
