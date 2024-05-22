import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import { userRoutes } from './src/routes/userRoutes';
import { authenticateAdmin, authenticateUser } from './src/helpers/token';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

const limiter = (maxRequests: number) => rateLimit({
    windowMs: 1 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(cors());
app.use(bodyParser.text());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
const corsOptions = {
    origin: ['http://localhost:8100', 'http://127.0.0.1:8100'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

const services = [
    userRoutes,
];

const authWithoutToken = [
    "login", "register", "forgotpassword", "updatenewpassword"
]

const adminToken = [
    "getlistadmin", "getdetailadmin/:id", "addadmin", "updateadmin/:id", "changepwadmin/:id", "deleteeadmin/:id"
]

services.forEach(registerService);

function registerService(routes: any) {
    routes.map((route: any) => {
        const method = route.method.toLowerCase();
        const url = route.url;
        const withoutToken = authWithoutToken.some((routePart) => url.includes(routePart));
        const adminpath = adminToken.some((routePart) => url.includes(routePart));
        switch (method) {
            case 'get':
                if (adminpath) {
                    // app.get(url, cors(corsOptions), authenticateAdmin, limiter(60), route.handler);
                    app.get(url, cors(corsOptions), limiter(100), route.handler);
                }
                else {
                    // app.get(url, cors(corsOptions), authenticateUser , limiter(60), route.handler);
                    app.get(url, cors(corsOptions), limiter(100), route.handler);
                }
                break;
            case 'post':
                if (withoutToken) {
                    app.post(url, cors(corsOptions), limiter(100), route.handler);
                }
                else if (adminpath) {
                    // app.post(url, cors(corsOptions), authenticateAdmin, limiter(60), route.handler);
                    app.post(url, cors(corsOptions), limiter(600), route.handler);
                }
                else {
                    // app.post(url, cors(corsOptions), authenticateUser, limiter(60), route.handler);
                    app.post(url, cors(corsOptions), limiter(600), route.handler);
                }
                break;
            case 'put':
                if (adminpath) {
                    app.put(url, cors(corsOptions), authenticateAdmin, limiter(60), route.handler);
                }
                else {
                    app.put(url, cors(corsOptions), authenticateUser, limiter(60), route.handler);
                }
                break;
            case 'delete':
                if (adminpath) {
                    app.delete(url, cors(corsOptions), authenticateAdmin, limiter(60), route.handler);
                }
                else {
                    // app.delete(url, cors(corsOptions), authenticateUser, limiter(60), route.handler);
                    app.delete(url, cors(corsOptions),  limiter(60), route.handler);
                }
                break;
            case 'patch':
                if (adminpath) {
                    app.patch(url, cors(corsOptions), authenticateAdmin, limiter(60), route.handler);
                }
                else {
                    app.patch(url, cors(corsOptions), authenticateUser, limiter(60), route.handler);
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

export { app };