# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.16.2] - 2024-12-04
### Fixed

- Fixed quickorder listing counter

## [3.16.1] - 2024-11-12
### Fixed
- Autocomplete not working with French language

## [3.16.0] - 2024-11-07
### Added

- Changed the checkoutUrl prop to admin app settings

## [3.15.9] - 2024-10-02

### Fixed

- Fixed the message in the status column of the SKU table, specifically inactive skus
- Fixed the return from skuFromRefIds and improve the return from getSkuSellerInfo

## [3.15.8] - 2024-10-02
### Fixed

- Fixed the return from skuFromRefIds and improve the return from getSkuSellerInfo

## [3.15.7] - 2024-09-26

## [3.15.6] - 2024-09-26
### Added
- Add a cart url prop so the store can control the redirect via theme

## [3.15.5] - 2024-08-20

### Fixed
- Fixes validation of SKU codes in the quickorder and styles of the ReviewBlock component

## [3.15.4] - 2024-06-13

## [3.15.3] - 2024-06-10

### Changed

- Adjust autocomplete list to show product name rather than just the product sku name

## [3.15.2] - 2024-06-10

## [3.15.1] - 2024-05-27

## [3.15.0] - 2024-05-27

## [3.14.0] - 2023-08-30

### Added

- Set default value true for alwaysShowAddToCart

## [3.13.0] - 2023-08-24

### Added

- Added prop alwaysShowAddToCart to hide or show the add to cart button when there was an invalid SKU

## [3.12.7] - 2023-03-28

### Added

- Define product result limit for category component

## [3.12.6] - 2023-02-14

### Fixed

- Bug fixed on UI adding to cart flow

### Added

- [ENGINEERS-989] - Added verify the excel file testcase in cypress

## [3.12.5] - 2022-12-23

### Fixed

- Arabic translation.

### Added

- Indonesian translation.

## [3.12.4] - 2022-12-13

### Changed

- Fixed XLSX package version

## [3.12.3] - 2022-11-23

### Added

- [ENGINEERS-875] & [ENGINEERS-876] - Added more cypress tests

### Added

- Added cypress tests

### Added

- Added dispatch workflow for cypress

### Fixed

- Map of null of seller's array of a not found item

## [3.12.2] - 2022-11-23

### Fixed

- Yarn packages versions mismatch

## [3.12.1] - 2022-11-08

### Fixed

- Text that contains partial availability error will not show Add To Cart button

### Changed

- GitHub reusable workflow uptaded to v2

## [3.12.0] - 2022-10-12

### Added

- Partial availability error message in `ReviewBlock` when full item quantity entered is not available in selected seller

### Changed

- Run checkout simulation with item quantity input in `TextArea` and `Upload` blocks
- Check for SKU match in full `items` list from `productSuggestions` query results

## [3.11.0] - 2022-10-06

### Added

- Added collection restriction for both text area and upload area
- Added message util in react admi

## [3.10.0] - 2022-08-26

### Added

- Error logging
- GraphQL directive withSegment

### Changed

- TextArea description from `Sku's Code` to `SKU Reference ID`

## [3.9.4] - 2022-07-15

### Fixed

- Get sales channel from segment instead of orderForm

## [3.9.3] - 2022-07-05

### Fixed

- Fixed checkout simulation error by filtering out sellers unavailable in orderForm's sales channel

### Added

- Added error message when query for SKU info fails in ReviewBlock

## [3.9.2] - 2022-06-27

### Added

- Added the unit tests

## [3.9.1] - 2022-06-22

### Fixed

- Fix miniumn quantity selected in autocomplete block to equal unit multiplier

## [3.9.0] - 2022-05-25

### Added

- Filter sellers without stock from options in ReviewBlock component

### Changed

- Change `availability` and `unitMultiplier` to seller level information instead of item level

## [3.8.5] - 2022-05-23

### Fixed

- Fix Spanish translations that were previously using English
- Make empty state message in TextArea block translatable
- Restrict Category block quantity input to numbers

## [3.8.4] - 2022-05-05

## Fixed

- Replace the autocomplete search query with the intelligent search autocomplete

## [3.8.3] - 2022-04-01

### Fixed

- Documentation on README.md

## [3.8.2] - 2022-03-29

### Added

- Added a CSS handle for autocomplete button.

### Fixed

- Update tooling

## [3.8.1] - 2022-02-22

### Fixed

- Fixed the issue that the autocomplete block quantity button was starting with 0 instead of 1.

## [3.8.0] - 2022-02-22

### Added

- Adding an option as a prop to make the columns of the review block hideable

## [3.7.1] - 2022-02-22

### Fixed

- Fixed a bug where the upload block was not updating the order form automatically.
- Added missing translation keys

## [3.7.0] - 2022-02-10

### Fixed

- Fixed a bug where changing seller would not update specific status for that seller
- Fixed a bug where the copy/paste and upload blocks would not show updated results

## [3.6.2] - 2022-02-09

### Added

- Making the message "Unit Multiplier Of" in autocomplete block as an translatable message.

## [3.6.1] - 2022-02-09

### Fixed

- Changing the validate button in TextArea and Upload blocks to only be shown if the user has written something or sent a file, respectively

## [3.6.0] - 2022-02-09

### Added

- Arabic translation

## [3.5.4] - 2022-02-09

### Fixed

- Adding a minimum quantity to one by one quantity input

## [3.5.3] - 2022-02-09

### Fixed

- Fixing the issue that when adding items in the cart, it doesn't go back to the list page in text area and upload blocks

## [3.5.2] - 2022-02-09

### Added

- Adding the proper Korean translations to each message in messages folder. (This was translated by an korean customer)

## [3.5.1] - 2022-01-21

### Fixed

- Fixed typo

## [3.5.0] - 2022-01-14

### Added

- Ability to run SonarCloud external PR after checking the code by adding a label to it

### Changed

- Sellers API

### Updated

- Code linting

## [3.4.2] - 2022-01-11

### Fixed

- Restricting the Quick Order Upload to accept only .xls and .xlsx files

## [3.4.1] - 2022-01-07

## [3.4.0] - 2021-12-29

## [3.3.2] - 2021-12-21

### Fixed

- Widened the quickorder table

## [3.3.1] - 2021-12-17

### Fixed

- Fixed a bug where the add to cart button will spin forever when given a faulty item SKU

## [3.3.0] - 2021-12-13

### Added

- Displayed the unit modifier value for all items that have it

## [3.2.0] - 2021-05-17

### Added

- Thumb to category module
- Reference code to category module
- New CSS handles to all the modules

### Changed

- Thumb size for the selected item on the One-by-One module

### Removed

- Default `styles.css` file

## [3.1.4] - 2021-04-28

## [3.1.3] - 2021-02-25

### Fixed

- Ignore duplicated refId

## [3.1.2] - 2020-12-01

### Fixed

- Allow the app to access all the orderForms to properly run the simulation

## [3.1.1] - 2020-11-30

### Fixed

- Unmapped status message

### Added

- New status message to translation

## [3.1.0] - 2020-11-04

### Added

- Extra error messages at the preview for `Copy n Paste` and `Upload` components
- Validate items before sending to the Cart and ignore items with error

## [3.0.8] - 2020-11-04

### Fixed

- New terms of use

## [3.0.7] - 2020-10-14

### Fixed

- Doc review and update

## [3.0.6] - 2020-10-14

## [3.0.5] - 2020-10-14

### Added

- Romanian translation

## [3.0.4] - 2020-10-13

### Fixed

- Products on subcategories not being loaded

## [3.0.3] - 2020-09-10

### Added

- New metadada folder structure
- License files
- Localization file

## [3.0.2] - 2020-08-18

### Fixed

- Categories loading
- Default Seller

## [3.0.1] - 2020-08-17

### Changed

- Removed dependency on `vtex.search`
- Updated billingOptions
- Dependencies update
- Updated app store assets

### Fixed

- Missing keys loading categories
- Toast messages

## [3.0.0] - 2020-07-21

### Updated

- APP's icon update
- Documentation

### Added

- `billingOptions` to the `manifest.json`

## [2.1.0] - 2020-07-07

### Added

- New **boolean** property `componentOnly` to the blocks, default value is **true**
- New CSS Handles `textContainer`, `componentContainer` and `buttonClear`
- New Clear button to the selected product at the **Autocomplete** component

## Fixed

- Responsive layout to the `autocomplete` block

## [2.0.1] - 2020-07-01

### Updated

- Document
- `blocks.json` now makes use of `flex-layout` to host all the components by default

## [2.0.0] - 2020-06-29

### Added

- New blocks structure
- New interfaces for blocks `quickorder-textarea`, `quickorder-upload`, `quickorder-autocomplete`, `quickorder-categories`
- Blocks default structure for `store.quickorder`
- Spinner while validatin screen is loading VTEX SKU IDs based on a list of Reference Code

### Fixed

- Sellers selection and auto-selection
- Validation screen lost index after removing an item

### Updated

- Documentation

### Removed

- Single app configuration
- Site Editor Compatibility
- Billing Options
- Translations for Site Editor

## [1.0.2] - 2020-06-19

### Update

- Doc update

## [1.0.0] - 2020-06-19

### Updated

- Changing to major to remove the billing option

## [0.9.3] - 2020-06-19

### Fixed

- Sellers listing not loaded

## [0.9.2] - 2020-06-18

### Removed

- Removed billingOption from the manifest

## [0.9.1] - 2020-06-12

### Added

- Link to the cart on the Toaster success message

## [0.9.0] - 2020-06-12

### Added

- Feedback message from the checkout
- Seller selector if the store have more than one

### Fixed

- Seller always being set as `1`

## [0.8.2] - 2020-06-10

### Added

- Download a spreadsheet model for the Upload component
- CSS Handle `downloadLink`
- Dynamic text for the download link (can be updated from Site Editor)

## [0.8.1] - 2020-06-10

### Added

- Loading spinner to the Categories component

## [0.8.0] - 2020-06-09

### Added

- Custom labels for the components

## [0.7.2] - 2020-05-19

## [0.7.1] - 2020-04-30

### Fixed

- Change the Types for **ID** and **Quantity** to `Int` and `Float` to adapt to the new Graphql requirements of the dependency `vtex.checkout-resources`

## [0.7.0] - 2020-04-13

### Added

- New interface option to add items using spreadsheet file
- New CSS Handles for upload component

### Changed

- Doc update

### Fixed

- Translation keys for the editor at the admin

## [0.6.0] - 2020-04-10

### Added

- New interface option to add items from categories
- New CSS Handles for category component

### Changed

- Translation keys pattern
- Doc update

## [0.5.8] - 2020-02-24

- Doc update

## [0.5.7] - 2020-02-24

### Changed

- App's title to only Quickorder (visible at the Admin)
- Autocomplete's layout adjustments (responsive)

### Added

- Toast message when user needs to select one SKU

## [0.5.6] - 2020-02-20

### Fixed

- Merging validated items with the current list
- Preventing app to "re-check" an item's refid if it was already checked

## [0.5.5] - 2020-02-19

### Added

- Initial release with Copy/Paste and One by One modules.

### Added

- Add css handles in components parents div to manipulate styles easily.

### Added

- Add css handles to selected sku on AutoComplete block.
