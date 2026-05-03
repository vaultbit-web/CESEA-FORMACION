// ─── CESEA Formación · Service layer Supabase ────────────────────────────────
//
// Único punto de contacto con la base de datos. Todas las acciones del UI
// (los 47 botones del plan) pasan por aquí.
//
// Si la flag global `window.USE_SUPABASE` es false (no hay config), las
// funciones devuelven `null` y mockData.jsx sigue usando los useState locales.
//
// FILEMAKER: este archivo es el equivalente al "Capa de scripts FM" — cuando
//   se porte a FileMaker, cada función de aquí se mapea a un script FM con
//   los mismos parámetros.
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  const sb = window.supabaseClient;
  if (!sb) {
    window.api = null;
    window.USE_SUPABASE = false;
    console.info('[api] Supabase no configurado. Usando mocks.');
    return;
  }
  window.USE_SUPABASE = true;

  // ── Helpers ────────────────────────────────────────────────────────────
  const dataUrlToBlob = (d) => {
    const [meta, b64] = d.split(',');
    const mime = meta.match(/:(.*?);/)[1];
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  };

  const myAlumnoId = async () => {
    const { data: u } = await sb.auth.getUser();
    if (!u?.user) return null;
    const { data } = await sb.from('alumnos').select('id').eq('user_id', u.user.id).maybeSingle();
    return data?.id || null;
  };

  const myFormadorId = async () => {
    const { data: u } = await sb.auth.getUser();
    if (!u?.user) return null;
    const { data } = await sb.from('formadores').select('id').eq('user_id', u.user.id).maybeSingle();
    return data?.id || null;
  };

  // ── AUTH ────────────────────────────────────────────────────────────────
  const auth = {
    async signIn(email, password) {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Cargar perfil completo
      const { data: profile } = await sb.from('usuarios').select('*').eq('id', data.user.id).single();
      let extra = {};
      if (profile.role_type === 'formador') {
        const { data: f } = await sb.from('formadores').select('*').eq('user_id', data.user.id).maybeSingle();
        if (f) extra = { ...f, dniFull: f.dni, ibanFull: f.iban };
      } else if (profile.role_type === 'alumno') {
        const { data: a } = await sb.from('alumnos').select('*').eq('user_id', data.user.id).maybeSingle();
        if (a) extra = a;
      }
      return { ...data.user, ...profile, roleType: profile.role_type, ...extra };
    },
    async signOut() { await sb.auth.signOut(); },
    async getSession() { return (await sb.auth.getSession()).data.session; },
    onChange(cb) { return sb.auth.onAuthStateChange((_, s) => cb(s)); },
    // ─── Comprobar si un email pertenece a un formador pre-registrado ──────
    // FILEMAKER: equivale a un Find sobre Formadores::email antes del Sign Up.
    //   Si match, el formulario muestra "Bienvenido <nombre>" y solo pide
    //   contraseña. El admin del sistema NO ve este lookup público (la consulta
    //   usa anon key contra la columna email de formadores; los datos sensibles
    //   están protegidos por RLS).
    async lookupPreRegistro(email) {
      if (!email) return null;
      const { data: f } = await sb.from('formadores')
        .select('id, name, status, user_id')
        .ilike('email', email.trim())
        .is('user_id', null)            // solo pre-registrados (sin user_id aún)
        .maybeSingle();
      return f;   // null si no existe o ya está vinculado
    },

    async register({ email, password, name, role, sector }) {
      // Si el email coincide con un formador pre-registrado, lo vinculamos
      // y el rol pasa a 'formador' aunque el usuario hubiera elegido 'alumno'.
      const preFormador = await this.lookupPreRegistro(email);
      const finalRole   = preFormador ? 'formador' : (role || 'alumno');
      const finalName   = name || preFormador?.name || email.split('@')[0];

      const { data, error } = await sb.auth.signUp({
        email, password,
        options: { data: { name: finalName } },
      });
      if (error) throw error;

      const initials = finalName.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

      await sb.from('usuarios').insert({
        id: data.user.id, role_type: finalRole,
        email, name: finalName, initials,
      });

      if (finalRole === 'formador' && preFormador) {
        // Vincular formador existente del Excel
        await sb.from('formadores').update({
          user_id: data.user.id,
          status:  'Activo',
          join_date: new Date().toISOString().slice(0, 10),
        }).eq('id', preFormador.id);
      } else if (finalRole === 'formador') {
        // Formador nuevo (no estaba en el Excel pre-registro)
        await sb.from('formadores').insert({
          user_id: data.user.id,
          email, name: finalName,
          status: 'Activo',
          join_date: new Date().toISOString().slice(0, 10),
        });
      } else {
        // Alumno
        await sb.from('alumnos').insert({
          user_id: data.user.id,
          email, name: finalName,
          sector: sector || 'dental',
        });
      }

      return { user: data.user, role: finalRole, linkedTo: preFormador?.name || null };
    },
  };

  // ── CURSOS ──────────────────────────────────────────────────────────────
  const cursos = {
    async list() {
      const { data, error } = await sb.from('cursos').select('*').neq('status', 'archived').order('codigo_interno');
      if (error) throw error;
      // mapear a la shape que espera el frontend (camelCase)
      return (data || []).map(mapCursoFromDB);
    },
    async create(payload) {
      const dbPayload = mapCursoToDB(payload);
      const { data, error } = await sb.from('cursos').insert(dbPayload).select().single();
      if (error) throw error;
      return mapCursoFromDB(data);
    },
    async update(id, patch) {
      const { data, error } = await sb.from('cursos').update(mapCursoToDB(patch)).eq('id', id).select().single();
      if (error) throw error;
      return mapCursoFromDB(data);
    },
    async archive(id) { return await this.update(id, { status: 'archived' }); },
    async bulkUpsert(rows) {
      const { error } = await sb.from('cursos').upsert(rows.map(mapCursoToDB), { onConflict: 'codigo_interno' });
      if (error) throw error;
    },
  };

  // mapper DB row -> frontend shape
  function mapCursoFromDB(c) {
    if (!c) return null;
    return {
      id: c.id,
      codigoInterno: c.codigo_interno,
      title: c.title,
      subtitle: c.subtitle,
      area: c.area,
      category: c.category,
      contenidos: c.contenidos,
      objetivos: c.objetivos,
      tipoContrato: c.tipo_contrato,
      modality: c.modality,
      hours: c.hours,
      numImparticiones: c.num_imparticiones,
      ciudades: c.ciudades || [],
      formadoresAsignados: c.formadores_asignados || [],
      level: c.level,
      status: c.status,
      official: c.official,
      rating: Number(c.rating || 0),
      students: c.students_count || 0,
      price: Number(c.price || 0),
      dates: c.dates || '',
      startDate: c.start_date,
      endDate: c.end_date,
      time: c.time_str || '',
      location: c.location || '',
      tags: [c.category, c.area].filter(Boolean),
      createdAt: c.created_at,
    };
  }
  function mapCursoToDB(c) {
    const out = {};
    if ('codigoInterno' in c) out.codigo_interno = c.codigoInterno;
    if ('title' in c) out.title = c.title;
    if ('subtitle' in c) out.subtitle = c.subtitle;
    if ('area' in c) out.area = c.area;
    if ('category' in c) out.category = c.category;
    if ('contenidos' in c) out.contenidos = c.contenidos;
    if ('objetivos' in c) out.objetivos = c.objetivos;
    if ('tipoContrato' in c) out.tipo_contrato = c.tipoContrato;
    if ('modality' in c) out.modality = c.modality;
    if ('hours' in c) out.hours = c.hours;
    if ('numImparticiones' in c) out.num_imparticiones = c.numImparticiones;
    if ('ciudades' in c) out.ciudades = c.ciudades;
    if ('formadoresAsignados' in c) out.formadores_asignados = c.formadoresAsignados;
    if ('level' in c) out.level = c.level;
    if ('status' in c) out.status = c.status;
    if ('official' in c) out.official = c.official;
    if ('rating' in c) out.rating = c.rating;
    if ('price' in c) out.price = c.price;
    if ('dates' in c) out.dates = c.dates;
    if ('startDate' in c) out.start_date = c.startDate;
    if ('endDate' in c) out.end_date = c.endDate;
    if ('time' in c) out.time_str = c.time;
    if ('location' in c) out.location = c.location;
    return out;
  }

  // ── FORMADORES ──────────────────────────────────────────────────────────
  const formadores = {
    async list() {
      const { data, error } = await sb.from('formadores').select('*').order('name');
      if (error) throw error;
      return (data || []).map(mapFormadorFromDB);
    },
    async update(id, patch) {
      const dbPatch = mapFormadorToDB(patch);
      const { error } = await sb.from('formadores').update(dbPatch).eq('id', id);
      if (error) throw error;
    },
    async setStatus(id, status) { return this.update(id, { status }); },
  };

  function mapFormadorFromDB(f) {
    if (!f) return null;
    return {
      id: f.id,
      idExterno: f.id_externo,
      userId: f.user_id,
      name: f.name,
      email: f.email,
      cif: f.cif,
      nColegiado: f.n_colegiado,
      phone: f.phone,
      poblacion: f.poblacion,
      status: f.status,
      joinDate: f.join_date,
      photo: null,
      specialty: f.specialty,
      hoursYTD: f.hours_ytd,
      dni: f.dni,
      iban: f.iban,
      official: f.official,
      rating: Number(f.rating || 0),
      trustScore: f.trust_score,
      tarifaVentaDirecta: Number(f.tarifa_venta_directa || 0),
      tarifaVentaIndirecta: Number(f.tarifa_venta_indirecta || 0),
      tarifaKm: Number(f.tarifa_km || 0),
      tipologias: f.tipologias || [],
      cursosAsignados: f.cursos_asignados || [],
    };
  }
  function mapFormadorToDB(f) {
    const out = {};
    if ('name' in f) out.name = f.name;
    if ('email' in f) out.email = f.email;
    if ('phone' in f) out.phone = f.phone;
    if ('poblacion' in f) out.poblacion = f.poblacion;
    if ('status' in f) out.status = f.status;
    if ('specialty' in f) out.specialty = f.specialty;
    if ('hoursYTD' in f) out.hours_ytd = f.hoursYTD;
    if ('dni' in f) out.dni = f.dni;
    if ('iban' in f) out.iban = f.iban;
    if ('rating' in f) out.rating = f.rating;
    if ('trustScore' in f) out.trust_score = f.trustScore;
    if ('tarifaVentaDirecta' in f) out.tarifa_venta_directa = f.tarifaVentaDirecta;
    if ('tarifaVentaIndirecta' in f) out.tarifa_venta_indirecta = f.tarifaVentaIndirecta;
    if ('tarifaKm' in f) out.tarifa_km = f.tarifaKm;
    if ('tipologias' in f) out.tipologias = f.tipologias;
    if ('cursosAsignados' in f) out.cursos_asignados = f.cursosAsignados;
    return out;
  }

  // ── SOLICITUDES ─────────────────────────────────────────────────────────
  const solicitudes = {
    async list({ tipo, status } = {}) {
      let q = sb.from('solicitudes').select('*').order('created_at', { ascending: false });
      if (tipo)   q = q.eq('tipo', tipo);
      if (status) q = q.eq('status', status);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []).map(mapSolicitudFromDB);
    },
    async create(payload) {
      const fid = await myFormadorId();
      const dbPayload = {
        tipo: payload.tipo || payload.type,
        trainer_id: payload.trainerId || fid,
        trainer_name: payload.trainer || payload.trainerName,
        course_id: payload.courseId || null,
        course_title: payload.courseTitle || payload.title,
        detail: payload.detail,
        status: payload.status || 'pendiente',
        proposed_dates: payload.proposedDates || payload.dates,
        proposed_schedule: payload.proposedSchedule || payload.schedule,
        note: payload.note,
        rate: payload.rate,
        tipologia: payload.tipologia,
        hours: payload.hours,
        modality: payload.modality,
        objectives: payload.objectives,
        contents: payload.contents,
        incidencia_tipo: payload.incidenciaType,
        description: payload.description,
      };
      const { data, error } = await sb.from('solicitudes').insert(dbPayload).select().single();
      if (error) throw error;
      return mapSolicitudFromDB(data);
    },
    async approve(id) {
      const { data: req } = await sb.from('solicitudes').select('*').eq('id', id).single();
      if (req?.tipo === 'new' && req.course_title) {
        await sb.from('cursos').update({ status: 'accepted' }).eq('title', req.course_title);
      }
      if (req?.tipo === 'register' && req.trainer_id) {
        await sb.from('formadores').update({ status: 'Activo' }).eq('id', req.trainer_id);
      }
      const { error } = await sb.from('solicitudes').update({
        status: 'aprobada',
        resolved_at: new Date().toISOString(),
      }).eq('id', id);
      if (error) throw error;
    },
    async reject(id) {
      const { error } = await sb.from('solicitudes').update({
        status: 'rechazada',
        resolved_at: new Date().toISOString(),
      }).eq('id', id);
      if (error) throw error;
    },
  };

  function mapSolicitudFromDB(r) {
    if (!r) return null;
    return {
      id: r.id,
      type: r.tipo,
      trainerId: r.trainer_id,
      trainer: r.trainer_name,
      courseTitle: r.course_title,
      courseId: r.course_id,
      detail: r.detail,
      status: r.status,
      proposedDates: r.proposed_dates,
      proposedSchedule: r.proposed_schedule,
      note: r.note,
      rate: r.rate,
      tipologia: r.tipologia,
      hours: r.hours,
      modality: r.modality,
      objectives: r.objectives,
      contents: r.contents,
      incidenciaType: r.incidencia_tipo,
      description: r.description,
      date: r.created_at?.slice(0, 10),
    };
  }

  // ── BITACORAS ───────────────────────────────────────────────────────────
  const bitacoras = {
    async list() {
      const { data } = await sb.from('bitacoras').select('*').order('session_date', { ascending: false });
      return (data || []).map(b => ({
        id: b.id, courseId: b.curso_id, sessionDate: b.session_date,
        timeFrom: b.time_from, timeTo: b.time_to,
        incidents: b.incidents, notes: b.notes,
        present: b.present, total: b.total,
      }));
    },
    async create(entry) {
      const fid = await myFormadorId();
      const { data, error } = await sb.from('bitacoras').insert({
        curso_id: entry.courseId,
        session_date: entry.sessionDate,
        time_from: entry.timeFrom, time_to: entry.timeTo,
        incidents: entry.incidents, notes: entry.notes,
        present: entry.present, total: entry.total,
        formador_id: fid,
      }).select().single();
      if (error) throw error; return data;
    },
    async update(id, patch) {
      const dbP = {};
      if ('sessionDate' in patch) dbP.session_date = patch.sessionDate;
      if ('timeFrom' in patch) dbP.time_from = patch.timeFrom;
      if ('timeTo' in patch) dbP.time_to = patch.timeTo;
      if ('incidents' in patch) dbP.incidents = patch.incidents;
      if ('notes' in patch) dbP.notes = patch.notes;
      if ('present' in patch) dbP.present = patch.present;
      if ('total' in patch) dbP.total = patch.total;
      const { error } = await sb.from('bitacoras').update(dbP).eq('id', id);
      if (error) throw error;
    },
  };

  // ── TAREAS ──────────────────────────────────────────────────────────────
  const tareas = {
    async list() {
      const fid = await myFormadorId();
      let q = sb.from('tareas').select('*');
      if (fid) q = q.eq('formador_id', fid);
      const { data } = await q;
      return (data || []).map(t => ({
        id: t.id, courseId: t.curso_id, title: t.title,
        description: t.description, dueDate: t.due_date,
        status: t.status, signatureImg: t.signature_img,
        signedPdf: t.signed_pdf, deliverables: t.deliverables || [],
      }));
    },
    async sign(taskId, dataUrl) {
      const { data: u } = await sb.auth.getUser();
      const path = `${u.user.id}/${taskId}.png`;
      const blob = dataUrlToBlob(dataUrl);
      await sb.storage.from('firmas').upload(path, blob, { upsert: true, contentType: 'image/png' });
      await sb.from('tareas').update({ status: 'firmada', signature_img: path }).eq('id', taskId);
    },
    async addDeliverable(taskId, file) {
      const { data: u } = await sb.auth.getUser();
      const path = `${u.user.id}/${taskId}/${file.name}`;
      await sb.storage.from('docs-formador').upload(path, file, { upsert: true });
      const { data } = await sb.from('tareas').select('deliverables').eq('id', taskId).single();
      const list = [...(data.deliverables || []), { name: file.name, uploadedAt: new Date().toISOString().slice(0,10), size: file.size }];
      await sb.from('tareas').update({ deliverables: list }).eq('id', taskId);
    },
    async setStatus(taskId, status) {
      await sb.from('tareas').update({ status }).eq('id', taskId);
    },
  };

  // ── ASISTENCIA ──────────────────────────────────────────────────────────
  const asistencia = {
    async list() {
      const { data } = await sb.from('asistencia_sesiones').select('*, asistencia_records(*)');
      return (data || []).map(s => ({
        id: s.id, courseId: s.curso_id, fecha: s.fecha,
        timeFrom: s.time_from, timeTo: s.time_to,
        records: (s.asistencia_records || []).map(r => ({
          studentId: r.alumno_id, status: r.status, notes: r.notes, origin: r.origin,
        })),
      }));
    },
    async setRecord(sesionId, alumnoId, status, notes = '') {
      await sb.from('asistencia_records').upsert({
        sesion_id: sesionId, alumno_id: alumnoId,
        status, notes, origin: 'manual',
      }, { onConflict: 'sesion_id,alumno_id' });
    },
  };

  // ── MATRICULAS ──────────────────────────────────────────────────────────
  const matriculas = {
    async listMine() {
      const aid = await myAlumnoId();
      if (!aid) return [];
      const { data } = await sb.from('matriculas').select('*, cursos(*)').eq('alumno_id', aid);
      return (data || []).map(m => ({
        id: m.id, courseId: m.curso_id,
        progress: m.progress, status: m.status,
        enrolledAt: m.enrolled_at, completedAt: m.completed_at,
        course: mapCursoFromDB(m.cursos),
      }));
    },
    async create({ courseId, paymentData = null }) {
      const aid = await myAlumnoId();
      let paymentId = null;
      if (paymentData) {
        const { data: p } = await sb.from('pagos').insert({
          alumno_id: aid,
          amount: paymentData.amount,
          method: paymentData.method,
          status: 'pagado',
        }).select().single();
        paymentId = p.id;
      }
      const { data, error } = await sb.from('matriculas').insert({
        alumno_id: aid, curso_id: courseId, payment_id: paymentId,
      }).select().single();
      if (error) throw error;
      return data;
    },
    async advance(id, delta = 10) {
      const { data: cur } = await sb.from('matriculas').select('progress').eq('id', id).single();
      const next = Math.min(100, (cur.progress || 0) + delta);
      const patch = { progress: next };
      if (next === 100) { patch.status = 'completado'; patch.completed_at = new Date().toISOString(); }
      await sb.from('matriculas').update(patch).eq('id', id);
    },
    async complete(id) {
      await sb.from('matriculas').update({ status: 'completado', progress: 100, completed_at: new Date().toISOString() }).eq('id', id);
    },
  };

  // ── DIPLOMAS ────────────────────────────────────────────────────────────
  const diplomas = {
    async listMine() {
      const aid = await myAlumnoId();
      if (!aid) return [];
      const { data } = await sb.from('diplomas').select('*, cursos(*)').eq('alumno_id', aid);
      return data || [];
    },
  };

  // ── EMPLEO ──────────────────────────────────────────────────────────────
  const empleo = {
    async listOfertas() {
      const { data } = await sb.from('empleo_ofertas').select('*').eq('status', 'activa').order('created_at', { ascending: false });
      return data || [];
    },
    async createOferta(payload) {
      const { data, error } = await sb.from('empleo_ofertas').insert(payload).select().single();
      if (error) throw error; return data;
    },
    async updateOferta(id, patch) { await sb.from('empleo_ofertas').update(patch).eq('id', id); },
    async archiveOferta(id) { await sb.from('empleo_ofertas').update({ status: 'archivada' }).eq('id', id); },
    async aplicar(ofertaId) {
      const aid = await myAlumnoId();
      await sb.from('empleo_aplicaciones').insert({ oferta_id: ofertaId, alumno_id: aid });
    },
    async retirarAplicacion(appId) { await sb.from('empleo_aplicaciones').delete().eq('id', appId); },
    async listMisAplicaciones() {
      const aid = await myAlumnoId();
      if (!aid) return [];
      const { data } = await sb.from('empleo_aplicaciones').select('*, empleo_ofertas(*)').eq('alumno_id', aid);
      return data || [];
    },
  };

  // ── PAGOS ───────────────────────────────────────────────────────────────
  const pagos = {
    async listMine() {
      const aid = await myAlumnoId();
      if (!aid) return [];
      const { data } = await sb.from('pagos').select('*').eq('alumno_id', aid).order('created_at', { ascending: false });
      return data || [];
    },
    async validateDiscount(code) {
      const { data } = await sb.from('descuentos').select('*').eq('code', String(code || '').toUpperCase()).eq('active', true).maybeSingle();
      return data;
    },
  };

  // ── NOTIFICACIONES ──────────────────────────────────────────────────────
  const notif = {
    async listMine() {
      const { data: u } = await sb.auth.getUser();
      if (!u?.user) return [];
      const { data } = await sb.from('notificaciones').select('*').eq('user_id', u.user.id).order('created_at', { ascending: false });
      return data || [];
    },
    async markAllRead() {
      const { data: u } = await sb.auth.getUser();
      if (!u?.user) return;
      await sb.from('notificaciones').update({ read: true }).eq('user_id', u.user.id).eq('read', false);
    },
    async markOne(id) { await sb.from('notificaciones').update({ read: true }).eq('id', id); },
  };

  // ── CALENDAR ────────────────────────────────────────────────────────────
  const calendar = {
    async list() {
      const { data: u } = await sb.auth.getUser();
      if (!u?.user) return [];
      const { data } = await sb.from('calendar_events').select('*').eq('user_id', u.user.id);
      return data || [];
    },
    async create(ev) {
      const { data: u } = await sb.auth.getUser();
      const { data, error } = await sb.from('calendar_events').insert({
        user_id: u.user.id,
        title: ev.title, date: ev.date,
        time_from: ev.from || ev.timeFrom,
        time_to:   ev.to   || ev.timeTo,
        curso_id:  ev.courseId,
        type: ev.type || 'personal',
      }).select().single();
      if (error) throw error;
      return data;
    },
    async remove(id) { await sb.from('calendar_events').delete().eq('id', id); },
  };

  // ── DOCUMENTOS DEL FORMADOR ─────────────────────────────────────────────
  const documentos = {
    async list() {
      const fid = await myFormadorId();
      if (!fid) return [];
      const { data } = await sb.from('documentos_formador').select('*').eq('formador_id', fid);
      return (data || []).map(d => ({
        id: d.id, name: d.name, type: d.doc_type,
        uploadedAt: d.uploaded_at, year: d.year, size: d.size_bytes,
        path: d.storage_path,
      }));
    },
    async upload(file, type = 'otro') {
      const { data: u } = await sb.auth.getUser();
      const fid = await myFormadorId();
      const path = `${u.user.id}/${type}-${Date.now()}-${file.name}`;
      const { error: eU } = await sb.storage.from('docs-formador').upload(path, file);
      if (eU) throw eU;
      const { data, error } = await sb.from('documentos_formador').insert({
        formador_id: fid, name: file.name, doc_type: type,
        storage_path: path, size_bytes: file.size,
        year: new Date().getFullYear(),
      }).select().single();
      if (error) throw error;
      return data;
    },
    async remove(id) {
      const { data } = await sb.from('documentos_formador').select('storage_path').eq('id', id).single();
      if (data) await sb.storage.from('docs-formador').remove([data.storage_path]);
      await sb.from('documentos_formador').delete().eq('id', id);
    },
  };

  // ── TIPOLOGIAS ──────────────────────────────────────────────────────────
  const tipologias = {
    async list() {
      const { data } = await sb.from('tipologias').select('name').order('name');
      return (data || []).map(t => t.name);
    },
    async add(name) { await sb.from('tipologias').insert({ name }); },
    async remove(name) { await sb.from('tipologias').delete().eq('name', name); },
  };

  // ── ALUMNOS / PERFIL ────────────────────────────────────────────────────
  const alumnos = {
    async listAll() {
      const { data } = await sb.from('alumnos').select('*');
      return (data || []).map(a => ({
        id: a.id, userId: a.user_id, name: a.name, email: a.email,
        sector: a.sector, location: a.location, bio: a.bio,
        cvFileName: a.cv_filename, cvUploadDate: a.cv_upload_date,
        joinDate: a.join_date,
      }));
    },
    async updateMine(patch) {
      const aid = await myAlumnoId();
      const dbP = {};
      if ('name' in patch) dbP.name = patch.name;
      if ('phone' in patch) dbP.phone = patch.phone;
      if ('bio' in patch) dbP.bio = patch.bio;
      if ('sector' in patch) dbP.sector = patch.sector;
      if ('location' in patch) dbP.location = patch.location;
      if ('cvFileName' in patch) { dbP.cv_filename = patch.cvFileName; dbP.cv_upload_date = new Date().toISOString().slice(0,10); }
      if (aid) await sb.from('alumnos').update(dbP).eq('id', aid);
    },
  };

  // ── ORGANIZACION ────────────────────────────────────────────────────────
  const organizacion = {
    async get() { return (await sb.from('organizacion').select('*').eq('id', 1).single()).data; },
    async update(patch) { await sb.from('organizacion').update(patch).eq('id', 1); },
  };

  // ── REALTIME ────────────────────────────────────────────────────────────
  const realtime = {
    onCursos(cb) {
      return sb.channel('rt-cursos')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cursos' }, p => cb(p))
        .subscribe();
    },
    onSolicitudes(cb) {
      return sb.channel('rt-solicitudes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitudes' }, p => cb(p))
        .subscribe();
    },
    onNotif(userId, cb) {
      return sb.channel('rt-notif-' + userId)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notificaciones', filter: 'user_id=eq.' + userId }, p => cb(p))
        .subscribe();
    },
    unsubscribe(ch) { if (ch) sb.removeChannel(ch); },
  };

  // ── EXPORT ──────────────────────────────────────────────────────────────
  window.api = {
    auth, cursos, formadores, solicitudes, bitacoras, tareas, asistencia,
    matriculas, diplomas, empleo, pagos, notif, calendar, documentos,
    tipologias, alumnos, organizacion, realtime,
  };

  console.info('[api] Service layer Supabase listo. window.api disponible.');
})();
