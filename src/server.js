import { ApolloServer } from 'apollo-server'
import { loadTypeSchema } from './utils/schema'
import { merge } from 'lodash'
import config from './config'
import { connect } from './db'
import product from './types/product/product.resolvers'
import coupon from './types/coupon/coupon.resolvers'
import user from './types/user/user.resolvers'

const types = ['product', 'coupon', 'user']

export const start = async () => {
  const rootSchema = `
    interface User {
      id: String!
      name: String!
    }

    type Admin implements User {
      id: String!
      name: String!
      permissions: Boolean
    }

    type Client implements User {
      id: String!
      name: String!
      subscription: String!
    }

    type Query {
      getUsers: [User]!
    }

    schema {
      query: Query
    }
  `
  const schemaTypes = await Promise.all(types.map(loadTypeSchema))

  const server = new ApolloServer({
    typeDefs: [rootSchema],
    resolvers: {
      Query: {
        getUsers: function() {
          return [
            { id: '1', name: 'John', permissions: true },
            { id: '2', name: 'Edward', subscription: 'free' }
          ]
        }
      },
      User: {
        __resolveType: function(user) {
          return user.hasOwnProperty('subscription') ? 'Client' : 'Admin'
        }
      }
    },
    context({ req }) {
      // use the authenticate function from utils to auth req, its Async!
      return { user: null }
    }
  })

  await connect(config.dbUrl)
  const { url } = await server.listen({ port: config.port })

  console.log(`GQL server ready at ${url}`)
}
