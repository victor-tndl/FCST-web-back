import * as bcrypt from 'bcrypt';

export class EncryptionService {
    static cryptPassword = async (password: string): Promise<string> => {
        return bcrypt.genSalt(10)
            .then((salt => bcrypt.hash(password, salt)))
            .then(hash => hash);
    }

    static comparePassword = async (password: string, hashPassword: string): Promise<boolean> => {
        return bcrypt.compare(password, hashPassword).then(resp => resp)
    }
}