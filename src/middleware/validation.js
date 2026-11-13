// ============================================================
// Input Validation Middleware & Twist Rule Enforcement
// BeatBox Music Room · Group YG-CSE2E-G09
// Parts 4 & 5: Validation, Search & Twist Rule
// ============================================================

// Twist Rule: Allowed families
const ALLOWED_FAMILIES = ['String', 'Percussion', 'Wind'];

/**
 * Validate instrument payload for POST (add) and PUT (update)
 * @param {boolean} isUpdate - true if PUT route, false if POST route
 */
function validateInstrument(isUpdate = false) {
  return (req, res, next) => {
    const { name, family } = req.body;

    // On ADD (POST), both name and family are mandatory
    if (!isUpdate) {
      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
          error: 'Instrument name is required and cannot be empty.'
        });
      }

      if (!family || typeof family !== 'string' || family.trim() === '') {
        return res.status(400).json({
          error: `Instrument family is required. Allowed values are: ${ALLOWED_FAMILIES.join(', ')}.`
        });
      }
    } else {
      // On UPDATE (PUT), at least one field must be supplied
      if (name === undefined && family === undefined) {
        return res.status(400).json({
          error: 'At least one field (name or family) must be provided for update.'
        });
      }

      if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
        return res.status(400).json({
          error: 'Instrument name cannot be empty.'
        });
      }
    }

    // Twist Rule Validation: check family if present
    if (family !== undefined) {
      if (typeof family !== 'string' || family.trim() === '') {
        return res.status(400).json({
          error: `Instrument family cannot be empty. Allowed values are: ${ALLOWED_FAMILIES.join(', ')}.`
        });
      }

      // Check against allowed values (case-insensitive match, but normalized to Title Case)
      const trimmedFamily = family.trim();
      const matchedFamily = ALLOWED_FAMILIES.find(
        (f) => f.toLowerCase() === trimmedFamily.toLowerCase()
      );

      if (!matchedFamily) {
        // Test 2: Add or update with invalid family -> 400 and list allowed values
        return res.status(400).json({
          error: `Invalid instrument family '${trimmedFamily}'. Allowed values are: ${ALLOWED_FAMILIES.join(', ')}.`
        });
      }

      // Store normalized title-cased family in req.body
      req.body.family = matchedFamily;
    }

    if (name !== undefined) {
      req.body.name = name.trim();
    }

    next();
  };
}

/**
 * Validate musician payload
 */
function validateMusician(isUpdate = false) {
  return (req, res, next) => {
    const { name, email } = req.body;

    if (!isUpdate) {
      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
          error: 'Musician name is required and cannot be empty.'
        });
      }
    } else {
      if (name === undefined && email === undefined) {
        return res.status(400).json({
          error: 'At least one field (name or email) must be provided for update.'
        });
      }

      if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
        return res.status(400).json({
          error: 'Musician name cannot be empty.'
        });
      }
    }

    if (name !== undefined) {
      req.body.name = name.trim();
    }

    if (email !== undefined && email !== null) {
      if (typeof email !== 'string') {
        return res.status(400).json({
          error: 'Email must be a valid string.'
        });
      }
      req.body.email = email.trim();
    }

    next();
  };
}

/**
 * Validate loan payload
 */
function validateLoan(isUpdate = false) {
  return (req, res, next) => {
    const { musician_id, instrument_id, loan_date, return_date, status } = req.body;

    if (!isUpdate) {
      if (!musician_id || isNaN(parseInt(musician_id, 10))) {
        return res.status(400).json({
          error: 'A valid musician_id integer is required.'
        });
      }

      if (!instrument_id || isNaN(parseInt(instrument_id, 10))) {
        return res.status(400).json({
          error: 'A valid instrument_id integer is required.'
        });
      }

      req.body.musician_id = parseInt(musician_id, 10);
      req.body.instrument_id = parseInt(instrument_id, 10);

      // Default loan_date to today if not provided
      if (!loan_date) {
        req.body.loan_date = new Date().toISOString().split('T')[0];
      }
    } else {
      if (
        musician_id === undefined &&
        instrument_id === undefined &&
        loan_date === undefined &&
        return_date === undefined &&
        status === undefined
      ) {
        return res.status(400).json({
          error: 'At least one loan field must be provided for update.'
        });
      }

      if (musician_id !== undefined) {
        if (isNaN(parseInt(musician_id, 10))) {
          return res.status(400).json({ error: 'musician_id must be a valid integer.' });
        }
        req.body.musician_id = parseInt(musician_id, 10);
      }

      if (instrument_id !== undefined) {
        if (isNaN(parseInt(instrument_id, 10))) {
          return res.status(400).json({ error: 'instrument_id must be a valid integer.' });
        }
        req.body.instrument_id = parseInt(instrument_id, 10);
      }
    }

    if (status !== undefined) {
      if (!['active', 'returned'].includes(status)) {
        return res.status(400).json({
          error: "Loan status must be either 'active' or 'returned'."
        });
      }
    }

    next();
  };
}

module.exports = {
  ALLOWED_FAMILIES,
  validateInstrument,
  validateMusician,
  validateLoan
};
