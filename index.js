var StoicDB = require('./lib/StoicDB');
var stoicDB = StoicDB.DB();

var userMasterTable = StoicDB
  .Table('user_master')
  ._id().timestamp();

var userDetailTable = StoicDB
  .Table('user_detail')
  ._id()
  .column('user_id', 'integer')
  .column('name', 'text')
  .column('age', 'integer')
  .timestamp();

var tweetTable = StoicDB
  .Table('tweet')
  ._id()
  .column('user_id', 'integer')
  .column('tweet', 'text')
  .timestamp();

// create table
stoicDB.createTable([userMasterTable, userDetailTable, tweetTable], function(err, db) {

  var show = function() {
    var query = 'SELECT * , MAX(user_detail.timestamp, tweet.timestamp) as timestamp , tweet.user_id as _id FROM user_detail';
    query += ' LEFT OUTER JOIN tweet ON user_detail.user_id = tweet.user_id';
    query += ' WHERE tweet.timestamp IN (SELECT MAX(timestamp) FROM tweet WHERE user_detail.user_id = tweet.user_id)';
    query += ' AND user_detail.timestamp IN (SELECT MAX(timestamp) FROM user_detail WHERE user_detail.user_id = tweet.user_id)';
    db.query(query, function(err, row) {
      console.log('opt',row);
    });
  }


  // insert record
  db.insert(userMasterTable, [10], function(err, obj) {
    var mikeId = obj.lastID;
    db.insert(userMasterTable, [11], function(err, obj) {
      var samId = obj.lastID;

      db.insert(
        userDetailTable,
        [
          [mikeId, 'mike', 20, 15],
          [samId, 'sam', 30, 15],
          [samId, 'sam2', 30, 80],
        ]
      );
      
      db.insert(
        tweetTable,
        [
          [mikeId, 'hoge', 20],
          [mikeId, 'foo', 30],
          [samId, 'bar', 40],
          [samId, 'poo', 50],
        ]
      );
    });
  });

  setTimeout(show, 100);
});
