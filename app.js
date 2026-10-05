/* Catalogue, product view, and the two order forms. */
(function () {
  var copy = window.SITE_COPY || {};
  var Shop = window.Shop;
  var stockData = null;
  var groups = [];
  var byIndex = {};
  var cardChoice = {};
  var modalIndex = null;
  var lastFocus = null;

  var TEE = {
    black: "#1a1a1a",
    white: "#f7f4ee",
    yellow: "#e0b03a",
    blue: "#2c62c0",
    "navy blue": "#1a2c4e",
  };

  function $(id) { return document.getElementById(id); }

  function asset(path) { return new URL(path, document.baseURI).href; }

  function text(id, value) {
    var el = $(id);
    if (el) el.textContent = value == null ? "" : value;
  }

  function teeFill(colour) {
    var key = String(colour || "").trim().toLowerCase();
    return TEE[key] || "#d5cfc4";
  }

  function isLightTee(colour) {
    var key = String(colour || "").trim().toLowerCase();
    return !key || key === "white";
  }

  function priceText() {
    return stockData ? Shop.formatInr(stockData.priceInr) : "";
  }

  function photoCaption(item) {
    if (!item || !item.colour || !item.photoColour) return "";
    if (String(item.photoColour).toLowerCase() === String(item.colour).toLowerCase()) return "";
    return Shop.fillTemplate(copy.photoNote || "Photo shows {shown}. Yours will be {colour}.", {
      shown: String(item.photoColour).toLowerCase(),
      colour: item.colour,
    });
  }

  function setPhotoNote(el, item) {
    if (!el) return;
    var note = photoCaption(item);
    el.hidden = !note;
    el.textContent = note;
  }

  function findGroup(index) {
    for (var i = 0; i < groups.length; i++) {
      for (var j = 0; j < groups[i].variants.length; j++) {
        if (groups[i].variants[j].index === index) return groups[i];
      }
    }
    return null;
  }

  function colourMatchesImage(item) {
    if (!item || !item.image || !item.colour) return false;
    return String(item.image).toLowerCase().indexOf(String(item.colour).toLowerCase()) !== -1;
  }

  function preferredIndex(group) {
    var picked = null;
    group.variants.forEach(function (variant) {
      if (picked == null && colourMatchesImage(variant.item)) picked = variant.index;
    });
    group.variants.forEach(function (variant) {
      if (picked == null && variant.item.image) picked = variant.index;
    });
    return picked == null ? group.variants[0].index : picked;
  }

  function activeIndex(group) {
    var current = cardChoice[group.design];
    var known = group.variants.some(function (variant) { return variant.index === current; });
    if (!known) current = preferredIndex(group);
    cardChoice[group.design] = current;
    return current;
  }

  function teeSvg(colour) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 200 230");
    svg.setAttribute("aria-hidden", "true");
    svg.classList.add("tee");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", teeFill(colour));
    path.setAttribute("stroke", isLightTee(colour) ? "#b7b0a4" : "none");
    path.setAttribute("stroke-width", "3");
    path.setAttribute("d", "M68 38c6 0 14 10 32 20 18-10 26-20 32-20l42 22-18 40-16-12v122H60V88L44 100 26 60z");
    svg.appendChild(path);
    return svg;
  }

  function placeholder(item) {
    var box = document.createElement("div");
    box.className = "photo placeholder";
    box.appendChild(teeSvg(item.colour));
    var name = document.createElement("p");
    name.className = "ph-name";
    name.textContent = item.design;
    var soon = document.createElement("p");
    soon.className = "ph-soon";
    soon.textContent = copy.photoSoon || "Photo coming soon";
    box.appendChild(name);
    box.appendChild(soon);
    return box;
  }

  function photoBlock(item) {
    var box = document.createElement("div");
    box.className = "photo";
    var target = box;
    if (item.image) {
      var img = document.createElement("img");
      img.src = asset(item.image);
      img.alt = Shop.itemLabel(item) + " tee";
      img.decoding = "async";
      img.addEventListener("error", function () {
        var fallback = placeholder(item);
        if (Shop.isLastFew(item, stockData.lastFewAt)) fallback.appendChild(badge());
        box.replaceWith(fallback);
      });
      box.appendChild(img);
    } else {
      target = placeholder(item);
    }
    if (Shop.isLastFew(item, stockData.lastFewAt)) target.appendChild(badge());
    return target;
  }

  function badge() {
    var el = document.createElement("p");
    el.className = "last-few";
    el.textContent = copy.lastFewLabel || "Last few";
    return el;
  }

  function swatch(variant, pressed, onClick) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "swatch";
    button.setAttribute("aria-pressed", pressed ? "true" : "false");
    var dot = document.createElement("span");
    dot.className = "dot" + (isLightTee(variant.item.colour) ? " light" : "");
    dot.style.background = teeFill(variant.item.colour);
    var label = document.createElement("span");
    label.textContent = variant.item.colour;
    button.appendChild(dot);
    button.appendChild(label);
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      onClick();
    });
    return button;
  }

  function renderSwatches(container, group, selected, onPick) {
    container.innerHTML = "";
    var named = group.variants.filter(function (variant) { return variant.item.colour; });
    named.sort(function (a, b) {
      var am = colourMatchesImage(a.item) ? 0 : 1;
      var bm = colourMatchesImage(b.item) ? 0 : 1;
      if (am !== bm) return am - bm;
      var ap = a.item.image ? 0 : 1;
      var bp = b.item.image ? 0 : 1;
      if (ap !== bp) return ap - bp;
      return a.index - b.index;
    });
    if (named.length < 1) {
      container.hidden = true;
      return;
    }
    container.hidden = false;
    container.setAttribute("role", "group");
    container.setAttribute("aria-label", copy.colourLabel || "Colour");
    named.forEach(function (variant) {
      container.appendChild(swatch(variant, variant.index === selected, function () {
        onPick(variant.index);
      }));
    });
  }

  function renderSizes(container, item, selected, radioName) {
    container.innerHTML = "";
    if (!item) return;
    Shop.availableSizes(item).forEach(function (size) {
      var label = document.createElement("label");
      label.className = "chip";
      var input = document.createElement("input");
      input.type = "radio";
      input.name = radioName;
      input.value = size;
      if (selected === size) input.checked = true;
      input.addEventListener("change", function () {
        state.size = size;
        mirrorSizes();
      });
      var span = document.createElement("span");
      span.textContent = size;
      label.appendChild(input);
      label.appendChild(span);
      container.appendChild(label);
    });
  }

  var state = {
    index: null,
    size: "",
    quantity: "1",
    name: "",
    city: "",
    pincode: "",
    source: "",
    note: "",
  };

  function currentItem() {
    return state.index == null ? null : byIndex[state.index] || null;
  }

  function selectedSize(groupId, radioName) {
    var checked = document.querySelector("#" + groupId + ' input[name="' + radioName + '"]:checked');
    return checked ? checked.value : "";
  }

  function fieldsFrom(which) {
    if (which === "modal") {
      return {
        name: $("modal-name").value,
        size: selectedSize("modal-size-group", "modal-size"),
        quantity: $("modal-quantity").value,
        city: $("modal-city").value,
        pincode: $("modal-pincode").value,
        source: $("modal-source").value,
        note: $("modal-note").value,
      };
    }
    return {
      name: $("buyer-name").value,
      size: selectedSize("size-group", "size"),
      quantity: $("quantity").value,
      city: $("city").value,
      pincode: $("pincode").value,
      source: $("source").value,
      note: $("note").value,
    };
  }

  function remember(fields) {
    state.name = fields.name;
    state.city = fields.city;
    state.pincode = fields.pincode;
    state.source = fields.source;
    state.note = fields.note;
    state.quantity = fields.quantity;
    state.size = fields.size;
  }

  function writeCustomer() {
    $("buyer-name").value = state.name;
    $("city").value = state.city;
    $("pincode").value = state.pincode;
    $("source").value = state.source;
    $("note").value = state.note;
    $("quantity").value = state.quantity;
    $("modal-name").value = state.name;
    $("modal-city").value = state.city;
    $("modal-pincode").value = state.pincode;
    $("modal-source").value = state.source;
    $("modal-note").value = state.note;
    $("modal-quantity").value = state.quantity;
  }

  function mirrorSizes() {
    renderSizes($("size-group"), currentItem(), state.size, "size");
    renderSizes($("modal-size-group"), currentItem(), state.size, "modal-size");
    $("size-hint").hidden = !!currentItem();
  }

  function updateTotals() {
    var parsed = Shop.parseQuantity(state.quantity || $("quantity").value);
    var shown = "₹—";
    if (parsed.value >= 1 && parsed.value <= Shop.MAX_QTY && stockData) {
      shown = Shop.formatInr(parsed.value * stockData.priceInr);
    }
    $("order-total").textContent = shown;
    $("modal-total").textContent = shown;
    var each = Shop.fillTemplate(copy.eachLabel || "{price} each", { price: priceText() });
    $("each-price").textContent = each;
    $("modal-each").textContent = each;
    if ($("tees-intro") && !$("tees-intro").dataset.filled && stockData) {
      $("tees-intro").textContent = Shop.fillTemplate(copy.teesIntro || "{price}", { price: priceText() });
      $("tees-intro").dataset.filled = "1";
    }
  }

  function setVariant(index, keepSize) {
    state.index = index;
    var item = byIndex[index];
    var group = findGroup(index);
    if (group) cardChoice[group.design] = index;
    if ($("design")) $("design").value = String(index);
    if (!keepSize || !item || Shop.availableSizes(item).indexOf(state.size) === -1) {
      state.size = keepSize ? state.size : "";
      if (item && state.size && Shop.availableSizes(item).indexOf(state.size) === -1) state.size = "";
    }
    mirrorSizes();
    paintModal();
    paintCards();
    updateTotals();
  }

  function paintModal() {
    var item = currentItem();
    var photo = $("modal-photo");
    photo.innerHTML = "";
    if (!item) return;
    var block = photoBlock(item);
    block.classList.add("modal-photo");
    while (block.firstChild) photo.appendChild(block.firstChild);
    if (block.classList.contains("placeholder")) photo.classList.add("placeholder");
    else photo.classList.remove("placeholder");
    if (Shop.isLastFew(item, stockData.lastFewAt) && !photo.querySelector(".last-few")) {
      photo.appendChild(badge());
    }
    setPhotoNote($("modal-photo-note"), item);
    text("modal-title", item.design);
    text("modal-price", priceText());
    var blurb = copy.blurbs && copy.blurbs[item.design];
    var blurbEl = $("modal-blurb");
    blurbEl.hidden = !blurb;
    blurbEl.textContent = blurb || "";
    var group = findGroup(state.index);
    renderSwatches($("modal-swatches"), group, state.index, function (next) {
      remember(fieldsFrom("modal"));
      setVariant(next, true);
    });
  }

  function paintCards() {
    document.querySelectorAll(".card").forEach(function (card) {
      var design = card.getAttribute("data-design");
      var group = groups.filter(function (entry) { return entry.design === design; })[0];
      if (!group) return;
      var index = activeIndex(group);
      var item = byIndex[index];
      var open = card.querySelector(".card-open");
      var photo = open.querySelector(".photo");
      var next = photoBlock(item);
      photo.replaceWith(next);
      setPhotoNote(card.querySelector(".photo-note"), item);
      card.querySelector(".size-line").textContent =
        (copy.sizesLabel || "Sizes") + "  " + Shop.availableSizes(item).join("   ");
      renderSwatches(card.querySelector(".swatches"), group, index, function (nextIndex) {
        cardChoice[design] = nextIndex;
        if (modalIndex != null && findGroup(modalIndex) && findGroup(modalIndex).design === design) {
          remember(fieldsFrom("modal"));
          setVariant(nextIndex, true);
        } else {
          paintCards();
        }
      });
    });
  }

  function renderCatalog() {
    var catalog = $("catalog");
    catalog.innerHTML = "";
    if (!groups.length) {
      var empty = document.createElement("p");
      empty.className = "catalog-message";
      empty.textContent = copy.catalogEmpty || "Nothing is in stock right now.";
      catalog.appendChild(empty);
      return;
    }
    groups.forEach(function (group) {
      var index = activeIndex(group);
      var item = byIndex[index];
      var card = document.createElement("article");
      card.className = "card";
      card.setAttribute("data-design", group.design);
      var open = document.createElement("button");
      open.type = "button";
      open.className = "card-open";
      open.appendChild(photoBlock(item));
      var note = document.createElement("p");
      note.className = "photo-note";
      note.hidden = true;
      open.appendChild(note);
      var name = document.createElement("h3");
      name.className = "card-name";
      name.textContent = group.design;
      var price = document.createElement("p");
      price.className = "price";
      price.textContent = priceText();
      open.appendChild(name);
      open.appendChild(price);
      open.addEventListener("click", function () {
        openModal(activeIndex(group));
      });
      var swatches = document.createElement("div");
      swatches.className = "swatches";
      var sizes = document.createElement("p");
      sizes.className = "size-line";
      var blurb = document.createElement("p");
      blurb.className = "blurb";
      var blurbText = copy.blurbs && copy.blurbs[group.design];
      blurb.hidden = !blurbText;
      blurb.textContent = blurbText || "";
      card.appendChild(open);
      card.appendChild(swatches);
      card.appendChild(sizes);
      card.appendChild(blurb);
      catalog.appendChild(card);
    });
    paintCards();
  }

  function renderDesignOptions() {
    var design = $("design");
    var first = design.options[0];
    first.textContent = (copy.placeholders && copy.placeholders.design) || "Choose a tee";
    design.innerHTML = "";
    design.appendChild(first);
    groups.forEach(function (group) {
      group.variants.forEach(function (variant) {
        var option = document.createElement("option");
        option.value = String(variant.index);
        option.textContent = Shop.itemLabel(variant.item);
        design.appendChild(option);
      });
    });
  }

  function fillSources(select) {
    var current = select.value;
    select.innerHTML = "";
    var blank = document.createElement("option");
    blank.value = "";
    blank.textContent = (copy.placeholders && copy.placeholders.source) || "Choose one";
    select.appendChild(blank);
    (copy.hearAboutOptions || []).forEach(function (option) {
      var el = document.createElement("option");
      el.value = option;
      el.textContent = option;
      select.appendChild(el);
    });
    select.value = current;
  }

  function clearErrors(prefix) {
    document.querySelectorAll("[id^='" + prefix + "']").forEach(function (el) {
      if (el.classList.contains("field-error") || el.classList.contains("form-alert")) {
        el.hidden = true;
        el.textContent = "";
      }
    });
  }

  function showErrors(map, errors) {
    var messages = copy.errors || {};
    var first = null;
    Object.keys(errors).forEach(function (field) {
      var el = $(map[field]);
      if (!el) return;
      el.hidden = false;
      el.textContent = messages[errors[field]] || messages.form || "Check this field.";
      if (!first) first = el;
    });
    var alert = $(map.form);
    if (alert) {
      alert.hidden = false;
      alert.textContent = messages.form || "Check the highlighted fields.";
    }
    if (first) {
      var field = first.previousElementSibling;
      if (field && field.focus) field.focus();
    }
  }

  function submitOrder(which) {
    if (!stockData) return;
    var fields = fieldsFrom(which);
    remember(fields);
    writeCustomer();
    mirrorSizes();
    var item = which === "modal" ? byIndex[modalIndex] : currentItem();
    if (which === "modal") state.index = modalIndex;
    var result = Shop.validateOrder(fields, item, {
      priceInr: stockData.priceInr,
      maxQty: Shop.MAX_QTY,
      sources: copy.hearAboutOptions || [],
    });
    var map = which === "modal"
      ? {
          form: "modal-alert",
          name: "modal-error-name",
          size: "modal-error-size",
          quantity: "modal-error-quantity",
          city: "modal-error-city",
          pincode: "modal-error-pincode",
          source: "modal-error-source",
          note: "modal-error-note",
          sent: "modal-sent",
          fallback: "modal-fallback",
        }
      : {
          form: "form-alert",
          name: "error-name",
          design: "error-design",
          size: "error-size",
          quantity: "error-quantity",
          city: "error-city",
          pincode: "error-pincode",
          source: "error-source",
          note: "error-note",
          sent: "sent-note",
          fallback: "wa-fallback",
        };
    clearErrors(which === "modal" ? "modal-error" : "error-");
    $(map.form).hidden = true;
    if (!result.ok) {
      showErrors(map, result.errors);
      $(map.sent).hidden = true;
      $(map.fallback).hidden = true;
      return;
    }
    var vars = Shop.orderVars(
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
      Shop.formatInr(result.total)
    );
    var message = Shop.applyTemplate(copy.whatsappTemplate, vars);
    var url = Shop.buildWhatsAppUrl(copy.whatsappNumber, message);
    var fallback = $(map.fallback);
    fallback.href = url;
    fallback.hidden = false;
    $(map.sent).hidden = false;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function openModal(index) {
    lastFocus = document.activeElement;
    modalIndex = index;
    remember(fieldsFrom("page"));
    setVariant(index, true);
    $("modal").hidden = false;
    document.body.classList.add("modal-open");
    $("modal-close").focus();
  }

  function closeModal() {
    $("modal").hidden = true;
    document.body.classList.remove("modal-open");
    modalIndex = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function applyCopy() {
    text("hero-kicker", copy.heroKicker);
    text("hero-headline", copy.heroHeadline);
    text("hero-sub", copy.heroSub);
    text("about-heading", copy.aboutHeading);
    text("about-body", copy.aboutBody);
    text("how-heading", copy.howHeading);
    text("tees-heading", copy.teesHeading);
    text("order-heading", copy.orderHeading);
    text("order-intro", copy.orderIntro);
    text("footer-copy", copy.footer);
    text("total-label", copy.totalLabel);
    text("modal-total-label", copy.totalLabel);
    text("sent-note", copy.sentNote);
    text("modal-sent", copy.sentNote);
    text("size-hint", copy.placeholders && copy.placeholders.sizeHint);
    text("submit-label", copy.submitLabel);
    text("modal-submit", copy.modalSubmit || copy.submitLabel);
    text("chat-label", copy.chatLabel);
    text("modal-close", copy.closeLabel || "Close");
    var labels = copy.labels || {};
    Object.keys(labels).forEach(function (key) {
      text("label-" + key, labels[key]);
      text("modal-label-" + key, labels[key]);
      text("modal-size-label", labels.size);
    });
    ["hero-ig", "footer-ig"].forEach(function (id) {
      var link = $(id);
      if (!link) return;
      link.href = copy.instagramUrl || link.href;
      link.textContent = copy.instagramCta || copy.instagramHandle || "Instagram";
    });
    var placeholders = copy.placeholders || {};
    [["buyer-name", "modal-name", placeholders.name], ["city", "modal-city", placeholders.city], ["pincode", "modal-pincode", placeholders.pincode], ["note", "modal-note", placeholders.note]].forEach(function (row) {
      if (!row[2]) return;
      $(row[0]).setAttribute("placeholder", row[2]);
      $(row[1]).setAttribute("placeholder", row[2]);
    });
    fillSources($("source"));
    fillSources($("modal-source"));
    var steps = $("how-steps");
    steps.innerHTML = "";
    (copy.howSteps || []).forEach(function (step, i) {
      var li = document.createElement("li");
      var num = document.createElement("span");
      num.className = "step-no";
      num.textContent = String(i + 1).padStart(2, "0");
      var title = document.createElement("h3");
      title.textContent = step.title;
      var body = document.createElement("p");
      body.textContent = step.body;
      li.appendChild(num);
      li.appendChild(title);
      li.appendChild(body);
      steps.appendChild(li);
    });
    var chat = $("chat-link");
    chat.href = Shop.buildWhatsAppUrl(copy.whatsappNumber, copy.chatPrefill || "");
    $("wa-fallback").textContent = copy.fallbackLabel || "Open WhatsApp with this order";
    $("modal-fallback").textContent = copy.fallbackLabel || "Open WhatsApp with this order";
  }

  function loadStock() {
    fetch(asset("stock.json"), { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("stock");
        return response.json();
      })
      .then(function (data) {
        stockData = data;
        byIndex = {};
        (data.items || []).forEach(function (item, index) {
          if (Shop.isForSale(item)) byIndex[index] = item;
        });
        groups = Shop.groupByDesign(data.items || []);
        renderDesignOptions();
        renderCatalog();
        updateTotals();
        mirrorSizes();
      })
      .catch(function () {
        var catalog = $("catalog");
        catalog.innerHTML = "";
        var message = document.createElement("p");
        message.className = "catalog-message";
        message.textContent = copy.catalogError || "The tees didn't load.";
        catalog.appendChild(message);
      });
  }

  applyCopy();
  ["buyer-name", "city", "pincode", "note", "quantity"].forEach(function (id) {
    $(id).addEventListener("input", function () {
      remember(fieldsFrom("page"));
      writeCustomer();
      updateTotals();
    });
  });
  $("source").addEventListener("change", function () {
    remember(fieldsFrom("page"));
    writeCustomer();
  });
  ["modal-name", "modal-city", "modal-pincode", "modal-note", "modal-quantity"].forEach(function (id) {
    $(id).addEventListener("input", function () {
      remember(fieldsFrom("modal"));
      writeCustomer();
      updateTotals();
    });
  });
  $("modal-source").addEventListener("change", function () {
    remember(fieldsFrom("modal"));
    writeCustomer();
  });
  $("design").addEventListener("change", function () {
    var value = $("design").value;
    if (value === "") {
      state.index = null;
      state.size = "";
      mirrorSizes();
      return;
    }
    remember(fieldsFrom("page"));
    setVariant(Number(value), true);
  });
  $("order-form").addEventListener("submit", function (event) {
    event.preventDefault();
    submitOrder("page");
  });
  $("modal-form").addEventListener("submit", function (event) {
    event.preventDefault();
    submitOrder("modal");
  });
  $("modal-close").addEventListener("click", closeModal);
  $("modal").addEventListener("click", function (event) {
    if (event.target === $("modal")) closeModal();
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !$("modal").hidden) closeModal();
  });
  document.body.classList.add("is-ready");
  loadStock();
})();
