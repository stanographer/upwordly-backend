const express = require('express'),
      router  = express.Router();

// GET landing page (which nobody will really see).
router.get('/', (req, res) => {
  res.send('Welcome to Upwordly 1.0.0!');
});

module.exports = router;
