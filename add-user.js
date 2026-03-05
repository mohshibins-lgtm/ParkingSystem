const mongoose = require('mongoose');
const User = require('./models/User');

async function addUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/parking', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    /*const newUser = new User({
      username: 'mohammed',
      password: '1234',
      age: 30,
      place: 'Mumbai',
      gender: 'Male',
      joinedDate: new Date()
    });*/

    await newUser.save();
    console.log('User added');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error adding user:', err);
  }
}

addUser();