const express = require('express');
const cors = require('cors');
const session = require('express-session');
const Keycloak = require('keycloak-connect');
const path = require('path');
const fs = require('fs');

const applicationsRouter = require('./src/api/routes/applications.router');

const app = express();


const memoryStore = new session.MemoryStore();
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: memoryStore
}));



const keycloakConfigPath = path.join(__dirname, './keycloak.json');
const keycloakConfig = JSON.parse(fs.readFileSync(keycloakConfigPath, 'utf8'));

// Khởi tạo Keycloak với session store
const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);


// --- 3. Áp dụng các Middleware ---
app.use(cors());
app.use(express.json());

app.use(keycloak.middleware({
    logout: '/logout',
    admin: '/'
}));


app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Sử dụng keycloak.protect() để bảo vệ tất cả các route trong applicationsRouter
// Bất kỳ request nào đến /api/applications mà không có Access Token hợp lệ
// sẽ tự động bị từ chối với lỗi 401 Unauthorized.
app.use('/api/applications', applicationsRouter);
// app.use('/api/applications', keycloak.protect(), applicationsRouter);


module.exports = app;