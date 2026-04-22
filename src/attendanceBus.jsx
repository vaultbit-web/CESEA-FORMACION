// ─── CESEA Formación — Bus cross-app de asistencia (self check-in) ────────────
//
// Las dos apps (formadores en :3000 y alumnado en :3001) están aisladas pero
// comparten el mismo browser. Usamos localStorage como canal de mensajería:
// el alumno escribe su check-in desde su app y el formador lo lee desde la suya.
//
// FILEMAKER: En producción este bus se reemplaza por una de estas opciones:
//   1. WebSocket o Server-Sent Events desde FileMaker Server.
//   2. Polling cada 10 s sobre layout "Asistencia_CheckIns".
//   3. Push notification vía PushNotification API de FileMaker 20+.
// Formato de cada mensaje: { id, courseId, courseTitle, sessionDate,
//   studentId, studentName, status: 'pending'|'confirmed'|'partial'|'rejected',
//   checkedInAt, validatedAt }.
// ─────────────────────────────────────────────────────────────────────────────

const ATTENDANCE_BUS_KEY = 'cesea_attendance_bus_v1';

function readAttendanceBus() {
  try {
    const raw = localStorage.getItem(ATTENDANCE_BUS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('[attendanceBus] read error', e);
    return [];
  }
}

function writeAttendanceBus(arr) {
  try {
    localStorage.setItem(ATTENDANCE_BUS_KEY, JSON.stringify(arr));
    // Notifica a la misma pestaña (el evento 'storage' solo dispara entre pestañas).
    window.dispatchEvent(new Event('cesea-attendance-updated'));
  } catch (e) {
    console.warn('[attendanceBus] write error', e);
  }
}

function subscribeAttendanceBus(callback) {
  const handler = () => callback(readAttendanceBus());
  window.addEventListener('storage', handler);
  window.addEventListener('cesea-attendance-updated', handler);
  callback(readAttendanceBus());
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('cesea-attendance-updated', handler);
  };
}

// Helpers de alto nivel (mismas firmas en ambas apps para simetría).
function studentCheckIn({ courseId, courseTitle, sessionDate, studentId, studentName }) {
  const bus = readAttendanceBus();
  const exists = bus.find(e => e.courseId === courseId && e.studentId === studentId && e.sessionDate === sessionDate);
  if (exists) return exists.id;
  const id = 'CHK-' + Date.now();
  bus.push({
    id, courseId, courseTitle, sessionDate, studentId, studentName,
    status: 'pending', checkedInAt: new Date().toISOString(), validatedAt: null,
  });
  writeAttendanceBus(bus);
  return id;
}

function validateCheckIn(checkInId, status) {
  const bus = readAttendanceBus();
  const idx = bus.findIndex(e => e.id === checkInId);
  if (idx === -1) return false;
  bus[idx] = { ...bus[idx], status, validatedAt: new Date().toISOString() };
  writeAttendanceBus(bus);
  return true;
}

function clearOldCheckIns(daysAgo = 30) {
  const cutoff = Date.now() - daysAgo * 86400 * 1000;
  const filtered = readAttendanceBus().filter(e => new Date(e.checkedInAt).getTime() >= cutoff);
  writeAttendanceBus(filtered);
}

window.AttendanceBus = {
  KEY:        ATTENDANCE_BUS_KEY,
  read:       readAttendanceBus,
  write:      writeAttendanceBus,
  subscribe:  subscribeAttendanceBus,
  checkIn:    studentCheckIn,
  validate:   validateCheckIn,
  clearOld:   clearOldCheckIns,
};
