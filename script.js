// ===== 1) Posiciona pilha em cascata centralizada =====
const wins = Array.from(document.querySelectorAll('.deck .window'));
wins.forEach((win, i) => {
  // Pega os valores das variáveis CSS
  const offsetX = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--offset-x'));
  const offsetY = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--offset-y'));
  
  // Calcula o offset total da pilha para centralizar
  const totalOffsetX = (wins.length - 1) * offsetX;
  const totalOffsetY = (wins.length - 1) * offsetY;
  
  // Posiciona cada janela centralizada
  win.style.left = `calc(50% - var(--win-w)/2 - ${totalOffsetX/2}px + ${i * offsetX}px)`;
  win.style.top = `calc(50% - var(--win-h)/2 - ${totalOffsetY/2}px + ${i * offsetY}px)`;
  win.style.zIndex = wins.length - i;
});

// ===== 2) Fechar janelas e revelar prática quando acabar =====
const practice = document.getElementById('practice');
document.querySelectorAll('.btn-close').forEach(btn => {
  btn.addEventListener('click', e => {
    const win = e.target.closest('.window');
    if (win) win.remove();
    const remaining = document.querySelectorAll('.deck .window');
    if (remaining.length === 0 && practice) {
      practice.hidden = false;
      practice.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== 3) Gabarito das questões =====
const GABARITO = {
  'a1': 'idiomas',        // 1. Mistura de idiomas no mesmo código
  'a2': 'case',           // 2. Padrões de case diferentes  
  'a3': 'acronimos',      // 3. Acrônimos inconsistentes
  'a4': 'clareza',        // 4. Falta de clareza semântica
  'a5': 'unidades',       // 5. Unidades omitidas ou inconsistentes
  'a6': 'booleans',       // 6. Booleans sem padrão de prefixo
  'a7': 'mesma-coisa'     // 7. Nomes diferentes para a mesma coisa
};

// ===== 4) Botão "Responder" por atividade — valida seleção e verifica gabarito =====
document.querySelectorAll('.respond-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const panel = btn.closest('.xp-panel');
    const radios = panel.querySelectorAll('input[type="radio"]');
    const selected = Array.from(radios).filter(c => c.checked);
    
    if (selected.length === 0) {
      return; // Não fazer nada se nenhuma opção foi selecionada
    }

    // Pegar o nome da atividade (a1, a2, etc.)
    const activityName = selected[0].name;
    const selectedValue = selected[0].value;
    const correctAnswer = GABARITO[activityName];

    // Verificar se a resposta está correta
    if (selectedValue !== correctAnswer) {
      showErrorScreen();
      return;
    }

    // Desabilitar todos os radio buttons
    radios.forEach(c => c.disabled = true);
    
    // Atualizar botão
    btn.disabled = true;
    btn.textContent = '✅ Respondido';
    btn.style.background = '#90EE90';
    btn.style.color = '#000';
    
    // Mostrar feedback visual
    const selectedValues = selected.map(c => c.value);
    console.log(`Atividade respondida! Seleções: ${selectedValues.join(', ')}`);
    
    // Adicionar efeito visual de sucesso
    panel.style.boxShadow = '0 0 10px #90EE90';
    setTimeout(() => {
      panel.style.boxShadow = 'inset -1px -1px #808080, inset 1px 1px #fff';
    }, 2000);
    
    // Verificar se todas as atividades foram respondidas
    checkAllActivitiesCompleted();
  });
});

// ===== 5) Verificar conclusão de todas as atividades =====
function checkAllActivitiesCompleted() {
  const totalActivities = document.querySelectorAll('.respond-btn').length;
  const completedActivities = document.querySelectorAll('.respond-btn:disabled').length;
  
  if (completedActivities === totalActivities) {
    setTimeout(() => {
      showCompletionMessage();
    }, 1000);
  }
}

// ===== 6) Mostrar tela de erro quando resposta incorreta =====
function showErrorScreen() {
  // Criar overlay de erro em tela cheia
  const errorOverlay = document.createElement('div');
  errorOverlay.id = 'error-overlay';
  errorOverlay.className = 'error-overlay';
  errorOverlay.innerHTML = `
    <img src="./errorWinXP.png" alt="Error Windows XP" class="error-image">
  `;
  
  document.body.appendChild(errorOverlay);
  
  // Animar entrada
  setTimeout(() => {
    errorOverlay.style.opacity = '1';
  }, 10);
  
  // Fechar ao clicar na tela após 3 segundos
  setTimeout(() => {
    errorOverlay.addEventListener('click', closeErrorScreen);
  }, 3000);
}

// ===== 7) Fechar tela de erro =====
function closeErrorScreen() {
  const errorOverlay = document.getElementById('error-overlay');
  if (errorOverlay) {
    errorOverlay.style.opacity = '0';
    setTimeout(() => {
      errorOverlay.remove();
    }, 300);
  }
}

function showCompletionMessage() {
  const practiceSection = document.getElementById('practice');
  
  // Criar elemento de parabéns se não existir
  let congratsElement = document.getElementById('completion-message');
  if (!congratsElement) {
    congratsElement = document.createElement('div');
    congratsElement.id = 'completion-message';
    congratsElement.className = 'completion-message';
    congratsElement.innerHTML = `
      <div class="completion-content">
        <h2>🎉 Parabéns!</h2>
        <p>Você completou todas as 7 atividades sobre <strong>Nomenclatura Inconsistente</strong>!</p>
        <p>Continue praticando para melhorar a qualidade do seu código! 💪</p>
      </div>
    `;
    practiceSection.appendChild(congratsElement);
    
    // Animar entrada
    setTimeout(() => {
      congratsElement.style.opacity = '1';
      congratsElement.style.transform = 'translateY(0)';
    }, 100);
  }
}

// ===== 4) Colorização simples de sintaxe nas .codebox (mantém “cores modernas”) =====
(function enhanceCodeboxes(){
  const KEYWORDS = /\b(let|const|var|function|return|if|else|for|while|switch|case|break|continue|try|catch|finally|throw|new)\b/g;
  const BOOLEANS = /\b(true|false|null|undefined)\b/g;
  const NUMBERS  = /\b(\d+(\.\d+)?)\b/g;
  const STRINGS  = /("([^"\\]|\\.)*"|'([^'\\]|\\.)*')/g;
  const COMMENTS = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g;

  document.querySelectorAll('.codebox').forEach(box => {
    // Pega o texto puro (preserva indentação)
    const raw = box.textContent;

    // Escapa HTML
    let html = raw
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Comentários primeiro (para não conflitar com outros tokens dentro deles)
    html = html.replace(COMMENTS, m => `<span class="tok-comm">${m}</span>`);
    // Strings
    html = html.replace(STRINGS, m => `<span class="tok-str">${m}</span>`);
    // Números
    html = html.replace(NUMBERS, m => `<span class="tok-num">${m}</span>`);
    // Booleans / null / undefined
    html = html.replace(BOOLEANS, m => `<span class="tok-bool">${m}</span>`);
    // Palavras-chave
    html = html.replace(KEYWORDS, m => `<span class="tok-kw">${m}</span>`);

    // Opcional: destacar identificadores simples (após keywords/strings)
    // html = html.replace(/\b([A-Za-z_]\w*)\b/g, m => `<span class="tok-id">${m}</span>`);

    box.innerHTML = html;
  });
})();
