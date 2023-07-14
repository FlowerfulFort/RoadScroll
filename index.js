const express = require('express');
const path = require('path');
const app = express();

PORT = 3000;
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});
app.use('/static', express.static(path.resolve(__dirname, 'dist', 'static')));
app.listen(PORT, () => {
    console.log(`Server Listening at ${PORT}`);
});
