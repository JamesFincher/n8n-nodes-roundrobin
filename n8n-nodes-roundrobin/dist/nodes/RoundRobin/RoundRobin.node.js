"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoundRobin = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const AirtableStorage_1 = require("./AirtableStorage");
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
            credentials: [
                {
                    name: 'airtableApi',
                    required: true,
                },
            ],
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
                    displayName: 'Airtable Base ID',
                    name: 'baseId',
                    type: 'string',
                    default: '',
                    required: true,
                    description: 'The Airtable Base ID where messages will be stored',
                    placeholder: 'appXXXXXXXXXXXXXX',
                },
                {
                    displayName: 'Table Name',
                    name: 'tableName',
                    type: 'string',
                    default: 'RoundRobinMessages',
                    required: true,
                    description: 'Name of the table to store messages in',
                },
                {
                    displayName: 'Storage ID',
                    name: 'storageId',
                    type: 'string',
                    default: '',
                    description: 'Optional: Set a consistent ID to share storage across multiple node instances. If left empty, workflow ID will be used.',
                },
                {
                    displayName: 'Storage Notice',
                    name: 'storageNotice',
                    type: 'notice',
                    default: 'Data is stored in Airtable and will persist across n8n restarts. The table must have fields: workflowId (text), role (text), content (long text), spotIndex (number), timestamp (number), metadata (long text).',
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
                            {
                                name: 'User',
                                description: 'The human user in the conversation',
                                color: '#6E9BF7',
                                isEnabled: true
                            },
                            {
                                name: 'Assistant',
                                description: 'The AI assistant in the conversation',
                                color: '#9E78FF',
                                isEnabled: true
                            },
                            {
                                name: 'System',
                                description: 'System instructions for the AI model',
                                color: '#FF9900',
                                isEnabled: true
                            }
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
                                {
                                    displayName: 'Color',
                                    name: 'color',
                                    type: 'color',
                                    default: '#ff9900',
                                    description: 'Color associated with this role for visual identification',
                                },
                                {
                                    displayName: 'Tone',
                                    name: 'tone',
                                    type: 'options',
                                    options: [
                                        { name: 'Neutral', value: 'neutral' },
                                        { name: 'Friendly', value: 'friendly' },
                                        { name: 'Professional', value: 'professional' },
                                        { name: 'Technical', value: 'technical' },
                                        { name: 'Empathetic', value: 'empathetic' },
                                        { name: 'Assertive', value: 'assertive' },
                                    ],
                                    default: 'neutral',
                                    description: 'Tone of voice for this persona',
                                },
                                {
                                    displayName: 'Expertise Areas',
                                    name: 'expertise',
                                    type: 'string',
                                    default: '',
                                    description: 'Comma-separated list of expertise areas (e.g., "programming, marketing, design")',
                                },
                                {
                                    displayName: 'System Prompt Template',
                                    name: 'systemPrompt',
                                    type: 'string',
                                    typeOptions: {
                                        rows: 4,
                                    },
                                    default: '',
                                    description: 'System prompt template for this persona (if role is "system" or you need role-specific instructions)',
                                },
                                {
                                    displayName: 'Enabled',
                                    name: 'isEnabled',
                                    type: 'boolean',
                                    default: true,
                                    description: 'Whether this role should be included in the conversation',
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
                    displayName: 'LLM Platform',
                    name: 'llmPlatform',
                    type: 'options',
                    options: [
                        {
                            name: 'OpenAI (ChatGPT)',
                            value: 'openai',
                            description: 'Format for OpenAI models (GPT-3.5, GPT-4, etc.)',
                        },
                        {
                            name: 'Anthropic (Claude)',
                            value: 'anthropic',
                            description: 'Format for Anthropic Claude models',
                        },
                        {
                            name: 'Google (Gemini)',
                            value: 'google',
                            description: 'Format for Google Gemini models',
                        },
                        {
                            name: 'Generic',
                            value: 'generic',
                            description: 'Generic format that works with most LLMs',
                        },
                    ],
                    default: 'openai',
                    displayOptions: {
                        show: {
                            mode: ['retrieve'],
                            outputFormat: ['conversationHistory'],
                        },
                    },
                    description: 'Which LLM platform to format the conversation history for',
                },
                {
                    displayName: 'Include System Prompt',
                    name: 'includeSystemPrompt',
                    type: 'boolean',
                    default: true,
                    displayOptions: {
                        show: {
                            mode: ['retrieve'],
                            outputFormat: ['conversationHistory'],
                        },
                    },
                    description: 'Whether to include system prompt/instructions in the conversation history',
                },
                {
                    displayName: 'System Prompt Position',
                    name: 'systemPromptPosition',
                    type: 'options',
                    options: [
                        {
                            name: 'Start of Conversation',
                            value: 'start',
                            description: 'Place system prompt at the beginning (as first message)',
                        },
                        {
                            name: 'End of Conversation',
                            value: 'end',
                            description: 'Place system prompt at the end (as last message)',
                        },
                    ],
                    default: 'start',
                    displayOptions: {
                        show: {
                            mode: ['retrieve'],
                            outputFormat: ['conversationHistory'],
                            includeSystemPrompt: [true],
                        },
                    },
                    description: 'Where to place the system prompt in the conversation',
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
            const nodeName = this.getNode().name;
            const credentials = await this.getCredentials('airtableApi');
            const baseId = this.getNodeParameter('baseId', 0);
            const tableName = this.getNodeParameter('tableName', 0);
            const storage = new AirtableStorage_1.AirtableStorage(this, credentials.apiKey, baseId, tableName);
            await storage.initialize();
            let workflowId = (_a = this.getWorkflow()) === null || _a === void 0 ? void 0 : _a.id;
            const userStorageId = this.getNodeParameter('storageId', 0, '');
            if (userStorageId) {
                console.log(`[Execution] Using user-provided Storage ID: "${userStorageId}" instead of workflow ID`);
                workflowId = userStorageId;
            }
            else if (!workflowId) {
                workflowId = `roundrobin_${nodeName}`;
                console.log(`[Execution] Using node name as fallback Storage ID: ${workflowId}`);
            }
            console.log(`[Execution] Using effective ID for storage: ${workflowId}`);
            console.log('RoundRobin node executing in mode:', mode);
            console.log(`Node instance: ${nodeName}`);
            if (mode === 'store') {
                const spotCount = this.getNodeParameter('spotCount', 0);
                const spotIndex = this.getNodeParameter('spotIndex', 0);
                const inputField = this.getNodeParameter('inputField', 0);
                const rolesCollection = this.getNodeParameter('roles', 0);
                const roles = processRoles(rolesCollection);
                if (spotIndex < 0 || spotIndex >= spotCount) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Spot index must be between 0 and ${spotCount - 1}`);
                }
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    const messageContent = extractMessageContent(item, inputField, i, this);
                    const roleName = spotIndex < roles.length
                        ? roles[spotIndex].name
                        : `Role ${spotIndex + 1}`;
                    const newMessage = await storage.storeMessage(workflowId, roleName, messageContent, spotIndex, { roles: JSON.stringify(roles) });
                    console.log(`Stored message for role "${roleName}":`, newMessage);
                    returnData.push({
                        json: {
                            ...item.json,
                            roundRobinRole: roleName,
                            roundRobinSpotIndex: spotIndex,
                            roundRobinStored: true,
                            messageId: newMessage.id,
                        },
                        pairedItem: {
                            item: i,
                        },
                    });
                }
            }
            else if (mode === 'retrieve') {
                const outputFormat = this.getNodeParameter('outputFormat', 0);
                const maxMessages = this.getNodeParameter('maxMessages', 0, 0);
                const simplifyOutput = this.getNodeParameter('simplifyOutput', 0, true);
                const messages = await storage.getMessages(workflowId);
                console.log('Retrieving messages from storage');
                console.log('Total messages stored:', messages.length);
                if (messages.length === 0) {
                    console.log('No messages found in storage');
                    returnData.push({
                        json: {
                            status: 'warning',
                            message: 'No messages found in storage. Use "store" mode first.',
                            lastUpdated: new Date().toISOString(),
                        },
                    });
                    return [returnData];
                }
                const uniqueRoles = Array.from(new Set(messages.map(msg => msg.role)));
                const roles = uniqueRoles.map(role => ({
                    name: role,
                    description: '',
                }));
                let messagesToProcess = [...messages];
                if (maxMessages > 0 && messagesToProcess.length > maxMessages) {
                    messagesToProcess = messagesToProcess.slice(-maxMessages);
                }
                if (outputFormat === 'array') {
                    processArrayOutput(returnData, messagesToProcess, roles, Date.now(), simplifyOutput);
                }
                else if (outputFormat === 'object') {
                    processObjectOutput(returnData, messagesToProcess, roles, Date.now(), simplifyOutput);
                }
                else if (outputFormat === 'conversationHistory') {
                    processConversationHistoryOutput(this, returnData, messagesToProcess, roles, Date.now(), simplifyOutput);
                }
            }
            else if (mode === 'clear') {
                const deletedCount = await storage.clearMessages(workflowId);
                console.log('Storage cleared successfully');
                returnData.push({
                    json: {
                        status: 'success',
                        message: `Storage cleared successfully. Deleted ${deletedCount} messages.`,
                        timestamp: new Date().toISOString(),
                    },
                });
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
function processRoles(rolesCollection) {
    if (!rolesCollection.values || !rolesCollection.values.length) {
        return getDefaultRoles();
    }
    return rolesCollection.values.map(role => ({
        name: role.name,
        description: role.description || '',
        color: role.color || '#ff9900',
        tone: role.tone || 'neutral',
        expertise: typeof role.expertise === 'string'
            ? role.expertise.split(',').map((item) => item.trim())
            : (Array.isArray(role.expertise) ? role.expertise : []),
        systemPrompt: role.systemPrompt || '',
        isEnabled: role.isEnabled !== undefined ? role.isEnabled : true,
    }));
}
function getDefaultRoles() {
    return [
        {
            name: 'User',
            description: 'The human user in the conversation',
            color: '#6E9BF7',
            isEnabled: true,
            expertise: []
        },
        {
            name: 'Assistant',
            description: 'The AI assistant in the conversation',
            color: '#9E78FF',
            isEnabled: true,
            expertise: []
        },
        {
            name: 'System',
            description: 'System instructions for the AI model',
            color: '#FF9900',
            isEnabled: true,
            systemPrompt: 'You are a helpful, friendly AI assistant.',
            expertise: []
        }
    ];
}
function extractMessageContent(item, inputField, itemIndex, executeFunctions) {
    try {
        if (item.json[inputField] !== undefined) {
            return String(item.json[inputField]);
        }
        else if (inputField.includes('$json')) {
            const fieldMatch = inputField.match(/\{\{\s*\$json\.([a-zA-Z0-9_]+)\s*\}\}/);
            if (fieldMatch && fieldMatch[1] && item.json[fieldMatch[1]] !== undefined) {
                return String(item.json[fieldMatch[1]]);
            }
            else {
                const keys = Object.keys(item.json);
                if (keys.length > 0) {
                    return String(item.json[keys[0]]);
                }
                else {
                    throw new Error(`No data available in item #${itemIndex + 1}`);
                }
            }
        }
        else {
            const keys = Object.keys(item.json);
            if (keys.length > 0) {
                return String(item.json[keys[0]]);
            }
            else {
                throw new Error(`Item #${itemIndex + 1} does not contain any data`);
            }
        }
    }
    catch (error) {
        throw new n8n_workflow_1.NodeOperationError(executeFunctions.getNode(), `Failed to extract input data: ${error instanceof Error ? error.message : String(error)}`);
    }
}
function processArrayOutput(returnData, messages, roles, lastUpdated, simplifyOutput) {
    const outputMessages = messages.map(message => {
        if (simplifyOutput) {
            return {
                role: message.role,
                content: message.content,
            };
        }
        return message;
    });
    const outputJson = {
        messages: outputMessages,
        messageCount: messages.length,
        lastUpdated: new Date(lastUpdated).toISOString(),
    };
    if (!simplifyOutput) {
        outputJson.roles = roles;
    }
    returnData.push({ json: outputJson });
}
function processObjectOutput(returnData, messages, roles, lastUpdated, simplifyOutput) {
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
        lastUpdated: new Date(lastUpdated).toISOString(),
    };
    if (!simplifyOutput) {
        outputJson.roles = roles;
    }
    returnData.push({ json: outputJson });
}
function processConversationHistoryOutput(executeFunctions, returnData, messages, roles, lastUpdated, simplifyOutput) {
    try {
        const llmPlatform = String(executeFunctions.getNodeParameter('llmPlatform', 0, 'openai'));
        const includeSystemPrompt = Boolean(executeFunctions.getNodeParameter('includeSystemPrompt', 0, true));
        const systemPromptPosition = String(executeFunctions.getNodeParameter('systemPromptPosition', 0, 'start'));
        const systemRole = roles.find(role => role.name.toLowerCase() === 'system');
        const systemPrompt = (systemRole === null || systemRole === void 0 ? void 0 : systemRole.systemPrompt) || 'You are a helpful, friendly AI assistant.';
        const enabledMessages = messages.filter(msg => {
            const role = roles.find(r => r.name === msg.role);
            return (role === null || role === void 0 ? void 0 : role.isEnabled) !== false;
        });
        if (llmPlatform === 'openai') {
            formatOpenAIConversation(returnData, enabledMessages, systemPrompt, includeSystemPrompt, systemPromptPosition, lastUpdated, simplifyOutput, roles);
        }
        else if (llmPlatform === 'anthropic') {
            formatAnthropicConversation(returnData, enabledMessages, systemPrompt, includeSystemPrompt, lastUpdated, simplifyOutput);
        }
        else if (llmPlatform === 'google') {
            formatGoogleConversation(returnData, enabledMessages, systemPrompt, includeSystemPrompt, systemPromptPosition, lastUpdated, simplifyOutput, roles);
        }
        else {
            formatGenericConversation(returnData, enabledMessages, systemPrompt, includeSystemPrompt, systemPromptPosition, lastUpdated, simplifyOutput, roles);
        }
    }
    catch (error) {
        throw new n8n_workflow_1.NodeOperationError(executeFunctions.getNode(), `Error in conversation history processing: ${error.message}`);
    }
}
function formatOpenAIConversation(returnData, messages, systemPrompt, includeSystemPrompt, systemPromptPosition, lastUpdated, simplifyOutput, roles) {
    let conversationHistory = [];
    if (includeSystemPrompt && systemPromptPosition === 'start') {
        conversationHistory.push({
            role: 'system',
            content: systemPrompt,
        });
    }
    conversationHistory = [
        ...conversationHistory,
        ...messages.map(message => {
            let role = message.role.toLowerCase();
            if (role === 'user' || role === 'human')
                role = 'user';
            if (role === 'assistant' || role === 'ai')
                role = 'assistant';
            if (role === 'system' || role === 'instructions')
                role = 'system';
            return {
                role,
                content: message.content,
            };
        }),
    ];
    if (includeSystemPrompt && systemPromptPosition === 'end') {
        conversationHistory.push({
            role: 'system',
            content: systemPrompt,
        });
    }
    const outputJson = {
        conversationHistory,
        messageCount: conversationHistory.length,
    };
    if (!simplifyOutput) {
        outputJson.lastUpdated = new Date(lastUpdated).toISOString();
        outputJson.platform = 'openai';
        outputJson.roles = roles;
    }
    returnData.push({ json: outputJson });
}
function formatAnthropicConversation(returnData, messages, systemPrompt, includeSystemPrompt, lastUpdated, simplifyOutput) {
    let claudeFormat = '';
    if (includeSystemPrompt) {
        claudeFormat += `\n\nSystem: ${systemPrompt}\n\n`;
    }
    for (const message of messages) {
        let role = message.role.toLowerCase();
        if (role === 'user' || role === 'human')
            role = 'Human';
        else if (role === 'assistant' || role === 'ai')
            role = 'Assistant';
        else if (role === 'system')
            continue;
        claudeFormat += `\n\n${role}: ${message.content}`;
    }
    const outputJson = {
        claudeFormat: claudeFormat.trim(),
        messageCount: messages.length,
    };
    if (!simplifyOutput) {
        outputJson.messages = messages;
        outputJson.lastUpdated = new Date(lastUpdated).toISOString();
        outputJson.platform = 'anthropic';
    }
    returnData.push({ json: outputJson });
}
function formatGoogleConversation(returnData, messages, systemPrompt, includeSystemPrompt, systemPromptPosition, lastUpdated, simplifyOutput, roles) {
    let conversationHistory = [];
    if (includeSystemPrompt && systemPromptPosition === 'start') {
        conversationHistory.push({
            role: 'system',
            content: systemPrompt,
        });
    }
    conversationHistory = [
        ...conversationHistory,
        ...messages.map(message => {
            let role = message.role.toLowerCase();
            if (role === 'user' || role === 'human')
                role = 'user';
            if (role === 'assistant' || role === 'ai' || role === 'bot')
                role = 'model';
            if (role === 'system' || role === 'instructions')
                role = 'system';
            return {
                role,
                content: message.content,
            };
        }),
    ];
    if (includeSystemPrompt && systemPromptPosition === 'end') {
        conversationHistory.push({
            role: 'system',
            content: systemPrompt,
        });
    }
    const outputJson = {
        conversationHistory,
        messageCount: conversationHistory.length,
    };
    if (!simplifyOutput) {
        outputJson.lastUpdated = new Date(lastUpdated).toISOString();
        outputJson.platform = 'google';
        outputJson.roles = roles;
    }
    returnData.push({ json: outputJson });
}
function formatGenericConversation(returnData, messages, systemPrompt, includeSystemPrompt, systemPromptPosition, lastUpdated, simplifyOutput, roles) {
    let conversationHistory = [];
    if (includeSystemPrompt && systemPromptPosition === 'start') {
        conversationHistory.push({
            role: 'system',
            content: systemPrompt,
        });
    }
    conversationHistory = [
        ...conversationHistory,
        ...messages.map(message => ({
            role: message.role.toLowerCase(),
            content: message.content,
        })),
    ];
    if (includeSystemPrompt && systemPromptPosition === 'end') {
        conversationHistory.push({
            role: 'system',
            content: systemPrompt,
        });
    }
    const outputJson = {
        conversationHistory,
        messageCount: conversationHistory.length,
    };
    if (!simplifyOutput) {
        outputJson.lastUpdated = new Date(lastUpdated).toISOString();
        outputJson.platform = 'generic';
        outputJson.roles = roles;
    }
    returnData.push({ json: outputJson });
}
//# sourceMappingURL=RoundRobin.node.js.map