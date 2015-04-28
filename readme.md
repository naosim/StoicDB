# StoicDB

ちょっと制約のあるストイックなDBです。(中身はSQLite)

## 制約
- UPDATEができません  
insertのみで頑張ってください。
- カラムは全てnot nullです  
nullを入れなくても良いように頑張ってください。

## 使い方
```javascript
var StoicDB = require('StoicDB');

// テーブル定義
var hogeTable = StoicDB.Table('hoge') // テーブル名
  ._id()                              // pkey
  .column('name', 'text')             // カラム名とタイプ(強制的に値はnot nullになります。)
  .column('age', 'integer');


var stoicDB = StoicDB.DB();
stoicDB.createTable([hogeTable], function(err, db) {
  db.insert(
    hogeTable,
    ['mike', 20],
    function(err, obj) {
      db.query('SELECT * FROM hoge', function(err, rows) {
        var row = rows[0];
        console.log(row._id, row.name, row.age);
      });
    }
  );
});
```
