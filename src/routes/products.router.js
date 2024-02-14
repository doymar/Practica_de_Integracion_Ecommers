import passport from "passport";
import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { productsMiddleware } from "../middlewares/items.middleware.js";
import { findAllProducts, findProductById, createProduct, deleteProduct, updateProduct, addProduct } from '../controllers/products.controller.js'

const router = Router();

router.get('/', findAllProducts);

router.get('/:pid', findProductById);

router.post("/", 
passport.authenticate('jwt',{session: false}),
productsMiddleware, 
authMiddleware(['admin','premium']), createProduct);

router.delete("/:idProduct", 
passport.authenticate('jwt',{session: false}),
authMiddleware(['admin','premium']), deleteProduct);

router.put("/:pid", 
passport.authenticate('jwt',{session: false}),
authMiddleware('admin'), updateProduct);

router.post("/signup", 
passport.authenticate('jwt',{session: false}),
productsMiddleware, 
authMiddleware(['admin','premium']), addProduct)

export default router