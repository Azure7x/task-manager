const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: "Lina",
  email: 'lina@example.com',
  password: '56what!',
  tokens: [{
    token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
  }]
}

beforeEach(async () => {
  await User.deleteMany();
  await new User(userOne).save();
});

test('Should sign up a new user', async () => {
  const response = await request(app).post('/users').send({
    name: 'azure',
    email: 'azure@example.com',
    password: 'Mypass777!'
  }).expect(201);
  //Assert that the database was changed correctly
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();
  //Assertions about the response
  expect(response.body).toMatchObject({
    user: {
      name: 'azure',
      email: 'azure@example.com'
    },
    token: user.tokens[0].token
  })

  expect(user.password).not.toBe('Mypass777!');
});

test('Should login existing user', async () => {
  const response = await request(app).post('/users/login').send({
    email: userOne.email,
    password: userOne.password
  }).expect(200);

  const user = await User.findById(userOneId);

  expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not login nonexistent user', async () => {
  await request(app).post('/users/login').send({
    email: userOne.email,
    password: 'hello12345'
  }).expect(400);
});

test('Should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not get profile for unathenticated user', async () => {
  await request(app)
  .get('/users/me')
  .send()
  .expect(401);
});

test('Should delete account for user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

    const user = await User.findById(userOneId);

    expect(user).toBeNull();
});

test('Should not delete account for unathenticated user', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401);
});

test('Should upload avatar image', async () => {
    await request(app)
      .post('/users/me/avatar')
      .set('Authorization',  `Bearer ${userOne.tokens[0].token}`)
      .attach('avatar', 'tests/fixtures/profile-pic.jpg')
      .expect(200);

      const user = await User.findById(userOneId);
      expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
   const response = await request(app)
    .patch('/users/me')
    .send({
      name: 'Rei'
    })
    .set('Authorization',  `Bearer ${userOne.tokens[0].token}`)
    .expect(200); 
    
    const user = await User.findById(userOneId);
    expect(user.name).toBe('Rei');
  });
  
test('Shold not update invalid user fields', async () => {
  await request(app)
  .patch('/users/me')
  .send({
    location: 'hollywoo'
  })
  .set('Authorization',  `Bearer ${userOne.tokens[0].token}`)
  .expect(400);
})