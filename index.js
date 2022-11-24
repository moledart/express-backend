// const express = require("express");
// const session = reuqire("express-session");
// require("dotenv").config();
// const cors = require("cors");

// import {
//   blockUsers,
//   createUser,
//   deleteUsers,
//   getUsers,
//   login,
// } from "./database.js";

// const app = express();
// app.use(express.json());
// app.set("trust proxy", 1);

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );
// app.use(
//   session({
//     resave: false,
//     saveUninitialized: false,
//     secret: process.env.SESS_SECRET,
//     cookie: {
//       maxAge: 1000 * 60 * 60 * 24,
//       sameSite: "none",
//       secure: false,
//       httpOnly: true,
//     },
//   })
// );

// app.listen(process.env.PORT, () => {
//   console.log("Server started on port: ", process.env.PORT);
// });

// app.get("/users", async (req, res) => {
//   const users = await getUsers();
//   if (!req.session.loggedIn) {
//     res.status(403).json("Login first");
//   } else {
//     res.send(users);
//   }
// });

// app.post("/createUser", async (req, res) => {
//   const { username, email, password } = req.body;
//   const result = await createUser(username, email, password);
//   if (result.err) {
//     res.status(409).json(result.err);
//   } else {
//     res.status(201).json(result);
//   }
// });

// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   const result = await login(email, password);
//   if (result.err) {
//     res.status(result.err.code).json(result.err.message);
//   } else {
//     req.session.username = result.username;
//     req.session.loggedIn = true;
//     req.session.userId = result.id;

//     console.log(req.session);
//     res.status(201).json({
//       message: "Login Successful",
//       loggedIn: true,
//       username: result.username,
//     });
//   }
// });

// app.get("/logout", (req, res) => {
//   req.session.destroy();
//   console.log(req.session);
//   res.status(201).json({
//     message: "Logout Successful",
//   });
// });

// app.delete("/users", async (req, res) => {
//   const users = req.body.join(",");
//   const result = await deleteUsers(users);
//   if (req.body.includes(req.session.userId)) req.session.destroy();
//   res.status(204).json(result);
// });

// app.put("/users", async (req, res) => {
//   const users = req.body.users.join(",");
//   const newStatus = req.body.action === "block" ? "banned" : "active";
//   const result = await blockUsers(users, newStatus);
//   if (req.body.users.includes(req.session.userId)) req.session.destroy();
//   res.status(204).json(result);
// });

// module.exports = app;

const express = require("express");
const session = require("express-session");
require("dotenv").config();
const cors = require("cors");

const {
  blockUsers,
  createUser,
  deleteUsers,
  getUsers,
  login,
} = require("./database.js");

const app = express();
app.use(express.json());
app.set("trust proxy", 1);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESS_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: "none",
      secure: false,
      httpOnly: true,
    },
  })
);

app.listen(process.env.PORT, () => {
  console.log(`API listening on PORT ${process.env.PORT} `);
});

app.get("/", (req, res) => {
  res.send("Hey this is my API running 🥳");
});

app.get("/about", (req, res) => {
  res.send("This is my about route..... ");
});

app.get("/users", async (req, res) => {
  const users = await getUsers();
  if (!req.session.loggedIn) {
    res.status(403).json("Login first");
  } else {
    res.send(users);
  }
});

app.post("/createUser", async (req, res) => {
  const { username, email, password } = req.body;
  const result = await createUser(username, email, password);
  if (result.err) {
    res.status(409).json(result.err);
  } else {
    res.status(201).json(result);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await login(email, password);
  if (result.err) {
    res.status(result.err.code).json(result.err.message);
  } else {
    req.session.username = result.username;
    req.session.loggedIn = true;
    req.session.userId = result.id;

    console.log(req.session);
    res.status(201).json({
      message: "Login Successful",
      loggedIn: true,
      username: result.username,
    });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  console.log(req.session);
  res.status(201).json({
    message: "Logout Successful",
  });
});

app.delete("/users", async (req, res) => {
  const users = req.body.join(",");
  const result = await deleteUsers(users);
  if (req.body.includes(req.session.userId)) req.session.destroy();
  res.status(204).json(result);
});

app.put("/users", async (req, res) => {
  const users = req.body.users.join(",");
  const newStatus = req.body.action === "block" ? "banned" : "active";
  const result = await blockUsers(users, newStatus);
  if (req.body.users.includes(req.session.userId)) req.session.destroy();
  res.status(204).json(result);
});

module.exports = app;
