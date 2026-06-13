/* ЗаписьИИ — демо ИИ-администратора записи (SaaS-панель).
   Скриптовый «ИИ»: правила + сопоставление по ключевым словам.
   Работает офлайн, без API-ключа — надёжно для показа клиенту. */

'use strict';

/* ───────────────────────── Конфиг ниш ───────────────────────── */
const NICHES = {
  salon: {
    label: 'Салон красоты', accent: '#d6457f', accentSoft: '#fdeef4',
    name: 'Лина', role: 'Администратор салона «Аура»',
    greeting: 'Здравствуйте! 🌸 Я Лина, ИИ-администратор салона «Аура». Помогу подобрать услугу и записать вас на удобное время. С чего начнём?',
    address: 'ул. Ленина, 28 (вход с улицы, центр)', hours: 'ежедневно с 10:00 до 21:00',
    avgCheck: 2200, lostPerWeek: 14,
    services: [
      { id: 'hair-cut', name: 'Женская стрижка', dur: 60, price: 1500, kw: ['стрижк', 'подстрич', 'волос', 'постричь'] },
      { id: 'hair-color', name: 'Окрашивание', dur: 150, price: 4500, kw: ['окраш', 'покрас', 'цвет', 'тонир', 'мелир', 'блонд'] },
      { id: 'mani', name: 'Маникюр + покрытие', dur: 90, price: 1800, kw: ['маникюр', 'ногт', 'гель', 'покрыт'] },
      { id: 'pedi', name: 'Педикюр', dur: 90, price: 2200, kw: ['педикюр', 'стоп', 'ступн'] },
      { id: 'brows', name: 'Брови + ламинирование', dur: 45, price: 1300, kw: ['бров', 'ламинир', 'архитектур'] }
    ],
    popular: 'hair-cut'
  },
  barber: {
    label: 'Барбершоп', accent: '#1f6feb', accentSoft: '#e9f1ff',
    name: 'Макс', role: 'Барбершоп «Бритва»',
    greeting: 'Здарова! ✂️ На связи Макс, ИИ-администратор «Бритвы». Подскажу по услугам и запишу к мастеру. Что нужно?',
    address: 'ул. Маяковского, 14 (второй этаж)', hours: 'ежедневно с 10:00 до 22:00',
    avgCheck: 1400, lostPerWeek: 18,
    services: [
      { id: 'cut', name: 'Мужская стрижка', dur: 45, price: 1200, kw: ['стрижк', 'подстрич', 'постричь', 'волос'] },
      { id: 'beard', name: 'Моделирование бороды', dur: 30, price: 800, kw: ['борода', 'бород'] },
      { id: 'cut-beard', name: 'Стрижка + борода', dur: 60, price: 1800, kw: ['комплекс', 'всё', 'все', 'оба'] },
      { id: 'shave', name: 'Королевское бритьё', dur: 40, price: 1100, kw: ['брить', 'бритьё', 'бритв', 'опасн'] },
      { id: 'kids', name: 'Детская стрижка', dur: 30, price: 900, kw: ['дет', 'ребён', 'ребен', 'сын'] }
    ],
    popular: 'cut'
  },
  auto: {
    label: 'Автосервис', accent: '#e8590c', accentSoft: '#fff0e6',
    name: 'Сервис-бот', role: 'Автосервис «ГаражЪ»',
    greeting: 'Здравствуйте! 🔧 Это ИИ-администратор автосервиса «ГаражЪ». Запишу вашу машину на удобное время. Что беспокоит?',
    address: 'ул. Заводская, 3к2 (заезд с переулка)', hours: 'пн–сб с 9:00 до 20:00',
    avgCheck: 5500, lostPerWeek: 9,
    services: [
      { id: 'to', name: 'Плановое ТО', dur: 120, price: 4500, kw: ['то', 'обслуж', 'масло', 'фильтр', 'регламент'] },
      { id: 'diag', name: 'Компьютерная диагностика', dur: 60, price: 1500, kw: ['диагност', 'ошибк', 'check', 'чек', 'горит', 'лампоч'] },
      { id: 'tire', name: 'Шиномонтаж', dur: 45, price: 2000, kw: ['шин', 'колес', 'резин', 'шиномонт', 'диск'] },
      { id: 'brakes', name: 'Замена тормозов', dur: 90, price: 3500, kw: ['тормоз', 'колодк'] },
      { id: 'susp', name: 'Ремонт подвески', dur: 180, price: 7000, kw: ['подвеск', 'амортиз', 'рычаг'] }
    ],
    popular: 'diag',
    symptoms: [{
      kw: ['стучит', 'стук', 'гремит', 'скрип', 'скрежет', 'шум', 'вибра', 'вибри', 'дёрга', 'дерга', 'троит', 'глохн', 'не заводит', 'не едет', 'подтека', 'течёт', 'течет', 'дым', 'запах', 'перегрев', 'греется', 'кипит', 'лампоч', 'горит', 'ошибк', 'чек', 'check', 'загорел', 'странн', 'непонятн', 'что-то с', 'что то с'],
      to: 'diag',
      say: 'Чтобы не гадать по симптомам, начнём с диагностики — мастер найдёт причину и сразу скажет, что по работам и цене. На какой день записать машину на диагностику? 👇'
    }]
  },
  clinic: {
    label: 'Стоматология', accent: '#0d9488', accentSoft: '#e6f7f4',
    name: 'Регистратура', role: 'Клиника «Дентал+»',
    greeting: 'Здравствуйте! 🦷 ИИ-администратор клиники «Дентал+». Помогу выбрать услугу и записаться к врачу. Что вас беспокоит?',
    address: 'пр-т Мира, 45 (1 этаж, отдельный вход)', hours: 'пн–сб с 8:00 до 20:00',
    avgCheck: 6800, lostPerWeek: 7,
    services: [
      { id: 'check', name: 'Осмотр + консультация', dur: 30, price: 800, kw: ['осмотр', 'консульт', 'провер', 'посмотр'] },
      { id: 'clean', name: 'Профгигиена', dur: 60, price: 3500, kw: ['гигиен', 'чистк', 'камень', 'налёт', 'налет', 'ультразв'] },
      { id: 'caries', name: 'Лечение кариеса', dur: 60, price: 4500, kw: ['кариес', 'дырк', 'пломб'] },
      { id: 'implant', name: 'Консультация по имплантации', dur: 40, price: 1000, kw: ['имплант', 'вставить зуб', 'коронк', 'протез'] },
      { id: 'white', name: 'Отбеливание', dur: 90, price: 12000, kw: ['отбел', 'белее', 'светлее'] }
    ],
    popular: 'check',
    symptoms: [{
      kw: ['болит', 'боль', 'ноет', 'ноющ', 'реагирует', 'чувствит', 'флюс', 'опухл', 'припухл', 'десна', 'дёсны', 'десны', 'кровоточ', 'шата', 'скол', 'откол', 'выпал', 'выпада', 'крошит', 'беспоко', 'воспал', 'гной', 'температур', 'не могу жевать', 'продуло'],
      to: 'check',
      say: 'Понимаю, это неприятно 🙁 Лучше начать с осмотра — врач определит причину (кариес, воспаление и т.д.) и сразу подберёт лечение. На какой день записать вас на осмотр? 👇'
    }]
  }
};

/* ───────────────────────── Состояние ───────────────────────── */
let niche = 'salon';
let state = 'start';
let booking = { service: null, day: null, time: null, name: '', phone: '' };
let busyMap = {};
let selDayKey = null;
let calMonthOffset = 0;
let bookingsLog = [];
let misses = 0;           // счётчик непониманий — чтобы не повторяться
let pendingService = null; // услуга, предложенная к подтверждению (да/нет)

const TIMES = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00', '20:30'];
const DOW = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const MONTHS_GEN = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const MONTHS_NOM = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const VIEW_TITLES = { calendar: 'Календарь', bookings: 'Записи', clients: 'Клиенты', services: 'Услуги', benefits: 'Аналитика', settings: 'Настройки' };
const WINDOW_DAYS = 14;

/* Векторные иконки (тонкая линия, единый стиль) — вместо эмодзи */
const ICONS = {
  salon: '<svg viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>',
  barber: '<svg viewBox="0 0 24 24"><path d="M3 7.5h18"/><path d="M6 7.5v9M10 7.5v4.5M14 7.5v9M18 7.5v4.5"/></svg>',
  auto: '<svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  clinic: '<svg viewBox="0 0 24 24"><path d="M12 5.5C10.5 4 8.6 3.2 6.9 3.6 4.9 4 3.6 5.8 3.7 8.4c.1 1.6.5 3.5 1 5.4.4 1.6.8 3.6 1.4 4.6.5.9 1.6.8 1.9-.2.4-1.4.7-3.2 1.1-4.2.3-.7.6-1.1 1-1.1s.7.4 1 1.1c.4 1 .7 2.8 1.1 4.2.3 1 1.4 1.1 1.9.2.6-1 1-3 1.4-4.6.5-1.9.9-3.8 1-5.4.1-2.6-1.2-4.4-3.2-4.8-1.7-.4-3.6.4-5.2 1.9z"/></svg>',
  users: '<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/></svg>',
  bolt: '<svg viewBox="0 0 24 24"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></svg>',
  trend: '<svg viewBox="0 0 24 24"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>',
  bell: '<svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  phoneOff: '<svg viewBox="0 0 24 24"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.8 12.8 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.4 19.4 0 0 1-3.33-2.67m-2.67-3.34a19.8 19.8 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"/></svg>'
};

/* ───────────────────────── DOM ───────────────────────── */
const $ = (s) => document.querySelector(s);
const chatBody = $('#chatBody');
const chatQuick = $('#chatQuick');

/* ───────────────────────── Утилиты ───────────────────────── */
const cfg = () => NICHES[niche];
const ruble = (n) => n.toLocaleString('ru-RU') + ' ₽';
const pad2 = (n) => String(n).padStart(2, '0');
const dayKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const parseKey = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); };
const monthName = (d) => MONTHS_GEN[d.getMonth()];
const nowHM = () => { const n = new Date(); return `${pad2(n.getHours())}:${pad2(n.getMinutes())}`; };
const isToday = (key) => key === dayKey(new Date());
const dayLabel = (key) => { const d = parseKey(key); return `${d.getDate()} ${monthName(d)} (${DOW[d.getDay()]})`; };

function seedBusy() {
  busyMap = {};
  const today = new Date();
  for (let i = 0; i < WINDOW_DAYS; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    const set = new Set();
    TIMES.forEach((t, idx) => { if ((d.getDate() * 7 + idx * 13 + i * 5) % 10 < 4) set.add(t); });
    busyMap[dayKey(d)] = set;
  }
}
function slotBlocked(key, t) {
  const busy = busyMap[key] || new Set();
  return busy.has(t) || (isToday(key) && t <= nowHM());
}
const freeCount = (key) => TIMES.filter((t) => !slotBlocked(key, t)).length;
function windowBounds() {
  const today = new Date();
  const max = new Date(today); max.setDate(today.getDate() + WINDOW_DAYS - 1);
  return { minKey: dayKey(today), maxKey: dayKey(max), max };
}

/* ───────────────────────── Тема / ниши ───────────────────────── */
function renderNicheSwitch() {
  [$('#nicheSwitch'), $('#nicheSwitch2')].forEach((sw) => {
    if (!sw) return;
    sw.innerHTML = '';
    Object.entries(NICHES).forEach(([key, n]) => {
      const b = document.createElement('button');
      b.className = 'niche-btn' + (key === niche ? ' is-active' : '');
      b.innerHTML = ICONS[key] + '<span>' + n.label + '</span>';
      b.onclick = () => switchNiche(key);
      sw.appendChild(b);
    });
  });
}

function applyTheme() {
  const n = cfg();
  document.documentElement.style.setProperty('--accent', n.accent);
  document.documentElement.style.setProperty('--accent-soft', n.accentSoft);
  $('#chatTitle').textContent = `${n.name} · ИИ-администратор`;
  $('#chatAvatar').innerHTML = ICONS[niche];
  $('#userName').textContent = n.name;
  $('#userRole').textContent = n.role;
  $('#userAva').textContent = n.name[0];
  $('#roiCheck').textContent = ruble(n.avgCheck);
  $('#roiLost').textContent = '~' + n.lostPerWeek;
  $('#roiSum').textContent = ruble(n.avgCheck * n.lostPerWeek * 4);
  $('#setInfo').textContent = `${n.role}\n📍 ${n.address}\n🕐 ${n.hours}`;
}

function switchNiche(key) {
  niche = key;
  renderNicheSwitch();
  applyTheme();
  resetChat();
  renderServices();
}

/* ───────────────────────── Навигация / виды ───────────────────────── */
const isMobile = () => window.matchMedia('(max-width: 920px)').matches;

// на телефоне показываем одну панель за раз: 'chat' | 'right'
function revealPanel(which) {
  const ws = $('.workspace');
  ws.classList.toggle('m-chat', which === 'chat');
  ws.classList.toggle('m-right', which === 'right');
  if (isMobile()) {
    const y = ws.getBoundingClientRect().top + window.scrollY - 62;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }
}

function setNavActive(el) {
  document.querySelectorAll('.nav-item').forEach((b) => b.classList.remove('is-active'));
  if (el) el.classList.add('is-active');
}

function showView(name, setNav = true) {
  document.querySelectorAll('.rv').forEach((v) => v.classList.toggle('is-hidden', v.dataset.view !== name));
  $('#rightTitle').textContent = VIEW_TITLES[name] || '';
  $('#rightLegend').style.display = name === 'calendar' ? '' : 'none';
  if (setNav) setNavActive(document.querySelector(`.nav-item[data-view="${name}"]`));
  if (name === 'bookings') renderBookings();
  if (name === 'clients') renderClients();
  if (name === 'services') renderServices();
  if (name === 'benefits') renderKpi();
}

function initNav() {
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.onclick = () => {
      if (item.dataset.view) { showView(item.dataset.view); revealPanel('right'); return; }
      if (item.dataset.action === 'chat') { setNavActive(item); revealPanel('chat'); if (!isMobile()) $('#chatInput').focus(); }
      if (item.dataset.action === 'scenario') {
        item.classList.add('flash'); setTimeout(() => item.classList.remove('flash'), 500);
        setNavActive(document.querySelector('[data-action="chat"]'));
        revealPanel('chat'); simulateMissedCall();
      }
    };
  });
}

/* ───────────────────────── Чат ───────────────────────── */
function scrollChat() { chatBody.scrollTop = chatBody.scrollHeight; }
function addMsg(text, who = 'bot') {
  const el = document.createElement('div');
  el.className = 'msg ' + who;
  el.textContent = text;
  chatBody.appendChild(el); scrollChat();
  return el;
}
function botSay(text, delay = 650) {
  return new Promise((resolve) => {
    const t = document.createElement('div');
    t.className = 'typing'; t.innerHTML = '<span></span><span></span><span></span>';
    chatBody.appendChild(t); scrollChat();
    setTimeout(() => { t.remove(); addMsg(text, 'bot'); resolve(); }, delay);
  });
}
function setQuick(options) {
  chatQuick.innerHTML = '';
  options.forEach((o) => {
    const b = document.createElement('button');
    b.className = 'qr'; b.textContent = o.label;
    b.onclick = () => { clearQuick(); handleInput(o.value ?? o.label, o); };
    chatQuick.appendChild(b);
  });
}
const clearQuick = () => chatQuick.innerHTML = '';

/* ───────────────────────── Диалог ───────────────────────── */
function resetChat(greet = true) {
  state = 'start';
  booking = { service: null, day: null, time: null, name: '', phone: '' };
  selDayKey = null;
  calMonthOffset = 0;
  misses = 0;
  pendingService = null;
  seedBusy();
  chatBody.innerHTML = '';
  clearQuick();
  renderCalendar();
  renderSlots(null);
  if (greet) startConversation();
}
async function startConversation() { await botSay(cfg().greeting, 500); offerServices(); }

function offerServices() {
  state = 'service';
  const opts = cfg().services.map((s) => ({ label: s.name, value: s.id, kind: 'service', id: s.id }));
  opts.push({ label: '💰 Цены', value: 'Сколько стоит?' });
  setQuick(opts);
}

const svc = (id) => cfg().services.find((x) => x.id === id);

// совпадение ключа-основы по НАЧАЛУ слова: «шин» ловит «шины», но не «машина»;
// «то» ловит «ТО»/«сделать то», но не «что-то». Окончание — любое.
function kwHit(text, k) {
  const esc = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('(^|[^а-яёa-zA-ZА-ЯЁ-])' + esc, 'i').test(text);
}

// вернуть ВСЕ услуги, подходящие под текст (для распознавания неоднозначности)
function matchServices(text) {
  const byId = svc(text);
  if (byId) return [byId];
  const t = text.toLowerCase();
  return cfg().services.filter((x) => t.includes(x.name.toLowerCase()) || x.kw.some((k) => kwHit(t, k)));
}
const matchSymptom = (low) => (cfg().symptoms || []).find((s) => s.kw.some((k) => kwHit(low, k)));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function resumeStep() {
  switch (state) {
    case 'service': return offerServices();
    case 'date': return offerDays();
    case 'time': return offerTimes(selDayKey);
    case 'name': return botSay('Так как вас зовут? ✍️');
    case 'phone': return botSay('Оставьте, пожалуйста, номер телефона 📱');
  }
}

async function handleInput(text, meta = {}) {
  const raw = (text || '').trim().slice(0, 200);
  if (!raw) return;
  const human = meta.kind === 'service'
    ? cfg().services.find((s) => s.id === (meta.id || raw))?.name || raw
    : (meta.label || raw);
  addMsg(human, 'user');
  clearQuick();

  // выбор дня/времени кнопкой в чате (работает и на телефоне без календаря)
  if (meta.kind === 'day') return selectDay(meta.key, false);
  if (meta.kind === 'time') return selectTime(meta.value, false);

  const low = raw.toLowerCase();
  const freeText = state !== 'name' && state !== 'phone';
  if (freeText) {
    // живое общение: приветствие, благодарность, запрос человека
    if (/^(привет|здравствуй|здрасьте|здрасте|добрый|доброе|хай|ку|здаров|здорово|йоу|алло|ало)/.test(low) && low.length < 22) {
      await botSay(pick(['Здравствуйте! 🙂', 'Привет! 👋', 'Здравствуйте! Рад вас видеть 🙂']));
      return resumeStep();
    }
    if (/(спасибо|благодар|спс|пасиб|пожалуйста\?|круто|отлично|супер|класс|здорово)/.test(low)) {
      await botSay(pick(['Рад помочь! 🙌', 'Всегда пожалуйста 🙂', 'Обращайтесь! 🙌']));
      return resumeStep();
    }
    if (/(живой|оператор|с человеком|позов|позвон|менеджер|мастер ответ|реальн.{0,5}админ|настоящ.{0,5}админ)/.test(low)) {
      await botSay('Конечно — передаю ваш диалог живому администратору, он подключится здесь же 🙋\nА пока, если удобно, могу записать вас сам.');
      return resumeStep();
    }
    if (/(сначал|заново|сброс)/.test(low)) { await botSay('Без проблем, начнём заново 🙂'); return offerServices(); }
    if (/(отмен|перенес|перенос)/.test(low)) { await botSay('Конечно! Записи можно переносить и отменять — просто напишите мне, я предложу другое время и напомню о визите.\n\n(В демо: кнопка ↺ сверху начинает диалог заново.)'); return resumeStep(); }
    if (/(скольк|цена|стоит|почём|почем|прайс|цены)/.test(low)) {
      await botSay('Вот наши услуги и цены:\n' + cfg().services.map((s) => `• ${s.name} — ${ruble(s.price)} (${s.dur} мин)`).join('\n'));
      return resumeStep();
    }
    if (/(адрес|где вы|где наход|как добраться|как доехать)/.test(low)) { await botSay(`Мы находимся по адресу: ${cfg().address} 📍`); return resumeStep(); }
    if (/(режим|часы работ|во скольк|откр|закрыва|работаете)/.test(low)) { await botSay(`Работаем ${cfg().hours} 🕐`); return resumeStep(); }
  }

  switch (state) {
    case 'service': return onService(raw);
    case 'date':    return onDateText(raw);
    case 'time':    return onTimeText(raw);
    case 'name':    return onName(raw);
    case 'phone':   return onPhone(raw);
    default:        return onService(raw);
  }
}

// перейти к выбору дня с выбранной услугой
async function chooseService(s, intro) {
  booking.service = s;
  pendingService = null;
  misses = 0;
  state = 'date';
  showView('calendar', false);
  await botSay(intro || `Отлично — «${s.name}» (${s.dur} мин, ${ruble(s.price)}). На какой день вас записать? Выберите ниже 👇 или напишите «завтра».`);
  offerDays();
}

async function onService(text) {
  const low = text.toLowerCase();

  // подтверждение ранее предложенной услуги («да / давайте»)
  if (pendingService) {
    if (/^(да|ага|давай|давайте|ок|окей|хорошо|конечно|запиш|запис|го|именно|нужно|нужна|хочу|\+|можно)/.test(low)) {
      return chooseService(pendingService);
    }
    if (/(нет|друг|остальн|показать|другую|не надо|не то|не хочу)/.test(low)) {
      pendingService = null;
      await botSay('Хорошо, вот все услуги — выберите, что подходит 👇');
      return offerServices();
    }
  }

  const matches = matchServices(text);

  // 1) симптом/жалоба → осмотр или диагностика (а не наугад «кариес»)
  const sym = matchSymptom(low);
  if (sym && !matches.some((m) => m.id !== sym.to)) {
    return chooseService(svc(sym.to), sym.say);
  }

  // 2) «посоветуйте / не знаю / на ваш выбор» → рекомендация популярной услуги
  if (/(посовет|подскаж|не знаю|незнаю|что выбрать|что взять|что лучше|на ваш выбор|реши|любую|без разниц|всё равно|все равно|что популярн)/.test(low)) {
    const p = svc(cfg().popular);
    pendingService = p;
    misses = 0;
    await botSay(`Чаще всего выбирают «${p.name}» — ${ruble(p.price)}, ${p.dur} мин. Записать на неё? (или напишите, что именно нужно)`);
    return;
  }

  // 3) ровно одна услуга — записываем
  if (matches.length === 1) return chooseService(matches[0]);

  // 4) несколько вариантов — уточняем
  if (matches.length > 1) {
    misses = 0;
    await botSay('Уточните, пожалуйста — что именно вас интересует:');
    return setQuick(matches.map((s) => ({ label: s.name, value: s.id, kind: 'service', id: s.id })));
  }

  // 5) не понял — живой, не повторяющийся фоллбек с эскалацией
  misses++;
  if (misses >= 2) {
    await botSay('Похоже, я не совсем понял 🙈 Давайте проще — выберите услугу кнопкой ниже. А если нужен живой человек, напишите «администратор», и я позову.');
    misses = 0;
    return offerServices();
  }
  await botSay(pick([
    'Не совсем понял 🤔 Опишите чуть иначе или выберите из списка:',
    'Хм, уточните, пожалуйста — что нужно сделать? Можно кнопкой:',
    'Чтобы записать точно, подскажите услугу — вот варианты:'
  ]));
  offerServices();
}

// кнопки-дни прямо в чате — ближайшие свободные дни
function offerDays() {
  const today = new Date();
  const opts = [];
  for (let i = 0; i < WINDOW_DAYS && opts.length < 6; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    const key = dayKey(d);
    if (freeCount(key) === 0) continue;
    const label = i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : `${DOW[d.getDay()]}, ${d.getDate()}`;
    opts.push({ label, kind: 'day', key });
  }
  setQuick(opts);
}

// кнопки-слоты времени прямо в чате
function offerTimes(key) {
  setQuick(TIMES.filter((t) => !slotBlocked(key, t)).map((t) => ({ label: t, value: t, kind: 'time' })));
}

function resolveDayText(text) {
  const t = text.toLowerCase();
  const today = new Date();
  if (/сегодн/.test(t)) return new Date(today);
  if (/послезавтра/.test(t)) { const d = new Date(today); d.setDate(d.getDate() + 2); return d; }
  if (/завтра/.test(t)) { const d = new Date(today); d.setDate(d.getDate() + 1); return d; }
  const dowMap = { 'понедельник': 1, 'вторник': 2, 'сред': 3, 'четверг': 4, 'пятниц': 5, 'суббот': 6, 'воскрес': 0 };
  for (const [k, v] of Object.entries(dowMap)) {
    if (t.includes(k)) { const d = new Date(today); for (let i = 1; i <= 13; i++) { d.setDate(d.getDate() + 1); if (d.getDay() === v) return d; } }
  }
  const num = t.match(/\b(\d{1,2})\b/);
  if (num) { const day = +num[1]; for (let i = 0; i < WINDOW_DAYS; i++) { const d = new Date(today); d.setDate(today.getDate() + i); if (d.getDate() === day) return d; } }
  return null;
}

async function onDateText(text) {
  const d = resolveDayText(text);
  if (!d) { await botSay('Не уловил дату 🙈 Выберите день ниже или напишите «завтра», «в субботу», «15».'); offerDays(); return; }
  selectDay(dayKey(d), false);
}

async function selectDay(key, fromCalendar) {
  if (freeCount(key) === 0) {
    await botSay(isToday(key)
      ? 'Сегодня свободного времени уже не осталось 😔 Давайте на другой день — свободные отмечены точкой.'
      : 'На этот день всё занято 😔 Давайте выберем другой — свободные отмечены точкой.');
    return;
  }
  selDayKey = key;
  booking.day = key;
  state = 'time';
  // показать нужный месяц в календаре
  const today = new Date();
  calMonthOffset = (parseKey(key).getFullYear() - today.getFullYear()) * 12 + (parseKey(key).getMonth() - today.getMonth());
  showView('calendar', false);
  renderCalendar();
  renderSlots(key);
  if (fromCalendar) addMsg(dayLabel(key), 'user');
  await botSay(`${dayLabel(key)} — отлично. Вот свободное время, выберите ниже 👇 или напишите, например «16:00».`);
  offerTimes(key);
}

async function onTimeText(text) {
  const m = text.match(/(\d{1,2})[:.\s]?(\d{2})?/);
  let pick = null;
  if (m) { const hh = m[1].padStart(2, '0'); const mm = m[2] || '00'; pick = TIMES.find((t) => t === `${hh}:${mm}`) || TIMES.find((t) => t.startsWith(hh + ':')); }
  if (!pick) { await botSay('Подскажите время точнее — например «14:30». Свободные слоты — ниже 👇'); offerTimes(selDayKey); return; }
  selectTime(pick, false);
}

async function selectTime(time, fromCalendar) {
  if (slotBlocked(selDayKey, time)) {
    await botSay(isToday(selDayKey) && time <= nowHM() ? 'Это время сегодня уже прошло 🙈 Выберите слот попозже.' : 'Ой, это время занято 😕 Выберите другой свободный слот.');
    return;
  }
  booking.time = time;
  state = 'name';
  renderSlots(selDayKey);
  if (fromCalendar) addMsg(time, 'user');
  await botSay('Супер! Как вас зовут? ✍️');
}

async function onName(text) {
  const clean = text.replace(/[^а-яёa-z\s-]/gi, '').replace(/\s+/g, ' ').trim();
  if (clean.length < 2) { await botSay('Напишите, пожалуйста, ваше имя — буквами 🙂'); return; }
  booking.name = (clean[0].toUpperCase() + clean.slice(1)).slice(0, 40);
  state = 'phone';
  await botSay(`Приятно познакомиться, ${booking.name}! Оставьте номер телефона для подтверждения 📱`);
}

async function onPhone(text) {
  const digits = text.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 12) { await botSay('Кажется, с номером что-то не так. Введите телефон в формате +7 999 123-45-67 📱'); return; }
  booking.phone = '+7 ' + digits.slice(-10).replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2-$3-$4');
  await confirmBooking();
}

function bkRow(label, value) {
  const row = document.createElement('div');
  row.className = 'bk-card-row';
  const s = document.createElement('span'); s.textContent = label;
  const b = document.createElement('b'); b.textContent = value;
  row.append(s, b); return row;
}

async function confirmBooking() {
  state = 'done';
  (busyMap[selDayKey] = busyMap[selDayKey] || new Set()).add(booking.time);
  renderCalendar(); renderSlots(selDayKey);
  await botSay('Записываю вас… ⏳', 700);

  const d = parseKey(booking.day);
  const card = document.createElement('div');
  card.className = 'msg card';
  const top = document.createElement('div'); top.className = 'bk-card-top'; top.innerHTML = '<div class="bk-ok">✓ Вы записаны!</div>';
  card.appendChild(top);
  card.appendChild(bkRow('Услуга', booking.service.name));
  card.appendChild(bkRow('Дата', `${d.getDate()} ${monthName(d)}, ${DOW[d.getDay()]}`));
  card.appendChild(bkRow('Время', booking.time));
  card.appendChild(bkRow('Стоимость', ruble(booking.service.price)));
  card.appendChild(bkRow('Клиент', `${booking.name}, ${booking.phone}`));
  chatBody.appendChild(card); scrollChat();

  bookingsLog.unshift({ niche: cfg().label, service: booking.service.name, day: booking.day, time: booking.time, name: booking.name, phone: booking.phone, price: booking.service.price });
  refreshCrm();

  await botSay('Готово! 🎉 Я пришлю напоминание за день и за 2 часа до визита. Будем рады видеть вас!', 800);
  setQuick([{ label: '↺ Записать ещё раз', value: 'заново' }]);

  const remindDay = d.getDate() + ' ' + monthName(d);
  setTimeout(() => showToast(ICONS.bell, 'Напоминание клиенту отправлено', `«${cfg().name}: напоминаем о записи на ${booking.service.name} ${remindDay} в ${booking.time}. Ждём вас!»`), 1800);
}

async function simulateMissedCall() {
  resetChat(false);
  showToast(ICONS.phoneOff, 'Пропущенный звонок · 02:14 ночи', 'Клиент +7 913 482-17-56 не дозвонился. ИИ перехватывает обращение и пишет в мессенджер →');
  await botSay('Здравствуйте! 👋 Видим, вы звонили нам ночью и не дозвонились — простите, мы уже не работали. Я ИИ-администратор и запишу вас прямо здесь, это займёт минуту. Что вас интересует?', 1100);
  offerServices();
}

/* ───────────────────────── Toast ───────────────────────── */
let toastTimer = null;
function showToast(icon, title, sub) {
  const toast = $('#toast');
  toast.innerHTML = '';
  const ico = document.createElement('div'); ico.className = 't-ico'; ico.innerHTML = icon;
  const body = document.createElement('div');
  const b = document.createElement('b'); b.textContent = title;
  const small = document.createElement('small'); small.textContent = sub;
  body.append(b, small); toast.append(ico, body);
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 6500);
}

/* ───────────────────────── Календарь (месяц) ───────────────────────── */
function renderCalendar() {
  const grid = $('#calGrid'); grid.innerHTML = '';
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth() + calMonthOffset, 1);
  const year = base.getFullYear(), month = base.getMonth();
  $('#calMonth').textContent = `${MONTHS_NOM[month]} ${year}`;
  const { minKey, maxKey } = windowBounds();

  // навигация: только в пределах окна записи
  const maxOffset = (parseKey(maxKey).getFullYear() - today.getFullYear()) * 12 + (parseKey(maxKey).getMonth() - today.getMonth());
  $('#calPrev').disabled = calMonthOffset <= 0;
  $('#calNext').disabled = calMonthOffset >= maxOffset;

  const firstCol = (new Date(year, month, 1).getDay() + 6) % 7; // Пн = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 0; i < firstCol; i++) { const e = document.createElement('div'); e.className = 'cal-cell empty'; grid.appendChild(e); }

  for (let day = 1; day <= daysInMonth; day++) {
    const key = dayKey(new Date(year, month, day));
    const inWindow = key >= minKey && key <= maxKey;
    const free = inWindow ? freeCount(key) : 0;
    const cell = document.createElement('button');
    cell.type = 'button';
    const active = inWindow && free > 0;
    cell.className = 'cal-cell ' + (key === selDayKey ? 'is-sel' : active ? 'active' : 'disabled');
    if (!active) cell.disabled = true;
    const dn = document.createElement('span'); dn.className = 'd'; dn.textContent = day;
    cell.appendChild(dn);
    if (inWindow && free > 0) { const fc = document.createElement('span'); fc.className = 'fc'; fc.textContent = free; cell.appendChild(fc); }
    if (active) cell.onclick = () => onCalDayClick(key);
    grid.appendChild(cell);
  }
}

async function onCalDayClick(key) {
  if (state === 'done') return;
  if (isMobile()) { setNavActive(document.querySelector('[data-action="chat"]')); revealPanel('chat'); }
  if (state === 'service' || state === 'start') { await botSay('Сначала выберите услугу 🙂 — отметьте её кнопкой в чате.'); offerServices(); return; }
  selectDay(key, true);
}

function renderSlots(key) {
  const wrap = $('#calSlots'); wrap.innerHTML = '';
  const title = $('#slotsTitle');
  if (!key) { title.textContent = 'Выберите день в календаре'; return; }
  const d = parseKey(key);
  title.textContent = `Свободное время · ${d.getDate()} ${monthName(d)} (${DOW[d.getDay()]})`;
  TIMES.forEach((t) => {
    const b = document.createElement('button');
    const blocked = slotBlocked(key, t);
    const isBooked = state === 'done' && booking.time === t && booking.day === key;
    b.className = 'slot' + (isBooked ? ' is-booked' : '') + (booking.time === t && booking.day === key && !isBooked ? ' is-sel' : '');
    b.textContent = isBooked ? '✓ ' + t : t;
    b.disabled = blocked && !isBooked;
    b.onclick = () => onSlotClick(t);
    wrap.appendChild(b);
  });
}

async function onSlotClick(t) {
  if (state === 'done') return;
  if (isMobile()) { setNavActive(document.querySelector('[data-action="chat"]')); revealPanel('chat'); }
  if (state === 'service' || state === 'start') { await botSay('Сначала выберите услугу 🙂'); offerServices(); return; }
  if (!selDayKey) { await botSay('Сначала выберите день 👆'); offerDays(); return; }
  selectTime(t, true);
}

/* ───────────────────────── Мини-CRM ───────────────────────── */
function refreshCrm() {
  $('#navBkCount').textContent = bookingsLog.length ? bookingsLog.length : '';
  renderBookings(); renderKpi();
}

function renderBookings() {
  const list = $('#bkList'); list.innerHTML = '';
  if (!bookingsLog.length) {
    const e = document.createElement('div'); e.className = 'empty';
    e.textContent = 'Пока нет записей. Запишитесь через чат — бронь появится здесь, как в CRM владельца.';
    list.appendChild(e); return;
  }
  bookingsLog.forEach((bk) => {
    const item = document.createElement('div'); item.className = 'bk-item';
    const top = document.createElement('div'); top.className = 'bk-item-top';
    const when = document.createElement('b'); when.textContent = `${dayLabel(bk.day)} · ${bk.time}`;
    const price = document.createElement('span'); price.className = 'bk-price'; price.textContent = ruble(bk.price);
    top.append(when, price);
    const mid = document.createElement('div'); mid.className = 'bk-item-mid'; mid.textContent = bk.service;
    const bot = document.createElement('div'); bot.className = 'bk-item-bot'; bot.textContent = `${bk.name} · ${bk.phone} · ${bk.niche}`;
    item.append(top, mid, bot); list.appendChild(item);
  });
}

function renderClients() {
  const list = $('#clList'); list.innerHTML = '';
  const byPhone = {};
  bookingsLog.forEach((bk) => {
    (byPhone[bk.phone] = byPhone[bk.phone] || { name: bk.name, phone: bk.phone, visits: 0, last: bk.service }).visits++;
  });
  const clients = Object.values(byPhone);
  if (!clients.length) {
    const e = document.createElement('div'); e.className = 'empty';
    e.textContent = 'База клиентов пуста. После записи через чат клиент автоматически появится здесь с историей визитов.';
    list.appendChild(e); return;
  }
  clients.forEach((c) => {
    const item = document.createElement('div'); item.className = 'cl-item';
    const ava = document.createElement('div'); ava.className = 'cl-ava'; ava.textContent = c.name[0];
    const main = document.createElement('div'); main.className = 'cl-main';
    const b = document.createElement('b'); b.textContent = c.name;
    const span = document.createElement('span'); span.textContent = `${c.phone} · ${c.last}`;
    main.append(b, span);
    const v = document.createElement('div'); v.className = 'cl-visits'; v.innerHTML = `<b>${c.visits}</b>визит(ов)`;
    item.append(ava, main, v); list.appendChild(item);
  });
}

function renderServices() {
  const list = $('#svList'); if (!list) return; list.innerHTML = '';
  cfg().services.forEach((s) => {
    const item = document.createElement('div'); item.className = 'sv-item';
    const name = document.createElement('div'); name.className = 'sv-name';
    const b = document.createElement('b'); b.textContent = s.name;
    const span = document.createElement('span'); span.textContent = `${s.dur} мин`;
    name.append(b, span);
    const price = document.createElement('div'); price.className = 'sv-price'; price.textContent = ruble(s.price);
    item.append(name, price); list.appendChild(item);
  });
}

function renderKpi() {
  $('#kpiBookings').textContent = bookingsLog.length;
  $('#kpiRevenue').textContent = ruble(bookingsLog.reduce((s, b) => s + b.price, 0));
}

/* ───────────────────────── Прочее ───────────────────────── */
function animateCounters() {
  document.querySelectorAll('.sc-num [data-count]').forEach((el) => {
    const target = +el.dataset.count; let cur = 0;
    const step = Math.max(1, Math.round(target / 30));
    const tick = () => { cur = Math.min(target, cur + step); el.textContent = cur; if (cur < target) requestAnimationFrame(tick); };
    tick();
  });
}

function init() {
  renderNicheSwitch();
  applyTheme();
  initNav();
  animateCounters();
  showView('calendar', false);   // подготовить правую панель (контент = календарь)
  refreshCrm();
  renderServices();
  resetChat();
  // по умолчанию: активна вкладка «ИИ-ассистент», на телефоне виден чат
  setNavActive(document.querySelector('[data-action="chat"]'));
  revealPanel('chat');

  $('#chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('#chatInput'); const v = input.value; input.value = '';
    if (v.trim()) handleInput(v);
  });
  $('#chatReset').onclick = () => resetChat();
  $('#missedCall').onclick = simulateMissedCall;
  $('#calPrev').onclick = () => { if (calMonthOffset > 0) { calMonthOffset--; renderCalendar(); } };
  $('#calNext').onclick = () => { calMonthOffset++; renderCalendar(); };

  const mail = 'ovopijaku785@gmail.com';
  const subj = encodeURIComponent('Хочу ИИ-администратора для записи');
  const href = `mailto:${mail}?subject=${subj}`;
  ['#orderBtn', '#promoBtn', '#contactBtn'].forEach((sel) => { const el = $(sel); if (el) el.href = href; });
}

document.addEventListener('DOMContentLoaded', init);
