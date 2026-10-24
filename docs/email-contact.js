// Reduce passive email harvesting. This is obfuscation, not access control: a bot can also activate these links.
// Keep addresses out of the initial DOM. The first activation reveals a normal, copyable mail link;
// the next activation opens the visitor's email application. No network request or tracking is involved.
(function () {
  "use strict";

  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("a[data-email]");
    if (!link || link.hasAttribute("data-email-revealed")) return;
    var mailbox = link.getAttribute("data-email");
    if (mailbox !== "support" && mailbox !== "legal") return;

    event.preventDefault();
    var address = mailbox + String.fromCharCode(64) + ["qp1ng", "com"].join(".");
    var parameters = [];
    ["subject", "body"].forEach(function (name) {
      var value = link.getAttribute("data-email-" + name);
      if (value) parameters.push(name + "=" + encodeURIComponent(value));
    });
    link.href = "mailto:" + address + (parameters.length ? "?" + parameters.join("&") : "");
    link.textContent = address;
    link.setAttribute("data-email-revealed", "");
    link.removeAttribute("aria-label");
  });
})();
