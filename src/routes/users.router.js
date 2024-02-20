import { Router } from "express";
import { jwtValidation } from "../middlewares/jwt.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { findUsers, findUserById, findUserByEmail, deleteUser, changeRole, saveUserDocuments } from '../controllers/users.controller.js'
import passport from "passport";
import upload from "../middlewares/multer.middleware.js";
const router = Router();

router.get("/", findUsers);

router.get("/:idUser", 
    //jwtValidation, 
    passport.authenticate('jwt', {session: false}),
    authMiddleware('user'), 
    findUserById
);

// router.get("/:email", findUserByEmail)

router.delete("/:idUser", deleteUser)

router.get('/premium/:uid', changeRole)

router.post('/:uid/documents', upload.fields([
    {name: 'dni', maxCount: 1},
    {name: 'address', maxCount: 1},
    {name: 'bank', maxCount: 1},
]), saveUserDocuments
);

export default router;