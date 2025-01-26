import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";

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
    res.render("dashboard", { user, error: null });
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
    accountBalance: 150000,
    portfolio: "Stocks, Bonds, ETFs",
    lastTransaction: "2025-01-15 | Stock Purchase | $5,000",
    transactions: [
      { date: "2025-01-10", description: "Groceries", amount: 150 },
      { date: "2025-01-12", description: "Rent", amount: 2000 },
      { date: "2025-01-15", description: "Investment", amount: 5000 },
      { date: "2025-01-20", description: "Utilities", amount: 100 },
    ],
  },
};
