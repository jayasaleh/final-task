const { User, Provinsi } = require("../models");
const { Sequelize, where } = require("sequelize");
const path = require("path");
const bcrypt = require("bcrypt");

async function renderHome(req, res) {
  const user = req.session.user;
  const provinsi = await Provinsi.findAll({
    include: {
      model: User,
      as: "user",
      attributes: { exclude: ["password"] },
    },
    order: [["createdAt", "DESC"]],
  });
  res.render("index", { user, provinsi });
}
async function renderRegister(req, res) {
  res.render("register");
}
async function renderLogin(req, res) {
  res.render("login");
}
async function renderAddProvinsi(req, res) {
  const user = req.session.user;
  if (!user) {
    res.redirect("/login");
  }
  res.render("create-provinsi", { user: user });
}
function capitalizeWords(str) {
  // mengubah awalan kata menjadi huruf besar
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
async function addProvinsi(req, res) {
  const user = req.session.user;
  if (!user) {
    req.flash("error", "Please Log In");
    return res.redirect("/login");
  }
  let { nama, diresmikan, pulau } = req.body;
  const image = req.file.path;
  console.log(req.body);
  console.log(image);
  const addProvinsi = {
    user_id: user.id,
    nama,
    diresmikan: new Date(diresmikan),
    photo: image,
    pulau,
  };
  const result = await Provinsi.create(addProvinsi);
  console.log(result);
  res.redirect("/");
}
async function authLogin(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({
    where: {
      email,
    },
  });
  if (!user) {
    req.flash("error", "User not found");
    return res.redirect("/login");
  }
  const isValidated = await bcrypt.compare(password, user.password);
  if (!isValidated) {
    req.flash("error", "Wrong password");
    return res.redirect("/login");
  }
  let loggedInUser = user.toJSON();
  delete loggedInUser.password;
  req.session.user = loggedInUser;
  req.flash("success", `Succesfuly Logged In as ${user.username}`);
  res.redirect("/");
}
async function authRegister(req, res) {
  let { email, username, password, confirmPassword } = req.body;

  if (username) {
    username = capitalizeWords(username);
  }
  //cek apakah ada user yang sudah menggunakan email yang sama
  const user = await User.findOne({
    where: {
      email: email,
    },
  });
  if (user) {
    req.flash("error", "The email is already in use by another account");
    return res.redirect("/register");
  }
  // cek apakah password sudah sama
  if (password !== confirmPassword) {
    req.flash("error", "The password does not match");
    return res.redirect("/register");
  }
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const newUser = {
    email,
    username,
    password: hashedPassword,
  };
  const userInsert = await User.create(newUser);
  req.flash("success", "Registration successful, please log in");
  res.redirect("/login");
}
module.exports = {
  renderHome,
  renderRegister,
  renderLogin,
  renderAddProvinsi,
  authRegister,
  authLogin,
  addProvinsi,
};
