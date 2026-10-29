# FloweRoom

A responsive landing page for a fictional same-day flower delivery shop, built with HTML, CSS and JavaScript.

## Features

- Bouquet catalogue loaded from `data/bouquets.json`
- Shopping cart with quantity controls, saved in `localStorage`
- Promo code check (try `FLOWEROOM10`)
- Delivery ZIP code check (try `10001`)

## Running locally

The page loads its data with `fetch`, so it needs to be served over HTTP. You can use Python's built-in HTTP server to
do this:

```sh
python3 -m http.server
```

Then open http://localhost:8000.

## Structure

```
index.html   page markup
css/         styles
js/          app logic and jQuery
data/        bouquets, promo codes and ZIP codes
img/, fonts/ assets
```
