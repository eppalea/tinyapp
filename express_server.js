const express = require("express");
const app = express(); //app could be named server
const PORT = 8080;

// app.use(morgan('dev'));
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
const morgan = require("morgan");
app.use(bodyParser.urlencoded({extended: true}));


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Aloha!");
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6); //the 6 represents the length of the random string
}

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//UPDATE
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const updatedlongURL = req.body.longURL;
  urlDatabase[shortURL] = updatedlongURL;
  res.redirect('/urls')
})


//DELETE
app.post('/urls/:shortURL/delete', (req, res) => {
  // console.log("i want to delete:", req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});