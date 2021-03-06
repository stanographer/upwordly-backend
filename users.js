const Firebase = require('./firebase/firebase');

const Users = (function() {
  let list = [];

  return {
    addUser: function(payload) {
      if (!list.some(existingUser => existingUser.id === payload.id)) {
        list.push(payload);

        const findKey = async slug => {
          let key = '';

          await Firebase.jobsBySlug(slug)
            .once('value', snapshot => {
              if (!snapshot.exists()) return;
              key = Object.keys(snapshot.val())[0];
            });
          return key;
        };

        const updateStats = key => {
          const stats = Firebase.job(key).child('stats');
          const currentViewCount = stats.child('currentViewCount');
          const currentViewers = stats.child('currentViewers');
          const maxSimViewers = stats.child('maxSimViewers');
          const viewCount = stats.child('viewCount');
          const viewers = stats.child('viewers');

          let liveViewCount = 0;

          currentViewCount
            .transaction(current => !current ? 1 : current + 1)
            .then(count => {
              liveViewCount = count.snapshot.val();
              console.log('current count updated!', count.snapshot.val());

              maxSimViewers
                .transaction(current => current < liveViewCount ? liveViewCount : current)
                .then(count => console.log('max simultaneous count updated!', count.snapshot.val()));
            })
            .catch(err => console.log('Failed to increment current viewer count', err));

          currentViewers
            .push(JSON.parse(JSON.stringify(payload)));

          viewCount
            .transaction(current => !current ? 1 : current + 1)
            .then(count => console.log('total count updated!', count.snapshot.val()))
            .catch(err => console.log('Failed to increment total viewer count', err));

          viewers
            .push(JSON.parse(JSON.stringify(payload)));
        };

       if (payload.job) {
         findKey(payload['job']['slug']).then(key => updateStats(key));
       }
      }
    },
    removeUser: function(payload) {
      list.forEach((user, index) => {
        if (user.id === list[index].id) list.splice(index, 1);
      });

      const findKey = async slug => {
        let key = '';

        await Firebase.jobsBySlug(slug)
          .once('value', snapshot => {
            if (!snapshot.exists()) return;
            key = Object.keys(snapshot.val())[0];
          });
        return key;
      };

      const updateStats = key => {
        const stats = Firebase.job(key).child('stats');
        const currentViewCount = stats.child('currentViewCount');
        const currentViewers = stats.child('currentViewers');
        const viewers = stats.child('viewers');

        currentViewCount
          .transaction(current => !current ? 1 : current - 1)
          .then(count => {
            console.log('current count updated!', count.snapshot.val());
            console.log('max count: ');
          })
          .catch(err => console.log('Failed to increment current viewer count', err));

        currentViewers
          .orderByChild('id')
          .equalTo(payload.id)
          .once('value', snapshot => {
            snapshot
              .ref
              .remove()
              .then(() => 'remove succeeded!');
          })
          .then(() => console.log('successfully removed viewer.'));

        viewers
          .orderByChild('id')
          .equalTo(payload.id)
          .once('value', snapshot => {
            const key = Object.keys(snapshot.val())[0];

            snapshot
              .ref
              .child(key)
              .update({
                logOffTime: new Date()
              })
              .then(time => console.log('successfully logged viewer logoff.', time));
          }).then(() => console.log('user logged off.'));
      };

      if (payload.job) {
        findKey(payload['job']['slug']).then(key => updateStats(key));
      }
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
