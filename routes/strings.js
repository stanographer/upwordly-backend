// Strings for API messages.

const strings = {
  deleteFail: 'Sorry, there was an error in deleting that document.',
  deleteSuccess: 'Job successfully deleted!',
  fetchFail: 'Sorry, that doc could not be fetched.',
  fullTextBlurb: 'Please specify a stenographer and a job to download raw transcripts (https://upword.ly/api/?user=stanley&job=mopd-2019-1-6). Or for a snippet, redirect to /snippet and add a start and ending index (https://upword.ly/api/snippet?user=stanley&job=mopd-2019-1-6&start=0&end=200).',
  goneOrDeleted: 'Sorry. There\'s either nothing here or this document has been deleted.',
  retrievalError: 'Sorry, there was an error in retrieving that document for deletion.',
  snippetBlurb: 'Please specify a stenographer and a job to download raw snippet with a start and ending index (https://upword.ly/api/snippet?user=stanley&job=mopd-2019-1-6&start=0&end=200).',
  title: 'Upwordly API 1.0.0',
};

module.exports = strings;
