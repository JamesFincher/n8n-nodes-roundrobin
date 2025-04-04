import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, IDataObject } from 'n8n-workflow';
interface IRoundRobinMessage {
    role: string;
    content: string;
    spotIndex: number;
    timestamp: number;
}
interface IRoundRobinRole {
    name: string;
    description: string;
    color?: string;
    icon?: string;
    tone?: string;
    expertise?: string[];
    systemPrompt?: string;
    isEnabled?: boolean;
}
export declare class RoundRobinStorage {
    static getPrefix(workflowId: string): string;
    static getMessagesKey(workflowId: string): string;
    static getRolesKey(workflowId: string): string;
    static getSpotCountKey(workflowId: string): string;
    static getLastUpdatedKey(workflowId: string): string;
    static getMessages(staticData: IDataObject, workflowId: string): IRoundRobinMessage[];
    static setMessages(staticData: IDataObject, workflowId: string, messages: IRoundRobinMessage[]): void;
    static getRoles(staticData: IDataObject, workflowId: string): IRoundRobinRole[];
    static setRoles(staticData: IDataObject, workflowId: string, roles: IRoundRobinRole[]): void;
    static getSpotCount(staticData: IDataObject, workflowId: string): number;
    static setSpotCount(staticData: IDataObject, workflowId: string, count: number): void;
    static getLastUpdated(staticData: IDataObject, workflowId: string): number;
    static setLastUpdated(staticData: IDataObject, workflowId: string, timestamp: number): void;
    static initializeStorage(staticData: IDataObject, workflowId: string): void;
    static verifyStoragePersistence(staticData: IDataObject, workflowId: string): void;
}
export declare class RoundRobin implements INodeType {
    description: INodeTypeDescription;
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
export {};
//# sourceMappingURL=RoundRobin.node.d.ts.map