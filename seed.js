const mongoose = require('mongoose');
const Slot = require('./models/Slots');

mongoose.connect('mongodb://localhost:27017/parking', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  await Slot.deleteMany(); // Clear ALL 20 slots
  
  // ✅ ONLY 2 SLOTS FOR YOUR SENSORS
  await new Slot({ slotName: 'p1', status: 'free' }).save();  // Sensor 1
  await new Slot({ slotName: 'p2', status: 'free' }).save();  // Sensor 2
  
  console.log("✅ 2 Slots created: p1 (Sensor1), p2 (Sensor2)");
  process.exit();
}).catch(err => console.error(err));