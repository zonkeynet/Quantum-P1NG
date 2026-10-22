// 404 page: shows the address that was not found and puts it in the "report" email. External on purpose: under
// /pro/ the security policy forbids inline scripts.
(function () {
  "use strict";
  var path = location.pathname + location.search;
  var shown = path.length > 80 ? path.slice(0, 77) + "..." : path;
  var target = document.getElementById("path");
  if (target) target.textContent = shown;
  var report = document.getElementById("report");
  if (report) {
    report.href = "mailto:support@qp1ng.com?subject=" + encodeURIComponent("Broken link on qp1ng.com") +
      "&body=" + encodeURIComponent("This address was not found: " + location.href + "\n");
  }
})();
