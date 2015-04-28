/**
 StoicDB
 - Only Select and Insert (not update, not delete)
 - Only Not Null TYPE
*/
var fs = require('fs');
var StoicDB = function(dbfile) {
  var sqlite3 = require('sqlite3').verbose();
  dbfile = dbfile || ':memory:';
  var dbFileExists = dbfile != ':memory:' && fs.existsSync(dbfile);
  var db = new sqlite3.Database(dbfile);

  var createTable = function(tables, callback) {
    var _this = this;
    db.serialize(function() {
      if(dbFileExists) {
        callback(null, _this);
        return;
      }
      tables.forEach(function(table) {
        var create = table._sql();
        db.run(create);
      });
      callback(null, _this);
    });
  };

  /**
    挿入
    1レコード挿入する場合は、valuesに値の配列を渡す['hoge', 20,...]
    複数レコードを挿入する場合は、valuesを2次元配列にする
  */
  var insert = function(table, values, finishedCallback, eachCallback) {
    db.serialize(function() {
      if(!Array.isArray(values[0])) values = [values];
      var valuesQ = values[0].map(function() { return '?'; }).join(',');
      var stmtCommand = 'insert into ' + table.tableName() + '(' + table.columns().join(',') + ') values(' + valuesQ + ')';
      if(table.columns().length == 0) stmtCommand = 'insert into ' + table.tableName() + ' values()';
      var stmt = db.prepare(stmtCommand);
      var length = values.length;
      var results = [];
      values.forEach(function(values, index) {
        stmt.run(values, function() {
          if(eachCallback) eachCallback(null, this);
          results.push({lastID: this.lastID});
          if(index == length - 1) {
            stmt.finalize();
            if(finishedCallback) finishedCallback(null, index == 0 ? results[0] : results);
          }
        });
      });

    });
  };
  var query = function(queryString, callback) {
    if(queryString.toLowerCase().indexOf('select') != 0) {
      callback('Error: Start with SELECT', null);
      return;
    }
    db.all(queryString, callback);
  };

  var count = function(queryString, callback) {
    if(queryString.toLowerCase().indexOf('count') == -1) {
      callback('Error: COUNT not found', null);
      return;
    }
    db.get(queryString, function(err, result) {
      if(err) {
        callback(err, null);
        return;
      }
      for(key in result) {// 最初のキーに対する値にカウント数が入ってるため
        callback(err, result[key]);
        return;
      }
    });
  };

  var delete_ = function(table, where, callback) {
    var command = 'DELETE FROM ' + table.tableName() + ' WHERE ' + where;
    db.run(command, callback);
  };

  var close = function() { db.close(); };

  return {
    createTable: createTable,
    insert: insert,
    query: query,
    count: count,
    delete: delete_,
    close: close
  }
};

var Table = function(tableName) {
  var columns = [];
  var columnNames = [];
  return {
    column: function(name, type, isPrimary, isAutoIncrement) {
      var result = name + ' ' + type;
      if(!isAutoIncrement) {
        result += ' not null';
        columnNames.push(name);
      }
      if(isPrimary) result += ' primary key';
      if(isAutoIncrement) result += ' autoincrement';
      columns.push(result);
      return this;
    },
    _id: function() {
      return this.column('_id', 'integer', true, true);
    },
    timestamp: function() {
      return this.column('timestamp', 'integer');
    },
    _sql: function() {
      return 'create table ' + tableName + '(' + columns.join(', ') + ')';
    },
    columns: function() {
      return columnNames;
    },
    tableName: function() {
      return tableName;
    }
  };
};

module.exports = {
  DB: StoicDB,
  Table: Table
};
