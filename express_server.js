const express = require("express");
const app = express(); //app could be named server
const PORT = 8080;

const emailChecker = require('./helpers');

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['any', 'values'],
}));

// app.use(morgan('dev'));
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
// const morgan = require("morgan");
const bcrypt = require('bcryptjs');
app.use(bodyParser.urlencoded({extended: true}));

const generateRandomString = function(length) {
  return Math.random().toString(36).substr(2, length); //represents the length of the random string
};

const users = {};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID:  "userRandomID1" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID2" }
};

app.get("/", (req, res) => {
  res.redirect("/register")
});

app.get("/register", (req, res) => {
  const user = users[req.session["user_id"]];
  // console.log("the user is: ", user);
  const templateVars = {
    user: user,
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (!req.body.email) {
    // console.log("email is:", req.body.email)
    res.status(404).send("Uh oh, there's a error. Please try again with a valid email!");
  } 
  if (emailChecker(req.body.email)) {
    res.status(404).send("Sorry, no dice. That email already exists. Please try again.");
  }
  const userRandomID = generateRandomString(4);
  const plainTextPassword = req.body.password;
  let hash = bcrypt.hashSync(plainTextPassword, 10);
  users[userRandomID] = {
    id: userRandomID,
    email: req.body.email,
    password: hash
  };
  // console.log("the users:", users);
  req.session.user_id = userRandomID;
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: null,  // this is null because there is no info to be passed into the login template. once the template is filled out, that info is sent to the app.post
  };
  res.render("login", templateVars);
});

app.post('/login', (req, res) => {
  if (!emailChecker(req.body.email)) {
    // console.log("email is:", req.body.email)
    res.status(403).send("Uh oh, there's a error. Please try again with a valid email!");
  } 
  const user = emailChecker(req.body.email);
  // console.log("the user's password is:", user.password);
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    res.status(403).send("Sorry, no dice. That password is incorrect. Please try again.");
  }
  // console.log("the login user is: ", user)
  req.session.user_id = user.id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

const urlsForUser = function(urlDatabase, id) {
  let userSpecificURLDatabase = {};
  for (const shortURL in urlDatabase) {
    // console.log("the shortURL is: ", shortURL);
    // console.log("the url db userid is: ", urlDatabase[shortURL].userID)
    // console.log("this is id: ", id);
    if (urlDatabase[shortURL].userID === id) {
      userSpecificURLDatabase[shortURL] = urlDatabase[shortURL];
      // console.log("the user specific db key is:" ,userSpecificURLDatabase[shortURL]);
    }
  }
  return userSpecificURLDatabase;
};

app.get("/urls", (req, res) => {
  const user = users[req.session["user_id"]];
  // console.log("the user variable is:", user)
  // console.log("the user id value is: ", user.id)
  if (!user) {
    res.send("Access denied to the URLs page. Please Login or Register use the TinyApp.");
  }
  const userSpecificURLDatabase = (urlsForUser(urlDatabase, user.id));
  // console.log("this is userSpecificURLDatabase", userSpecificURLDatabase)
  const userTemplateVars = {
    urls: userSpecificURLDatabase,
    user: user
  };
  res.render("urls_index", userTemplateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session["user_id"]];
  const templateVars = { user: user,};
  if (!user) {
    res.redirect('/login');
  }
  res.render("urls_new", templateVars);
  // res.redirect
});

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session["user_id"]];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: user
  };
  if (!user) {
    res.send("Access denied to this shortURL page. Please Login or Register use the TinyApp.");
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  // const longURL = req.body.longURL;
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session["user_id"]};
  // console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

//UPDATE
app.post("/urls/:shortURL", (req, res) => {
  const user = users[req.session["user_id"]];
  const userSpecificURLDatabase = urlsForUser(urlDatabase, user.id);
  // console.log("the user is: ", user);
  // console.log("the user id is: ", user.id);
  // console.log("this is userSpecificURLDatabase", userSpecificURLDatabase);
  for (const shortURL in userSpecificURLDatabase) {
    if (user.id === userSpecificURLDatabase[shortURL].userID)
      console.log("the id i÷n the userSpecificURLDatabase is: ", userSpecificURLDatabase[shortURL].userID);
  }
  const shortURL = req.params.shortURL;
  const updatedlongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = updatedlongURL;
  res.redirect('/urls');
});


//DELETE
app.post('/urls/:shortURL/delete', (req, res) => {
  const user = users[req.session["user_id"]];
  const userSpecificURLDatabase = urlsForUser(urlDatabase, user.id);
  // console.log("the user is: ", user);
  // console.log("the user id is: ", user.id);
  // console.log("this is userSpecificURLDatabase", userSpecificURLDatabase);
  for (const shortURL in userSpecificURLDatabase) {
    if (user.id === userSpecificURLDatabase[shortURL].userID) {
    // console.log("the id in the userSpecificURLDatabase is: ", userSpecificURLDatabase[shortURL].userID);
    }
    delete urlDatabase[req.params.shortURL];
  // console.log("i want to delete:", req.params.shortURL);
  }
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});