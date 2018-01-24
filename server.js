const express = require('express');
const graphqlHTTP = require('express-graphql');
const graphql = require ('graphql');

const customerRepo = {
    getAll: async () => {
        console.log("Get customers")
        return [
            { customerId:1, name:'Alex'},
            { customerId:2, name:'Bob'}
        ];
    }
}

const orderRepo = {
    getByCustomerId: async (customer, args, ast) => {
        console.log("Get orders: customerId " + customer.customerId)
        const customerId = customer.customerId
        return [
            { orderId: (customerId * 100) + 1, customerId: customerId },
            { orderId: (customerId * 100) + 2, customerId: customerId }
        ]
    }
}

// Construct a schema
const CustomerType = new graphql.GraphQLObjectType({
    name: 'customer',
    fields: () => {
      return {
        customerId: {
          type: graphql.GraphQLInt
        },
        name: {
          type: graphql.GraphQLString
        },
        orders: {
            type: new graphql.GraphQLList(OrderType),
            resolve: orderRepo.getByCustomerId
        }
      }
    }
  });

const OrderType = new graphql.GraphQLObjectType({
    name: 'order',
    fields: () => {
      return {
        orderId: {
          type: graphql.GraphQLInt
        },
        customerId: {
          type: graphql.GraphQLInt
        }
      }
    }
  });

const queryType = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: () => {
      return {
        customers: {
          type: new graphql.GraphQLList(CustomerType),
          resolve: customerRepo.getAll
        }
      }
    }
  });

const schema = new graphql.GraphQLSchema({ 
    query: queryType
});

const app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');