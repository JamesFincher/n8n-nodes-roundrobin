"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirtableStorage = void 0;
const n8n_workflow_1 = require("n8n-workflow");
class AirtableStorage {
    constructor(executeFunctions, baseId, tableName) {
        this.executeFunctions = executeFunctions;
        this.baseId = baseId;
        this.tableName = tableName;
    }
    async initialize() {
        var _a, _b, _c;
        try {
            console.log(`[AirtableStorage] Initializing connection to base ${this.baseId}, table ${this.tableName}`);
            const options = {
                method: 'GET',
                url: `https://api.airtable.com/v0/${this.baseId}/${encodeURIComponent(this.tableName)}`,
                qs: {
                    maxRecords: 1,
                },
                json: true,
            };
            await this.executeFunctions.helpers.requestWithAuthentication.call(this.executeFunctions, 'airtableApi', options);
            console.log(`[AirtableStorage] Successfully connected to Airtable base and table`);
            return true;
        }
        catch (error) {
            console.error(`[AirtableStorage] Initialization error:`, error.message || error);
            if ((_c = (_b = (_a = error.context) === null || _a === void 0 ? void 0 : _a.response) === null || _b === void 0 ? void 0 : _b.body) === null || _c === void 0 ? void 0 : _c.error) {
                const airtableError = error.context.response.body.error;
                let message = `Failed to initialize Airtable connection: ${airtableError.type || 'Unknown Error'}`;
                if (airtableError.message) {
                    message += ` - ${airtableError.message}`;
                }
                if (airtableError.type === 'TABLE_NOT_FOUND' || (airtableError.message && airtableError.message.includes('Could not find table'))) {
                    message += `\n Ensure the table "${this.tableName}" exists in base "${this.baseId}" and the API key has access.`;
                    message += `\n Required fields: workflowId (text), role (text), content (long text), spotIndex (number), timestamp (number), metadata (long text).`;
                }
                else if (airtableError.type === 'AUTHENTICATION_REQUIRED' || airtableError.type === 'INVALID_AUTHORIZATION' || airtableError.type === 'INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND') {
                    message += `\n Please check your Airtable credentials (API Key/Personal Access Token), Base ID ("${this.baseId}"), and ensure the token has correct scopes and access to the base.`;
                }
                throw new n8n_workflow_1.NodeOperationError(this.executeFunctions.getNode(), message);
            }
            throw new n8n_workflow_1.NodeOperationError(this.executeFunctions.getNode(), `Failed to initialize Airtable connection: ${error.message || 'Unknown error'}. Please check credentials, Base ID, Table Name, and network connectivity.`);
        }
    }
    async createTable() {
        throw new n8n_workflow_1.NodeOperationError(this.executeFunctions.getNode(), `Table "${this.tableName}" does not exist or cannot be accessed in the Airtable base "${this.baseId}". Please create it manually (or check API key permissions) with the required fields: workflowId (text), role (text), content (long text), spotIndex (number), timestamp (number), metadata (long text).`);
    }
    async storeMessage(workflowId, role, content, spotIndex, metadata) {
        console.log(`[AirtableStorage] Storing message for workflow ${workflowId}, role ${role}`);
        const messageData = {
            workflowId,
            role,
            content,
            spotIndex,
            timestamp: Date.now(),
            metadata: metadata ? JSON.stringify(metadata) : undefined,
        };
        const requestBody = {
            records: [{ fields: messageData }],
        };
        const options = {
            method: 'POST',
            url: `https://api.airtable.com/v0/${this.baseId}/${encodeURIComponent(this.tableName)}`,
            body: requestBody,
            json: true,
        };
        try {
            const result = await this.executeFunctions.helpers.requestWithAuthentication.call(this.executeFunctions, 'airtableApi', options);
            if (!result || !result.records || result.records.length === 0) {
                throw new n8n_workflow_1.NodeOperationError(this.executeFunctions.getNode(), 'Failed to store message in Airtable, received empty or invalid response.');
            }
            console.log(`[AirtableStorage] Message stored successfully. Record ID: ${result.records[0].id}`);
            return result.records[0];
        }
        catch (error) {
            console.error(`[AirtableStorage] Error storing message:`, error.message || error);
            throw new n8n_workflow_1.NodeOperationError(this.executeFunctions.getNode(), `Failed to store message in Airtable: ${error.message || 'Unknown error'}`);
        }
    }
    async getMessages(workflowId) {
        console.log(`[AirtableStorage] Retrieving messages for workflow ${workflowId}`);
        const filterFormula = `{workflowId} = "${workflowId}"`;
        const options = {
            method: 'GET',
            url: `https://api.airtable.com/v0/${this.baseId}/${encodeURIComponent(this.tableName)}`,
            qs: {
                filterByFormula: filterFormula,
                'sort[0][field]': 'timestamp',
                'sort[0][direction]': 'asc',
            },
            json: true,
        };
        try {
            const result = await this.executeFunctions.helpers.requestWithAuthentication.call(this.executeFunctions, 'airtableApi', options);
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
        catch (error) {
            console.error(`[AirtableStorage] Error retrieving messages:`, error.message || error);
            throw new n8n_workflow_1.NodeOperationError(this.executeFunctions.getNode(), `Failed to retrieve messages from Airtable: ${error.message || 'Unknown error'}`);
        }
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
        try {
            for (const chunk of chunks) {
                const options = {
                    method: 'DELETE',
                    url: `https://api.airtable.com/v0/${this.baseId}/${encodeURIComponent(this.tableName)}`,
                    qs: {
                        records: chunk,
                    },
                    json: true,
                };
                await this.executeFunctions.helpers.requestWithAuthentication.call(this.executeFunctions, 'airtableApi', options);
                deletedCount += chunk.length;
            }
        }
        catch (error) {
            console.error(`[AirtableStorage] Error clearing messages (deleted ${deletedCount} before error):`, error.message || error);
            throw new n8n_workflow_1.NodeOperationError(this.executeFunctions.getNode(), `Failed to clear messages from Airtable: ${error.message || 'Unknown error'}`);
        }
        console.log(`[AirtableStorage] Cleared ${deletedCount} messages`);
        return deletedCount;
    }
}
exports.AirtableStorage = AirtableStorage;
//# sourceMappingURL=AirtableStorage.js.map