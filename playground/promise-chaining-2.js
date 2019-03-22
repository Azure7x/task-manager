require('../src/db/mongoose');
const Task = require('../src/models/task');

// Task.findOneAndDelete({_id: '5c8884d88f43a4487487a0c7'}).then((task) => {
//   console.log(task);
//   return Task.countDocuments({completed: false});
// }).then((result) => {
//   console.log(result);
// }).catch((e) => {
//   console.log(e);
// });

const deleteTaskAndCount = async (id) => {
  const task = await Task.findByIdAndDelete(id);
  const count = await Task.countDocuments({completed: false});
  return count;
}

deleteTaskAndCount('5c889018e48f8961ecadf702').then((count) => {
  console.log(count);
}).catch((e) => {
  console.log(e);
});
