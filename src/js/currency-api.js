const baseUrlReq = "https://currency-cache.cerealmx.workers.dev/latest"

async function requestCurrencies(baseCurrency, currencies, onSuccess, onError) {
  try {
    const urlReq =
      baseUrlReq +
      "?base=" + encodeURIComponent(baseCurrency) +
      "&currencies=" + encodeURIComponent(currencies.join(","));

    const response = await fetch(urlReq);
    if (!response.ok) throw new Error(`Error HTTP ${response.status}`);

    const data = await response.json();
    onSuccess(data);
  } catch (error) {
    onError(error);
  }
}

module.exports = { requestCurrencies }
