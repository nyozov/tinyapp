const express = require("express");
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));
const {generateRandomString, findUserByEmail, authenticateUser, urlsForUser} = require('./helpers');

app.set("view engine", "ejs");



const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//homepage - redirects depending if user is logged in or not
app.get("/", (req, res) => {
  const user = req.session["user_id"];
  if (user) {
    res.redirect("/urls");
    return;
  }
  res.redirect("/login");

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//urls page - lists all urls created by the user
app.get("/urls", (req, res) => {
  const userURLs = urlsForUser(req.session["user_id"], urlDatabase);
  const templateVars = {
    user: users[req.session["user_id"]],
    urls: userURLs};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (req.session["user_id"]) {
    let userID = req.session["user_id"];
    const randomString = generateRandomString();
    urlDatabase[randomString] =  {longURL: req.body.longURL, userID: userID};
    res.redirect(`/urls/${randomString}`);
  } else {
    res.status(403).send("Login required for this action \n");
  }
});


//this page creates a shortURL when given a longURL
app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.session["user_id"]]};
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.render("login", templateVars);
    return
  }

  res.status(403).send("Login required for this action \n")
});


//page that shows user the shortURL for the given longURL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { user: users[req.session["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  if (req.session["user_id"] === urlDatabase[templateVars.shortURL].userID){
  res.render("urls_show", templateVars);
  return
  }
  res.status(403).send("Login required for this action/ wrong account \n");
});

//this uses the shortURL to redirect the user to their link
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  
  res.redirect(longURL);
});

//delete created urls
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = req.session["user_id"];
  const shortURL = req.params.shortURL
  if (user === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
    return
    
  }
  res.status(403).send("Login required for this action \n");
  
});

app.post("/urls/:shortURL", (req, res) => {
  const user = req.session["user_id"];
  const shortURL = req.params.shortURL
  if (user === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
    return;
  }
  res.status(403).send("Login required for this action \n");
  
});

//register page
app.get("/register", (req, res)=>{
  let templateVars = {
    user: users[req.session["user_id"]]
  }
  
  if (templateVars.user) {
    res.redirect("/urls");
    return;
  }
  res.render("register", templateVars);
  
  
});

//register with edge cases - if pass, creates user, hash password
app.post("/register", (req, res)=> {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send('Please enter email and password');
    return;
  }
  const userFound = findUserByEmail(req.body.email, users);
  if (userFound) {
    res.status(400).send("Email already registered");
    return;
  }
  const randomString = generateRandomString();
  const id = randomString;
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = {
    id,
    email,
    hashedPassword
  };
  req.session.user_id = id;
  res.redirect("/urls");
});

//login page
app.get("/login", (req, res)=>{
  let templateVars = {
    
    user: users[req.session["user_id"]]
  }
  
  if (templateVars.user) {
    res.redirect("/urls");
    return;
  }
  res.render("login", templateVars);
});

app.post("/login", (req, res)=> {
  const user = authenticateUser(req.body.email, req.body.password, users);
  if (user) {
    req.session.user_id = user.id;
    res.redirect("/urls");
    return;
  }
  res.status(403).send("Wrong username or password");
});

//logout clears cookies
app.post("/logout", (req, res)=> {
  req.session = null;
  res.redirect("/urls");

});
