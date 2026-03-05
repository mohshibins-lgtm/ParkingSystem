const  mongoose  = require("mongoose");

const checkoutSchema = new mongoose.Schema({

  slotName: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  entryTime: { type: Date, required: true },
  exitTime: { type: Date, required: true },
  duration: { type: Number, required: true }, // ms
  amount: { type: Number, required: true },
  paymentStatus: { type: String, default: 'completed' }
}, { timestamps: true });



module.exports = mongoose.model('checkout',checkoutSchema);