// ============================================================
// Loans Routes & Relational JOIN Endpoint
// BeatBox Music Room · Group YG-CSE2E-G09
// Parts 1, 2 & 3: Database Relations & Join Endpoint
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validateLoan } = require('../middleware/validation');

// Base SELECT query with SQL JOIN between loans, musicians, and instruments
const JOINED_LOANS_QUERY = `
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
`;

/**
 * GET /loans
 * THE JOIN ENDPOINT: returns loans with the musician name and instrument name
 * Status: 200 OK
 * Supports optional filters: ?status=active/returned, ?family=String, ?musician_id=...
 */
router.get('/', async (req, res, next) => {
  try {
    const { status, family, musician_id } = req.query;
    let sql = `${JOINED_LOANS_QUERY} WHERE 1=1`;
    const params = [];

    if (status) {
      sql += ' AND LOWER(loans.status) = LOWER(?)';
      params.push(status.trim());
    }

    if (family) {
      sql += ' AND LOWER(instruments.family) = LOWER(?)';
      params.push(family.trim());
    }

    if (musician_id) {
      sql += ' AND loans.musician_id = ?';
      params.push(parseInt(musician_id, 10));
    }

    sql += ' ORDER BY loans.id DESC';

    const loans = await db.all(sql, params);
    return res.status(200).json(loans);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /loans/:id
 * Returns a single loan with musician and instrument details
 * Status: 200 OK or 404 Not Found
 */
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Loan ID must be a valid integer.' });
    }

    const sql = `${JOINED_LOANS_QUERY} WHERE loans.id = ?`;
    const loan = await db.get(sql, [id]);

    if (!loan) {
      return res.status(404).json({ error: `Loan with ID ${id} not found.` });
    }

    return res.status(200).json(loan);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /loans
 * Creates a new loan record
 * Validates foreign key relationships before insertion
 * Status: 201 Created, 400 Bad Request, or 404 Not Found
 */
router.post('/', validateLoan(false), async (req, res, next) => {
  try {
    const { musician_id, instrument_id, loan_date, return_date, status } = req.body;

    // Verify musician exists
    const musician = await db.get('SELECT id FROM musicians WHERE id = ?', [musician_id]);
    if (!musician) {
      return res.status(404).json({ error: `Cannot create loan: Musician with ID ${musician_id} does not exist.` });
    }

    // Verify instrument exists
    const instrument = await db.get('SELECT id FROM instruments WHERE id = ?', [instrument_id]);
    if (!instrument) {
      return res.status(404).json({ error: `Cannot create loan: Instrument with ID ${instrument_id} does not exist.` });
    }

    const loanStatus = status || 'active';
    const result = await db.run(
      'INSERT INTO loans (musician_id, instrument_id, loan_date, return_date, status) VALUES (?, ?, ?, ?, ?)',
      [musician_id, instrument_id, loan_date, return_date || null, loanStatus]
    );

    // Return the newly created loan with joined names
    const newLoan = await db.get(`${JOINED_LOANS_QUERY} WHERE loans.id = ?`, [result.lastID]);
    return res.status(201).json(newLoan);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /loans/:id
 * Updates an existing loan (e.g. record return_date or toggle status)
 * Status: 200 OK, 400 Bad Request, or 404 Not Found
 */
router.put('/:id', validateLoan(true), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Loan ID must be a valid integer.' });
    }

    const existing = await db.get('SELECT * FROM loans WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: `Loan with ID ${id} not found.` });
    }

    const musician_id = req.body.musician_id !== undefined ? req.body.musician_id : existing.musician_id;
    const instrument_id = req.body.instrument_id !== undefined ? req.body.instrument_id : existing.instrument_id;
    const loan_date = req.body.loan_date !== undefined ? req.body.loan_date : existing.loan_date;
    const return_date = req.body.return_date !== undefined ? req.body.return_date : existing.return_date;
    const status = req.body.status !== undefined ? req.body.status : existing.status;

    // Check FKs if updated
    if (req.body.musician_id !== undefined) {
      const musician = await db.get('SELECT id FROM musicians WHERE id = ?', [musician_id]);
      if (!musician) {
        return res.status(404).json({ error: `Musician with ID ${musician_id} does not exist.` });
      }
    }

    if (req.body.instrument_id !== undefined) {
      const instrument = await db.get('SELECT id FROM instruments WHERE id = ?', [instrument_id]);
      if (!instrument) {
        return res.status(404).json({ error: `Instrument with ID ${instrument_id} does not exist.` });
      }
    }

    await db.run(
      'UPDATE loans SET musician_id = ?, instrument_id = ?, loan_date = ?, return_date = ?, status = ? WHERE id = ?',
      [musician_id, instrument_id, loan_date, return_date, status, id]
    );

    const updated = await db.get(`${JOINED_LOANS_QUERY} WHERE loans.id = ?`, [id]);
    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /loans/:id
 * Deletes a loan record
 * Status: 200 OK or 404 Not Found
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Loan ID must be a valid integer.' });
    }

    const existing = await db.get('SELECT * FROM loans WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: `Loan with ID ${id} not found.` });
    }

    await db.run('DELETE FROM loans WHERE id = ?', [id]);
    return res.status(200).json({
      message: `Loan with ID ${id} deleted successfully.`,
      deletedId: id
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
