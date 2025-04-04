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
    private baseId;
    private tableName;
    private executeFunctions;
    constructor(executeFunctions: IExecuteFunctions, baseId: string, tableName: string);
    initialize(): Promise<boolean>;
    private createTable;
    storeMessage(workflowId: string, role: string, content: string, spotIndex: number, metadata?: IDataObject): Promise<IAirtableRecord>;
    getMessages(workflowId: string): Promise<Array<{
        id: string;
        role: string;
        content: string;
        spotIndex: number;
        timestamp: number;
        metadata?: IDataObject;
    }>>;
    clearMessages(workflowId: string): Promise<number>;
}
export {};
//# sourceMappingURL=AirtableStorage.d.ts.map