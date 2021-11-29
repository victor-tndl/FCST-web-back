import express, { NextFunction, Request, Response } from "express";

require('dotenv').config()
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var cors = require('cors');

import { createConnection}  from "typeorm";
import { AuthenticationController } from "../controller/AuthenticationController";
import { MessageController } from "../controller/MesageController";
import { ProductController } from "../controller/ProductController";
import { SellController } from "../controller/SellController";
import { UserController } from "../controller/UserController";
import { AuthenticationService } from "./AuthenticationService";
import Logger, { loggerMiddleware } from "./Logger";

export class Server {
    private app: express.Application;
    private server: any;
    private productController?: ProductController;
    private userController?: UserController;
    private sellController?: SellController;
    private messageController?: MessageController;
    private authenticationController?: AuthenticationController;
    private unauthenticatedRoutes: Array<string> = ['/api/login', '/api/login/', '/api/users/register', '/api/users/register/'];

    constructor() {
        this.app = express(); // init the application
        this.configuration();
    }

    /**
     * Method to configure the server,
     * If we didn't configure the port into the environment
     * variables it takes the default port 3000
     */
    public configuration = () => {
        this.app.set('port',  3000);

        // Use in order to accept CORS -> Enabled communicaion with the front end
        this.app.use(cors());

        // view engine setup
        this.app.set('views', path.resolve('./', './views'));
        this.app.set('view engine', 'pug');

        this.app.use(loggerMiddleware);
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(cookieParser());

        this.app.all('*', async (req: Request, res: Response, next: NextFunction) => {
            if (!this.unauthenticatedRoutes.includes(req.originalUrl)) {
                AuthenticationService.authenticationFilter(req, res, next);
            } else {
                return next();
            }
        });
    }

    private unknownRoutesConfiguration = () => {
        // catch 404 and forward to error handler
        this.app.use(function(req: Request, res: Response, next: NextFunction) {
            next(createError(404));
        });

        // error handler
        this.app.use(function(err: any, req: Request, res: Response, next: NextFunction) {
            // set locals, only providing error in development
            res.locals.message = err.message;
            Logger.info(res.locals.message);
            res.locals.error = req.app.get('env') === 'development' ? err : {};

            // render the error page
            res.status(err.status || 500);
            res.render('error');
        });
    }

    /**
     * Method to configure the routes
     */
    public routes = async () => {
        await createConnection({
            type: "mysql",
            host: "localhost",
            port: 3306,
            username: "root",
            password: "root123",
            database: "webErasmus",
            synchronize: true,
            logging: false,
            entities: [
               'js/src/entity/**/*.{js,ts}' || ''
            ],
            migrations: [
                'js/src/migration/**/*.{js,ts}' || ''
            ],
            subscribers: [
                'js/src/subscriber/**/*.{js,ts}' || ''
            ],
            cli: {
                entitiesDir: 'js/src/entity'|| '',
                migrationsDir: 'js/src/migration'|| '',
                subscribersDir: 'js/src/subscriber' || ''
            }
        });

        this.authenticationController = new AuthenticationController();
        this.productController = new ProductController();
        this.userController = new UserController();
        this.sellController = new SellController();
        this.messageController = new MessageController();

        // Configure routes for each controller
        this.app.use("/api/", this.authenticationController.router);
        this.app.use("/api/products", this.productController.router);
        this.app.use("/api/users", this.userController.router);
        this.app.use("/api/sells", this.sellController.router);
        this.app.use("/api/messages", this.messageController.router);

        this.unknownRoutesConfiguration();
    }
   
    /**
     * Used to start the server
     */
    public start = async () => {
        // End server Initialisation (sockets)
        await this.routes();
        this.server = require('http').createServer(this.app);
        this.messageController?.initSockets(this.server);

        // Start the server
        this.server.listen(process.env.PORT || 3000, () => {
            Logger.info(`Server is listening ${this.server.address().port} port.`);
        });
    }

    public stop = async () => {}
}
