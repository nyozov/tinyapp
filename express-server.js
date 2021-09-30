const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
 
  }
  return result;
}

const findUserByEmail = function(email, users) {
  for (let userId in users) {
    const user = users[userId];
    if (email === user.email) {
      return user;
    }
  }

  return false;
};

const authenticateUser = function (email, password, users) {
  // retrieve the user from the db
  const userFound = findUserByEmail(email, users);

  // compare the passwords
  // password match => log in
  // password dont' match => error message
  if (userFound && userFound.password === password) {
    return userFound;
  }

  return false;
};

const urlsForUser = function (id,db) {
  let matchingID = {}
  for (let key in db){
    if (db[key].userID === id){
      matchingID[key] = urlDatabase[key]

    }
  }
  return matchingID
}



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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  const userURLs = urlsForUser(req.cookies["user_id"], urlDatabase)
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: userURLs};
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]};
  if (templateVars.user){
  res.render("urls_new", templateVars);
  } else {
    res.render("login", templateVars)
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  console.log(urlDatabase)
  
  res.render("urls_show", templateVars);
  
  
});

app.post("/urls", (req, res) => {
  console.log(req.cookies["user_id"])
  
  if (req.cookies["user_id"]){
  let userID = req.cookies["user_id"]
  const randomString = generateRandomString();
  urlDatabase[randomString] =  {longURL: req.body.longURL, userID: userID};
  res.redirect(`/urls/${randomString}`);
  } else {
    res.status(403).send("Login required for this action \n")
  }
  
});


app.get("/u/:shortURL", (req, res) => {
  
  const longURL = urlDatabase[req.params.shortURL].longURL;
  
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies["user_id"] === urlDatabase[req.params.shortURL].userID){
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
  } else {
    res.status(403).send("Login required for this action \n")
  }
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});


app.post("/login", (req, res)=> {
  const user = authenticateUser(req.body.email, req.body.password, users);
  if (user) {
    res.cookie('user_id', user.id)
    res.redirect("/urls")
    return
  }
  
  res.status(403).send("Wrong username or password")

});

app.post("/logout", (req, res)=> {
  res.clearCookie("user_id");
  res.redirect("/urls");

});

app.get("/register", (req, res)=>{
  res.render("register");
});




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
  users[id] = {
    id,
    email,
    password
    
  };
  
  res.cookie("user_id", id);
  
  

  res.redirect("/urls");

});

app.get("/login", (req, res)=>{
  res.render("login");
});
