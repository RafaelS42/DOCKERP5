const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST, 
  user: process.env.DB_USER, 
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME, 
  port: 5432,
});

// aguarda a conexão com o banco de dados
async function connectWithRetry() {
  let connected = false;
  while (!connected) {
    try {
      await pool.connect();
      connected = true;
      console.log('Conectado ao banco de dados');
    } catch (err) {
      console.error('Erro ao conectar ao banco de dados, tentando novamente...', err);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}

async function criarTabela() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS names (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL
      );
    `);
    console.log('Tabela "names" verificada/criada com sucesso.');
  } catch (err) {
    console.error('Erro ao criar tabela:', err);
    process.exit(1);
  }
}

// Conectar ao banco de dados e criar a tabela
connectWithRetry()
  .then(criarTabela)
  .then(() => {
    app.listen(3000, () => {
      console.log('Backend rodando na porta 3000');
    });
  })
  .catch(err => {
    console.error('Erro ao iniciar o servidor:', err);
    process.exit(1);
  });

app.post('/add-name', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).send('Nome é obrigatório');

  try {
    await pool.query('INSERT INTO names (name) VALUES ($1)', [name]);
    res.send('Nome adicionado com sucesso');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao adicionar nome');
  }
});

app.get('/list-names', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM names ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar nomes');
  }
});
