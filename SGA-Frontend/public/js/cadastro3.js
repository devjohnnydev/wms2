async function SelectCategorias() {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/ver_categorias');

        if (!response.ok) {
            throw new Error('Erro ao buscar categorias: ' + response.statusText);
        }

        categorias = await response.json();
        const selectCategorias = document.getElementById("categorias");
        selectCategorias.innerHTML = "";
        console.log(categorias);

        categorias.todas_categorias.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat.idcategoria;
            opt.textContent = cat.categoria;

            selectCategorias.appendChild(opt);

        });

    } catch (error) {
        alert('Erro ao buscar categorias: ' + error.message);
    }
}

window.onload = SelectCategorias;