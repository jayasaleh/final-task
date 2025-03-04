const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const hbs = require("hbs");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const uploadProvinsi = require("./middlewares/upload-provinsi");
const {
  renderHome,
  renderRegister,
  renderAddProvinsi,
  renderAddKabupaten,
  renderLogin,
  renderEditProvinsi,
  renderKabupaten,
  authRegister,
  authLogin,
  addProvinsi,
  deleteProvinsi,
  updateProvinsi,
} = require("./controllers/controllers");
const { formateDate, editTime } = require("./utils/timefunc");

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
app.use(
  "/uploads/provinsi",
  express.static(path.join(__dirname, "./uploads_provinsi"))
);

app.use(
  "/uploads/kabupaten",
  express.static(path.join(__dirname, "./uploads_kabupaten"))
);
app.use(methodOverride("_method"));

// Set view engine HBS
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

hbs.registerHelper("equal", (a, b) => {
  return a === b;
});
hbs.registerHelper("formateDate", formateDate);
hbs.registerHelper("editTime", editTime);
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
app.get("/edit-provinsi/:id", renderEditProvinsi);
app.get("/list-kabupaten", renderKabupaten);
app.get("/create-kabupaten", renderAddKabupaten);

//Semua function Post
app.post("/register", authRegister);
app.post("/login", authLogin);
app.post("/create-provinsi", uploadProvinsi.single("image"), addProvinsi);

//update
app.patch("/edit-provinsi/:id", uploadProvinsi.single("image"), updateProvinsi);
//delete
app.delete("/delete/:id", deleteProvinsi);
// Menjalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
