import { NextFunction, Request, Response, Router } from "express";
import { AuthenticationService } from "../services/AuthenticationService";
import { EncryptionService } from "../services/EncryptionService";
import Logger from "../services/Logger";
import { UserService } from "../services/UserService";
const jwt = require("jsonwebtoken");

export class AuthenticationController {

    private authenticationService: AuthenticationService;
    private userService: UserService;
    public router: Router;

    constructor() {
        this.authenticationService = new AuthenticationService();
        this.userService = new UserService();
        this.router = Router();
        this.routes();
    }

    public routes() {
        this.router.post('/login', this.login);
        this.router.get('/logout', this.logout);
    }

    /**
     * POST authentication request
     * @param req Express Request
     * @param res Express Response
     * @param next Express NextFunction
     * @returns 
     */
     public login = async (req: Request, res: Response, next: NextFunction) => {
        Logger.debug('POST login');
        
        // Get user input
        const { email, password } = req.body;
    
        // Validate user input
        if (!(email && password)) {
            res.status(404).send("Username or password is missing");
            return;
        }
    
        // Check if the user exists in our database
        const user = await this.userService.findByEmailWithPassword(email);

        if (user && (await EncryptionService.comparePassword(password, user.getPassword()))) {
            // Create token
            const token = jwt.sign(
                { 
                    user_id: user.id,
                    email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "2h",
                }
            );
    
            user.token = token;
            try {
                await this.userService.save(user);
                // Send the user with the new token
                res.status(200).json(user.token);
                return;
            } catch (err) {
                Logger.error(err);
                res.status(500).send("Internal Server Error");
            }
        }
        res.status(400).send("Invalid Credentials");
        return;
    }

    /**
     * GET logout request
     * @param req Express Request
     * @param res Express Response
     * @param next Express NextFunction
     * @returns 
     */
     public logout = async (req: Request, res: Response, next: NextFunction) => {
        Logger.debug('GET logout');
        
        res.end();
        return;
    }
}
