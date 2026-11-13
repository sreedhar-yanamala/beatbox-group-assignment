// ============================================================
// Instruments Routes (CRUD + Query Parameter Search)
// BeatBox Music Room · Group YG-CSE2E-G09
// Parts 3, 4 & 5: REST Endpoints, Search & Twist Rules
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validateInstrument } = require('../middleware/validation');

/**
 * GET /instruments
 * Returns all instruments, or filters by query parameter (e.g. ?family=String or ?search=guitar)
 * Status: 200 OK
 */
router.get('/', async (req, res, next) => {
  try {
    const { family, search, name } = req.query;
    let sql = 'SELECT * FROM instruments WHERE 1=1';
    const params = [];

    // Search by query parameter: family
    if (family) {
      sql += ' AND LOWER(family) = LOWER(?)';
      params.push(family.trim());
    }

    // Search by query parameter: name / keyword
    const searchParam = search || name;
    if (searchParam) {
      sql += ' AND LOWER(name) LIKE LOWER(?)';
      params.push(`%${searchParam.trim()}%`);
    }

    sql += ' ORDER BY id ASC';
    const instruments = await db.all(sql, params);
    return res.status(200).json(instruments);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /instruments/:id
 * Returns a single instrument by its ID
 * Status: 200 OK or 404 Not Found
 */
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Instrument ID must be a valid integer.' });
    }

    const instrument = await db.get('SELECT * FROM instruments WHERE id = ?', [id]);
    if (!instrument) {
      return res.status(404).json({ error: `Instrument with ID ${id} not found.` });
    }

    return res.status(200).json(instrument);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /instruments
 * Adds a new instrument with name and family
 * Twist Test 1: Add with family "String" -> 201
 * Twist Test 2: Add with family "Other" -> 400, allowed values shown
 * Status: 201 Created or 400 Bad Request
 */
router.post('/', validateInstrument(false), async (req, res, next) => {
  try {
    const { name, family } = req.body;
    const result = await db.run(
      'INSERT INTO instruments (name, family) VALUES (?, ?)',
      [name, family]
    );

    const newInstrument = await db.get('SELECT * FROM instruments WHERE id = ?', [result.lastID]);
    return res.status(201).json(newInstrument);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /instruments/:id
 * Updates an instrument's name or family
 * Twist Test 3: Update to "Percussion" -> 200
 * Status: 200 OK, 400 Bad Request, or 404 Not Found
 */
router.put('/:id', validateInstrument(true), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Instrument ID must be a valid integer.' });
    }

    const existing = await db.get('SELECT * FROM instruments WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: `Instrument with ID ${id} not found.` });
    }

    const updatedName = req.body.name !== undefined ? req.body.name : existing.name;
    const updatedFamily = req.body.family !== undefined ? req.body.family : existing.family;

    await db.run(
      'UPDATE instruments SET name = ?, family = ? WHERE id = ?',
      [updatedName, updatedFamily, id]
    );

    const updatedInstrument = await db.get('SELECT * FROM instruments WHERE id = ?', [id]);
    return res.status(200).json(updatedInstrument);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /instruments/:id
 * Deletes an instrument by ID
 * Status: 200 OK or 404 Not Found
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Instrument ID must be a valid integer.' });
    }

    const existing = await db.get('SELECT * FROM instruments WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: `Instrument with ID ${id} not found.` });
    }

    await db.run('DELETE FROM instruments WHERE id = ?', [id]);
    return res.status(200).json({
      message: `Instrument with ID ${id} deleted successfully.`,
      deletedId: id
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
