const express = require('express');
const router = express.Router();

const photos = require('../controllers/voters.controller');

router.get('/voters', photos.loadAll);

module.exports = router;
