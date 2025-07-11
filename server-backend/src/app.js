const express = require('express');
const cors = require('cors');
const config = require('./config');
const applicationsRouter = require('./api/routes/applications.router');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.use('/api/applications', applicationsRouter);

module.exports = app;