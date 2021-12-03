import { NextFunction, Request, Response, Router } from "express";
import { check, ValidationError, validationResult } from "express-validator";
import { Server } from "ws";
import { MessageService } from "../services/MessageService";
import Logger from "../services/Logger";
import { UserService } from "../services/UserService";
import { Message } from "../entity/Message";
const WebSocket = require('ws');

const __REGEX_FOR_WEBSOCKET__ = /[?&]id=([^&#]*)/g;


export class MessageController {

    private messageService: MessageService;
    private userService: UserService;
    public router: Router;
    private socketMap = new Map<string, any>();

    constructor() {
        this.messageService = new MessageService();
        this.userService = new UserService();
        this.router = Router();
        this.routes();
    }

    public initSockets = (server: Server) => {
        const wss = new WebSocket.Server({server: server, path: '/api/chats'});

        wss.on('connection', (ws: any, req: any) => {
            console.log('A new client Connected!');

            ws.on('message', async (message: any) => {
                const messageStored = await this.messageService.create(JSON.parse(message.toString()));
                // const storeReponse = await this.messageService.create(JSON.parse(message.toString()));
                // wss.clients.forEach( (client) => {
                //     if (client !== ws && client.readyState === WebSocket.OPEN) {
                //         if (storeReponse) {
                //             client.send(message.toString());
                //         } else {
                //             client.send('ERROR');
                //         }
                //     }
                // });

                if (messageStored !== null) {
                    this.socketMap.forEach((socket, id) => {
                        if (messageStored.receiver === id || messageStored.sender === id) {
                            if (socket.readyState === WebSocket.OPEN) {
                                socket.send(JSON.stringify(messageStored));
                            }
                        }
                    });
                }
            });

            try {
                const id = req.url.split("id=")[1].split("&")[0];
                this.socketMap.set(id, ws);
            } catch (err) {
                Logger.error(err);
            }
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
                check('sender').exists().withMessage('Field "sender" is missing').isUUID().trim().escape(),
                check('receiver').exists().withMessage('Field "receiver" is missing').isUUID().trim().escape(),
                check('date').exists().withMessage('Field "date" is missing').isDate().trim().escape(),
            ],
            this.postOne);
        this.router.put(
            '/:id',
            [
                check('content').trim().escape(),
                check('sender').isUUID().trim().escape(),
                check('receiver').isUUID().trim().escape(),
                check('date').isDate().trim().escape(),
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
            const messages = await this.messageService.findMessageByUser(user);
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
            const messages = await this.messageService.findMessageReceivedByUser(user);
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
            const messages = await this.messageService.findMessageSentByUser(user);
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

        const messageStored = await this.messageService.create(req.body);

        if (messageStored) {
            res.end();
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
