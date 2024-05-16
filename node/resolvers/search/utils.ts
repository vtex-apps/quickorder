/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Functions } from '@gocommerce/utils'

/**
 * We are doing this because the `get category` API is not returning the values
 * for slug and href. So we get the whole category tree and get that info from
 * there instead until the Search team fixes this issue with the category API.
 */

/**
 * That's a recursive function to fill an object like { [categoryId]: Category }
 * It will go down the category.children appending its children and so on.
 */

export const searchEncodeURI = (account: string) => (str: string) => {
  if (!Functions.isGoCommerceAcc(account)) {
    return str.replace(/[%"'.()]/g, (c: string) => {
      switch (c) {
        case '%':
          return '@perc@'

        case '"':
          return '@quo@'

        case "'":
          return '@squo@'

        case '.':
          return '@dot@'

        case '(':
          return '@lpar@'

        case ')':
          return '@rpar@'

        default: {
          return c
        }
      }
    })
  }

  return str
}
