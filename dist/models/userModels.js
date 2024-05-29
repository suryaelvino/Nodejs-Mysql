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
const db_1 = require("../database/db");
const sequelize_1 = require("sequelize");
const uuid_1 = require("uuid");
class User extends sequelize_1.Model {
    static associate(models) {
        User.hasMany(models.Absen, { foreignKey: 'userId', as: 'absensi' });
    }
}
User.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        unique: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        // @ts-ignore
        indexes: [
            {
                unique: true,
                fields: ['email']
            }
        ]
    },
    phonenumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        // @ts-ignore
        indexes: [
            {
                unique: true,
                fields: ['phonenumber']
            }
        ]
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: () => 'ACTIVATE',
        allowNull: false,
    },
    created_at: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        defaultValue: () => new Date().valueOf(),
    },
    updated_at: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: false,
        defaultValue: () => new Date().valueOf()
    },
}, {
    sequelize: db_1.sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false,
});
function generateUniqueUUID() {
    return __awaiter(this, void 0, void 0, function* () {
        let uuid = (0, uuid_1.v4)();
        let existingUser = yield User.findOne({ attributes: ['id'], where: { id: uuid } });
        while (existingUser !== null) {
            uuid = (0, uuid_1.v4)();
            existingUser = yield User.findOne({ attributes: ['id'], where: { id: uuid } });
        }
        return uuid;
    });
}
User.beforeCreate((user) => __awaiter(void 0, void 0, void 0, function* () {
    user.id = yield generateUniqueUUID();
}));
exports.default = User;
//# sourceMappingURL=userModels.js.map