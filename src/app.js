import express from 'express';
import cookieParser from 'cookie-parser';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import usersRouter from './routes/users.router.js';
import cookieRouter from './routes/cookie.router.js';
import sessionsRouter from './routes/sessions.router.js';
import messagesRouter from './routes/messages.router.js'
import session from 'express-session';
import swaggerUi from 'swagger-ui-express';
import { swaggerSetup } from './utils/swagger.js'; 
import { MessageManager } from './DAL/daos/mongo/messages.mongo.js'
import { errorMiddleware } from './middlewares/errors.middleware.js';
import { __dirname } from './utils/utils.js';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import { logger } from './utils/logger.js';
import MongoStore from 'connect-mongo';
import './config/configDB.js';
import './passport.js';
import passport from 'passport';
import config from './config/config.js';

const app = express();
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser("SecretCookie"))

//sessions mongo
const URI = config.mongo_uri

app.use(
    session({
        store: new MongoStore({
            mongoUrl: URI,
        }),
        secret: "secretSession",
        cookie: {maxAge: 60000},
    })
)

//passport
app.use(passport.initialize());
app.use(passport.session());

//handlebars
app.engine('handlebars',engine());
app.set('views',__dirname + '/views');
app.set('view engine','handlebars');

//routes
app.use('/',viewsRouter);
app.use('/api/users',usersRouter);
app.use('/api/products',productsRouter);
app.use('/api/carts',cartsRouter);
app.use('/api/cookie', cookieRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/messages', messagesRouter);

//swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSetup));

app.use(errorMiddleware);

const PORT = config.port;

const httpServer = app.listen(PORT, () => {
    logger.info(`Escuchando el puerto ${PORT}`);
});

const socketServer = new Server(httpServer);
const messages = [];
socketServer.on('connection',socket=>{
    logger.info(`Cliente conectado: ${socket.id}`);
    socket.on('newUser',(user)=>{
        socket.broadcast.emit("userConnected", user);
        socket.emit("connected");
    })
    socket.on('message', async(infoMessage)  =>{
        messages.push(infoMessage);
        logger.info(infoMessage);
        await MessageManager.createOne(infoMessage);
        socketServer.emit('chat',messages);
    })
});