import type { ICredentialDataDecryptedObject, ICredentialsEncrypted } from 'n8n-workflow';
import { ApplicationError, ICredentials } from 'n8n-workflow';
export declare class CredentialDataError extends ApplicationError {
    constructor({ name, type, id }: Credentials<object>, message: string, cause?: unknown);
}
export declare class Credentials<T extends object = ICredentialDataDecryptedObject> extends ICredentials<T> {
    private readonly cipher;
    setData(data: T): void;
    updateData(toUpdate: Partial<T>, toDelete?: Array<keyof T>): void;
    getData(): T;
    getDataToSave(): ICredentialsEncrypted;
}
