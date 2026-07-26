const express = require('express');
const router = express.Router();
const { handleToggleFavourite, handleGetUserFavourites } = require('../controllers/favouriteController');

router.post('/toggle', handleToggleFavourite);
router.get('/user/:userId', handleGetUserFavourites);

module.exports = router;
