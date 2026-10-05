"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const Shop = require("../shop.js");

const root = path.join(__dirname, "..");
const stock = JSON.parse(fs.readFileSync(path.join(root, "stock.json"), "utf8"));

const window = {};
global.window = window;
eval(fs.readFileSync(path.join(root, "content.js"), "utf8"));
const copy = window.SITE_COPY;

function itemOf(design, colour) {
  return stock.items.find(function (item) {
    return item.design === design && item.colour === colour;
  });
}

const lastFewExpected = [
  ["The Boardgamer", null, true],
  ["Board Game Components", "White", false],
  ["Power to the Meeple", "Black", true],
  ["Wingin' It", "Black", false],
  ["Board Game Components", "Black", false],
  ["Game Night", "Black", false],
  ["Before You Ask", "Blue", false],
  ["Power to the Meeple", "Yellow", false],
  ["I Don't Make the Rules", "Blue", true],
  ["Less AP More VP", null, false],
  ["White Meeple", null, true],
  ["Orange Meeple", "Navy blue", true],
  ["Meeple Friends", null, true],
  ["Wingin' It", "Blue", false],
];

assert.strictEqual(stock.priceInr, 899);
assert.strictEqual(stock.lastFewAt, 3);
assert.strictEqual(stock.items.length, 14);
assert.deepStrictEqual(copy.hearAboutOptions, [
  "Instagram post",
  "Instagram ad",
  "Friend",
  "Game cafe/event",
  "Other",
]);

lastFewExpected.forEach(function (row) {
  const item = itemOf(row[0], row[1]);
  assert.ok(item, "missing " + row[0] + " " + row[1]);
  assert.strictEqual(Shop.isLastFew(item, stock.lastFewAt), row[2], row[0] + " " + row[1]);
  assert.ok(Shop.isForSale(item));
  Shop.availableSizes(item).forEach(function (size) {
    assert.ok(Shop.sizeCount(item, size) > 0);
  });
  if (item.image) {
    assert.ok(!item.image.startsWith("/"), item.image);
    assert.ok(fs.existsSync(path.join(root, item.image)), "missing file " + item.image);
  }
});

assert.deepStrictEqual(Shop.availableSizes({ sizes: { S: 0, "2XL": 2, M: 0, L: 1 } }), ["L", "2XL"]);
assert.strictEqual(Shop.isForSale({ sizes: { M: 0 } }), false);
assert.strictEqual(Shop.formatInr(899), "₹899");
assert.strictEqual(Shop.formatInr(1798), "₹1,798");
assert.strictEqual(Shop.itemLabel(itemOf("Wingin' It", "Black")), "Wingin' It — Black");
assert.strictEqual(Shop.itemLabel(itemOf("Less AP More VP", null)), "Less AP More VP");
const groups = Shop.groupByDesign(stock.items);
assert.strictEqual(groups.length, 11);
assert.deepStrictEqual(
  groups.find(function (group) { return group.design === "Board Game Components"; }).variants.map(function (variant) { return variant.item.colour; }),
  ["White", "Black"]
);
assert.strictEqual(itemOf("Game Night", "Black").image, "images/game-night--black.webp");
assert.ok(!fs.existsSync(path.join(root, "images/game-night.jpg")));
assert.ok(!fs.existsSync(path.join(root, "images/wingin-it.jpg")));
assert.strictEqual(Shop.itemLabel(itemOf("Before You Ask", "Blue")), "Before You Ask — Blue");

const wingin = itemOf("Wingin' It", "Black");
const fields = {
  name: "Meera Shah",
  size: "L",
  quantity: "2",
  city: "Bengaluru",
  pincode: "560001",
  source: "Instagram post",
  note: "Gift, please — pack it flat & keep the tag.",
};
const result = Shop.validateOrder(fields, wingin, {
  priceInr: stock.priceInr,
  sources: copy.hearAboutOptions,
});
assert.strictEqual(result.ok, true, JSON.stringify(result.errors));
assert.strictEqual(result.total, 1798);
assert.strictEqual(result.quantity, 2);

const vars = Shop.orderVars(
  Object.assign({}, fields, { quantity: result.quantity }),
  wingin,
  Shop.formatInr(result.total)
);
const message = Shop.applyTemplate(copy.whatsappTemplate, vars);
const url = Shop.buildWhatsAppUrl(copy.whatsappNumber, message);
const decoded = decodeURIComponent(url.slice(url.indexOf("?text=") + 6));

assert.strictEqual(decoded, message);
assert.ok(url.startsWith("https://wa.me/918500000811?text="));
assert.ok(url.includes("%0A"), "newlines should be percent-encoded");
assert.ok(url.includes("%26"), "ampersand should be percent-encoded");
assert.ok(url.includes("Wingin'%20It") || url.includes("Wingin%27%20It") || decoded.includes("Wingin' It"));
assert.ok(!message.includes("{name}"));
assert.ok(message.includes("Design: Wingin' It"));
assert.ok(message.includes("Colour: Black"));
const plain = itemOf("The Boardgamer", null);
const plainResult = Shop.validateOrder(Object.assign({}, fields, { size: "L", quantity: "1", note: "Gift." }), plain, {
  priceInr: 899,
  sources: copy.hearAboutOptions,
});
assert.strictEqual(plainResult.ok, true, JSON.stringify(plainResult.errors));
const plainMessage = Shop.applyTemplate(copy.whatsappTemplate, Shop.orderVars(
  Object.assign({}, fields, { size: "L", quantity: 1, note: "Gift." }),
  plain,
  Shop.formatInr(plainResult.total)
));
assert.ok(!plainMessage.includes("Colour"), plainMessage);
assert.strictEqual(plainResult.total, 899);
assert.ok(message.includes("Size: L"));
assert.ok(message.includes("Quantity: 2"));
assert.ok(message.includes("Total: ₹1,798"));
assert.ok(message.includes("Pincode: 560001"));
assert.ok(message.includes("Where I heard about you: Instagram post"));
assert.ok(message.includes("pack it flat & keep the tag."));

const over = Shop.validateOrder(Object.assign({}, fields, { quantity: "5", size: "L" }), itemOf("The Boardgamer", null), {
  priceInr: 899,
  sources: copy.hearAboutOptions,
});
assert.strictEqual(over.ok, false);
assert.strictEqual(over.errors.quantity, "quantityStock");

const zeroSize = Shop.validateOrder(Object.assign({}, fields, { size: "S" }), itemOf("The Boardgamer", null), {
  priceInr: 899,
  sources: copy.hearAboutOptions,
});
assert.strictEqual(zeroSize.errors.size, "sizeGone");

const missing = Shop.validateOrder({ name: "A", quantity: "", city: "", pincode: "011111", source: "", note: "" }, null, {
  priceInr: 899,
  sources: copy.hearAboutOptions,
});
assert.strictEqual(missing.ok, false);
assert.strictEqual(missing.errors.name, "name");
assert.strictEqual(missing.errors.design, "design");
assert.strictEqual(missing.errors.quantity, "quantity");
assert.strictEqual(missing.errors.city, "city");
assert.strictEqual(missing.errors.pincode, "pincode");
assert.strictEqual(missing.errors.source, "source");

const badSource = Shop.validateOrder(Object.assign({}, fields, { source: "Billboard" }), wingin, {
  priceInr: 899,
  sources: copy.hearAboutOptions,
});
assert.strictEqual(badSource.errors.source, "source");

const customerFiles = [
  "index.html",
  "content.js",
  "styles.css",
  "app.js",
  "shop.js",
  "stock.json",
];
const banned = [/shipping/i, /delivery charge/i, /delivery time/i, /Settle Down/i, /Virtue Meeple/i, /Vitruvian/i];
customerFiles.forEach(function (file) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  banned.forEach(function (pattern) {
    assert.ok(!pattern.test(text), file + " matches " + pattern);
  });
});

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
assert.ok(!/<(?:a|link|script|img)[^>]+(?:href|src)="\//.test(html), "asset links should be relative");
assert.ok(html.includes('href="styles.css"'));
assert.ok(html.includes('src="content.js"'));
assert.ok(!fs.existsSync(path.join(root, ".github/workflows")));

console.log("OK");
console.log("--- WhatsApp message ---");
console.log(message);
console.log("--- WhatsApp URL ---");
console.log(url);
