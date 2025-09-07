import React from 'react';
import { Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';

function Relatorio({ ligacoes }) {
  // Contagem por atendente
  const porAtendente = {};
  ligacoes.forEach(l => {
    porAtendente[l.atendente] = (porAtendente[l.atendente] || 0) + 1;
  });

  // Exemplo gráfico
  const data = {
    labels: Object.keys(porAtendente),
    datasets: [{ label: 'Atendimentos', data: Object.values(porAtendente), backgroundColor: 'blue' }]
  };

  // Exportar PDF
  function exportarPDF() {
    const doc = new jsPDF();
    doc.text('Relatório de ligações', 10, 10);
    ligacoes.forEach((l, i) => {
      doc.text(`${l.sequencia} - ${l.atendente} - ${l.nome} - ${l.cro} - ${l.tipoDuvida} - ${l.categoria}`, 10, 20 + i * 6);
    });
    doc.save('relatorio.pdf');
  }

  return (
    <div>
      <Bar data={data} />
      <button onClick={exportarPDF}>Gerar PDF</button>
    </div>
  );
}

export default Relatorio;