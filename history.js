
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");
  const historyContainer = document.getElementById("historyContainer");
  const historyEmpty = document.getElementById("historyEmpty");

  function render() {
    const term = normalizeText(searchInput.value);
    const history = loadHistory();
    const filtered = !term
      ? history
      : history.filter((record) =>
          record.items.some((item) => normalizeText(item.productName).includes(term))
        );

    historyContainer.innerHTML = "";

    if (!filtered.length) {
      historyEmpty.classList.remove("hidden");
      return;
    }

    historyEmpty.classList.add("hidden");

    filtered.forEach((record) => {
      const items = [...record.items].sort((a, b) => a.unitCost - b.unitCost);
      const best = items[0];
      const costLabel = best.unit === "litro" ? "Menor custo por litro" : "Menor custo por kilo";
      const date = new Date(record.createdAt);
      const productsLine = [...new Set(items.map(i => i.productName))].join(", ");

      const card = document.createElement("article");
      card.className = "history-card";
      card.innerHTML = `
        <div class="history-header">
          <div>
            <h3>${escapeHtml(productsLine || "Comparação")}</h3>
            <div class="history-sub">${date.toLocaleString("pt-BR")}</div>
          </div>
          <div class="rank-pill">${items.length} item(ns)</div>
        </div>

        <div class="summary-grid">
          <div class="summary-box">
            <div class="label">Produto vencedor</div>
            <div class="value">${escapeHtml(best.productName)}</div>
          </div>
          <div class="summary-box">
            <div class="label">${costLabel}</div>
            <div class="value">${formatCurrency(best.unitCost)}/${best.unit === "litro" ? "L" : "Kg"}</div>
          </div>
          <div class="summary-box">
            <div class="label">Economia máxima</div>
            <div class="value">${getMaxSavingsText(items)}</div>
          </div>
        </div>

        <details>
          <summary>Ver itens desta comparação</summary>
          <div class="history-items">
            ${items.map((item, index) => `
              <div class="history-item ${index === 0 ? "best" : ""}">
                ${index === 0 ? '<span class="badge">Mais vantajoso</span>' : ''}
                <div><strong>Produto:</strong> ${escapeHtml(item.productName)}</div>
                <div><strong>Peso/Volume:</strong> ${item.displayAmount}</div>
                <div><strong>Preço:</strong> ${item.displayPrice}</div>
                ${item.storeName ? `<div><strong>Estabelecimento:</strong> ${escapeHtml(item.storeName)}</div>` : ""}
                <div><strong>Custo por ${item.unit === "litro" ? "litro" : "kilo"}:</strong> ${formatCurrency(item.unitCost)}/${item.unit === "litro" ? "L" : "Kg"}</div>
              </div>
            `).join("")}
          </div>
        </details>
      `;
      historyContainer.appendChild(card);
    });
  }

  function getMaxSavingsText(items) {
    if (items.length < 2) return "—";
    const best = items[0].unitCost;
    const worst = items[items.length - 1].unitCost;
    const percent = ((worst - best) / worst) * 100;
    return formatPercent(percent);
  }

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    render();
  });

  clearHistoryBtn.addEventListener("click", () => {
    if (!confirm("Deseja apagar todo o histórico deste celular?")) return;
    clearAllHistory();
    render();
  });

  searchInput.addEventListener("input", render);
  render();
});

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatPercent(value) {
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
