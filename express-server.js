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




app.set("view engine", "ejs");





const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const templateVars = {
    user: users[req.cookies["user_id"]],
    username: req.cookies["username"],
    urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
  
});

app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  urlDatabase[randomString] =  req.body.longURL;
  res.redirect(`/urls/${randomString}`);
  
});


app.get("/u/:shortURL", (req, res) => {
  
  const longURL = urlDatabase[req.params.shortURL];
  
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});


app.post("/login", (req, res)=> {
 
  res.cookie("username", req.body.username);
  res.redirect("/urls");
  console.log(req.body.username);
  

});

app.post("/logout", (req, res)=> {
  res.clearCookie("user_id");
  res.redirect("/urls");

});

app.get("/register", (req, res)=>{
  res.render("register");
});

const findUserByEmail = function(email, users) {
  for (let userId in users) {
    const user = users[userId];
    if (email === user.email) {
      return user;
    }
  }

  return false;
};


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
  
  console.log(users);

  res.redirect("/urls");

});
