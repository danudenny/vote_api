import * as bcrypt from 'bcrypt';

async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
}

export default hashPassword
