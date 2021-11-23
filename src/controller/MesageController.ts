import { NextFunction, Request, Response, Router } from "express";
import { check, ValidationError, validationResult } from "express-validator";
import { Server } from "ws";
import { MessageService } from "../services/MessageService";
import Logger from "../services/Logger";
import { UserService } from "../services/UserService";
const WebSocket = require('ws');

export class MessageController {

    private messageService: MessageService;
    private userService: UserService;
    public router: Router;

    constructor() {
        this.messageService = new MessageService();
        this.userService = new UserService();
        this.router = Router();
        this.routes();
    }

    public initSockets = (server: Server) => {
        const wss = new WebSocket.Server({server: server, path: '/api/chats'});

        wss.on('connection', function connection(ws, req) {
            console.log('A new client Connected!');
            ws.send('Welcome New Client!:', req);

            ws.on('message', function incoming(message) {
                console.log('received: %s', message);

                wss.clients.forEach( (client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(message);
                    }
                });
                
            });
        });
    }

    public routes() {
        this.router.get('/', this.getAll);
        this.router.get('/:id', this.getOne);
        this.router.get('/user/:id', this.getUserMessage);
        this.router.get('/user/:id/received', this.getUserReceivedMessage);
        this.router.get('/user/:id/sent', this.getUserSentMessage);
        this.router.post(
            '/',
            [
                check('content').exists().withMessage('Field "content" is missing').trim().escape(),
            ],
            this.postOne);
        this.router.put(
            '/:id',
            [
                check('content').trim().escape(),
            ],
            this.putOne);
        this.router.delete('/:id', this.deleteOne);
    }

    /**
     * GET all messages
     * @param req Express Request
     * @param res Express Response
     * @param next Express NextFunction
     * @returns 
     */
     public getAll = async (req: Request, res: Response, next: NextFunction) => {
        Logger.debug('GET all messages');

        // Return every messages in DB
        const messages = await this.messageService.findAll();
        res.send(messages).end();
        return;
    }

    /**
     * GET one mess by id
     * @param req Express Request
     * @param res Express Response
     * @param next Express NextFunction
     * @returns 
     */
     public getOne = async (req: Request, res: Response, next: NextFunction) => {
        Logger.debug('GET One message');

        const messageId = req.params.id;
        if (messageId === undefined || messageId === null) {
            res.status(400).send("Error, parameter id is missing or wrong").end();
            return;
        }
        else {
            const message = await this.messageService.findOne(messageId);
            if (message === undefined) {
                // Send 404 error
                res.status(404).send('Entity not found').end();
                return;
            }

            // Send message found
            res.send(message).end();
            return;
        }
    }

    /**
     * GET all messages by user id
     * @param req Express Request
     * @param res Express Response
     * @param next Express NextFunction
     * @returns 
     */
     public getUserMessage = async (req: Request, res: Response, next: NextFunction) => {
        Logger.debug('GET user messages ');

        const userId = req.params.id;
        if (userId === undefined || userId === null) {
            res.status(400).send("Error, parameter id is missing or wrong").end();
            return;
        }
        else {
            // Check if the user exist
            const user = await this.userService.findOne(userId);
            if (user === undefined) {
                // Send 404 error
                res.status(404).send('The user does not exist').end();
                return;
            }

            // TODO: change method
            const messages = await this.messageService.findAll();
            // Send message found
            res.send(messages).end();
            return;
        }
    }

    /**
     * GET all messages by user id
     * @param req Express Request
     * @param res Express Response
     * @param next Express NextFunction
     * @returns 
     */
     public getUserReceivedMessage = async (req: Request, res: Response, next: NextFunction) => {
        Logger.debug('GET One message');

        const userId = req.params.id;
        if (userId === undefined || userId === null) {
            res.status(400).send("Error, parameter id is missing or wrong").end();
            return;
        }
        else {
            // Check if the user exist
            const user = await this.userService.findOne(userId);
            if (user === undefined) {
                // Send 404 error
                res.status(404).send('The user does not exist').end();
                return;
            }

            // TODO: change method
            const messages = await this.messageService.findAll();
            // Send message found
            res.send(messages).end();
            return;
        }
    }

    /**
     * GET all messages by user id
     * @param req Express Request
     * @param res Express Response
     * @param next Express NextFunction
     * @returns 
     */
     public getUserSentMessage = async (req: Request, res: Response, next: NextFunction) => {
        Logger.debug('GET One message');

        const userId = req.params.id;
        if (userId === undefined || userId === null) {
            res.status(400).send("Error, parameter id is missing or wrong").end();
            return;
        }
        else {
            // Check if the user exist
            const user = await this.userService.findOne(userId);
            if (user === undefined) {
                // Send 404 error
                res.status(404).send('The user does not exist').end();
                return;
            }

            // TODO: change method
            const messages = await this.messageService.findAll();
            // Send message found
            res.send(messages).end();
            return;
        }
    }
    /**
     * POST message
     * @param req Express Request 
     * @param res Express Response
     * @param next Express NextFunction
     */
    public postOne = async (req: Request, res: Response, next: NextFunction) => {
        Logger.debug('POST message');

        // Check if there are format errors
        const errorFormatter = ({ location, msg, param, value, nestedErrors }: ValidationError) => {            
            return `${location}[${param}]: ${msg}`;
        };

        // Check if there are validation errors
        const result = validationResult(req).formatWith(errorFormatter);
        if (!result.isEmpty()) {
            res.status(404).send({ errors: result.array() }).end();
            return;
        }

        const response = await this.messageService.create(req.body);

        if (response) {
            res.send(response).end();
        } else {
            res.status(404).send('Unable to create product').end();
        }

        return;
    }

    /**
     * PUT message
     * @param req Express Request
     * @param res Express Response
     * @param next Express NextFunction
     */
    public putOne = async (req: Request, res: Response, next: NextFunction) => {
        Logger.debug('PUT message');
        // Check if there are format errors
        const errorFormatter = ({ location, msg, param, value, nestedErrors }: ValidationError) => {            
            return `${location}[${param}]: ${msg}`;
        };

        // Check if there are validation errors
        const result = validationResult(req).formatWith(errorFormatter);
        if (!result.isEmpty()) {
            res.status(404).send({ errors: result.array() }).end();
            return;
        }

        // Check path id
        const messageId = req.params.id;
        if (messageId === undefined || messageId === null) {
            res.status(400).send("Error, parameter id is missing or wrong");
            return;
        } else {
            // Body validation and path validation are now complete
            return;
        }
    }

    /**
     * DELETE message 
     * @param req Express Request
     * @param res Express Response
     * @param next Express NextFunction
     */
     public deleteOne = async (req: Request, res: Response, next: NextFunction) => {
        // Check path id
        const messageId = req.params.id;
        if (messageId === undefined || messageId === null) {
            res.status(404).send("Error, parameter id is missing or wrong");
            return;
        } else {
            const response = await this.messageService.delete(messageId);
            res.end();
            return;
        }
    }
}
