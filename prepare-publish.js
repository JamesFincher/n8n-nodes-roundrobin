const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
    fs.mkdirSync(path.join(__dirname, 'dist'));
}

// Create nodes directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'dist', 'nodes'))) {
    fs.mkdirSync(path.join(__dirname, 'dist', 'nodes'));
}

// Create RoundRobin directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'dist', 'nodes', 'RoundRobin'))) {
    fs.mkdirSync(path.join(__dirname, 'dist', 'nodes', 'RoundRobin'));
}

// Copy node definition
fs.copyFileSync(
    path.join(__dirname, 'nodes', 'RoundRobin', 'RoundRobin.node.json'),
    path.join(__dirname, 'dist', 'nodes', 'RoundRobin', 'RoundRobin.node.json')
);

// Copy package definition
fs.copyFileSync(
    path.join(__dirname, 'n8n-nodes-roundrobin.json'),
    path.join(__dirname, 'dist', 'n8n-nodes-roundrobin.json')
);

// Generate JavaScript implementation
const jsContent = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoundRobin = void 0;
class RoundRobin {
    constructor() {
        this.description = {
            displayName: 'Round Robin',
            name: 'roundRobin',
            icon: 'file:roundRobin.svg',
            group: ['transform'],
            version: 1,
            subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
            description: 'Store and retrieve message history for multi-turn conversations',
            defaults: {
                name: 'Round Robin',
            },
            inputs: ['main'],
            outputs: ['main'],
            properties: [
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Store Message',
                            value: 'store',
                            description: 'Store a message in the conversation history',
                            action: 'Store a message in conversation history',
                        },
                        {
                            name: 'Retrieve Messages',
                            value: 'retrieve',
                            description: 'Retrieve messages from the conversation history',
                            action: 'Retrieve messages from conversation history',
                        },
                        {
                            name: 'Clear History',
                            value: 'clear',
                            description: 'Clear the conversation history',
                            action: 'Clear conversation history',
                        },
                    ],
                    default: 'store',
                },
                {
                    displayName: 'Conversation ID',
                    name: 'conversationId',
                    type: 'string',
                    default: '',
                    required: true,
                    description: 'ID to identify this conversation thread',
                },
                {
                    displayName: 'Message Role',
                    name: 'messageRole',
                    type: 'string',
                    displayOptions: {
                        show: {
                            operation: ['store'],
                        },
                    },
                    default: '',
                    placeholder: 'user, assistant, system',
                    description: 'Role of the message sender (e.g., user, assistant, system)',
                },
                {
                    displayName: 'Message Content',
                    name: 'messageContent',
                    type: 'string',
                    typeOptions: {
                        rows: 4,
                    },
                    displayOptions: {
                        show: {
                            operation: ['store'],
                        },
                    },
                    default: '',
                    description: 'Content of the message',
                },
                {
                    displayName: 'Message ID',
                    name: 'messageId',
                    type: 'string',
                    displayOptions: {
                        show: {
                            operation: ['store'],
                        },
                    },
                    default: '',
                    description: 'Optional ID for the message. If not provided, a timestamp will be used',
                },
                {
                    displayName: 'Last N Messages',
                    name: 'lastN',
                    type: 'number',
                    displayOptions: {
                        show: {
                            operation: ['retrieve'],
                        },
                    },
                    default: 10,
                    description: 'Number of most recent messages to retrieve (0 for all)',
                },
                {
                    displayName: 'Filter by Role',
                    name: 'filterRole',
                    type: 'string',
                    displayOptions: {
                        show: {
                            operation: ['retrieve'],
                        },
                    },
                    default: '',
                    description: 'Filter messages by role (leave empty for all roles)',
                },
                {
                    displayName: 'Output Format',
                    name: 'outputFormat',
                    type: 'options',
                    displayOptions: {
                        show: {
                            operation: ['retrieve'],
                        },
                    },
                    options: [
                        {
                            name: 'Array',
                            value: 'array',
                            description: 'Output as an array of message objects',
                        },
                        {
                            name: 'Combined Text',
                            value: 'text',
                            description: 'Output as a single combined text string',
                        },
                        {
                            name: 'OpenAI Format',
                            value: 'openai',
                            description: 'Format compatible with OpenAI message history',
                        },
                    ],
                    default: 'array',
                    description: 'How to format the retrieved messages',
                },
                {
                    displayName: 'Text Separator',
                    name: 'textSeparator',
                    type: 'string',
                    displayOptions: {
                        show: {
                            operation: ['retrieve'],
                            outputFormat: ['text'],
                        },
                    },
                    default: '\\n',
                    description: 'Separator to use between messages when using text output format',
                },
            ],
        };
    }
    async execute() {
        const operation = this.getNodeParameter('operation', 0);
        const conversationId = this.getNodeParameter('conversationId', 0);
        const items = this.getInputData();
        
        // Create storage context
        const context = this.getContext('roundRobin');
        if (!context.conversations) {
            context.conversations = {};
        }
        
        // Ensure this conversation exists
        if (!context.conversations[conversationId]) {
            context.conversations[conversationId] = [];
        }
        
        if (operation === 'store') {
            // Store operation
            const messageRole = this.getNodeParameter('messageRole', 0);
            const messageContent = this.getNodeParameter('messageContent', 0);
            let messageId = this.getNodeParameter('messageId', 0);
            
            if (!messageId) {
                messageId = Date.now().toString();
            }
            
            const message = {
                id: messageId,
                role: messageRole,
                content: messageContent,
                timestamp: new Date().toISOString(),
            };
            
            context.conversations[conversationId].push(message);
            
            return [this.helpers.returnJsonArray({ success: true, messageId })];
        } 
        else if (operation === 'retrieve') {
            // Retrieve operation
            const lastN = this.getNodeParameter('lastN', 0) || 0;
            const filterRole = this.getNodeParameter('filterRole', 0);
            const outputFormat = this.getNodeParameter('outputFormat', 0);
            
            let messages = [...context.conversations[conversationId]];
            
            // Apply role filter if specified
            if (filterRole) {
                messages = messages.filter(msg => msg.role === filterRole);
            }
            
            // Apply lastN filter
            if (lastN > 0 && messages.length > lastN) {
                messages = messages.slice(-lastN);
            }
            
            // Format the output
            if (outputFormat === 'array') {
                return [this.helpers.returnJsonArray({ messages })];
            } 
            else if (outputFormat === 'text') {
                const separator = this.getNodeParameter('textSeparator', 0).replace('\\n', '\\n');
                const combinedText = messages.map(msg => msg.content).join(separator);
                return [this.helpers.returnJsonArray({ text: combinedText })];
            } 
            else if (outputFormat === 'openai') {
                const openaiMessages = messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                }));
                return [this.helpers.returnJsonArray({ messages: openaiMessages })];
            }
        } 
        else if (operation === 'clear') {
            // Clear operation
            context.conversations[conversationId] = [];
            return [this.helpers.returnJsonArray({ success: true, cleared: true })];
        }
        
        return [this.helpers.returnJsonArray({ success: false })];
    }
}
exports.RoundRobin = RoundRobin;
`;

fs.writeFileSync(
    path.join(__dirname, 'dist', 'nodes', 'RoundRobin', 'RoundRobin.node.js'),
    jsContent
);

console.log('Files prepared for publishing'); 