interface SearchAutocompleteItem {
    productId: string
    itemId: string
    name: string
    nameComplete: string
    imageUrl: string
  }

interface SearchAutocompleteUnit {
    items: SearchAutocompleteItem[]
    thumb: string
    thumbUrl: string | null
    name: string
    href: string
  }
