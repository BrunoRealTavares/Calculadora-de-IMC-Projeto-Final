// --- Elementos do DOM ---
const pesoInput = document.getElementById('peso');
const alturaInput = document.getElementById('altura');
const calcularBtn = document.getElementById('calcular-btn');
const resultadoContainer = document.getElementById('resultado-container');
const valorImcDisplay = document.getElementById('valor-imc-display');
const categoriaImcDisplay = document.getElementById('categoria-imc-display');
const mensagemSaude = document.getElementById('mensagem-saude');
const historicoLista = document.getElementById('historico-lista');
const limparHistoricoBtn = document.getElementById('limpar-historico-btn');
const chartMarker = document.getElementById('chart-marker');

// --- Funções de Cálculo e Categoria ---

function calcularIMC(peso, altura) {
    // Retorna o IMC com 2 casas decimais
    return parseFloat((peso / (altura * altura)).toFixed(2));
}

function getCategoriaIMC(imc) {
    if (imc < 17) return { nome: 'Magreza Extrema', cor: '#e74c3c', msg: 'Risco de problemas de saúde. Procure acompanhamento médico.' };
    if (imc < 18.5) return { nome: 'Magreza', cor: '#f1c40f', msg: 'Atenção! Indica baixo peso, pode precisar de ajustes nutricionais.' };
    if (imc < 25) return { nome: 'Peso Normal', cor: '#27ae60', msg: 'Parabéns! Mantenha seu estilo de vida saudável.' };
    if (imc < 30) return { nome: 'Sobrepeso', cor: '#f39c12', msg: 'Risco aumentado de doenças. Considere reavaliar hábitos.' };
    if (imc < 35) return { nome: 'Obesidade Grau I', cor: '#e67e22', msg: 'Risco moderado. É recomendado acompanhamento profissional.' };
    if (imc < 40) return { nome: 'Obesidade Grau II (Severa)', cor: '#d35400', msg: 'Risco grave. É fundamental buscar auxílio médico e nutricional.' };
    return { nome: 'Obesidade Grau III (Mórbida)', cor: '#c0392b', msg: 'Risco muito grave. Requer intervenção médica imediata.' };
}

// --- Funções de Visualização e Gráfico ---

function updateChart(imc, categoriaCor) {
    // Define a faixa de IMC que queremos mostrar no gráfico (ex: de 15 a 45)
    const IMC_MIN = 15; 
    const IMC_MAX = 45;

    // Garante que o IMC esteja dentro dos limites para calcular a posição visual
    const imcClamped = Math.max(IMC_MIN, Math.min(IMC_MAX, imc));

    // Calcula a porcentagem de deslocamento do marcador na barra
    const percentage = ((imcClamped - IMC_MIN) / (IMC_MAX - IMC_MIN)) * 100;
    
    // 1. Move o Marcador
    chartMarker.style.left = `${percentage}%`;

    // 2. Ajusta a posição para que ele não "saia" dos cantos (centraliza -50%)
    if (percentage < 3) {
        chartMarker.style.transform = 'translateX(0)';
    } else if (percentage > 97) {
        chartMarker.style.transform = 'translateX(-100%)';
    } else {
        chartMarker.style.transform = 'translateX(-50%)';
    }

    // 3. Colore o marcador
    chartMarker.style.backgroundColor = categoriaCor;
}


function exibirResultado(imc, categoria) {
    valorImcDisplay.textContent = imc.toFixed(2);
    categoriaImcDisplay.textContent = categoria.nome;
    mensagemSaude.textContent = categoria.msg;
    
    // Define a cor da categoria
    categoriaImcDisplay.style.color = categoria.cor;
    valorImcDisplay.style.color = categoria.cor;

    // Atualiza o marcador do gráfico
    updateChart(imc, categoria.cor);
    
    // Torna a caixa de resultado visível
    resultadoContainer.style.display = 'block'; 
}

// --- Funções de Histórico (LocalStorage) ---

function carregarHistorico() {
    // Obtém histórico do LocalStorage ou um array vazio
    const historico = JSON.parse(localStorage.getItem('historicoIMC')) || [];
    historicoLista.innerHTML = ''; // Limpa a lista atual

    historico.forEach(item => {
        const li = document.createElement('li');
        // Formato da data
        const dataFormatada = new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
        
        li.innerHTML = `
            <span><strong>${item.imc.toFixed(1)}</strong> (${item.categoria})</span>
            <span style="font-size: 0.75rem; color: #999;">${dataFormatada}</span>
        `;
        historicoLista.appendChild(li);
    });
}

function salvarHistorico(imc, categoria) {
    const historico = JSON.parse(localStorage.getItem('historicoIMC')) || [];
    
    // Cria o novo item de histórico
    const novoItem = {
        imc: imc,
        categoria: categoria.nome,
        data: new Date()
    };
    
    // Adiciona o novo item e limita o histórico (ex: últimos 5)
    historico.unshift(novoItem); // Adiciona no início
    localStorage.setItem('historicoIMC', JSON.stringify(historico.slice(0, 5)));
    
    carregarHistorico(); // Recarrega a lista
}


// --- Event Listeners ---

calcularBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const peso = parseFloat(pesoInput.value);
    const altura = parseFloat(alturaInput.value);

    // Validação
    if (isNaN(peso) || isNaN(altura) || peso <= 0 || altura <= 0) {
        alert('Por favor, insira valores válidos e positivos para peso e altura.');
        return;
    }

    const imc = calcularIMC(peso, altura);
    const categoria = getCategoriaIMC(imc);

    exibirResultado(imc, categoria);
    salvarHistorico(imc, categoria);
});


limparHistoricoBtn.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja limpar todo o histórico de cálculos?')) {
        localStorage.removeItem('historicoIMC');
        carregarHistorico();
    }
});

// Inicializa o histórico quando a página carrega
document.addEventListener('DOMContentLoaded', carregarHistorico);
