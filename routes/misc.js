const express = require('express');
const router = express.Router();

// Catch-all router
router.route('/').all(function (req, res) {
    res.json('The only working endpoint for this API is /trailer/?movieLink={link} where {link} is the URL to a film in Viaplay.');
  }
);

module.exports = router;