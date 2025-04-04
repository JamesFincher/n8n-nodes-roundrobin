"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoundRobin = void 0;
const n8n_workflow_1 = require("n8n-workflow");
class RoundRobin {
    constructor() {
        this.description = {
            displayName: 'Round Robin',
            name: 'roundRobin',
            icon: 'file:roundrobin.svg',
            group: ['transform'],
            version: 1,
            subtitle: '={{ $parameter["mode"] }}',
            description: 'Store and retrieve messages in a round-robin fashion for LLM conversation loops',
            defaults: {
                name: 'Round Robin',
                color: '#ff9900',
            },
            inputs: ['main'],
            outputs: ['main'],
            properties: [
                {
                    displayName: 'Mode',
                    name: 'mode',
                    type: 'options',
                    options: [
                        {
                            name: 'Store',
                            value: 'store',
                            description: 'Store a message in the round-robin',
                            action: 'Store a message in the round robin',
                        },
                        {
                            name: 'Retrieve',
                            value: 'retrieve',
                            description: 'Retrieve all messages from the round-robin',
                            action: 'Retrieve all messages from the round robin',
                        },
                        {
                            name: 'Clear',
                            value: 'clear',
                            description: 'Clear all stored messages',
                            action: 'Clear all stored messages',
                        },
                    ],
                    default: 'store',
                    noDataExpression: true,
                    required: true,
                    description: 'The operation to perform',
                },
                {
                    displayName: 'Storage Notice',
                    name: 'storageNotice',
                    type: 'notice',
                    default: 'Data is stored in workflow memory and will be lost if the n8n instance is restarted or the workflow is updated and redeployed.',
                    displayOptions: {
                        show: {
                            mode: ['store', 'retrieve'],
                        },
                    },
                },
                {
                    displayName: 'Number of Spots',
                    name: 'spotCount',
                    type: 'number',
                    default: 3,
                    required: true,
                    displayOptions: {
                        show: {
                            mode: ['store'],
                        },
                    },
                    description: 'Number of spots in the round-robin',
                },
                {
                    displayName: 'Roles',
                    name: 'roles',
                    placeholder: 'Add Role',
                    type: 'fixedCollection',
                    typeOptions: {
                        multipleValues: true,
                        sortable: true,
                    },
                    default: {
                        values: [
                            { name: 'User', description: 'The human user in the conversation' },
                            { name: 'Assistant', description: 'The AI assistant in the conversation' },
                            { name: 'System', description: 'System instructions for the AI model' }
                        ]
                    },
                    displayOptions: {
                        show: {
                            mode: ['store'],
                        },
                    },
                    description: 'Define the roles for each spot in the round-robin',
                    options: [
                        {
                            name: 'values',
                            displayName: 'Roles',
                            values: [
                                {
                                    displayName: 'Role Name',
                                    name: 'name',
                                    type: 'string',
                                    default: '',
                                    description: 'Name of the role/persona',
                                    required: true,
                                },
                                {
                                    displayName: 'Role Description',
                                    name: 'description',
                                    type: 'string',
                                    typeOptions: {
                                        rows: 3,
                                    },
                                    default: '',
                                    description: 'Description of the role/persona',
                                },
                            ],
                        },
                    ],
                },
                {
                    displayName: 'Input Message Field',
                    name: 'inputField',
                    type: 'string',
                    default: 'output',
                    displayOptions: {
                        show: {
                            mode: ['store'],
                        },
                    },
                    description: 'The name of the field containing the message to store',
                    required: true,
                    hint: 'This is often "output" for AI node responses or "message" for user inputs',
                },
                {
                    displayName: 'Spot Index',
                    name: 'spotIndex',
                    type: 'number',
                    default: 0,
                    displayOptions: {
                        show: {
                            mode: ['store'],
                        },
                    },
                    description: 'Specify which spot to use (0-based index)',
                    required: true,
                    hint: '0 = first role, 1 = second role, etc.',
                },
                {
                    displayName: 'Example',
                    name: 'storeExample',
                    type: 'notice',
                    default: 'For ChatGPT style conversations, use: User (index 0), Assistant (index 1), and System (index 2).',
                    displayOptions: {
                        show: {
                            mode: ['store'],
                        },
                    }
                },
                {
                    displayName: 'Output Format',
                    name: 'outputFormat',
                    type: 'options',
                    options: [
                        {
                            name: 'Array',
                            value: 'array',
                            description: 'Output messages as an array',
                        },
                        {
                            name: 'Object',
                            value: 'object',
                            description: 'Output messages as an object with role keys',
                        },
                        {
                            name: 'Conversation History',
                            value: 'conversationHistory',
                            description: 'Format as a conversation history for LLMs',
                        },
                    ],
                    default: 'conversationHistory',
                    displayOptions: {
                        show: {
                            mode: ['retrieve'],
                        },
                    },
                    description: 'Format of the retrieved messages',
                },
                {
                    displayName: 'Simplify Output',
                    name: 'simplifyOutput',
                    type: 'boolean',
                    default: true,
                    displayOptions: {
                        show: {
                            mode: ['retrieve'],
                        },
                    },
                    description: 'Whether to return a simplified version of the response instead of the raw data'
                },
                {
                    displayName: 'Maximum Messages to Return',
                    name: 'maxMessages',
                    type: 'number',
                    default: 0,
                    displayOptions: {
                        show: {
                            mode: ['retrieve'],
                        },
                    },
                    description: 'Maximum number of messages to return (0 for all messages)',
                },
            ],
        };
    }
    async execute() {
        var _a;
        const items = this.getInputData();
        const returnData = [];
        const mode = this.getNodeParameter('mode', 0);
        try {
            const staticData = this.getWorkflowStaticData('node');
            console.log('RoundRobin node executing in mode:', mode);
            console.log('Initial staticData keys:', Object.keys(staticData));
            if (staticData._serializedMessages && (!staticData.messages || !Array.isArray(staticData.messages))) {
                try {
                    staticData.messages = JSON.parse(staticData._serializedMessages);
                    console.log('Reconstructed messages from serialized data, count:', staticData.messages.length);
                }
                catch (e) {
                    console.error('Failed to parse serialized messages:', e);
                    staticData.messages = [];
                }
            }
            if (staticData._serializedRoles && (!staticData.roles || !Array.isArray(staticData.roles))) {
                try {
                    staticData.roles = JSON.parse(staticData._serializedRoles);
                    console.log('Reconstructed roles from serialized data, count:', staticData.roles.length);
                }
                catch (e) {
                    console.error('Failed to parse serialized roles:', e);
                    staticData.roles = [];
                }
            }
            if (!staticData.messages || !Array.isArray(staticData.messages))
                staticData.messages = [];
            if (!staticData.roles || !Array.isArray(staticData.roles))
                staticData.roles = [];
            if (typeof staticData.spotCount !== 'number')
                staticData.spotCount = 0;
            if (typeof staticData.lastUpdated !== 'number')
                staticData.lastUpdated = Date.now();
            if (mode === 'store') {
                const spotCount = this.getNodeParameter('spotCount', 0);
                const spotIndex = this.getNodeParameter('spotIndex', 0);
                const inputField = this.getNodeParameter('inputField', 0);
                staticData.spotCount = spotCount;
                const rolesCollection = this.getNodeParameter('roles', 0);
                if (rolesCollection.values && rolesCollection.values.length) {
                    staticData.roles = rolesCollection.values.map(role => ({
                        name: role.name,
                        description: role.description || '',
                    }));
                }
                else if (!staticData.roles.length) {
                    staticData.roles = [
                        { name: 'User', description: 'The human user in the conversation' },
                        { name: 'Assistant', description: 'The AI assistant in the conversation' },
                        { name: 'System', description: 'System instructions for the AI model' }
                    ];
                }
                if (spotIndex < 0 || spotIndex >= spotCount) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Spot index must be between 0 and ${spotCount - 1}`);
                }
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    let messageContent;
                    try {
                        if (item.json[inputField] !== undefined) {
                            messageContent = String(item.json[inputField]);
                        }
                        else if (inputField.includes('$json')) {
                            const fieldMatch = inputField.match(/\{\{\s*\$json\.([a-zA-Z0-9_]+)\s*\}\}/);
                            if (fieldMatch && fieldMatch[1] && item.json[fieldMatch[1]] !== undefined) {
                                messageContent = String(item.json[fieldMatch[1]]);
                            }
                            else {
                                const keys = Object.keys(item.json);
                                if (keys.length > 0) {
                                    messageContent = String(item.json[keys[0]]);
                                }
                                else {
                                    throw new Error(`No data available in item #${i + 1}`);
                                }
                            }
                        }
                        else {
                            const keys = Object.keys(item.json);
                            if (keys.length > 0) {
                                messageContent = String(item.json[keys[0]]);
                            }
                            else {
                                throw new Error(`Item #${i + 1} does not contain any data`);
                            }
                        }
                    }
                    catch (error) {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Failed to extract input data: ${error.message}`);
                    }
                    const roleName = spotIndex < staticData.roles.length
                        ? staticData.roles[spotIndex].name
                        : `Role ${spotIndex + 1}`;
                    const newMessage = {
                        role: roleName,
                        content: messageContent,
                        spotIndex,
                        timestamp: Date.now(),
                    };
                    staticData.messages.push(newMessage);
                    console.log(`Stored message for role "${roleName}":`, newMessage);
                    console.log(`Total messages stored: ${staticData.messages.length}`);
                    returnData.push({
                        json: {
                            ...item.json,
                            roundRobinRole: roleName,
                            roundRobinSpotIndex: spotIndex,
                            roundRobinStored: true,
                            messageCount: staticData.messages.length,
                        },
                        pairedItem: {
                            item: i,
                        },
                    });
                }
                staticData.lastUpdated = Date.now();
                try {
                    staticData._serializedMessages = JSON.stringify(staticData.messages);
                    staticData._serializedRoles = JSON.stringify(staticData.roles);
                }
                catch (e) {
                    console.error('Failed to serialize data:', e);
                }
            }
            else if (mode === 'retrieve') {
                const outputFormat = this.getNodeParameter('outputFormat', 0);
                const maxMessages = this.getNodeParameter('maxMessages', 0, 0);
                const simplifyOutput = this.getNodeParameter('simplifyOutput', 0, true);
                console.log('Retrieving messages from storage');
                console.log('Total messages stored:', ((_a = staticData.messages) === null || _a === void 0 ? void 0 : _a.length) || 0);
                console.log('Storage data keys:', Object.keys(staticData));
                if (!staticData.messages || staticData.messages.length === 0) {
                    console.log('No messages found in storage');
                    returnData.push({
                        json: {
                            status: 'warning',
                            message: 'No messages found in storage. Use "store" mode first.',
                            storageKeys: Object.keys(staticData),
                            lastUpdated: staticData.lastUpdated ? new Date(staticData.lastUpdated).toISOString() : null,
                        },
                    });
                    return [returnData];
                }
                let messages = JSON.parse(JSON.stringify(staticData.messages));
                if (maxMessages > 0 && messages.length > maxMessages) {
                    messages = messages.slice(-maxMessages);
                }
                if (outputFormat === 'array') {
                    const outputJson = {
                        messages: simplifyOutput
                            ? messages.map(m => ({ role: m.role, content: m.content }))
                            : messages,
                        messageCount: messages.length,
                        lastUpdated: new Date(staticData.lastUpdated).toISOString(),
                    };
                    if (!simplifyOutput) {
                        outputJson.roles = JSON.parse(JSON.stringify(staticData.roles));
                    }
                    returnData.push({ json: outputJson });
                }
                else if (outputFormat === 'object') {
                    const messagesByRole = {};
                    for (const message of messages) {
                        const roleName = message.role || `Role ${message.spotIndex + 1}`;
                        if (!messagesByRole[roleName]) {
                            messagesByRole[roleName] = [];
                        }
                        if (simplifyOutput) {
                            messagesByRole[roleName].push(message.content);
                        }
                        else {
                            messagesByRole[roleName].push(message);
                        }
                    }
                    const outputJson = {
                        messagesByRole,
                        messageCount: messages.length,
                        lastUpdated: new Date(staticData.lastUpdated).toISOString(),
                    };
                    if (!simplifyOutput) {
                        outputJson.roles = JSON.parse(JSON.stringify(staticData.roles));
                    }
                    returnData.push({ json: outputJson });
                }
                else if (outputFormat === 'conversationHistory') {
                    const conversationHistory = messages.map(message => {
                        var _a;
                        return ({
                            role: ((_a = message.role) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || 'assistant',
                            content: message.content,
                        });
                    });
                    const outputJson = {
                        conversationHistory,
                        messageCount: conversationHistory.length,
                    };
                    if (!simplifyOutput) {
                        outputJson.lastUpdated = new Date(staticData.lastUpdated).toISOString();
                    }
                    returnData.push({ json: outputJson });
                }
            }
            else if (mode === 'clear') {
                staticData.messages = [];
                staticData._serializedMessages = JSON.stringify([]);
                staticData._serializedRoles = JSON.stringify(staticData.roles);
                staticData.lastUpdated = Date.now();
                console.log('Storage cleared successfully');
                returnData.push({
                    json: {
                        status: 'success',
                        message: 'Storage cleared successfully',
                        timestamp: new Date().toISOString(),
                    },
                });
            }
            console.log('Final storage state - message count:', staticData.messages.length);
            try {
                staticData._serializedMessages = JSON.stringify(staticData.messages);
                staticData._serializedRoles = JSON.stringify(staticData.roles);
            }
            catch (e) {
                console.error('Failed to serialize data at end of execution:', e);
            }
        }
        catch (error) {
            if (error instanceof n8n_workflow_1.NodeOperationError) {
                throw error;
            }
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), error instanceof Error ? error.message : 'An unknown error occurred');
        }
        return [returnData];
    }
}
exports.RoundRobin = RoundRobin;
//# sourceMappingURL=RoundRobin.node.js.map