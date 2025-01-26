import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  date: String,
  description: String,
  amount: Number,
});

const clientSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  transactions: [transactionSchema],
});

const Client = mongoose.model("Client", clientSchema);
export default Client;
