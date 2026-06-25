import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

// Registers all Better Auth HTTP routes under /api/auth
authComponent.registerRoutes(http, createAuth);

export default http;