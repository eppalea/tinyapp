const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const { emailChecker, urlsForUser } = require('./helpers');


app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['any', 'values'],
}));
app.use(bodyParser.urlencoded({extended: true}));


const generateRandomString = function(length) {
  return Math.random().toString(36).substr(2, length);
};

const users = {};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID:  "userRandomID1" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID2" }
};


app.get("/", (req, res) => {
  res.redirect("/login");
});


app.get("/register", (req, res) => {
  const user = users[req.session["user_id"]];
  const templateVars = {
    user: user,
  };
  res.render("register", templateVars);
});


app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(404).send("Please try again with a valid email or password!");
    return;
  }
  if (emailChecker(req.body.email, users)) {
    res.status(404).send("Sorry, no dice. That email already exists. Please try again.");
    return;
  }
  const userRandomID = generateRandomString(4);
  const plainTextPassword = req.body.password;
  let hash = bcrypt.hashSync(plainTextPassword, 10);
  users[userRandomID] = {
    id: userRandomID,
    email: req.body.email,
    password: hash
  };
  req.session.user_id = userRandomID;
  res.redirect('/urls');
});


app.get('/login', (req, res) => {
  const templateVars = {
    user: null,
  };
  res.render("login", templateVars);
});


app.post('/login', (req, res) => {
  if (!emailChecker(req.body.email, users)) {
    res.status(403).send("Uh oh, there's a error. Please try again with a valid email!");
    return;
  }
  const user = emailChecker(req.body.email, users);
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    res.status(403).send("Sorry, no dice. That password is incorrect. Please try again.");
    return;
  }
  req.session.user_id = user.id;
  res.redirect('/urls');
});


app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


app.get("/urls", (req, res) => {
  const user = users[req.session["user_id"]];
  if (!user) {
    res.send("Access denied to the URLs page. Please Login or Register use the TinyApp.");
    return;
  }
  const userSpecificURLDatabase = (urlsForUser(urlDatabase, user.id));
  const userTemplateVars = {
    urls: userSpecificURLDatabase,
    user: user
  };
  res.render("urls_index", userTemplateVars);
});


app.get("/urls/new", (req, res) => {
  const user = users[req.session["user_id"]];
  const templateVars = { user: user };
  if (!user) {
    res.redirect('/login');
  }
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session["user_id"]];
  if (!user) {
    res.send("Access denied to this shortURL page. Please Login or Register use the TinyApp.");
    return;
  }
  if (user.id !== urlDatabase[req.params.shortURL].userID) {
    res.send("Access denied. You don't own this shortURL.");
    return;
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: user
  };
  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


app.post("/urls", (req, res) => {
  const user = users[req.session["user_id"]];
  if (!user) {
    res.send("Access denied to this shortURL page. Please Login or Register use the TinyApp.");
    return;
  }
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session["user_id"]};
  res.redirect(`/urls/${shortURL}`);
});


//UPDATE
app.post("/urls/:shortURL", (req, res) => {
  const user = users[req.session["user_id"]];
  if (!user) {
    res.send("Access denied to this shortURL page. Please Login or Register use the TinyApp.");
    return;
  }
  if (user.id !== urlDatabase[req.params.shortURL].userID) {
    res.send("Access denied. You don't own this shortURL.");
    return;
  }
  const shortURL = req.params.shortURL;
  const updatedlongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = updatedlongURL;
  res.redirect('/urls');
});


//DELETE
app.post('/urls/:shortURL/delete', (req, res) => {
  const user = users[req.session["user_id"]];
  if (!user) {
    res.send("Access denied to this shortURL page. Please Login or Register use the TinyApp.");
    return;
  }
  if (user.id !== urlDatabase[req.params.shortURL].userID) {
    res.send("Access denied. You don't own this shortURL.");
    return;
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});