const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const secret = '1122';
const port = 3000;

const {
  registerUser,
  loginUser,
  getAllUsers,
  getAllTransfers,
  newTransfer,
} = require('./querys');

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use(
  '/bootstrap',
  express.static(__dirname + '/node_modules/bootstrap/dist')
);
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/css', express.static(__dirname + '/public/css'));

app.set('view engine', 'handlebars');
app.engine(
  'handlebars',
  exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/',
  })
);

app.get('/', (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        res.render('login');
      } else {
        res.redirect('/dashboard');
      }
    });
  } else {
    res.render('login');
  }
});

app.get('/register', (_req, res) => {
  res.render('register');
});

app.post('/login', async (req, res) => {
  const user_data = req.body;

  try {
    let resp = await loginUser(user_data);
    if (resp.rowCount == 0) {
      res.redirect('/');
    } else {
      const current_user = resp.rows[0];
      const token = jwt.sign(current_user, secret);
      res.cookie('token', token);
      res.redirect('/dashboard');
    }
  } catch (error) {
    res.status(402).send({
      code: 402,
      message: error.message,
    });
  }
});

app.post('/register', async (req, res) => {
  const user_data = req.body;

  try {
    await registerUser(user_data);
    res.redirect('/dashboard');
  } catch (error) {
    res.status(500).send({
      code: 500,
      message: 'Error al crear el usuario',
    });
  }
});

app.get('/dashboard', async (req, res) => {
  const { token } = req.cookies;
  let users = await getAllUsers();
  let saldo = 0;
  const transfers = await getAllTransfers();
  console.log(token);
  if (token) {
    jwt.verify(token, secret, (err, decoded) => {
      try {
        saldo = users.find((user) => user.id == decoded.id).balance;
        users = users.filter((user) => user.id != decoded.id);
      } catch (error) {
        res.clearCookie('token');
        res.redirect('/');
      }

      if (err) {
        res.redirect('/');
      } else {
        res.render('dashboard', {
          current_user: decoded,
          users,
          transfers,
          saldo,
        });
      }
    });
  } else {
    res.redirect('/');
  }
});

app.post('/transfer', async (req, res) => {
  const data_transfer = req.body;
  try {
    await newTransfer(data_transfer);
    res.redirect('/dashboard');
  } catch (error) {
    res.status(500).send({
      code: 500,
      message: error.message,
    });
  }
});

// logout
app.get('/logout', (_req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});
