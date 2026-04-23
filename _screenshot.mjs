// Script de captura automática de screenshots del producto real.
// Usa Chrome DevTools Protocol via --remote-debugging-port (sin puppeteer).
// No modifica nada de la app — sólo accede a las credenciales DEMO expuestas globalmente.

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9223;
const BASE = 'http://localhost:8765';
const OUT_DIR = 'c:\\Users\\danie\\Desktop\\CESEA FORMACION\\RECURSOS PARA MARKETING\\assets';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitForPort(port, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await new Promise((resolve, reject) => {
        const sock = net.createConnection({ port, host: '127.0.0.1' });
        sock.on('connect', () => { sock.end(); resolve(); });
        sock.on('error', reject);
      });
      return true;
    } catch { await sleep(200); }
  }
  throw new Error('Chrome debug port not ready');
}

async function getTarget(port) {
  const res = await fetch(`http://127.0.0.1:${port}/json`);
  const list = await res.json();
  return list.find(t => t.type === 'page');
}

function cdpClient(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let msgId = 0;
    const pending = new Map();
    const listeners = [];
    ws.onopen = () => {
      resolve({
        send(method, params = {}) {
          msgId++;
          const id = msgId;
          return new Promise((res, rej) => {
            pending.set(id, { res, rej });
            ws.send(JSON.stringify({ id, method, params }));
          });
        },
        on(event, cb) { listeners.push({ event, cb }); },
        waitFor(event, timeout = 10000) {
          return new Promise((res, rej) => {
            const t = setTimeout(() => rej(new Error('timeout waiting for ' + event)), timeout);
            listeners.push({ event, cb: (data) => { clearTimeout(t); res(data); }, once: true });
          });
        },
        close() { ws.close(); },
      });
    };
    ws.onerror = (e) => reject(new Error('WS error: ' + e.message));
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) rej(new Error(msg.error.message));
        else res(msg.result);
      }
      if (msg.method) {
        for (let i = listeners.length - 1; i >= 0; i--) {
          const l = listeners[i];
          if (l.event === msg.method) {
            l.cb(msg.params);
            if (l.once) listeners.splice(i, 1);
          }
        }
      }
    };
  });
}

async function capture(client, name, width, height, setupJs = null, extraWait = 0) {
  console.log(`→ ${name} (${width}x${height})`);
  await client.send('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: 1.5, mobile: false,
  });
  await client.send('Page.navigate', { url: BASE + '/index.html' });
  await client.waitFor('Page.loadEventFired', 15000);
  await sleep(3200); // let React hydrate and render cards

  if (setupJs) {
    const r = await client.send('Runtime.evaluate', { expression: setupJs, returnByValue: true });
    console.log('    setup →', r.result && r.result.value);
    // Plan B: si el click JS no cambió la vista, disparar Input.dispatchMouseEvent
    let parsed = null;
    try { parsed = JSON.parse(r.result.value); } catch {}
    if (parsed && parsed.ok && parsed.x != null) {
      // Un click nativo adicional garantiza que React procesa el evento
      await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: parsed.x, y: parsed.y, button: 'left', clickCount: 1 });
      await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: parsed.x, y: parsed.y, button: 'left', clickCount: 1 });
    }
    await sleep(1800 + extraWait);
  }

  const shot = await client.send('Page.captureScreenshot', {
    format: 'png', captureBeyondViewport: false,
  });
  const file = path.join(OUT_DIR, name + '.png');
  fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
  console.log(`  ✓ saved ${file}  (${(shot.data.length / 1024 / 1.33).toFixed(0)} KB approx)`);
}

(async () => {
  console.log('Launching Chrome headless on port', PORT);
  const profileDir = 'C:\\Windows\\Temp\\cesea-screenshot-profile';
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch {}
  const chrome = spawn(CHROME, [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profileDir}`,
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-background-networking',
    'about:blank',
  ], { stdio: ['ignore', 'pipe', 'pipe'] });
  chrome.on('exit', (code) => console.log('Chrome exited', code));

  await waitForPort(PORT);
  await sleep(800);
  const target = await getTarget(PORT);
  if (!target) throw new Error('No target page');
  const client = await cdpClient(target.webSocketDebuggerUrl);
  await client.send('Page.enable');

  // Helper JS: click en la card demo que coincide con el label de la credencial.
  // Devuelve coordenadas para hacer click nativo si el click JS no propaga.
  const loginAs = (roleType) => `
    (() => {
      const creds = window.DEMO_CREDENTIALS || [];
      const cred = creds.find(c => c.roleType === '${roleType}');
      if (!cred) return JSON.stringify({ok:false,err:'no-cred',roles:creds.map(c=>c.roleType)});
      // Buscar el BUTTON demo que contiene el email (único por credencial)
      const email = cred.email;
      const buttons = [...document.querySelectorAll('button')];
      const el = buttons.find(b => (b.textContent||'').includes(email));
      if (!el) {
        return JSON.stringify({ok:false,err:'no-match',email,btnCount:buttons.length,sample:buttons.slice(0,2).map(b=>(b.textContent||'').slice(0,50))});
      }
      const r = el.getBoundingClientRect();
      el.click();
      return JSON.stringify({ok:true,tag:el.tagName,x:~~(r.x+r.width/2),y:~~(r.y+r.height/2),email});
    })()
  `;

  const navigateTo = (view) => `
    (() => {
      const set = window.__setView || null;
      if (set) { set('${view}'); return 'ok'; }
      // Buscar link/button por id
      const candidates = [...document.querySelectorAll('[data-view], a, button, div')];
      const match = candidates.find(el => (el.textContent || '').trim().toLowerCase() === '${view}'.toLowerCase());
      if (match) { match.click(); return 'clicked'; }
      return 'no-match';
    })()
  `;

  try {
    // 1) Login page (sin autenticar)
    await capture(client, 'screenshot-login', 1440, 900);

    // 2) Vista Superadmin (dashboard admin)
    await capture(client, 'screenshot-admin',  1440, 900, loginAs('superadmin'), 1500);

    // 3) Vista Alumno
    await capture(client, 'screenshot-alumno', 1440, 900, loginAs('alumno'), 1500);

    // 4) Vista Formador
    await capture(client, 'screenshot-formador', 1440, 900, loginAs('formador'), 1500);

    // 5) Móvil alumno
    await capture(client, 'screenshot-mobile', 390, 844, loginAs('alumno'), 1500);

    // 6) Tablet admin
    await capture(client, 'screenshot-tablet', 1024, 768, loginAs('superadmin'), 1500);

  } finally {
    client.close();
    chrome.kill();
  }
})();
