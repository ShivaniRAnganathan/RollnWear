/* Pure shop logic: stock display, validation, and the WhatsApp link.
   No page elements in this file, so it can be tested on its own. */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.Shop = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var SIZE_ORDER = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
  var MAX_QTY = 10;

  function sizeCount(item, size) {
    var sizes = item && item.sizes ? item.sizes : {};
    var n = Number(sizes[size]);
    return Number.isFinite(n) ? n : 0;
  }

  function totalStock(item) {
    var sizes = item && item.sizes ? item.sizes : {};
    return Object.keys(sizes).reduce(function (sum, size) {
      return sum + Math.max(0, sizeCount(item, size));
    }, 0);
  }

  function isForSale(item) {
    return totalStock(item) > 0;
  }

  function isLastFew(item, threshold) {
    var limit = Number(threshold);
    if (!Number.isFinite(limit)) limit = 3;
    var total = totalStock(item);
    return total > 0 && total <= limit;
  }

  function availableSizes(item) {
    var sizes = item && item.sizes ? item.sizes : {};
    return Object.keys(sizes)
      .filter(function (size) {
        return sizeCount(item, size) > 0;
      })
      .sort(function (a, b) {
        var ia = SIZE_ORDER.indexOf(a);
        var ib = SIZE_ORDER.indexOf(b);
        if (ia === -1 && ib === -1) return a.localeCompare(b);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      });
  }

  function itemLabel(item) {
    var design = (item && item.design) || "Tee";
    if (item && item.colour) return design + " — " + item.colour;
    return design;
  }

  function formatInr(amount) {
    var n = Math.round(Number(amount));
    if (!Number.isFinite(n)) return "Rs —";
    var body = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return (n < 0 ? "-Rs " : "Rs ") + body;
  }

  function parseQuantity(value) {
    var text = String(value == null ? "" : value).trim();
    if (text === "") return { empty: true };
    if (!/^\d+$/.test(text)) return { invalid: true };
    return { value: Number(text) };
  }

  function fillTemplate(template, vars) {
    return String(template == null ? "" : template).replace(
      /\{([a-zA-Z0-9_]+)\}/g,
      function (_, key) {
        if (vars && Object.prototype.hasOwnProperty.call(vars, key) && vars[key] != null) {
          return String(vars[key]);
        }
        return "";
      }
    );
  }

  function applyTemplate(template, vars) {
    var lines = String(template == null ? "" : template).split("\n");
    var kept = [];
    lines.forEach(function (line) {
      if (line.indexOf("{colour}") !== -1 && !(vars && vars.colour)) return;
      kept.push(fillTemplate(line, vars));
    });
    return kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  function groupByDesign(items) {
    var groups = [];
    (items || []).forEach(function (item, index) {
      if (!isForSale(item)) return;
      var group = null;
      for (var i = 0; i < groups.length; i++) {
        if (groups[i].design === item.design) group = groups[i];
      }
      if (!group) {
        group = { design: item.design, variants: [] };
        groups.push(group);
      }
      group.variants.push({ item: item, index: index });
    });
    return groups;
  }

  function buildWhatsAppUrl(number, text) {
    var digits = String(number == null ? "" : number).replace(/[^\d]/g, "");
    return "https://wa.me/" + digits + "?text=" + encodeURIComponent(String(text == null ? "" : text));
  }

  function orderVars(fields, item, totalText) {
    var note = String((fields && fields.note) || "").replace(/\r\n/g, "\n").trim();
    var quantity = fields && fields.quantity != null ? String(fields.quantity).trim() : "";
    return {
      name: String((fields && fields.name) || "").trim(),
      design: item && item.design ? item.design : "",
      colour: item && item.colour ? String(item.colour).trim() : "",
      size: String((fields && fields.size) || "").trim(),
      quantity: quantity,
      total: totalText,
      city: String((fields && fields.city) || "").trim(),
      pincode: String((fields && fields.pincode) || "").trim(),
      source: String((fields && fields.source) || "").trim(),
      note: note || "—",
    };
  }

  function validateOrder(input, item, options) {
    var opts = options || {};
    var maxQty = opts.maxQty || MAX_QTY;
    var sources = opts.sources || null;
    var errors = {};
    var fields = input || {};
    var name = String(fields.name || "").trim();
    var city = String(fields.city || "").trim();
    var pincode = String(fields.pincode || "").trim();
    var source = String(fields.source || "").trim();
    var note = String(fields.note || "");
    var size = String(fields.size || "").trim();
    var parsed = parseQuantity(fields.quantity);
    var quantity = null;

    if (name.length < 2) errors.name = "name";
    if (city.length < 2) errors.city = "city";
    if (!/^[1-9][0-9]{5}$/.test(pincode)) errors.pincode = "pincode";
    if (!source || (sources && sources.indexOf(source) === -1)) errors.source = "source";
    if (note.trim().length > 500) errors.note = "note";

    if (parsed.empty || (parsed.value != null && parsed.value < 1)) errors.quantity = "quantity";
    else if (parsed.invalid) errors.quantity = "quantityWhole";
    else if (parsed.value > maxQty) errors.quantity = "quantityCap";
    else quantity = parsed.value;

    if (!item) {
      errors.design = "design";
    } else if (!size || availableSizes(item).indexOf(size) === -1) {
      errors.size = size && sizeCount(item, size) <= 0 ? "sizeGone" : "size";
    } else if (quantity != null && quantity > sizeCount(item, size)) {
      if (!errors.quantity) errors.quantity = "quantityStock";
    }

    var price = Number(opts.priceInr);
    var total = quantity != null && Number.isFinite(price) ? quantity * price : null;

    return {
      ok: Object.keys(errors).length === 0,
      errors: errors,
      quantity: quantity,
      total: total,
    };
  }

  return {
    MAX_QTY: MAX_QTY,
    sizeCount: sizeCount,
    totalStock: totalStock,
    isForSale: isForSale,
    isLastFew: isLastFew,
    availableSizes: availableSizes,
    itemLabel: itemLabel,
    formatInr: formatInr,
    parseQuantity: parseQuantity,
    fillTemplate: fillTemplate,
    applyTemplate: applyTemplate,
    groupByDesign: groupByDesign,
    buildWhatsAppUrl: buildWhatsAppUrl,
    orderVars: orderVars,
    validateOrder: validateOrder,
  };
});
