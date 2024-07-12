import sequelize from "../db.js";
import {DataTypes} from 'sequelize'



const User = sequelize.define('User', {
    email: {type: DataTypes.STRING, unique: true, required: true},
    password: {type: DataTypes.STRING, required: true},
    isActivated: {type: DataTypes.BOOLEAN, default: false},
    activationLink: {type: DataTypes.STRING}
})

export {User}