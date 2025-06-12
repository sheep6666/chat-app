const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Chat App API',
            version: '1.0.0',
            description: 'API documentation for the Chat Application',
        },
        servers: [
            {
                url: 'http://localhost:5001',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.js'], // 指向你的路由檔案，這裡假設你放在 routes/
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
