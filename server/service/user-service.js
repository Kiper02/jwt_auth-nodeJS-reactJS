import { User } from "../db/models/user-model.js"
import bcrypt from 'bcrypt'
import {v4 as uuidv4} from 'uuid'
import mailService from "./mail-service.js"
import tokenService from "./token-service.js"
import UserDto from "../dtos/user-dto.js"
import ApiError from "../exceptions/api-error.js"

class UserService {
    async registration(email, password) {
        const candidate = await User.findOne({where: {email}})
        if(candidate) {
            throw ApiError.BadRequest(`Пользователь с почтовым адрессом ${email} уже существует`)
        }
        const hashPassword = await bcrypt.hash(password, 3)
        const activateLink =  uuidv4()
        const user = await User.create({email, password: hashPassword, activationLink: activateLink})
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activateLink}`);
        
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {
            ...tokens, 
            user: userDto
        }
    }

    async activate(activationLink) {
        const user = await User.findOne({where: {activationLink}})
        if(!user) {
            throw ApiError.BadRequest('Некорректная ссылка авторизации')
        }
        user.isActivated = true;
        await user.save()
    } 
    async login(email, password) {
        const user = await User.findOne({where: {email}})
        if(!user) {
            throw ApiError.BadRequest('Пользователь с таким email не найден')
        }
        const isPassEquals = await bcrypt.compare(password, user.password)
        if(!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль')
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto})
        
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {
            ...tokens, 
            user: userDto
        }
    }
    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token
    }

    async refresh(refreshToken) {
        if(!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        console.log(userData);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if(!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }
        const user = await User.findByPk(userData.id)
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto})
        
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {
            ...tokens, 
            user: userDto
        }
    }
    
    async getAllUsers() {
        const users = await User.findAll();
        return users;
    }
}

export default new UserService()