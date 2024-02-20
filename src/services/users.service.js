import { UserManager } from "../DAL/daos/mongo/users.mongo.js";
import { CartManager } from "../DAL/daos/mongo/carts.mongo.js";
import UsersRequestDto from "../DAL/dtos/user-request.dto.js";
import UsersResponseDto from "../DAL/dtos/user-response.dto.js";
import { hashData } from "../utils/utils.js";
import CustomError from '../errors/error.generator.js'
import { ErrorsMessages, ErrorsNames } from '../errors/errors.enum.js';

class UsersService {
    async findAll() {
        const users = await UserManager.findAll();
        return users;
    }

    async findById(id) {
        const user = await UserManager.findById(id);
        const userDTO = new UsersResponseDto(user);
        return userDTO;
    }

    async createOne(obj) {
        const hashedPassword = await hashData(obj.password);
        const newCart = await CartManager.createCart();
        //const cart = newCart._id
        const newObj = {...obj, password: hashedPassword, cart: newCart._id}
        const userDTO = new UsersRequestDto(newObj)
        const createdUser = await UserManager.createOne(userDTO);
        return createdUser;
    }

    async findByEmail(email) {
        const user = await UserManager.findByEmail(email);
        const userDTO = new UsersResponseDto(user);
        return userDTO;
    }

    async deleteOne(id) {
        const user = await UserManager.deleteOne(id);
        return user;
    }

    async updateRole(id) {
        const user = await UserManager.findById(id)
        const docs = user.documents
        const dni = docs.find((d) => d.name === "dni");
        const bank = docs.find((d) => d.name === "bank");
        const adddress = docs.find((d) => d.name === "address");
        if(user.role === 'user'){
            if(!dni || !bank || !adddress){
                return CustomError.generateError(ErrorsMessages.USER_DOCUMENTS_NOT_FOUND,400,ErrorsNames.USER_DOCUMENTS_NOT_FOUND);
            }
            user.role = 'premium'
        } else {
            user.role = 'user'
        }
        await user.save();
        return user.role;
    }

    async saveUserDocuments(id, dni, address, bank) {
        const savedDocuments = await UserManager.updateOne(id, {
            documents: [
            {
                name: "dni",
                reference: dni[0].path,
            },
            {
                name: "address",
                reference: address[0].path,
            },
            {
                name: "bank",
                reference: bank[0].path,
            },
            ],
        });
        return savedDocuments;
  };
}

export const usersService = new UsersService();