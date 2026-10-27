import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();
const dataDir = join(root, 'data');
const dbFile = join(dataDir, 'travel-go-db.json');
const port = Number(process.env.PORT || 3000);
const ownerUpiId = String(process.env.TRAVEL_GO_UPI_ID || '').trim();
const merchantName = 'Travel Go';
const sessions = new Map();
const seatLabels = new Set(Array.from({ length: 40 }, (_, index) => `${Math.floor(index / 4) + 1}${['A', 'B', 'C', 'D'][index % 4]}`));
const cabRates = Object.freeze({ Mini: 100, Sedan: 110, SUV: 120, Innova: 150 });
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' };
let bookingQueue = Promise.resolve();

async function database() {
  try { return JSON.parse(await readFile(dbFile, 'utf8')); }
  catch {
    await mkdir(dataDir, { recursive: true });
    const initial = { users: [], bookings: [] };
    await writeFile(dbFile, JSON.stringify(initial, null, 2));
    return initial;
  }
}

const save = db => writeFile(dbFile, JSON.stringify(db, null, 2));
const send = (res, code, value) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(value)); };

function hash(password, salt = randomBytes(16).toString('hex')) {
  return { salt, value: scryptSync(password, salt, 64).toString('hex') };
}

function validPassword(password, user) {
  const value = Buffer.from(hash(password, user.salt).value, 'hex');
  const saved = Buffer.from(user.passwordHash, 'hex');
  return value.length === saved.length && timingSafeEqual(value, saved);
}

function createSession(user) {
  const token = randomBytes(32).toString('hex');
  sessions.set(token, { userId: user.id, expires: Date.now() + 604800000 });
  return token;
}

const safeUser = user => ({ id: user.id, name: user.name, email: user.email });
const validUpiId = value => /^[a-zA-Z0-9][a-zA-Z0-9._-]{1,255}@[a-zA-Z][a-zA-Z0-9.-]{1,63}$/.test(value);

function currentUser(req, db) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const session = sessions.get(token);
  return session && session.expires > Date.now() ? db.users.find(user => user.id === session.userId) : null;
}

async function body(req) {
  let raw = '';
  for await (const part of req) raw += part;
  try { return JSON.parse(raw || '{}'); }
  catch { throw new Error('Invalid request data.'); }
}

function busRouteKey(from, to, date, vehicle) {
  return [from, to, date, vehicle].map(value => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ')).join('|');
}

function bookedSeatsFor(db, routeKey) {
  return [...new Set(db.bookings
    .filter(booking => booking.bookingType === 'bus' && booking.routeKey === routeKey && booking.status !== 'cancelled')
    .flatMap(booking => Array.isArray(booking.seats) ? booking.seats : []))].sort();
}

function checkBusBooking(data) {
  const from = String(data?.route?.from || '').trim();
  const to = String(data?.route?.to || '').trim();
  const journeyDate = String(data?.journeyDate || data?.travelMonth || '').trim();
  const vehicle = String(data?.vehicle || '').trim();
  const seats = Array.isArray(data?.seats) ? data.seats.map(seat => String(seat).trim().toUpperCase()) : [];
  if (!from || !to || !journeyDate || !vehicle || !seats.length) throw new Error('Please choose your route, journey date, bus type and seat(s).');
  if (new Set(seats).size !== seats.length || seats.some(seat => !seatLabels.has(seat))) throw new Error('One or more selected seats are invalid. Please select available seats again.');
  return { from, to, journeyDate, vehicle, seats };
}

function checkCabBooking(data) {
  const from = String(data?.route?.from || '').trim();
  const to = String(data?.route?.to || '').trim();
  const journeyDate = String(data?.journeyDate || data?.travelMonth || '').trim();
  const vehicle = String(data?.vehicle || '').trim();
  const distanceKm = Number(data?.distanceKm);
  const ratePerKm = cabRates[vehicle];
  if (!from || !to || !journeyDate || !ratePerKm) throw new Error('Please choose your route, journey date and cab type.');
  if (!Number.isInteger(distanceKm) || distanceKm < 1 || distanceKm > 100) throw new Error('Cab distance must be between 1 km and 100 km.');
  return { from, to, journeyDate, vehicle, distanceKm, ratePerKm, amount: distanceKm * ratePerKm };
}

function withBookingLock(action) {
  const run = bookingQueue.then(action, action);
  bookingQueue = run.catch(() => undefined);
  return run;
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'POST' && url.pathname === '/api/auth/register') {
      const { name, email, password } = await body(req);
      if (!name || !email || !password || password.length < 6) return send(res, 400, { error: 'Name, email and a 6-character password are required.' });
      const db = await database();
      if (db.users.some(user => user.email === email.toLowerCase())) return send(res, 409, { error: 'An account already exists for this email.' });
      const secured = hash(password);
      const user = { id: randomBytes(12).toString('hex'), name: name.trim(), email: email.toLowerCase(), salt: secured.salt, passwordHash: secured.value, createdAt: new Date().toISOString() };
      db.users.push(user);
      await save(db);
      return send(res, 201, { user: safeUser(user), token: createSession(user) });
    }

    if (req.method === 'POST' && url.pathname === '/api/auth/login') {
      const { email, password } = await body(req);
      const db = await database();
      const user = db.users.find(item => item.email === String(email).toLowerCase());
      if (!user || !validPassword(password || '', user)) return send(res, 401, { error: 'Email or password is incorrect.' });
      return send(res, 200, { user: safeUser(user), token: createSession(user) });
    }

    if (req.method === 'GET' && url.pathname === '/api/payment-config') {
      const enabled = validUpiId(ownerUpiId);
      return send(res, 200, { enabled, upiId: enabled ? ownerUpiId : '', merchantName });
    }

    if (req.method === 'GET' && url.pathname === '/api/bus-seats') {
      const { from, to, journeyDate, vehicle } = Object.fromEntries(url.searchParams);
      if (!from || !to || !journeyDate || !vehicle) return send(res, 400, { error: 'Route, journey date and bus type are required.' });
      const db = await database();
      const routeKey = busRouteKey(from, to, journeyDate, vehicle);
      return send(res, 200, { bookedSeats: bookedSeatsFor(db, routeKey), totalSeats: seatLabels.size });
    }

    if (req.method === 'POST' && url.pathname === '/api/bookings') {
      const data = await body(req);
      return withBookingLock(async () => {
        const db = await database();
        const user = currentUser(req, db);
        if (!user) return send(res, 401, { error: 'Please login before making a booking request.' });
        if (!data.tripId || !data.phone || !(data.journeyDate || data.travelMonth)) return send(res, 400, { error: 'Please complete the booking form.' });

        let busDetails = null;
        let cabDetails = null;
        if (data.bookingType === 'bus') {
          try { busDetails = checkBusBooking(data); }
          catch (validationError) { return send(res, 400, { error: validationError.message }); }
          const routeKey = busRouteKey(busDetails.from, busDetails.to, busDetails.journeyDate, busDetails.vehicle);
          const unavailable = new Set(bookedSeatsFor(db, routeKey));
          const conflict = busDetails.seats.filter(seat => unavailable.has(seat));
          if (conflict.length) return send(res, 409, { error: `Seat ${conflict.join(', ')} was just booked. Please select another seat.`, bookedSeats: [...unavailable] });
          busDetails.routeKey = routeKey;
        }
        if (data.bookingType === 'cab') {
          try { cabDetails = checkCabBooking(data); }
          catch (validationError) { return send(res, 400, { error: validationError.message }); }
        }

        const bookingAmount = cabDetails ? cabDetails.amount : Number(data.amount);
        const booking = {
          id: randomBytes(10).toString('hex'),
          userId: user.id,
          bookingType: data.bookingType || 'trip',
          tripId: data.tripId,
          tripName: data.tripName,
          phone: String(data.phone).trim(),
          travelMonth: data.journeyDate || data.travelMonth,
          travellers: data.travellers,
          notes: data.notes || '',
          status: 'requested',
          createdAt: new Date().toISOString(),
          ...(Number.isFinite(bookingAmount) && bookingAmount > 0 ? { payment: { amount: Math.round(bookingAmount), currency: 'INR', method: 'UPI', status: 'pending' } } : {}),
          ...(busDetails ? { route: { from: busDetails.from, to: busDetails.to }, routeKey: busDetails.routeKey, journeyDate: busDetails.journeyDate, vehicle: busDetails.vehicle, seats: busDetails.seats } : cabDetails ? { route: { from: cabDetails.from, to: cabDetails.to }, journeyDate: cabDetails.journeyDate, vehicle: cabDetails.vehicle, distanceKm: cabDetails.distanceKm, ratePerKm: cabDetails.ratePerKm } : { vehicle: data.vehicle || '' })
        };
        db.bookings.push(booking);
        await save(db);
        return send(res, 201, { booking });
      });
    }

    if (req.method === 'GET' && url.pathname === '/api/health') return send(res, 200, { status: 'ok' });

  const requested = url.pathname === '/' ? '/index.html' : url.pathname;
    const file = normalize(join(root, requested));
    if (!file.startsWith(root)) return send(res, 403, { error: 'Forbidden' });
    await stat(file);
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  } catch (error) {
    if (error.code === 'ENOENT') return send(res, 404, { error: 'Not found' });
    console.error(error);
    send(res, 500, { error: 'Server error' });
  }
}).listen(port, () => console.log(`Travel Go is running at http://localhost:${port}`));
