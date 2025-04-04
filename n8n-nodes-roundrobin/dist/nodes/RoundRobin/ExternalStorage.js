"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalStorageManager = void 0;
exports.createStorageManager = createStorageManager;
const n8n_workflow_1 = require("n8n-workflow");
class ExternalStorageManager {
    constructor(executeFunctions, storageType, storageId) {
        this.executeFunctions = executeFunctions;
        this.storageType = storageType;
        this.storageId = storageId;
    }
    async storeToBinary(messages, roles, spotCount) {
        try {
            const storageData = {
                messages,
                roles,
                spotCount,
                lastUpdated: Date.now(),
            };
            const jsonData = JSON.stringify(storageData);
            const binaryPropertyName = `roundrobin_${this.storageId}`;
            const newItem = {
                json: {
                    success: true,
                    storageType: 'binary',
                    storageId: this.storageId,
                    lastUpdated: new Date().toISOString(),
                    messageCount: messages.length,
                    rolesCount: roles.length,
                },
                binary: {
                    [binaryPropertyName]: await this.executeFunctions.helpers.prepareBinaryData(Buffer.from(jsonData), `roundrobin_${this.storageId}.json`, 'application/json'),
                },
            };
            return newItem;
        }
        catch (error) {
            throw new n8n_workflow_1.NodeOperationError(this.executeFunctions.getNode(), `Failed to store data in binary: ${error.message}`);
        }
    }
    async loadFromBinary(binaryData) {
        try {
            const binaryPropertyName = `roundrobin_${this.storageId}`;
            if (!binaryData || !binaryData[binaryPropertyName]) {
                return {
                    messages: [],
                    roles: [],
                    spotCount: 0,
                    lastUpdated: 0
                };
            }
            const binaryProperty = binaryData[binaryPropertyName];
            const binaryString = Buffer.from(binaryProperty.data, 'base64').toString();
            const storageData = JSON.parse(binaryString);
            return {
                messages: storageData.messages || [],
                roles: storageData.roles || [],
                spotCount: storageData.spotCount || 0,
                lastUpdated: storageData.lastUpdated || 0
            };
        }
        catch (error) {
            throw new n8n_workflow_1.NodeOperationError(this.executeFunctions.getNode(), `Failed to load data from binary: ${error.message}`);
        }
    }
}
exports.ExternalStorageManager = ExternalStorageManager;
function createStorageManager(executeFunctions, storageType = 'binary', storageId = 'default') {
    return new ExternalStorageManager(executeFunctions, storageType, storageId);
}
//# sourceMappingURL=ExternalStorage.js.map