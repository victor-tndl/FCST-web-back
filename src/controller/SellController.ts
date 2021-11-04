import { NextFunction, Request, Response, Router } from "express";
import { check, ValidationError, validationResult } from 'express-validator';
import Logger from "../services/Logger";
import { SellService } from "../services/SellService";

export class SellController {

    private sellService: SellService;
    public router: Router;

    constructor() {
        this.sellService = new SellService();
        this.router = Router();
        this.routes();
    }

    public routes() {
        this.router.get('/', this.getAll);
        this.router.get('/:id', this.getOne);
        this.router.post(
            '/',
            [
                check('seller').exists().withMessage('Field "seller" is missing').isUUID().trim().escape(),
                check('buyer').exists().withMessage('Field "buyer" is missing').isUUID().trim().escape(),
                check('product').exists().withMessage('Field "product" is missing').isUUID().trim().escape(),
            ],
            this.postOne);
        this.router.put(
            '/:id',
            [
                check('seller').trim().escape(),
                check('buyer').trim().escape(),
                check('product').trim().escape(),
            ],
            this.putOne);
        this.router.delete('/:id', this.deleteOne);
    }

    /**
     * GET all sells
     * @param req Express Request
     * @param res Express Response
     * @param next Express NextFunction
     * @returns 
     */
     public getAll = async (req: Request, res: Response, next: NextFunction) => {
        Logger.debug('GET sells');

        // Return every sells in DB
        const sells = await this.sellService.findAll();
        res.send(sells).end();
        return;
    }

    /**
     * GET sell by id
     * @param req Express Request
     * @param res Express Response
     * @param next Express NextFunction
     * @returns 
     */
     public getOne = async (req: Request, res: Response, next: NextFunction) => {
        Logger.debug('GET One sell');

        const sellId = req.params.id;
        if (sellId === undefined || sellId === null) {
            res.status(400).send("Error, parameter id is missing or wrong").end();
            return;
        }
        else {
            const sell = await this.sellService.findOne(sellId);
            if (sell === undefined) {
                // Send 404 error
                res.status(404).send('Entity not found').end();
                return;
            }

            // Send sell found
            res.send(sell).end();
            return;
        }
    }

    /**
     * POST sell
     * @param req Express Request 
     * @param res Express Response
     * @param next Express NextFunction
     */
    public postOne = async (req: Request, res: Response, next: NextFunction) => {
        Logger.debug('POST sell');
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

        const response = await this.sellService.create(req.body)
        
        if (response) {
            res.end();
        } else {
            res.status(404).send('Unable to create product').end();
        }

        return;
    }

    /**
     * PUT sell
     * @param req Express Request
     * @param res Express Response
     * @param next Express NextFunction
     */
    public putOne = async (req: Request, res: Response, next: NextFunction) => {
        Logger.debug('PUT sell');
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
        const sellId = req.params.id;
        if (sellId === undefined || sellId === null) {
            res.status(400).send("Error, parameter id is missing or wrong");
            return;
        } else {
            // Body validation and path validation are now complete
            return;
        }
    }

    /**
     * DELETE sell 
     * @param req Express Request
     * @param res Express Response
     * @param next Express NextFunction
     */
     public deleteOne = async (req: Request, res: Response, next: NextFunction) => {
        // Check path id
        const sellId = req.params.id;
        if (sellId === undefined || sellId === null) {
            res.status(404).send("Error, parameter id is missing or wrong");
            return;
        } else {
            const response = await this.sellService.delete(sellId);
            res.end();
            return;
        }
    }
}