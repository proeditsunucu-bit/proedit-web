const express = require('express');
const session = require('express-session');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'proedit_gizli_anahtar',
    resave: false,
    saveUninitialized: true
}));

// Sunucu verileri (Bellek üstünde tutulan örnek veriler)
let gameStatus = "Aktif (Çevrimiçi)";
let currentSeason = "Sezon 1: Nükleer Kıyamet";
let applications = ["Ahmet_Pro - Yetkili Başvurusu", "Mehmet123 - Rehber Başvurusu"];
let usersDb = { "proeditYT": "mustafa55" };

app.get('/', (req, res) => {
    const user = req.session.user;
    let adminHtml = '';
    
    // Sadece proeditYT giriş yaptıysa yönetici panelini göster
    if (user === 'proeditYT') {
        adminHtml = `
            <div style="background: #251a2a; border: 2px solid #ff00ff; margin-top: 20px; padding: 15px; border-radius: 8px;">
                <h3 style="color: #ff00ff;">👑 YÖNETİCİ PANELİ (Sadece Sana Özel)</h3>
                <form method="POST" action="/update_admin">
                    <label>Sunucu Durumu:</label><br>
                    <input type="text" name="new_status" value="${gameStatus}" style="width: 90%; padding: 10px; margin: 10px 0; background: #2a2a2a; border: 1px solid #444; color: white; border-radius: 5px;"><br>
                    <label>Sezon Değiştir:</label><br>
                    <input type="text" name="new_season" value="${currentSeason}" style="width: 90%; padding: 10px; margin: 10px 0; background: #2a2a2a; border: 1px solid #444; color: white; border-radius: 5px;"><br>
                    <button type="submit" style="background: #ff00ff; color: white; font-weight: bold; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; width: 95%;">Ayarları Güncelle</button>
                </form>
                <h4 style="text-align: left; color: #00ffcc;">Başvuranlar:</h4>
                <ul style="text-align: left; font-size: 14px;">
                    ${applications.map(app => `<li>${app}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    let content = '';
    if (!user) {
        content = `
            <h3>Giriş Yap veya Kayıt Ol</h3>
            <form method="POST" action="/login">
                <input type="text" name="username" placeholder="Kullanıcı Adı" required style="width: 90%; padding: 10px; margin: 10px 0; background: #2a2a2a; border: 1px solid #444; color: white; border-radius: 5px;"><br>
                <input type="password" name="password" placeholder="Şifre" required style="width: 90%; padding: 10px; margin: 10px 0; background: #2a2a2a; border: 1px solid #444; color: white; border-radius: 5px;"><br>
                <button type="submit" style="background: #00ffcc; color: black; font-weight: bold; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; width: 95%;">Giriş Yap / Kayıt Ol</button>
            </form>
        `;
    } else {
        content = `
            <p>Hoş geldin, <b>${user}</b>!</p>
            <a href="/download_launcher"><button style="background: #ffaa00; color: black; font-weight: bold; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; width: 95%;">Launcher İndir (.exe)</button></a>
            <br><br>
            <a href="/logout"><button style="background: #ff4444; color: white; font-weight: bold; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; width: 95%;">Çıkış Yap</button></a>
            ${adminHtml}
        `;
    }

    res.send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <title>ProEdit SMP</title>
            <style>
                body { background-color: #121212; color: #fff; font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .box { background: #1e1e1e; padding: 30px; border-radius: 10px; display: inline-block; width: 400px; box-shadow: 0 0 10px #00ffcc; }
            </style>
        </head>
        <body>
            <div class="box">
                <h2>PROEDIT SMP</h2>
                <p>Sunucu Durumu: <b>${gameStatus}</b> | Sezon: <b>${currentSeason}</b></p>
                ${content}
            </div>
        </body>
        </html>
    `);
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Özel kurucu kontrolü
    if (username === 'proeditYT' && password === 'mustafa55') {
        req.session.user = 'proeditYT';
    } else {
        usersDb[username] = password;
        req.session.user = username;
    }
    res.redirect('/');
});

app.post('/update_admin', (req, res) => {
    if (req.session.user === 'proeditYT') {
        gameStatus = req.body.new_status;
        currentSeason = req.body.new_season;
    }
    res.redirect('/');
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.get('/download_launcher', (req, res) => {
    res.send("Buraya launcher indirme dosyanı bağlayabilirsin kanka!");
});

app.listen(3000, () => {
    console.log("Node.js sunucusu çalışıyor: http://localhost:3000");
});
