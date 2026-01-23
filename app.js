// app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const adminRoutes = require('./routers/adminRoutes');
const productRoutes = require('./routers/productRoutes')
const userRoutes = require('./routers/usersRoutes')
const commonRoutes = require('./routers/usersRoutes')

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*', // for development
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));

// Default route
// app.get('/', (req, res) => {
//   res.json({ message: 'Quotation App Backend Running ' });
// });

// API Routes
app.use('/uploads', express.static('uploads'));

app.use('/api/admin', adminRoutes, productRoutes);
app.use('/api/users', userRoutes)
app.use('/api/common', commonRoutes)
// app.use('/api/product', )

module.exports = app;
