# Utility Dashboard

A lightweight dashboard containing multiple free web tools:

- Weather Forecast (OpenWeather key required)
- QR Code Generator
- IP Address Lookup
- Currency Converter
- Dictionary / Thesaurus
- Wikipedia Summary Finder
- Page Speed Auditor
- Language Translator
- Movie Info Lookup (OMDb key required)
- Random Joke Generator

## Run locally

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Notes

- Some APIs may enforce rate limits or temporary restrictions.
- OpenWeather and OMDb require user-provided API keys.
- IP-API free endpoint is HTTP-only and may fail under strict HTTPS contexts.
