const express = require('express');
const graphqlHTTP = require('express-graphql');
const graphql = require ('graphql');
const Dataloader = require('dataloader');

// Repositories
const customerRepo = {
    findAll: async () => {
        console.log("customers.findAll")
        return [
            { customerId:1, name:'Alex'},
            { customerId:2, name:'Bob'}
        ];
    }
}

const generateOrders = customerId => [
    { orderId: (customerId * 100) + 1, customerId: customerId },
    { orderId: (customerId * 100) + 2, customerId: customerId }
];
const orderRepo = {
    findByCustomerId: async (customerId) => {
        console.log("orders.findByCustomerId: customerId " + customerId)
        return generateOrders(customerId)
    },
    findByCustomerIds: async (customerIds) => {
        console.log("orders.findByCustomerIds: customerIds " + customerIds)
        return customerIds.map(generateOrders)
    }
}

// Helper functions
const ordersLoader = new Dataloader(orderRepo.findByCustomerIds, { cache: false })

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
            // Causes N+1 problem
            //resolve: async customer => orderRepo.getByCustomerId(customer.customerId)
            // Avoids N+1 problem with dataloader
            resolve: async customer => ordersLoader.load(customer.customerId)
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
                resolve: customerRepo.findAll
            }
        }
    }
});

const schema = new graphql.GraphQLSchema({ 
    query: queryType
});

// Run app
const app = express();
app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');