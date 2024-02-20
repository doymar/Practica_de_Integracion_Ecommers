import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    }, 
    email: {
        type: String,
        required: true,
        unique: true,
        //Forma de indexar un campo que no sea unique
        //index: true;
    },
    age: {
        type: Number,
    },
    password: {
        type: String,
        required: true,
    },
    cart: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Carts",
    },
    isGithub: {
        type: Boolean,
        default: false,
    },
    isGoogle: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ['admin','premium','user'],
        default: 'user',
    },
    documents: {
        type: [
            {
                name: String,
                reference: String,
            },
        ],
        default: [],
    },
    last_connection: {
        type: String,
    },
});

export const usersModel = mongoose.model("Users", usersSchema);