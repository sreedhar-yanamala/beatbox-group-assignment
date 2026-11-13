// ============================================================
// Musicians Routes (CRUD Endpoints)
// BeatBox Music Room · Group YG-CSE2E-G09
// Parts 1 & 3: Server, Routes & REST Endpoints
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validateMusician } = require('../middleware/validation');

/**
 * GET /musicians
 * Returns all musicians
 * Status: 200 OK
 */
router.get('/', async (req, res, next) => {
  try {
    const musicians = await db.all('SELECT * FROM musicians ORDER BY id ASC');
    return res.status(200).json(musicians);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /musicians/:id
 * Returns a single musician by ID
 * Status: 200 OK or 404 Not Found
 */
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Musician ID must be a valid integer.' });
    }

    const musician = await db.get('SELECT * FROM musicians WHERE id = ?', [id]);
    if (!musician) {
      return res.status(404).json({ error: `Musician with ID ${id} not found.` });
    }

    return res.status(200).json(musician);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /musicians
 * Adds a new musician
 * Status: 201 Created or 400 Bad Request
 */
router.post('/', validateMusician(false), async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const result = await db.run(
      'INSERT INTO musicians (name, email) VALUES (?, ?)',
      [name, email || null]
    );

    const newMusician = await db.get('SELECT * FROM musicians WHERE id = ?', [result.lastID]);
    return res.status(201).json(newMusician);
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'A musician with this email already exists.' });
    }
    next(error);
  }
});

/**
 * PUT /musicians/:id
 * Updates a musician
 * Status: 200 OK, 400 Bad Request, or 404 Not Found
 */
router.put('/:id', validateMusician(true), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Musician ID must be a valid integer.' });
    }

    const existing = await db.get('SELECT * FROM musicians WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: `Musician with ID ${id} not found.` });
    }

    const updatedName = req.body.name !== undefined ? req.body.name : existing.name;
    const updatedEmail = req.body.email !== undefined ? req.body.email : existing.email;

    await db.run(
      'UPDATE musicians SET name = ?, email = ? WHERE id = ?',
      [updatedName, updatedEmail, id]
    );

    const updatedMusician = await db.get('SELECT * FROM musicians WHERE id = ?', [id]);
    return res.status(200).json(updatedMusician);
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'A musician with this email already exists.' });
    }
    next(error);
  }
});

/**
 * DELETE /musicians/:id
 * Deletes a musician
 * Status: 200 OK or 404 Not Found
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Musician ID must be a valid integer.' });
    }

    const existing = await db.get('SELECT * FROM musicians WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: `Musician with ID ${id} not found.` });
    }

    await db.run('DELETE FROM musicians WHERE id = ?', [id]);
    return res.status(200).json({
      message: `Musician with ID ${id} deleted successfully.`,
      deletedId: id
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
