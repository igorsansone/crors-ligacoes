const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

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

// Cadastro de ligação
app.post('/ligacoes', async (req, res) => {
  const total = await Ligacao.countDocuments();
  const ligacao = new Ligacao({ ...req.body, sequencia: total + 1 });
  await ligacao.save();
  res.json(ligacao);
});

// Listagem de ligações
app.get('/ligacoes', async (req, res) => {
  const ligacoes = await Ligacao.find().sort({ dataHora: 1 });
  res.json(ligacoes);
});

// Total de atendimentos
app.get('/ligacoes/total', async (req, res) => {
  const total = await Ligacao.countDocuments();
  res.json({ total });
});
// >>>> ADICIONE ESTE BLOCO <<<<
// Exclusão de ligação por _id
app.delete('/ligacoes/:id', async (req, res) => {
  try {
    const result = await Ligacao.deleteOne({ _id: req.params.id });
    if (result.deletedCount > 0) return res.sendStatus(200);
    res.status(404).send('Ligação não encontrada');
  } catch (err) {
    res.status(500).send('Erro ao excluir ligação');
  }
});
// Iniciar servidor
app.listen(3001, () => {
  console.log('API rodando na porta 3001');
});

// Iniciar servidor
app.listen(3001, () => {
  console.log('API rodando na porta 3001');
});