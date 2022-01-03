var express = require("express");
var session = require("express-session");
var mongoose = require("mongoose");
var MongoDbSession = require("connect-mongodb-session")(session);
var User = require("./model/user");
var auth = require("./middleware/auth");

const MongoURL = "mongodb://localhost/sessionauth";
const app = express();

// Initialize session store with the help of package we install  you can go through and explore more connect-mongodb-session

const store = new MongoDbSession({
  uri: MongoURL,
  collection: "mysession", // put this store instance in session middleware
});

//middleware add session

// set the view engine to ejs
app.set("view engine", "ejs");
// set body parser
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "my secret key", // anything you want to write your secret key ,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

//Mongodb connection
mongoose.connect(MongoURL).then((res) => {
  console.log("Succeeded to connect mongodb");
});

//Routes

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  console.log(req.session); //we get all information in req.session
  console.log(req.session.id); // get session id which store in our cookie as a ref...
  // now initialize Our session
  // req.session.isAuth = true; // we assign isAuth in our session and stire it in mongdb
  const { username, email, password } = req.body;
  console.log(req.body);
  const userWithEmail = await User.findOne({ email });
  if (userWithEmail) return res.send("User exist with this email ");
  //   console.log("username" + username);
  const newuser = new User({ username, email, password });
  await newuser.save();
  res.redirect("/login");
});

//login user

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const userWithEmail = await User.findOne({ email });
  if (!userWithEmail) return res.redirect("/register");

  const _password = userWithEmail.password;

  if (_password === password) {
    req.session.isAuth = true;
    res.redirect("dashborad");
  } else {
    res.render("login");
    res.send("invalid credentials");
  }
});

app.get("/dashborad", auth, (req, res) => {
  res.render("dashborad");
});

//logout
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    return res.redirect("login");
  });
});

//listen to Port

let PORT = process.env.PORT || 3000;

app.listen(PORT, (err, res) => {
  if (err) {
    throw err;
  }

  console.log(`listening on port ${PORT}`);
});
