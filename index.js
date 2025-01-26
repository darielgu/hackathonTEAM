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
app.get("/start", (req, res) => {
  res.render("auth.ejs");
});
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  console.log(`Username: ${email}, Password: ${password}`);
  res.redirect("/start");
});
app.post("/auth", (req, res) => {
  {
    res.render("start.ejs");
  }
});

app.listen(port, () => {
  console.log("Listening on port 3000");
});
