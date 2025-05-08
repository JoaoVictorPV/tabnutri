const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, '../data');

app.use(cors());
app.use(express.json());

// Função utilitária para ler arquivo JSON
function readJson(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(DATA_DIR, file), 'utf8', (err, data) => {
      if (err) return reject(err);
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(e);
      }
    });
  });
}

// Função utilitária para escrever arquivo JSON
function writeJson(file, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      path.join(DATA_DIR, file),
      JSON.stringify(content, null, 2),
      'utf8',
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

// Rotas genéricas para arquivos JSON
const files = ['alimentos.json', 'dietas.json', 'refeicoes.json'];

// GET - listar dados
app.get('/api/:file', async (req, res) => {
  const { file } = req.params;
  if (!files.includes(file)) return res.status(404).json({ error: 'Arquivo não encontrado' });
  try {
    const data = await readJson(file);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao ler arquivo' });
  }
});

// PUT - atualizar dados
app.put('/api/:file', async (req, res) => {
  const { file } = req.params;
  if (!files.includes(file)) return res.status(404).json({ error: 'Arquivo não encontrado' });
  try {
    await writeJson(file, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar arquivo' });
  }
});

// POST - adicionar item (assume array no root)
app.post('/api/:file', async (req, res) => {
  const { file } = req.params;
  if (!files.includes(file)) return res.status(404).json({ error: 'Arquivo não encontrado' });
  try {
    const data = await readJson(file);
    if (!Array.isArray(data)) return res.status(400).json({ error: 'Formato inválido' });
    data.push(req.body);
    await writeJson(file, data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao adicionar item' });
  }
});

// DELETE - remover item por índice (assume array no root)
app.delete('/api/:file/:index', async (req, res) => {
  const { file, index } = req.params;
  if (!files.includes(file)) return res.status(404).json({ error: 'Arquivo não encontrado' });
  try {
    const data = await readJson(file);
    if (!Array.isArray(data)) return res.status(400).json({ error: 'Formato inválido' });
    data.splice(Number(index), 1);
    await writeJson(file, data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover item' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});
