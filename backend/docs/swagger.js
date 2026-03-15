const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Student Authentication API",
      version: "1.0.0",
      description: "Production-ready backend APIs for student verification, OTP, and JWT auth",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development",
      },
      {
        url: "https://your-domain.com",
        description: "Production",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        VerifyStudentRequest: {
          type: "object",
          required: ["studentId", "mobileNumber"],
          properties: {
            studentId: { type: "string", example: "STU101" },
            mobileNumber: { type: "string", example: "9876543210" },
          },
        },
        SendOtpRequest: {
          type: "object",
          required: ["studentId"],
          properties: {
            studentId: { type: "string", example: "STU101" },
          },
        },
        VerifyOtpRequest: {
          type: "object",
          required: ["studentId", "otp"],
          properties: {
            studentId: { type: "string", example: "STU101" },
            otp: { type: "string", example: "123456" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["studentId", "password"],
          properties: {
            studentId: { type: "string", example: "STU101" },
            password: { type: "string", example: "123456" },
          },
        },
      },
    },
    paths: {
      "/api/auth/verify-student": {
        post: {
          tags: ["Auth"],
          summary: "Verify student by studentId and mobile number",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/VerifyStudentRequest" },
              },
            },
          },
          responses: {
            200: { description: "Student verified" },
            404: { description: "Student not found" },
          },
        },
      },
      "/api/auth/send-otp": {
        post: {
          tags: ["Auth"],
          summary: "Generate and send OTP to verified student mobile",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SendOtpRequest" },
              },
            },
          },
          responses: {
            200: { description: "OTP generated" },
            404: { description: "Student not found" },
          },
        },
      },
      "/api/auth/verify-otp": {
        post: {
          tags: ["Auth"],
          summary: "Verify OTP",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/VerifyOtpRequest" },
              },
            },
          },
          responses: {
            200: { description: "OTP verified" },
            400: { description: "Invalid or expired OTP" },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login with studentId and password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
              },
            },
          },
          responses: {
            200: { description: "JWT token generated" },
            401: { description: "Wrong password" },
          },
        },
      },
      "/api/auth/profile": {
        get: {
          tags: ["Auth"],
          summary: "Get logged-in student profile",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Profile data returned" },
            401: { description: "Invalid JWT token" },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
