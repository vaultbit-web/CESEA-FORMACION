-- ─────────────────────────────────────────────────────────────────────────────
-- CESEA Formación · Migración 001 · Esquema completo
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Ejecutar en Supabase Studio (SQL Editor) o vía psql.
--
-- Ajustes vs el plan original:
--   · formadores y alumnos tienen user_id NULLABLE (referencia a usuarios.id) en
--     vez de id = auth.users.id. Permite tener formadores en "Pre-registro"
--     sin entrada en auth.users hasta que se registren ellos mismos.
--   · cursos.id es serial (compatible con los IDs numéricos del Excel).
--   · imparticiones, asistencia y resto siguen el plan.
--
-- Idempotente: usa "if not exists" donde se puede. Re-ejecutar es seguro.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Extensiones ──────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ── 2. Enums ────────────────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_type where typname = 'role_type') then
    create type role_type as enum ('alumno','formador','superadmin');
  end if;
  if not exists (select 1 from pg_type where typname = 'formador_status') then
    create type formador_status as enum ('Pre-registro','Activo','En pausa','Pendiente','Baja');
  end if;
  if not exists (select 1 from pg_type where typname = 'curso_status') then
    create type curso_status as enum ('available','accepted','review','completed','archived');
  end if;
  if not exists (select 1 from pg_type where typname = 'modalidad') then
    create type modalidad as enum ('Online','Presencial','Híbrido');
  end if;
  if not exists (select 1 from pg_type where typname = 'solicitud_tipo') then
    create type solicitud_tipo as enum ('new','change','hours','register','proposal','incidencia');
  end if;
  if not exists (select 1 from pg_type where typname = 'solicitud_estado') then
    create type solicitud_estado as enum ('pendiente','aprobada','rechazada','en revisión','resuelta','abierta','cerrada');
  end if;
  if not exists (select 1 from pg_type where typname = 'incidencia_tipo') then
    create type incidencia_tipo as enum ('Cancelación por enfermedad','Cambio de fecha','Problema con alumnos','Infraestructura / aula','Otro');
  end if;
  if not exists (select 1 from pg_type where typname = 'tarea_status') then
    create type tarea_status as enum ('pendiente','firmada','rechazada');
  end if;
  if not exists (select 1 from pg_type where typname = 'asistencia_status') then
    create type asistencia_status as enum ('presente','ausente','retraso','justificada');
  end if;
end$$;

-- ── 3. Tabla organizacion (1 fila) ──────────────────────────────────────────
create table if not exists organizacion (
  id           int primary key default 1,
  legal_name   text not null,
  brand_name   text not null,
  cif          text not null,
  address      text not null,
  address_rgpd text,
  phone        text,
  email_ops    citext,
  email_biz    citext,
  jurisdiction text,
  copyright    text,
  website      text,
  updated_at   timestamptz default now(),
  constraint solo_una_org check (id = 1)
);

insert into organizacion (id, legal_name, brand_name, cif, address, address_rgpd, phone, email_ops, email_biz, jurisdiction, copyright, website)
values (1, 'WISHIT CSA SUPPLY SL', 'CESEA Formación', 'B06842256', 'C/ Gomis, 86 local 8, Barcelona', 'C/ Camí Ral, 552-554 – Mataró', '661.202.608', 'contacto@wishit.es', 'consultoria@csaformacion.com', 'juzgados y tribunales de Mataró', '© 2026 CSA Formación', 'https://csaformacion.com/')
on conflict (id) do nothing;

-- ── 4. Tabla usuarios (perfil ampliado para auth.users) ─────────────────────
create table if not exists usuarios (
  id           uuid primary key references auth.users(id) on delete cascade,
  role_type    role_type not null,
  email        citext unique not null,
  name         text not null,
  initials     text,
  phone        text,
  photo_url    text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
create index if not exists idx_usuarios_role on usuarios(role_type);

-- ── 5. Tabla formadores ─────────────────────────────────────────────────────
-- IMPORTANTE: user_id es NULLABLE para permitir formadores en estado
-- "Pre-registro" sin entrada en auth.users. Cuando el formador se registre,
-- se hace UPDATE para enlazar.
create table if not exists formadores (
  id                       uuid primary key default uuid_generate_v4(),
  user_id                  uuid unique references usuarios(id) on delete set null,
  id_externo               int unique,
  email                    citext unique,
  name                     text not null,
  cif                      text,
  n_colegiado              text,
  phone                    text,
  poblacion                text,
  status                   formador_status default 'Pre-registro',
  join_date                date,
  specialty                text,
  hours_ytd                int default 0,
  dni                      text,
  iban                     text,
  official                 boolean default false,
  rating                   numeric(3,2) default 0,
  trust_score              int default 0,
  tarifa_venta_directa     numeric(10,2) default 0,
  tarifa_venta_indirecta   numeric(10,2) default 0,
  tarifa_km                numeric(10,2) default 0,
  tipologias               text[] default '{}',
  cursos_asignados         int[]  default '{}',
  cv_filename              text,
  cv_upload_year           int,
  created_at               timestamptz default now()
);
create index if not exists idx_formadores_status on formadores(status);
create index if not exists idx_formadores_user   on formadores(user_id);

-- ── 6. Tabla alumnos ────────────────────────────────────────────────────────
-- Igual que formadores: user_id NULLABLE para soportar pre-registro.
create table if not exists alumnos (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid unique references usuarios(id) on delete set null,
  email           citext unique,
  name            text not null,
  sector          text,
  bio             text,
  location        text,
  cv_filename     text,
  cv_upload_date  date,
  fiscal_name     text,
  fiscal_nif      text,
  fiscal_address  text,
  join_date       date default current_date,
  created_at      timestamptz default now()
);

-- ── 7. Tabla tipologias (value list editable) ───────────────────────────────
create table if not exists tipologias (
  id          uuid primary key default uuid_generate_v4(),
  name        text unique not null,
  created_at  timestamptz default now()
);

insert into tipologias (name) values
  ('ACP y Modelo de Atención'),('Acompañamiento emocional'),('Movilizaciones seguras'),
  ('Liderazgo y gestión'),('Competencias directivas'),('Marketing y comunicación'),
  ('Gestión directiva'),('Técnica odontológica'),('Medicina y salud'),
  ('Nutrición y dietética'),('Autocuidados'),('Bienestar emocional'),
  ('Risoterapia'),('Humanización asistencial')
on conflict (name) do nothing;

-- ── 8. Tabla cursos ─────────────────────────────────────────────────────────
create table if not exists cursos (
  id                    serial primary key,
  codigo_interno        text unique not null,
  title                 text not null,
  subtitle              text,
  area                  text not null,
  category              text,
  contenidos            text,
  objetivos             text,
  tipo_contrato         text,
  modality              modalidad default 'Presencial',
  hours                 int default 8,
  num_imparticiones     int default 1 check (num_imparticiones between 1 and 30),
  ciudades              text[] default '{}',
  formadores_asignados  text[] default '{}',
  level                 text default 'Intermedio',
  status                curso_status default 'available',
  official              boolean default false,
  rating                numeric(3,2) default 0,
  students_count        int default 0,
  price                 numeric(10,2) default 0,
  -- Campos demo overlay (opcionales: el superadmin los rellena al planificar)
  dates                 text,
  start_date            date,
  end_date              date,
  time_str              text,
  location              text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);
create index if not exists idx_cursos_status on cursos(status);
create index if not exists idx_cursos_area   on cursos(area);

-- ── 9. Tabla imparticiones ──────────────────────────────────────────────────
create table if not exists imparticiones (
  id              uuid primary key default uuid_generate_v4(),
  curso_id        int not null references cursos(id) on delete cascade,
  formador_id     uuid references formadores(id),
  start_date      date not null,
  end_date        date not null check (end_date >= start_date),
  time_str        text,
  location        text,
  sessions_jsonb  jsonb default '[]'::jsonb,
  status          curso_status default 'accepted',
  created_at      timestamptz default now()
);
create index if not exists idx_imp_curso    on imparticiones(curso_id);
create index if not exists idx_imp_formador on imparticiones(formador_id);

-- ── 10. Tabla solicitudes (polimorfa) ───────────────────────────────────────
create table if not exists solicitudes (
  id                uuid primary key default uuid_generate_v4(),
  tipo              solicitud_tipo not null,
  trainer_id        uuid references formadores(id),
  trainer_name      text,
  course_id         int references cursos(id),
  course_title      text,
  detail            text,
  status            solicitud_estado default 'pendiente',
  proposed_dates    text,
  proposed_schedule jsonb,
  note              text,
  rate              numeric(10,2),
  tipologia         text,
  hours             int,
  modality          modalidad,
  objectives        text,
  contents          text,
  incidencia_tipo   incidencia_tipo,
  description       text,
  created_at        timestamptz default now(),
  resolved_at       timestamptz,
  resolved_by       uuid references usuarios(id)
);
create index if not exists idx_sol_status   on solicitudes(status);
create index if not exists idx_sol_tipo     on solicitudes(tipo);
create index if not exists idx_sol_trainer  on solicitudes(trainer_id);

-- ── 11. Tabla bitacoras ─────────────────────────────────────────────────────
create table if not exists bitacoras (
  id              uuid primary key default uuid_generate_v4(),
  curso_id        int not null references cursos(id),
  imparticion_id  uuid references imparticiones(id),
  session_date    date not null,
  time_from       text,
  time_to         text,
  incidents       text,
  notes           text,
  present         int default 0,
  total           int default 0,
  formador_id     uuid references formadores(id),
  created_at      timestamptz default now()
);
create index if not exists idx_bit_curso on bitacoras(curso_id);

-- ── 12. Tabla tareas ────────────────────────────────────────────────────────
create table if not exists tareas (
  id              uuid primary key default uuid_generate_v4(),
  curso_id        int references cursos(id),
  imparticion_id  uuid references imparticiones(id),
  formador_id     uuid references formadores(id),
  title           text not null,
  description     text,
  due_date        date,
  status          tarea_status default 'pendiente',
  signature_img   text,
  signed_pdf      text,
  deliverables    jsonb default '[]'::jsonb,
  created_at      timestamptz default now()
);

-- ── 13. Asistencia (sesiones + records) ─────────────────────────────────────
create table if not exists asistencia_sesiones (
  id              uuid primary key default uuid_generate_v4(),
  curso_id        int references cursos(id),
  imparticion_id  uuid references imparticiones(id),
  fecha           date not null,
  time_from       text,
  time_to         text,
  formador_id     uuid references formadores(id),
  created_at      timestamptz default now()
);

create table if not exists asistencia_records (
  id          uuid primary key default uuid_generate_v4(),
  sesion_id   uuid not null references asistencia_sesiones(id) on delete cascade,
  alumno_id   uuid references alumnos(id),
  status      asistencia_status not null,
  notes       text,
  origin      text default 'manual',
  unique (sesion_id, alumno_id)
);

-- ── 14. Matriculas (enrollments) ────────────────────────────────────────────
create table if not exists matriculas (
  id              uuid primary key default uuid_generate_v4(),
  alumno_id       uuid not null references alumnos(id),
  curso_id        int  not null references cursos(id),
  imparticion_id  uuid references imparticiones(id),
  progress        int default 0,
  status          text default 'en curso',
  enrolled_at     timestamptz default now(),
  completed_at    timestamptz,
  payment_id      uuid,
  unique (alumno_id, curso_id, imparticion_id)
);

-- ── 15. Diplomas ────────────────────────────────────────────────────────────
create table if not exists diplomas (
  id              uuid primary key default uuid_generate_v4(),
  alumno_id       uuid not null references alumnos(id),
  curso_id        int  not null references cursos(id),
  imparticion_id  uuid references imparticiones(id),
  emitted_at      date default current_date,
  pdf_url         text,
  serial          text unique,
  created_at      timestamptz default now()
);

-- ── 16. Empleo ──────────────────────────────────────────────────────────────
create table if not exists empleo_ofertas (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  company     text,
  location    text,
  description text,
  status      text default 'activa',
  created_at  timestamptz default now()
);

create table if not exists empleo_aplicaciones (
  id          uuid primary key default uuid_generate_v4(),
  alumno_id   uuid references alumnos(id),
  oferta_id   uuid references empleo_ofertas(id),
  cv_url      text,
  status      text default 'enviada',
  applied_at  timestamptz default now(),
  unique (alumno_id, oferta_id)
);

-- ── 17. Pagos ───────────────────────────────────────────────────────────────
create table if not exists pagos (
  id            uuid primary key default uuid_generate_v4(),
  alumno_id     uuid references alumnos(id),
  matricula_id  uuid references matriculas(id),
  amount        numeric(10,2),
  currency      text default 'EUR',
  method        text,
  status        text default 'pendiente',
  external_id   text,
  created_at    timestamptz default now()
);

-- ── 18. Notificaciones, calendar, documentos, descuentos ────────────────────
create table if not exists notificaciones (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references usuarios(id) on delete cascade,
  text        text not null,
  link        text,
  read        boolean default false,
  created_at  timestamptz default now()
);
create index if not exists idx_notif_user_unread on notificaciones(user_id) where read = false;

create table if not exists calendar_events (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references usuarios(id),
  title       text not null,
  date        date not null,
  time_from   text,
  time_to     text,
  curso_id    int references cursos(id),
  type        text,
  created_at  timestamptz default now()
);

create table if not exists documentos_formador (
  id            uuid primary key default uuid_generate_v4(),
  formador_id   uuid references formadores(id) on delete cascade,
  name          text not null,
  doc_type      text not null,
  storage_path  text not null,
  uploaded_at   date default current_date,
  year          int,
  size_bytes    bigint
);

create table if not exists descuentos (
  code         text primary key,
  pct          int,
  monto        numeric(10,2),
  active       boolean default true,
  expires_at   date,
  created_at   timestamptz default now()
);

-- ── 19. Triggers updated_at ─────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_updated_at_org on organizacion;
create trigger trg_updated_at_org before update on organizacion for each row execute function set_updated_at();

drop trigger if exists trg_updated_at_usu on usuarios;
create trigger trg_updated_at_usu before update on usuarios for each row execute function set_updated_at();

drop trigger if exists trg_updated_at_cur on cursos;
create trigger trg_updated_at_cur before update on cursos for each row execute function set_updated_at();

-- ── 20. Helpers de role ─────────────────────────────────────────────────────
create or replace function is_superadmin() returns boolean as $$
  select exists(select 1 from usuarios u where u.id = auth.uid() and u.role_type = 'superadmin');
$$ language sql security definer set search_path = public;

create or replace function is_formador() returns boolean as $$
  select exists(select 1 from usuarios u where u.id = auth.uid() and u.role_type = 'formador');
$$ language sql security definer set search_path = public;

create or replace function is_alumno() returns boolean as $$
  select exists(select 1 from usuarios u where u.id = auth.uid() and u.role_type = 'alumno');
$$ language sql security definer set search_path = public;

-- ── ✓ Esquema completo creado ───────────────────────────────────────────────
-- Siguiente paso: ejecutar 002_rls_storage.sql
