var StoicDB = require('../lib/StoicDB');
var assert = require("assert");

var ErrorCallback = function(done) {
  return function(err, result) {
    assert.ok(err);
    done();
  };
};


describe('stoicDB', function(){
  describe('control', function(){
    var hogeTable = StoicDB
      .Table('hoge')          // table name
      ._id()                  // pkey
      .column('name', 'text') // columnName, value type
      .column('age', 'integer');

    it('single insert', function(done){
      var stoicDB = StoicDB.DB();
      stoicDB.createTable([hogeTable], function(err, db) {
        db.insert(
          hogeTable,
          ['mike', 20],
          function(err, obj) {
            db.query('SELECT * FROM hoge', function(err, rows) {
              var row = rows[0];
              assert.equal(1, row._id);
              assert.equal('mike', row.name);
              assert.equal(20, row.age);
              done();
            });
          }
        );
      });
    })

    it('multi insert', function(done){
      var stoicDB = StoicDB.DB();
      stoicDB.createTable([hogeTable], function(err, db) {
        var count = 0;
        db.insert(
          hogeTable,
          [['mike', 20], ['taro', 30]],// 複数挿入
          function(err, obj) {
            // finished
            assert.equal(1, obj[0].lastID);
            assert.equal(2, obj[1].lastID);

            db.query('SELECT * FROM hoge', function(err, rows) {
              assert.equal(2, rows.length);
              done();
            });
          },
          function(err, obj) {
            // each
            count++;
          }
        );
      });
    })

    it('delete', function(done){
      var stoicDB = StoicDB.DB();
      stoicDB.createTable([hogeTable], function(err, db) {
        var count = 0;
        db.insert(
          hogeTable,
          [['mike', 20], ['taro', 30]],
          function(err, obj) {
            db.count('SELECT COUNT(*) FROM hoge', function(err, count) {
              assert.equal(2, count, '初期状態');
              db.delete(hogeTable, '_id = 1', function(){
                db.count('SELECT COUNT(*) FROM hoge', function(err, count) {
                  assert.equal(1, count, '削除されていること');
                  done();
                });
              });
            });
          }
        );
      });
    });

    it('query not found', function(done){
      var stoicDB = StoicDB.DB();
      stoicDB.createTable([hogeTable], function(err, db) {
        db.query('DELETE FROM hoge', ErrorCallback(done));
      });
    });

    it('count not found', function(done){
      var stoicDB = StoicDB.DB();
      stoicDB.createTable([hogeTable], function(err, db) {
        db.count('SELECT * FROM hoge', ErrorCallback(done));
      });
    });

  })
})
