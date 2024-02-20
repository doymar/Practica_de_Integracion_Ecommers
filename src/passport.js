import passport from "passport";
import { UserManager } from "./DAL/daos/mongo/users.mongo.js";
import { usersService } from "./services/users.service.js";
import { CartManager } from "./DAL/daos/mongo/carts.mongo.js";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GithubStrategy } from "passport-github2";
import { Strategy as GoogleStrategy} from "passport-google-oauth20";
import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt";
import { hashData, compareData } from "./utils/utils.js";
import config from './config/config.js'

//local
passport.use('signup', new LocalStrategy({ passReqToCallback: true, usernameField: 'email'},
    async(req, email, password, done)=> {
    try {
        const createdUser = await usersService.createOne(req.body);
        done(null, createdUser)
    } catch (error) {
        done(error)
    }
}));

passport.use('login', new LocalStrategy({usernameField: 'email'}, async(email, password, done) =>{
    if(!email || !password){
        return done(null, false, {message: "All fields are required"})
    }
    try {
        const user = await UserManager.findByEmail(email);
        if(!user) {
            return done(null, false, { message: "Incorrect email or password." });
        }
        const isPasswordValid = await compareData(password,user.password);
        if(!isPasswordValid) {
            return done(null, false, { message: "Incorrect email or password." });
        }
        const fecha = new Date(Date.now());
        await UserManager.updateOne(user._id, {last_connection: fecha})
        done(null, user);
    } catch (error) {
        done(error)
    }
}))

//github
passport.use('github', new GithubStrategy(
    {
        clientID: config.github_clientid,
        clientSecret: config.github_clientsecret,
        callbackURL: "http://localhost:8080/api/sessions/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const userDB = await UserManager.findByEmail(profile._json.email);
            //login
            if(userDB){
                if(userDB.isGithub){
                    const fecha = new Date(Date.now());
                    await UserManager.updateOne(userDB._id, {last_connection: fecha})
                    return done(null, userDB)
                } else {
                    return done(null, false)
                }
            }
            //signup
            const infoUser ={
                first_name: profile._json.name.split(' ')[0],
                last_name: profile._json.name.split(' ')[1],
                email: profile._json.email,
                password: ' ',
                isGithub: true
            };
            const newCart = await CartManager.createCart();
            const newObj = {...infoUser, cart: newCart._id}
            const createdUser = await UserManager.createOne(newObj);
            done(null, createdUser);
        } catch (error) {
            done(error)
        }
    }
))

//google
passport.use('google', new GoogleStrategy(
    {
        clientID: config.google_clientid,
        clientSecret: config.google_clientsecret,
        callbackURL: "http://localhost:8080/api/sessions/auth/google/callback"
    },
    async function(accessToken, refreshToken, profile, done){
        try {
            const userDB = await UserManager.findByEmail(profile._json.email);
            //login
            if(userDB){
                if(userDB.isGoogle){
                    const fecha = new Date(Date.now());
                    await UserManager.updateOne(userDB._id, {last_connection: fecha})
                    return done(null, userDB)
                } else {
                    return done(null, false)
                }
            }
            //signup
            const infoUser ={
                first_name: profile._json.given_name,
                last_name: profile._json.family_name,
                email: profile._json.email,
                password: ' ',
                isGoogle: true
            };
            const newCart = await CartManager.createCart();
            const newObj = {...infoUser, cart: newCart._id}
            const createdUser = await UserManager.createOne(newObj);
            done(null, createdUser);
        } catch (error) {
            done(error)
        }
    }
  ))

const fromCookies = (req) => {
    return req.cookies.token;
}

//JWT
passport.use('jwt', new JWTStrategy({
    //jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    jwtFromRequest: ExtractJwt.fromExtractors([fromCookies]),
    secretOrKey:config.secret_jwt,
}, (jwt_payload, done) => {
    done(null, jwt_payload)
}))

passport.serializeUser((user, done) =>{
    // _id
    done(null, user._id);
});

passport.deserializeUser(async(id, done) =>{
    try {
        const user = await UserManager.findById(id);
        done(null,user);
    } catch (error) {
        done(error);
    }
});