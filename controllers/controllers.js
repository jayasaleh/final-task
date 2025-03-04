const { User, Provinsi, Kabupaten } = require("../models");
const { Sequelize, where } = require("sequelize");
const path = require("path");
const bcrypt = require("bcrypt");
const fs = require("fs");
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
async function renderAddKabupaten(req, res) {
  const user = req.session.user;
  if (!user) {
    return res.redirect("/login");
  }
  const provinsi = await Provinsi.findAll({
    where: { user_id: user.id }, // Hanya ambil provinsi yang dibuat oleh user ini
    order: [["createdAt", "DESC"]],
  });
  res.render("create-kabupaten", { user, provinsi });
}
async function renderAddProvinsi(req, res) {
  const user = req.session.user;
  if (!user) {
    return res.redirect("/login");
  }
  res.render("create-provinsi", { user: user });
}
async function renderEditProvinsi(req, res) {
  const user = req.session.user;
  if (!user) {
    return res.redirect("/login");
  }
  const id = req.params.id;
  const editProvinsi = await Provinsi.findOne({
    where: {
      id: id,
    },
  });
  // check jika user yang login == user yang membuat provinsi
  if (editProvinsi.user_id !== user.id) {
    req.flash("error", "You do not have permission to edit this provinsi.");
    return res.redirect("/");
  }

  res.render("edit-provinsi", { editProvinsi, user });
}
async function renderKabupaten(req, res) {
  const user = req.session.user;
  const kabupaten = await Kabupaten.findAll({
    include: [
      {
        model: Provinsi,
        attributes: ["id", "user_id", "nama"],
      },
    ],
    order: [["createdAt", "ASC"]],
  });
  res.render("list-kabupaten", { user, kabupaten });
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
  req.flash("success", "Provinsi berhasil ditambahkan");
  res.redirect("/");
}
async function deleteProvinsi(req, res) {
  const id = req.params.id;
  const provinsi = await Provinsi.findByPk(id);
  if (!provinsi) {
    req.flash("error", "Provinsi yang ingin di delete tidak ada di database");
    return res.redirect("/");
  }
  if (provinsi.photo) {
    const oldImagePath = path.join(__dirname, "../", provinsi.photo);
    if (fs.existsSync(oldImagePath)) {
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.error("Failed to delete old image:", err);
        }
      });
    } else {
      console.warn("Old image file does not exist:", oldImagePath);
    }
  }
  const deleteResult = await Provinsi.destroy({
    where: {
      id: id, // id provinsi yang dipilih
    },
  });
  if (deleteResult !== 1) {
    return req.flash("error", "Gagal Menghapus file");
  }
  req.flash("error", "Provinsi berhasil dihapus");
  res.redirect("/");
}
async function updateProvinsi(req, res) {
  const id = req.params.id;
  const provinsi = await Provinsi.findByPk(id);
  if (!provinsi) {
    return res.status(404).send("Provinsi not found");
  }
  let { nama, diresmikan, pulau } = req.body;
  if (provinsi.photo && req.file) {
    const oldImagePath = path.join(__dirname, "../", provinsi.photo);
    if (fs.existsSync(oldImagePath)) {
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.error("Failed to delete old image:", err);
        }
      });
    } else {
      console.warn("Old image file does not exist:", oldImagePath);
    }
  }
  // New image path from upload
  const image = req.file
    ? `uploads_provinsi/${req.file.filename}`
    : provinsi.image;
  console.log("ID yang dicari:", id);
  console.log("Data yang akan diperbarui:", { nama, diresmikan, pulau, image });

  const updateResult = await Provinsi.update(
    {
      nama,
      diresmikan,
      photo: image,
      pulau,
    },
    {
      where: {
        id,
      },
    }
  );
  console.log("hasil updatenya", updateResult);
  req.flash("success", "Provinsi berhasil di update.");
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
  renderAddKabupaten,
  renderAddProvinsi,
  renderEditProvinsi,
  renderKabupaten,
  authRegister,
  authLogin,
  addProvinsi,
  deleteProvinsi,
  updateProvinsi,
};
