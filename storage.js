
const STORAGE_KEY = "compara_preco_history_v1";

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
    return [];
  }
}

function saveHistory(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function addComparisonToHistory(record) {
  const history = loadHistory();
  history.unshift(record);
  saveHistory(history);
}

function clearAllHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

function normalizeText(text) {
  return (text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
