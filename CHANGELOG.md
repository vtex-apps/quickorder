# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
