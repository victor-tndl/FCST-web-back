import { NextFunction, Request, Response, Router } from "express";
import { check, ValidationError, validationResult } from 'express-validator';
import { productState } from "../entity/Product";
import { ProductService } from "../services/ProductService";
import Logger from "../services/Logger";

export class ProductController {

    private productService: ProductService;
    public router: Router;

    constructor() {
        this.productService = new ProductService();
        this.router = Router();
        this.routes();
    }

    public routes() {
        this.router.get('/', this.getAll);
        this.router.get('/:id', this.getOne);
        this.router.post(
            '/',
            [
                check('id').exists().withMessage('Field "id" is missing').isAlphanumeric().trim().escape(),
                check('title').exists().withMessage('Field "title" is missing').trim().escape(),
                check('description').exists().withMessage('Field "description" is missing').trim().escape(),
                check('state')
                    .exists().withMessage('Field "state" is missing')
                    .custom((value: String) => {
                        return (Object.values(productState) as String[]).includes(value);
                    }).trim().escape(),
            ],
            this.postOne);
        this.router.put(
            '/:id',
            [
                check('id').trim().escape(),
                check('title').trim().escape(),
                check('description').trim().escape(),
                check('state').custom((value: String) => {
                        return (Object.values(productState) as String[]).includes(value);
                    }).trim().escape(),
            ],
            this.putOne);
        this.router.delete('/:id', this.deleteOne);
    }

    /**
     * GET all products
     * @param req Express Request
     * @param res Express Response
     * @param next Express NextFunction
     * @returns 
     */
     public getAll = async (req: Request, res: Response, next: NextFunction) => {
        Logger.debug('GET products');
        
        // Return every products in DB
        return await this.productService.findAll();
    }

    /**
     * GET product by id
     * @param req Express Request
     * @param res Express Response
     * @param next Express NextFunction
     * @returns 
     */
     public getOne = async (req: Request, res: Response, next: NextFunction) => {
        Logger.debug('GET One product');

        const productId = req.params.id;
        if (productId === undefined || productId === null) {
            res.status(400).send("Error, parameter id is missing or wrong").end();
            return;
        }
        else {
            const product = await this.productService.findOne(productId);
            if (product === undefined) {
                // Send 404 error
                res.status(404).send('Entity not found').end();
                return;
            }

            // Send product found
            res.send(product).end();
            return;
        }
    }

    /**
     * POST product
     * @param req Express Request 
     * @param res Express Response
     * @param next Express NextFunction
     */
    public postOne = async (req: Request, res: Response, next: NextFunction) => {
        Logger.debug('POST product');
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

        const response = await this.productService.create(req.body)
        
        if (response) {
            res.end();
        } else {
            res.status(404).send('Unable to create product').end();
        }

        return;
    }

    /**
     * PUT product
     * @param req Express Request
     * @param res Express Response
     * @param next Express NextFunction
     */
    public putOne = async (req: Request, res: Response, next: NextFunction) => {
        Logger.debug('PUT product');
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
        const productId = req.params.id;
        if (productId === undefined || productId === null) {
            res.status(400).send("Error, parameter id is missing or wrong");
            return;
        } else {
            // Body validation and path validation are now complete
            return;
        }
    }

    /**
     * DELETE product 
     * @param req Express Request
     * @param res Express Response
     * @param next Express NextFunction
     */
     public deleteOne = async (req: Request, res: Response, next: NextFunction) => {
        // Check path id
        const productId = req.params.id;
        if (productId === undefined || productId === null) {
            res.status(404).send("Error, parameter id is missing or wrong");
            return;
        } else {
            const response = await this.productService.delete(parseInt(productId!, 10));
            res.end();
            return;
        }
    }
}