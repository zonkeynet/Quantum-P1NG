// Q-P1NG Pro checkout: card through a reseller (today FastSpring), Bitcoin through the licence API, licence recovery
// and downloads. The licence API (Q-P1NG/tools/license-worker) says which payments are open and which provider takes
// cards, in one of two modes: "popup" (the provider's script in this page, see POPUPS) or "redirect" (its hosted
// checkout, with no script of the provider here). Nothing here holds a secret.
// Messages are written in English and translated by the JSON block #pro-i18n that the language pages carry
// (i18n/build.py in this repository); the English page has none.
// From the app: /pro/#claim=<token> passes the app's claim token to the card or Bitcoin order, so the app collects
// the key by itself once the payment is confirmed.
(function () {
  "use strict";
  // Served at /pro (no slash), relative paths and the page's security policy would not apply: go to /pro/.
  if (location.pathname === "/pro") {
    location.replace("/pro/" + location.search + location.hash);
    return;
  }
  // ?api=staging talks to the test service (Bitcoin testnet, licences that unlock nothing).
  var API = /[?&]api=staging(&|$)/.test(location.search)
    ? "https://qp1ng-license-api-staging.quantump1ng.workers.dev"
    : "https://qp1ng-license-api.quantump1ng.workers.dev";
  var $ = function (id) { return document.getElementById(id); };
  var config = null;
  var cardReady = null;
  var pollTimer = null;
  var pendingClaim = null; // also kept here: localStorage may be blocked
  // The pinned Store Builder Library, checked by the browser: a changed file does not run (card payments then say so).
  var SBL_URL = "https://sbl.onfastspring.com/sbl/1.0.6/fastspring-builder.min.js";
  var SBL_INTEGRITY = "sha384-AmnCPC7pew3MIsQ1KgO9oQNDaJTpgvkpYTBgFfvm/VPmoxx0Uw08z2imm58+jq2/";
  var CLAIM = /^[A-Za-z0-9_-]{22,64}$/;
  var SUPPORT = ["support", ["qp1ng", "com"].join(".")].join(String.fromCharCode(64));

  var MESSAGES = (function () {
    try { return JSON.parse($("pro-i18n").textContent); } catch (e) { return {}; }
  })();

  /** The message in the page's language; {name} placeholders take the values given. */
  function t(text, values) {
    var out = MESSAGES[text] || text;
    if (values) Object.keys(values).forEach(function (name) { out = out.split("{" + name + "}").join(values[name]); });
    return out;
  }

  // Per-browser conveniences only (a pending claim or order); everything works without them.
  function remember(key, value) {
    try { if (value == null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch (e) { /* private mode */ }
  }
  function recall(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  /** The app's claim token from #claim=..., taken out of the address so it is not shared by accident. */
  var appClaim = (function () {
    var match = /^#claim=([A-Za-z0-9_-]{22,64})$/.exec(location.hash);
    if (match) {
      remember("qp1ng_app_claim", match[1]);
      history.replaceState(null, "", location.pathname + location.search);
      return match[1];
    }
    var stored = recall("qp1ng_app_claim");
    return stored && CLAIM.test(stored) ? stored : null;
  })();

  function api(path, options) {
    return fetch(API + path, options).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (body) {
        body.httpStatus = response.status;
        return body;
      });
    });
  }

  function randomToken() {
    var bytes = crypto.getRandomValues(new Uint8Array(16));
    var binary = "";
    for (var i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function copy(text, button) {
    var done = function () {
      var label = button.textContent;
      button.textContent = t("Copied");
      setTimeout(function () { button.textContent = label; }, 1500);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
  }

  function reveal(element) {
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "center" });
  }

  function btc(sats) {
    return (sats / 1e8).toFixed(8).replace(/0+$/, "").replace(/\.$/, "");
  }

  function setStatus(element, text, kind) {
    element.textContent = text;
    element.className = "status" + (kind ? " " + kind : "");
  }

  function showLicence(licence) {
    $("claim-wait").hidden = true;
    $("licence").hidden = false;
    $("licence-key").textContent = licence;
    $("licence-copy").onclick = function () { copy(licence, $("licence-copy")); };
    $("licence-app").hidden = !appClaim;
    // The app collects this key with its token: a later visit to this page is not "from the app" any more.
    if (appClaim) remember("qp1ng_app_claim", null);
    reveal($("licence"));
  }

  // ---- Payment options -------------------------------------------------------------------------------------------

  function updateButtons() {
    var agreed = $("consent").checked;
    $("pay-card").disabled = !(config && config.card && agreed);
    $("pay-btc").disabled = !(config && config.btc && agreed);
  }

  function describeOptions() {
    var notes = [];
    var cardOpen = Boolean(config && config.card);
    $("card-provider").textContent = cardOpen ? t("Through {provider}, our reseller", { provider: config.card.name }) : t("Coming soon");
    var names = document.querySelectorAll("[data-card-name]");
    for (var n = 0; n < names.length; n++) if (cardOpen) names[n].textContent = config.card.name;
    // Texts that differ while cards are closed or open: the licence API's configuration decides, not this file.
    var variants = document.querySelectorAll("[data-card]");
    for (var i = 0; i < variants.length; i++) variants[i].hidden = (variants[i].getAttribute("data-card") === "on") !== cardOpen;
    $("btc-state").textContent = config ? (config.btc ? (config.btc.network !== "mainnet" ? "Testnet" : "") : t("Soon")) : "";
    if (!config) notes.push(t("Payments could not be loaded. Check your connection and reload the page."));
    else if ((config.card || config.btc) && !$("consent").checked) notes.push(t("Tick the box above to choose how to pay."));
    $("pay-note").textContent = notes.join(" ");
  }

  /** A euro amount as the page's language writes it: €9.99, 9,99 €... */
  function euro(amount) {
    try {
      return new Intl.NumberFormat(document.documentElement.lang || "en", { style: "currency", currency: "EUR" }).format(Number(amount));
    } catch (e) {
      return "€" + amount;
    }
  }

  function showPrice() {
    if (!config || !/^\d+\.\d{2}$/.test(config.priceEur || "")) return;
    var items = document.querySelectorAll("[data-price]");
    for (var i = 0; i < items.length; i++) items[i].textContent = euro(config.priceEur);
  }

  // ---- Card --------------------------------------------------------------------------------------------------------

  /** FastSpring's popup checkout: its Store Builder Library, pinned and checked (SRI), drives an overlay frame. */
  function loadCardCheckout() {
    if (cardReady) return cardReady;
    cardReady = new Promise(function (resolve, reject) {
      // The Store Builder Library reads its settings from its own script tag and calls global functions by name.
      window.qp1ngCardClosed = function (order) {
        // { id, reference } after a purchase, null when the buyer closed the popup without paying.
        if (order && order.reference) {
          remember("qp1ng_card_ref", order.reference);
          waitForClaim(pendingClaim || recall("qp1ng_claim"), order.reference);
        }
      };
      window.qp1ngCardError = function () {
        $("pay-note").textContent = t("Card payment is not available right now. Please try again later, or pay with Bitcoin.");
      };
      var script = document.createElement("script");
      script.id = "fsc-api";
      script.src = SBL_URL;
      script.integrity = SBL_INTEGRITY;
      script.crossOrigin = "anonymous";
      script.setAttribute("data-storefront", config.card.storefront);
      script.setAttribute("data-popup-closed", "qp1ngCardClosed");
      script.setAttribute("data-error-callback", "qp1ngCardError");
      script.onload = function () { resolve(window.fastspring); };
      script.onerror = function () { cardReady = null; script.remove(); reject(new Error("load")); };
      document.head.appendChild(script);
    });
    return cardReady;
  }

  function openFastSpring(claim) {
    loadCardCheckout().then(function (fastspring) {
      fastspring.builder.reset();
      fastspring.builder.push({ products: [{ path: config.card.product, quantity: 1 }], tags: { claim: claim } });
      fastspring.builder.checkout();
    }, function () {
      $("pay-note").textContent = t("The card checkout could not be loaded. Check that no blocker stops {domain}.", { domain: config.card.domain });
    });
  }

  // Providers whose checkout opens over this page. Another provider in "redirect" mode needs no code here.
  var POPUPS = { fastspring: openFastSpring };

  function payByCard() {
    var claim = appClaim || randomToken();
    pendingClaim = claim;
    remember("qp1ng_claim", claim);
    if (config.card.mode === "redirect" && /^https:\/\//.test(config.card.url || "")) {
      // The provider's hosted checkout; it sends the buyer back to /pro/?paid=1, where the key is collected.
      location.assign(config.card.url.split("{claim}").join(encodeURIComponent(claim)));
      return;
    }
    var open = POPUPS[config.card.provider];
    if (open) open(claim);
    else $("pay-note").textContent = t("Card payment is not available right now. Please try again later, or pay with Bitcoin.");
  }

  /**
   * FastSpring's webhook issues the licence; this asks for it with the claim token passed as an order tag. After five
   * minutes it stops and points to the recovery form, filled in with the order reference.
   */
  function waitForClaim(claim, reference) {
    if (!claim) return;
    $("claim-wait").hidden = false;
    if (reference) {
      $("recover-ref").value = reference;
      $("claim-help").textContent = t("This usually takes a few seconds. Your order reference is {reference} (also on your receipt): with it you can recover the key below at any time.", { reference: reference });
    }
    var tries = 0;
    clearInterval(pollTimer);
    var ask = function () {
      tries++;
      api("/v1/licences/claim/" + claim).then(function (body) {
        if (body.licence) {
          clearInterval(pollTimer);
          pendingClaim = null;
          remember("qp1ng_claim", null);
          remember("qp1ng_card_ref", null);
          showLicence(body.licence);
        } else if (body.httpStatus === 410 || tries > 100) {
          clearInterval(pollTimer);
          $("claim-title").textContent = body.httpStatus === 410
            ? t("This licence was refunded.")
            : t("Your payment is confirmed, but the key is taking longer than usual.");
          if (body.httpStatus !== 410) {
            $("claim-help").textContent = reference
              ? t("Recover it below with the order reference {reference} in a few minutes, or write to {support}.", { reference: reference, support: SUPPORT })
              : t("Recover it below with the order reference on your receipt in a few minutes, or write to {support}.", { support: SUPPORT });
          }
        }
      }, function () {});
    };
    ask();
    pollTimer = setInterval(ask, 3000);
  }

  // ---- Bitcoin ---------------------------------------------------------------------------------------------------

  function payWithBitcoin() {
    var button = $("pay-btc");
    button.disabled = true;
    $("pay-note").textContent = t("Preparing the order (a few seconds of work on this device)…");
    api("/v1/challenge").then(function (challenge) {
      if (!challenge.challenge) throw new Error(challenge.error || "NO CHALLENGE");
      return window.QP1NGPow.solve(challenge.challenge, challenge.difficulty).then(function (nonce) {
        var body = { challenge: challenge.challenge, nonce: nonce, consent: true };
        if (appClaim) body.claim = appClaim;
        return api("/v1/btc/orders", {
          method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body)
        });
      });
    }).then(function (order) {
      if (!order.token) throw new Error(order.error || "THE ORDER COULD NOT BE CREATED");
      remember("qp1ng_order", order.token);
      history.replaceState(null, "", "#order=" + order.token);
      describeOptions();
      showOrder(order.token, order, true);
    }).catch(function (error) {
      // The service's own message (in English, upper case) follows the translated sentence.
      $("pay-note").textContent = t("The Bitcoin order failed:") + " " + error.message.toLowerCase() + ".";
    }).then(updateButtons);
  }

  var timerTick = null;

  /** The euro price is held until the order expires: a live countdown in the panel header. */
  function startTimer(expiresAt) {
    clearInterval(timerTick);
    var timer = $("btc-timer");
    var tick = function () {
      var left = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      if (!left) {
        timer.textContent = t("Rate expired");
        timer.classList.add("is-over");
        clearInterval(timerTick);
        return;
      }
      var h = Math.floor(left / 3600), m = Math.floor((left % 3600) / 60), s = left % 60;
      timer.textContent = t("Rate held") + " · " + h + ":" + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
      timer.classList.remove("is-over");
    };
    tick();
    timerTick = setInterval(tick, 1000);
  }

  /** Groups of four characters for reading; selecting or copying gives the address without spaces. */
  function showAddress(element, address) {
    element.textContent = "";
    for (var i = 0; i < address.length; i += 4) {
      var group = document.createElement("span");
      group.className = "grp";
      group.textContent = address.slice(i, i + 4);
      element.appendChild(group);
    }
  }

  function showOrder(token, order, scroll) {
    $("btc-order").hidden = false;
    var link = location.origin + location.pathname + "#order=" + token;
    $("btc-link").textContent = link;
    $("btc-link").href = link;
    $("btc-copy-link").onclick = function () { copy(link, $("btc-copy-link")); };
    renderOrder(token, order);
    clearInterval(pollTimer);
    pollTimer = setInterval(function () { refreshOrder(token); }, 15000);
    if (scroll) reveal($("btc-order"));
  }

  function renderOrder(token, order) {
    var due = Math.max(order.amountSats - (order.receivedSats || 0), 0) || order.amountSats;
    $("btc-amount").textContent = btc(due);
    $("btc-eur").textContent = due === order.amountSats && order.priceEur ? "≈ " + euro(order.priceEur) : "";
    showAddress($("btc-address"), order.address);
    if (order.state === "paid") { clearInterval(timerTick); $("btc-timer").textContent = ""; }
    else if (order.state !== "expired" || !timerTick) startTimer(order.expiresAt);
    $("btc-open").href = order.bip21;
    $("btc-qr").src = API + "/v1/btc/orders/" + token + "/qr.svg?d=" + due;
    $("btc-copy-address").onclick = function () { copy(order.address, $("btc-copy-address")); };
    $("btc-copy-amount").onclick = function () { copy(btc(due), $("btc-copy-amount")); };
    var status = $("btc-status");
    switch (order.state || "awaiting") {
      case "paid":
        clearInterval(pollTimer);
        remember("qp1ng_order", null);
        if (order.refunded) {
          setStatus(status, t("This licence was refunded."), "error");
          break;
        }
        setStatus(status, t("Payment confirmed."), "ok");
        if (order.licence) showLicence(order.licence);
        break;
      case "seen":
        setStatus(status, t("Payment seen on the network. Waiting for one confirmation…"));
        break;
      case "underpaid":
        setStatus(status, t("Received {received} BTC. Send the remaining {due} BTC to the same address.",
          { received: btc(order.receivedSats), due: btc(due) }), "error");
        break;
      case "expired":
        setStatus(status, t("This order has expired without a payment. If you have just paid, the payment is still recognised for two weeks; otherwise start a new order."), "error");
        break;
      default:
        setStatus(status, t("Waiting for the payment…"));
    }
  }

  function refreshOrder(token) {
    return api("/v1/btc/orders/" + token).then(function (order) {
      if (order.httpStatus === 404) {
        clearInterval(pollTimer);
        remember("qp1ng_order", null);
        $("btc-order").hidden = true;
        $("pay-note").textContent = t("That order no longer exists.");
        return;
      }
      if (order.address) renderOrder(token, order);
    }, function () {});
  }

  // ---- Recovery and downloads ------------------------------------------------------------------------------------

  function recover() {
    var reference = $("recover-ref").value.trim().toUpperCase();
    var status = $("recover-status");
    if (!/^[A-Z0-9]{2,24}(-[A-Z0-9]{1,24}){1,4}$/.test(reference)) return setStatus(status, t("That is not an order reference."), "error");
    setStatus(status, t("Looking it up…"));
    api("/v1/licences/order/" + encodeURIComponent(reference)).then(function (body) {
      if (body.licence) {
        setStatus(status, t("Found."), "ok");
        showLicence(body.licence);
      } else if (body.httpStatus === 410) setStatus(status, t("This licence was refunded."), "error");
      else if (body.httpStatus === 429) setStatus(status, t("Too many attempts: try again in a minute."), "error");
      else setStatus(status, t("No licence for that order yet. If you have just paid, try again in a minute; otherwise write to {support}.", { support: SUPPORT }), "error");
    }, function () { setStatus(status, t("The licence service could not be reached."), "error"); });
  }

  function decodePayload(envelope) {
    var text = envelope.payloadBase64Url.replace(/-/g, "+").replace(/_/g, "/");
    var binary = atob(text + "===".slice((text.length + 3) % 4));
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function loadDownloads() {
    var box = $("downloads");
    fetch("/updates/qp1ng-update.json", { cache: "no-cache" }).then(function (response) {
      if (!response.ok) throw new Error("none");
      return response.json();
    }).then(function (envelope) {
      // Shown for convenience; the app itself verifies the signature before it installs anything.
      var manifest = decodePayload(envelope);
      box.textContent = "";
      [["core", "Q-P1NG Core", t("Free")], ["pro", "Q-P1NG Pro", t("Needs a licence")]].forEach(function (item) {
        var build = manifest.editions[item[0]];
        if (!build) return;
        var card = document.createElement("div");
        card.className = "release";
        var meta = document.createElement("div");
        meta.className = "meta";
        var title = document.createElement("strong");
        title.textContent = item[1] + " " + build.versionName;
        var info = document.createElement("span");
        info.className = "muted small";
        info.textContent = item[2] + " · " + Math.round(build.size / 1e6) + " MB";
        var hash = document.createElement("div");
        hash.className = "hash";
        hash.textContent = "SHA-256 " + build.sha256;
        meta.appendChild(title);
        meta.appendChild(info);
        meta.appendChild(hash);
        var link = document.createElement("a");
        link.className = "btn btn-primary";
        link.href = build.url;
        link.textContent = t("Download");
        card.appendChild(meta);
        card.appendChild(link);
        box.appendChild(card);
      });
    }).catch(function () {
      var note = document.createElement("p");
      note.className = "muted";
      note.textContent = t("The first release of the website edition will appear here.");
      box.textContent = "";
      box.appendChild(note);
    });
  }

  // ---- Start -----------------------------------------------------------------------------------------------------

  $("consent").addEventListener("change", function () { updateButtons(); describeOptions(); });
  $("pay-card").addEventListener("click", payByCard);
  $("pay-btc").addEventListener("click", payWithBitcoin);
  $("recover").addEventListener("click", recover);
  $("from-app").hidden = !appClaim;
  loadDownloads();

  api("/v1/config").then(function (body) { config = body.ok ? body : null; }, function () { config = null; })
    .then(function () {
      showPrice();
      describeOptions();
      updateButtons();
      var fromLink = /^#order=([A-Za-z0-9_-]{22})$/.exec(location.hash);
      var token = fromLink ? fromLink[1] : recall("qp1ng_order");
      if (token) {
        api("/v1/btc/orders/" + token).then(function (order) {
          if (order.address) showOrder(token, order, Boolean(fromLink));
          else remember("qp1ng_order", null);
        }, function () {});
      }
      // Back after a payment: the licence may already be there (independently of any Bitcoin order). Back from a
      // hosted checkout (?paid=1): wait for the provider's confirmation as after a popup.
      var claim = recall("qp1ng_claim") || appClaim;
      if (claim && /[?&]paid=1(&|$)/.test(location.search)) waitForClaim(claim);
      else if (claim) {
        api("/v1/licences/claim/" + claim).then(function (body) {
          if (body.licence) { remember("qp1ng_claim", null); showLicence(body.licence); }
        }, function () {});
      }
    });
})();
