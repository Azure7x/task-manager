const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
  // const task = new Task(req.body);
  const task = new Task({
    ...req.body,
    owner: req.user._id
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch(e) {
    res.status(404).send();
  }

  // task.save().then(() => {
  //   res.status(201).send(task);
  // }).catch((e) => {
  //   res.status(404).send();
  // });
});

//GET /tasks?completed=true
//GET /tasks?limit=10&skip=0
router.get('/tasks', auth, async (req, res) => {
  const match = {}

  if(req.query.completed) {
    match.completed = req.query.completed === 'true';
  }

  try {
    // const user = await User.findById('5c9d8d5e31713d7ee881d092');
    // await user.populate('tasks').execPopulate();
    // console.log(user.tasks);


    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip)
      }
    }).execPopulate();

    // const tasks = await Task.find({owner: req.user._id});
    res.send(req.user.tasks);
  } catch(e) {
    res.status(500).send();
  }

  // Task.find().then((tasks) => {
  //   res.send(tasks);
  // }).catch((e) => {
  //   res.status(500).send();
  // });
});

router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;

  try {
    // const task = await Task.findById(_id);
    const task = await Task.findOne({_id, owner: req.user._id});

    if(!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch(e) {
    res.status(500).send();
  }

  // Task.findById(_id).then((task) => {
  //   if(!task) {
  //     return res.status(404).send();
  //   }
  //
  //   res.send(task);
  // }).catch((e) => {
  //   res.status(500).send();
  // })
});

router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['completed', 'description'];
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  })

  if(!isValidOperation) {
    return res.status(400).send({error: 'Invalid update used!'});
  }

  try {
    // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});

    // const task = await Task.findById(req.params.id);
    const task = await Task.findOne({_id: req.params.id, owner: req.user._id});

    if(!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => {
      task[update] = req.body[update];
    });

    await task.save();


    res.send(task);
  } catch(e) {
    res.status(400).send();
  }
});

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    // const task = await Task.findByIdAndDelete(req.params.id);
    const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});


    if(!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch(e) {
    res.status(500).send();
  }
});


module.exports = router;
