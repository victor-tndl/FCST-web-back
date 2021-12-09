import { NextFunction, Request, Response, Router } from "express";
import { check, ValidationError, validationResult } from 'express-validator';
import { productState, productType } from "../entity/Product";
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
        this.router.get('/types', this.getTypes);
        this.router.get('/last', this.getLast);
        this.router.get('/:id', this.getOne);
        this.router.post(
            '/',
            [
                check('title').exists().withMessage('Field "title" is missing').trim().escape(),
                check('price').exists().withMessage('Field "price" is missing').isFloat().trim().escape(),
                check('description').exists().withMessage('Field "description" is missing').trim().escape(),
                check('image').exists().withMessage('Field "image" is missing'),
                check('seller').exists().withMessage('Field "title" is missing').trim().escape(),

            ],
            this.postOne);
        this.router.put(
            '/:id',
            [
                check('title').trim().escape(),
                check('price').isFloat().trim().escape(),
                check('description').trim().escape(),
                check('image'),
                check('state').custom((value: String) => {
                    return (Object.values(productState) as String[]).includes(value);
                }).trim().escape(),
                check('type').custom((value: String) => {
                    return (Object.values(productType) as String[]).includes(value);
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
        const products = await this.productService.findAll();
        res.send(products).end();
        return;
    }

    /**
     * GET product types
     * @param req Express Request
     * @param res Express Response
     * @param next Express NextFunction
     * @returns 
     */
     public getTypes = async (req: Request, res: Response, next: NextFunction) => {
        res.status(200).json(Object.values(productType) as String[]).end();
        return;
    }

    /**
     * GET last product
     * @param req Express Request
     * @param res Express Response
     * @param next Express NextFunction
     * @returns 
     */
    public getLast = async (req: Request, res: Response, next: NextFunction) => {
        const lastProduct = await this.productService.findLast();
        res.status(200).json(lastProduct).end();
        return;
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

        const response = await this.productService.create(req.body);
        
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
            const response = await this.productService.delete(productId);
            res.end();
            return;
        }
    }
}