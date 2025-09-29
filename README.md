# Splitflow – Abo-Kostenaufteilung & Schuldenverwaltung

**Splitflow** ist eine Webanwendung zur **Verwaltung von geteilten Abonnements, einmaligen Schulden und Zahlungen** zwischen mehreren Personen. Die App ermöglicht die faire Aufteilung von monatlichen Abokosten, das Tracking von Schulden und deren Rückzahlung, inklusive Teilzahlungen.

## 🚀 Features

- Verwaltung von Teilnehmern (mit oder ohne Benutzerkonto)
- Erstellung und Verwaltung von Abos (monatlich, wiederkehrend)
- Automatische Schuldenverteilung pro Monat und Teilnehmer
- Unterstützung von einmaligen Schulden (z. B. gemeinsame Ausgaben)
- Teilzahlungen mit automatischer Verrechnung
- Dashboard mit Schuldenübersicht pro Teilnehmer
- Bearbeiten von Abos (Kosten, Teilnehmer, Pause etc.)
- Responsive Frontend mit moderner UI (React)
- JWT-basierte Authentifizierung

## 🛠️ Technologie-Stack

### Frontend

- React (mit React Router)
- CSS Modules
- Axios

### Backend

- Node.js & Express.js
- MongoDB (über Mongoose)
- JSON Web Tokens (JWT)

### Tools

- MongoDB Atlas (Cloud-Datenbank)
- Vercel / Railway / Render (für Deployment)
- Git & GitHub

## 📁 Projektstruktur

```
splitflow-main/
│
├── backend/              → Node.js/Express-Backend
│   ├── controllers/      → Logik der API-Endpunkte
│   ├── models/           → Mongoose-Modelle (User, Debt, Subscription, Payment)
│   ├── routes/           → REST API-Routen
│   ├── server.js         → Server-Setup
│
├── frontend/             → React-Frontend
│   ├── public/           → Statische Dateien
│   ├── src/
│   │   ├── components/   → Wiederverwendbare UI-Komponenten
│   │   ├── pages/        → Verschiedene Views (Dashboard, Add, Edit, etc.)
│   │   ├── styles/       → CSS-Dateien
│   │   ├── App.js        → Hauptkomponente mit Routing
│
├── .gitignore
```

## ⚙️ Installation & Setup

### Voraussetzungen

- Node.js & npm installiert
- MongoDB Atlas Account (oder lokale MongoDB)
- Vercel/Railway Account für Deployment (optional)

### 1. Backend starten

```bash
cd backend
npm install
# .env Datei mit MONGO_URI und JWT_SECRET anlegen
npm start
```

### 2. Frontend starten

```bash
cd frontend
npm install
npm start
```

Frontend läuft standardmäßig auf `http://localhost:3000`  
Backend läuft standardmäßig auf `http://localhost:5000`

## 📡 API-Endpunkte (Auszug)

### Auth

- `POST /api/users/register` – Benutzer registrieren
- `POST /api/users/login` – Benutzer-Login

### Teilnehmer

- `GET /api/participants` – Alle Teilnehmer abrufen
- `POST /api/participants` – Teilnehmer hinzufügen

### Abos

- `GET /api/subscriptions` – Abos abrufen
- `POST /api/subscriptions` – Neues Abo erstellen
- `PATCH /api/subscriptions/:id` – Abo bearbeiten

### Schulden

- `GET /api/debts` – Alle Schulden abrufen
- `POST /api/debts` – Einmalige Schuld hinzufügen
- `PATCH /api/debts/:id` – Schuld als bezahlt markieren

### Zahlungen

- `POST /api/payments` – Teilzahlung eintragen

## 📷 Beispiel (Screenshots)

_(Hier kannst du bei Bedarf Screenshots einfügen)_

- Dashboard mit Schuldenübersicht
- Formular zur Abo-Erstellung
- Teilnehmerverwaltung

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe [LICENSE](LICENSE) für Details.

## 👨‍💻 Autor

**outcastoasis**  
Splitflow – Projekt zur Abo- und Schuldenverwaltung  
GitHub: [outcastoasis](https://github.com/outcastoasis)
