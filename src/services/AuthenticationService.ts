import { NextFunction, Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { UserRepository } from "../repository/UserRepository";
import Logger from "./Logger";
import { UserService } from "./UserService";
const jwt = require("jsonwebtoken");

export class AuthenticationService {

    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    static authenticationFilter = async function (req: Request, res: Response, next: NextFunction) {
        Logger.debug("Authentication filter");
        // Check if the request contains a valid token
        let token = req.header('authorization');
        if (token !== null && token !== undefined && token !== '') {
            // Chek if we receive a Bearer token
            if (token.startsWith("Bearer")){
                token = token.split(' ')[1];
            }
    
            // TODO: add token verification
            const decoded_token = jwt.verify(token, process.env.TOKEN_KEY);
            const now = Math.floor(Date.now() / 1000);
            if (decoded_token && decoded_token.exp > now) {
                const userRepository = getCustomRepository(UserRepository);
                const user = await userRepository.findOne(decoded_token.userId);
                if (user === undefined) {
                    res.status(401).send("Invalid Token");
                    return;
                }
                // Send the request to next server's middlware
                return next();
            } else {
                res.status(401).send("Expired Token");
                return;
            }
        }
        res.status(401).send("Unhautorized");
        return;
    }
}
