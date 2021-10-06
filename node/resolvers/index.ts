import {
  fieldResolvers as searchFieldResolvers,
  queries as searchQueries,
} from './search'

export const resolvers = {
  ...searchFieldResolvers,
  Query: {
    ...searchQueries,
  },
}
