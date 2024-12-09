/**
 * File: src/server.js
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import router from "./controllers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Middleware to parse JSON request bodies.
 * @param {express.Application} app - The Express application instance.
 * @returns {express.Application} - The Express application with JSON middleware applied.
 */
const jsonMiddleware = (app) => app.use(express.json());

/**
 * Middleware to parse URL-encoded request bodies.
 * @param {express.Application} app - The Express application instance.
 * @returns {express.Application} - The Express application with URL-encoded middleware applied.
 */
const urlencodedMiddleware = (app) => app.use(express.urlencoded({ extended: true }));

/**
 * Middleware to serve static files from the "public" directory.
 * @param {express.Application} app - The Express application instance.
 * @returns {express.Application} - The Express application with static middleware applied.
 */
const staticMiddleware = (app) => app.use(express.static("public"));

/**
 * Middleware to set CORS headers.
 * @param {express.Application} app - The Express application instance.
 * @returns {express.Application} - The Express application with CORS middleware applied.
 */
const corsMiddleware = (app) =>
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
  });

/**
 * Middleware to attach the router for "/api" routes.
 * @param {express.Application} app - The Express application instance.
 * @returns {express.Application} - The Express application with "/api" routes attached.
 */
const apiRoutes = (app) => app.use("/api", router);

/**
 * Middleware to handle all unmatched routes and serve the index.html file.
 * @param {express.Application} app - The Express application instance.
 * @returns {express.Application} - The Express application with catch-all middleware applied.
 */
const catchAllMiddleware = (app) =>
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });

/**
 * Compose multiple middleware functions into a single function.
 * @param {...Function} middlewares - The middleware functions to compose.
 * @returns {Function} - A function that applies all middlewares to an Express app.
 */
const composeMiddlewares = (...middlewares) => (app) =>
  middlewares.reduce((acc, middleware) => middleware(acc), app);

// Create the app and apply middlewares
const app = composeMiddlewares(
  jsonMiddleware,
  urlencodedMiddleware,
  staticMiddleware,
  corsMiddleware,
  apiRoutes,
  catchAllMiddleware
)(express());

export default app;
