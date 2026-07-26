const express = require('express');
const router = express.Router();
const { handleToggleSubscribe, handleGetSubscriberCount } = require('../controllers/subscriptionController');

router.post('/subscribe', handleToggleSubscribe);
router.get('/author/:authorId', handleGetSubscriberCount);

module.exports = router;
