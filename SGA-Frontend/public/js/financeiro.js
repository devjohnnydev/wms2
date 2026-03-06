// Alternar exibição do formulário de recebimento
/* TUDO CERTO */

// dialog do modal
const dialogo = document.getElementById('formDialog');
const botaoAbrir = document.getElementById('abrir');
const botaoFechar = document.getElementById('fechar');

//--------------------------------------------------------------Aparecer os recebimentos na tela
// arrays que serão preenchidas com os dados recebidos
let recebimentos = [];
let fabricantes = [];
let fornecedores = [];
let categorias = [];

// Busca os dados do backend
async function fetchData(event = null, num = 0) {
  console.log('teste' + num)
  try {
    // Se um número for passado, busca por ele, senão busca todos
    const recebimento_url = num ? `http://127.0.0.1:8000/recebimento/${num}` : 'http://127.0.0.1:8000/recebimento';
    const response = await fetch(recebimento_url);

    if (!response.ok) {
      throw new Error('Erro ao buscar produtos: ' + response.statusText);
    };

    const response_data = await response.json(); // retorna como um dicionário pelo pydantic
    const dados = response_data.dados; // extraindo as informações

    recebimentos = dados; // salva os recebimentos

    dados.forEach(recebimento => {
      if (!fabricantes.includes(recebimento.fabricante)) { // salva os fabricantes
        fabricantes.push(recebimento.fabricante);
      };
      if (!categorias.includes(recebimento.categoria) && recebimento.categoria) { // salva as categorias
        categorias.push(recebimento.categoria);
      };
      if (!fornecedores.includes(recebimento.FORNECEDOR)) { // salva os fornecedores
        fornecedores.push(recebimento.FORNECEDOR);
      }
    });

    // organiza e adiciona à página os fabricantes
    fabricantes.sort();
    // limpa os selects antes de adicionar os novos valores para evitar duplicatas
    fabricanteSelect.innerHTML = '<option value="" disabled selected>Selecione o fabricante</option>';
    fabricantes.forEach(fabricante => {
      const option = document.createElement("option");
      option.value = fabricante;
      option.textContent = fabricante;
      fabricanteSelect.appendChild(option)
    });
    categorias.sort();
    // limpa os selects antes de adicionar os novos valores para evitar duplicatas
    categoriaSelect.innerHTML = '<option value="" disabled selected>Selecione a categoria</option>';
    categorias.forEach(categoria => {
      const option = document.createElement("option");
      option.value = categoria;
      option.textContent = categoria;
      categoriaSelect.appendChild(option)
    });
    fornecedores.sort();
    // limpa os selects antes de adicionar os novos valores para evitar duplicatas
    fornecedorSelect.innerHTML = '<option value="" disabled selected>Selecione o fornecedor</option>'; 
    fornecedores.forEach(fornecedor => {
      const option = document.createElement("option");
      option.value = fornecedor;
      option.textContent = fornecedor;
      fornecedorSelect.appendChild(option);
    });

    montarTabela();
    
  } catch (error) {
    alert('Erro ao buscar recebimentos: ' + error.message);
  };
};



// arrumar datas do banco de dados para o formato correto
function parseDataBr(dataStr) {
  const [dia, mes, ano] = dataStr.split("/");
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}

// objeto para ajustar o filtro
const tabelaOpts = {
  categoria: '',
  fabricante: '',
  datas: [],
  sort: '' // 'az' ou 'za'
}

function montarTabela() {
  const tabelaRecebimentos = document.querySelector('.table-container');
  if (!tabelaRecebimentos) {
    throw new Error('Elemento com a classe "table-container" não encontrado no DOM.');
  }

  tabelaRecebimentos.innerHTML = ''; // Limpa o conteúdo anterior

  if (recebimentos.length === 0) {
    tabelaRecebimentos.innerHTML = '<div class="nenhum-recebimento">Nenhum recebimento encontrado</div>';
    return;
  };

  let tabelaData = recebimentos.slice() // cria uma nova array sem alterar a original

  // organiza a array se o sort estiver sendo usado
  if (tabelaOpts.sort === 'az') {
    tabelaData.sort((a, b) => a.nome_basico.localeCompare(b.nome_basico));
  } else if (tabelaOpts.sort === 'za') {
    tabelaData.sort((a, b) => b.nome_basico.localeCompare(a.nome_basico)); // inverte a array
  };

  tabelaData.forEach(recebimento => {
    // filtra os itens caso necessário
    if (tabelaOpts.categoria && tabelaOpts.categoria != recebimento.categoria) {
      return; // faz a função pular para o próximo item, igual um continue
    };
    if (tabelaOpts.fabricante && tabelaOpts.fabricante != recebimento.fabricante) {
      return;
    };
    if (tabelaOpts.fornecedor && tabelaOpts.fornecedor != recebimento.FORNECEDOR) {
      return;
    };
    if (
      tabelaOpts.datas.length > 0 &&
      (tabelaOpts.datas[0] > parseDataBr(recebimento.data_receb) ||
      tabelaOpts.datas[1] < parseDataBr(recebimento.data_receb))
    ) {
      return;
    };

    // Cria uma linha principal
    const mainRow = document.createElement('div');
    mainRow.classList.add('row', 'main-row');
    mainRow.innerHTML = `
      <div class="cell"><strong>Data</strong><span>${recebimento.data_receb}</span></div>
      <div class="cell"><strong>Código</strong><span>${recebimento.codigo}</span></div>
      <div class="cell"><strong>Item</strong><span>${recebimento.nome_basico}</span></div>
      <div class="cell"><strong>Fornecedor</strong><span>${recebimento.fornecedor}</span></div>
      <div class="cell"><strong>Preço Aquisição</strong><span>${recebimento.preco_de_aquisicao} R$</span></div>
      <div class="cell"><strong>Quantidade</strong><span>${recebimento.quant}</span></div>
    `;

    // Cria a linha de detalhes
    const detailsRow = document.createElement('div');
    detailsRow.classList.add('row', 'details-row');
    detailsRow.style.display = 'none'; // Esconde inicialmente
    detailsRow.innerHTML = `
      <div class="details-left">
        <div class="image-placeholder">
          <img src="data:image/png;base64,${recebimento.imagem}" alt="Ícone de imagem">
        </div>
      </div>
      <div class="details-right">
        <div class="detail-item"><strong>Fragilidade:</strong><span>${recebimento.fragilidade}</span></div>
        <div class="detail-item"><strong>Fabricante:</strong><span>${recebimento.fabricante}</span></div>
        <div class="detail-item"><strong>Lote:</strong><span>${recebimento.lote}</span></div>
        <div class="detail-item"><strong>Validade:</strong><span>${recebimento.validade}</span></div>
        <div class="detail-item"><strong>Preço Venda:</strong><span>${recebimento.preco_de_venda} RS</span></div>
      </div>
    `;

    // Adiciona um evento de clique à linha principal
    mainRow.addEventListener('click', () => {
      detailsRow.style.display = detailsRow.style.display === 'none' ? 'flex' : 'none';
    });

    // Adiciona as linhas à tabela
    tabelaRecebimentos.appendChild(mainRow);
    tabelaRecebimentos.appendChild(detailsRow);
  });
};

// Chama a função ao carregar a página
window.onload = fetchData;

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
      };
  });
});

// ---------------------------funções do filtro
const categoriaSelect = document.getElementById("categoria");
const fabricanteSelect = document.getElementById("fabricante");
const fornecedorSelect = document.getElementById("fornecedor");

const dataIni = document.getElementById("dedata");
const dataFinal = document.getElementById("atedata");

// Selects
categoriaSelect.addEventListener("change", () => {
  if (categoriaSelect.selectedIndex !== 0) {
    tabelaOpts.categoria = categoriaSelect.value;

  } else {
    tabelaOpts.categoria = ''; // reseta o valor
  };
  montarTabela();
});

fabricanteSelect.addEventListener("change", () => {
  if (fabricanteSelect.selectedIndex !== 0){
    tabelaOpts.fabricante = fabricanteSelect.value;
  } else { // se selecionar a primeira opção
    tabelaOpts.fabricante = ''; // reseta o valor
  };
  montarTabela();
});

fornecedorSelect.addEventListener("change", () => {
  if (fornecedorSelect.selectedIndex !== 0) {
    tabelaOpts.fornecedor = fornecedorSelect.value;
    console.log(tabelaOpts.fornecedor);
  } else { // se selecionar a primeira opção
    tabelaOpts.fornecedor = ''; // reseta o valor
  }
  montarTabela();
});

// Datas
dataIni.addEventListener("change", () => {
  if (dataIni.value && dataFinal.value) {
    tabelaOpts.datas = [dataIni.value, dataFinal.value];
  } else {
    tabelaOpts.datas = [];
  };
  montarTabela();
});

dataFinal.addEventListener("change", () => {
  if (dataIni.value && dataFinal.value) {
    tabelaOpts.datas = [dataIni.value, dataFinal.value];
  } else {
    tabelaOpts.datas = [];
  };
  montarTabela();
});

// organizar alfabeticamente
const sortButton = document.getElementById('sortAz');
const sortButtonRev = document.getElementById('sortZa');

sortButton.addEventListener('click', () => {
  if (tabelaOpts.sort !== 'az') {
    sortButton.style.borderColor = '#FFCC00'
    sortButtonRev.style.borderColor = ''
    tabelaOpts.sort = 'az';
  } else {
    sortButton.style.borderColor = ''
    tabelaOpts.sort = '';
  };
  montarTabela();
});

sortButtonRev.addEventListener('click', () => {
  if (tabelaOpts.sort !== 'za') {
    sortButtonRev.style.borderColor = '#FFCC00'
    sortButton.style.borderColor = ''
    tabelaOpts.sort = 'za';
  } else {
    sortButtonRev.style.borderColor = ''
    tabelaOpts.sort = '';
  };
  montarTabela();
});

// Limpa o filtro completamente
document.getElementById('textinho').addEventListener('click', () => {
  tabelaOpts.categoria = '';
  tabelaOpts.fabricante = '';
  tabelaOpts.fornecedor = '';
  tabelaOpts.datas = [];
  tabelaOpts.sort = '';
  // Reseta os selects e inputs
  categoriaSelect.selectedIndex = 0;
  fabricanteSelect.selectedIndex = 0;
  fornecedorSelect.selectedIndex = 0;
  dataIni.value = '';
  dataFinal.value = '';
  montarTabela();
  sortButton.style.borderColor = ''
  sortButtonRev.style.borderColor = ''
});

function toggleForm() {
  if (dialogo.open) {
    dialogo.close();
  } else {
    dialogo.showModal();
  }
}