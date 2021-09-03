const express = require('express'); // REST framework
const trailer = require('./routes/trailer');
const misc = require('./routes/misc');
require('dotenv').config(); // Environment variable handling

const PORT = parseInt(process.env.PORT, 10);
const app = express();

// Routes 
app.use('/trailer', trailer);
app.use('*', misc); // any route other than /trailer will go here

app.listen(PORT, () => {
    console.log(`Movie trailer API is running on port ${PORT}`);
});

module.exports = app;