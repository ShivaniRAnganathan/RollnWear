/* ============================================================
   ROLL & WEAR — EDITABLE COPY
   ------------------------------------------------------------
   This is the file to edit for words on the page, the WhatsApp
   order message, and the footer.

   Change the text inside the quotes. Keep the quotes, the
   commas, and any {placeholder} words.

   Link-preview title, description, and image (Instagram and
   WhatsApp) live in index.html. They are marked COPY: link preview.

   Placeholders the order form fills in:
     {name} {design} {colour} {size} {quantity}
     {total} {city} {pincode} {source} {note}
   {price} is the tee price from stock.json, like "Rs 899".
   Do not type a backtick character (`). It would break this file.
   ============================================================ */
window.SITE_COPY = {
  /* SETTINGS */
  whatsappNumber: "918500000811",
  instagramUrl: "https://www.instagram.com/rollnwear/",
  instagramHandle: "@rollnwear",

  /* HERO */
  heroKicker: "Roll the dice. Wear the joke.",
  heroHeadline: "Original board-game tees, made by gamers, for gamers.",
  heroSub: "A small Indian label of original tees for people who stay for one more round. Pick a design, pick a size we have, and send the order on WhatsApp.",
  instagramCta: "Instagram @rollnwear",

  /* ABOUT */
  aboutKicker: "House rules",
  aboutHeading: "From our game night to yours",
  aboutBody: "Roll & Wear started at the table: meeples, house rules, and shirts we actually wanted to wear home. Every design is original, made by gamers, for gamers.",
  aboutLinkLabel: "See new drops on Instagram @rollnwear",

  /* PRODUCT SECTION */
  teesHeading: "The tees",
  teesIntro: "{price} for every design and every size.",
  lastFewLabel: "Last few",
  sizesLabel: "Sizes",
  orderThisLabel: "Order this",
  photoComing: "",
  catalogError: "The shelf didn't load. Refresh the page and try again.",
  catalogEmpty: "Nothing is in stock right now. Chat with us on WhatsApp and ask what's on the table.",

  /* BLURBS — one per design name. Clear the words to hide a blurb. */
  blurbs: {
    "The Boardgamer": "For the person who brought the game, taught the game, and still won.",
    "Board Game Components": "Tokens, tiles, and the little bits that make a box feel full.",
    "Power to the Meeple": "A small wooden person. A large set of opinions.",
    "Wingin' It": "Wings out. Plan optional.",
    "Game Night": "The shirt you put on once the table is clear.",
    "Before You Ask": "The answer is on the shirt. Setup can wait.",
    "I Don't Make the Rules": "You just play by them. Mostly.",
    "Less AP More VP": "Fewer speeches. More points.",
    "White Meeple": "Quiet piece. Serious plans.",
    "Orange Meeple": "The bright one that still takes the long road.",
    "Meeple Friends": "They came for the snacks and stayed for the scoring.",
  },

  /* ORDER FORM */
  orderHeading: "Place an order",
  orderIntro: "Tell us what you want. WhatsApp opens with the order written out, and you tap send.",
  labels: {
    name: "Name",
    design: "Design and colour",
    size: "Size",
    quantity: "Quantity",
    city: "City",
    pincode: "Pincode",
    note: "Note (optional)",
    source: "Where did you hear about us?",
  },
  placeholders: {
    name: "Your name",
    design: "Choose a tee",
    city: "Your city",
    pincode: "6-digit pincode",
    note: "Anything we should know?",
    source: "Choose one",
    sizeHint: "Choose a design to see sizes.",
  },
  hearAboutOptions: [
    "Instagram post",
    "Instagram ad",
    "Friend",
    "Game cafe/event",
    "Other",
  ],
  eachLabel: "{price} each",
  totalLabel: "Total",
  submitLabel: "Send order on WhatsApp",
  sentNote: "WhatsApp should open with your order filled in. Tap send there and it reaches us.",
  fallbackLabel: "Open WhatsApp with this order",
  orderingNote: "Ordering {label}.",
  errors: {
    name: "Add the name for this order.",
    design: "Choose a design.",
    size: "Choose a size that's in stock.",
    sizeGone: "That size isn't in stock.",
    quantity: "Add a quantity of at least 1.",
    quantityWhole: "Quantity should be a whole number.",
    quantityCap: "You can order up to 10 tees at a time.",
    quantityStock: "That size doesn't have enough left for this quantity.",
    city: "Add your city.",
    pincode: "Add a 6-digit pincode.",
    source: "Tell us where you heard about us.",
    note: "Keep the note under 500 characters.",
    form: "Check the highlighted fields.",
  },

  /* WHATSAPP ORDER MESSAGE — keep the {placeholders} */
  whatsappTemplate: `Hi Roll & Wear! I'd like to order a tee.

Design: {design}
Colour: {colour}
Size: {size}
Quantity: {quantity}
Total: {total}

Name: {name}
City: {city}
Pincode: {pincode}
Where I heard about you: {source}
Note: {note}`,

  /* Short hello for the floating chat button. */
  chatPrefill: "Hi Roll & Wear! I have a question about the tees.",

  /* FOOTER */
  footer: "Roll & Wear, India. Original board-game tees.",
  chatLabel: "Chat on WhatsApp",
};
