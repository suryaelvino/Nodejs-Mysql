"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDatabaseConnection = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize('tests', 'root', 'Elvino12_', {
    host: 'localhost',
    dialect: 'mysql',
});
exports.sequelize = sequelize;
function testDatabaseConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield sequelize.authenticate();
            console.log('Connection to the database has been established successfully.');
        }
        catch (err) {
            console.error('Unable to connect to the database:', err);
        }
    });
}
exports.testDatabaseConnection = testDatabaseConnection;
//# sourceMappingURL=db.js.map