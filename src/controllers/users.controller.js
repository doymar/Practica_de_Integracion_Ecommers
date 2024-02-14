import { usersService } from '../services/users.service.js'
import mongoose from 'mongoose';
import { ErrorsMessages, ErrorsNames } from '../errors/errors.enum.js';
import CustomError from '../errors/error.generator.js';

export const createUser = async (req,res) =>{
    try {
        const obj = req.body;
        const user = await usersService.createOne(obj);
        res.status(200).json({message: "User", user});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}

export const findUsers = async (req,res) =>{
    try {
        const users = await usersService.findAll();
        res.status(200).json({message: "Users", users});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}

export const findUserById = async (req,res,next) => {
    try {
        const {idUser} = req.params;
        if (!mongoose.Types.ObjectId.isValid(idUser)) {
            return CustomError.generateError(ErrorsMessages.OID_INVALID,404,ErrorsNames.OID_INVALID);
        }
        const user = await usersService.findById(idUser);
        if (!user) {
            return CustomError.generateError(ErrorsMessages.USER_NOT_FOUND,404,ErrorsNames.USER_NOT_FOUND);
        }
        res.status(200).json({message: "User", user});
    } catch (error) {
        next(error);
    }
}

export const findUserByEmail = async (req,res,next) => {
    try {
        const {email} = req.params;
        const user = await usersService.findByEmail(email);
        if (!user) {
            return CustomError.generateError(ErrorsMessages.USER_NOT_FOUND,404,ErrorsNames.USER_NOT_FOUND);
        }
        res.status(200).json({message: "User", user});
    } catch (error) {
        next(error);
    }
}

export const deleteUser = async (req,res,next) =>{
    try {
        const {idUser} = req.params;
        if (!mongoose.Types.ObjectId.isValid(idUser)) {
            return CustomError.generateError(ErrorsMessages.OID_INVALID,404,ErrorsNames.OID_INVALID);
        }
        const user = await usersService.deleteOne(idUser);
        if (!user) {
            return CustomError.generateError(ErrorsMessages.USER_NOT_FOUND,404,ErrorsNames.USER_NOT_FOUND);
        }
        res.status(200).json({ message: "User deleted" });
    } catch (error) {
        next(error);
    }
}

export const changeRole = async (req,res) =>{
    try {
        const {uid} = req.params;
        const role = await usersService.updateRole(uid);
        res.status(200).json({message: "User role changed", role: role});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}