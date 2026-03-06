
//--------------------------------------------------------------Aparecer os saldos na tela
// arrays que serão preenchidas com os dados recebidos
let saldos = [];
let fabricantes = [];
let categorias = [];
let fornecedores = [];

async function fetchSaldos(event = null, num = 0) {
  try {

    saldo_url = num ? `http://127.0.0.1:8000/saldos/${num}` : 'http://127.0.0.1:8000/saldos';

    const response = await fetch(saldo_url);

    if (!response.ok) {
      throw new Error('Erro ao buscar saldos: ' + response.statusText);
    }

    const saldos_response = await response.json();
    const dados = saldos_response.dados // Modificado por causa do Pydantic

    saldos = dados

    // salva as informações para os selects
    dados.forEach(saldo => {
      if (!fabricantes.includes(saldo.fabricante)) { // salva os fabricantes
        fabricantes.push(saldo.fabricante);
      };
      if (!categorias.includes(saldo.categoria) && saldo.categoria) { // salva as categorias
        categorias.push(saldo.categoria);
      };
      if (!fornecedores.includes(saldo.fornecedor) && saldo.fornecedor) {
        fornecedores.push(saldo.fornecedor)
      }
    });

    //organiza e monta os selects
    fabricantes.sort();
    // Limpa os selects antes de adicionar as opções para evitar duplicatas
    fabricanteSelect.innerHTML = '<option value="" disabled selected>Selecione o fabricante</option>';
    fabricantes.forEach(fabricante => {
      const option = document.createElement("option");
      option.value = fabricante;
      option.textContent = fabricante;
      fabricanteSelect.appendChild(option)
    });
    categorias.sort();
    categoriaSelect.innerHTML = '<option value="" disabled selected>Selecione a categoria</option>';
    categorias.forEach(categoria => {
      const option = document.createElement("option");
      option.value = categoria;
      option.textContent = categoria;
      categoriaSelect.appendChild(option);
    });
    fornecedores.sort();
    fornecedorSelect.innerHTML = '<option value="" disabled selected>Selecione o fornecedor</option>';
    fornecedores.forEach(fornecedor => {
      const option = document.createElement("option");
      option.value = fornecedor;
      option.textContent = fornecedor;
      fornecedorSelect.appendChild(option);
    });

    montarTabela();
    
  } catch (error) {
    alert('Erro ao buscar saldos: ' + error.message);
  }
}

// arrumar datas do banco de dados para o formato correto
// function parseDataBr(dataStr) { // Comentado para caso use para validade
//   const [dia, mes, ano] = dataStr.split("/");
//   return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
// }

// objeto para ajustar o filtro
const tabelaOpts = {
  categoria: '',
  fabricante: '',
  fornecedor: '',
  // datas: [],
  sort: '' // 'az' ou 'za'
}

function montarTabela() {
  const tabelaRecebimentos = document.querySelector('.table-container');
  if (!tabelaRecebimentos) {
    throw new Error('Elemento com a classe "table-container" não encontrado no DOM.');
  }

  tabelaRecebimentos.innerHTML = ''; // Limpa o conteúdo anterior

  if (saldos.length === 0) {
    tabelaRecebimentos.innerHTML = '<div class="nenhum-recebimento">Nenhum saldo encontrado</div>';
    return;
  }

  const saldosAcumulados = {}; // Armazenará os saldos por produto e lote

  let tabelaData = saldos.slice() // cria uma nova cópia da array original
  // organiza a array se o sort estiver sendo usado
  if (tabelaOpts.sort === 'az') {
    tabelaData.sort((a, b) => a.nome_basico.localeCompare(b.nome_basico));
  } else if (tabelaOpts.sort === 'za') {
    tabelaData.sort((a, b) => b.nome_basico.localeCompare(a.nome_basico)); // inverte a array
  };

  tabelaData.forEach((saldo) => {
    // filtra os itens caso necessário
    // Categoria
    if (tabelaOpts.categoria && tabelaOpts.categoria != saldo.categoria) {
      return; // faz a função pular para o próximo item, igual um continue
    };
    // Fabricante
    if (tabelaOpts.fabricante && tabelaOpts.fabricante != saldo.fabricante) {
      return;
    };
    // Fornecedores
    if (tabelaOpts.fornecedor && tabelaOpts.fornecedor != saldo.fornecedor) {
      return;
    }
    // Datas
    // if (
    //   tabelaOpts.datas.length > 0 &&
    //   (tabelaOpts.datas[0] > parseDataBr(saldo.data_saida) ||
    //   tabelaOpts.datas[1] < parseDataBr(saldo.data_saida))
    // ) {
    //   return;
    // }; // Comentado para caso use para validade

    const key = `${saldo.codigo}-${saldo.lote}`; // Chave para identificar produto e lote
    if (!saldosAcumulados[key]) {
      saldosAcumulados[key] = {
        NOME_BASICO: saldo.nome_basico,
        CODIGO: saldo.codigo,
        LOTE: saldo.lote,
        QUANT_RECEBIMENTO: 0,
        QUANT_SAIDA: 0,
        SALDO: 0,
        VALIDADE: saldo.validade,
        FABRICANTE: saldo.fabricante,
        PRECO_DE_VENDA: saldo.preco_de_venda,
        FRAGILIDADE: saldo.fragilidade,
        IMAGEM: saldo.imagem
      };
    }

    // Converte as quantidades para números antes de somar
    const quantRecebida = Number(saldo.quant_recebimento);
    const quantSaida = Number(saldo.quant_saida);

    // Atualiza o saldo acumulado (Recebimento - Saída)
    saldosAcumulados[key].QUANT_RECEBIMENTO += quantRecebida;
    saldosAcumulados[key].QUANT_SAIDA += quantSaida;
    saldosAcumulados[key].SALDO += quantRecebida - quantSaida;
  });

  // Criação da tabela com os saldos acumulados
  Object.values(saldosAcumulados).forEach((saldo) => {
    const mainRow = document.createElement('div');
    mainRow.classList.add('row', 'main-row');
    mainRow.innerHTML = `
      <div class="cell"><strong>Item</strong><span>${saldo.NOME_BASICO}</span></div>
      <div class="cell"><strong>Código</strong><span>${saldo.CODIGO}</span></div>
      <div class="cell"><strong>Lote</strong><span>${saldo.LOTE}</span></div>
      <div class="cell"><strong>Quantidade Recebida</strong><span>${saldo.QUANT_RECEBIMENTO}</span></div>
      <div class="cell"><strong>Quantidade Saída</strong><span>${saldo.QUANT_SAIDA}</span></div>
      <div class="cell"><strong>Saldo</strong><span>${saldo.SALDO}</span></div>
    `;

    // Cria a linha de detalhes
    const detailsRow = document.createElement('div');
    detailsRow.classList.add('row', 'details-row');
    detailsRow.style.display = 'none'; // Esconde inicialmente
    detailsRow.innerHTML = `
      <div class="details-left">
        <div class="image-placeholder">
          <img src="data:image/png;base64,${saldo.IMAGEM}" alt="Ícone de imagem">
        </div>
      </div>
      <div class="details-right">
        <div class="detail-item"><strong>Fragilidade:</strong><span>${saldo.FRAGILIDADE}</span></div>
        <div class="detail-item"><strong>Fabricante:</strong><span>${saldo.FABRICANTE}</span></div>
        <div class="detail-item"><strong>Lote:</strong><span>${saldo.LOTE}</span></div>
        <div class="detail-item"><strong>Validade:</strong><span>${saldo.VALIDADE}</span></div>
        <div class="detail-item"><strong>Preço Venda:</strong><span>${saldo.PRECO_DE_VENDA} RS</span></div>
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
}
  
// Chama a função ao carregar a página
window.onload = fetchSaldos;


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

// ---------------------------funções do filtro
const categoriaSelect = document.getElementById("categoria");
const fabricanteSelect = document.getElementById("fabricante");
const fornecedorSelect = document.getElementById("fornecedor")

// Comentado para caso use para validade
// const dataIni = document.getElementById("dedata");
// const dataFinal = document.getElementById("atedata");

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
  if (fornecedorSelect.selectedIndex !== 0){
    tabelaOpts.fornecedor = fornecedorSelect.value;
  } else { // se selecionar a primeira opção
    tabelaOpts.fornecedor = ''; // reseta o valor
  };
  montarTabela();
});

// Datas (Comentado para caso use para validade)
// dataIni.addEventListener("change", () => {
//   if (dataIni.value && dataFinal.value) {
//     tabelaOpts.datas = [dataIni.value, dataFinal.value];
//   } else {
//     tabelaOpts.datas = [];
//   };
//   montarTabela();
// });

// dataFinal.addEventListener("change", () => {
//   if (dataIni.value && dataFinal.value) {
//     tabelaOpts.datas = [dataIni.value, dataFinal.value];
//   } else {
//     tabelaOpts.datas = [];
//   };
//   montarTabela();
// });

// organizar alfabéticamente
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
  //limpa os dados do objeto tabelaOpts
  tabelaOpts.categoria = '';
  tabelaOpts.fabricante = '';
  tabelaOpts.fornecedor = '';
  tabelaOpts.sort = '';
  // arruma os selects
  categoriaSelect.selectedIndex = 0;
  fabricanteSelect.selectedIndex = 0;
  fornecedorSelect.selectedIndex = 0;
  montarTabela();
  sortButton.style.borderColor = ''
  sortButtonRev.style.borderColor = ''
});