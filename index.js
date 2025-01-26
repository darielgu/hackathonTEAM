import express from "express";
import bodyParser from "body-parser";
const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("views"));
app.use(express.static("public"));
app.use(express.static("views/partials"));
app.set("view engine", "ejs");

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
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  console.log(`Username: ${email}, Password: ${password}`);
  res.redirect("/login");
});
//Whenever the user clicks on the login button, this route will be called and send them to the start dashboard page
app.post("/auth", (req, res) => {
  {
    res.render("dashboard.ejs");
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
