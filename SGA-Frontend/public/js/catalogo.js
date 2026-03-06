document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (event) => {
        if (event.target && event.target.classList.contains('btnAbrirLinha')) {
            const linhaDetalhe = event.target.closest('tr').nextElementSibling;

            if (linhaDetalhe) {
                const isHidden = linhaDetalhe.style.display === 'none';
                linhaDetalhe.style.display = isHidden ? 'table-row' : 'none';
                event.target.textContent = isHidden ? '-' : '+';
            }
        }
    });
});

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

const tabelaOpts = {
  categoria: '',
  fabricante: '',
  ordenacao: ''
};

async function fetchProdutosCatalogo() {
    try {
        const response = await fetch('http://localhost:8000/ver-catalogo');
        if (!response.ok) {
            throw new Error('Erro ao buscar produtos: ' + response.statusText);
        }
        produtos = await response.json();
        console.log(produtos);

        preencherSelects(produtos)
        montarTabela();
    } catch (error) {
        alert('Erro ao buscar usuários: ' + error.message);
    }
}

function preencherSelects(lista) {
    const selectFabricante = document.getElementById("fabricante");
    selectFabricante.innerHTML = '<option value="">Todos</option>';

    const fabricantes = [...new Set(lista.map(p => p.fabricante))].filter(f => f);

    fabricantes.forEach(f => {
        const optFabricante = document.createElement("option");
        optFabricante.value = f;
        optFabricante.textContent = f;
        selectFabricante.appendChild(optFabricante);
    });

    const selectCategoria = document.getElementById("categoria");
    selectCategoria.innerHTML = '<option value="">Todas</option>';

    const categorias = [...new Set(lista.flatMap(p => 
        p.categorias ? p.categorias.split(", ") : []
    ))].filter(c => c);

    categorias.forEach(f => {
        const optCategoria = document.createElement("option");
        optCategoria.value = f;
        optCategoria.textContent = f;
        selectCategoria.appendChild(optCategoria);
    });
}

function montarTabela(lista = produtos){
    const tbody = document.querySelector('#tabela-estoque tbody');
    tbody.innerHTML = '';

    let dados = lista.slice();

    dados.sort((a, b) => a.nome_basico.localeCompare(b.nome_basico));

    if (tabelaOpts.categoria) {
        dados = dados.filter(p => p.categorias && p.categorias.includes(tabelaOpts.categoria));
    }
    if (tabelaOpts.fabricante) {
        dados = dados.filter(p => p.fabricante === tabelaOpts.fabricante);
    }

    if (tabelaOpts.ordenacao === 'az') {
        dados.sort((a, b) => a.nome_basico.localeCompare(b.nome_basico));
    } else if (tabelaOpts.ordenacao === 'za') {
        dados.sort((a, b) => b.nome_basico.localeCompare(a.nome_basico));
    }

    if (dados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Nenhum produtos encontrado</td></tr>';
        return;
    }

    dados.forEach(p => {

        const row = `
        <tr>
        <td>${p.codigo}</td>
        <td>${p.nome_basico}</td>
        <td>${p.descricao_tecnica}</td>
        <td>${p.quantidade}</td>
        <td>${p.categorias}</td>
        <td>${p.fabricante}</td>
        <td class="colunaAbrirDetalhes" id="${p.codigo}"><button onclick=abrirLinha() class="btnAbrirLinha" id="${p.codigo}">+</button></td>
        </tr>
        <tr id="linhaDetalhe" style="display: none;">
        <td colspan="6">
            <div class="containerLinhaOculta">
            <div class="containerLinhaDetalhes">
                <div class="imagemProduto">
                    <img src="data:image/png;base64,${p.imagem}"/>
                </div>
                <div class="endereco-obs">
                    <table>
                        <thead>
                            <th colspan="2">Endereçamento</th>
                        </thead>
                        <tbody id="tableEnderecamento">
                            <tr>
                                <td id="colunaTopico" class="celulaDetalhe">Rua</td>
                                <td class="celulaDetalhe">${p.rua}</td>
                            </tr>
                            <tr>
                                <td id="colunaTopico" class="celulaDetalhe">Coluna</td>
                                <td class="celulaDetalhe">${p.coluna}</td>
                            </tr>
                            <tr>
                                <td id="colunaTopico" class="celulaDetalhe">Andar</td>
                                <td class="celulaDetalhe">${p.andar}</td>
                            </tr>
                        </tbody>
                    </table>
                    <table>
                            <thead>
                            <th  id="tableObservacoes">Observações</th>
                        </thead>
                        <tbody>
                            <tr>
                                <td id="celulaObservacoes">${p.observacoes_adicional}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="caractProd">

                    <table>
                    <thead>
                        <th  colspan="2">Características</th>
                    </thead>
                    <tbody id="tableCaracter">
                        <tr>
                            <td id="colunaTopico">Largura</td>
                            <td class="celulaDetalhe">${p.largura} cm</td>
                        </tr>
                        <tr>
                            <td id="colunaTopico">Altura</td>
                            <td class="celulaDetalhe">${p.altura} cm</td>
                        </tr>
                        <tr>
                            <td id="colunaTopico">Profundidade</td>
                            <td class="celulaDetalhe">${p.profundidade} cm</td>
                        <tr>
                            <td id="colunaTopico">Peso</td>
                            <td class="celulaDetalhe">${p.peso} Kg</td>
                        </tr>
                        <tr>
                            <td id="colunaTopico">Frágil</td>
                            <td class="celulaDetalhe">${p.fragilidade}</td>
                        </tr>
                        
                    </tbody>
                    </table>
                </div>
            </div>
            </div>
        </td>
        </tr>
        `;
        tbody.innerHTML += row;
        });
}

document.getElementById('ordenacao').addEventListener('change', e => {
  tabelaOpts.ordenacao = e.target.value;
  montarTabela();
});

document.getElementById('fabricante').addEventListener('change', e => {
  tabelaOpts.fabricante = e.target.value;
  montarTabela();
});

document.getElementById('categoria').addEventListener('change', e => {
  tabelaOpts.categoria = e.target.value;
  montarTabela();
});

//---------------------LIMPAR FILTRO

function limparFiltros() {
  tabelaOpts.categoria = '';
  tabelaOpts.fabricante = '';
  tabelaOpts.ordenacao = '';
  document.getElementById('categoria').value = '';
  document.getElementById('fabricante').value = '';
  document.getElementById('ordenacao').value = '';
  montarTabela();
}


window.onload = fetchProdutosCatalogo;