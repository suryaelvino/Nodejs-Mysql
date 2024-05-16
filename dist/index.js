"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const body_parser_1 = __importDefault(require("body-parser"));
const userRoutes_1 = require("./src/routes/userRoutes");
const token_1 = require("./src/helpers/token");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const limiter = (maxRequests) => (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use((0, cors_1.default)());
app.use(body_parser_1.default.text());
app.use(body_parser_1.default.json({ limit: "50mb" }));
app.use(body_parser_1.default.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
const corsOptions = {
    origin: ['http://localhost:8100', 'http://127.0.0.1:8100'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
const services = [
    userRoutes_1.userRoutes,
];
const authWithoutToken = [
    "login", "register", "forgotpassword", "updatenewpassword"
];
const adminToken = [
    "getlistadmin", "getdetailadmin/:id", "addadmin", "updateadmin/:id", "changepwadmin/:id", "deleteeadmin/:id"
];
services.forEach(registerService);
function registerService(routes) {
    routes.map((route) => {
        const method = route.method.toLowerCase();
        const url = route.url;
        const withoutToken = authWithoutToken.some((routePart) => url.includes(routePart));
        const adminpath = adminToken.some((routePart) => url.includes(routePart));
        switch (method) {
            case 'get':
                if (adminpath) {
                    // app.get(url, cors(corsOptions), authenticateAdmin, limiter(60), route.handler);
                    app.get(url, (0, cors_1.default)(corsOptions), limiter(60), route.handler);
                }
                else {
                    // app.get(url, cors(corsOptions), authenticateUser , limiter(60), route.handler);
                    app.get(url, (0, cors_1.default)(corsOptions), limiter(60), route.handler);
                }
                break;
            case 'post':
                if (withoutToken) {
                    app.post(url, (0, cors_1.default)(corsOptions), limiter(5), route.handler);
                }
                else if (adminpath) {
                    // app.post(url, cors(corsOptions), authenticateAdmin, limiter(60), route.handler);
                    app.post(url, (0, cors_1.default)(corsOptions), limiter(60), route.handler);
                }
                else {
                    // app.post(url, cors(corsOptions), authenticateUser, limiter(60), route.handler);
                    app.post(url, (0, cors_1.default)(corsOptions), limiter(60), route.handler);
                }
                break;
            case 'put':
                if (adminpath) {
                    app.put(url, (0, cors_1.default)(corsOptions), token_1.authenticateAdmin, limiter(60), route.handler);
                }
                else {
                    app.put(url, (0, cors_1.default)(corsOptions), token_1.authenticateUser, limiter(60), route.handler);
                }
                break;
            case 'delete':
                if (adminpath) {
                    app.delete(url, (0, cors_1.default)(corsOptions), token_1.authenticateAdmin, limiter(60), route.handler);
                }
                else {
                    // app.delete(url, cors(corsOptions), authenticateUser, limiter(60), route.handler);
                    app.delete(url, (0, cors_1.default)(corsOptions), limiter(60), route.handler);
                }
                break;
            case 'patch':
                if (adminpath) {
                    app.patch(url, (0, cors_1.default)(corsOptions), token_1.authenticateAdmin, limiter(60), route.handler);
                }
                else {
                    app.patch(url, (0, cors_1.default)(corsOptions), token_1.authenticateUser, limiter(60), route.handler);
                }
                break;
            default:
                console.warn(`Unknown method '${method}' for route '${url}'`);
                break;
        }
    });
}
app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map