import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  date: String,
  clearingDate: String,
  description: String,
  merchant: String,
  category: String,
  type: String,
  amount: Number,
  purchasedBy: String,
});

const clientSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  transactions: [transactionSchema],
});

const Client = mongoose.model("Client", clientSchema);
export default Client;
