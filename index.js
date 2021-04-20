const express = require('express');
const mongoose = require('mongoose');

const app = express();
const cors = require('cors');
const admin = require('./firebase');

// models
const User = require('./models/User');
const Order = require('./models/Order');
const Review = require('./models/Review');
const Service = require('./models/Service');

require('dotenv').config();

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('connected'))
  .catch((err) => console.log('connection error ' + err));

//   authcheck
const authCheck = async (req, res, next) => {
  try {
    const firebaseUser = await admin
      .auth()
      .verifyIdToken(req.headers.authtoken);

    req.user = firebaseUser;

    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({
      err: 'Invalid or expired token',
    });
  }
};

// admincheck
const adminCheck = async (req, res, next) => {
  const { email } = req.user;
  const adminUser = await User.findOne({ email }).exec();

  if (adminUser.role !== 'admin') {
    res.status(403).json({
      err: 'Admin Resource, Access denied',
    });
  } else {
    next();
  }
};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('hello world'));

app.get('/services', async (req, res) => {
  const services = await Service.find({});
  res.status(200).json(services);
});

app.get('/reviews', async (req, res) => {
  const reviews = await Review.find({});
  console.log(reviews);
  res.status(200).json(reviews);
});

// user routes
app.post('/create-or-update-user', authCheck, async (req, res) => {
  const { name, email } = req.user;
  const user = await User.findOneAndUpdate({ email }, { name }, { new: true });

  if (user) {
    res.status(200).json(user);
  } else {
    const newUser = await new User({
      email,
      name,
    }).save();

    res.status(201).json(newUser);
  }
});

app.post('/current-user', authCheck, async (req, res) => {
  const currentUser = await User.findOne({ email: req.user.email });

  res.status(200).json(currentUser);
});

app.put('/make-admin', authCheck, adminCheck, async (req, res) => {
  const { email } = req.body;
  const updatedUser = await User.findOneAndUpdate(
    { email: email },
    { role: 'admin' },
    { new: true }
  );

  if (!updatedUser) return res.status(404).json({ message: 'user not found' });

  res.status(200).json(updatedUser);
});

app.post('/current-admin', authCheck, adminCheck, async (req, res) => {
  const currentUser = await User.findOne({ email: req.user.email });

  res.status(200).json(currentUser);
});

// service routes

app.post('/services', authCheck, adminCheck, async (req, res) => {
  const newService = await new Service({
    ...req.body.service,
    email: req.user.email,
  }).save();

  res.status(201).json(newService);
});

app.get('/services/:id', authCheck, async (req, res) => {
  console.log('Am I called');
  const { id } = req.params;
  const service = await Service.findOne({ _id: id });
  res.status(200).json(service);
});

app.delete('/services/:id', authCheck, adminCheck, async (req, res) => {
  const { id } = req.params;
  const service = await Service.findOneAndRemove({ _id: id });
  res.status(200).json(service);
});

// review routes

app.post('/reviews', authCheck, async (req, res) => {
  console.log(req.body);
  const newReview = await new Review({
    ...req.body.review,
    email: req.user.email,
  }).save();

  res.status(201).json(newReview);
});

// order routes
app.get('/orders', authCheck, async (req, res) => {
  const user = await User.findOne({ email: req.user.email });

  if (user.role === 'admin') {
    const allOrders = await Order.find({}).populate('service', [
      'title',
      'description',
      'price',
    ]);
    return res.status(200).json(allOrders);
  } else {
    const orders = await Order.find({ email: user.email }).populate('service', [
      'title',
      'description',
      'price',
    ]);
    return res.status(200).json(orders);
  }
});

app.post('/orders', authCheck, async (req, res) => {
  const newOrder = await new Order({
    ...req.body.order,
    email: req.user.email,
  }).save();

  res.status(201).json(newOrder);
});

app.put('/orders/:id', authCheck, adminCheck, async (req, res) => {
  const { id } = req.params;
  const order = req.body.order;

  const updatedOrder = await Order.findOneAndUpdate(
    { _id: id },
    { status: order.status },
    {
      new: true,
    }
  );

  res.status(200).json(updatedOrder);
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log('server is listening on port: ' + port);
});
