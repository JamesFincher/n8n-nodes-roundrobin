const fs = require('fs');
const path = require('path');

// Ensure dist directory exists
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  fs.mkdirSync(path.join(__dirname, 'dist'));
}

// Ensure dist/nodes/RoundRobin directory exists
const nodeDistDir = path.join(__dirname, 'dist', 'nodes', 'RoundRobin');
if (!fs.existsSync(nodeDistDir)) {
  fs.mkdirSync(nodeDistDir, { recursive: true });
}

// Copy node definition JSON to dist
const jsonSrc = path.join(__dirname, 'nodes', 'RoundRobin', 'RoundRobin.node.json');
const jsonDest = path.join(nodeDistDir, 'RoundRobin.node.json');
fs.copyFileSync(jsonSrc, jsonDest);

// Create JS implementation if it doesn't already exist
const jsPath = path.join(nodeDistDir, 'RoundRobin.node.js');

// Always overwrite the file to ensure it has the latest fixes
const jsContent = `"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.RoundRobin = void 0;

class RoundRobin {
    constructor() {
        this.description = {
            displayName: 'Round Robin',
            name: 'roundRobin',
            group: ['transform'],
            version: 1,
            description: 'Store and retrieve messages in a round-robin fashion for LLM conversation loops',
            defaults: {
                name: 'Round Robin',
                color: '#ff9900',
            },
            inputs: ['main'],
            outputs: ['main'],
            subtitle: '={{$parameter["mode"]}} | ID: {{$parameter["roundRobinId"]}}',
            icon: 'fa:exchange-alt',
            properties: [
                {
                    displayName: 'Operation Mode',
                    name: 'mode',
                    type: 'options',
                    options: [
                        {
                            name: 'Store Message',
                            value: 'store',
                            description: 'Store a message in the round-robin at a specific position',
                            action: 'Store a message in the round robin',
                        },
                        {
                            name: 'Retrieve All Messages',
                            value: 'retrieve',
                            description: 'Retrieve all messages from the round-robin for processing',
                            action: 'Retrieve all messages from the round robin',
                        },
                        {
                            name: 'Clear All Messages',
                            value: 'clear',
                            description: 'Reset the round-robin storage and start fresh',
                            action: 'Clear all stored messages',
                        },
                    ],
                    default: 'store',
                    noDataExpression: true,
                    required: true,
                    description: 'Select what operation this node should perform',
                },
                {
                    displayName: 'Round Robin ID',
                    name: 'roundRobinId',
                    type: 'string',
                    default: 'default',
                    description: 'A unique identifier for this specific round-robin storage. Use the same ID when storing and retrieving related messages.',
                    placeholder: 'e.g., llm-conversation-1',
                    hint: 'This ID separates different round-robin storages if you have multiple in a workflow',
                    required: true,
                },
                {
                    displayName: 'Quick Help',
                    name: 'helpNotice',
                    type: 'notice',
                    default: '<b>Workflow Tip</b>: First set up Store nodes for each message source, then use a single Retrieve node at the end of your workflow to collect all messages.',
                    displayOptions: {
                        show: {
                            mode: ['store'],
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
                    description: 'How many different message sources or personas in this conversation loop',
                    hint: 'For LLM loops, this is the number of different personas/roles in the conversation',
                },
                {
                    displayName: 'Roles Definition',
                    name: 'roles',
                    placeholder: 'Add Role',
                    typeOptions: {
                        multipleValues: true,
                        multipleValueButtonText: 'Add Another Role',
                    },
                    type: 'fixedCollection',
                    default: {},
                    displayOptions: {
                        show: {
                            mode: ['store'],
                        },
                    },
                    description: 'Define names and descriptions for each position in the round-robin',
                    options: [
                        {
                            name: 'roleValues',
                            displayName: 'Roles',
                            values: [
                                {
                                    displayName: 'Role Name',
                                    name: 'name',
                                    type: 'string',
                                    default: '',
                                    placeholder: 'e.g., Critic, Creator, Analyst',
                                    description: 'Name of the role/persona',
                                },
                                {
                                    displayName: 'Role Description',
                                    name: 'description',
                                    type: 'string',
                                    default: '',
                                    placeholder: 'e.g., Provides critical feedback',
                                    description: 'Description of what this role/persona does',
                                },
                            ],
                        },
                    ],
                },
                {
                    displayName: 'Input Field Name',
                    name: 'inputField',
                    type: 'string',
                    default: 'message',
                    displayOptions: {
                        show: {
                            mode: ['store'],
                        },
                    },
                    description: 'The name of the field in the incoming data that contains the message to store',
                    placeholder: 'e.g., message, content, text',
                    hint: 'For LLM outputs, this is often "content", "text" or "message" depending on your setup',
                },
                {
                    displayName: 'Spot Index (Position)',
                    name: 'spotIndex',
                    type: 'number',
                    default: 0,
                    displayOptions: {
                        show: {
                            mode: ['store'],
                        },
                    },
                    description: 'Which position to store this message in (starting from 0)',
                    hint: 'First position is 0, second is 1, etc. Must be less than the "Number of Spots" value',
                },
                {
                    displayName: 'Output Format',
                    name: 'outputFormat',
                    type: 'options',
                    options: [
                        {
                            name: 'Array of Messages',
                            value: 'array',
                            description: 'Output a single array with all messages in chronological order',
                        },
                        {
                            name: 'Object Grouped by Role',
                            value: 'object',
                            description: 'Output an object with role names as keys and arrays of messages as values',
                        },
                    ],
                    default: 'array',
                    displayOptions: {
                        show: {
                            mode: ['retrieve'],
                        },
                    },
                    description: 'How the retrieved messages should be structured in the output',
                },
                {
                    displayName: 'Format Example',
                    name: 'formatExample',
                    type: 'notice',
                    displayOptions: {
                        show: {
                            mode: ['retrieve'],
                            outputFormat: ['array'],
                        },
                    },
                    default: '<b>Array Format Example:</b><br><code>{"messages": [{"role": "Critic", "message": "This needs improvement", "spotIndex": 0}, ...]}</code>',
                },
                {
                    displayName: 'Format Example',
                    name: 'formatObjectExample',
                    type: 'notice',
                    displayOptions: {
                        show: {
                            mode: ['retrieve'],
                            outputFormat: ['object'],
                        },
                    },
                    default: '<b>Object Format Example:</b><br><code>{"messagesByRole": {"Critic": ["This needs improvement", ...], "Creator": ["Here's a new idea", ...]}}</code>',
                },
                {
                    displayName: 'Clear Confirmation',
                    name: 'clearConfirmation',
                    type: 'notice',
                    displayOptions: {
                        show: {
                            mode: ['clear'],
                        },
                    },
                    default: '⚠️ This will permanently remove all stored messages for this Round Robin ID. Use this when you want to start a fresh conversation.',
                },
                {
                    displayName: 'How To Use This Node',
                    name: 'notice',
                    type: 'notice',
                    default: '<h4>Round Robin for Managing Multi-Turn Conversations</h4><p>This node stores and retrieves messages from different sources/personas in a structured way:</p><ul><li><b>LLM Conversations:</b> Track messages from multiple AI personas</li><li><b>User Interactions:</b> Store messages from different users/systems</li></ul><h4>Typical Setup:</h4><ol><li><b>Store mode:</b> Connect each message source (set a different "Spot Index" for each)</li><li><b>Retrieve mode:</b> Get all stored messages at the end of your workflow</li><li><b>Clear mode:</b> Reset the storage when starting a new conversation</li></ol><p>Use the same "Round Robin ID" for all related nodes in your workflow.</p>',
                },
            ],
        };
    }

    // The function to execute
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const mode = this.getNodeParameter('mode', 0);
        const roundRobinId = this.getNodeParameter('roundRobinId', 0);
        
        // Store data in the flow context with a unique key based on the roundRobinId
        const storageKey = \`roundRobin_\${roundRobinId}\`;

        // Initialize storage context from function context or create a new one
        let storageData;
        try {
            // Use flow context type which is supported by n8n
            storageData = this.getContext('flow').get(storageKey);
            if (!storageData) {
                storageData = {
                    messages: [],
                    roles: [],
                    spotCount: 0,
                };
            }
        } catch (error) {
            // Initialize if doesn't exist or there's an error
            storageData = {
                messages: [],
                roles: [],
                spotCount: 0,
            };
        }

        // Mode specific operations
        if (mode === 'store') {
            // Get parameters
            const spotCount = this.getNodeParameter('spotCount', 0);
            const spotIndex = this.getNodeParameter('spotIndex', 0);
            const inputField = this.getNodeParameter('inputField', 0);
            
            // Update spot count in storage
            storageData.spotCount = spotCount;
            
            // Get roles if defined
            const rolesCollection = this.getNodeParameter('roles', 0);
            if (rolesCollection.roleValues && rolesCollection.roleValues.length) {
                storageData.roles = rolesCollection.roleValues.map(role => role.name);
            } else if (storageData.roles.length === 0) {
                // Initialize with default roles if not set
                storageData.roles = Array(spotCount).fill('').map((_, i) => \`Role \${i + 1}\`);
            }
            
            // Validate spot index
            if (spotIndex < 0 || spotIndex >= spotCount) {
                throw new Error(\`Spot index must be between 0 and \${spotCount - 1}. You entered \${spotIndex} but the valid range for your configuration is 0-\${spotCount - 1}.\`);
            }
            
            // Store messages from all items
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const message = item.json[inputField];
                
                if (message === undefined) {
                    throw new Error(\`Input field '\${inputField}' not found in item #\${i + 1}. Available fields: \${Object.keys(item.json).join(', ')}\`);
                }
                
                // Store the message
                storageData.messages.push({
                    role: storageData.roles[spotIndex],
                    message,
                    spotIndex,
                    timestamp: new Date().toISOString(),
                });
                
                // Pass through the item
                returnData.push({
                    json: {
                        ...item.json,
                        roundRobinRole: storageData.roles[spotIndex],
                        roundRobinSpotIndex: spotIndex,
                        roundRobinStored: true,
                        roundRobinId
                    },
                });
            }
        } else if (mode === 'retrieve') {
            const outputFormat = this.getNodeParameter('outputFormat', 0);
            
            if (outputFormat === 'array') {
                // Return messages as an array
                returnData.push({
                    json: {
                        messages: storageData.messages,
                        roles: storageData.roles,
                        spotCount: storageData.spotCount,
                        roundRobinId,
                        messageCount: storageData.messages.length,
                    },
                });
            } else {
                // Return messages as an object grouped by roles
                const messagesByRole = {};
                
                // Initialize all roles with empty arrays
                for (const role of storageData.roles) {
                    messagesByRole[role] = [];
                }
                
                // Populate messages
                for (const { role, message } of storageData.messages) {
                    if (messagesByRole[role]) {
                        messagesByRole[role].push(message);
                    }
                }
                
                returnData.push({
                    json: {
                        messagesByRole,
                        roles: storageData.roles,
                        spotCount: storageData.spotCount,
                        roundRobinId,
                        messageCount: storageData.messages.length,
                    },
                });
            }
        } else if (mode === 'clear') {
            // Clear storage
            storageData = {
                messages: [],
                roles: [],
                spotCount: 0,
            };
            
            returnData.push({
                json: {
                    success: true,
                    message: 'Round-robin storage cleared successfully',
                    roundRobinId,
                },
            });
        }
        
        // Save storage context using flow context type
        this.getContext('flow').set(storageKey, storageData);
        
        return [returnData];
    }
}

exports.RoundRobin = RoundRobin;`;

fs.writeFileSync(jsPath, jsContent);

console.log('Prepared files for publishing!'); 