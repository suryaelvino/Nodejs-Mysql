"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const userControllers_1 = __importDefault(require("../controllers/userControllers"));
const api = 'api';
const users = 'users';
const userRoutes = [
    { url: `/${api}/${users}/getlist`, method: "get", handler: userControllers_1.default.getAllUsers },
    { url: `/${api}/${users}/getdetail/:id`, method: "get", handler: userControllers_1.default.getUserById },
    { url: `/${api}/${users}/add`, method: "post", handler: userControllers_1.default.createUser },
    { url: `/${api}/${users}/update/:id`, method: "put", handler: userControllers_1.default.updateUser },
    { url: `/${api}/${users}/delete/:id`, method: "delete", handler: userControllers_1.default.deleteUser }
];
exports.userRoutes = userRoutes;
//# sourceMappingURL=userRoutes.js.map