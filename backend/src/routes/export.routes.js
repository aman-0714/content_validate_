const express = require('express');
const router = express.Router();
const {
  downloadPDF,
  generateShareLink,
  revokeShareLink,
  getSharedReport
} = require('../controllers/export.controller');
const { protect } = require('../middleware/auth.middleware');

// Protected: requires login
router.get('/:id/pdf',          protect, downloadPDF);
router.post('/:id/share',       protect, generateShareLink);
router.delete('/:id/share',     protect, revokeShareLink);

// Public: no auth — share token lookup
router.get('/shared/:token',    getSharedReport);

module.exports = router;
