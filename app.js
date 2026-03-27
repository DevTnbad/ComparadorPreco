let deferredPrompt = null;
let refreshing = false;

document.addEventListener("DOMContentLoaded", () => {
  const itemsContainer = document.getElementById("itemsContainer");
  const itemTemplate = document.getElementById("itemTemplate");
  const form = document.getElementById("comparisonForm");
  const addItemBtn = document.getElementById("addItemBtn");
  const clearBtn = document.getElementById("clearBtn");
  const emptyState = document.getElementById("emptyState");
  const resultsContainer = document.getElementById("resultsContainer");
  const installBtn = document.getElementById("installBtn");
  const unitError = document.getElementById("unitError");

  addItem();
  addItem();

  addItemBtn.addEventListener("click", () => {
    clearUnitError();
    addItem();
  });

  clearBtn.addEventListener("click", () => {
    itemsContainer.innerHTML = "";
    addItem();
    addItem();
    resultsContainer.innerHTML = "";
    emptyState.classList.remove("hidden");
    clearUnitError();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearUnitError();

    const items = collectItems();

    if (items.length < 2) {
      alert("Adicione pelo menos 2 produtos válidos para comparar.");
      return;
    }

    const hasMixedUnits = validateSameUnit(items);

    if (hasMixedUnits) {
      resultsContainer.innerHTML = "";
      emptyState.classList.remove("hidden");
      showUnitError(
        "Todos os produtos da comparação precisam usar a mesma unidade: ou todos em Litro, ou todos em Kilo."
      );
      return;
    }

    const processed = items
      .map(processItem)
      .sort((a, b) => a.unitCost - b.unitCost);

    enrichSavings(processed);
    renderResults(processed);
    saveComparison(processed);
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    installBtn.classList.remove("hidden");
  });

  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.classList.add("hidden");
  });

  function addItem() {
    const fragment = itemTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".item-card");
    const productInput = fragment.querySelector(".product-name");
    const amountInput = fragment.querySelector(".raw-amount");
    const priceInput = fragment.querySelector(".raw-price");
    const unitSelect = fragment.querySelector(".unit-select");
    const amountPreview = fragment.querySelector(".preview-amount");
    const pricePreview = fragment.querySelector(".preview-price");
    const removeBtn = fragment.querySelector(".remove-btn");

    card.dataset.index = String(itemsContainer.children.length + 1);
    fragment.querySelector(".item-title").textContent = `Item ${
      itemsContainer.children.length + 1
    }`;

    const updateAmountPreview = () => {
      amountPreview.textContent = formatAmountPreview(
        amountInput.value,
        unitSelect.value
      );
    };

    const updatePricePreview = () => {
      pricePreview.textContent = formatCurrencyFromDigits(priceInput.value);
    };

    [amountInput, priceInput].forEach((input) => {
      input.addEventListener("input", () => {
        input.value = onlyDigits(input.value);
        clearUnitError();

        if (input === amountInput) updateAmountPreview();
        if (input === priceInput) updatePricePreview();
      });
    });

    unitSelect.addEventListener("change", () => {
      clearUnitError();
      updateAmountPreview();
    });

    removeBtn.addEventListener("click", () => {
      if (itemsContainer.children.length <= 2) {
        alert("A comparação precisa de pelo menos 2 itens.");
        return;
      }

      card.remove();
      renumberItems();
      clearUnitError();
    });

    itemsContainer.appendChild(fragment);
    updateAmountPreview();
    updatePricePreview();
    productInput.focus();
  }

  function renumberItems() {
    [...itemsContainer.children].forEach((card, index) => {
      card.querySelector(".item-title").textContent = `Item ${index + 1}`;
    });
  }

  function collectItems() {
    const cards = [...itemsContainer.querySelectorAll(".item-card")];

    return cards
      .map((card) => ({
        productName: card.querySelector(".product-name").value.trim(),
        rawAmount: onlyDigits(card.querySelector(".raw-amount").value),
        unit: card.querySelector(".unit-select").value,
        rawPrice: onlyDigits(card.querySelector(".raw-price").value),
        storeName: card.querySelector(".store-name").value.trim()
      }))
      .filter((item) => item.productName && item.rawAmount && item.rawPrice);
  }

  function validateSameUnit(items) {
    const uniqueUnits = [...new Set(items.map((item) => item.unit))];
    return uniqueUnits.length > 1;
  }

  function showUnitError(message) {
    unitError.textContent = message;
    unitError.classList.remove("hidden");
  }

  function clearUnitError() {
    unitError.textContent = "";
    unitError.classList.add("hidden");
  }

  function processItem(item) {
    const amountBase = Number(item.rawAmount) / 1000;
    const price = Number(item.rawPrice) / 100;
    const unitCost = price / amountBase;

    return {
      ...item,
      displayAmount: formatAmountPreview(item.rawAmount, item.unit),
      displayPrice: formatCurrencyFromDigits(item.rawPrice),
      unitLabel: item.unit === "litro" ? "Litro" : "Kilo",
      unitShort: item.unit === "litro" ? "L" : "Kg",
      amountBase,
      price,
      unitCost
    };
  }

  function enrichSavings(items) {
    if (items.length < 2) return;

    const best = items[0];
    const second = items[1];
    const mostExpensive = items[items.length - 1];

    best.savingsMostExpensive = calculateSavings(
      best.unitCost,
      mostExpensive.unitCost
    );

    if (items.length === 2) {
      best.savingsSecond = null;
    } else {
      best.savingsSecond = calculateSavings(best.unitCost, second.unitCost);
    }
  }

  function renderResults(items) {
    resultsContainer.innerHTML = "";
    emptyState.classList.add("hidden");

    items.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "result-card";

      applyHeatColor(card, index, items.length);

      const costLabel =
        item.unit === "litro" ? "Custo por litro" : "Custo por kilo";

      const winnerBadge =
        index === 0 ? `<span class="badge">Mais vantajoso</span>` : "";

      const storeHtml = item.storeName
        ? `<div><strong>Estabelecimento:</strong> ${escapeHtml(
            item.storeName
          )}</div>`
        : "";

      let savingsHtml = "";
      if (index === 0 && typeof item.savingsMostExpensive === "number") {
        if (typeof item.savingsSecond === "number") {
          savingsHtml += `
            <div>Economia vs 2º lugar: ${formatPercent(item.savingsSecond)}</div>
          `;
        }

        savingsHtml += `
          <div>Economia vs mais caro: ${formatPercent(
            item.savingsMostExpensive
          )}</div>
        `;
      }

      card.innerHTML = `
        ${winnerBadge}
        <div class="result-top">
          <h3>${escapeHtml(item.productName)}</h3>
          <span class="rank-pill">${index + 1}º lugar</span>
        </div>

        <div class="meta-list">
          <div><strong>Peso/Volume:</strong> ${item.displayAmount}</div>
          <div><strong>Preço:</strong> ${item.displayPrice}</div>
          ${storeHtml}
          <div><strong>${costLabel}:</strong> ${formatCurrency(item.unitCost)}/${
        item.unitShort
      }</div>
        </div>

        ${savingsHtml ? `<div class="savings">${savingsHtml}</div>` : ""}
      `;

      resultsContainer.appendChild(card);
    });

    const note = document.createElement("div");
    note.className = "install-note";
    note.innerHTML = "A comparação foi salva no histórico deste celular.";
    resultsContainer.appendChild(note);
  }

  function saveComparison(items) {
    const record = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      createdAt: new Date().toISOString(),
      items
    };

    addComparisonToHistory(record);
  }
});

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatCurrencyFromDigits(raw) {
  const digits = onlyDigits(raw);
  const value = digits ? Number(digits) / 100 : 0;
  return formatCurrency(value);
}

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatAmountPreview(rawAmount, unit) {
  const digits = onlyDigits(rawAmount);
  const value = digits ? Number(digits) / 1000 : 0;
  const label = unit === "litro" ? "Litro" : "Kilo";

  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  })} ${label}`;
}

function calculateSavings(bestCost, otherCost) {
  return ((otherCost - bestCost) / otherCost) * 100;
}

function formatPercent(value) {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}%`;
}

function applyHeatColor(card, index, total) {
  const ratio = total <= 1 ? 0 : index / (total - 1);

  let bg = "#effaf1";
  let border = "#90c99f";

  if (ratio === 0) {
    bg = "#effaf1";
    border = "#8fcb9e";
  } else if (ratio < 0.34) {
    bg = "#f7f9e8";
    border = "#d8dc8f";
  } else if (ratio < 0.67) {
    bg = "#fff7e7";
    border = "#f0ca7b";
  } else {
    bg = "#fff0f0";
    border = "#e3aaaa";
  }

  card.style.background = bg;
  card.style.borderColor = border;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        "./service-worker.js"
      );

      registration.update();

      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            newWorker.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    } catch (error) {
      console.error("Erro ao registrar service worker:", error);
    }
  });
}