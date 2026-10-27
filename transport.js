const transportSection = document.createElement('section');
transportSection.className = 'transport-section';
transportSection.id = 'transport';
transportSection.innerHTML = `
  <div class="transport-heading">
    <div><p class="eyebrow">Beyond the package</p><h2>Need a ride? We’ve got the road covered.</h2></div>
    <p>Book reliable intercity buses and cabs with the same simple Travel Go experience.</p>
  </div>
  <div class="transport-grid">
    <article class="transport-card bus-card"><div class="transport-icon">🚌</div><p>Intercity travel</p><h3>Bus bookings</h3><span>AC sleeper, seater and Volvo options with live seat selection.</span><button class="transport-button" data-service="bus">Find a bus <b>→</b></button></article>
    <article class="transport-card cab-card"><div class="transport-icon">🚕</div><p>Door-to-door comfort</p><h3>Cab bookings</h3><span>Airport pickup, outstation rides and full-day city cabs.</span><button class="transport-button" data-service="cab">Book a cab <b>→</b></button></article>
    <aside class="transport-note"><span>Travel Go rides</span><strong>Safe rides.<br>Clear prices.</strong><p>Verified partners, 24/7 trip support and no last-minute surprises.</p></aside>
  </div>`;
document.querySelector('.feature-banner').before(transportSection);

const transportStyles = document.createElement('style');
transportStyles.textContent = `
  .transport-section{padding:100px max(24px,calc((100% - 1190px)/2));background:#f7f1e7}.transport-heading{display:flex;justify-content:space-between;align-items:end;gap:45px;margin-bottom:33px}.transport-heading h2{font:700 clamp(34px,4vw,50px)/1.08 'Playfair Display';letter-spacing:-.03em;margin:0;max-width:630px}.transport-heading>p{max-width:330px;margin:0;color:var(--muted);font-size:14px}.transport-grid{display:grid;grid-template-columns:1fr 1fr .74fr;gap:18px}.transport-card{padding:30px;background:#fff;min-height:278px;display:flex;flex-direction:column;align-items:flex-start;box-shadow:0 9px 28px #17342b0b}.transport-card p{font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:var(--coral);font-weight:700;margin:16px 0 2px}.transport-icon{font-size:38px;width:66px;height:66px;display:grid;place-items:center;background:#f6ece0;border-radius:50%}.transport-card h3{font:700 31px 'Playfair Display';margin:0 0 9px}.transport-card>span{font-size:13px;color:var(--muted);max-width:280px}.transport-button{margin-top:auto;padding:0;border:0;background:none;color:var(--ink);font:700 13px 'DM Sans';cursor:pointer}.transport-button b{color:var(--coral);font-size:17px;margin-left:7px}.transport-note{padding:31px;background:var(--coral);color:#fff;display:flex;flex-direction:column;justify-content:end;min-height:278px}.transport-note span{font-size:10px;letter-spacing:.14em;text-transform:uppercase}.transport-note strong{font:700 31px/1.05 'Playfair Display';margin:11px 0}.transport-note p{font-size:12px;margin:0;color:#fff2ec}#transport-booking{width:min(570px,calc(100% - 30px));padding:39px;background:#fff}#transport-booking h2{font:700 35px/1.1 'Playfair Display';margin:0}.seat-check{width:100%;margin:2px 0 14px}.seat-panel{background:#f7f1e7;padding:18px;margin:16px 0}.seat-panel[hidden]{display:none}.seat-top{display:flex;justify-content:space-between;gap:12px;align-items:center}.seat-top h3{font:700 22px 'Playfair Display';margin:0}.seat-status{font-size:12px;color:var(--muted);margin:5px 0 13px}.seat-legend{display:flex;gap:13px;flex-wrap:wrap;font-size:11px;margin-bottom:13px}.seat-legend span{display:flex;align-items:center;gap:5px}.seat-dot{width:12px;height:12px;border:1px solid #b9b3a7;display:inline-block}.seat-dot.available{background:#fff}.seat-dot.selected{background:var(--coral);border-color:var(--coral)}.seat-dot.booked{background:#b6bbb8;border-color:#b6bbb8}.seat-map{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.seat{border:1px solid #cfc7ba;background:#fff;color:var(--ink);padding:10px 4px;font:700 12px 'DM Sans';cursor:pointer}.seat:nth-child(4n+3){margin-left:18px}.seat:hover:not(:disabled){border-color:var(--coral);color:var(--coral)}.seat.selected{background:var(--coral);border-color:var(--coral);color:#fff}.seat.booked{background:#b6bbb8;border-color:#b6bbb8;color:#fff;cursor:not-allowed;text-decoration:line-through}.price-estimate{background:#edf5f1;border-left:3px solid var(--coral);padding:10px;font-size:12px;color:var(--ink)}.distance-control{display:grid;grid-template-columns:1fr auto;align-items:center;gap:10px}.distance-control input[type="range"]{padding:0;border:0;accent-color:var(--coral)}.distance-control output{min-width:54px;text-align:right;color:var(--coral);font-size:13px;font-weight:700}#cab-distance-field[hidden],#passenger-field[hidden]{display:none!important}@media(max-width:790px){.transport-section{padding:65px 24px}.transport-heading{display:block}.transport-heading>p{margin-top:14px}.transport-grid{grid-template-columns:1fr}.transport-card,.transport-note{min-height:230px}#transport-booking{padding:30px 23px}.seat-map{gap:7px}.seat:nth-child(4n+3){margin-left:10px}}
`;
document.head.append(transportStyles);

document.body.insertAdjacentHTML('beforeend', `
  <dialog id="transport-booking">
    <button class="close" aria-label="Close">×</button>
    <form id="transport-form">
      <p class="eyebrow" id="transport-eyebrow">Travel Go rides</p>
      <h2 id="transport-title">Book your ride</h2>
      <p class="dialog-subtitle">We will check availability and confirm the best option for your journey.</p>
      <div class="form-row"><label>From<input name="from" required placeholder="Pickup city"></label><label>To<input name="to" required placeholder="Destination city"></label></div>
      <div class="form-row" id="journey-row"><label>Journey date<input type="date" name="journeyDate" required></label><label id="passenger-field">Travellers<select name="passengers"><option value="1">1 traveller</option><option value="2">2 travellers</option><option value="3">3 travellers</option><option value="4">4 travellers</option><option value="5+">5+ travellers</option></select></label><label id="cab-distance-field" hidden>Trip distance <span class="distance-control"><input type="range" name="distance" min="1" max="100" value="20" step="1"><output id="distance-value">20 km</output></span><small>Choose between 1 km and 100 km</small></label></div>
      <label id="vehicle-field">Vehicle preference<select name="vehicle"><option value="AC Sleeper">AC Sleeper</option><option value="AC Seater">AC Seater</option><option value="Volvo">Volvo</option></select></label>
      <div id="bus-only-controls" hidden><button type="button" class="button seat-check" id="check-bus-seats">Check available seats →</button>
      <section class="seat-panel" id="bus-seat-panel" hidden><div class="seat-top"><h3>Select your seats</h3><span id="selected-seat-count">0 selected</span></div><p class="seat-status" id="seat-status">Choose seats shown as available.</p><div class="seat-legend"><span><i class="seat-dot available"></i> Available</span><span><i class="seat-dot selected"></i> Selected</span><span><i class="seat-dot booked"></i> Booked</span></div><div class="seat-map" id="bus-seat-map"></div></section></div>
      <label>Phone number<input name="phone" required inputmode="tel" placeholder="+91 00000 00000"></label>
      <label>Notes<textarea name="notes" placeholder="Pickup time, luggage or special requests..."></textarea></label>
      <p class="price-estimate" id="price-estimate">Estimated fare will appear after route confirmation.</p>
      <p class="error" id="transport-error"></p>
      <button class="button" id="transport-submit">Save ride request →</button>
    </form>
  </dialog>`);

let selectedService = '';
let selectedSeats = new Set();
let bookedSeats = new Set();
const transportDialog = document.querySelector('#transport-booking');
const transportForm = document.querySelector('#transport-form');
const seatPanel = document.querySelector('#bus-seat-panel');
const seatMap = document.querySelector('#bus-seat-map');
const seatStatus = document.querySelector('#seat-status');
const selectedSeatCount = document.querySelector('#selected-seat-count');
const seatCheckButton = document.querySelector('#check-bus-seats');
const busOnlyControls = document.querySelector('#bus-only-controls');
const formError = document.querySelector('#transport-error');
const passengerField = document.querySelector('#passenger-field');
const cabDistanceField = document.querySelector('#cab-distance-field');
const distanceInput = transportForm.elements.distance;
const distanceValue = document.querySelector('#distance-value');

const CAB_RATES = Object.freeze({
  Mini: 100,
  Sedan: 110,
  SUV: 120,
  Innova: 150
});

function getSeatLabels() {
  return Array.from({ length: 40 }, (_, index) => `${Math.floor(index / 4) + 1}${['A', 'B', 'C', 'D'][index % 4]}`);
}

function clearSeatMap(message = 'Choose seats shown as available.') {
  selectedSeats = new Set();
  bookedSeats = new Set();
  seatPanel.hidden = true;
  seatMap.innerHTML = '';
  seatStatus.textContent = message;
  selectedSeatCount.textContent = '0 selected';
}

function fieldsForRoute() {
  return {
    from: transportForm.elements.from.value.trim(),
    to: transportForm.elements.to.value.trim(),
    journeyDate: transportForm.elements.journeyDate.value,
    vehicle: transportForm.elements.vehicle.value
  };
}

function requiredSeatCount() {
  const travellers = transportForm.elements.passengers.value;
  return travellers === '5+' ? 5 : Number(travellers);
}

function renderSeatMap() {
  seatMap.innerHTML = getSeatLabels().map(seat => `<button type="button" class="seat ${bookedSeats.has(seat) ? 'booked' : ''} ${selectedSeats.has(seat) ? 'selected' : ''}" data-seat="${seat}" ${bookedSeats.has(seat) ? 'disabled' : ''}>${seat}</button>`).join('');
  selectedSeatCount.textContent = `${selectedSeats.size} selected`;
  seatMap.querySelectorAll('[data-seat]').forEach(button => {
    button.onclick = () => {
      const seat = button.dataset.seat;
      if (selectedSeats.has(seat)) selectedSeats.delete(seat);
      else if (selectedSeats.size >= requiredSeatCount()) {
        notify(`You can select ${requiredSeatCount()} seat(s) for the chosen travellers.`);
        return;
      } else selectedSeats.add(seat);
      renderSeatMap();
      updateRideEstimate();
    };
  });
}

function rideAmount() {
  if (selectedService === 'cab') {
    const distance = Number(distanceInput.value);
    const rate = CAB_RATES[transportForm.elements.vehicle.value];
    return Number.isFinite(distance) && rate ? distance * rate : 0;
  }
  const travellerCount = requiredSeatCount();
  const vehicle = transportForm.elements.vehicle.value;
  const vehicleExtra = vehicle === 'SUV' || vehicle === 'Volvo' ? 1 : vehicle === 'Tempo Traveller' ? 1100 : vehicle === 'Sedan' || vehicle === 'AC Sleeper' ? 1 : 0;
  const base = selectedService === 'bus' ? 1 : 1;
  return base + vehicleExtra + Math.max(0, travellerCount - 1) * 120;
}

function updateRideEstimate() {
  const amount = rideAmount();
  if (selectedService === 'cab') {
    const distance = Number(distanceInput.value);
    const vehicle = transportForm.elements.vehicle.value;
    const rate = CAB_RATES[vehicle];
    distanceValue.textContent = String(distance) + ' km';
    document.querySelector('#price-estimate').textContent = 'Cab fare: ₹' + amount.toLocaleString('en-IN') + ' · ' + vehicle + ' at ₹' + rate + '/km × ' + distance + ' km · payment QR will appear after saving your booking';
    return;
  }
  const seatText = selectedService === 'bus' && selectedSeats.size ? ` · seats ${[...selectedSeats].join(', ')}` : '';
  document.querySelector('#price-estimate').textContent = `Booking amount: ₹${amount.toLocaleString('en-IN')}${seatText} · payment QR will appear after saving your booking`;
}

async function checkAvailableSeats() {
  const route = fieldsForRoute();
  if (!route.from || !route.to || !route.journeyDate) {
    formError.textContent = 'Please enter From, To and Journey date first.';
    transportForm.reportValidity();
    return;
  }
  formError.textContent = '';
  seatCheckButton.disabled = true;
  seatCheckButton.textContent = 'Checking seats…';
  try {
    const params = new URLSearchParams(route);
    const result = await request(`/api/bus-seats?${params.toString()}`);
    bookedSeats = new Set(result.bookedSeats || []);
    selectedSeats = new Set();
    seatPanel.hidden = false;
    seatStatus.textContent = `${getSeatLabels().length - bookedSeats.size} seats available for this bus.`;
    renderSeatMap();
    updateRideEstimate();
  } catch (requestError) {
    formError.textContent = requestError.message || 'Could not check seats. Please try again.';
  } finally {
    seatCheckButton.disabled = false;
    seatCheckButton.textContent = 'Check available seats →';
  }
}

function openTransport(service) {
  if (!user) { notify('Please login first to book a ride.'); showAuth(); return; }
  selectedService = service;
  const isBus = service === 'bus';
  document.querySelector('#transport-eyebrow').textContent = isBus ? 'Travel Go bus' : 'Travel Go cab';
  document.querySelector('#transport-title').textContent = isBus ? 'Find your bus' : 'Book your cab';
  document.querySelector('#vehicle-field').innerHTML = isBus
    ? 'Bus type<select name="vehicle"><option value="AC Sleeper">AC Sleeper</option><option value="AC Seater">AC Seater</option><option value="Volvo">Volvo</option></select>'
    : 'Cab type<select name="vehicle"><option value="Mini">Mini — ₹100/km</option><option value="Sedan">Sedan — ₹110/km</option><option value="SUV">SUV — ₹120/km</option><option value="Innova">Innova — ₹150/km</option></select>';
  passengerField.hidden = !isBus;
  passengerField.style.display = isBus ? 'grid' : 'none';
  cabDistanceField.hidden = isBus;
  cabDistanceField.style.display = isBus ? 'none' : 'grid';
  distanceInput.value = '20';
  distanceValue.textContent = '20 km';
  busOnlyControls.hidden = !isBus;
  clearSeatMap();
  formError.textContent = '';
  updateRideEstimate();
  transportDialog.showModal();
}

document.querySelectorAll('[data-service]').forEach(button => { button.onclick = () => openTransport(button.dataset.service); });
seatCheckButton.onclick = checkAvailableSeats;

transportForm.addEventListener('change', event => {
  if (selectedService === 'bus' && ['from', 'to', 'journeyDate', 'vehicle'].includes(event.target.name)) clearSeatMap('Route or bus type changed. Check seats again.');
  updateRideEstimate();
});
transportForm.addEventListener('input', event => {
  if (selectedService === 'bus' && ['from', 'to', 'journeyDate'].includes(event.target.name)) clearSeatMap('Route or date changed. Check seats again.');
  if (selectedService === 'cab' && event.target.name === 'distance') updateRideEstimate();
});

transportForm.onsubmit = async event => {
  event.preventDefault();
  const fields = Object.fromEntries(new FormData(transportForm));
  if (selectedService === 'bus') {
    if (seatPanel.hidden) { formError.textContent = 'First click “Check available seats”, then choose your seat(s).'; return; }
    if (selectedSeats.size !== requiredSeatCount()) { formError.textContent = `Please choose exactly ${requiredSeatCount()} available seat(s).`; return; }
  }
  formError.textContent = '';
  const whatsappWindow = window.open('', '_blank');
  try {
    const isBus = selectedService === 'bus';
    const seatList = [...selectedSeats];
    const amount = rideAmount();
    const distance = isBus ? null : Number(fields.distance);
    const rate = isBus ? null : CAB_RATES[fields.vehicle];
    const result = await request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        bookingType: selectedService,
        tripId: `${selectedService}-${Date.now()}`,
        tripName: `${isBus ? 'Bus' : 'Cab'}: ${fields.from} to ${fields.to}`,
        phone: fields.phone,
        travelMonth: fields.journeyDate,
        journeyDate: fields.journeyDate,
        travellers: fields.passengers,
        vehicle: fields.vehicle,
        route: { from: fields.from, to: fields.to },
        seats: seatList,
        ...(isBus ? {} : { distanceKm: distance, ratePerKm: rate }),
        amount,
        notes: fields.notes || ''
      })
    });
    const title = isBus ? 'Bus booking' : 'Cab booking';
    const seatMessage = isBus ? `\n*Seats:* ${seatList.join(', ')}` : '';
    sendBookingToOwner({
      type: title,
      phone: fields.phone,
      body: isBus
        ? `*Route:* ${fields.from} → ${fields.to}\n*Journey date:* ${fields.journeyDate}\n*Travellers:* ${fields.passengers}\n*Vehicle:* ${fields.vehicle}${seatMessage}\n*Booking amount:* ₹${amount.toLocaleString('en-IN')}\n*Notes:* ${fields.notes || 'None'}`
        : `*Route:* ${fields.from} → ${fields.to}\n*Journey date:* ${fields.journeyDate}\n*Cab type:* ${fields.vehicle}\n*Distance:* ${result.booking.distanceKm} km\n*Rate:* ₹${result.booking.ratePerKm}/km\n*Cab fare:* ₹${(result.booking.payment?.amount || amount).toLocaleString('en-IN')}\n*Notes:* ${fields.notes || 'None'}`
    }, whatsappWindow);
    transportDialog.close();
    transportForm.reset();
    clearSeatMap();
    notify(`${isBus ? 'Bus' : 'Cab'} request saved. Scan the payment QR to complete it.`);
    window.openTravelGoPayment({ amount: result.booking.payment?.amount || amount, description: isBus ? `Bus: ${fields.from} → ${fields.to}` : `${fields.vehicle} cab · ${distance} km`, bookingId: result.booking.id, phone: fields.phone });
  } catch (requestError) {
    if (whatsappWindow && !whatsappWindow.closed) whatsappWindow.close();
    formError.textContent = requestError.message || 'Booking could not be saved. Please try again.';
    if (selectedService === 'bus') checkAvailableSeats();
  }
};

transportDialog.querySelector('.close').onclick = () => transportDialog.close();
