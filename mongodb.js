// const mongodb = require('mongodb');
// const MongoClient = mongodb.MongoClient
// const ObjectID = mongodb.ObjectID

const {MongoClient, ObjectID} = require('mongodb')

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

MongoClient.connect(connectionURL,{useNewUrlParser: true}, (error, client) => {
  if(error) {
    return console.log('Unable to connecct to database')
  }
  const db = client.db(databaseName)

// db.collection('users').deleteMany({
//   age: 77
// }).then((result) => {
//   console.log(result)
// }).catch((error) => {
//   console.log(error)
// })

db.collection('tasks').deleteOne({
  description: 'find milk'
}).then((result) => {
  console.log(result)
}).catch((error) => {
  console.log(error)
})

})
