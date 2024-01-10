import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
 
        const errorResponse = {
            errorsMessages: [],
        };

        if (typeof exception.message === 'string') {
            // @ts-ignore
            errorResponse.errorsMessages.push(exception.message);
        } else {
            const responseErr: any = exception.errors;
            for (const key in responseErr) {
                const error = {
                    message: responseErr[key].message,
                    field: key,
                };
                // @ts-ignore
                errorResponse.errorsMessages.push(error);
            }
        }
        response.status(HttpStatus.BAD_REQUEST).json(errorResponse);

    // В будущем разделить вывод ошибок для теста, и для прода
    // if (process.env.environment !== 'production') {
    //   response.status(500).json({
    //     error: exception.toString(),
    //     stack: exception.stack ? exception.stack.toString() : 'Some stack',
    //   });
    // } else {
    //   response.status(500).send('some error occurred');
    // }
    }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        if (status === 400) {
            const errorResponse = {
                errorsMessages: [],
            };
            console.log('filter', exception.getResponse());
            const responseErr: any = exception.getResponse();

            if (typeof responseErr === 'string') {
                // @ts-ignore
                errorResponse.errorsMessages.push(responseErr);
            } else {
                responseErr.message.forEach((m) =>
                // @ts-ignore
                    errorResponse.errorsMessages.push(m),
                );
            }
            response.status(status).json(errorResponse);
        } else {
            response.status(status).json({
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
                responseErr: exception.getResponse(),
            });
        }
    }
}
