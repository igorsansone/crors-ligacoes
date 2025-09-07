import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import 'chart.js/auto';

const atendentes = [
  "ALEX SANDRO OLIVEIRA BARCELOS", "AMILCAR RAMOS PACHECO NETO", "ANA CAROLINE DOS SANTOS LOPES",
  "ANA LÚCIA DA SILVA SANTOS", "ANA PAULA MACHADO PORTO", "ANDRÉ NUNES FLORES", "ANDRÉIA CARLA VIEZZER",
  "ANDRESSA TRÁPAGA PAIZ", "BIANCA CARVALHO AGUILAR", "CARINA REIS SILVEIRA", "CARLOS EDVAN CARVALHO DUARTE",
  "CLARISSA DA COSTA BARCELLOS", "CLEONICE LOURENÇO GUIMARÃES MULLER", "CRISTIANO GRIMALDI BOFF",
  "DANIEL JOSÉ BAHI AYMONE", "GIOVANNA DE CASTRO BONAMIGO", "GUSTAVO RODRIGUES GRAMINHO",
  "GUSTAVO SANTOS DE BARROS", "IGOR PIRES DOS SANTOS", "IGOR RICARDO DE SOUZA SANSONE",
  "JEFFERSON ROCHO BARTH", "JOÃO FRANCISCO SCHMIDT", "JOÃO PAULO MELO DE CARVALHO", "JORGE MIGUEL CHAVES",
  "LEANDRO OSCAR COLLARES DA SILVA", "LEONARDO CARVALHO DA ROSA", "LETICIA PEREIRA VOLTZ",
  "LILIANE CORREA BRUNO", "LUANE SCALCON CARNELÓS", "LUCIANO DICHEL", "MARILDA ZANELLA BUSANELLO",
  "RODRIGO FERNANDES FLORIANO", "TÂNIA MARLI MENDES LEITE", "TANISE BARBOSA RAMASWAMI",
  "TATIANA DE CARLI DA SILVA", "TATIANA NUÑEZ ROSA", "WILLIANS DA SILVA MARKS"
];

const tiposDuvida = [
  "Dúvida sobre como votar - Sanada",
  "Duvida se está apto para votar - Sanada",
  "Dúvida sobre dados atualizados - Sanada",
  "Dúvidas jurídicas- Sanadas"
];

const categorias = [
  "Não apto - Dados desatualizados",
  "Apto - Dados atualizados",
  "Não apto - Dívida financeira",
  "Não apto - 60 dias inscrição",
  "Não apto outras categorias",
  "Apto - Remido",
  "Não apto - Militar"
];

const campoEstilo = {
  fontSize: 16,
  borderRadius: 2,
  background: "#f9f9f9",
  minHeight: 36,
  '.MuiOutlinedInput-notchedOutline': { borderColor: "#dbe4ee" },
  input: { fontSize: 16, padding: "8px 10px", color: "#253858" },
  textarea: { fontSize: 16, color: "#253858" }
};
const menuEstilo = { fontSize: 16, py: 1, color: "#253858", background: "#f6f8fb" };
const labelEstilo = { fontSize: 16, color: "#253858", fontWeight: 500 };

function getTodayString() {
  const today = new Date();
  return today.toISOString().slice(0,10);
}

function toDateString(dt) {
  return new Date(dt).toISOString().slice(0,10);
}

function App() {
  const [atendente, setAtendente] = useState(() => {
    const atendenteStorage = localStorage.getItem('atendente');
    const atendenteDay = localStorage.getItem('atendenteDay');
    if (atendenteStorage && atendenteDay === getTodayString()) {
      return atendenteStorage;
    }
    localStorage.removeItem('atendente');
    localStorage.removeItem('atendenteDay');
    return '';
  });
  const [cro, setCro] = useState('');
  const [nome, setNome] = useState('');
  const [duvida, setDuvida] = useState('');
  const [tipoDuvida, setTipoDuvida] = useState('');
  const [categoria, setCategoria] = useState('');
  const [ligacoes, setLigacoes] = useState([]);
  const [totalLigacoes, setTotalLigacoes] = useState(0);
  const [aba, setAba] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ligacaoParaExcluir, setLigacaoParaExcluir] = useState(null);
  const [erroExcluir, setErroExcluir] = useState('');

  // Filtros adicionados
  const [filtroAtendente, setFiltroAtendente] = useState('');
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3001/ligacoes').then(res => setLigacoes(res.data));
    axios.get('http://localhost:3001/ligacoes/total').then(res => setTotalLigacoes(res.data.total));
  }, [aba, ligacoes.length]);

  function handleAtendenteChange(e) {
    setAtendente(e.target.value);
    localStorage.setItem('atendente', e.target.value);
    localStorage.setItem('atendenteDay', getTodayString());
  }

  function registrarLigacao(e) {
    e.preventDefault();
    if (!atendente) return alert('Selecione o atendente.');
    localStorage.setItem('atendente', atendente);
    localStorage.setItem('atendenteDay', getTodayString());
    axios.post('http://localhost:3001/ligacoes', {
      cro, nome, duvida, tipoDuvida, categoria, atendente
    }).then(() => {
      setCro(''); setNome(''); setDuvida(''); setTipoDuvida(''); setCategoria('');
      setAba(1);
    });
  }

  // Ligações filtradas por atendente e período
  const ligacoesFiltradas = ligacoes.filter(l => {
    if (filtroAtendente && l.atendente !== filtroAtendente) return false;
    if (filtroInicio && toDateString(l.dataHora) < filtroInicio) return false;
    if (filtroFim && toDateString(l.dataHora) > filtroFim) return false;
    return true;
  });

  // Gráficos usam dados filtrados
  const porAtendente = {};
  ligacoesFiltradas.forEach(l => {
    porAtendente[l.atendente] = (porAtendente[l.atendente] || 0) + 1;
  });
  const graficoAtendente = {
    labels: Object.keys(porAtendente),
    datasets: [{
      label: 'Atendimentos por Atendente',
      data: Object.values(porAtendente),
      backgroundColor: Object.keys(porAtendente).map((_, i) =>
        `hsl(${(i * 30) % 360}, 60%, 60%)`
      )
    }]
  };

  const porTipoDuvida = {};
  ligacoesFiltradas.forEach(l => {
    porTipoDuvida[l.tipoDuvida] = (porTipoDuvida[l.tipoDuvida] || 0) + 1;
  });
  const graficoTipoDuvida = {
    labels: Object.keys(porTipoDuvida),
    datasets: [{
      label: 'Tipo de Dúvida',
      data: Object.values(porTipoDuvida),
      backgroundColor: Object.keys(porTipoDuvida).map((_, i) =>
        `hsl(${(i * 90) % 360}, 70%, 65%)`
      )
    }]
  };

  const porCategoria = {};
  ligacoesFiltradas.forEach(l => {
    porCategoria[l.categoria] = (porCategoria[l.categoria] || 0) + 1;
  });
  const graficoCategoria = {
    labels: Object.keys(porCategoria),
    datasets: [{
      label: 'Categoria',
      data: Object.values(porCategoria),
      backgroundColor: Object.keys(porCategoria).map((_, i) =>
        `hsl(${(i * 50) % 360}, 70%, 70%)`
      )
    }]
  };

  // Plugins para mostrar valores nos gráficos
  const barOptions = {
    plugins: {
      legend: {display:false},
      tooltip: {enabled: true},
    },
    responsive: true,
    scales: { x: {ticks:{font:{size:12}}}, y:{beginAtZero:true} }
  };

  const pieOptions = {
    plugins: {
      legend: {position: 'bottom'},
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.label}: ${ctx.parsed}`
        }
      }
    },
    responsive: true
  };

  const plugins = [{
    afterDatasetsDraw: chart => {
      const { ctx } = chart;
      chart.data.datasets.forEach((dataset, i) => {
        const meta = chart.getDatasetMeta(i);
        meta.data.forEach((bar, idx) => {
          const value = dataset.data[idx];
          if (value > 0) {
            ctx.save();
            ctx.font = 'bold 12px Segoe UI';
            ctx.fillStyle = '#222';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            let posX = bar.x;
            let posY = bar.y - 6;
            if (bar.y < 12) posY = bar.y + 15;
            ctx.fillText(value, posX, posY);
            ctx.restore();
          }
        });
      });
    }
  }];

  function exportarPDF() {
    const doc = new jsPDF();
    doc.text('Relatório de ligações', 10, 10);
    ligacoes.forEach((l, i) => {
      doc.text(`${l.sequencia} - ${l.atendente} - ${l.nome} - ${l.cro} - ${l.duvida} - ${l.tipoDuvida} - ${l.categoria}`, 10, 20 + i * 6);
    });
    doc.save('relatorio.pdf');
  }

  function abrirDialogExcluir(ligacao) {
    setLigacaoParaExcluir(ligacao);
    setErroExcluir('');
    setDialogOpen(true);
  }
  function fecharDialogExcluir() {
    setDialogOpen(false);
    setLigacaoParaExcluir(null);
    setErroExcluir('');
  }
  function handleExcluirLigacao() {
    if (!ligacaoParaExcluir._id) {
      setErroExcluir('Não foi possível excluir: ligação sem _id');
      return;
    }
    axios.delete(`http://localhost:3001/ligacoes/${ligacaoParaExcluir._id}`)
      .then(() => {
        setLigacoes(ligacoes.filter(l => l._id !== ligacaoParaExcluir._id));
        fecharDialogExcluir();
      })
      .catch(() => setErroExcluir('Erro ao excluir ligação.'));
  }

  return (
    <Container maxWidth="lg" sx={{mt: 2, fontFamily:'Segoe UI, Arial, sans-serif'}}>
      <Paper elevation={0} sx={{borderRadius:0, p:2, borderBottom:'1px solid #eee', background:'#f8f9fc', mb:2}}>
        <Box sx={{display:'flex', alignItems:'center'}}>
          <AssignmentIcon sx={{fontSize:32, mr:1}} />
          <Typography variant="h4" fontWeight={700}>Controle de Ligações</Typography>
        </Box>
        <Box sx={{display:'flex', gap:1, mt:1}}>
          <Button
            variant={aba === 0 ? "contained" : "text"}
            onClick={() => setAba(0)}
            sx={{
              minWidth:180, fontWeight:600, color: aba === 0 ? 'white' : '#444',
              background: aba === 0 ? '#1976d2' : 'none',
              borderRadius: 0
            }}
          >
            Cadastro de Ligação
          </Button>
          <Button
            variant={aba === 1 ? "contained" : "text"}
            onClick={() => setAba(1)}
            sx={{
              minWidth:180, fontWeight:600, color: aba === 1 ? 'white' : '#444',
              background: aba === 1 ? '#1976d2' : 'none',
              borderRadius: 0
            }}
          >
            Relatório
          </Button>
        </Box>
      </Paper>

      {aba === 0 && (
        <Paper elevation={2} sx={{mt:2, p:3, borderRadius:2, background:'#f8f9fc'}}>
          <Box sx={{mb:2}}>
            <Typography variant="subtitle1" fontWeight={600} color="primary">
              Total de ligações cadastradas: <b>{totalLigacoes}</b>
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={700} sx={{mb:2}}>Informações da Ligação</Typography>
              <form onSubmit={registrarLigacao}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Número CRO"
                      value={cro}
                      onChange={e => setCro(e.target.value)}
                      fullWidth
                      size="small"
                      sx={campoEstilo}
                      InputLabelProps={{style: labelEstilo}}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Nome"
                      value={nome}
                      onChange={e => setNome(e.target.value)}
                      fullWidth
                      size="small"
                      sx={campoEstilo}
                      InputLabelProps={{style: labelEstilo}}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small" disabled={!!atendente}>
                      <InputLabel sx={labelEstilo}>Atendente</InputLabel>
                      <Select
                        value={atendente}
                        label="Atendente"
                        onChange={handleAtendenteChange}
                        sx={campoEstilo}
                        MenuProps={{PaperProps: {sx: menuEstilo}}}
                      >
                        {atendentes.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                      </Select>
                    </FormControl>
                    {atendente && (
                      <Typography sx={{fontSize:16, mt:1, color:'#1976d2'}}>
                        Atendente selecionado: <b>{atendente}</b> (fixo para hoje)
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={labelEstilo}>Tipo de dúvida</InputLabel>
                      <Select
                        value={tipoDuvida}
                        label="Tipo de dúvida"
                        onChange={e => setTipoDuvida(e.target.value)}
                        sx={campoEstilo}
                        MenuProps={{PaperProps: {sx: menuEstilo}}}
                      >
                        {tiposDuvida.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={labelEstilo}>Categoria</InputLabel>
                      <Select
                        value={categoria}
                        label="Categoria"
                        onChange={e => setCategoria(e.target.value)}
                        sx={campoEstilo}
                        MenuProps={{PaperProps: {sx: menuEstilo}}}
                      >
                        {categorias.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Dúvida"
                      value={duvida}
                      onChange={e => setDuvida(e.target.value)}
                      fullWidth
                      multiline
                      rows={2}
                      size="small"
                      sx={campoEstilo}
                      InputLabelProps={{style: labelEstilo}}
                    />
                  </Grid>
                  <Grid item xs={12} sx={{display:'flex', justifyContent:'flex-end'}}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="success"
                      sx={{fontWeight:700, fontSize:16, py:1, px:3, borderRadius:2}}
                    >
                      Registrar ligação
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Grid>
          </Grid>
        </Paper>
      )}

      {aba === 1 && (
        <Paper elevation={2} sx={{mt:2, p:3, borderRadius:2, background:'#f8f9fc'}}>
          <Typography variant="h6" fontWeight={700} sx={{mb:2}}>Relatório de Ligações</Typography>
          {/* Filtros de período e atendente */}
          <Grid container spacing={2} sx={{mb:2}}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel sx={labelEstilo}>Atendente</InputLabel>
                <Select
                  value={filtroAtendente}
                  label="Atendente"
                  onChange={e => setFiltroAtendente(e.target.value)}
                  sx={campoEstilo}
                  MenuProps={{PaperProps: {sx: menuEstilo}}}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {atendentes.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Data inicial"
                type="date"
                InputLabelProps={{ style: labelEstilo }}
                value={filtroInicio}
                onChange={e => setFiltroInicio(e.target.value)}
                size="small"
                fullWidth
                sx={campoEstilo}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Data final"
                type="date"
                InputLabelProps={{ style: labelEstilo }}
                value={filtroFim}
                onChange={e => setFiltroFim(e.target.value)}
                size="small"
                fullWidth
                sx={campoEstilo}
              />
            </Grid>
            <Grid item xs={12} md={3} sx={{display:'flex', alignItems:'center'}}>
              <Button
                variant="outlined"
                color="inherit"
                sx={{mr:1}}
                onClick={() => { setFiltroInicio(''); setFiltroFim(''); setFiltroAtendente(''); }}
              >
                Limpar Filtros
              </Button>
              <Typography sx={{fontWeight:600, color:'primary.main'}}>
                Total filtrado: <b>{ligacoesFiltradas.length}</b>
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{overflowX:'auto', mb:4}}>
            <table style={{
              width:'100%',
              borderCollapse:'collapse',
              background:'#fff',
              fontFamily:'Segoe UI, Arial, sans-serif',
              borderRadius:2,
              boxShadow:'0 2px 8px #e0e3ea'
            }}>
              <thead>
                <tr style={{background:'#f4f5fa', fontWeight:700}}>
                  <th style={{padding:'10px', borderBottom:'1px solid #ccc'}}>Seq.</th>
                  <th style={{padding:'10px', borderBottom:'1px solid #ccc'}}>Data/Hora</th>
                  <th style={{padding:'10px', borderBottom:'1px solid #ccc'}}>Atendente</th>
                  <th style={{padding:'10px', borderBottom:'1px solid #ccc'}}>CRO</th>
                  <th style={{padding:'10px', borderBottom:'1px solid #ccc'}}>Nome</th>
                  <th style={{padding:'10px', borderBottom:'1px solid #ccc'}}>Dúvida</th>
                  <th style={{padding:'10px', borderBottom:'1px solid #ccc'}}>Tipo</th>
                  <th style={{padding:'10px', borderBottom:'1px solid #ccc'}}>Categoria</th>
                  <th style={{padding:'10px', borderBottom:'1px solid #ccc'}}>Excluir</th>
                </tr>
              </thead>
              <tbody>
                {ligacoesFiltradas
                  .filter(l => l._id)
                  .map(l => (
                    <tr key={l._id}>
                      <td style={{padding:'8px', borderBottom:'1px solid #eee'}}>{l.sequencia}</td>
                      <td style={{padding:'8px', borderBottom:'1px solid #eee'}}>{new Date(l.dataHora).toLocaleString()}</td>
                      <td style={{padding:'8px', borderBottom:'1px solid #eee'}}>{l.atendente}</td>
                      <td style={{padding:'8px', borderBottom:'1px solid #eee'}}>{l.cro}</td>
                      <td style={{padding:'8px', borderBottom:'1px solid #eee'}}>{l.nome}</td>
                      <td style={{padding:'8px', borderBottom:'1px solid #eee'}}>{l.duvida}</td>
                      <td style={{padding:'8px', borderBottom:'1px solid #eee'}}>{l.tipoDuvida}</td>
                      <td style={{padding:'8px', borderBottom:'1px solid #eee'}}>{l.categoria}</td>
                      <td style={{padding:'8px', borderBottom:'1px solid #eee', textAlign:'center'}}>
                        <IconButton
                          aria-label="excluir"
                          color="error"
                          size="small"
                          onClick={() => abrirDialogExcluir(l)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </Box>
          <Divider sx={{my:3}} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{p:2, mb:2}}>
                <Typography variant="subtitle1" fontWeight={700} sx={{mb:1}}>Atendimentos por Atendente</Typography>
                <Bar data={graficoAtendente} options={barOptions} plugins={plugins} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper elevation={3} sx={{p:2, mb:2}}>
                <Typography variant="subtitle1" fontWeight={700} sx={{mb:1}}>Tipo de Dúvida</Typography>
                <Pie data={graficoTipoDuvida} options={pieOptions} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper elevation={3} sx={{p:2, mb:2}}>
                <Typography variant="subtitle1" fontWeight={700} sx={{mb:1}}>Categorias</Typography>
                <Doughnut data={graficoCategoria} options={pieOptions} />
              </Paper>
            </Grid>
          </Grid>
          <Button startIcon={<DownloadIcon />} onClick={exportarPDF}
            variant="contained" color="primary"
            sx={{mt:2, fontWeight:700, borderRadius:2}}
          >
            Gerar relatório em PDF
          </Button>
          <Dialog open={dialogOpen} onClose={fecharDialogExcluir}>
            <DialogTitle>Excluir ligação</DialogTitle>
            <DialogContent>
              <Typography sx={{mb:2}}>Confirma excluir esta ligação?</Typography>
              {erroExcluir && (
                <Typography color="error" sx={{mb:2}}>{erroExcluir}</Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={fecharDialogExcluir} color="inherit">Cancelar</Button>
              <Button onClick={handleExcluirLigacao} color="error" variant="contained">Excluir</Button>
            </DialogActions>
          </Dialog>
        </Paper>
      )}
    </Container>
  );
}
export default App;