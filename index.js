import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";
import Client from "./models/Client.js";

dotenv.config();
const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("views"));
app.use(express.static("public"));
app.use(express.static("views/partials"));
app.set("view engine", "ejs");
//connecting to the mongodb Database
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});
app.get("/login", (req, res) => {
  res.render("login.ejs");
});
//When the user clicks on the register button, this route will be called and send them to the Log in page
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const newUser = new User({ email, password });
    await newUser.save();
    console.log("User registered successfully");
    res.redirect("/login");
  } catch (err) {
    console.error("Error registering user:", err);
    res.send("Error registering user. Try again.");
  }
});
//Whenever the user clicks on the login button, this route will be called and send them to the start dashboard page
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      // If no user is found, show an error message
      return res.render("login.ejs", {
        error: "No account found with this email.",
      });
    }

    // Compare passwords (if stored in plaintext)
    if (user.password !== password) {
      return res.render("login.ejs", { error: "Invalid email or password." });
    }

    // If authentication succeeds, redirect to dashboard
    res.redirect(`/dashboard?userId=${user._id}`);
    console.log("User logged in successfully");
  } catch (err) {
    console.error("Error during login:", err);
    res.render("login.ejs", {
      error: "Something went wrong. Please try again.",
    });
  }
});

app.get("/dashboard", (req, res) => {
  res.render("dashboard", { user: null, error: null });
});

app.post("/dashboard", (req, res) => {
  const userId = req.body.userId;
  const user = users[userId];

  if (user) {
    // Ensure functions are called before rendering
    const processedUser = {
      ...user,
      accountBalance: user.accountBalance(),
      lastTransaction: user.lastTransaction(),
    };

    res.render("dashboard", { user: processedUser, error: null });
  } else {
    res.render("dashboard", {
      user: null,
      error: "User not found. Please try again.",
    });
  }
});
app.get("/client", (req, res) => {
  res.render("client.ejs");
});

app.get("/report", (req, res) => {
  res.render("report.ejs");
});

app.listen(port, () => {
  console.log("Listening on port 3000");
});

//dummy data
const users = {
  12345: {
    name: "John Doe",
    email: "john.doe@example.com",
    transactions: [
      { date: "2025-01-10", description: "Groceries", amount: 150 },
      { date: "2025-01-12", description: "Rent", amount: 2000 },
      { date: "2025-01-15", description: "Investment", amount: 5000 },
      { date: "2025-01-20", description: "Utilities", amount: 100 },
    ],
    accountBalance: function () {
      return this.transactions.reduce(
        (acc, transaction) => acc + transaction.amount,
        0
      );
    },
    portfolio: "Stocks, Bonds, ETFs",
    lastTransaction: function () {
      const lastTrans = this.transactions[this.transactions.length - 1];
      return `${lastTrans.date} | ${lastTrans.description} | $${lastTrans.amount}`;
    },
  },
  67890: {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    accountBalance: 80000,
    portfolio: "Real Estate, Mutual Funds",
    lastTransaction: "2025-02-01 | Mutual Fund Purchase | $3,000",
    transactions: [
      { date: "2025-01-05", description: "Car Loan", amount: 500 },
      { date: "2025-01-10", description: "Dining Out", amount: 120 },
      {
        date: "2025-01-20",
        description: "Mutual Fund Investment",
        amount: 3000,
      },
      { date: "2025-02-01", description: "Insurance Premium", amount: 200 },
    ],
  },
  11223: {
    name: "Emily Johnson",
    email: "emily.johnson@example.com",
    accountBalance: 120000,
    portfolio: "Cryptocurrency, Index Funds",
    lastTransaction: "2025-01-18 | Bitcoin Purchase | $1,500",
    transactions: [
      { date: "2025-01-02", description: "Netflix Subscription", amount: 15 },
      { date: "2025-01-07", description: "Amazon Order", amount: 350 },
      { date: "2025-01-14", description: "Crypto Investment", amount: 1500 },
      { date: "2025-01-25", description: "Gym Membership", amount: 50 },
    ],
  },
  33445: {
    name: "Michael Brown",
    email: "michael.brown@example.com",
    accountBalance: 95000,
    portfolio: "ETFs, Stocks, Real Estate",
    lastTransaction: "2025-01-22 | ETF Purchase | $2,500",
    transactions: [
      { date: "2025-01-03", description: "Grocery Shopping", amount: 200 },
      { date: "2025-01-15", description: "House Rent", amount: 2500 },
      { date: "2025-01-22", description: "ETF Investment", amount: 2500 },
      { date: "2025-01-30", description: "Internet Bill", amount: 80 },
    ],
  },
  55678: {
    name: "Sarah Williams",
    email: "sarah.williams@example.com",
    accountBalance: 175000,
    portfolio: "Bonds, Mutual Funds, Gold",
    lastTransaction: "2025-01-27 | Bond Purchase | $4,000",
    transactions: [
      { date: "2025-01-10", description: "Home Improvement", amount: 1000 },
      { date: "2025-01-15", description: "Travel Booking", amount: 2000 },
      { date: "2025-01-27", description: "Bond Investment", amount: 4000 },
      { date: "2025-02-05", description: "Charity Donation", amount: 500 },
    ],
  },
};
