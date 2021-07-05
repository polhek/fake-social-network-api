const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fileUpload = require('express-fileupload');

require('dotenv').config();

// Routes ...
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const commentRouter = require('./routes/comments');
const notificationRouter = require('./routes/notifications');

const app = express();

app.use(fileUpload());
app.use(cors());

// mongoose connection
const mongoURL = process.env.DB_URL;
const mongoDB = process.env.MONGODB_URI || mongoURL;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoDB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });

    console.log(`Mongoose is running on: ${mongoDB}`);
  } catch (err) {
    console.log(`Failed to connect to ${mongoDB}!`);
  }
};
connectDB();

app.use(cors());
app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/user', usersRouter);
app.use('/api/posts', postsRouter);
app.use('/api/post', commentRouter);
app.use('/api/notification', notificationRouter);

module.exports = app;
