import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
export interface IRoundRobinExternalMessage {
    role: string;
    content: string;
    spotIndex: number;
    timestamp: number;
}
export interface IRoundRobinExternalRole {
    name: string;
    description: string;
    color?: string;
    icon?: string;
    tone?: string;
    expertise?: string[];
    systemPrompt?: string;
    isEnabled?: boolean;
}
export declare class ExternalStorageManager {
    private executeFunctions;
    private storageType;
    private storageId;
    constructor(executeFunctions: IExecuteFunctions, storageType: string, storageId: string);
    storeToBinary(messages: IRoundRobinExternalMessage[], roles: IRoundRobinExternalRole[], spotCount: number): Promise<IDataObject>;
    loadFromBinary(binaryData: IDataObject): Promise<{
        messages: IRoundRobinExternalMessage[];
        roles: IRoundRobinExternalRole[];
        spotCount: number;
        lastUpdated: number;
    }>;
}
export declare function createStorageManager(executeFunctions: IExecuteFunctions, storageType?: string, storageId?: string): ExternalStorageManager;
//# sourceMappingURL=ExternalStorage.d.ts.map