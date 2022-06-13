require('dotenv').config();

const pg = require('pg');
const pool = new pg.Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function registerUser(user_data) {
  const sql = {
    text: 'INSERT INTO cliente (name, email, rut, address, password) VALUES ($1, $2, $3, $4, $5)',
    values: Object.values(user_data),
  };
  try {
    await pool.query(sql);
  } catch (error) {
    console.log(error.message);
  }
}

async function loginUser(user_data) {
  const sql = {
    text: 'SELECT * FROM cliente WHERE rut = $1 and password = $2',
    values: Object.values(user_data),
  };
  try {
    return pool.query(sql);
  } catch (error) {
    console.log(error.message);
  }
}

async function getAllTransfers() {
  const sql = {
    text: 'SELECT t.fecha, c.name as origen, d.name as destino, t.monto FROM transfer t left join cliente c on t.id_cliente = c.id left join cliente d on t.id_destinatario = d.id',
  };
  try {
    const resp = await pool.query(sql);
    return resp.rows;
  } catch (error) {
    console.log(error.message);
  }
}

async function getAllUsers() {
  const sql = {
    text: 'SELECT id, name, balance FROM cliente',
  };
  try {
    const resp = await pool.query(sql);
    return resp.rows;
  } catch (error) {
    console.log(error.message);
  }
}

async function newTransfer(data_transfer) {
  const sql = {
    text: 'INSERT INTO transfer (id_cliente, id_destinatario, monto, comment) VALUES ($1, $2, $3, $4)',
    values: Object.values(data_transfer),
  };

  const { id_cliente, id_destinatario, monto } = data_transfer;
  const removeMoney = {
    text: 'UPDATE cliente SET balance = balance - $2 WHERE id = $1',
    values: [id_cliente, monto],
  };

  const addMoney = {
    text: 'UPDATE cliente SET balance = balance + $2 WHERE id = $1',
    values: [id_destinatario, monto],
  };
  try {
    // return await pool.query(sql);
    await pool.query('BEGIN');
    await pool.query(sql);
    await pool.query('COMMIT');
    await pool.query(removeMoney);
    await pool.query('COMMIT');
    await pool.query(addMoney);
    await pool.query('COMMIT');
  } catch (error) {
    await pool.query('ROLLBACK');
    console.log(error.message);
  }
}

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getAllTransfers,
  newTransfer,
};
