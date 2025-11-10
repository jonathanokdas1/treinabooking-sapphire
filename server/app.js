require('dotenv').config({
  path: process.env.NODE_ENV = process.argv[2] || 'local',
});

const express = require('express');
const bodyParser = require('body-parser');
const env = process.env.NODE_ENV || 'local';
const config = require(__dirname + '/config/config.json')[env];
const cors = require('cors');
const app = express();
const PORT = 8000;

const userRoute = require('./Routes/userRoute');
const attendanceRoutes = require('./Routes/AttendanceRoutes');
const userWalletRoutes = require('./Routes/WalletRoutes');
const reportRoutes = require('./Routes/ReportRoutes');
const pricingRoutes = require('./Routes/SessionPricingRoutes');
const BookingRoutes = require('./Routes/BookingRoutes');

const accessLog = require('./middleware/accessLog');

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(cors());

app.use('/user', userRoute);
app.use('/attendance', attendanceRoutes);
app.use('/wallet', userWalletRoutes);
app.use('/report', reportRoutes);
app.use('/pricing', pricingRoutes);
app.use('/booking', BookingRoutes);

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});

process.on('uncaughtException', function (err) {
  console.log(err);
});