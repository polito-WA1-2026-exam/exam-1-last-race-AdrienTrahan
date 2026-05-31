export class AppError extends Error {
    constructor(statusCode, errorCode, message) {
        super(message);
        this.name = new.target.name;
        this.statusCode = statusCode;
        this.errorCode = errorCode;
    }
}

function createError(statusCode, errorCode, message) {
    return class extends AppError {
        constructor() {
            super(statusCode, errorCode, message);
            this.name = new.target.name;
        }
    };
}

export const ErrorCode = {
    InvalidCredentials: 'InvalidCredentials',
    InvalidRequest: 'InvalidRequest',
    AuthenticationInvalid: 'AuthenticationInvalid',
    InternalServerError: 'InternalServerError',
    UserNameTaken: 'UserNameTaken',
    ResourceNotFound: 'ResourceNotFound',
};

export class InternalServerError extends createError(
    501,
    ErrorCode.InternalServerError,
    'Internal server error',
) {}
export class InvalidCredentials extends createError(
    401,
    ErrorCode.InvalidCredentials,
    'Invalid credentials',
) {}
export class InvalidRequest extends createError(
    400,
    ErrorCode.InvalidRequest,
    'Invalid request',
) {}
export class AuthenticationInvalid extends createError(
    401,
    ErrorCode.AuthenticationInvalid,
    'Authentication is invalid',
) {}
export class UserNameTaken extends createError(
    401,
    ErrorCode.UserNameTaken,
    'Username already exists',
) {}
export class ResourceNotFound extends createError(
    401,
    ErrorCode.ResourceNotFound,
    'Resource not found',
) {}
