const mongoose = require('mongoose');

const mongodb =  function(){
  mongoose.connect('mongodb://localhost/NBAD_DB', {useNewUrlParser: true, useUnifiedTopology: true, useMongoClient: true});
  mongoose.Promise = global.Promise;
  const db = mongoose.connection;

  db.once('open', ()=>{
    console.log("DB connect success");      
  });

  db.on('error', (err)=>{
      console.log(err);
  });
//   .then(
//     console.log("DB connect success")
//   )
//   .catch(
//     error => handleError(error)
//   );
}

module.exports = mongodb;
