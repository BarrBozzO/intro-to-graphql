import { Product } from './product.model'
import { User, roles } from '../user/user.model'
import { AuthenticationError } from 'apollo-server'
import mongoose from 'mongoose'

const productsTypeMatcher = {
  GAMING_PC: 'GamingPc',
  BIKE: 'Bike',
  DRONE: 'Drone'
}

export default {
  Query: {
    product: function(_, { id }) {
      const item = Product.findById(id).exec()
      return item
    },
    products: function() {
      return Product.find().exec()
    }
  },
  Mutation: {
    newProduct(_, { input }, ctx) {
      return Product.create({
        ...input,
        createdBy: ctx.user._id
      })
    },
    updateProduct(_, { id, input }) {
      return Product.findByIdAndUpdate(
        id,
        {
          ...input
        },
        { new: true }
      )
        .lean()
        .exec()
    },
    removeProduct: function(_, { id }) {
      return Product.findByIdAndRemove(id)
    }
  },
  Product: {
    __resolveType(product) {},
    createdBy: function(product) {
      // because it is always called from Product
      return User.findById(product.createdBy)
        .lean()
        .exec()
    }
  }
}
