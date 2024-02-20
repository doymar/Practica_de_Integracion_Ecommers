import multer from "multer";
import { __dirname } from '../utils/utils.js';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if(file.fieldname === 'profiles'){
            cb(null, `${__dirname}/docs/profiles`);
        } else if (file.fieldname === 'products') {
            cb(null, `${__dirname}/docs/products`);
        } else {
            cb(null, `${__dirname}/docs/documents`);
        }  
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});

const upload = multer({storage: storage});

export default upload;