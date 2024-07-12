import sequelize from "../db.js";
import {DataTypes} from 'sequelize'
import { User } from "./user-model.js";



const Token = sequelize.define('Token', {
    refreshToken: {type: DataTypes.STRING, required: true}
})

User.hasOne(Token, {foreignKey: 'userId'})
Token.belongsTo(User, {foreignKey: 'userId'})

export {Token}