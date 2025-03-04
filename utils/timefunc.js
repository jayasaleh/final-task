function formatDate(a) {
  // Konversi ke objek Date
  let date = new Date(a);

  // Array nama hari dan bulan
  let hari = ["Sun", "Mon", "Tue", "Wed", "Thus", "Fri", "Sat"];
  let bulan = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];

  // Ambil komponen tanggal
  let namaHari = hari[date.getDay()];
  let tanggal = date.getDate();
  let namaBulan = bulan[date.getMonth()];
  let tahun = date.getFullYear();

  // Tampilkan hasil
  let hasil = `${namaHari}, ${tanggal} ${namaBulan} ${tahun}`;
  return hasil;
}
