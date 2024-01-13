import { HttpStatus } from '@nestjs/common';

export const authBasicHeader = { Authorization: 'Basic YWRtaW46cXdlcnR5' };

export function generateString(length: number) {
    let result = '';
    const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

// Типизация ответов в тестах
type HttpStatusKeys = keyof typeof HttpStatus;
export type HttpStatusType = (typeof HttpStatus)[HttpStatusKeys];
