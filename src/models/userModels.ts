import { sequelize } from "../database/db";
import { Model, DataTypes } from 'sequelize'; 
import { v4 as uuidv4 } from 'uuid';

class User extends Model {
    public id!: string;
    public name!: string;
    public email!: string;
    public phonenumber!: string;
    public password!: string;
    public role!: string;
    public status!: string;
    public created_at!: number;
    public updated_at!: number;

    static associate(models: any) {
        User.hasMany(models.Absen, { foreignKey: 'userId', as: 'absensi' });
    }
}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            unique: true,
            defaultValue: DataTypes.UUIDV4
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false,
        },
        email: {
            type: DataTypes.STRING,
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
            type: DataTypes.STRING,
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
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: () => 'ACTIVATE',
            allowNull: false,
        },
        created_at: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: () => new Date().valueOf(),
        },
        updated_at: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: () => new Date().valueOf()
        },
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: false,
    }
);

async function generateUniqueUUID(): Promise<string> {
    let uuid = uuidv4();
    let existingUser = await User.findOne({ attributes: ['id'], where: { id: uuid } });
    while (existingUser !== null) {
        uuid = uuidv4();
        existingUser = await User.findOne({ attributes: ['id'], where: { id: uuid } });
    }
    return uuid;
}

User.beforeCreate(async (user) => {
    user.id = await generateUniqueUUID();
});

export default User;
