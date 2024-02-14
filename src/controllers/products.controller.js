import { productsService } from '../services/products.service.js'
import CustomError from '../errors/error.generator.js'
import { ErrorsMessages, ErrorsNames } from '../errors/errors.enum.js';
import mongoose from 'mongoose';

export const findAllProducts = async(req,res)=>{
    try{
        const products = await productsService.findAll(req.query);
        res.status(200).json({message:'Products found',products});
    }catch(error){
        res.status(500).json({message: error.message});
    }
}

export const findProductById = async(req,res,next)=>{
    try {
      const {pid} = req.params
      if (!mongoose.Types.ObjectId.isValid(pid)) {
        return CustomError.generateError(ErrorsMessages.OID_INVALID,404,ErrorsNames.OID_INVALID);
      }
      const product = await productsService.findById(pid);
      if(!product){
          return CustomError.generateError(ErrorsMessages.PRODUCTS_NOT_FOUND,404,ErrorsNames.PRODUCTS_NOT_FOUND);
      }
      res.status(200).json({message:'Product found',product});
    } catch (error) {
      next(error);
    }
}

export const createProduct = async (req, res, next) => {
    try {
      const response = await productsService.createOne({...req.body, owner: req.user.email});
      if(!response){
        //return res.status(400).json({message: "Code already used"});
        return CustomError.generateError(ErrorsMessages.PRODUCT_CODE_ALREADY_USED,400,ErrorsMessages.PRODUCT_CODE_ALREADY_USED)
      }
      res.status(200).json({ message: "Product created", product: response });
    } catch (error) {
      next(error);
    }
}

export const deleteProduct = async (req, res, next) => {
    try {
      const { idProduct } = req.params;
      if (!mongoose.Types.ObjectId.isValid(idProduct)) {
        return CustomError.generateError(ErrorsMessages.OID_INVALID,404,ErrorsNames.OID_INVALID);
      }
      const user = req.user
      const response = await productsService.deleteOne(idProduct, user);
      if (!response) {
        return CustomError.generateError(ErrorsMessages.PRODUCTS_NOT_FOUND,404,ErrorsNames.PRODUCTS_NOT_FOUND);
      }
      res.status(200).json({ message: "Product deleted" });
    } catch (error) {
      next(error);
    }
}

export const updateProduct = async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(pid)) {
        return CustomError.generateError(ErrorsMessages.OID_INVALID,404,ErrorsNames.OID_INVALID);
      }
      const response = await productsService.updateOne(pid, req.body);
      if (!response) {
        return CustomError.generateError(ErrorsMessages.PRODUCTS_NOT_FOUND,404,ErrorsNames.PRODUCTS_NOT_FOUND);
      }
      res.status(200).json({ message: "Product updated" });
    } catch (error) {
      next(error);
    }
}

export const addProduct = async(req,res)=>{
    try {
      const response = await productsService.createOne({...req.body, owner: req.user.email});
      res.redirect(`/profile/${response.id}`);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
}