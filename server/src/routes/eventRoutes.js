const express = require('express');
const router = express.Router();
const { createEvent, getEvents, deleteEvent } = require('../controllers/eventController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', protect, getEvents);
router.post('/', protect, authorize('admin', 'maker'), createEvent);
router.delete('/:id', protect, authorize('admin', 'maker'), deleteEvent);

module.exports = router;
