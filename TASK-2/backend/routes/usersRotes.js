const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Fetch users
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Update user
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, dob, mobile, addr } = req.body;

  let fields = [];
  let values = [];

  if (firstName) {
    fields.push("firstName = ?");
    values.push(firstName);
  }
  if (lastName) {
    fields.push("lastNAme = ?");
    values.push(lastName);
  }
  if (dob) {
    fields.push("dob = ?");
    values.push(dob);
  }
  if (mobile) {
    fields.push("mobile = ?");
    values.push(mobile);
  }
  if (addr) {
    fields.push("addr = ?");
    values.push(addr);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  values.push(id);

  const sql = `
    UPDATE users 
    SET 
      firstName = ?,
      lastName = ?,
      dob = ?,
      mobile = ?,
      addr = ?
    WHERE 
      idusers = ?
  `;

  try {
    const [result] = await db.query(sql, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User updated" });
  } catch (err) {
    console.error("Error updating user:", err.message);
    res.status(400).json({ error: "Failed to update user" });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM users WHERE idusers = ?";
  try {
    const [result] = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Insert user
router.post("/", async (req, res) => {
  const { firstName, lastName, dob, mobile, addr } = req.body;

  console.log("Received data:", req.body);

  if (!firstName || !lastName || !dob || !mobile || !addr) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `
    INSERT INTO users (firstName, lastName, dob, mobile, addr)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [firstName, lastName, dob, mobile, addr];

  try {
    const [result] = await db.query(sql, values);

    const insertedId = result.insertId;
    res.status(201).json({ message: "User inserted", userId: insertedId });
  } catch (err) {
    console.error("Error inserting user:", err.message);
    res.status(500).json({ error: "Failed to insert user" });
  }
});

module.exports = router;
