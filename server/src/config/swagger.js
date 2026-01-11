import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MyShows API",
      version: "1.0.0",
      description: "API documentation for Movie Reservation System",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
  apis: ["./src/routes/*.js"], // where Swagger looks for docs
};

export const swaggerSpec = swaggerJsdoc(options);
