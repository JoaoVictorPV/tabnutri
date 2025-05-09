// =====================
// Utilidades de Storage
// =====================
const STORAGE_KEYS = {
  ALIMENTOS: "tabnutri_alimentos",
  REFEICOES: "tabnutri_refeicoes",
  DIETAS: "tabnutri_dietas"
};

function salvarLocal(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function carregarLocal(key, fallback = []) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
}

// =====================
// Carregamento de Alimentos e Refeições
// =====================
let alimentos = [];
let refeicoes = [];

const API_BASE = "https://tabnutri.onrender.com/api";

async function carregarAlimentos() {
  try {
    const resp = await fetch(`${API_BASE}/alimentos.json`);
    if (!resp.ok) throw new Error("Erro ao carregar alimentos do backend");
    alimentos = await resp.json();
  } catch (e) {
    // Fallback: localStorage ou arquivo local
    alimentos = carregarLocal(STORAGE_KEYS.ALIMENTOS);
    if (alimentos.length === 0) {
      const resp = await fetch("data/alimentos.json");
      alimentos = await resp.json();
      salvarLocal(STORAGE_KEYS.ALIMENTOS, alimentos);
    }
  }
}

async function carregarRefeicoes() {
  try {
    const resp = await fetch(`${API_BASE}/refeicoes.json`);
    if (!resp.ok) throw new Error("Erro ao carregar refeições do backend");
    refeicoes = await resp.json();
  } catch (e) {
    // Fallback: localStorage ou arquivo local
    refeicoes = carregarLocal(STORAGE_KEYS.REFEICOES);
    if (refeicoes.length === 0) {
      const resp = await fetch("data/refeicoes.json");
      refeicoes = await resp.json();
      salvarLocal(STORAGE_KEYS.REFEICOES, refeicoes);
    }
  }
}

// =====================
// Navegação entre Abas
// =====================
function setupTabs() {
  const btnRefeicoes = document.getElementById("tab-refeicoes");
  const btnDietas = document.getElementById("tab-dietas");
  const secRefeicoes = document.getElementById("refeicoes-section");
  const secDietas = document.getElementById("dietas-section");

  btnRefeicoes.onclick = () => {
    btnRefeicoes.classList.add("active");
    btnDietas.classList.remove("active");
    secRefeicoes.style.display = "";
    secDietas.style.display = "none";
  };
  btnDietas.onclick = () => {
    btnDietas.classList.add("active");
    btnRefeicoes.classList.remove("active");
    secDietas.style.display = "";
    secRefeicoes.style.display = "none";
  };
}

// =====================
// Inicialização
// =====================
async function init() {
  setupTabs();
  await carregarAlimentos();
  await carregarRefeicoes();
  // Renderização inicial das abas
  renderRefeicoes();
  renderDietas();
}

document.addEventListener("DOMContentLoaded", init);

/**
 * Exporta um array de dados para um arquivo JSON para download.
 * @param {string} nomeArquivo
 * @param {any} dados
 */
function exportarParaJSON(nomeArquivo, dados) {
  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// =====================
// Renderização de Refeições (esqueleto)
// =====================
function renderRefeicoes() {
  const sec = document.getElementById("refeicoes-section");
  sec.innerHTML = `
    <h2>Criar Refeição</h2>
    <form id="form-refeicao" autocomplete="off">
      <div style="display:flex;gap:0.5rem;align-items:end;">
        <div style="flex:2;">
          <label for="alimento-input">Alimento</label>
          <select id="alimento-input" required>
            <option value="" disabled selected>Selecione...</option>
            ${alimentos.map(a => `<option value="${a.nome}">${a.nome}</option>`).join("")}
          </select>
        </div>
        <div style="flex:1;">
          <label for="quantidade-input">Qtd (g)</label>
          <input id="quantidade-input" type="number" min="1" max="2000" value="100" required />
        </div>
        <button type="submit" class="btn-add-refeicao" title="Adicionar alimento à refeição" aria-label="Adicionar alimento">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style="display:block;margin:auto;" xmlns="http://www.w3.org/2000/svg">
            <circle cx="14" cy="14" r="13" fill="#43a047" stroke="#2e7031" stroke-width="2"/>
            <path d="M14 8v12M8 14h12" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </form>
    <details style="margin:1.2rem 0 1.5rem 0;">
      <summary style="cursor:pointer;font-weight:bold;display:flex;align-items:center;gap:0.5rem;">
        <span style="display:inline-flex;align-items:center;">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="margin-right:0.4rem;" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="#43a047" stroke="#2e7031" stroke-width="2"/>
      <path d="M12 7v10M7 12h10" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
    </svg>
        </span>
        Adicionar novo alimento à base
      </summary>
      <form id="form-novo-alimento" style="margin-top:1rem;display:flex;flex-wrap:wrap;gap:0.7rem;align-items:end;">
        <input id="novo-nome" placeholder="Nome" required style="flex:2;min-width:120px;" maxlength="40"/>
        <input id="novo-calorias" type="number" placeholder="kcal/100g" min="0" required style="width:90px;"/>
        <input id="novo-carboidratos" type="number" placeholder="Carb (g)" min="0" step="0.1" required style="width:90px;"/>
        <input id="novo-gorduras" type="number" placeholder="Gord (g)" min="0" step="0.1" required style="width:90px;"/>
        <input id="novo-proteinas" type="number" placeholder="Prot (g)" min="0" step="0.1" required style="width:90px;"/>
        <button type="submit" class="btn" style="margin-left:0.5rem;">Adicionar alimento</button>
      </form>
    </details>
    <div id="itens-refeicao"></div>
    <div id="salvar-refeicao-area" style="display:none;margin-top:1rem;">
      <input id="nome-refeicao-input" placeholder="Nome da refeição" maxlength="32" required />
      <button id="btn-salvar-refeicao" class="btn">Salvar Refeição</button>
    </div>
    <h3>Refeições Salvas</h3>
    <ul id="lista-refeicoes" class="list"></ul>
  `;

  // Estado temporário da refeição em criação
  let itensRefeicao = [];

  // Renderiza lista de itens da refeição e totais
  function renderItens() {
    const div = document.getElementById("itens-refeicao");
    if (itensRefeicao.length === 0) {
      div.innerHTML = `<p style="color:var(--text-muted);margin:0.7rem 0;">Adicione alimentos à refeição.</p>`;
      document.getElementById("salvar-refeicao-area").style.display = "none";
      return;
    }
    let total = { calorias: 0, carboidratos: 0, gorduras: 0, proteinas: 0 };
    div.innerHTML = `
      <ul class="list">
        ${itensRefeicao.map((item, idx) => {
          const a = alimentos.find(al => al.nome === item.nome);
          if (!a) return "";
          const mult = item.qtd / 100;
          total.calorias += a.calorias * mult;
          total.carboidratos += a.carboidratos * mult;
          total.gorduras += a.gorduras * mult;
          total.proteinas += a.proteinas * mult;
          return `
            <li class="list-item">
              <b>${a.nome}</b> — ${item.qtd}g
              <small>
                ${Math.round(a.calorias * mult)} kcal,
                ${Math.round(a.carboidratos * mult * 10) / 10}g carb,
                ${Math.round(a.gorduras * mult * 10) / 10}g gord,
                ${Math.round(a.proteinas * mult * 10) / 10}g prot
                <button data-idx="${idx}" class="btn-remove" style="float:right;background:var(--danger);color:#fff;padding:0.2rem 0.7rem;font-size:0.9rem;">x</button>
              </small>
            </li>
          `;
        }).join("")}
      </ul>
      <div style="margin-top:0.7rem;">
        <b>Total:</b>
        <span>${Math.round(total.calorias)} kcal, 
        ${Math.round(total.carboidratos * 10) / 10}g carb, 
        ${Math.round(total.gorduras * 10) / 10}g gord, 
        ${Math.round(total.proteinas * 10) / 10}g prot</span>
      </div>
    `;
    document.getElementById("salvar-refeicao-area").style.display = "";
    // Remover item
    div.querySelectorAll(".btn-remove").forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.getAttribute("data-idx"));
        itensRefeicao.splice(idx, 1);
        renderItens();
      };
    });
  }

  // Adicionar alimento à refeição
  document.getElementById("form-refeicao").onsubmit = e => {
    e.preventDefault();
    const select = document.getElementById("alimento-input");
    const nome = select.value;
    const qtd = parseInt(document.getElementById("quantidade-input").value, 10);
    if (!nome || isNaN(qtd) || qtd <= 0) return;
    const alimento = alimentos.find(a => a.nome === nome);
    if (!alimento) {
      alert("Alimento não encontrado na base.");
      return;
    }
    itensRefeicao.push({ nome, qtd });
    renderItens();
    select.selectedIndex = 0;
    document.getElementById("quantidade-input").value = 100;
  };

  // Salvar refeição
  document.getElementById("btn-salvar-refeicao").onclick = () => {
    const nome = document.getElementById("nome-refeicao-input").value.trim();
    if (!nome) {
      alert("Dê um nome para a refeição.");
      return;
    }
    if (itensRefeicao.length === 0) return;
    let refeicoes = carregarLocal(STORAGE_KEYS.REFEICOES);
    if (refeicoes.some(r => r.nome === nome)) {
      alert("Já existe uma refeição com esse nome.");
      return;
    }
    // Calcular totais prontos
    let total = { peso: 0, calorias: 0, carboidratos: 0, gorduras: 0, proteinas: 0 };
    itensRefeicao.forEach(item => {
      const a = alimentos.find(al => al.nome === item.nome);
      if (!a) return;
      const mult = item.qtd / 100;
      total.peso += item.qtd;
      total.calorias += a.calorias * mult;
      total.carboidratos += a.carboidratos * mult;
      total.gorduras += a.gorduras * mult;
      total.proteinas += a.proteinas * mult;
    });
    // Arredondar valores
    total.calorias = Math.round(total.calorias * 10) / 10;
    total.carboidratos = Math.round(total.carboidratos * 100) / 100;
    total.gorduras = Math.round(total.gorduras * 100) / 100;
    total.proteinas = Math.round(total.proteinas * 100) / 100;

    const novaRefeicao = {
      nome,
      alimentos: itensRefeicao.map(i => ({ nome: i.nome, quantidade: i.qtd })),
      totais: total
    };
    // Salva no backend via API
    fetch(`${API_BASE}/refeicoes.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novaRefeicao)
    })
      .then(resp => {
        if (!resp.ok) throw new Error("Erro ao salvar refeição no backend");
        return resp.json();
      })
      .then(data => {
        // Após salvar no backend, recarrega lista do backend
        carregarRefeicoes().then(() => {
          itensRefeicao = [];
          renderItens();
          renderListaRefeicoes();
          document.getElementById("nome-refeicao-input").value = "";
          // Atualiza a aba Dietas para refletir novas refeições
          renderDietas();
        });
      })
      .catch(err => {
        alert("Erro ao salvar refeição no backend. Verifique sua conexão.");
      });
  };

  // Listar refeições salvas
  // ATENÇÃO: Os totais exibidos abaixo vêm do campo 'totais' salvo em cada refeição,
  // nunca devem ser recalculados a partir dos itens/alimentos!
  function renderListaRefeicoes() {
    const ul = document.getElementById("lista-refeicoes");
    if (refeicoes.length === 0) {
      ul.innerHTML = `<li class="list-item" style="color:var(--text-muted);">Nenhuma refeição salva.</li>`;
      return;
    }
    ul.innerHTML = refeicoes.map((r, idx) => {
      // Sinalizar se algum alimento não existe mais
      const algumInvalido = r.alimentos.some(item => !alimentos.find(a => a.nome === item.nome));
      const t = r.totais || { calorias: 0, carboidratos: 0, gorduras: 0, proteinas: 0 };
      // Gera HTML dos ingredientes
      const ingredientesHtml = r.alimentos && r.alimentos.length
        ? `<ul style="margin:0.5rem 0 0.5rem 1.2rem;padding:0;font-size:0.97em;">
            ${r.alimentos.map(item => {
              const a = alimentos.find(al => al.nome === item.nome);
              const nome = a ? a.nome : `<span style="color:var(--danger);">${item.nome} (removido)</span>`;
              return `<li>${nome} — <b>${item.quantidade}g</b></li>`;
            }).join("")}
          </ul>`
        : `<span style="color:var(--text-muted);font-size:0.97em;">Sem ingredientes salvos.</span>`;
      return `
        <li class="list-item" style="${algumInvalido ? 'text-decoration:line-through;color:var(--danger);' : ''}">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;cursor:pointer;" class="refeicao-header" data-idx="${idx}">
            <b>${r.nome}</b>
            <span style="font-size:1.2em;user-select:none;" class="toggle-ingredientes" data-idx="${idx}">▼</span>
          </div>
          <div style="font-size:0.97em;">
            ${Math.round(t.calorias)} kcal, 
            ${Math.round(t.carboidratos * 10) / 10}g carb, 
            ${Math.round(t.gorduras * 10) / 10}g gord, 
            ${Math.round(t.proteinas * 10) / 10}g prot
          </div>
          <div class="ingredientes-refeicao" id="ingredientes-refeicao-${idx}" style="display:none;">
            <div style="margin-top:0.3rem;"><b>Ingredientes:</b></div>
            ${ingredientesHtml}
          </div>
          <button data-idx="${idx}" class="btn-remove-refeicao" style="background:var(--danger);color:#fff;padding:0.2rem 0.7rem;font-size:0.9rem;margin-top:0.5rem;">Remover</button>
        </li>
      `;
    }).join("");
    // Toggle ingredientes (expandir/recolher)
    ul.querySelectorAll(".refeicao-header, .toggle-ingredientes").forEach(el => {
      el.onclick = () => {
        const idx = el.getAttribute("data-idx");
        const div = document.getElementById(`ingredientes-refeicao-${idx}`);
        if (div) {
          const aberto = div.style.display !== "none";
          div.style.display = aberto ? "none" : "";
          // Alterna seta
          const seta = ul.querySelector(`.toggle-ingredientes[data-idx="${idx}"]`);
          if (seta) seta.textContent = aberto ? "▼" : "▲";
        }
      };
    });

    // Remover refeição
    ul.querySelectorAll(".btn-remove-refeicao").forEach(btn => {
      btn.onclick = () => {
        let refeicoes = carregarLocal(STORAGE_KEYS.REFEICOES);
        const idx = parseInt(btn.getAttribute("data-idx"));
        const nomeRemovido = refeicoes[idx]?.nome;
        if (!nomeRemovido) return;

        // Chamada à API para remover a refeição
        fetch(`${API_BASE}/refeicoes.json?nome=${encodeURIComponent(nomeRemovido)}`, {
          method: "DELETE"
        })
          .then(resp => {
            if (!resp.ok) throw new Error("Erro ao remover refeição no backend");
            // Após remover no backend, recarrega lista do backend
            return carregarRefeicoes();
          })
          .then(() => {
            // Remover referências dessa refeição em todas as dietas (local)
            let dietas = carregarLocal(STORAGE_KEYS.DIETAS);
            let alterou = false;
            dietas.forEach(dieta => {
              Object.keys(dieta.dias || {}).forEach(dia => {
                const origLen = dieta.dias[dia].length;
                dieta.dias[dia] = dieta.dias[dia].filter(nome => nome !== nomeRemovido);
                if (dieta.dias[dia].length !== origLen) alterou = true;
              });
            });
            if (alterou) salvarLocal(STORAGE_KEYS.DIETAS, dietas);

            renderListaRefeicoes();
            // Atualiza a aba Dietas para refletir remoção de refeições
            renderDietas();
          })
          .catch(err => {
            alert("Erro ao remover refeição no backend. Verifique sua conexão.");
          });
      };
    });
  }

  renderItens();
  renderListaRefeicoes();

  // Adicionar novo alimento à base
  document.getElementById("form-novo-alimento").onsubmit = e => {
    e.preventDefault();
    const nome = document.getElementById("novo-nome").value.trim();
    const calorias = parseFloat(document.getElementById("novo-calorias").value);
    const carboidratos = parseFloat(document.getElementById("novo-carboidratos").value);
    const gorduras = parseFloat(document.getElementById("novo-gorduras").value);
    const proteinas = parseFloat(document.getElementById("novo-proteinas").value);
    if (!nome || isNaN(calorias) || isNaN(carboidratos) || isNaN(gorduras) || isNaN(proteinas)) {
      alert("Preencha todos os campos corretamente.");
      return;
    }
    if (alimentos.some(a => a.nome.toLowerCase() === nome.toLowerCase())) {
      alert("Já existe um alimento com esse nome.");
      return;
    }
    const novoAlimento = { nome, calorias, carboidratos, gorduras, proteinas };
    // Salva no backend via API
    fetch(`${API_BASE}/alimentos.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoAlimento)
    })
      .then(resp => {
        if (!resp.ok) throw new Error("Erro ao salvar alimento no backend");
        return resp.json();
      })
      .then(data => {
        alimentos.push(novoAlimento);
        // Atualiza datalist
        document.getElementById("alimentos-list").innerHTML = alimentos.map(a => `<option value="${a.nome}">`).join("");
        document.getElementById("form-novo-alimento").reset();
        alert("Alimento adicionado com sucesso!");
      })
      .catch(err => {
        alert("Erro ao salvar alimento no backend. Verifique sua conexão.");
      });
  };
}

/**
 * Exporta um array de dietas para um arquivo JSON para download.
 */
function exportarDietasParaJSON() {
  let dietas = carregarLocal(STORAGE_KEYS.DIETAS);
  exportarParaJSON("dietas.json", dietas);
}

// =====================
// Renderização de Dietas (esqueleto)
// =====================
function renderDietas() {
  const sec = document.getElementById("dietas-section");
  const alimentosBase = carregarLocal(STORAGE_KEYS.ALIMENTOS);
  const refeicoesBase = carregarLocal(STORAGE_KEYS.REFEICOES);

  sec.innerHTML = `
    <h2>Criar Dieta</h2>
    <form id="form-dieta" autocomplete="off" style="margin-bottom:1.2rem;">
      <input id="nome-dieta-input" placeholder="Nome da dieta" maxlength="32" required style="margin-bottom:0.7rem;"/>
      <div id="seletores-dieta"></div>
      <button type="submit" class="btn" style="margin-top:1rem;">Salvar Dieta</button>
    </form>
    <h3>Dietas Salvas</h3>
    <ul id="lista-dietas" class="list"></ul>
  `;

  // Renderiza apenas o seletor de refeições
  function renderSeletores() {
    const div = document.getElementById("seletores-dieta");
    div.innerHTML = `
      <label for="refeicoes-dieta-select" style="display:block;margin-bottom:0.3rem;">Selecione as refeições para esta dieta:</label>
      <select id="refeicoes-dieta-select" multiple size="4" style="width:100%;min-width:180px;">
        ${refeicoesBase.map(r => `<option value="${r.nome}">${r.nome}</option>`).join("")}
      </select>
    `;
  }

  // Inicializa seletor de refeições
  renderSeletores();

  // Salvar dieta
  document.getElementById("form-dieta").onsubmit = e => {
    e.preventDefault();
    const nome = document.getElementById("nome-dieta-input").value.trim();
    if (!nome) {
      alert("Dê um nome para a dieta.");
      return;
    }
    let dietas = carregarLocal(STORAGE_KEYS.DIETAS);
    if (dietas.some(d => d.nome === nome)) {
      alert("Já existe uma dieta com esse nome.");
      return;
    }
    // Coletar refeições selecionadas
    const select = document.getElementById("refeicoes-dieta-select");
    const refeicoesSelecionadas = Array.from(select.selectedOptions).map(opt => opt.value);
    if (refeicoesSelecionadas.length === 0) {
      alert("Selecione pelo menos uma refeição para a dieta.");
      return;
    }
    dietas.push({ nome, tipo: "refeicoes", refeicoes: refeicoesSelecionadas });
    salvarLocal(STORAGE_KEYS.DIETAS, dietas);
    renderListaDietas();
    document.getElementById("form-dieta").reset();
    renderSeletores();
  };

  // Listar dietas salvas
  function renderListaDietas() {
    const ul = document.getElementById("lista-dietas");
    let dietas = carregarLocal(STORAGE_KEYS.DIETAS);
    let refeicoes = carregarLocal(STORAGE_KEYS.REFEICOES);
    let alimentos = carregarLocal(STORAGE_KEYS.ALIMENTOS);
    if (dietas.length === 0) {
      ul.innerHTML = `<li class="list-item" style="color:var(--text-muted);">Nenhuma dieta salva.</li>`;
      return;
    }
    ul.innerHTML = dietas
      .filter(d => typeof d.nome === "string" && Array.isArray(d.refeicoes))
      .map((d, idx) => {
        // Dieta criada por refeições
        let total = { calorias: 0, carboidratos: 0, gorduras: 0, proteinas: 0 };
        let refeicoesHtml = d.refeicoes.map(nomeRef => {
          const r = refeicoes.find(rf => rf.nome === nomeRef);
          if (!r) return `<span style="text-decoration:line-through;color:var(--danger);">[Refeição não encontrada: ${nomeRef}]</span>`;
          if (r.totais) {
            total.calorias += r.totais.calorias || 0;
            total.carboidratos += r.totais.carboidratos || 0;
            total.gorduras += r.totais.gorduras || 0;
            total.proteinas += r.totais.proteinas || 0;
          }
          return `<li style="margin-bottom:0.2rem;">${r.nome}</li>`;
        }).join("");
        return `
          <li class="list-item" style="margin-bottom:1.1rem;">
            <b>${d.nome}</b> <span style="font-size:0.92em;color:var(--text-muted);">(por refeições)</span>
            <div>
              <ul style="margin:0.5rem 0 0.5rem 1.2rem;padding:0;">
                ${refeicoesHtml}
              </ul>
              <div style="font-size:0.97em;">
                <b>Total:</b> ${Math.round(total.calorias)} kcal, 
                ${Math.round(total.carboidratos * 10) / 10}g carb, 
                ${Math.round(total.gorduras * 10) / 10}g gord, 
                ${Math.round(total.proteinas * 10) / 10}g prot
              </div>
            </div>
            <button data-idx="${idx}" class="btn-remove-dieta" style="background:var(--danger);color:#fff;padding:0.2rem 0.7rem;font-size:0.9rem;margin-top:0.5rem;">Remover</button>
          </li>
        `;
      }).join("");
    // Remover dieta
    ul.querySelectorAll(".btn-remove-dieta").forEach(btn => {
      btn.onclick = () => {
        let dietas = carregarLocal(STORAGE_KEYS.DIETAS);
        const idx = parseInt(btn.getAttribute("data-idx"));
        dietas.splice(idx, 1);
        salvarLocal(STORAGE_KEYS.DIETAS, dietas);
        renderListaDietas();
      };
    });
  }

  renderListaDietas();
}
