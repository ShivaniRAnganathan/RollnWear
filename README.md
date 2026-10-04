# Roll & Wear shop

A static shop for [Roll & Wear](https://www.instagram.com/rollnwear/), a small Indian board-game tee label. There is no server and no build step. Visitors choose a tee and the order opens in WhatsApp for `918500000811`, ready to send.

The earlier stall-inventory app is kept in [`old/`](old/). It is not this website.

## Preview on your computer

From this folder:

```bash
python3 -m http.server 8080
```

Open `http://127.0.0.1:8080/`. Links are relative, so the same files also work in a subfolder (for example `https://example.com/rollnwear/`) as long as the address ends with a slash or `index.html`.

## Update the stock

Edit **`stock.json`** only. Each tee is one object: `design`, `colour` (`null` if you are not naming a colour), `image`, and `sizes`.

Change the numbers. Customers never see the counts. A size set to `0` disappears. If every size is `0`, that tee comes off the page. When the numbers for one design and colour add up to `lastFewAt` or less (3), the card says **Last few**.

```json
"sizes": { "S": 4, "M": 0, "L": 2 }
```

That shows S and L, and hides M.

`priceInr` is the price of every tee, in rupees. It is `899` today. The order total is quantity times that number.

Keep the file valid JSON: quotes around words, commas between lines, no comma after the last item in a list.

Push the change to GitHub. Cloudflare Pages publishes it from the connected branch. `stock.json` is set to refresh on each visit, so a reload after the deploy shows the new counts.

## Change the words

Edit **`content.js`**. That file holds the headline, the about text, the per-design blurbs, the order-form labels, the WhatsApp message, and the footer.

The WhatsApp message can use these placeholders:

`{name}` `{design}` `{colour}` `{size}` `{quantity}` `{total}` `{city}` `{pincode}` `{source}` `{note}`

`{price}` is only for lines on the page, such as the price introduction. If a tee has no colour, `{colour}` is an em dash. An empty note becomes an em dash too.

Do not type a backtick (`` ` ``) in that file.

The phone number is `whatsappNumber` at the top of `content.js`. Digits only, country code included, no plus sign.

## Swap a photo

See [`images/README.md`](images/README.md). Replace a file in `images/` or add one, then point that tee's `image` field in `stock.json` at it. `null` shows a card with the design name and a meeple, not a fake shirt.

## Link previews on Instagram and WhatsApp

Crawlers do not read `content.js`. The title, description, and preview image are the tags in `index.html` marked `COPY: link preview`.

They currently point at `https://rollnwear.pages.dev/`. If the Cloudflare project name is different, change:

- `canonical`
- `og:url`
- `og:image`
- `twitter:image`
- the `url` and `logo` inside the small JSON-LD block

The preview image is `images/og.jpg` (1200×630).

## Put it on Cloudflare Pages

GitHub Pages is not used. Its terms don't allow a site that is mainly for selling, so do not turn Pages on in the GitHub repo settings. This shop is meant for Cloudflare Pages, which has a free plan that fits a static site.

You do need to click through Cloudflare once:

1. Sign in at [dash.cloudflare.com](https://dash.cloudflare.com).
2. Go to **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Authorize GitHub if asked, then choose the `RollnWear` repository.
4. Production branch: `main` (after this shop is merged).
5. Framework preset: **None**.
6. Build command: leave this **empty**. There is no build.
7. Build output directory: `/` (the repository root, not `old/`).
8. Save and deploy.

Name the project `rollnwear` if you want the address `https://rollnwear.pages.dev`. The first deploy is the click above. Later pushes to `main` publish on their own.

No custom domain is required. No GitHub Actions workflow is required.

## Check the order link

`node test/shop.test.js` checks stock rules and that a sample order round-trips through the WhatsApp URL encoding.
