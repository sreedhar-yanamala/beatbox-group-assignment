// ============================================================
// Comprehensive Automated Test Suite
// BeatBox Music Room · Group YG-CSE2E-G09
// Tests for Parts 1, 2, 3, 4, 5 (Including Twist Rule Tests)
// ============================================================

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../src/app');
const db = require('../src/config/database');
const { initDatabase } = require('../src/db/initDb');

describe('BeatBox Music Room API Tests', () => {
  before(async () => {
    // Reset database with clean seed before running tests
    await initDatabase({ seed: true, force: true });
  });

  after(async () => {
    await db.close();
  });

  // ------------------------------------------------------------
  // SECTION 1: Root & Status Endpoints (Part 1)
  // ------------------------------------------------------------
  describe('Part 1: Server and Root Endpoints', () => {
    it('GET / should return 200 with API overview and group info', async () => {
      const res = await request(app).get('/');
      assert.equal(res.status, 200);
      assert.equal(res.body.group, 'YG-CSE2E-G09');
      assert.ok(res.body.endpoints);
    });

    it('GET /health should return 200 healthy status', async () => {
      const res = await request(app).get('/health');
      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'healthy');
    });

    it('GET /non-existent-route should return 404 Not Found', async () => {
      const res = await request(app).get('/non-existent-route');
      assert.equal(res.status, 404);
      assert.ok(res.body.error);
    });
  });

  // ------------------------------------------------------------
  // SECTION 2: Twist Rule Requirements (Part 5: 3 Specific Tests)
  // ------------------------------------------------------------
  describe('Part 5: Twist Rule Tests (Exact Client Brief Tests)', () => {
    let createdInstrumentId = null;

    it('Test 1: Add with family "String" -> 201', async () => {
      const res = await request(app)
        .post('/instruments')
        .send({
          name: 'Gibson Les Paul',
          family: 'String'
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.name, 'Gibson Les Paul');
      assert.equal(res.body.family, 'String');
      assert.ok(res.body.id);
      createdInstrumentId = res.body.id;
    });

    it('Test 2: Add with family "Other" -> 400, allowed values shown', async () => {
      const res = await request(app)
        .post('/instruments')
        .send({
          name: 'Kazoo Wonder',
          family: 'Other'
        });

      assert.equal(res.status, 400);
      assert.ok(res.body.error);
      // Verify that the error message lists the allowed values: String, Percussion, Wind
      assert.match(res.body.error, /String/);
      assert.match(res.body.error, /Percussion/);
      assert.match(res.body.error, /Wind/);
    });

    it('Test 3: Update to "Percussion" -> 200', async () => {
      assert.ok(createdInstrumentId, 'Requires ID from Test 1');

      const res = await request(app)
        .put(`/instruments/${createdInstrumentId}`)
        .send({
          family: 'Percussion'
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.id, createdInstrumentId);
      assert.equal(res.body.family, 'Percussion');
    });

    it('Twist Rule: Add with family "Wind" -> 201', async () => {
      const res = await request(app)
        .post('/instruments')
        .send({
          name: 'Yamaha Oboe',
          family: 'Wind'
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.family, 'Wind');
    });

    it('Twist Rule: Update with invalid family "Brass" -> 400 with allowed values', async () => {
      const res = await request(app)
        .put(`/instruments/${createdInstrumentId}`)
        .send({
          family: 'Brass'
        });

      assert.equal(res.status, 400);
      assert.match(res.body.error, /String/);
      assert.match(res.body.error, /Percussion/);
      assert.match(res.body.error, /Wind/);
    });
  });

  // ------------------------------------------------------------
  // SECTION 3: Instruments Validation & Search (Part 4)
  // ------------------------------------------------------------
  describe('Part 4: Validation and Search', () => {
    it('Validation: Add without name -> 400 with clear message', async () => {
      const res = await request(app)
        .post('/instruments')
        .send({ family: 'String' });

      assert.equal(res.status, 400);
      assert.equal(res.body.error, 'Instrument name is required and cannot be empty.');
    });

    it('Validation: Add without family -> 400 with clear message', async () => {
      const res = await request(app)
        .post('/instruments')
        .send({ name: 'Empty Family Test' });

      assert.equal(res.status, 400);
      assert.match(res.body.error, /Instrument family is required/);
    });

    it('Search: GET /instruments?family=String -> returns only String instruments', async () => {
      const res = await request(app).get('/instruments?family=String');
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body));
      assert.ok(res.body.length > 0);
      for (const item of res.body) {
        assert.equal(item.family, 'String');
      }
    });

    it('Search: GET /instruments?family=Percussion -> returns only Percussion instruments', async () => {
      const res = await request(app).get('/instruments?family=Percussion');
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body));
      assert.ok(res.body.length > 0);
      for (const item of res.body) {
        assert.equal(item.family, 'Percussion');
      }
    });

    it('Search: GET /instruments?family=Wind -> returns only Wind instruments', async () => {
      const res = await request(app).get('/instruments?family=Wind');
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body));
      assert.ok(res.body.length > 0);
      for (const item of res.body) {
        assert.equal(item.family, 'Wind');
      }
    });

    it('Search: GET /instruments?search=Violin -> returns instruments matching name', async () => {
      const res = await request(app).get('/instruments?search=Violin');
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body));
      assert.ok(res.body.length >= 1);
      assert.match(res.body[0].name, /Violin/i);
    });
  });

  // ------------------------------------------------------------
  // SECTION 4: Instruments REST CRUD Endpoints (Part 3)
  // ------------------------------------------------------------
  describe('Part 3: Instruments CRUD Endpoints', () => {
    let testInstId;

    it('GET /instruments should return list of all instruments', async () => {
      const res = await request(app).get('/instruments');
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body));
      assert.ok(res.body.length > 0);
    });

    it('POST /instruments should create an instrument and return 201', async () => {
      const res = await request(app)
        .post('/instruments')
        .send({ name: 'Yamaha Piccolo', family: 'Wind' });

      assert.equal(res.status, 201);
      assert.equal(res.body.name, 'Yamaha Piccolo');
      assert.equal(res.body.family, 'Wind');
      testInstId = res.body.id;
    });

    it('GET /instruments/:id should return single instrument', async () => {
      const res = await request(app).get(`/instruments/${testInstId}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.id, testInstId);
      assert.equal(res.body.name, 'Yamaha Piccolo');
    });

    it('GET /instruments/:id for non-existent ID should return 404', async () => {
      const res = await request(app).get('/instruments/99999');
      assert.equal(res.status, 404);
      assert.ok(res.body.error);
    });

    it('PUT /instruments/:id should update name and return 200', async () => {
      const res = await request(app)
        .put(`/instruments/${testInstId}`)
        .send({ name: 'Yamaha Custom Piccolo' });

      assert.equal(res.status, 200);
      assert.equal(res.body.name, 'Yamaha Custom Piccolo');
      assert.equal(res.body.family, 'Wind');
    });

    it('PUT /instruments/:id for non-existent ID should return 404', async () => {
      const res = await request(app)
        .put('/instruments/99999')
        .send({ name: 'Does Not Exist' });

      assert.equal(res.status, 404);
      assert.ok(res.body.error);
    });

    it('DELETE /instruments/:id should delete instrument and return 200', async () => {
      const res = await request(app).delete(`/instruments/${testInstId}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.deletedId, testInstId);

      // Verify it is gone
      const checkRes = await request(app).get(`/instruments/${testInstId}`);
      assert.equal(checkRes.status, 404);
    });

    it('DELETE /instruments/:id for non-existent ID should return 404', async () => {
      const res = await request(app).delete('/instruments/99999');
      assert.equal(res.status, 404);
      assert.ok(res.body.error);
    });
  });

  // ------------------------------------------------------------
  // SECTION 5: Loans & The Relational JOIN Endpoint (Parts 2 & 3)
  // ------------------------------------------------------------
  describe('Parts 2 & 3: Loans & The Relational Join Endpoint', () => {
    it('GET /loans should return loans with musician_name and instrument_name joined', async () => {
      const res = await request(app).get('/loans');
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body));
      assert.ok(res.body.length > 0);

      const firstLoan = res.body[0];
      // Assert joined columns exist
      assert.ok(firstLoan.id, 'Loan must have an id');
      assert.ok(firstLoan.musician_id, 'Loan must have musician_id');
      assert.ok(firstLoan.musician_name, 'Loan must have joined musician_name');
      assert.ok(firstLoan.instrument_id, 'Loan must have instrument_id');
      assert.ok(firstLoan.instrument_name, 'Loan must have joined instrument_name');
      assert.ok(firstLoan.instrument_family, 'Loan must have instrument_family');
      assert.ok(firstLoan.loan_date, 'Loan must have loan_date');
      assert.ok(firstLoan.status, 'Loan must have status');
    });

    it('GET /loans?status=active should return only active loans', async () => {
      const res = await request(app).get('/loans?status=active');
      assert.equal(res.status, 200);
      for (const loan of res.body) {
        assert.equal(loan.status, 'active');
      }
    });

    it('POST /loans should create a new loan and return 201 with joined info', async () => {
      const res = await request(app)
        .post('/loans')
        .send({
          musician_id: 1,
          instrument_id: 2,
          loan_date: '2026-11-13',
          status: 'active'
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.musician_id, 1);
      assert.equal(res.body.instrument_id, 2);
      assert.ok(res.body.musician_name);
      assert.ok(res.body.instrument_name);
      assert.equal(res.body.status, 'active');
    });

    it('POST /loans with non-existent musician_id should return 404', async () => {
      const res = await request(app)
        .post('/loans')
        .send({
          musician_id: 9999,
          instrument_id: 1,
          loan_date: '2026-11-13'
        });

      assert.equal(res.status, 404);
      assert.match(res.body.error, /Musician with ID 9999 does not exist/);
    });

    it('POST /loans with non-existent instrument_id should return 404', async () => {
      const res = await request(app)
        .post('/loans')
        .send({
          musician_id: 1,
          instrument_id: 9999,
          loan_date: '2026-11-13'
        });

      assert.equal(res.status, 404);
      assert.match(res.body.error, /Instrument with ID 9999 does not exist/);
    });

    it('PUT /loans/:id should update loan status to returned', async () => {
      const res = await request(app)
        .put('/loans/1')
        .send({
          status: 'returned',
          return_date: '2026-11-13'
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.id, 1);
      assert.equal(res.body.status, 'returned');
      assert.equal(res.body.return_date, '2026-11-13');
    });
  });

  // ------------------------------------------------------------
  // SECTION 6: Musicians CRUD Endpoints (Part 3)
  // ------------------------------------------------------------
  describe('Part 3: Musicians CRUD Endpoints', () => {
    let createdMusicianId;

    it('GET /musicians should return list of musicians', async () => {
      const res = await request(app).get('/musicians');
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body));
      assert.ok(res.body.length >= 5);
    });

    it('POST /musicians should create musician and return 201', async () => {
      const res = await request(app)
        .post('/musicians')
        .send({
          name: 'Jimi Hendrix',
          email: 'jimi.hendrix@beatbox.edu'
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.name, 'Jimi Hendrix');
      assert.equal(res.body.email, 'jimi.hendrix@beatbox.edu');
      createdMusicianId = res.body.id;
    });

    it('POST /musicians without name should return 400', async () => {
      const res = await request(app)
        .post('/musicians')
        .send({ email: 'noname@beatbox.edu' });

      assert.equal(res.status, 400);
      assert.equal(res.body.error, 'Musician name is required and cannot be empty.');
    });

    it('GET /musicians/:id should return single musician', async () => {
      const res = await request(app).get(`/musicians/${createdMusicianId}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.id, createdMusicianId);
      assert.equal(res.body.name, 'Jimi Hendrix');
    });

    it('PUT /musicians/:id should update musician details', async () => {
      const res = await request(app)
        .put(`/musicians/${createdMusicianId}`)
        .send({ name: 'James Marshall Hendrix' });

      assert.equal(res.status, 200);
      assert.equal(res.body.name, 'James Marshall Hendrix');
    });

    it('DELETE /musicians/:id should delete musician', async () => {
      const res = await request(app).delete(`/musicians/${createdMusicianId}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.deletedId, createdMusicianId);
    });
  });
});
