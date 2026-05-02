-- ─────────────────────────────────────────────────────────────────────────────
-- CESEA Formación · Migración 002 · RLS y Storage
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Activa Row Level Security en todas las tablas con datos personales y crea
-- las políticas por rol (alumno, formador, superadmin).
--
-- También crea los 4 buckets de Storage (cv, diplomas, firmas, docs-formador)
-- con sus políticas de acceso (path basado en uuid del usuario).
--
-- Idempotente: drop + create de las políticas y buckets para que se pueda
-- re-ejecutar.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Activar RLS en todas las tablas ──────────────────────────────────────
alter table usuarios               enable row level security;
alter table formadores             enable row level security;
alter table alumnos                enable row level security;
alter table cursos                 enable row level security;
alter table imparticiones          enable row level security;
alter table solicitudes            enable row level security;
alter table bitacoras              enable row level security;
alter table tareas                 enable row level security;
alter table asistencia_sesiones    enable row level security;
alter table asistencia_records     enable row level security;
alter table matriculas             enable row level security;
alter table diplomas               enable row level security;
alter table empleo_ofertas         enable row level security;
alter table empleo_aplicaciones    enable row level security;
alter table pagos                  enable row level security;
alter table notificaciones         enable row level security;
alter table calendar_events        enable row level security;
alter table documentos_formador    enable row level security;
alter table tipologias             enable row level security;
alter table descuentos             enable row level security;
alter table organizacion           enable row level security;

-- ── 2. organizacion: lectura pública, escritura admin ───────────────────────
drop policy if exists "org read"        on organizacion;
drop policy if exists "org admin write" on organizacion;
create policy "org read"        on organizacion for select using (true);
create policy "org admin write" on organizacion for all    using (is_superadmin()) with check (is_superadmin());

-- ── 3. usuarios ─────────────────────────────────────────────────────────────
drop policy if exists "usuarios self read"   on usuarios;
drop policy if exists "usuarios self update" on usuarios;
drop policy if exists "usuarios admin all"   on usuarios;
drop policy if exists "usuarios self insert" on usuarios;
create policy "usuarios self read"   on usuarios for select using (id = auth.uid() or is_superadmin());
create policy "usuarios self update" on usuarios for update using (id = auth.uid()) with check (id = auth.uid());
create policy "usuarios self insert" on usuarios for insert with check (id = auth.uid());
create policy "usuarios admin all"   on usuarios for all    using (is_superadmin()) with check (is_superadmin());

-- ── 4. formadores ───────────────────────────────────────────────────────────
drop policy if exists "formadores public list" on formadores;
drop policy if exists "formadores self update" on formadores;
drop policy if exists "formadores admin all"   on formadores;
create policy "formadores public list" on formadores for select using (true);  -- lista pública (alumnos ven docentes)
create policy "formadores self update" on formadores for update using (user_id = auth.uid())
  with check (
    -- el formador NO puede tocar tarifas ni trustScore ni cursos asignados
    tarifa_venta_directa   = (select tarifa_venta_directa   from formadores f2 where f2.id = formadores.id) and
    tarifa_venta_indirecta = (select tarifa_venta_indirecta from formadores f2 where f2.id = formadores.id) and
    tarifa_km              = (select tarifa_km              from formadores f2 where f2.id = formadores.id) and
    trust_score            = (select trust_score            from formadores f2 where f2.id = formadores.id) and
    cursos_asignados       = (select cursos_asignados       from formadores f2 where f2.id = formadores.id)
  );
create policy "formadores admin all" on formadores for all using (is_superadmin()) with check (is_superadmin());

-- ── 5. alumnos ──────────────────────────────────────────────────────────────
drop policy if exists "alumnos self"      on alumnos;
drop policy if exists "alumnos admin all" on alumnos;
create policy "alumnos self"      on alumnos for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "alumnos admin all" on alumnos for all using (is_superadmin()) with check (is_superadmin());

-- ── 6. cursos: lectura pública, escritura admin ────────────────────────────
drop policy if exists "cursos read"        on cursos;
drop policy if exists "cursos admin write" on cursos;
create policy "cursos read"        on cursos for select using (true);
create policy "cursos admin write" on cursos for all    using (is_superadmin()) with check (is_superadmin());

-- ── 7. imparticiones ────────────────────────────────────────────────────────
drop policy if exists "imparticiones read"        on imparticiones;
drop policy if exists "imparticiones admin write" on imparticiones;
create policy "imparticiones read"        on imparticiones for select using (true);
create policy "imparticiones admin write" on imparticiones for all    using (is_superadmin()) with check (is_superadmin());

-- ── 8. solicitudes ──────────────────────────────────────────────────────────
drop policy if exists "solicitudes formador read" on solicitudes;
drop policy if exists "solicitudes formador insert" on solicitudes;
drop policy if exists "solicitudes admin all" on solicitudes;
create policy "solicitudes formador read" on solicitudes for select using (
  trainer_id in (select id from formadores where user_id = auth.uid()) or is_superadmin()
);
create policy "solicitudes formador insert" on solicitudes for insert with check (
  is_formador() and trainer_id in (select id from formadores where user_id = auth.uid())
);
create policy "solicitudes admin all" on solicitudes for all using (is_superadmin()) with check (is_superadmin());

-- ── 9. bitacoras ────────────────────────────────────────────────────────────
drop policy if exists "bitacora formador own"     on bitacoras;
drop policy if exists "bitacora formador insert"  on bitacoras;
drop policy if exists "bitacora formador update"  on bitacoras;
drop policy if exists "bitacora admin all"        on bitacoras;
create policy "bitacora formador own"    on bitacoras for select
  using (formador_id in (select id from formadores where user_id = auth.uid()) or is_superadmin());
create policy "bitacora formador insert" on bitacoras for insert
  with check (formador_id in (select id from formadores where user_id = auth.uid()));
create policy "bitacora formador update" on bitacoras for update
  using  (formador_id in (select id from formadores where user_id = auth.uid()))
  with check (formador_id in (select id from formadores where user_id = auth.uid()));
create policy "bitacora admin all" on bitacoras for all using (is_superadmin()) with check (is_superadmin());

-- ── 10. tareas ──────────────────────────────────────────────────────────────
drop policy if exists "tareas formador own"    on tareas;
drop policy if exists "tareas formador update" on tareas;
drop policy if exists "tareas admin all"       on tareas;
create policy "tareas formador own"    on tareas for select
  using (formador_id in (select id from formadores where user_id = auth.uid()) or is_superadmin());
create policy "tareas formador update" on tareas for update
  using (formador_id in (select id from formadores where user_id = auth.uid()))
  with check (formador_id in (select id from formadores where user_id = auth.uid()));
create policy "tareas admin all" on tareas for all using (is_superadmin()) with check (is_superadmin());

-- ── 11. asistencia ──────────────────────────────────────────────────────────
drop policy if exists "asis sesion formador" on asistencia_sesiones;
drop policy if exists "asis sesion admin"    on asistencia_sesiones;
drop policy if exists "asis records via sesion" on asistencia_records;
create policy "asis sesion formador" on asistencia_sesiones for all
  using (formador_id in (select id from formadores where user_id = auth.uid()))
  with check (formador_id in (select id from formadores where user_id = auth.uid()));
create policy "asis sesion admin" on asistencia_sesiones for all using (is_superadmin()) with check (is_superadmin());
create policy "asis records via sesion" on asistencia_records for all using (
  exists (select 1 from asistencia_sesiones s
          where s.id = sesion_id
          and (s.formador_id in (select id from formadores where user_id = auth.uid()) or is_superadmin()))
);

-- ── 12. matriculas ──────────────────────────────────────────────────────────
drop policy if exists "matriculas alumno self"   on matriculas;
drop policy if exists "matriculas alumno insert" on matriculas;
drop policy if exists "matriculas admin all"     on matriculas;
create policy "matriculas alumno self" on matriculas for select
  using (alumno_id in (select id from alumnos where user_id = auth.uid()) or is_superadmin());
create policy "matriculas alumno insert" on matriculas for insert
  with check (alumno_id in (select id from alumnos where user_id = auth.uid()));
create policy "matriculas admin all" on matriculas for all using (is_superadmin()) with check (is_superadmin());

-- ── 13. diplomas ────────────────────────────────────────────────────────────
drop policy if exists "diplomas alumno self" on diplomas;
drop policy if exists "diplomas admin all"   on diplomas;
create policy "diplomas alumno self" on diplomas for select
  using (alumno_id in (select id from alumnos where user_id = auth.uid()) or is_superadmin());
create policy "diplomas admin all" on diplomas for all using (is_superadmin()) with check (is_superadmin());

-- ── 14. notificaciones ──────────────────────────────────────────────────────
drop policy if exists "notif owner" on notificaciones;
create policy "notif owner" on notificaciones for all using (user_id = auth.uid() or is_superadmin()) with check (user_id = auth.uid() or is_superadmin());

-- ── 15. calendar_events ─────────────────────────────────────────────────────
drop policy if exists "calendar owner" on calendar_events;
create policy "calendar owner" on calendar_events for all using (user_id = auth.uid() or is_superadmin()) with check (user_id = auth.uid() or is_superadmin());

-- ── 16. documentos_formador ─────────────────────────────────────────────────
drop policy if exists "docs formador owner" on documentos_formador;
create policy "docs formador owner" on documentos_formador for all
  using (formador_id in (select id from formadores where user_id = auth.uid()) or is_superadmin())
  with check (formador_id in (select id from formadores where user_id = auth.uid()) or is_superadmin());

-- ── 17. empleo (ofertas públicas / aplicaciones privadas) ───────────────────
drop policy if exists "ofertas read"        on empleo_ofertas;
drop policy if exists "ofertas admin write" on empleo_ofertas;
drop policy if exists "aplicaciones owner"  on empleo_aplicaciones;
create policy "ofertas read"        on empleo_ofertas for select using (status = 'activa' or is_superadmin());
create policy "ofertas admin write" on empleo_ofertas for all using (is_superadmin()) with check (is_superadmin());
create policy "aplicaciones owner"  on empleo_aplicaciones for all
  using (alumno_id in (select id from alumnos where user_id = auth.uid()) or is_superadmin())
  with check (alumno_id in (select id from alumnos where user_id = auth.uid()) or is_superadmin());

-- ── 18. pagos ───────────────────────────────────────────────────────────────
drop policy if exists "pagos owner read" on pagos;
drop policy if exists "pagos admin write" on pagos;
create policy "pagos owner read" on pagos for select using (alumno_id in (select id from alumnos where user_id = auth.uid()) or is_superadmin());
create policy "pagos admin write" on pagos for all using (is_superadmin()) with check (is_superadmin());

-- ── 19. tipologias y descuentos ─────────────────────────────────────────────
drop policy if exists "tipologias read"        on tipologias;
drop policy if exists "tipologias admin write" on tipologias;
create policy "tipologias read"        on tipologias for select using (true);
create policy "tipologias admin write" on tipologias for all using (is_superadmin()) with check (is_superadmin());

drop policy if exists "descuentos read"        on descuentos;
drop policy if exists "descuentos admin write" on descuentos;
create policy "descuentos read"        on descuentos for select using (active = true or is_superadmin());
create policy "descuentos admin write" on descuentos for all using (is_superadmin()) with check (is_superadmin());

-- ── 20. Storage buckets ─────────────────────────────────────────────────────
insert into storage.buckets (id, name, public) values
  ('cv',            'cv',            false),
  ('diplomas',      'diplomas',      false),
  ('firmas',        'firmas',        false),
  ('docs-formador', 'docs-formador', false)
on conflict (id) do nothing;

-- Políticas de storage (cada usuario accede solo a archivos cuyo path
-- empieza con su uid)
drop policy if exists "cv self" on storage.objects;
create policy "cv self" on storage.objects for all using (
  bucket_id = 'cv' and (
    split_part(name, '/', 1)::uuid = auth.uid() or
    (select role_type from usuarios where id = auth.uid()) = 'superadmin'
  )
);

drop policy if exists "diplomas read" on storage.objects;
create policy "diplomas read" on storage.objects for select using (
  bucket_id = 'diplomas' and (
    split_part(name, '/', 1)::uuid = auth.uid() or
    (select role_type from usuarios where id = auth.uid()) in ('superadmin','formador')
  )
);

drop policy if exists "diplomas write admin" on storage.objects;
create policy "diplomas write admin" on storage.objects for insert with check (
  bucket_id = 'diplomas' and (select role_type from usuarios where id = auth.uid()) in ('superadmin','formador')
);

drop policy if exists "firmas formador" on storage.objects;
create policy "firmas formador" on storage.objects for all using (
  bucket_id = 'firmas' and (
    split_part(name, '/', 1)::uuid = auth.uid() or
    (select role_type from usuarios where id = auth.uid()) = 'superadmin'
  )
);

drop policy if exists "docs-formador self" on storage.objects;
create policy "docs-formador self" on storage.objects for all using (
  bucket_id = 'docs-formador' and (
    split_part(name, '/', 1)::uuid = auth.uid() or
    (select role_type from usuarios where id = auth.uid()) = 'superadmin'
  )
);

-- ── ✓ RLS y Storage configurados ────────────────────────────────────────────
-- Siguiente paso: la migración de datos la ejecuta Claude desde Node con
-- service_role key (scripts/migrate-data.mjs).
