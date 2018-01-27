'use strict'

const express = require('express');
const graphqlHTTP = require('express-graphql');
const graphql = require ('graphql');
const Dataloader = require('dataloader');
const axios = require('axios');

// Parsing arguments
const args = require('yargs').argv;
console.log("Arguments:")
console.log(args);
const orderUrl = args.orderUrl;
const customerUrl = args.customerUrl;

// Customer repositories
class LocalCustomerRepo {

    constructor() {
        console.log("Local customer repository initialized..")
    }

    async findAll() {
        console.log("customers.findAll")
        return [
            { customerId:1, name:'Alex'},
            { customerId:2, name:'Bob'}
        ];
    }
}
class RemoteCustomerRepo {
    constructor(url) {
        console.log("Remote customer repository initialized.. Url: " + url);

        this.findAll = async () => {
            console.log("customers.findAll..")
            const response = await axios.get(url + '/api/customers');
            const data = response.data;
            console.log("customers.findAll. Received: ");
            console.log(data);
            return data;
        };
    }
}
const customerRepo = customerUrl 
    ? new RemoteCustomerRepo(customerUrl) 
    : new LocalCustomerRepo();

// Order repositories
class LocalOrderRepo {
    constructor(url) {
        console.log("Local order repository initialized..")

        const generateOrders = customerId => {
            return [
                { orderId: (customerId * 100) + 1, customerId: customerId },
                { orderId: (customerId * 100) + 2, customerId: customerId }
            ];
        }

        this.findByCustomerIds = async customerIds => {
            console.log("orders.findByCustomerIds: customerIds " + customerIds);
            return customerIds.map(generateOrders);
        }
    }
}
class RemoteOrderRepo {
    constructor(url) {
        console.log("Remote order repository initialized.. Url: " + url);

        this.findByCustomerIds = async customerIds => {
            console.log("orders.findByCustomerIds..")
            const response = await axios.get(url + '/api/orders', { params: { customerId: customerIds }});
            const data = response.data;
            console.log("orders.findByCustomerIds. Received: ");
            console.log(data);
            return data;
        }
    }
}
const orderRepo = orderUrl 
    ? new RemoteOrderRepo(orderUrl)
    : new LocalOrderRepo();


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
            // Avoiding N+1 problem with dataloader
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