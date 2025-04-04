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
    /**
     * Make authenticated request to Airtable API
     */
    private makeRequest;
    /**
     * Verify connection and create table if it doesn't exist
     */
    initialize(): Promise<boolean>;
    /**
     * Create the messages table with required fields
     */
    private createTable;
    /**
     * Store a message in Airtable
     */
    storeMessage(workflowId: string, role: string, content: string, spotIndex: number, metadata?: IDataObject): Promise<IAirtableRecord>;
    /**
     * Retrieve messages for a specific workflow
     */
    getMessages(workflowId: string): Promise<{
        id: string;
        role: string;
        content: string;
        spotIndex: number;
        timestamp: number;
        metadata: any;
    }[]>;
    /**
     * Delete all messages for a specific workflow
     */
    clearMessages(workflowId: string): Promise<number>;
}
export {};
//# sourceMappingURL=AirtableStorage.d.ts.map