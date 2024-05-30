const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const getAllUsers = async (req, res) => {
  try {
    const query = req.query;
    const limit = query.limit || 2;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    const users = await User.find({}, { " __v": false })
      .limit(limit)
      .skip(skip);
    return res.status(200).json(users);
  } catch (e) {
    console.log(e);
  }
};
const register = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  const hasedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    firstName,
    lastName,
    email,
    password: hasedPassword,
    role,
    avatar: req.file.filename,
  });
  const token = await jwt.sign(
    { email: newUser.email, id: newUser._id, role: newUser.role },
    process.env.JWT_SECRET_KEY
  );
  newUser.token = token;
  try {
    await newUser.save();
    res.status(201).json({ data: { user: newUser } });
  } catch (e) {
    return res.status(400).json({ error: e });
  }
};
const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ msg: "user is not found" });
  }
  const matchedPassword = await bcrypt.compare(password, user.password);

  if (user && matchedPassword) {
    const token = await jwt.sign(
      { email: user.email, id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY
    );
    return res
      .status(200)
      .json({ msg: "Logged In Successfuly", data: { token } });
  } else {
    return res.json(400).json("you have an error");
  }
};

module.exports = {
  getAllUsers,
  register,
  login,
};
