"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoundRobin = exports.RoundRobinStorage = void 0;
const n8n_workflow_1 = require("n8n-workflow");
class RoundRobinStorage {
    static getPrefix(nodeName) {
        return `rr_${nodeName.replace(/[^a-zA-Z0-9]/g, '_')}`;
    }
    static getMessagesKey(nodeName) {
        return `${this.getPrefix(nodeName)}_messages`;
    }
    static getRolesKey(nodeName) {
        return `${this.getPrefix(nodeName)}_roles`;
    }
    static getSpotCountKey(nodeName) {
        return `${this.getPrefix(nodeName)}_spotCount`;
    }
    static getLastUpdatedKey(nodeName) {
        return `${this.getPrefix(nodeName)}_lastUpdated`;
    }
    static getMessages(staticData, nodeName) {
        const key = this.getMessagesKey(nodeName);
        return staticData[key] || [];
    }
    static setMessages(staticData, nodeName, messages) {
        const key = this.getMessagesKey(nodeName);
        staticData[key] = messages;
    }
    static getRoles(staticData, nodeName) {
        const key = this.getRolesKey(nodeName);
        return staticData[key] || [];
    }
    static setRoles(staticData, nodeName, roles) {
        const key = this.getRolesKey(nodeName);
        staticData[key] = roles;
    }
    static getSpotCount(staticData, nodeName) {
        const key = this.getSpotCountKey(nodeName);
        return staticData[key] || 0;
    }
    static setSpotCount(staticData, nodeName, count) {
        const key = this.getSpotCountKey(nodeName);
        staticData[key] = count;
    }
    static getLastUpdated(staticData, nodeName) {
        const key = this.getLastUpdatedKey(nodeName);
        return staticData[key] || Date.now();
    }
    static setLastUpdated(staticData, nodeName, timestamp) {
        const key = this.getLastUpdatedKey(nodeName);
        staticData[key] = timestamp;
    }
    static initializeStorage(staticData, nodeName) {
        if (!this.getMessages(staticData, nodeName).length) {
            this.setMessages(staticData, nodeName, []);
        }
        if (!this.getRoles(staticData, nodeName).length) {
            this.setRoles(staticData, nodeName, []);
        }
        if (!this.getSpotCount(staticData, nodeName)) {
            this.setSpotCount(staticData, nodeName, 0);
        }
        this.setLastUpdated(staticData, nodeName, Date.now());
    }
}
exports.RoundRobinStorage = RoundRobinStorage;
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
        const items = this.getInputData();
        const returnData = [];
        const mode = this.getNodeParameter('mode', 0);
        try {
            const nodeName = this.getNode().name;
            const staticData = this.getWorkflowStaticData('global');
            RoundRobinStorage.initializeStorage(staticData, nodeName);
            console.log('RoundRobin node executing in mode:', mode);
            console.log(`Node instance: ${nodeName}`);
            const messages = RoundRobinStorage.getMessages(staticData, nodeName);
            const roles = RoundRobinStorage.getRoles(staticData, nodeName);
            const spotCount = RoundRobinStorage.getSpotCount(staticData, nodeName);
            const lastUpdated = RoundRobinStorage.getLastUpdated(staticData, nodeName);
            console.log('Current message count:', messages.length);
            console.log('Current roles count:', roles.length);
            if (mode === 'store') {
                const newSpotCount = this.getNodeParameter('spotCount', 0);
                const spotIndex = this.getNodeParameter('spotIndex', 0);
                const inputField = this.getNodeParameter('inputField', 0);
                RoundRobinStorage.setSpotCount(staticData, nodeName, newSpotCount);
                const rolesCollection = this.getNodeParameter('roles', 0);
                const updatedRoles = processRoles(rolesCollection);
                if (updatedRoles.length > 0) {
                    RoundRobinStorage.setRoles(staticData, nodeName, updatedRoles);
                }
                else if (roles.length === 0) {
                    const defaultRoles = getDefaultRoles();
                    RoundRobinStorage.setRoles(staticData, nodeName, defaultRoles);
                }
                const currentRoles = RoundRobinStorage.getRoles(staticData, nodeName);
                if (spotIndex < 0 || spotIndex >= newSpotCount) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Spot index must be between 0 and ${newSpotCount - 1}`);
                }
                const updatedMessages = [...messages];
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    const messageContent = extractMessageContent(item, inputField, i, this);
                    const roleName = spotIndex < currentRoles.length
                        ? currentRoles[spotIndex].name
                        : `Role ${spotIndex + 1}`;
                    const newMessage = {
                        role: roleName,
                        content: messageContent,
                        spotIndex,
                        timestamp: Date.now(),
                    };
                    updatedMessages.push(newMessage);
                    console.log(`Stored message for role "${roleName}":`, newMessage);
                    console.log(`Total messages stored: ${updatedMessages.length}`);
                    returnData.push({
                        json: {
                            ...item.json,
                            roundRobinRole: roleName,
                            roundRobinSpotIndex: spotIndex,
                            roundRobinStored: true,
                            messageCount: updatedMessages.length,
                        },
                        pairedItem: {
                            item: i,
                        },
                    });
                }
                RoundRobinStorage.setMessages(staticData, nodeName, updatedMessages);
                RoundRobinStorage.setLastUpdated(staticData, nodeName, Date.now());
            }
            else if (mode === 'retrieve') {
                const outputFormat = this.getNodeParameter('outputFormat', 0);
                const maxMessages = this.getNodeParameter('maxMessages', 0, 0);
                const simplifyOutput = this.getNodeParameter('simplifyOutput', 0, true);
                console.log('Retrieving messages from storage');
                console.log('Total messages stored:', messages.length);
                if (messages.length === 0) {
                    console.log('No messages found in storage');
                    returnData.push({
                        json: {
                            status: 'warning',
                            message: 'No messages found in storage. Use "store" mode first.',
                            lastUpdated: lastUpdated ? new Date(lastUpdated).toISOString() : null,
                        },
                    });
                    return [returnData];
                }
                let messagesToProcess = [...messages];
                if (maxMessages > 0 && messagesToProcess.length > maxMessages) {
                    messagesToProcess = messagesToProcess.slice(-maxMessages);
                }
                if (outputFormat === 'array') {
                    processArrayOutput(returnData, messagesToProcess, roles, lastUpdated, simplifyOutput);
                }
                else if (outputFormat === 'object') {
                    processObjectOutput(returnData, messagesToProcess, roles, lastUpdated, simplifyOutput);
                }
                else if (outputFormat === 'conversationHistory') {
                    processConversationHistoryOutput(this, returnData, messagesToProcess, roles, lastUpdated, simplifyOutput);
                }
            }
            else if (mode === 'clear') {
                RoundRobinStorage.setMessages(staticData, nodeName, []);
                RoundRobinStorage.setLastUpdated(staticData, nodeName, Date.now());
                console.log('Storage cleared successfully');
                returnData.push({
                    json: {
                        status: 'success',
                        message: 'Storage cleared successfully',
                        timestamp: new Date().toISOString(),
                    },
                });
            }
            console.log('Final storage state - message count:', RoundRobinStorage.getMessages(staticData, nodeName).length);
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
        return [];
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
        throw new n8n_workflow_1.NodeOperationError(executeFunctions.getNode(), `Failed to extract input data: ${error.message}`);
    }
}
function processArrayOutput(returnData, messages, roles, lastUpdated, simplifyOutput) {
    const outputJson = {
        messages: simplifyOutput
            ? messages.map(m => ({ role: m.role, content: m.content }))
            : messages,
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
        if (error instanceof Error) {
            throw new n8n_workflow_1.NodeOperationError(executeFunctions.getNode(), `Error in conversation history processing: ${error.message}`);
        }
        throw error;
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