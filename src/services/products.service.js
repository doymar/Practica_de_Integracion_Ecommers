import { ProductManager } from "../DAL/daos/mongo/products.mongo.js";
import CustomError from '../errors/error.generator.js'
import { ErrorsMessages, ErrorsNames } from '../errors/errors.enum.js';

class ProductsService {
    async findAll(obj) {
        const products = await ProductManager.findAll(obj);
        return products;
    } 

    async findById(id) {
        const product = await ProductManager.findById(id);
        return product;
    }
    
    async createOne(obj) {
        const product = await ProductManager.createOne(obj);
        return product;
    }

    async deleteOne(id,user) {
        const prod = await ProductManager.findById(id)
        if (!prod.owner == user.email || !user.role == 'admin'){
            return CustomError.generateError(ErrorsMessages.INVALID_CREDENTIALS,403,ErrorsNames.INVALID_CREDENTIALS);
        }
        const product = await ProductManager.deleteOne(id);
        return product;
    }

    async updateOne(id, obj) {
        const product = await ProductManager.updateOne(id, obj);
        return product;
    }
}

export const productsService = new ProductsService();