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

const generateRandomString = function(length) {
  return Math.random().toString(36).substr(2, length); //represents the length of the random string
};

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
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID:  "userRandomID1" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID2" }
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

const emailChecker = function(value) {
  for (const user in users) {
    if (value === users[user].email) {
      return user;
    } else if (value === users[user].password) {
      return user;
    }
  }
};

app.post("/register", (req, res) => {
  if (!req.body.email) {
    // console.log("email is:", req.body.email)
    res.status(404);
    res.send("Status 404 - Uh oh, there's a error. Please try again with a valid email!");
  } else if (emailChecker(req.body.email)) {
    res.status(404);
    res.send("Status 404 - Sorry, no dice. That email already exists. Please try again.");
  }
  const userRandomID = generateRandomString(4);
  users[userRandomID] = {
    id: userRandomID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie("user_id", userRandomID);
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
    res.status(403);
    res.send("Status 403 - Uh oh, there's a error. Please try again with a valid email!");
  } else if (!emailChecker(req.body.password)) {
    res.status(403);
    res.send("Status 404 - Sorry, no dice. That password is incorrect. Please try again.");
  }
  const userRandomID = generateRandomString(4);
  users[userRandomID] = {
    id: userRandomID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie("user_id", userRandomID);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

const urlsForUser = function(id) {
  const userSpecificURLDatabase = {};
  for (const shortURL in urlDatabase) {
    console.log("the shortURL is: ", shortURL);
    if (urlDatabase[shortURL].userID === id) {
    userSpecificURLDatabase[shortURL] = urlDatabase[shortURL]; 
    console.log(userSpecificURLDatabase[shortURL]);
    }
  }
  return userSpecificURLDatabase;
};

app.get("/urls", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const templateVars = {
    urls: urlDatabase,
    user: user
  };
  if (!user) {
    res.send("Access denied. Please Login or Register use the TinyApp.");
  } else {
    console.log("the user is", user.id);
    const userSpecificURLDatabase = (urlsForUser(user.id))
    const userTemplateVars = {
      urls: userSpecificURLDatabase,
      user: user
    }
    res.render("urls_index", userTemplateVars);
  }
 
});

app.get("/urls/new", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const templateVars = { user: user,};
  if (!user) {
    res.redirect('/login');
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: user
  }
  if (!user) {
    res.send("Access denied. Please Login or Register use the TinyApp.");
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies['user_id']};
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

//UPDATE
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const updatedlongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = updatedlongURL;
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