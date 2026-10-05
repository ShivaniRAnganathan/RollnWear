/* ============================================================
   ROLL & WEAR — EDITABLE COPY
   ------------------------------------------------------------
   Edit the words inside the quotes. Keep the quotes, commas,
   and any {placeholder} words.

   Link-preview title, description, and image (Instagram and
   WhatsApp) live in index.html, marked COPY: link preview.

   Order message placeholders:
     {name} {design} {colour} {size} {quantity}
     {total} {city} {pincode} {source} {note}
   {price} is the tee price from stock.json, like "Rs 899".

   If a tee has no colour in stock.json, the line that contains
   {colour} is left out of the WhatsApp message. Keep that line
   written as: Colour: {colour}

   Do not type a backtick (`). It would break this file.
   ============================================================ */
window.SITE_COPY = {
  /* SETTINGS */
  whatsappNumber: "918500000811",
  instagramUrl: "https://www.instagram.com/rollnwear/",
  instagramHandle: "@rollnwear",

  /* HERO */
  heroKicker: "Board-game tees",
  heroHeadline: "Original board-game tees, made by gamers, for gamers.",
  heroSub: "A small Indian label. One price for every design and every size. Choose what we have in stock, then send the order on WhatsApp.",
  instagramCta: "Instagram @rollnwear",

  /* ABOUT */
  aboutHeading: "Made at the table",
  aboutBody: "Roll & Wear prints original tees for people who stay for one more round. The designs are ours, drawn for game night rather than licensed from anyone else.",

  /* HOW TO ORDER */
  howHeading: "How to order",
  howSteps: [
    {
      title: "Pick a design and size",
      body: "Choose the colour, if there is one, and a size we still have.",
    },
    {
      title: "Send the order on WhatsApp",
      body: "The message is written out for you. You tap send.",
    },
    {
      title: "We confirm and share payment",
      body: "We confirm the stock and send payment details.",
    },
  ],

  /* CATALOGUE */
  teesHeading: "The tees",
  teesIntro: "{price} for every design and every size.",
  lastFewLabel: "Last few",
  sizesLabel: "Sizes",
  colourLabel: "Colour",
  photoSoon: "Photo coming soon",
  viewLabel: "View",
  catalogError: "The tees didn't load. Refresh the page and try again.",
  catalogEmpty: "Nothing is in stock right now. Message us on WhatsApp and ask what is on the table.",

  /* BLURBS — one per design name. Clear the words to hide a blurb. */
  blurbs: {
    "The Boardgamer": "For the person who brings the game and teaches the table.",
    "Board Game Components": "Tokens, tiles, and the pieces that fill a box.",
    "Power to the Meeple": "A small wooden figure, drawn large.",
    "Wingin' It": "A quiet wingspan, worn simply.",
    "Game Night": "Script for the night the table stays out.",
    "Before You Ask": "The answers, printed down the front.",
    "I Don't Make the Rules": "A straight line, and the rulebook nearby.",
    "Less AP More VP": "Less talk. More points.",
    "White Meeple": "One quiet piece.",
    "Orange Meeple": "The bright piece.",
    "Meeple Friends": "Three meeples, side by side.",
  },

  /* ORDER */
  orderHeading: "Order",
  orderIntro: "Use this form, or open a tee above. Either way, WhatsApp opens with the order written out.",
  modalSubmit: "Order on WhatsApp",
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
    sizeHint: "Choose a tee to see sizes.",
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
  sentNote: "WhatsApp should open with your order filled in. Tap send there.",
  fallbackLabel: "Open WhatsApp with this order",
  closeLabel: "Close",
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

  /* WHATSAPP ORDER MESSAGE — keep {colour} on its own line */
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

  chatPrefill: "Hi Roll & Wear! I have a question about the tees.",

  /* FOOTER */
  footer: "Roll & Wear, India. Original board-game tees.",
  chatLabel: "WhatsApp",
};
