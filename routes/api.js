const cors    = require('cors'),
      express = require('express'),
      router  = express.Router();

const sendRaw = (res, message) => {
  if (!message) {
    message = 'Sorry. There\'s either nothing here or this document has been deleted.\n';
  }

  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.write(message);
  res.end();
};

// Raw text API allows retrieval of full raw transcript text.
router.get('/', cors(), (req, res) => {
  if (!req.query.user && !req.query.job) {
    return res.render('api.pug', {
      title: 'Upwordly API version 1.0.0',
      message: 'Please specify a stenographer and a job to download raw transcripts (https://upword.ly/api/?user=stanley&job=mopd-2019-1-6). Or for a snippet, redirect to /snippet and add a start and ending index (https://upword.ly/api/snippet?user=stanley&job=mopd-2019-1-6&start=0&end=200).',
    });
  }

  const connection = req.app.backend.connect();
  const doc = connection.get(req.query.user, req.query.job);

  doc.fetch(err => {
    if (err) {
      res.send(500, 'Sorry, that doc could not be fetched.').end();
    }

    sendRaw(res, doc.data);
  });
});

// Retrieves snippets with given start and end indeces.
router.get('/snippet', cors(), (req, res) => {
  if (!req.query.user && !req.query.job) {
    return res.render('api.pug', {
      title: 'Upwordly API version 1.0.0',
      message: 'Please specify a stenographer and a job to download raw snippet with a start and ending index (https://upword.ly/api/snippet?user=stanley&job=mopd-2019-1-6&start=0&end=200).',
    });
  }

  const connection = req.app.backend.connect();
  const doc = connection.get(req.query.user, req.query.job);

  doc.fetch(err => {
    if (err) {
      return res.end('Sorry, that doc could not be fetched.');
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
      if (err) res.status(500).send('Sorry, there was an error in retrieving that document for deletion.');

      doc.del(err => {
        if (err) res.status(500).send('Sorry, there was an error in deleting that document.');
        doc.destroy();
        res.status(200).send('Job successfully deleted!');
      });
    });
  } catch (err) {
    res.status(500).send('Sorry. That document exist or is empty!');
  }
});

module.exports = router;
