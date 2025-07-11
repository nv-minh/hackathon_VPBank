const app = require('./app');
const config = require('./config');

app.listen(config.port, () => {
    console.log(`🚀 API Server is running on http://localhost:${config.port}`);
});