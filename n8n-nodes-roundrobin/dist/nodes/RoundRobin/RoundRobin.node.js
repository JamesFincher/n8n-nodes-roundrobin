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
            const nodeId = this.getNode().name;
            const staticData = this.getWorkflowStaticData(nodeId);
            console.log('RoundRobin node executing in mode:', mode);
            console.log(`Node ID for storage: ${nodeId}`);
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
                        color: role.color || '#ff9900',
                        tone: role.tone || 'neutral',
                        expertise: typeof role.expertise === 'string'
                            ? role.expertise.split(',').map(item => item.trim())
                            : (Array.isArray(role.expertise) ? role.expertise : []),
                        systemPrompt: role.systemPrompt || '',
                        isEnabled: role.isEnabled !== undefined ? role.isEnabled : true,
                    }));
                }
                else if (!staticData.roles.length) {
                    staticData.roles = [
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
                    const llmPlatform = this.getNodeParameter('llmPlatform', 0, 'openai');
                    const includeSystemPrompt = this.getNodeParameter('includeSystemPrompt', 0, true);
                    const systemPromptPosition = this.getNodeParameter('systemPromptPosition', 0, 'start');
                    const systemRole = staticData.roles.find(role => role.name.toLowerCase() === 'system');
                    const systemPrompt = (systemRole === null || systemRole === void 0 ? void 0 : systemRole.systemPrompt) || 'You are a helpful, friendly AI assistant.';
                    const enabledMessages = messages.filter(msg => {
                        const role = staticData.roles.find(r => r.name === msg.role);
                        return (role === null || role === void 0 ? void 0 : role.isEnabled) !== false;
                    });
                    let conversationHistory = [];
                    if (llmPlatform === 'openai') {
                        if (includeSystemPrompt && systemPromptPosition === 'start') {
                            conversationHistory.push({
                                role: 'system',
                                content: systemPrompt,
                            });
                        }
                        conversationHistory = [
                            ...conversationHistory,
                            ...enabledMessages.map(message => {
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
                    }
                    else if (llmPlatform === 'anthropic') {
                        let claudeFormat = '';
                        if (includeSystemPrompt) {
                            claudeFormat += `\n\nSystem: ${systemPrompt}\n\n`;
                        }
                        for (const message of enabledMessages) {
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
                            messageCount: enabledMessages.length,
                        };
                        if (!simplifyOutput) {
                            outputJson.messages = enabledMessages;
                            outputJson.lastUpdated = new Date(staticData.lastUpdated).toISOString();
                        }
                        returnData.push({ json: outputJson });
                        return [returnData];
                    }
                    else if (llmPlatform === 'google') {
                        if (includeSystemPrompt && systemPromptPosition === 'start') {
                            conversationHistory.push({
                                role: 'system',
                                content: systemPrompt,
                            });
                        }
                        conversationHistory = [
                            ...conversationHistory,
                            ...enabledMessages.map(message => {
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
                    }
                    else {
                        if (includeSystemPrompt && systemPromptPosition === 'start') {
                            conversationHistory.push({
                                role: 'system',
                                content: systemPrompt,
                            });
                        }
                        conversationHistory = [
                            ...conversationHistory,
                            ...enabledMessages.map(message => ({
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
                    }
                    const outputJson = {
                        conversationHistory,
                        messageCount: conversationHistory.length,
                    };
                    if (!simplifyOutput) {
                        outputJson.lastUpdated = new Date(staticData.lastUpdated).toISOString();
                        outputJson.platform = llmPlatform;
                        outputJson.roles = JSON.parse(JSON.stringify(staticData.roles));
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