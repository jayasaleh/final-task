const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const { renderHome } = require("./controllers/controllers");

const port = process.env.PORT || 3000;

// Set view engine HBS
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Routing untuk halaman utama
app.get("/", renderHome);

// Menjalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
