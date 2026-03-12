const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { SerialPort } = require('serialport');

const allocateSlotRoute = require('./routes/allocate-slot');
const removeSlotRoute = require('./routes/remove-slot');
const dashboardRoute = require('./routes/dashboard');
const historyRoute = require('./routes/history');
const staffRoute = require('./routes/staff');
const adminRoute = require('./routes/admin');
const settingsRoute = require('./routes/settings');
const reportRoute = require('./routes/report');
const Slot = require('./models/Slots');

const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/admin', express.static('admin'));

mongoose.connect('mongodb://localhost:27017/parking')
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error(' Mongo connection error:', err));



let sensorStatus = {
  p1: 'UNKNOWN',
  p2: 'UNKNOWN',
  lastUpdated: null
};

let arduinoReady = false;

app.locals.sensorStatus = sensorStatus;

const arduino = new SerialPort({
  path: 'COM5',
  baudRate: 9600,
  autoOpen: false
});

app.locals.arduino = arduino;

arduino.open((err) => {
  if (err) {
    return console.error(' Serial Open Error:', err.message);
  }
  console.log(' Serial Port Opened');
});

arduino.on('error', (err) => {
  console.error(' Serial Error:', err.message);
});

let serialBuffer = '';

arduino.on('data', (data) => {

  serialBuffer += data.toString();

  if (serialBuffer.includes('\n')) {

    const lines = serialBuffer.split('\n');

    lines.forEach((line) => {

      line = line.trim();
      if (!line) return;

      console.log('Arduino Raw:', line);

      if (line === 'PARKING_SENSORS_READY') {
        arduinoReady = true;
        console.log(' Arduino sensors connected!');
        return;
      }

      

      try {

        const parts = line.split(',');

        let newStatus = {};

        parts.forEach(part => {
          const [slot, status] = part.split(':');
          if (slot && status) {
            newStatus[slot.toLowerCase()] = status.trim().toUpperCase();
          }
        });

        if (newStatus.p1 && newStatus.p2) {

          sensorStatus = {
            ...newStatus,
            lastUpdated: new Date()
          };

          app.locals.sensorStatus = sensorStatus;

          async function syncDatabaseWithSensor() {
  try {

    const currentSensor = app.locals.sensorStatus;


    if (!currentSensor || !currentSensor.lastUpdated) return;

    const slots = await Slot.find();

    for (let slot of slots) {

      const sensorValue = currentSensor[slot.slotName];

      if (slot.status === "free" && sensorValue === "OCCUPIED") {
        slot.status = "wrongparking";
        await slot.save();
        console.log(` ${slot.slotName} marked as WRONG PARKING`);
      }

      else if (slot.status === "wrongparking" && sensorValue === "FREE") {
        slot.status = "free";
        await slot.save();
        console.log(` ${slot.slotName} cleared from WRONG PARKING`);
      }

    }

  } catch (err) {
    console.error(" Sync Error:", err.message);
  }
      await syncDatabaseWithSensor();
}
          console.log(' Updated Sensor Status:', sensorStatus);
        }

      } catch (err) {
        console.log(' Sensor Parse Error:', err.message);
      }

    });

    serialBuffer = '';
  }
});

process.on('SIGINT', () => {
  console.log('Closing serial port...');
  arduino.close(() => {
    console.log('Serial port closed.');
    process.exit();
  });
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/api/allocate-slot', allocateSlotRoute);
app.use('/api/remove-slot', removeSlotRoute);
app.use('/api/dashboard-data', dashboardRoute);
app.use('/api/history', historyRoute);
app.use('/api/staff', staffRoute);
app.use('/api/admin', adminRoute);
app.use('/api/settings', settingsRoute);
app.use('/api/report', reportRoute);
app.use('/api/slots', require('./routes/slots'));
app.use('/api/book-slot', require('./routes/book-slot'));

app.get('/api/sensor-status', (req, res) => {
  res.json({
    arduinoReady,
    sensorStatus
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Smart Parking Server + Sensors ON! http://localhost:${PORT}`);
  console.log('📡 Waiting for Arduino...');
});