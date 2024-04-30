const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

// Ganti dengan token bot Telegram Anda
const token = '7014896766:AAEBLMmJGot_y5tBwKgQcznb68-Vrje3tXQ';

// Inisialisasi bot dengan token
const bot = new TelegramBot(token, { polling: true });

// Fungsi untuk membuat ID unik
function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

// Fungsi untuk menambahkan catatan
function addNote(userId, noteText) {
  // Baca catatan pengguna dari file (jika ada)
  let userNotes = {};
  try {
    userNotes = JSON.parse(fs.readFileSync(`${userId}.json`));
  } catch (error) {
    // Jika file tidak ditemukan atau ada kesalahan lain, abaikan dan buat objek kosong
  }

  // Buat ID unik untuk catatan
  const noteId = generateUniqueId();

  // Dapatkan timestamp saat ini
  const timestamp = new Date().toISOString();

  // Tambahkan catatan baru
  userNotes[noteId] = {
    timestamp: timestamp,
    noteText: noteText
  };

  // Simpan catatan ke file
  fs.writeFileSync(`${userId}.json`, JSON.stringify(userNotes));

  return `Catatan berhasil ditambahkan dengan ID: ${noteId}`;
}

// Fungsi untuk menghapus catatan
function deleteNote(userId, noteId) {
  // Baca catatan pengguna dari file (jika ada)
  let userNotes = {};
  try {
    userNotes = JSON.parse(fs.readFileSync(`${userId}.json`));
  } catch (error) {
    // Jika file tidak ditemukan atau ada kesalahan lain, abaikan
    return 'Gagal menghapus catatan. Catatan tidak ditemukan.';
  }

  // Periksa apakah catatan dengan ID tertentu ada
  if (userNotes.hasOwnProperty(noteId)) {
    delete userNotes[noteId];

    // Simpan catatan ke file
    fs.writeFileSync(`${userId}.json`, JSON.stringify(userNotes));

    return 'Catatan berhasil dihapus.';
  } else {
    return 'Gagal menghapus catatan. Catatan tidak ditemukan.';
  }
}

// Menangani pesan yang diterima
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  // Menangani perintah '/addnote'
  if (msg.text.toString().toLowerCase().startsWith('/addnote')) {
    const noteText = msg.text.substring(8).trim();
    if (noteText) {
      const response = addNote(userId, noteText);
      bot.sendMessage(chatId, response);
    } else {
      bot.sendMessage(chatId, 'Format pesan tidak valid. Gunakan /addnote [isi catatan] untuk menambahkan catatan.');
    }
  }

  // Menangani perintah '/notes'
  else if (msg.text.toString().toLowerCase() === '/notes') {
    let userNotes = {};
    try {
      userNotes = JSON.parse(fs.readFileSync(`${userId}.json`));
    } catch (error) {
      // Jika file tidak ditemukan atau ada kesalahan lain, abaikan dan kirim pesan kosong
    }

    let response = '<b>Daftar Catatan Anda:</b>\n\n';
    response += '<pre>';
    response += '| ID         | Timestamp                | User              | Isi Catatan         |\n';
    response += '|------------|--------------------------|-------------------|---------------------|\n';
    for (const noteId in userNotes) {
      const { timestamp, noteText } = userNotes[noteId];
      response += `| ${noteId} | ${timestamp} | ${msg.from.username} | ${noteText}\n`;
    }
    response += '</pre>';

    bot.sendMessage(chatId, response, { parse_mode: 'HTML' });
  }

  // Menangani perintah '/deletenote'
  else if (msg.text.toString().toLowerCase().startsWith('/deletenote')) {
    const noteId = msg.text.substring(11).trim();
    if (noteId) {
      const response = deleteNote(userId, noteId);
      bot.sendMessage(chatId, response);
    } else {
      bot.sendMessage(chatId, 'Format pesan tidak valid. Gunakan /deletenote [ID catatan] untuk menghapus catatan.');
    }
  }
});
