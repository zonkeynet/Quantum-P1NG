// Q-P1NG Pro checkout: card through Paddle, Bitcoin through the licence API, licence recovery and downloads.
// The licence API (Q-P1NG/tools/license-worker) says which payments are open; nothing here holds a secret.
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
  var paddleReady = null;
  var pollTimer = null;

  // Per-browser conveniences only (a pending claim or order); everything works without them.
  function remember(key, value) {
    try { if (value == null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch (e) { /* private mode */ }
  }
  function recall(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

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
      button.textContent = "Copied";
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
    reveal($("licence"));
  }

  // ---- Payment options -------------------------------------------------------------------------------------------

  function updateButtons() {
    var agreed = $("consent").checked;
    $("pay-card").disabled = !(config && config.paddle && agreed);
    $("pay-btc").disabled = !(config && config.btc && agreed);
  }

  function describeOptions() {
    var notes = [];
    $("card-state").textContent = config ? (config.paddle ? "" : "Soon") : "";
    $("btc-state").textContent = config ? (config.btc ? (config.btc.network !== "mainnet" ? "Testnet" : "") : "Soon") : "";
    if (!config) notes.push("Payments could not be loaded. Check your connection and reload the page.");
    else if ((config.paddle || config.btc) && !$("consent").checked) notes.push("Tick the box above to choose how to pay.");
    $("pay-note").textContent = notes.join(" ");
  }

  function showPrice() {
    if (!config || !/^\d+\.\d{2}$/.test(config.priceEur || "")) return;
    var items = document.querySelectorAll("[data-price]");
    for (var i = 0; i < items.length; i++) items[i].textContent = "\u20ac" + config.priceEur;
  }

  // ---- Card (Paddle) ---------------------------------------------------------------------------------------------

  function loadPaddle() {
    if (paddleReady) return paddleReady;
    paddleReady = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      script.onload = function () {
        if (config.paddle.environment === "sandbox") window.Paddle.Environment.set("sandbox");
        window.Paddle.Initialize({
          token: config.paddle.token,
          eventCallback: function (event) {
            if (event && event.name === "checkout.completed") {
              window.Paddle.Checkout.close();
              waitForClaim(recall("qp1ng_claim"));
            } else if (event && event.name === "checkout.error") {
              $("pay-note").textContent = "Card payment is not available right now. Please try again later, or pay with Bitcoin.";
            }
          }
        });
        resolve(window.Paddle);
      };
      script.onerror = function () { paddleReady = null; reject(new Error("Paddle could not be loaded")); };
      document.head.appendChild(script);
    });
    return paddleReady;
  }

  function payByCard() {
    var claim = randomToken();
    remember("qp1ng_claim", claim);
    loadPaddle().then(function (paddle) {
      paddle.Checkout.open({
        items: [{ priceId: config.paddle.priceId, quantity: 1 }],
        customData: { claim: claim },
        settings: { displayMode: "overlay", variant: "one-page", theme: "dark" }
      });
    }, function (error) {
      $("pay-note").textContent = error.message + ". Check that no blocker stops cdn.paddle.com.";
    });
  }

  /** Paddle's webhook issues the licence; this asks for it with the claim token passed to the checkout. */
  function waitForClaim(claim) {
    if (!claim) return;
    $("claim-wait").hidden = false;
    var tries = 0;
    clearInterval(pollTimer);
    var ask = function () {
      tries++;
      api("/v1/licences/claim/" + claim).then(function (body) {
        if (body.licence) {
          clearInterval(pollTimer);
          remember("qp1ng_claim", null);
          showLicence(body.licence);
        } else if (tries > 100) clearInterval(pollTimer);
      }, function () {});
    };
    ask();
    pollTimer = setInterval(ask, 3000);
  }

  // ---- Bitcoin ---------------------------------------------------------------------------------------------------

  function payWithBitcoin() {
    var button = $("pay-btc");
    button.disabled = true;
    $("pay-note").textContent = "Preparing the order (a few seconds of work on this device)…";
    api("/v1/challenge").then(function (challenge) {
      if (!challenge.challenge) throw new Error(challenge.error || "No challenge");
      return window.QP1NGPow.solve(challenge.challenge, challenge.difficulty).then(function (nonce) {
        return api("/v1/btc/orders", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ challenge: challenge.challenge, nonce: nonce, consent: true })
        });
      });
    }).then(function (order) {
      if (!order.token) throw new Error(order.error || "The order could not be created");
      remember("qp1ng_order", order.token);
      history.replaceState(null, "", "#order=" + order.token);
      describeOptions();
      showOrder(order.token, order, true);
    }).catch(function (error) {
      $("pay-note").textContent = "Bitcoin order failed: " + error.message.toLowerCase() + ".";
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
        timer.textContent = "Rate expired";
        timer.classList.add("is-over");
        clearInterval(timerTick);
        return;
      }
      var h = Math.floor(left / 3600), m = Math.floor((left % 3600) / 60), s = left % 60;
      timer.textContent = "Rate held \u00b7 " + h + ":" + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
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
    $("btc-eur").textContent = due === order.amountSats && order.priceEur ? "\u2248 \u20ac" + order.priceEur : "";
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
        setStatus(status, "Payment confirmed.", "ok");
        clearInterval(pollTimer);
        remember("qp1ng_order", null);
        if (order.licence) showLicence(order.licence);
        break;
      case "seen":
        setStatus(status, "Payment seen on the network. Waiting for one confirmation…");
        break;
      case "underpaid":
        setStatus(status, "Received " + btc(order.receivedSats) + " BTC. Send the remaining " + btc(due) + " BTC to the same address.", "error");
        break;
      case "expired":
        setStatus(status, "This order has expired without a payment. If you have just paid, the payment is still recognised for two weeks; otherwise start a new order.", "error");
        break;
      default:
        setStatus(status, "Waiting for the payment\u2026");
    }
  }

  function refreshOrder(token) {
    return api("/v1/btc/orders/" + token).then(function (order) {
      if (order.httpStatus === 404) {
        clearInterval(pollTimer);
        remember("qp1ng_order", null);
        $("btc-order").hidden = true;
        $("pay-note").textContent = "That order no longer exists.";
        return;
      }
      if (order.address) renderOrder(token, order);
    }, function () {});
  }

  // ---- Recovery and downloads ------------------------------------------------------------------------------------

  function recover() {
    var txn = $("recover-txn").value.trim();
    var status = $("recover-status");
    if (!/^txn_[0-9a-z]{10,40}$/.test(txn)) return setStatus(status, "That is not a Paddle transaction number.", "error");
    setStatus(status, "Looking it up…");
    api("/v1/licences/txn/" + txn).then(function (body) {
      if (body.licence) {
        setStatus(status, "Found.", "ok");
        showLicence(body.licence);
      } else setStatus(status, "No licence for that transaction yet. If you have just paid, try again in a minute; otherwise write to support@qp1ng.com.", "error");
    }, function () { setStatus(status, "The licence service could not be reached.", "error"); });
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
      [["core", "Q-P1NG Core", "Free"], ["pro", "Q-P1NG Pro", "Needs a licence"]].forEach(function (item) {
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
        link.textContent = "Download";
        card.appendChild(meta);
        card.appendChild(link);
        box.appendChild(card);
      });
    }).catch(function () {
      box.innerHTML = '<p class="muted">The first release of the website edition will appear here.</p>';
    });
  }

  // ---- Start -----------------------------------------------------------------------------------------------------

  $("consent").addEventListener("change", function () { updateButtons(); describeOptions(); });
  $("pay-card").addEventListener("click", payByCard);
  $("pay-btc").addEventListener("click", payWithBitcoin);
  $("recover").addEventListener("click", recover);
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
      if (recall("qp1ng_claim") && config && config.paddle) {
        // Back after a card payment: the licence may already be there (independently of any Bitcoin order).
        api("/v1/licences/claim/" + recall("qp1ng_claim")).then(function (body) {
          if (body.licence) { remember("qp1ng_claim", null); showLicence(body.licence); }
        }, function () {});
      }
    });
})();
