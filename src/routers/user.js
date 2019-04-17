const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');
const {sendWelcomeEmail, sendCancelationEmail} = require('../emails/account');
const router = new express.Router();

//route used to save new user
router.post('/users', async (req, res) => {
  //creates new user based on User model
  const user = new User(req.body);

  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({user, token});
  } catch(e) {
    res.status(400).send(e);
  }
});

//route used to login user
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.send({user, token});
  } catch(e) {
    res.status(400).send();
  }
});

//route used to logout current user if authorized
router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
    return token.token !== req.token;
    });

    await req.user.save();

    res.send();
  } catch(e) {
    res.status(500).send();
  }
});

//route removes all tokens logging out every session if authorized
router.post('/users/logoutall', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.send();
  } catch(e) {
    res.status(500).send();
  }
});

//route shows user profile if authorized
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

//route updates user information if authorized
router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  })

  if(!isValidOperation) {
    return res.status(400).send({error: "Invalid updates!"});
  }

  try {
    //uses bracket notation to update user
    updates.forEach((update) => req.user[update] = req.body[update]);

    await req.user.save();

    res.send(req.user);
  } catch(e) {
    res.status(400).send();
  }
});

//route deletes the current user if authorized
router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    sendCancelationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch(e) {
    res.status(500).send();
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    //uses a regular expression in match
    if(!file.originalname.match(/\.(jpg|jpeg|png)/)){
      return cb(new Error('please upload an image file'));
    }

    cb(undefined, true);
  }
});

//route uploads an avatar image for the user if authorized
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();

  req.user.avatar = buffer;
  await req.user.save();
  res.send();
}, (error, req, res, next) => {
  res.status(400).send({error: error.message});
});

//route deletes the uploaded avatar image if authorized
router.delete('/users/me/avatar', auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  } catch(e) {
    res.status(400).send(e);
  }
});

//route gets the avatar image to show
router.get('/user/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if(!user || !user.avatar){
      throw new Error();
    }
    res.set('Content-Type','image/png');
    res.send(user.avatar);

  } catch(e) {
    res.status(404).send();
  }
});

module.exports = router;
