node ./graphql-api-gateway/server.js --customerUrl="http://localhost:8081" --orderUrl="http://localhost:8082" \
    & node ./customer-service/server.js 8081 \
    & node ./order-service/server.js 8082