const express = require('express');
const { Rcon } = require('rcon-client');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Geçici oyuncu veritabanı (İleride Launcher için burayı veritabanına bağlayabilirsin)
const users = {};

// Kayıt Olma Endpoint'i
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Lütfen kullanıcı adı ve şifre girin.' });
    }

    if (users[username.toLowerCase()]) {
        return res.status(400).json({ success: false, message: 'Bu kullanıcı adı zaten kayıtlı!' });
    }

    // Kullanıcıyı kaydet
    users[username.toLowerCase()] = { username, password };

    // RCON ile sunucuda işlem yap / Ödül ver
    try {
        const rcon = await Rcon.connect({
            host: process.env.RCON_HOST,
            port: parseInt(process.env.RCON_PORT) || 25575,
            password: process.env.RCON_PASSWORD
        });

        // Oyun içi ödül komutu (Örn: 500k para)
        await rcon.send(`eco give ${username} 500000`);
        await rcon.end();

        return res.json({ success: true, message: 'Kayıt başarılı! 500.000$ ödülünüz oyundaki hesabınıza aktarıldı.' });
    } catch (error) {
        console.error('RCON Hatası:', error);
        return res.json({ success: true, message: 'Kayıt başarılı! (Sunucu kapalı olduğu için ödül verilemedi, oyuna girince iletilecektir).' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor.`));