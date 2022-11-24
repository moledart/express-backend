const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: process.env.DB_PORT,
});
const getUsers = async () => {
  try {
    const [users] = await pool.query("SELECT * FROM user_table");
    if (!users) throw "Could not get users. Something went wrong.";

    return users;
  } catch (err) {
    return { err };
  }
};

const getUserByEmail = async (email) => {
  try {
    const [user] = await pool.query(
      "SELECT * FROM user_table WHERE email = ?",
      [email]
    );
    if (!user[0]) throw "No user with this Email";

    return user[0];
  } catch (err) {
    return { err };
  }
};

const getUserById = async (id) => {
  try {
    const [user] = await pool.query("SELECT * FROM user_table WHERE id = ?", [
      id,
    ]);
    if (!user[0]) throw "No user with this ID";

    return user[0];
  } catch (err) {
    return { err };
  }
};

const createUser = async (username, email, password) => {
  try {
    const user = await getUserByEmail(email);
    if (!user.err) throw { code: 409, message: "User already exists" };
    const [result] = await pool.query(
      "INSERT INTO user_table VALUES (0,?,?,?,?,?,0)",
      [username, email, password, "active", new Date()]
    );
    const userid = result.insertId;
    return await getUserById(userid);
  } catch (err) {
    return { err };
  }
};

const deleteUsers = async (users) => {
  try {
    const [user] = await pool.query(
      `DELETE from user_table WHERE id IN (${users})`
    );
    if (user.affectedRows === 0) throw "No such user in the database";

    return user.affectedRows;
  } catch (err) {
    return { err };
  }
};

const login = async (email, password) => {
  try {
    const user = await getUserByEmail(email);

    if (user.err) throw { code: 404, message: "User does not exist" };
    if (user.password !== password)
      throw { code: 401, message: "Password incorrect" };
    if (user.status === "banned")
      throw { code: 403, message: "You are banned" };

    await pool.query(`UPDATE user_table SET lastLoginAt = ? WHERE email = ?`, [
      new Date(),
      email,
    ]);

    return user;
  } catch (err) {
    return { err };
  }
};

const blockUsers = async (users, newStatus) => {
  try {
    const [result] = await pool.query(
      `UPDATE user_table SET status = ? WHERE id IN (${users})`,
      [newStatus]
    );

    return result.affectedRows;
  } catch (err) {
    return { err };
  }
};

module.exports = {
  getUsers,
  getUserByEmail,
  getUserById,
  createUser,
  deleteUsers,
  blockUsers,
  login,
};
