const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path'); // Para servir arquivos estáticos do frontend

const app = express();
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do frontend build (React)
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Troque para sua string do MongoDB Atlas se quiser usar nuvem
mongoose.connect('mongodb://localhost:27017/controle_ligacoes_crors', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Model
const ligacaoSchema = new mongoose.Schema({
  cro: String,
  nome: String,
  duvida: String,
  tipoDuvida: String,
  categoria: String,
  atendente: String,
  dataHora: { type: Date, default: Date.now },
  sequencia: Number
});
const Ligacao = mongoose.model('Ligacao', ligacaoSchema);

// Rotas de API
app.post('/ligacoes', async (req, res) => {
  const total = await Ligacao.countDocuments();
  const ligacao = new Ligacao({ ...req.body, sequencia: total + 1 });
  await ligacao.save();
  res.json(ligacao);
});

app.get('/ligacoes', async (req, res) => {
  const ligacoes = await Ligacao.find().sort({ dataHora: 1 });
  res.json(ligacoes);
});

app.get('/ligacoes/total', async (req, res) => {
  const total = await Ligacao.countDocuments();
  res.json({ total });
});

app.delete('/ligacoes/:id', async (req, res) => {
  try {
    const result = await Ligacao.deleteOne({ _id: req.params.id });
    if (result.deletedCount > 0) return res.sendStatus(200);
    res.status(404).send('Ligação não encontrada');
  } catch (err) {
    res.status(500).send('Erro ao excluir ligação');
  }
});

// Rota para servir o frontend React (deve ser a última!)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Iniciar servidor
app.listen(3001, () => {
  console.log('API rodando na porta 3001');
});
