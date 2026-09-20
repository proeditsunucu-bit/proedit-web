const express = require('express');
const { Rcon } = require('rcon-client');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'users.json');

function getUsers() {
    if (!fs.existsSync(DATA_FILE)) return {};
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE));
    } catch (e) {
        return {};
    }
}

function saveUsers(users) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}

// KAYIT OL API
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Kullanıcı adı ve şifre zorunludur!' });

    const users = getUsers();
    const cleanUsername = username.trim();

    if (users[cleanUsername.toLowerCase()]) {
        return res.status(400).json({ message: 'Bu kullanıcı adı zaten kayıtlı!' });
    }

    users[cleanUsername.toLowerCase()] = {
        username: cleanUsername,
        password: password,
        registeredAt: new Date().toISOString()
    };
    saveUsers(users);

    try {
        const rcon = await Rcon.connect({
            host: process.env.RCON_HOST || 'eu9-free.falixserver.net',
            port: parseInt(process.env.RCON_PORT) || 20224,
            password: process.env.RCON_PASSWORD || 'mustafaemir55',
            timeout: 5000
        });

        await rcon.send(`eco give ${cleanUsername} 500000`);
        await rcon.end();

        return res.json({ message: 'Kayıt başarılı! 500.000$ ödülünüz aktarıldı.', username: cleanUsername });
    } catch (error) {
        return res.json({ message: 'Kayıt başarılı! (Ödül oyuna girince iletilecektir).', username: cleanUsername });
    }
});

// GİRİŞ YAP API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Tüm alanları doldurun!' });

    const users = getUsers();
    const user = users[username.trim().toLowerCase()];

    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Kullanıcı adı veya şifre hatalı!' });
    }

    return res.json({ message: 'Giriş başarılı!', username: user.username });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});