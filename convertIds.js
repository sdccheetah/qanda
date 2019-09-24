var MongoClient = require("mongodb").MongoClient;

MongoClient.connect(
  "mongodb://localhost:27017/questions2",
  { useNewUrlParser: true, useUnifiedTopology: true },
  function(err, client) {
    var cursor = collection("questions").find();
    // Execute the each command, triggers for each document
    cursor.each(function(err, item) {
      
      // If the item is null then the cursor is exhausted/empty and closed
      if (item == null) {
        // Show that the cursor is closed
        cursor.toArray(function(err, items) {
          assert.ok(err != null);

          // Let's close the db
          db.close();
        });
      }
    });
  }
);
