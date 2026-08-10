# Outlaw Racing Website

A front-end e-commerce website for motorcycle racing gear and Outlaw Racing Society clothing.

## Run the website

Open `pages/index.html` in a modern web browser. No installation or server is required.

## Main folders

- `pages/` - website pages
- `styles/` - external CSS
- `js/` - product data and website interaction
- `media/images/products/` - product photographs
- `media/images/backgrounds/` - page and gallery photographs
- `media/images/branding/` - logo files
- `evidence/` - testing and audit screenshots

## Replacing product images

1. Put the new image in `media/images/products/`.
2. Open `js/products.js`.
3. Find the matching product.
4. Update its `image` value, for example:

```javascript
image: "../media/images/products/new-helmet.webp"
```

Use lowercase file names without spaces where possible.

## Product categories

The Shop page lists all products and supports category filtering for Helmets, Gloves, Boots, Leather Suits, Clothing and Accessories. Product cards, details and cart actions are rendered with JavaScript DOM manipulation.

## Cart storage

The cart uses browser `localStorage`, so items remain available after refreshing the page in the same browser.
