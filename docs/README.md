📢 Use this project, [contribute](https://github.com/vtex-apps/quickorder) to it or open issues to help evolve it using [Store Discussion](https://github.com/vtex-apps/store-discussion).

# Quickorder

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

The Quickorder app is entirely designed for **B2B scenarios**. It creates a custom page in your store aimed at purchases in bulk, offering tools such as uploading a spreadsheet to make bulk orders more agile.

![quick-order](https://user-images.githubusercontent.com/52087100/82382559-8fb77b00-9a02-11ea-8803-1d36c4cf5d13.png)
*Example of a quick order page without customization*

## Configuration

1. Add the Quickorder app to your theme's dependencies in `manifest.json`. For example:

```diff
  dependencies: {
+   "vtex.quickorder": "0.x"
  }
```

Once Quickorder is added as a dependency, a new route called `/quickorder` will be automatically created for your store, creating the Quickorder custom page that allows bulk orders. 

2. Access the admin of the VTEX account in which your are working to access the CMS section. Then, enter **Site Editor**;
3. In the admin's Site Editor, look up the `/quickorder` route in the Site Editor's `URL` field;
4. Edit the page's Quickorder block according to the desired scenarios and save your changes. You can change the page title, as well as define which bulk order options will be made available to users: `autocomplete`, `textarea`, `category` or `upload`.

![Admin View](./image/Editor-Admin.png)

For more on each of the available options and their respective functionalities, check the Modus Operandi section below.

## Modus Operandi

In practice, the QuickOrder custom page works just like any other store page - with a unique route and its own components.

This means that you can display a link to it in components from other pages, such as the Homepage, so that your users can access it faster.

When configuring the page itself, we recommend that you **choose a maximum of 2 bulk order options** (from the total of 4 available) to establish clear communication with users. Remember: the more options on the UI, the more complex the order process becomes.

The available options are as follows:

### Copy/Paste SKU

The Copy/Paste SKU allows user to paste a list of desired SKUs in a text box following the structure `[Sku's Code],[Quantity]`, where:
- `SKU'S code` = SKU Reference ID SKU (be aware that this is not the SKU ID displayed in your admin's catalog);
- `Quantity` = SKU quantity you wish to add to the cart.

For example:

![Copy & Paste](./image/Copy-n-Paste.gif)

:information_source: *Remember that you need to validate the list after pasting it. Validating the Reference IDs will let you know if the selected SKUs are in fact available for purchase.*
 
### One By One

The One By One option works as a custom search bar. Simply add the name of the desired SKU, then select it and set the amount you wish to add to the cart.

Remember to add each selected item to the cart by clicking on `Add`.

![One by One](./image/One-by-One.gif)

:information_source: *This option does not require any validation, since selecting the SKUs using a search bar already ensures that they are available to purchase.*
 
### Categories

The Categories option allow users to choose their desired SKUs and respective quantities using the store's categories tree, adding all the selected options to the cart at once.

![Category](./image/Category.gif)

Be careful however: this option is only recommended if you don't have more than 50 SKUs for each category in your catalog, otherwise the component will take too long to load and will negatively affect your store's UX.

:information_source: *This scenario also does not require validating the SKUs that you've added to the cart, since selecting them directly from the store's categories tree ensures their availability.*

### Upload

Another possible option that replaces the Copy/Paste SKU option is to upload a spreadsheet containing two columns (SKU and Quantity) to the Upload component.

![Spreadsheet](./image/Spreadsheet.png)

The spreadsheet will work in the same way as the list pasted using the Copy/Paste SKU option, as follows:

- `SKU` column = SKU Reference ID (be aware that this is not the SKU ID displayed in your admin's catalog);
- `Quantity` column = SKU quantity you wish to add to the cart.

:information_source: *Once uploaded, the spreadsheet is then validated. Based on the filled in Reference IDs, Quickorder will confirm whether the SKUs are in fact available for purchase.*

## Customization

In order to apply CSS customizations to this and other blocks, follow the instructions given in the recipe on [Using CSS Handles for store customization](https://vtex.io/docs/recipes/style/using-css-handles-for-store-customization).

| CSS Handles |
| ---------------------------- |
| `container` |
| `title` |
| `copyPasteBlock` |
| `autocompleteBlock` |
| `reviewBlock` |
| `buttonsBlock` |
| `buttonValidate` |
| `skuSelection` |
| `productThumb` |
| `productLabel` |
| `inputQuantity` |
| `buttonAdd` |
| `categoryContainer` |
| `categoryTitle` |
| `categoryHelper` |
| `categoryProductLabel` |
| `categoryInputQuantity` |
| `categoryButtonAdd` |
| `categoriesSubCategory` |
| `categoriesProductContainer` |
| `categoryLoadingProducts` |
| `dropzoneContainer` |
| `dropzoneText` |
| `dropzoneLink` |
  
<!-- DOCS-IGNORE:start -->

## Contributors ✨

Thanks goes to these wonderful people:

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind are welcome!

<!-- DOCS-IGNORE:end -->
