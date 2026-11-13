# 🎵 BeatBox Music Room - Instrument Loan Management API

[![Backend Development Fundamentals](https://img.shields.io/badge/Course-Backend%20Development%20Fundamentals-blue.svg)](https://expressjs.com/)
[![Modules](https://img.shields.io/badge/Modules-1%20to%203-green.svg)](https://nodejs.org/)
[![Group](https://img.shields.io/badge/Group-YG--CSE2E--G09-orange.svg)](#team-responsibilities)
[![Tests](https://img.shields.io/badge/Tests-34%2F34%20Passing-brightgreen.svg)](#running-automated-tests)

---

## 📌 Client Brief & Problem Statement

> *"Instruments are borrowed from a cupboard with a paper list. Strings and drums go home with students and do not come back. Please build us a system that fixes this."*  
> — **Theme 9 of 30 · Instrument loans**

The **BeatBox Music Room API** is a robust, modular RESTful backend built with **Node.js**, **Express**, and **SQLite**. It replaces unreliable paper lists with a digital loan tracking system where musicians, instruments, and active/returned loans are strictly tracked with relational integrity, input validation, and categorized filtering.

---

## 👥 Team Responsibilities (Who Does What)

In accordance with the assignment brief, responsibilities are partitioned into 6 distinct parts:

| Part | Role & Responsibilities | Assigned Member | Key Files |
| :--- | :--- | :--- | :--- |
| **1** | **Server and routes**<br>Express server setup, middleware (CORS, JSON parsing), route mounting, 404 & 500 error handlers, and HTTP status code standards. | *Member 1 (Name)* | `server.js`<br>`src/app.js` |
| **2** | **Database**<br>SQLite schema design (3 relational tables), foreign key enforcement (`PRAGMA foreign_keys = ON`), indexing, and seeding. | *Member 2 (Name)* | `src/config/database.js`<br>`src/db/schema.sql`<br>`src/db/seed.sql`<br>`src/db/initDb.js` |
| **3** | **REST endpoints**<br>Full CRUD for `instruments` and `musicians`, plus the relational `loans` CRUD and the required SQL JOIN endpoint. | *Member 3 (Name)* | `src/routes/instruments.js`<br>`src/routes/musicians.js`<br>`src/routes/loans.js` |
| **4** | **Validation and search**<br>Input validation middleware, informative error messages, and query parameter search (`?family=...`, `?search=...`). | *Member 4 (Name)* | `src/middleware/validation.js`<br>`src/routes/instruments.js` |
| **5** | **Twist rule**<br>Enforce allowed instrument families (`String`, `Percussion`, `Wind`), return `400` with allowed values for invalid families, and pass Tests 1, 2, and 3. | *Member 5 (Name)* | `src/middleware/validation.js`<br>`tests/api.test.js` |
| **6** | **Postman and README**<br>Postman v2.1 test collection with test scripts, environment setup, and comprehensive documentation for hand-in and demo day. | *Member 6 (Name)* | `postman/BeatBox_Music_Room.postman_collection.json`<br>`README.md` |

*(Note: In smaller groups, members can combine adjacent parts, e.g. Parts 1 & 3, Parts 2 & 4, Parts 5 & 6).*

---

## 🎯 The Twist Rule: Allowed Family Values

An instrument's `family` is strictly restricted to one of three valid categories:
- **`String`** (e.g. Guitar, Violin, Cello)
- **`Percussion`** (e.g. Drums, Snare, Marimba)
- **`Wind`** (e.g. Flute, Trumpet, Saxophone)

If any other value is submitted (e.g. `"Other"`, `"Brass"`, etc.), the API rejects the request with HTTP **`400 Bad Request`** and a clear error message listing the allowed values:

```json
{
  "error": "Invalid instrument family 'Other'. Allowed values are: String, Percussion, Wind."
}
```

### Verification of the 3 Brief Tests:
1. **Test 1**: Add instrument with family `"String"` &rarr; **`201 Created`** ✅
2. **Test 2**: Add instrument with family `"Other"` &rarr; **`400 Bad Request`**, allowed values shown ✅
3. **Test 3**: Update instrument to `"Percussion"` &rarr; **`200 OK`** ✅

---

## 🗄️ Relational Database Architecture (SQLite)

The database consists of 3 related tables with foreign keys and cascade rules:

```
┌───────────────────────┐            ┌─────────────────────────────────────────┐            ┌───────────────────────┐
│       musicians       │            │                  loans                  │            │      instruments      │
├───────────────────────┤            ├─────────────────────────────────────────┤            ├───────────────────────┤
│ id (PK, AUTOINCREMENT)│ 1 ────── N │ id (PK, AUTOINCREMENT)                  │ N ────── 1 │ id (PK, AUTOINCREMENT)│
│ name (TEXT, NOT NULL) │            │ musician_id (FK -> musicians.id)        │            │ name (TEXT, NOT NULL) │
│ email (TEXT, UNIQUE)  │            │ instrument_id (FK -> instruments.id)    │            │ family (TEXT, CHECK)  │
│ created_at (DATETIME) │            │ loan_date (TEXT, NOT NULL)              │            │ created_at (DATETIME) │
└───────────────────────┘            │ return_date (TEXT, NULLABLE)            │            └───────────────────────┘
                                     │ status (TEXT: 'active' | 'returned')    │
                                     │ created_at (DATETIME)                   │
                                     └─────────────────────────────────────────┘
```

### 🔗 The Relational JOIN Query
To monitor unreturned strings and drums, the endpoint `GET /loans` executes an inner join across all three tables:

```sql
SELECT 
    loans.id,
    loans.loan_date,
    loans.return_date,
    loans.status,
    loans.musician_id,
    musicians.name AS musician_name,
    musicians.email AS musician_email,
    loans.instrument_id,
    instruments.name AS instrument_name,
    instruments.family AS instrument_family,
    loans.created_at
FROM loans
JOIN musicians ON loans.musician_id = musicians.id
JOIN instruments ON loans.instrument_id = instruments.id
ORDER BY loans.id DESC;
```

---

## 🚀 Getting Started & Installation

### Prerequisites
- **Node.js** (v18.0.0 or higher; tested on v24.14.0)
- **npm** (v9.0.0 or higher)

### 1. Clone & Install Dependencies
```bash
# Navigate to project directory
cd beatbox-music-room

# Install runtime dependencies (express, sqlite3, cors) and dev dependencies (supertest)
npm install
```

### 2. Initialize and Seed the Database
```bash
npm run init-db
```
*Output: `Database initialized and seeded successfully.`*  
This executes `schema.sql` and populates `seed.sql` with sample musicians, instruments across all 3 families, and sample active/returned loans.

### 3. Start the Express Server
```bash
npm start
```
*Or run with automatic reload during development:*
```bash
npm run dev
```

The server will start listening at:  
👉 **`http://localhost:3000`**

---

## 🧪 Running Automated Tests

A comprehensive automated test suite (34 test cases) covers all routes, status codes, validations, and the Twist rule:

```bash
npm test
```

### Test Results Summary:
```
✔ Part 1: Server and Root Endpoints (3 tests passing)
✔ Part 5: Twist Rule Tests (Exact Client Brief Tests 1, 2, 3) (5 tests passing)
✔ Part 4: Validation and Search (6 tests passing)
✔ Part 3: Instruments CRUD Endpoints (8 tests passing)
✔ Parts 2 & 3: Loans & The Relational Join Endpoint (6 tests passing)
✔ Part 3: Musicians CRUD Endpoints (6 tests passing)

ℹ tests 34 | pass 34 | fail 0 | duration ~600ms
```

---

## 📡 API Reference & Endpoints

### 1. Instruments Endpoints (`/instruments`)

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/instruments` | Get all instruments (or filter via query params) | `200 OK` |
| `GET` | `/instruments?family=String` | **Search by query parameter** (e.g. `String`, `Percussion`, `Wind`) | `200 OK` |
| `GET` | `/instruments?search=guitar` | **Search by name keyword** | `200 OK` |
| `GET` | `/instruments/:id` | Get single instrument by ID | `200 OK`, `404 Not Found` |
| `POST` | `/instruments` | Add a new instrument (requires `name` and valid `family`) | `201 Created`, `400 Bad Request` |
| `PUT` | `/instruments/:id` | Update an existing instrument | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/instruments/:id` | Delete an instrument by ID | `200 OK`, `404 Not Found` |

#### Example: Add Instrument (Test 1 - Success)
```http
POST /instruments
Content-Type: application/json

{
  "name": "Yamaha Custom Cello",
  "family": "String"
}
```
**Response (`201 Created`):**
```json
{
  "id": 10,
  "name": "Yamaha Custom Cello",
  "family": "String",
  "created_at": "2026-11-13 10:20:00"
}
```

#### Example: Add Instrument (Test 2 - Twist Rule Rejection)
```http
POST /instruments
Content-Type: application/json

{
  "name": "Kazoo",
  "family": "Other"
}
```
**Response (`400 Bad Request`):**
```json
{
  "error": "Invalid instrument family 'Other'. Allowed values are: String, Percussion, Wind."
}
```

#### Example: Update Instrument (Test 3 - Success)
```http
PUT /instruments/10
Content-Type: application/json

{
  "family": "Percussion"
}
```
**Response (`200 OK`):**
```json
{
  "id": 10,
  "name": "Yamaha Custom Cello",
  "family": "Percussion",
  "created_at": "2026-11-13 10:20:00"
}
```

---

### 2. Relational Join Endpoint: Loans (`/loans`)

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/loans` | **Join Endpoint**: Returns all loans joined with musician and instrument details | `200 OK` |
| `GET` | `/loans?status=active` | Filter active loans (instruments currently checked out) | `200 OK` |
| `GET` | `/loans?family=Percussion`| Filter loans by instrument family | `200 OK` |
| `GET` | `/loans/:id` | Get single loan with joined musician and instrument details | `200 OK`, `404 Not Found` |
| `POST` | `/loans` | Borrow an instrument (`musician_id`, `instrument_id`, `loan_date`) | `201 Created`, `400 Bad Request`, `404 Not Found` |
| `PUT` | `/loans/:id` | Update loan (record `return_date` or change `status`) | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/loans/:id` | Delete loan record | `200 OK`, `404 Not Found` |

#### Example: Get All Loans (`GET /loans` - The Join Endpoint)
**Response (`200 OK`):**
```json
[
  {
    "id": 1,
    "loan_date": "2026-11-01",
    "return_date": null,
    "status": "active",
    "musician_id": 1,
    "musician_name": "Alice Walker",
    "musician_email": "alice.walker@beatbox.edu",
    "instrument_id": 3,
    "instrument_name": "Stradivarius Violin",
    "instrument_family": "String",
    "created_at": "2026-11-13 10:00:00"
  },
  {
    "id": 2,
    "loan_date": "2026-11-03",
    "return_date": null,
    "status": "active",
    "musician_id": 4,
    "musician_name": "Dave Grohl",
    "musician_email": "dave.grohl@beatbox.edu",
    "instrument_id": 4,
    "instrument_name": "Pearl Snare Drum",
    "instrument_family": "Percussion",
    "created_at": "2026-11-13 10:00:00"
  }
]
```

---

### 3. Musicians Endpoints (`/musicians`)

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/musicians` | Get all musicians | `200 OK` |
| `GET` | `/musicians/:id` | Get musician by ID | `200 OK`, `404 Not Found` |
| `POST` | `/musicians` | Create new musician (`name` required, `email` optional) | `201 Created`, `400 Bad Request` |
| `PUT` | `/musicians/:id` | Update musician details | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/musicians/:id` | Delete musician by ID | `200 OK`, `404 Not Found` |

---

## 📬 Postman Collection Setup & Execution

The repository includes a ready-to-use Postman collection with automated test scripts:
- **Collection File**: `postman/BeatBox_Music_Room.postman_collection.json` (also mirrored at root `BeatBox_Music_Room.postman_collection.json`)
- **Environment File**: `postman/BeatBox_Environment.postman_environment.json`

### How to Import and Run in Postman:
1. Open **Postman**.
2. Click **Import** (top left).
3. Drag and drop `BeatBox_Music_Room.postman_collection.json` and `BeatBox_Environment.postman_environment.json`.
4. Select the **BeatBox Local Environment** in the top-right environment selector.
5. Make sure the local server is running (`npm start`).
6. Click on the collection name **BeatBox Music Room API (YG-CSE2E-G09)** and click **Run collection**.
7. All requests will execute in sequence with **100% passing tests**!

---

## 🎤 Demo Day Preparation Guide (30 Individual Marks)

During the **3-minute live demo**, every team member must answer one question about their individual part. Below is a prepared Q&A cheat sheet:

### Part 1: Server and routes
- **Likely Question**: *"How did you structure the Express application and manage status codes?"*
- **Model Answer**: *"We decoupled server configuration (`src/app.js`) from server bootstrap (`server.js`) to allow seamless integration testing with Supertest without port collisions. We implemented Express JSON middleware, CORS, modular route mounting (`/instruments`, `/musicians`, `/loans`), and standard REST status codes: 200 for successful queries/updates, 201 for creations, 400 for client/validation errors, 404 for missing resources, and a centralized error handler for 500s."*

### Part 2: Database
- **Likely Question**: *"Why did you use `PRAGMA foreign_keys = ON;` and how are the tables related?"*
- **Model Answer**: *"In SQLite, foreign key constraints are disabled by default for backwards compatibility. We explicitly enable `PRAGMA foreign_keys = ON;` upon connection initialization. Our schema defines 3 tables: `musicians`, `instruments`, and the junction table `loans` which has foreign keys pointing to `musicians(id)` and `instruments(id)` with `ON DELETE CASCADE` to prevent orphaned records."*

### Part 3: REST endpoints & The Join Endpoint
- **Likely Question**: *"Explain how your join endpoint works and what problem it solves for the client."*
- **Model Answer**: *"The client's core problem was that borrowed strings and drums go home with students and cannot be tracked. Our join endpoint `GET /loans` executes an SQL INNER JOIN across `loans`, `musicians`, and `instruments`. Instead of returning cryptic foreign key numbers, it returns human-readable musician names, email contacts, instrument names, families, and checkout statuses, allowing staff to immediately identify who has which instrument."*

### Part 4: Validation and search
- **Likely Question**: *"How did you implement the query parameter search and input validation?"*
- **Model Answer**: *"We wrote modular Express middleware `validateInstrument` that sanitizes strings, checks for empty inputs, and returns clear 400 error messages before queries reach the database. For search, `GET /instruments` dynamically checks `req.query`: when `family` is passed (e.g. `?family=String`), it applies a parameterized SQL filter `WHERE LOWER(family) = LOWER(?)`, preventing SQL injection while supporting case-insensitive searching."*

### Part 5: Twist rule
- **Likely Question**: *"How did you enforce the Twist rule and ensure Tests 1, 2, and 3 pass?"*
- **Model Answer**: *"We established an allowed whitelist: `['String', 'Percussion', 'Wind']`. In `src/middleware/validation.js`, any request to add or update an instrument has its family checked against this whitelist. If a student submits 'Other', it triggers Test 2, returning HTTP 400 with the exact error message listing allowed values. In our automated test suite (`tests/api.test.js`), Test 1 creates with 'String' returning 201, Test 2 rejects 'Other' with 400, and Test 3 updates to 'Percussion' returning 200."*

### Part 6: Postman and README
- **Likely Question**: *"How did you set up the Postman collection to test the whole workflow?"*
- **Model Answer**: *"We designed a Postman v2.1 collection containing organized folders for the Twist Rule, Join Endpoint, Instruments, and Musicians. Each request contains JavaScript test scripts using `pm.test` and `pm.expect` to automatically assert status codes and validate schema properties. Collection variables dynamically store created IDs across chained tests, ensuring repeatable test runs for submission."*

---

## 📁 Repository Structure

```
beatbox-music-room/
├── .gitignore                                   # Ignored files (node_modules, local db)
├── package.json                                 # Scripts & dependencies
├── server.js                                    # Server entry point & startup bootstrap
├── BeatBox_Music_Room.postman_collection.json   # Postman collection (root copy)
├── postman/
│   ├── BeatBox_Music_Room.postman_collection.json # Postman v2.1 test collection
│   └── BeatBox_Environment.postman_environment.json # Postman environment
├── data/
│   └── beatbox.sqlite                           # SQLite database file (created on init)
├── src/
│   ├── app.js                                   # Express app setup & route mounting (Part 1)
│   ├── config/
│   │   └── database.js                          # SQLite wrapper & PRAGMA setup (Part 2)
│   ├── db/
│   │   ├── schema.sql                           # CREATE TABLE statements (Part 2)
│   │   ├── seed.sql                             # Initial realistic seed data (Part 2)
│   │   └── initDb.js                            # DB initialization CLI script (Part 2)
│   ├── middleware/
│   │   └── validation.js                        # Input validation & Twist rules (Parts 4 & 5)
│   └── routes/
│       ├── instruments.js                       # Instruments CRUD & query search (Parts 3, 4, 5)
│       ├── musicians.js                         # Musicians CRUD (Parts 1 & 3)
│       └── loans.js                             # Loans CRUD & Join endpoint (Parts 2 & 3)
├── tests/
│   └── api.test.js                              # Automated test suite (34 passing tests)
└── README.md                                    # Complete project documentation & demo guide
```

---

## 📤 Submission Checklist (ERP Upload by Sun 15 Nov)

- [x] **GitHub Link**: Push this repository to GitHub with clean commit history across members.
- [x] **Postman Collection**: `postman/BeatBox_Music_Room.postman_collection.json` included in repository.
- [x] **README.md**: Comprehensive documentation with instructions, team mapping, and API guide.
- [x] **Twist Rule Verified**: Tests 1, 2, and 3 pass in both automated tests and Postman.
- [x] **Join Endpoint Verified**: `GET /loans` returns joined musician and instrument names.
- [x] **Demo Day Prepared**: Team members assigned to Parts 1–6 with rehearsal answers ready.
