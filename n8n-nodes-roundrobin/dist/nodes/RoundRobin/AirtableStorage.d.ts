import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
interface IAirtableRecord {
    id: string;
    fields: {
        workflowId: string;
        role: string;
        content: string;
        spotIndex: number;
        timestamp: number;
        metadata?: string;
    };
}
export declare class AirtableStorage {
    private apiKey;
    private baseId;
    private tableName;
    private executeFunctions;
    constructor(executeFunctions: IExecuteFunctions, apiKey: string, baseId: string, tableName: string);
    private makeRequest;
    initialize(): Promise<boolean>;
    private createTable;
    storeMessage(workflowId: string, role: string, content: string, spotIndex: number, metadata?: IDataObject): Promise<IAirtableRecord>;
    getMessages(workflowId: string): Promise<{
        id: string;
        role: string;
        content: string;
        spotIndex: number;
        timestamp: number;
        metadata: any;
    }[]>;
    clearMessages(workflowId: string): Promise<number>;
}
export {};
//# sourceMappingURL=AirtableStorage.d.ts.map