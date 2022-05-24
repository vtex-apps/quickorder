import vtexContext from './vtexContext'

describe('Main file', () => {
  const { Query, resolvers, Service } = vtexContext()

  it('Instances should be defined', () => {
    expect(Service).toBeDefined()
    expect(resolvers).toBeDefined()
    expect(Query).toBeDefined()
  })
})
