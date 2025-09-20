// require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const recordSchema = new mongoose.Schema({
  mecname: String,
  date: String,
  time: String,
});

const Record = mongoose.model("Record", recordSchema);

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  pass: { type: String, required: true },
  roleid: String,
});

const User = mongoose.model("User", userSchema);

app.post("/api/users/login", async (req, res) => {
  const { email, pass } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(pass, user.pass))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({
      user: {
        id: user._id,
        ame: user.name,
        email: user.email,
        roleid: user.roleid
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/records", async (req, res) => {
  console.log("Received from client:", req.body);
  const { mecname, date, time } = req.body;
  if (!mecname) {
    return res.status(400).json({ error: "mecName is required" });
  }
  try {
    const newRecord = new Record({ mecname, date, time });
    await newRecord.save();
    res.status(201).json({ message: "Saved to MongoDB", record: newRecord });
  } catch (error) {
    res.status(500).json({ error: "Failed to save record" });
  }
});

app.get("/api/records", async (req, res) => {
  try {
    const allRecords = await Record.find().sort({ _id: -1 });
    res.json(allRecords);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

const roleMap = {
  "1": "Agent",
  "2": "Manager",
  "3": "Admin"
};


app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({ roleid: { $in: ["1", "2"] } })
      .select("name email roleid _id")
      .lean();

    const usersWithRoles = users.map(u => ({
      _id: u._id,
      email: u.email,
      role: roleMap[String(u.roleid)] || "Unknown",
    }));

    res.json(usersWithRoles);
    console.log(usersWithRoles);
  } catch (err) {
    console.error("Error fetching users", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.post("/api/users/add", async (req, res) => {
  const { name, email, pass, roleid } = req.body;
  if (!email || !pass || !roleid) {
    return res.status(400).json({ error: "All fields required" });
  }
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "User already exists" });

    const hashedPass = await bcrypt.hash(pass, 10);
    const user = new User({ name, email, pass: hashedPass, roleid });

    await user.save();
    res.status(201).json({ message: "User added", user });
  } catch (err) {
    res.status(500).json({ error: "Failed to add user" });
  }
});
app.put("/api/users/:id", async (req, res) => {
  const { name, email, pass, roleid } = req.body;
  try {
    const updateFields = { name, email, roleid };
    if (pass) {
      updateFields.pass = await bcrypt.hash(pass, 10);
    }
    const updated = await User.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User updated", user: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
});


app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});


app.delete("/api/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
