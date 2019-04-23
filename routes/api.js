const cors    = require('cors'),
      express = require('express'),
      router  = express.Router(),
      strings = require('./strings');

const sendRaw = (res, message) => {
  if (!message) {
    message = strings.goneOrDeleted;
  }

  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8'
  });
  res.write(message);
  res.end();
};

// Raw text API allows retrieval of full raw transcript text.
router.get('/', cors(), (req, res) => {
  if (!req.query.user && !req.query.job) {
    return res.render('api.pug', {
      title: strings.title,
      message: strings.fullTextBlurb,
    });
  }

  const connection = req.app.backend.connect();
  const doc = connection.get(req.query.user, req.query.job);

  doc.fetch(err => {
    if (err) {
      res.send(500, strings.fetchFail).end();
    }

    sendRaw(res, doc.data);
  });
});

// Retrieves snippets with given start and end indeces.
router.get('/snippet', cors(), (req, res) => {
  if (!req.query.user && !req.query.job) {
    return res.render('api.pug', {
      title: strings.title,
      message: strings.snippetBlurb,
    });
  }

  const connection = req.app.backend.connect();
  const doc = connection.get(req.query.user, req.query.job);

  doc.fetch(err => {
    if (err) {
      return res.end(strings.fetchFail);
    }

    const snippet = doc.data
      ? doc.data.substring(
        req.query.start >= 0
          ? req.query.start
          : 0,
        req.query.end <= doc.data.length
          ? req.query.end
          : doc.data.length - 1)
      : '';

    sendRaw(res, snippet);
  });
});

// Deletes a job from the ShareDB repo.
router.delete('/', cors(), (req, res) => {
  const connection = req.app.backend.connect();
  const doc = connection.get(req.query.user, req.query.job);

  try {
    doc.fetch(err => {
      if (err) res.status(500).send(strings.retrievalError);

      doc.del(err => {
        if (err) res.status(500).send(strings.deleteFail);
        doc.destroy();
        res.status(200).send(strings.deleteSuccess);
      });
    });
  } catch (err) {
    res.status(500).send(strings.goneOrDeleted);
  }
});

module.exports = router;
