export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Universal Commerce Platform API",
    version: "0.1.0",
    description: "REST API for the configurable universal commerce platform.",
  },
  servers: [{ url: "/api" }],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          "200": { description: "Service is healthy" },
        },
      },
    },
    "/auth/register": {
      post: {
        summary: "Register a customer account",
        responses: {
          "201": { description: "Account created" },
        },
      },
    },
    "/products": {
      get: {
        summary: "Search products and generate dynamic filters",
        responses: {
          "200": { description: "Product search result" },
        },
      },
      post: {
        summary: "Create a configurable product",
        responses: {
          "201": { description: "Product created" },
        },
      },
    },
    "/orders/{id}/status": {
      patch: {
        summary: "Move an order through the status state machine",
        responses: {
          "200": { description: "Order status updated" },
          "409": { description: "Invalid status transition" },
        },
      },
    },
  },
};
