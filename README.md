# Travel Go — website with backend

This is the Travel Go travel-booking website with a built-in Node.js backend. No npm packages need to be installed.

## Start the full app

1. Double-click `START-TRAVEL-GO.bat` — this opens the server and website automatically.

Or, open a terminal in this folder, run `npm start`, then open `http://localhost:3000`.

The server creates `data/travel-go-db.json` automatically. It saves registered users and booking requests locally on your computer.

## WhatsApp booking notification

After a customer submits a trip, bus, or cab request, WhatsApp opens with all form details addressed to the business number configured in `standalone.js`:

```js
const OWNER_WHATSAPP_NUMBER = '918604006112';
```

Change this number to your own WhatsApp number (country code included, without `+` or spaces). The customer must tap **Send** in WhatsApp. Fully automatic outgoing WhatsApp messages require an approved WhatsApp Business API account.

## UPI QR payment

Every trip, bus and cab booking now shows an exact-amount UPI QR after it is saved. Before starting the website, open `START-TRAVEL-GO.bat` and replace this line with **your own real UPI ID**:

```bat
set "TRAVEL_GO_UPI_ID=PASTE_YOUR_UPI_ID_HERE"
```

For example: `set "TRAVEL_GO_UPI_ID=yourname@oksbi"`. Save the file and restart Travel Go. The QR encodes the amount and your UPI ID. After a customer pays, they can send their UTR/reference number to you on WhatsApp. This is manual verification; do not mark a booking paid until you have checked your UPI app.

## API included

- `POST /api/auth/register` — create account
- `POST /api/auth/login` — login
- `POST /api/bookings` — save a booking request for the logged-in user
- `GET /api/payment-config` — supply the configured UPI payment address to the booking page
- `GET /api/health` — health check

## Production note

Passwords are securely hashed. This local JSON-file database is suitable for development or small demos. Before public launch, move the database to a managed server and add HTTPS, environment variables, rate limits, email verification and a proper session store.
