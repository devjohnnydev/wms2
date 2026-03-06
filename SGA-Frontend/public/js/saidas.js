// Alternar exibição do formulário de recebimento
/* TUDO CERTO */
// function toggleForm() {
//     const formContainer = document.getElementById("formContainer");
//     if (formContainer.style.display === "block") {
//       formContainer.style.display = "none";
//     } else {
//       formContainer.style.display = "block";
//     }
//   }
//   document.getElementById("formContainer").addEventListener("click", (event) => {
//     const formContent = document.getElementById("formContent");
//     if (formContent) {
//       if (!formContent.contains(event.target)) {
//         document.getElementById("formContainer").style.display = "none";
//       }
//     }
//   });
  
//   function toggleSection(sectionId) {
//     var section = document.getElementById(sectionId);
//     if (section.style.display === "none" || section.style.display === "") {
//       section.style.display = "block";
//     } else {
//       section.style.display = "none";
//     }
//   }

// dialog do modal
const dialogo = document.getElementById('formDialog');
const botaoAbrir = document.getElementById('abrir');
const botaoFechar = document.getElementById('fechar');

//---Inserir dados no BD
  document.addEventListener("DOMContentLoaded", () => {
    const formContainer = document.getElementById("formContainer");
    const registrationForm = document.getElementById("registrationForm");
  
    // Fetch fornecedores para preencher o select
    async function fetchFornecedores() {
      const response = await fetch("http://127.0.0.1:8000/fornecedores");
      const fornecedores = await response.json();
  
      const fornecedorSelect = document.getElementById("product_font");
      fornecedores.forEach((fornecedor) => {
        const option = document.createElement("option");
        option.value = fornecedor.id; // ou outro campo que represente o ID
        option.textContent = fornecedor.nome;
        fornecedorSelect.appendChild(option);
      });
    }
  
    // Fetch lotes para preencher o select
    // async function fetchLotes(fornecedorId) {
    //   const response = await fetch(`http://localhost:3000/lotes?fornecedor=${fornecedorId}`);
    //   const lotes = await response.json();
  
    //   const loteSelect = document.getElementById("numb_lote");
    //   loteSelect.innerHTML = '<option value="" disabled selected>Selecione o lote</option>'; // Limpa as opções
    //   lotes.forEach((lote) => {
    //     const option = document.createElement("option");
    //     option.value = lote.id; // ou outro campo que represente o ID do lote
    //     option.textContent = `Lote ${lote.id} - Estoque: ${lote.estoqueDisponivel}`;
    //     option.setAttribute("data-quantity", lote.estoqueDisponivel);
    //     loteSelect.appendChild(option);
    //   });
    // }
  
    const quantityHint = document.getElementById("quantity_hint");

    document.getElementById("product_font").addEventListener("change", (e) => {
      fetchLotes(e.target.value);
    });
  
    document.getElementById("numb_lote").addEventListener("change", function () {
      const selectedOption = this.options[this.selectedIndex];
      const quantidadeDisponivel = selectedOption.getAttribute("data-quantity");
  
      const quantidadeInput = document.getElementById("quantity_received");
      quantidadeInput.max = quantidadeDisponivel;
  
      quantityHint.textContent = `Estoque disponível: ${quantidadeDisponivel}`;
    });
  
    registrationForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const data = document.getElementById("issue_date").value;
      const quantidade = document.getElementById("quantity_received").value;
      const codigo = document.getElementById("product_code").value;
      const lote = document.getElementById("numb_lote").value;
      const fornecedor = document.getElementById("product_font").value;
  
      const response = await fetch("http://127.0.0.1:8000/adicionar-saida", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fornecedor: fornecedor,
          codigo: codigo,
          quantidade: quantidade,
          numbLote: lote,
          data_saida: data,
        }),
      });
  
      if (response.ok) {
        alert("Saída registrada com sucesso!");
        registrationForm.reset();
        fetchSaidas();
        toggleForm();
      } else {
        const error = await response.json();
        alert("Erro ao registrar saída: " + error.message);
      }
      

      quantityHint.textContent = "Estoque disponível: "; // Reseta a dica de quantidade
    });
  });
  
  // function toggleForm() {
  //   const formContainer = document.getElementById("formContainer");
  //   formContainer.style.display =
  //     formContainer.style.display === "block" ? "none" : "block";
  // }
  //----------------------------------------------------------------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    const productCodeInput = document.getElementById("product_code");
    const fornecedorSelect = document.getElementById("product_font");
    const loteSelect = document.getElementById("numb_lote");

    // Quando a página carregar, verifica se já existe código do produto inserido
    if (productCodeInput.value) {
        fetchFornecedoresPorProduto(productCodeInput.value);
    }

    // Quando o código do produto for alterado
    productCodeInput.addEventListener("change", (e) => {
        const codigoProduto = e.target.value;
        fetchFornecedoresPorProduto(codigoProduto);
    });

    // Quando o fornecedor for alterado
    fornecedorSelect.addEventListener("change", () => {
        const fornecedorId = fornecedorSelect.value;
        const codigoProduto = productCodeInput.value;
        if (fornecedorId && codigoProduto) {
            fetchLotes(fornecedorId, codigoProduto);
        }
    });

    // Quando o lote for alterado, ajusta a quantidade máxima
    loteSelect.addEventListener("change", function () {
        const selectedOption = this.options[this.selectedIndex];
        const quantidadeDisponivel = selectedOption.getAttribute("data-quantity");

        const quantidadeInput = document.getElementById("quantity_received");
        quantidadeInput.max = quantidadeDisponivel;

        const quantityHint = document.getElementById("quantity_hint");
        quantityHint.textContent = `Estoque disponível: ${quantidadeDisponivel}`;
    });
});

// Função para buscar fornecedores para um produto específico
async function fetchFornecedoresPorProduto(codigo) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/fornecedores/${codigo}`);

        if (!response.ok) {
          if (response.status == 400) {
            throw new Error('Fornecedores não encontrados, verifique se o código existe.')
          } else if (response.status == 500) {
            throw new Error(response.statusText)
          }          
        }
        
        const fornecedores_data = await response.json();
        const fornecedores = fornecedores_data.dados

        const fornecedorSelect = document.getElementById("product_font");
        fornecedorSelect.innerHTML = '<option value="" disabled selected>Selecione o fornecedor</option>';

        fornecedores.forEach(fornecedor => {
            const option = document.createElement("option");
            option.value = fornecedor.id;
            option.textContent = fornecedor.nome;
            fornecedorSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao buscar fornecedores:", error);
        alert(`Erro ao carregar fornecedores: ${error.message}`);
    }
}

// Função para buscar os lotes de um fornecedor e produto específico
async function fetchLotes(fornecedorId, codigo) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/lotes?fornecedor=${fornecedorId}&codigo=${codigo}`);
        const lotes_response = await response.json(); // Modificado por causa do pydantic
        const lotes = lotes_response.dados

        const loteSelect = document.getElementById("numb_lote");
        loteSelect.innerHTML = '<option value="" disabled selected>Selecione o lote</option>';

        if (lotes) {
          lotes.forEach(lote => {
              const option = document.createElement("option");
              option.value = lote.id;
              option.textContent = `Lote ${lote.id} - Estoque: ${lote.estoqueDisponivel}`;
              option.setAttribute("data-quantity", lote.estoqueDisponivel);
              loteSelect.appendChild(option);
          });
        }
    } catch (error) {
        console.error("Erro ao buscar lotes:", error);
        alert("Erro ao carregar lotes. Verifique sua conexão com o servidor.");
    }
}
  
//--------------------------------------------------------------Aparecer os recebimentos na tela
// arrays que serão preenchidas com os dados recebidos
let saidas = []
let categorias = []
let fornecedores = []
let fabricantes = []

async function fetchSaidas(event = null, num = 0) {
  try {
    saidaUrl = num ? `http://127.0.0.1:8000/saidas/${num}` : 'http://127.0.0.1:8000/saidas';

    const response = await fetch(saidaUrl);

    if (!response.ok) {
      throw new Error('Erro ao buscar saídas: ' + response.statusText);
    }

    const saidas_resposta = await response.json(); // Modificado por causa da resposta do pydantic
    const saidas_data = saidas_resposta.dados

    saidas = saidas_data

    // salva as informações para os selects
    saidas_data.forEach(saida => {
      if (!fabricantes.includes(saida.fabricante)) { // salva os fabricantes
        console.log(saida.fabricante, typeof saida.fabricante);
        fabricantes.push(saida.fabricante);
      };
      if (!categorias.includes(saida.categoria) && saida.categoria) { // salva as categorias
        categorias.push(saida.categoria);
      };
      if (!fornecedores.includes(saida.fornecedor) && saida.fornecedor) {
        fornecedores.push(saida.fornecedor)
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
    alert('Erro ao buscar saídas: ' + error.message);
  }
}

// arrumar datas do banco de dados para o formato correto
function parseDataBr(dataStr) {
  const [dia, mes, ano] = dataStr.split("/");
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
}

// objeto para ajustar o filtro
const tabelaOpts = {
  categoria: '',
  fabricante: '',
  fornecedor: '',
  datas: [],
  sort: '' // 'az' ou 'za'
}

function montarTabela() {
  const tabelaSaidas = document.querySelector('.table-container');
  if (!tabelaSaidas) {
    throw new Error('Elemento com a classe "table-container" não encontrado no DOM.');
  }

  tabelaSaidas.innerHTML = ''; // Limpa o conteúdo anterior

  if (saidas.length === 0) {
    tabelaSaidas.innerHTML = '<div class="nenhum-recebimento">Nenhuma saída encontrada</div>';
    return;
  }

  let tabelaData = saidas.slice() // cria uma nova cópia da array original
  // organiza a array se o sort estiver sendo usado
  if (tabelaOpts.sort === 'az') {
    tabelaData.sort((a, b) => a.nome_basico.localeCompare(b.nome_basico));
  } else if (tabelaOpts.sort === 'za') {
    tabelaData.sort((a, b) => b.nome_basico.localeCompare(a.nome_basico)); // inverte a array
  };
  

  tabelaData.forEach((saida, index) => {
    // filtra os itens caso necessário
    // Categoria
    if (tabelaOpts.categoria && tabelaOpts.categoria != saida.categoria) {
      return; // faz a função pular para o próximo item, igual um continue
    };
    // Fabricante
    if (tabelaOpts.fabricante && tabelaOpts.fabricante != saida.fabricante) {
      return;
    };
    // Fornecedores
    if (tabelaOpts.fornecedor && tabelaOpts.fornecedor != saida.fornecedor) {
      return;
    }
    // Datas
    if (
      tabelaOpts.datas.length > 0 &&
      (tabelaOpts.datas[0] > parseDataBr(saida.data_saida) ||
      tabelaOpts.datas[1] < parseDataBr(saida.data_saida))
    ) {
      return;
    };

    // Cria uma linha principal
    const mainRow = document.createElement('div');
    mainRow.classList.add('row', 'main-row');
    mainRow.innerHTML = `
      <div class="cell"><strong>Data</strong><span>${saida.data_saida}</span></div>
      <div class="cell"><strong>Código</strong><span>${saida.codigo}</span></div>
      <div class="cell"><strong>Item</strong><span>${saida.nome_basico}</span></div>
      <div class="cell"><strong>Fornecedor</strong><span>${saida.fornecedor}</span></div>
      <div class="cell"><strong>Preço Aquisição</strong><span>${saida.preco_de_aquisicao} R$</span></div>
      <div class="cell"><strong>Quantidade</strong><span>${saida.quant}</span></div>
    `;

    // Cria a linha de detalhes
    const detailsRow = document.createElement('div');
    detailsRow.classList.add('row', 'details-row');
    detailsRow.style.display = 'none'; // Esconde inicialmente
    detailsRow.innerHTML = `
      <div class="details-left">
        <div class="image-placeholder">
          <img src="data:image/png;base64,${saida.imagem}" alt="Ícone de imagem">
        </div>
      </div>
      <div class="details-right">
        <div class="detail-item"><strong>Fragilidade:</strong><span>${saida.fragilidade}</span></div>
        <div class="detail-item"><strong>Fabricante:</strong><span>${saida.fabricante}</span></div>
        <div class="detail-item"><strong>Lote:</strong><span>${saida.lote}</span></div>
        <div class="detail-item"><strong>Validade:</strong><span>${saida.validade}</span></div>
        <div class="detail-item"><strong>Preço Venda:</strong><span>${saida.preco_de_venda} RS</span></div>
      </div>
    `;

    // Adiciona um evento de clique à linha principal
    mainRow.addEventListener('click', () => {
      detailsRow.style.display = detailsRow.style.display === 'none' ? 'flex' : 'none';
    });

    // Adiciona as linhas à tabela
    tabelaSaidas.appendChild(mainRow);
    tabelaSaidas.appendChild(detailsRow);
  });
}

// Chama a função ao carregar a página
window.onload = fetchSaidas();

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
  if (fornecedorSelect.selectedIndex !== 0){
    tabelaOpts.fornecedor = fornecedorSelect.value;
  } else { // se selecionar a primeira opção
    tabelaOpts.fornecedor = ''; // reseta o valor
  };
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

// function toggleForm() {
//     const formContainer = document.getElementById("formContainer");
//     const overlay = document.getElementById("overlay");

//     const isVisible = formContainer.style.display === "block";

//     if (!isVisible) {
//         formContainer.style.display = "block";
//         overlay.classList.add("active");
//         document.body.classList.add("modal-open"); // Bloqueia cliques
//     } else {
//         formContainer.style.display = "none";
//         overlay.classList.remove("active");
//         document.body.classList.remove("modal-open");
//     }
// }