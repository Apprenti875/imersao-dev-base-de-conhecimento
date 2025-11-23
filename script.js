// Seletores para elementos do DOM que serão usados múltiplas vezes
const inputBusca = document.getElementById('input-busca');
const botaoBusca = document.getElementById('botao-busca');

// Variável para armazenar todos os dados das linguagens após o carregamento inicial
let todasAsLinguagens = [];

/**
 * Exibe uma mensagem de status na seção principal.
 * @param {string} mensagem - O texto a ser exibido.
 */
function exibirMensagem(mensagem) {
    const secao = document.getElementById('resultados-busca');
    secao.innerHTML = ''; // Limpa a seção
    const p = document.createElement('p');
    p.className = 'mensagem-status'; // Adiciona uma classe para estilização
    p.textContent = mensagem;
    secao.appendChild(p);
}

/**
 * Renderiza uma lista de linguagens na tela, criando os artigos correspondentes.
 * @param {Array} linguagensParaRenderizar - O array de objetos de linguagem a ser exibido.
 */
function renderizarLinguagens(linguagensParaRenderizar) {
    const secao = document.getElementById('resultados-busca');
    secao.innerHTML = ''; // Limpa a seção antes de adicionar novos elementos

    if (linguagensParaRenderizar.length === 0) {
        exibirMensagem('Nenhuma linguagem encontrada para o termo buscado.');
        return;
    }

    linguagensParaRenderizar.forEach(lang => {
        // Cria os elementos do DOM em vez de usar innerHTML
        const article = document.createElement('article');
        const h2 = document.createElement('h2');
        h2.textContent = lang.nome;

        const pDescricao = document.createElement('p');
        const strongTopicos = document.createElement('strong');
        strongTopicos.textContent = 'Tópicos: ';
        pDescricao.appendChild(strongTopicos);
        pDescricao.append(`${lang.tags.join(', ')} ${lang.descricao}`); // Usar append para adicionar texto após o <strong>

        const a = document.createElement('a');
        a.href = lang.link_oficial || lang.link; // Compatível com link_oficial e link
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = `Ver mais sobre ${lang.nome}`;

        // Adiciona os elementos ao article
        article.appendChild(h2);

        // Adiciona o ano apenas se ele existir
        if (lang.data_criacao) {
            const pAno = document.createElement('p');
            pAno.textContent = `Ano de Criação: ${lang.data_criacao}`;
            article.appendChild(pAno);
        }

        article.appendChild(pDescricao);
        article.appendChild(a);
        secao.appendChild(article);
    });
}

/**
 * Carrega os dados das linguagens do arquivo data.json.
 * Armazena os dados e chama a função de renderização inicial.
 */
async function carregarLinguagens() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const data = await response.json();

        todasAsLinguagens = data; // Armazena os dados na variável global

        // Após carregar, inicia a busca com o termo da URL
        const termoDaUrl = new URLSearchParams(window.location.search).get('q');
        inputBusca.value = termoDaUrl || ''; // Preenche o input com o termo buscado
        iniciarBusca();

    } catch (error) {
        exibirMensagem('Não foi possível carregar os dados das linguagens. Verifique o console para mais detalhes.');
        console.error('Erro ao buscar o arquivo JSON:', error);
    }
}

/**
 * Filtra as linguagens com base no termo de busca e chama a renderização.
 */
function iniciarBusca() {
    const termoBusca = inputBusca.value.trim();

    // Se a busca estiver vazia, limpa os resultados e exibe a mensagem inicial.
    if (termoBusca === '') {
        exibirMensagem('Nenhum termo buscado. Digite algo na busca para começar.');
        return;
    }

    // Cria uma Expressão Regular para encontrar a "palavra inteira".
    // \b é um "word boundary" (delimitador de palavra), que garante que estamos buscando a palavra exata.
    // 'i' torna a busca insensível a maiúsculas/minúsculas.
    // A função escapeRegExp previne erros se o usuário digitar caracteres especiais como 'C++' ou 'C#'.
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapeRegExp(termoBusca)}\\b`, 'i');

    const linguagensFiltradas = todasAsLinguagens.filter(lang => 
        regex.test(lang.nome) || 
        regex.test(lang.tags.join(' ')) || 
        regex.test(lang.descricao)
    );

    renderizarLinguagens(linguagensFiltradas);
}

/**
 * Redireciona para a página de resultados com o termo da busca.
 */
function redirecionarParaBusca() {
    const termoBusca = inputBusca.value.trim();
    if (termoBusca) {
        window.location.href = `resultados.html?q=${encodeURIComponent(termoBusca)}`;
    }
}

// --- LÓGICA PRINCIPAL ---
// Verifica em qual página estamos e executa o código correspondente.

if (document.getElementById('resultados-busca')) {
    // --- ESTAMOS NA PÁGINA DE RESULTADOS (resultados.html) ---
    document.addEventListener('DOMContentLoaded', () => {
        // Na página de resultados, uma nova busca não recarrega a página, apenas filtra novamente.
        botaoBusca.addEventListener('click', iniciarBusca);
        inputBusca.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                iniciarBusca();
            }
        });
        carregarLinguagens(); // Carrega os dados e inicia a busca com o termo da URL

        inputBusca.addEventListener('input', () => {
            const termoBusca = inputBusca.value.trim();
            botaoBusca.disabled = termoBusca === '';

            // Se o campo de busca for limpo, limpa os resultados também.
            if (termoBusca === '') {
                iniciarBusca(); // A função já sabe o que fazer com uma busca vazia.
            }
        });
    });

} else {
    // --- ESTAMOS NA PÁGINA PRINCIPAL (index.html) ---
    document.addEventListener('DOMContentLoaded', () => {
        botaoBusca.disabled = true; // Botão começa desabilitado

        botaoBusca.addEventListener('click', redirecionarParaBusca);
        inputBusca.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                redirecionarParaBusca();
            }
        });

        // Habilita/desabilita o botão de busca
        inputBusca.addEventListener('input', () => {
            botaoBusca.disabled = inputBusca.value.trim() === '';
        });
    });
}