const Firebase = require('./firebase/firebase');

const Users = (function() {
  let list = [];

  return {
    addUser: function(user, callback) {
      if (!list.some(existingUser => existingUser.id === user.id)) {
        list.push(user);
        callback({
          userCount: list.length
        });

        // Push up viewer info and increment viewer counts.
        Firebase.jobsBySlug(user['job']['slug']).once('value', snapshot => {
          const viewCountRef = snapshot.ref.child('viewCount');
          const viewersRef = snapshot.ref.child('viewers');

          viewCountRef
            .transaction(curValue => (curValue || 0) + 1)
            .then(count => console.log('count updated!', count))
            .catch(err => console.log('Failed to increment viewer count', err));

          viewersRef
            .push(user);
        });
      }
    },
    removeUser: function(id) {
      list.forEach((user, index) => {
        if (user.id === id) list.splice(index, 1);
        console.log('user ' + id + ' was removed.', this.userCount());
      });
    },
    getList: function() {
      return list;
    },
    userCount: function() {
      return list.length;
    },
  };
})();

module.exports = Users;
