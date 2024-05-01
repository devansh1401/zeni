const express = require("express");
const { authMiddleware } = require("../middleware");
const { Account } = require("../db");
const { default: mongoose } = require("mongoose");
const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
  try {
    const account = await Account.findOne({
      userId: req.userId,
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json({
      balance: account.balance,
    });
  } catch (error) {
    console.error("Error fetching account balance:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/transfer", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();

  session.startTransaction();
  const { amount, to } = req.body;

  // Validate input
  if (!to || !amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid request" });
  }

  //find senders account
  const sender = await Account.findOne({
    userId: req.userId,
  });
  if (!sender) {
    return res.status(400).json({ message: "Sender account not found" });
  }

  //check if sender has enough balance
  if (sender.balance < amount) {
    return res.status(400).json({ message: "Insufficient balance" });
  }

  //find receivers account
  const receiversAccount = await Account.findOne({
    userId: to,
  });

  if (!receiversAccount) {
    await session.abortTransaction();
    return res.status(400).json({ message: "Receiver account not found" });
  }

  // Perform the transfer
  await Account.updateOne(
    { userId: req.userId },
    { $inc: { balance: -amount } }
  ).session(session);
  await Account.updateOne(
    { userId: to },
    { $inc: { balance: amount } }
  ).session(session);

  // Commit the transaction
  await session.commitTransaction();

  res.json({
    message: "Transfer successful",
    balance: sender.balance - amount
  });
});
module.exports = router;
