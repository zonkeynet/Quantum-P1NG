# Traduzioni del sito

Pagine tradotte statiche, una cartella per lingua, senza script di terzi: stessa CSP, nessun dato dei visitatori a
servizi esterni, funzionano anche sul mirror IPFS. Le lingue sono le 14 dell'app.

| File | Cosa contiene |
|---|---|
| `build.py` | estrae i testi, controlla le traduzioni, genera le pagine |
| `<pagina>/source.json` | i testi inglesi da tradurre, nell'ordine della pagina (generato) |
| `<pagina>/<lingua>.json` | `{"segments": {inglese: traduzione}, "messages": {...}}` |

Pagine tradotte:

- la home (`docs/index.html` → `docs/<lingua>/`). I suoi link restano relativi (`styles.css`, `assets/...`) perché la
  pagina funziona anche dal mirror IPFS: `build` li porta a `../` nelle copie tradotte. Gli script caricano i loro file
  da `SITE_ROOT` (la cartella di `script.js`), così le stesse copie servono ogni lingua;
- la pagina Pro (`docs/pro/index.html` → `docs/pro/<lingua>/`). Sta sotto `/pro/` perché Cloudflare dà a tutto
  `/pro/` la Content Security Policy del checkout.

`VOICE.md` è il tono del sito: le traduzioni lo seguono e riscrivono gli slogan perché funzionino nella lingua.

## Flusso

```sh
python i18n/build.py extract      # dopo ogni modifica dei testi della pagina inglese
python i18n/build.py check it     # una lingua: mancanti, tag cambiati, segnaposto
python i18n/build.py build        # scrive le pagine tradotte e aggiorna hreflang e menu delle lingue
```

- Un segmento è l'HTML interno della frase intera: i tag interni restano (possono spostarsi), le icone sono
  `{{1}}`, `{{2}}`. Una traduzione con tag diversi non viene usata: resta l'inglese e `build` lo segnala.
- `messages` sono i testi che scrivono gli script della pagina (`t("...")` in `pro.js`, `T('...')` negli script della
  home), con segnaposto `{nome}`: arrivano alla pagina in un blocco JSON che non si esegue.
- Non si traducono gli identificatori: etichette con `_`, codici tra `[...]`, `0x..`, sigle di tre lettere.
- La pagina inglese contiene i segnaposto `<!-- i18n:alternates -->`, `<!-- i18n:switcher -->` e
  `<!-- i18n:messages -->`, riempiti da `build`.
- Le pagine tradotte non si modificano a mano: si rigenerano.

## Scelta della lingua

Il worker del sito (`Q-P1NG/tools/site-worker`) manda chi apre `/` o `/pro/` alla lingua del browser; il menu delle lingue
usa `?lang=xx`, che salva la scelta in un cookie per un anno. I motori di ricerca ricevono l'inglese e trovano le altre
versioni con `hreflang`.

## Aggiungere una pagina

Una voce in `PAGES` di `build.py`, i tre segnaposto nella pagina inglese, link assoluti (`/...`) nella pagina oppure
`"relative": True` se la pagina sta nella radice, il percorso in `TRANSLATED` del worker del sito (da pubblicare dopo
le pagine tradotte, o rimanda a indirizzi che ancora non esistono). Le pagine legali tradotte devono dire quale versione prevale.
