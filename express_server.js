const express = require("express");
const app = express(); //app could be named server
const PORT = 8080;

const cookieParser = require('cookie-parser');
app.use(cookieParser());

// app.use(morgan('dev'));
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
// const morgan = require("morgan");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString(length) {
  return Math.random().toString(36).substr(2, length); //the 6 represents the length of the random string
}

const userRandomID = generateRandomString(4);
const users = {
  "userRandomID1": {
    id: "userRandomID1",
    email: "test@nomail.com",
    password: "smashbanana"
  },
  "userRandomID2": {
    id: "userRandomID2",
    email: "beach@nomail.com",
    password: "surfsup"
  }
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Aloha!");
});

app.get("/register", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  // console.log(user);
  const templateVars = {
    user: user,
    };
  res.render("register", templateVars);
});

const emailChecker = function(email) {
  for (const user in users) {
    if (email === users[user].email) {
      return user;
    }
  }
};

app.post("/register", (req, res) => {
  if (!req.body.email) {
    // console.log("email is:", req.body.email)
    res.status(404);
    res.send("Status 404 - Uh oh, there's a error. Please try again with a valid email!")
    } else if (emailChecker(req.body.email)) {
      res.status(404);
      res.send("Status 404 - Sorry, no dice. That email already exists. Please try again.")
    } ;
  const userRandomID = generateRandomString(4);
  users[userRandomID] = { 
    id: userRandomID, 
    email: req.body.email, 
    password: req.body.password 
  };
  res.cookie("user_id", userRandomID);
  res.redirect('/urls') 
}); 

//new code
app.get('/login', (req, res) => {
  const templateVars = {
    user: null,  // this is null because there is no info to be passed into the login template. once the template is filled out, that info is sent to the app.post
    };
  res.render("login", templateVars);
});

//this will be change... i think
app.post('/login', (req, res) => {
  console.log("user is: ", req.body.user);
  res.cookie("user_id", req.body.user);
  res.redirect("/urls");
});

app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const templateVars = { 
    urls: urlDatabase, 
    user: user,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const templateVars = { user: user,};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL], 
    user: user,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//UPDATE
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const updatedlongURL = req.body.longURL;
  urlDatabase[shortURL] = updatedlongURL;
  res.redirect('/urls');
});


//DELETE
app.post('/urls/:shortURL/delete', (req, res) => {
  // console.log("i want to delete:", req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});