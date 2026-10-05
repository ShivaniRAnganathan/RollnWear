/* Fills the page from content.js and stock.json. */
(function () {
  var copy = window.SITE_COPY || {};
  var stockData = null;
  var products = [];

  function $(id) {
    return document.getElementById(id);
  }

  function asset(path) {
    return new URL(path, document.baseURI).href;
  }

  function text(id, value) {
    var el = $(id);
    if (el) el.textContent = value == null ? "" : value;
  }

  function applyCopy() {
    document.title = "Roll & Wear — Board-game tees";
    text("hero-kicker", copy.heroKicker);
    text("hero-headline", copy.heroHeadline);
    text("hero-sub", copy.heroSub);
    text("about-kicker", copy.aboutKicker);
    text("about-heading", copy.aboutHeading);
    text("about-body", copy.aboutBody);
    text("tees-heading", copy.teesHeading);
    text("order-heading", copy.orderHeading);
    text("order-intro", copy.orderIntro);
    text("footer-copy", copy.footer);
    text("total-label", copy.totalLabel);
    text("sent-note", copy.sentNote);
    text("size-hint", copy.placeholders && copy.placeholders.sizeHint);
    text("submit-label", copy.submitLabel);
    text("chat-label", copy.chatLabel);

    var igLabel = copy.instagramCta || copy.instagramHandle || "Instagram";
    ["hero-ig", "about-link", "footer-ig"].forEach(function (id) {
      var link = $(id);
      if (!link) return;
      link.href = copy.instagramUrl || link.href;
      link.textContent = id === "about-link" ? copy.aboutLinkLabel || igLabel : igLabel;
    });

    var labels = copy.labels || {};
    Object.keys(labels).forEach(function (key) {
      text("label-" + key, labels[key]);
    });

    var placeholders = copy.placeholders || {};
    setPlaceholder("buyer-name", placeholders.name);
    setPlaceholder("city", placeholders.city);
    setPlaceholder("pincode", placeholders.pincode);
    setPlaceholder("note", placeholders.note);

    var design = $("design");
    if (design && design.options.length) design.options[0].textContent = placeholders.design || "Choose a tee";
    var source = $("source");
    if (source) {
      source.innerHTML = "";
      var first = document.createElement("option");
      first.value = "";
      first.textContent = placeholders.source || "Choose one";
      source.appendChild(first);
      (copy.hearAboutOptions || []).forEach(function (option) {
        var el = document.createElement("option");
        el.value = option;
        el.textContent = option;
        source.appendChild(el);
      });
    }

    var chat = $("chat-link");
    if (chat && window.Shop) {
      chat.href = window.Shop.buildWhatsAppUrl(copy.whatsappNumber, copy.chatPrefill || "");
    }
    var fallback = $("wa-fallback");
    if (fallback) fallback.textContent = copy.fallbackLabel || "Open WhatsApp with this order";
  }

  function setPlaceholder(id, value) {
    var el = $(id);
    if (el && value) el.setAttribute("placeholder", value);
  }

  function meepleSvg() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 64 86");
    svg.setAttribute("aria-hidden", "true");
    svg.classList.add("meeple");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "currentColor");
    path.setAttribute(
      "d",
      "M32 3c7.2 0 13 5.6 13 12.8 0 4.1-1.9 7.2-4.4 9.8 8.8 3.7 14.9 12.2 14.9 22.2v23.4c0 2.2-1.9 3.9-4.1 3.4l-8.2-2.4-3.2 8.2c-.6 1.5-2.1 2.6-3.8 2.6H27.8c-1.7 0-3.2-1.1-3.8-2.6l-3.2-8.2-8.2 2.4c-2.2.5-4.1-1.2-4.1-3.4V47.8c0-10 6.1-18.5 14.9-22.2-2.5-2.6-4.4-5.7-4.4-9.8C19 8.6 24.8 3 32 3z"
    );
    svg.appendChild(path);
    return svg;
  }

  function findEntry(index) {
    for (var i = 0; i < products.length; i++) {
      if (String(products[i].index) === String(index)) return products[i];
    }
    return null;
  }

  function currentItem() {
    var entry = findEntry($("design").value);
    return entry ? entry.item : null;
  }

  function selectedSize() {
    var checked = document.querySelector('input[name="size"]:checked');
    return checked ? checked.value : "";
  }

  function priceText() {
    if (!stockData) return "";
    return window.Shop.formatInr(stockData.priceInr);
  }

  function updateTotal() {
    var el = $("order-total");
    var each = $("each-price");
    if (!stockData || !window.Shop) return;
    var formatted = priceText();
    if (each) each.textContent = window.Shop.fillTemplate(copy.eachLabel || "{price} each", { price: formatted });
    var intro = $("tees-intro");
    if (intro && !intro.dataset.filled) {
      intro.textContent = window.Shop.fillTemplate(copy.teesIntro || "{price}", { price: formatted });
      intro.dataset.filled = "1";
    }
    var parsed = window.Shop.parseQuantity($("quantity").value);
    if (!parsed.value && parsed.value !== 0) {
      el.textContent = "Rs —";
      return;
    }
    if (parsed.invalid || parsed.empty || parsed.value < 1 || parsed.value > window.Shop.MAX_QTY) {
      el.textContent = "Rs —";
      return;
    }
    el.textContent = window.Shop.formatInr(parsed.value * stockData.priceInr);
  }

  function renderSizeChoices(item, preset) {
    var group = $("size-group");
    var hint = $("size-hint");
    group.innerHTML = "";
    if (!item) {
      hint.hidden = false;
      return;
    }
    hint.hidden = true;
    window.Shop.availableSizes(item).forEach(function (size) {
      var label = document.createElement("label");
      label.className = "chip";
      var input = document.createElement("input");
      input.type = "radio";
      input.name = "size";
      input.value = size;
      if (preset && preset === size) input.checked = true;
      input.addEventListener("change", function () {
        markSelectedCard();
      });
      var span = document.createElement("span");
      span.textContent = size;
      label.appendChild(input);
      label.appendChild(span);
      group.appendChild(label);
    });
  }

  function markSelectedCard() {
    var selected = $("design").value;
    document.querySelectorAll(".card").forEach(function (card) {
      card.classList.toggle("is-selected", card.getAttribute("data-index") === selected);
    });
  }

  function chooseProduct(index, size) {
    $("design").value = String(index);
    var entry = findEntry(index);
    renderSizeChoices(entry ? entry.item : null, size || "");
    markSelectedCard();
    var note = $("ordering-note");
    if (note && entry) {
      var label = window.Shop.itemLabel(entry.item) + (size ? ", size " + size : "");
      note.textContent = window.Shop.fillTemplate(copy.orderingNote || "Ordering {label}.", { label: label });
      note.hidden = false;
    }
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    $("order").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    if (size) $("quantity").focus();
  }

  function renderProducts() {
    var catalog = $("catalog");
    var design = $("design");
    catalog.innerHTML = "";
    var placeholder = design.options[0];
    design.innerHTML = "";
    design.appendChild(placeholder);

    if (!products.length) {
      var empty = document.createElement("p");
      empty.className = "catalog-message";
      empty.textContent = copy.catalogEmpty || "Nothing is in stock right now.";
      catalog.appendChild(empty);
      return;
    }

    products.forEach(function (entry) {
      var item = entry.item;
      var option = document.createElement("option");
      option.value = String(entry.index);
      option.textContent = window.Shop.itemLabel(item);
      design.appendChild(option);

      var card = document.createElement("article");
      card.className = "card";
      card.setAttribute("data-index", String(entry.index));

      var photo = document.createElement("div");
      photo.className = "photo";
      if (item.image) {
        var img = document.createElement("img");
        img.src = asset(item.image);
        img.alt = window.Shop.itemLabel(item) + " tee";
        img.loading = "lazy";
        img.decoding = "async";
        img.addEventListener("error", function () {
          photo.innerHTML = "";
          photo.classList.add("placeholder");
          photo.appendChild(meepleSvg());
          var failedName = document.createElement("p");
          failedName.setAttribute("aria-hidden", "true");
          failedName.textContent = item.design;
          photo.appendChild(failedName);
          if (window.Shop.isLastFew(item, stockData.lastFewAt)) photo.appendChild(lastFewBadge());
        });
        photo.appendChild(img);
      } else {
        photo.classList.add("placeholder");
        photo.appendChild(meepleSvg());
        var name = document.createElement("p");
        name.setAttribute("aria-hidden", "true");
        name.textContent = item.design;
        photo.appendChild(name);
      }

      if (window.Shop.isLastFew(item, stockData.lastFewAt)) {
        photo.appendChild(lastFewBadge());
      }

      var body = document.createElement("div");
      body.className = "card-body";
      var heading = document.createElement("h3");
      heading.textContent = item.design;
      body.appendChild(heading);

      var blurbText = copy.blurbs && copy.blurbs[item.design];
      if (blurbText) {
        var blurb = document.createElement("p");
        blurb.className = "blurb";
        blurb.textContent = blurbText;
        body.appendChild(blurb);
      }

      if (item.colour) {
        var colour = document.createElement("p");
        colour.className = "colour";
        colour.textContent = item.colour;
        body.appendChild(colour);
      }

      var price = document.createElement("p");
      price.className = "price";
      price.textContent = priceText();
      body.appendChild(price);

      var sizesLabel = document.createElement("p");
      sizesLabel.className = "sizes-label";
      sizesLabel.textContent = copy.sizesLabel || "Sizes";
      body.appendChild(sizesLabel);

      var sizes = document.createElement("div");
      sizes.className = "size-row";
      window.Shop.availableSizes(item).forEach(function (size) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "chip-button";
        button.textContent = size;
        button.addEventListener("click", function () {
          chooseProduct(entry.index, size);
        });
        sizes.appendChild(button);
      });
      body.appendChild(sizes);

      var orderButton = document.createElement("button");
      orderButton.type = "button";
      orderButton.className = "order-this";
      orderButton.textContent = copy.orderThisLabel || "Order this";
      orderButton.addEventListener("click", function () {
        chooseProduct(entry.index, "");
      });
      body.appendChild(orderButton);

      card.appendChild(photo);
      card.appendChild(body);
      catalog.appendChild(card);
    });
  }

  function lastFewBadge() {
    var badge = document.createElement("p");
    badge.className = "last-few";
    badge.textContent = copy.lastFewLabel || "Last few";
    return badge;
  }

  function clearErrors() {
    document.querySelectorAll(".field-error").forEach(function (el) {
      el.hidden = true;
      el.textContent = "";
    });
    document.querySelectorAll("[aria-invalid='true']").forEach(function (el) {
      el.removeAttribute("aria-invalid");
    });
    var alert = $("form-alert");
    alert.hidden = true;
    alert.textContent = "";
  }

  function showErrors(errors) {
    var messages = copy.errors || {};
    var first = null;
    Object.keys(errors).forEach(function (field) {
      var code = errors[field];
      var el = $("error-" + field);
      if (el) {
        el.hidden = false;
        el.textContent = messages[code] || messages.form || "Check this field.";
      }
      var inputId = {
        name: "buyer-name",
        design: "design",
        size: "size-group",
        quantity: "quantity",
        city: "city",
        pincode: "pincode",
        source: "source",
        note: "note",
      }[field];
      var input = inputId ? $(inputId) : null;
      if (input) input.setAttribute("aria-invalid", "true");
      if (!first) first = input || el;
    });
    var alert = $("form-alert");
    alert.hidden = false;
    alert.textContent = messages.form || "Check the highlighted fields.";
    if (first && first.focus) first.focus();
  }

  function openOrder(url) {
    var fallback = $("wa-fallback");
    fallback.href = url;
    fallback.hidden = false;
    $("sent-note").hidden = false;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function onSubmit(event) {
    event.preventDefault();
    if (!stockData) return;
    clearErrors();
    var item = currentItem();
    var fields = {
      name: $("buyer-name").value,
      size: selectedSize(),
      quantity: $("quantity").value,
      city: $("city").value,
      pincode: $("pincode").value,
      source: $("source").value,
      note: $("note").value,
    };
    var result = window.Shop.validateOrder(fields, item, {
      priceInr: stockData.priceInr,
      maxQty: window.Shop.MAX_QTY,
      sources: copy.hearAboutOptions || [],
    });
    if (!result.ok) {
      showErrors(result.errors);
      $("sent-note").hidden = true;
      $("wa-fallback").hidden = true;
      return;
    }
    var vars = window.Shop.orderVars(
      {
        name: fields.name,
        size: fields.size,
        quantity: result.quantity,
        city: fields.city,
        pincode: fields.pincode,
        source: fields.source,
        note: fields.note,
      },
      item,
      window.Shop.formatInr(result.total)
    );
    var message = window.Shop.fillTemplate(copy.whatsappTemplate, vars);
    openOrder(window.Shop.buildWhatsAppUrl(copy.whatsappNumber, message));
  }

  function loadStock() {
    fetch(asset("stock.json"), { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("stock");
        return response.json();
      })
      .then(function (data) {
        stockData = data;
        products = (data.items || [])
          .map(function (item, index) {
            return { item: item, index: index };
          })
          .filter(function (entry) {
            return window.Shop.isForSale(entry.item);
          });
        renderProducts();
        updateTotal();
        renderSizeChoices(null, "");
      })
      .catch(function () {
        var catalog = $("catalog");
        catalog.innerHTML = "";
        var message = document.createElement("p");
        message.className = "catalog-message";
        message.textContent = copy.catalogError || "The shelf didn't load.";
        catalog.appendChild(message);
      });
  }

  applyCopy();
  $("design").addEventListener("change", function () {
    var entry = findEntry($("design").value);
    renderSizeChoices(entry ? entry.item : null, "");
    markSelectedCard();
    var note = $("ordering-note");
    if (note) {
      if (entry) {
        note.textContent = window.Shop.fillTemplate(copy.orderingNote || "Ordering {label}.", {
          label: window.Shop.itemLabel(entry.item),
        });
        note.hidden = false;
      } else {
        note.hidden = true;
      }
    }
  });
  $("quantity").addEventListener("input", updateTotal);
  $("order-form").addEventListener("submit", onSubmit);
  document.body.classList.add("is-ready");
  loadStock();
})();
