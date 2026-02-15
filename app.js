const $ = (id) => document.getElementById(id);

const safeJson = async (res) => {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

const setText = (id, value) => {
  $(id).textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
};

const healthApis = [
  { name: 'OpenWeather', url: 'https://api.openweathermap.org/data/2.5/weather?q=Chicago,US&appid=demo' },
  { name: 'QRServer', url: 'https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=health' },
  { name: 'IP-API', url: 'http://ip-api.com/json/' },
  { name: 'DictionaryAPI', url: 'https://api.dictionaryapi.dev/api/v2/entries/en/test' },
  { name: 'Wikipedia', url: 'https://en.wikipedia.org/api/rest_v1/page/summary/Wikipedia' },
  { name: 'PageSpeed', url: 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://example.com' },
  { name: 'LibreTranslate', url: 'https://libretranslate.de/languages' },
  { name: 'OMDb', url: 'https://www.omdbapi.com/?apikey=demo&t=Inception' },
  { name: 'DadJoke', url: 'https://icanhazdadjoke.com/' }
];

$('health-check-btn').addEventListener('click', async () => {
  const root = $('health-results');
  root.innerHTML = '';

  for (const api of healthApis) {
    const card = document.createElement('div');
    card.className = 'status-card';
    card.textContent = `${api.name}: checking...`;
    root.appendChild(card);

    try {
      const res = await fetch(api.url, { headers: { Accept: 'application/json' } });
      const type = res.ok ? 'status-ok' : 'status-warn';
      card.classList.add(type);
      card.textContent = `${api.name}: ${res.status} ${res.statusText}`;
    } catch (e) {
      card.classList.add('status-fail');
      card.textContent = `${api.name}: failed (${e.message})`;
    }
  }
});

$('weather-btn').addEventListener('click', async () => {
  const key = $('weather-key').value.trim();
  const city = $('weather-city').value.trim();
  if (!key || !city) return setText('weather-output', 'Enter API key and city.');

  try {
    const [current, forecast] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},US&units=metric&appid=${key}`).then(safeJson),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)},US&units=metric&appid=${key}`).then(safeJson)
    ]);

    const next3Days = forecast.list.filter((entry) => entry.dt_txt.includes('12:00:00')).slice(0, 3).map((d) => ({
      date: d.dt_txt.split(' ')[0],
      tempC: d.main.temp,
      description: d.weather[0].description
    }));

    setText('weather-output', {
      city: current.name,
      current: {
        tempC: current.main.temp,
        feelsLikeC: current.main.feels_like,
        description: current.weather[0].description
      },
      forecast: next3Days
    });
  } catch (e) {
    setText('weather-output', `Error: ${e.message}`);
  }
});

$('qr-btn').addEventListener('click', () => {
  const data = $('qr-data').value.trim();
  if (!data) return;
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(data)}`;
  $('qr-output').innerHTML = `<img alt="QR Code" src="${src}" />`;
});

$('ip-btn').addEventListener('click', async () => {
  try {
    const data = await fetch('http://ip-api.com/json/?fields=status,message,query,city,country,isp').then(safeJson);
    setText('ip-output', data);
  } catch (e) {
    setText('ip-output', `Error: ${e.message}. If blocked in browser, run over HTTP or replace with another HTTPS IP API.`);
  }
});

$('curr-btn').addEventListener('click', async () => {
  const amount = Number($('curr-amount').value || 1);
  const from = $('curr-from').value.trim().toUpperCase();
  const to = $('curr-to').value.trim().toUpperCase();

  try {
    const data = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`).then(safeJson);
    setText('curr-output', `${data.amount} ${data.base} = ${data.rates[to]} ${to}`);
  } catch (e) {
    setText('curr-output', `Error: ${e.message}`);
  }
});

$('dict-btn').addEventListener('click', async () => {
  const word = $('dict-word').value.trim();
  if (!word) return;

  try {
    const data = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`).then(safeJson);
    const entry = data[0];
    const meanings = entry.meanings.slice(0, 2).map((m) => ({
      partOfSpeech: m.partOfSpeech,
      definitions: m.definitions.slice(0, 2).map((d) => d.definition),
      synonyms: (m.synonyms || []).slice(0, 5)
    }));
    setText('dict-output', { word: entry.word, phonetic: entry.phonetic, meanings });
  } catch (e) {
    setText('dict-output', `Error: ${e.message}`);
  }
});

$('wiki-btn').addEventListener('click', async () => {
  const topic = $('wiki-topic').value.trim();
  if (!topic) return;

  try {
    const data = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`).then(safeJson);
    setText('wiki-output', { title: data.title, summary: data.extract });
  } catch (e) {
    setText('wiki-output', `Error: ${e.message}`);
  }
});

$('speed-btn').addEventListener('click', async () => {
  const url = $('speed-url').value.trim();
  if (!url) return;

  try {
    const data = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=PERFORMANCE&category=SEO`).then(safeJson);
    const categories = data.lighthouseResult.categories;
    setText('speed-output', {
      performance: categories.performance.score * 100,
      seo: categories.seo.score * 100,
      finalUrl: data.lighthouseResult.finalUrl
    });
  } catch (e) {
    setText('speed-output', `Error: ${e.message}`);
  }
});

$('trans-btn').addEventListener('click', async () => {
  const text = $('trans-text').value.trim();
  const source = $('trans-from').value.trim();
  const target = $('trans-to').value.trim();
  if (!text) return;

  try {
    const data = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source, target, format: 'text' })
    }).then(safeJson);
    setText('trans-output', data.translatedText);
  } catch (e) {
    setText('trans-output', `Error: ${e.message}`);
  }
});

$('movie-btn').addEventListener('click', async () => {
  const key = $('movie-key').value.trim();
  const title = $('movie-title').value.trim();
  if (!key || !title) return setText('movie-output', 'Enter OMDb API key and title.');

  try {
    const data = await fetch(`https://www.omdbapi.com/?apikey=${key}&t=${encodeURIComponent(title)}`).then(safeJson);
    if (data.Response === 'False') throw new Error(data.Error);
    setText('movie-output', {
      title: data.Title,
      year: data.Year,
      plot: data.Plot,
      imdbRating: data.imdbRating
    });
  } catch (e) {
    setText('movie-output', `Error: ${e.message}`);
  }
});

$('joke-btn').addEventListener('click', async () => {
  try {
    const data = await fetch('https://icanhazdadjoke.com/', { headers: { Accept: 'application/json' } }).then(safeJson);
    setText('joke-output', data.joke);
  } catch (e) {
    setText('joke-output', `Error: ${e.message}`);
  }
});
