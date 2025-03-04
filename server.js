const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const hbs = require("hbs");
const flash = require("express-flash");
const session = require("express-session");
const checkUser = require("./middlewares/auth");
const uploadProvinsi = require("./middlewares/upload-provinsi");
const {
  renderHome,
  renderRegister,
  renderAddProvinsi,
  renderLogin,
  authRegister,
  authLogin,
  addProvinsi,
} = require("./controllers/controllers");
require("dotenv").config();
const port = process.env.PORT || 3000;

// Middleware
app.use(flash());
app.use(
  session({
    name: "my-session",
    secret: "ewr234xfd",
    resave: false,
    saveUninitialized: true,
  })
);
app.use("/uploads", express.static(path.join(__dirname, "./uploads_provinsi")));

// Set view engine HBS
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

hbs.registerHelper("equal", (a, b) => {
  return a === b;
});

//use
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  "/uploads_provinsi",
  express.static(path.join(__dirname, "./uploads_provinsi"))
);

// Routing untuk halaman utama
app.get("/", renderHome);
app.get("/register", renderRegister);
app.get("/login", renderLogin);
app.get("/create-provinsi", renderAddProvinsi);

//Semua function Post
app.post("/register", authRegister);
app.post("/login", authLogin);
app.post("/create-provinsi", uploadProvinsi.single("image"), addProvinsi);
// Menjalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
