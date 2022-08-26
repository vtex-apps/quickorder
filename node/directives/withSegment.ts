import type { GraphQLField } from 'graphql'
import { defaultFieldResolver } from 'graphql'
import { SchemaDirectiveVisitor } from 'graphql-tools'
import atob from 'atob'

export class WithSegment extends SchemaDirectiveVisitor {
  public visitFieldDefinition(field: GraphQLField<any, any>) {
    const { resolve = defaultFieldResolver } = field

    field.resolve = async (root, args, ctx: Context, info) => {
      const {
        vtex: { segmentToken },
        clients: { segment },
      } = ctx

      ctx.vtex.segment = segmentToken
        ? JSON.parse(atob(segmentToken))
        : await segment.getSegment()

      return resolve(root, args, ctx, info)
    }
  }
}
