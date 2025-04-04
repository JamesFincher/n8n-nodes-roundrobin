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
    static getPrefix(nodeName: string): string;
    static getMessagesKey(nodeName: string): string;
    static getRolesKey(nodeName: string): string;
    static getSpotCountKey(nodeName: string): string;
    static getLastUpdatedKey(nodeName: string): string;
    static getMessages(staticData: IDataObject, nodeName: string): IRoundRobinMessage[];
    static setMessages(staticData: IDataObject, nodeName: string, messages: IRoundRobinMessage[]): void;
    static getRoles(staticData: IDataObject, nodeName: string): IRoundRobinRole[];
    static setRoles(staticData: IDataObject, nodeName: string, roles: IRoundRobinRole[]): void;
    static getSpotCount(staticData: IDataObject, nodeName: string): number;
    static setSpotCount(staticData: IDataObject, nodeName: string, count: number): void;
    static getLastUpdated(staticData: IDataObject, nodeName: string): number;
    static setLastUpdated(staticData: IDataObject, nodeName: string, timestamp: number): void;
    static initializeStorage(staticData: IDataObject, nodeName: string): void;
}
export declare class RoundRobin implements INodeType {
    description: INodeTypeDescription;
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
export {};
//# sourceMappingURL=RoundRobin.node.d.ts.map