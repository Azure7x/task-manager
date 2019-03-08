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

  // db.collection('users').findOne({_id: new ObjectID('5c81e66b608b9a34703766b3')},(error, user) => {
  //   if(error) {
  //     return console.log('unable to fetch')
  //   }
  //
  //   console.log(user)
  // })

  // db.collection('users').find({age: 88}).toArray((error, users) => {
  //   console.log(users)
  // })
  // db.collection('users').find({age: 88}).count((error, count) => {
  //   console.log(count)
  // })

  // db.collection('tasks').findOne({_id: new ObjectID('5c81e817110b60519c77a5a3')}, (error, task) => {
  //   if(error) {
  //     return console.log('unable to get task')
  //   }
  //   console.log(task)
  // })

  db.collection('tasks').find({completed: false}).toArray( (error, tasks) => {
    if(error) {
      return console.log("unable to retrieve tasks")
    }
    console.log(tasks)
  })
})
