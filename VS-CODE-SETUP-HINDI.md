# Travel Go — VS Code setup

Create a folder named `travel-go` in VS Code and keep these files in its root:

```text
travel-go/
├── package.json
├── server.js
├── index.html
├── standalone.html
├── standalone.css
├── standalone.js
└── transport.js
```

`START-TRAVEL-GO.bat` is optional; it is a one-click launcher for Windows.

Do not create the `data` folder. It is made automatically after the first registered account or booking request.

## Run in VS Code

Open the VS Code terminal inside the `travel-go` folder and run:

```powershell
node server.js
```

Then open `http://localhost:3000` in Chrome or Edge. Do not use Live Server and do not open `standalone.html` directly, because login and bookings need the Node.js backend.
