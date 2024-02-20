import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { ProductManager } from "../DAL/daos/mongo/products.mongo.js";
import { CartManager } from "../DAL/daos/mongo/carts.mongo.js";
import { randomProducts } from '../utils/faker.js';
import { logger } from "../utils/logger.js";

const router = Router();

router.get("/", authMiddleware('user'), (req,res)=>{
    res.render("chat");
});

router.get("/login",(req,res) => {
    if (req.user) {
        return res.redirect("/home")
    }
    res.render('login')
});

router.get("/signup2",(req,res) => {
    if (req.user) {
        return res.redirect("/home")
    }
    res.render('signup2')
});

router.get("/restaurar/:email",(req,res) => {
    const {email} = req.params
    if (!req.cookies.token){
        return res.redirect("/password_rest")
    }
    res.render('restaurar',{mail: email})
});

router.get('/password_reset',(req,res)=>{
    res.render('password_reset')
})

router.get('/product/:idProduct',async(req,res)=>{
    const {idProduct} = req.params
    const response = await ProductManager.findById(idProduct);
    res.render('product',{product: response.toObject()});
});

router.get('/home', async (req,res) => {
    if (!req.user) {
        return res.redirect("/login")
    }
    const response = await ProductManager.findAll(req.query);
    const {info} = response
    const {payload} = info 
    const productsData = payload.map(doc => doc.toObject());
    const {first_name, email, role} = req.user;
    res.render("home",{products: productsData, user: {first_name, email, role}})
});

router.get('/signup',(req,res)=>{
    res.render("signup");
});

router.get('/profile/:idProduct',async(req,res)=>{
    const {idProduct} = req.params
    const response = await ProductManager.findById(idProduct);
    res.render('profile',{product: response.toObject()});
});

router.get('/products', async(req,res) => {
    res.render('products', {})
});

router.get('/carts/:cid', async (req,res) => {
    const {cid} = req.params;
    try {
        const cart = await CartManager.findCartById(cid);
        const cartProducts = cart.products.map(doc => doc.toObject());
        res.render('carts', {products: cartProducts})
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

router.get('/mockingproducts', async (req,res) => {
    try {
        const products = randomProducts();
        res.status(200).json({ products });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

router.get("/loggerTest", (req, res) => {
    logger.fatal("Prueba logger fatal");
    logger.error("Prueba logger error");
    logger.warning("Prueba logger warning");
    logger.info("Prueba logger info");
    logger.http("Prueba logger http");
    logger.debug("Prueba logger debug");
    res.send("Prueba de loggers")
});

router.get("/documents", (req, res) => {
    if (!req.user) {
        return res.redirect("/login")
    }
    const {id} = req.user; 
    res.render("documents", {uid: id});
  });

export default router;