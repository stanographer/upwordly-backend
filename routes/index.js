const express = require('express'),
      router  = express.Router();

// GET home page.
router.get('/', (req, res) => {
  res.send('Welcome to Upwordly 1.0.0!');
});

module.exports = router;
