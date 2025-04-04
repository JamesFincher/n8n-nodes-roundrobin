"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirtableStorage = void 0;
const axios_1 = __importDefault(require("axios"));
const n8n_workflow_1 = require("n8n-workflow");
class AirtableStorage {
    constructor(executeFunctions, apiKey, baseId, tableName) {
        this.executeFunctions = executeFunctions;
        this.apiKey = apiKey;
        this.baseId = baseId;
        this.tableName = tableName;
    }
    async makeRequest(method, endpoint, data) {
        var _a, _b, _c;
        const url = `https://api.airtable.com/v0/${this.baseId}/${endpoint}`;
        try {
            const config = {
                method,
                url,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                data,
            };
            const response = await (0, axios_1.default)(config);
            return response.data;
        }
        catch (error) {
            console.error('Airtable API error:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            if ((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) {
                throw new n8n_workflow_1.NodeApiError(this.executeFunctions.getNode(), error.response.data);
            }
            throw new n8n_workflow_1.NodeOperationError(this.executeFunctions.getNode(), `Airtable API error: ${error.message}`);
        }
    }
    async initialize() {
        try {
            console.log(`[AirtableStorage] Initializing connection to base ${this.baseId}`);
            await this.makeRequest('GET', `${this.tableName}?maxRecords=1`).catch(async (error) => {
                if (error.message.includes('not found') || error.message.includes('Table not found')) {
                    console.log(`[AirtableStorage] Table "${this.tableName}" not found, will attempt to create it`);
                    await this.makeRequest('GET', '');
                    await this.createTable();
                    return;
                }
                throw error;
            });
            console.log(`[AirtableStorage] Successfully connected to Airtable base and table`);
            return true;
        }
        catch (error) {
            console.error(`[AirtableStorage] Initialization error:`, error);
            throw new n8n_workflow_1.NodeOperationError(this.executeFunctions.getNode(), `Failed to initialize Airtable connection: ${error.message}. Please check your API key and base ID.`);
        }
    }
    async createTable() {
        throw new n8n_workflow_1.NodeOperationError(this.executeFunctions.getNode(), `Table "${this.tableName}" does not exist in the Airtable base. Please create it manually with the following fields: workflowId (text), role (text), content (long text), spotIndex (number), timestamp (number), metadata (long text).`);
    }
    async storeMessage(workflowId, role, content, spotIndex, metadata) {
        console.log(`[AirtableStorage] Storing message for workflow ${workflowId}, role ${role}`);
        const message = {
            fields: {
                workflowId,
                role,
                content,
                spotIndex,
                timestamp: Date.now(),
                metadata: metadata ? JSON.stringify(metadata) : undefined,
            },
        };
        const data = {
            records: [message],
        };
        const result = await this.makeRequest('POST', this.tableName, data);
        console.log(`[AirtableStorage] Message stored successfully. Record ID: ${result.records[0].id}`);
        return result.records[0];
    }
    async getMessages(workflowId) {
        console.log(`[AirtableStorage] Retrieving messages for workflow ${workflowId}`);
        const filterByFormula = encodeURIComponent(`{workflowId} = "${workflowId}"`);
        const result = await this.makeRequest('GET', `${this.tableName}?filterByFormula=${filterByFormula}&sort%5B0%5D%5Bfield%5D=timestamp&sort%5B0%5D%5Bdirection%5D=asc`);
        console.log(`[AirtableStorage] Retrieved ${result.records.length} messages`);
        return result.records.map((record) => ({
            id: record.id,
            role: record.fields.role,
            content: record.fields.content,
            spotIndex: record.fields.spotIndex,
            timestamp: record.fields.timestamp,
            metadata: record.fields.metadata ? JSON.parse(record.fields.metadata) : undefined,
        }));
    }
    async clearMessages(workflowId) {
        console.log(`[AirtableStorage] Clearing messages for workflow ${workflowId}`);
        const messages = await this.getMessages(workflowId);
        if (messages.length === 0) {
            console.log(`[AirtableStorage] No messages to clear`);
            return 0;
        }
        const recordIds = messages.map(msg => msg.id);
        const chunks = [];
        for (let i = 0; i < recordIds.length; i += 10) {
            chunks.push(recordIds.slice(i, i + 10));
        }
        let deletedCount = 0;
        for (const chunk of chunks) {
            const ids = chunk.map(id => encodeURIComponent(id)).join(',');
            await this.makeRequest('DELETE', `${this.tableName}?records=${ids}`);
            deletedCount += chunk.length;
        }
        console.log(`[AirtableStorage] Cleared ${deletedCount} messages`);
        return deletedCount;
    }
}
exports.AirtableStorage = AirtableStorage;
//# sourceMappingURL=AirtableStorage.js.map