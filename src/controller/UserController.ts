import { NextFunction, Request, Response, Router } from "express";
import { check, ValidationError, validationResult } from 'express-validator';
import { User } from "../entity/User";
import { EncryptionService } from "../services/EncryptionService";
import Logger from "../services/Logger";
import { UserService } from "../services/UserService";

export class UserController {

    private userService: UserService;
    public router: Router;

    constructor() {
        this.userService = new UserService();
        this.router = Router();
        this.routes();
    }

    public routes() {
        this.router.get('/', this.getAll);
        this.router.get('/:id', this.getOne);
        this.router.post(
            '/register',
            [
                check('email').exists().withMessage('Field "email" is missing').isEmail().trim().escape(),
                check('password').exists().withMessage('Field "password" is missing').trim().escape(),
                check('firstName').exists().withMessage('Field "firstName" is missing').trim().escape(),
                check('lastName').exists().withMessage('Field "id" is missing').trim().escape(),
            ],
            this.postOne);
        this.router.put(
            '/:id',
            [
                check('email').trim().escape(),
                check('password').trim().escape(),
                check('firstName').trim().escape(),
                check('lastName').trim().escape(),
            ],
            this.putOne);
        this.router.delete('/:id', this.deleteOne);
    }

    /**
     * GET all users
     * @param req Express Request
     * @param res Express Response
     * @param next Express NextFunction
     * @returns 
     */
     public getAll = async (req: Request, res: Response, next: NextFunction) => {
        Logger.debug('GET users');

        // Return every users in DB
        const users = await this.userService.findAll();
        res.send(users).end();
        return;
    }

    /**
     * GET user by id
     * @param req Express Request
     * @param res Express Response
     * @param next Express NextFunction
     * @returns 
     */
     public getOne = async (req: Request, res: Response, next: NextFunction) => {
        Logger.debug('GET One user');

        const userId = req.params.id;
        if (userId === undefined || userId === null) {
            res.status(400).send("Error, parameter id is missing or wrong").end();
            return;
        }
        else {
            const user = await this.userService.findOne(userId);
            if (user === undefined) {
                // Send 404 error
                res.status(404).send('Entity not found').end();
                return;
            }

            // Send user found
            res.send(user).end();
            return;
        }
    }

    /**
     * POST user
     * @param req Express Request 
     * @param res Express Response
     * @param next Express NextFunction
     */
    public postOne = async (req: Request, res: Response, next: NextFunction) => {
        Logger.debug('POST user');

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

        req.body.password = await EncryptionService.cryptPassword(req.body.password);
        const response = await this.userService.create(req.body)

        if (response) {
            res.send(response).end();
        } else {
            res.status(404).send('Unable to create product').end();
        }

        return;
    }

    /**
     * PUT user
     * @param req Express Request
     * @param res Express Response
     * @param next Express NextFunction
     */
    public putOne = async (req: Request, res: Response, next: NextFunction) => {
        Logger.debug('PUT user');
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
        const userId = req.params.id;
        if (userId === undefined || userId === null) {
            res.status(400).send("Error, parameter id is missing or wrong");
            return;
        } else {
            // Body validation and path validation are now complete
            return;
        }
    }

    /**
     * DELETE user 
     * @param req Express Request
     * @param res Express Response
     * @param next Express NextFunction
     */
     public deleteOne = async (req: Request, res: Response, next: NextFunction) => {
        // Check path id
        const userId = req.params.id;
        if (userId === undefined || userId === null) {
            res.status(404).send("Error, parameter id is missing or wrong");
            return;
        } else {
            const response = await this.userService.delete(userId);
            res.end();
            return;
        }
    }
}