import { logger } from "../../utils/logger.js";
import bcrypt from "bcrypt";

class AuthHelper {
    public async hashpassword(password: string): Promise<string> {
        if (!password) {
            throw new Error("Password is required")
        }

        const stringPassword = String(password)
        const saltnumber = 10;

        const hash = await bcrypt.hash(stringPassword, saltnumber)
        logger.info('password hashed successfully')
        return hash;
    }
}

export default new AuthHelper();