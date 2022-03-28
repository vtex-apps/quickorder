/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.graphql' {
  import type { DocumentNode } from 'graphql'

  const value: DocumentNode
  export default value
}

declare module '*.gql' {
  const gql: any
  export default gql
}
