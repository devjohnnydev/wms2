document.addEventListener("DOMContentLoaded", () => {
    const filtrarButton = document.querySelector("#filtrar");
    const caixote = document.querySelector("#caixote");

    //mostrar ou esconder o caixote
    filtrarButton.addEventListener("click", (event) => {
        caixote.classList.toggle("active");
        event.stopPropagation(); // impede que o click no filtro feche o dropdown
    });

    // Fecha o caixote se clicar fora dele
    document.addEventListener("click", (event) => {
        if (!caixote.contains(event.target) && !filtrarButton.contains(event.target)) {
            caixote.classList.remove("active");
        }
    });
});

//----------SCRIPT PRINCIPAL

let produtos = [];
let estoqueseguranca = [];

const tabelaOpts = {
  status: '',
  ordenacao: '' // 'az', 'za', 'maisRecente', 'maisAntigo'
};

// ---------- BUSCAR DADOS DO BACK ----------
async function fetchEstoqueReal() {
  try {
    const response = await fetch('http://localhost:8000/estoque');
    if (!response.ok) throw new Error('Erro ao buscar produtos: ' + response.statusText);
    produtos = await response.json(); // já vem a lista aqui
    console.log(produtos)

    const respSeguranca = await fetch('http://localhost:8000/estoqueseguranca');
    if (!respSeguranca.ok) throw new Error('Erro ao buscar estoque de segurança: ' + respSeguranca.statusText);
    estoqueseguranca = await respSeguranca.json();


    produtos = produtos.map(p => {
      const extra = estoqueseguranca.find(e => e.codigo === p.codigo);
      return {
        ...p,
        estoque_seguranca: extra ? extra.estoque_seguranca : null
      };
    });
    montarTabela();

  } catch (error) {
    alert('Erro ao buscar produtos: ' + error.message);
  }
}


// ---------- MONTAR TABELA ----------
function montarTabela(lista = produtos) {
  const tbody = document.querySelector('#tabela-estoque tbody');
  tbody.innerHTML = '';

  let dados = lista.slice();
  // aplicar ordenação

  if (tabelaOpts.status) {
    dados = dados.filter(p => p.status === tabelaOpts.status);
  }
  
  if (tabelaOpts.ordenacao === 'az') {
    dados.sort((a, b) => a.nome_basico.localeCompare(b.nome_basico));
  } else if (tabelaOpts.ordenacao === 'za') {
    dados.sort((a, b) => b.nome_basico.localeCompare(a.nome_basico));
  } else if (tabelaOpts.ordenacao === 'maisRecente') {
    dados.sort((a, b) => new Date(b.data_receb) - new Date(a.data_receb));
  } else if (tabelaOpts.ordenacao === 'maisAntigo') {
    dados.sort((a, b) => new Date(a.data_receb) - new Date(b.data_receb));
  }

  // montar linhas
  if (dados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8">Nenhum produto encontrado</td></tr>';
    return;
  }

  dados.forEach(p => {
    let status = 'OK'
    if (p.estoque_seguranca >= p.quantidade){
      status = 'ALERTA!'
    }

    p.status = status;
    
    const row = `
      <tr>
        <td>${p.codigo}</td>
        <td>${p.nome_basico}</td>
        <td>${p.estoque_seguranca ?? '-'}</td>
        <td>${p.quant_recente}</td>
        <td>${p.quantidade}</td>
        <td>${p.quantidade}</td>
        <td>100%</td>
        <td>${status}</td>
      </tr>`;
    tbody.innerHTML += row;
  });
}

// ---------- EVENTOS ----------
document.getElementById('status').addEventListener('change', e => {
  tabelaOpts.status = e.target.value;
  montarTabela();
});

document.getElementById('ordenacao').addEventListener('change', e => {
  tabelaOpts.ordenacao = e.target.value;
  montarTabela();
});

// limpar filtros
function limparFiltros() {
  tabelaOpts.categoria = '';
  tabelaOpts.fabricante = '';
  tabelaOpts.ordenacao = '';
  document.getElementById('categoria').value = '';
  document.getElementById('fabricante').value = '';
  document.getElementById('ordenacao').value = '';
  montarTabela();
}

// ---------- INÍCIO ----------
window.onload = fetchEstoqueReal;