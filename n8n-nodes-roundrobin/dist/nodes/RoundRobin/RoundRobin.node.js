"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoundRobin = exports.RoundRobinStorage = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const ExternalStorage_1 = require("./ExternalStorage");
class RoundRobinStorage {
    static getPrefix(workflowId) {
        const safeWorkflowId = String(workflowId || 'default_workflow').replace(/[^a-zA-Z0-9]/g, '_');
        return `rr_wf_${safeWorkflowId}`;
    }
    static getMessagesKey(workflowId) {
        return `${this.getPrefix(workflowId)}_messages`;
    }
    static getRolesKey(workflowId) {
        return `${this.getPrefix(workflowId)}_roles`;
    }
    static getSpotCountKey(workflowId) {
        return `${this.getPrefix(workflowId)}_spotCount`;
    }
    static getLastUpdatedKey(workflowId) {
        return `${this.getPrefix(workflowId)}_lastUpdated`;
    }
    static getMessages(staticData, workflowId) {
        const key = this.getMessagesKey(workflowId);
        console.log(`[Storage] Getting messages with key: ${key}`);
        return staticData[key] || [];
    }
    static setMessages(staticData, workflowId, messages) {
        const key = this.getMessagesKey(workflowId);
        console.log(`[Storage] Setting messages with key: ${key}, Count: ${messages.length}`);
        staticData[key] = messages;
    }
    static getRoles(staticData, workflowId) {
        const key = this.getRolesKey(workflowId);
        console.log(`[Storage] Getting roles with key: ${key}`);
        return staticData[key] || [];
    }
    static setRoles(staticData, workflowId, roles) {
        const key = this.getRolesKey(workflowId);
        console.log(`[Storage] Setting roles with key: ${key}, Count: ${roles.length}`);
        staticData[key] = roles;
    }
    static getSpotCount(staticData, workflowId) {
        const key = this.getSpotCountKey(workflowId);
        console.log(`[Storage] Getting spot count with key: ${key}`);
        return staticData[key] || 0;
    }
    static setSpotCount(staticData, workflowId, count) {
        const key = this.getSpotCountKey(workflowId);
        console.log(`[Storage] Setting spot count with key: ${key}, Count: ${count}`);
        staticData[key] = count;
    }
    static getLastUpdated(staticData, workflowId) {
        const key = this.getLastUpdatedKey(workflowId);
        console.log(`[Storage] Getting last updated with key: ${key}`);
        return staticData[key] || Date.now();
    }
    static setLastUpdated(staticData, workflowId, timestamp) {
        const key = this.getLastUpdatedKey(workflowId);
        console.log(`[Storage] Setting last updated with key: ${key}, Timestamp: ${timestamp}`);
        staticData[key] = timestamp;
    }
    static initializeStorage(staticData, workflowId) {
        const existingMessages = this.getMessages(staticData, workflowId);
        if (existingMessages.length === 0) {
            console.log(`[Storage Init] No messages found for workflow ${workflowId}. Initializing.`);
            this.setMessages(staticData, workflowId, []);
        }
        else {
            console.log(`[Storage Init] Found ${existingMessages.length} existing messages for workflow ${workflowId}. No initialization needed.`);
        }
        const existingRoles = this.getRoles(staticData, workflowId);
        if (existingRoles.length === 0) {
            console.log(`[Storage Init] No roles found for workflow ${workflowId}. Initializing.`);
            this.setRoles(staticData, workflowId, []);
        }
        else {
            console.log(`[Storage Init] Found ${existingRoles.length} existing roles for workflow ${workflowId}. No initialization needed.`);
        }
        const existingSpotCount = this.getSpotCount(staticData, workflowId);
        if (existingSpotCount === 0 && !staticData[this.getSpotCountKey(workflowId)]) {
            console.log(`[Storage Init] No spot count found for workflow ${workflowId}. Initializing to 0.`);
            this.setSpotCount(staticData, workflowId, 0);
        }
        else {
            console.log(`[Storage Init] Found existing spot count (${existingSpotCount}) for workflow ${workflowId}. No initialization needed.`);
        }
        console.log(`[Storage Init] Setting/Updating last updated timestamp for workflow ${workflowId}.`);
        this.setLastUpdated(staticData, workflowId, Date.now());
    }
    static verifyStoragePersistence(staticData, workflowId) {
        const messages = this.getMessages(staticData, workflowId);
        console.log(`[Storage Verify] Message count after save: ${messages.length}. Storage key: ${this.getMessagesKey(workflowId)}`);
        console.log(`[Storage Verify] staticData keys: ${Object.keys(staticData).join(', ')}`);
        console.log(`[Storage Verify] Storage diagnostics:`, {
            messagesKey: this.getMessagesKey(workflowId),
            rolesKey: this.getRolesKey(workflowId),
            spotCountKey: this.getSpotCountKey(workflowId),
            lastUpdatedKey: this.getLastUpdatedKey(workflowId),
            hasMessagesInStorage: staticData[this.getMessagesKey(workflowId)] !== undefined,
            messagesCount: messages.length,
            rolesCount: this.getRoles(staticData, workflowId).length,
            staticDataSize: JSON.stringify(staticData).length,
        });
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
                            name: 'Store Messages',
                            value: 'store',
                            description: 'Store messages in the conversation',
                        },
                        {
                            name: 'Retrieve Messages',
                            value: 'retrieve',
                            description: 'Retrieve stored messages',
                        },
                        {
                            name: 'Clear All Messages',
                            value: 'clear',
                            description: 'Clear all stored messages',
                        },
                    ],
                    default: 'store',
                    description: 'The operation to perform',
                },
                {
                    displayName: 'Storage Notice',
                    name: 'storageNotice',
                    type: 'notice',
                    default: 'IMPORTANT: For data to persist between executions, this workflow MUST be activated and started by a trigger node (like Webhook, Cron, etc). Manual test executions from the editor do not save static data per n8n limitations.',
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
                {
                    displayName: 'Storage Persistence',
                    name: 'storagePersistence',
                    type: 'options',
                    options: [
                        {
                            name: 'Use Static Data (Requires Trigger)',
                            value: 'staticData',
                            description: 'Store data in n8n static data (requires workflow to be activated with a trigger node)',
                        },
                        {
                            name: 'Use Binary Data (Reliable)',
                            value: 'binary',
                            description: 'Store data in binary output (reliable but requires passing binary data between nodes)',
                        },
                    ],
                    default: 'staticData',
                    description: 'How to persist data between executions',
                },
                {
                    displayName: 'Binary Input Property',
                    name: 'binaryInputProperty',
                    type: 'string',
                    default: 'data',
                    displayOptions: {
                        show: {
                            storagePersistence: ['binary'],
                            mode: ['retrieve', 'clear'],
                        },
                    },
                    description: 'Name of the binary property that contains the storage data',
                },
                {
                    displayName: 'Storage ID',
                    name: 'storageId',
                    type: 'string',
                    default: '',
                    displayOptions: {
                        show: {
                            mode: ['store', 'retrieve', 'clear'],
                        },
                    },
                    description: 'Optional: Set a consistent ID to share storage across multiple node instances. If left empty, workflow ID will be used.',
                },
            ],
        };
    }
    static logPersistenceInfo() {
        console.log(`
=== RoundRobin Persistence Guide ===
IMPORTANT: n8n only persists static data when:
1. The workflow is ACTIVATED (not in testing mode)
2. Execution is triggered by a TRIGGER NODE (Webhook, Cron, etc.)

Manual executions from the editor WILL NOT persist data between runs.
For reliable data storage between executions:
- Activate your workflow
- Use a trigger node (like Webhook) to start the flow
- Or consider using a database node for more robust storage
============================
`);
    }
    async execute() {
        var _a;
        RoundRobin.logPersistenceInfo();
        const items = this.getInputData();
        const returnData = [];
        const mode = this.getNodeParameter('mode', 0);
        const storagePersistence = this.getNodeParameter('storagePersistence', 0, 'staticData');
        try {
            const nodeName = this.getNode().name;
            let workflowId = (_a = this.getWorkflow()) === null || _a === void 0 ? void 0 : _a.id;
            console.log(`[Execution] Raw Workflow ID: ${workflowId}`);
            if (!workflowId) {
                console.warn(`[Execution] Warning: Workflow ID is undefined. Falling back to node name ('${nodeName}') for storage key. Check n8n environment if persistence issues occur.`);
                workflowId = nodeName;
            }
            else {
                workflowId = String(workflowId);
            }
            const userStorageId = this.getNodeParameter('storageId', 0, '');
            if (userStorageId) {
                console.log(`[Execution] Using user-provided Storage ID: "${userStorageId}" instead of workflow ID`);
                workflowId = userStorageId;
            }
            console.log(`[Execution] Using effective ID for storage: ${workflowId}`);
            console.log(`[Execution] Storage persistence mode: ${storagePersistence}`);
            if (storagePersistence === 'binary') {
                await RoundRobin.handleBinaryStorageExecution(this, items, returnData, mode, workflowId);
                return [returnData];
            }
            const staticData = this.getWorkflowStaticData('global');
            RoundRobinStorage.initializeStorage(staticData, workflowId);
            console.log('RoundRobin node executing in mode:', mode);
            console.log(`Node instance: ${nodeName}`);
            const messages = RoundRobinStorage.getMessages(staticData, workflowId);
            const roles = RoundRobinStorage.getRoles(staticData, workflowId);
            const spotCount = RoundRobinStorage.getSpotCount(staticData, workflowId);
            const lastUpdated = RoundRobinStorage.getLastUpdated(staticData, workflowId);
            console.log('Current message count:', messages.length);
            console.log('Current roles count:', roles.length);
            if (mode === 'store') {
                const newSpotCount = this.getNodeParameter('spotCount', 0);
                const spotIndex = this.getNodeParameter('spotIndex', 0);
                const inputField = this.getNodeParameter('inputField', 0);
                RoundRobinStorage.setSpotCount(staticData, workflowId, newSpotCount);
                const rolesCollection = this.getNodeParameter('roles', 0);
                const updatedRoles = processRoles(rolesCollection);
                const currentRolesForInitCheck = RoundRobinStorage.getRoles(staticData, workflowId);
                if (updatedRoles.length > 0) {
                    RoundRobinStorage.setRoles(staticData, workflowId, updatedRoles);
                }
                else if (currentRolesForInitCheck.length === 0) {
                    const defaultRoles = getDefaultRoles();
                    RoundRobinStorage.setRoles(staticData, workflowId, defaultRoles);
                }
                const currentRoles = RoundRobinStorage.getRoles(staticData, workflowId);
                if (spotIndex < 0 || spotIndex >= newSpotCount) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Spot index must be between 0 and ${newSpotCount - 1}`);
                }
                const currentMessages = RoundRobinStorage.getMessages(staticData, workflowId);
                const updatedMessages = [...currentMessages];
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
                RoundRobinStorage.setMessages(staticData, workflowId, updatedMessages);
                RoundRobinStorage.setLastUpdated(staticData, workflowId, Date.now());
                RoundRobinStorage.verifyStoragePersistence(staticData, workflowId);
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
                RoundRobinStorage.setMessages(staticData, workflowId, []);
                RoundRobinStorage.setLastUpdated(staticData, workflowId, Date.now());
                console.log('Storage cleared successfully');
                returnData.push({
                    json: {
                        status: 'success',
                        message: 'Storage cleared successfully',
                        timestamp: new Date().toISOString(),
                    },
                });
            }
            console.log('Final storage state - message count:', RoundRobinStorage.getMessages(staticData, workflowId).length);
            if (storagePersistence === 'staticData') {
                RoundRobinStorage.verifyStoragePersistence(staticData, workflowId);
            }
            return [returnData];
        }
        catch (error) {
            if (error instanceof n8n_workflow_1.NodeOperationError) {
                throw error;
            }
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }
    static async handleBinaryStorageExecution(executeFunctions, items, returnData, mode, storageId) {
        var _a, _b;
        const storageManager = (0, ExternalStorage_1.createStorageManager)(executeFunctions, 'binary', storageId);
        if (mode === 'store') {
            const newSpotCount = executeFunctions.getNodeParameter('spotCount', 0);
            const spotIndex = executeFunctions.getNodeParameter('spotIndex', 0);
            const inputField = executeFunctions.getNodeParameter('inputField', 0);
            const rolesCollection = executeFunctions.getNodeParameter('roles', 0);
            const updatedRoles = processRoles(rolesCollection);
            const finalRoles = updatedRoles.length > 0 ? updatedRoles : getDefaultRoles();
            let existingMessages = [];
            let existingRoles = finalRoles;
            if ((_a = items[0]) === null || _a === void 0 ? void 0 : _a.binary) {
                try {
                    const binaryInputProperty = executeFunctions.getNodeParameter('binaryInputProperty', 0, 'data');
                    const loadedData = await storageManager.loadFromBinary(items[0].binary);
                    existingMessages = loadedData.messages || [];
                    if (updatedRoles.length === 0 && loadedData.roles && loadedData.roles.length > 0) {
                        existingRoles = loadedData.roles;
                    }
                }
                catch (error) {
                    console.log(`[Binary Storage] Could not load existing data: ${error.message}`);
                }
            }
            if (spotIndex < 0 || spotIndex >= newSpotCount) {
                throw new n8n_workflow_1.NodeOperationError(executeFunctions.getNode(), `Spot index must be between 0 and ${newSpotCount - 1}`);
            }
            const updatedMessages = [...existingMessages];
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const messageContent = extractMessageContent(item, inputField, i, executeFunctions);
                const roleName = spotIndex < existingRoles.length
                    ? existingRoles[spotIndex].name
                    : `Role ${spotIndex + 1}`;
                const newMessage = {
                    role: roleName,
                    content: messageContent,
                    spotIndex,
                    timestamp: Date.now(),
                };
                updatedMessages.push(newMessage);
                console.log(`[Binary Storage] Stored message for role "${roleName}":`, newMessage);
            }
            const result = await storageManager.storeToBinary(updatedMessages, existingRoles, newSpotCount);
            returnData.push(result);
        }
        else if (mode === 'retrieve') {
            if (!((_b = items[0]) === null || _b === void 0 ? void 0 : _b.binary)) {
                throw new n8n_workflow_1.NodeOperationError(executeFunctions.getNode(), 'No binary input data found. Please connect a node that provides binary data.');
            }
            const binaryInputProperty = executeFunctions.getNodeParameter('binaryInputProperty', 0, 'data');
            const loadedData = await storageManager.loadFromBinary(items[0].binary);
            const outputFormat = executeFunctions.getNodeParameter('outputFormat', 0);
            const simplifyOutput = executeFunctions.getNodeParameter('simplifyOutput', 0, true);
            const maxMessages = executeFunctions.getNodeParameter('maxMessages', 0, 0);
            let filteredMessages = loadedData.messages;
            if (maxMessages > 0 && filteredMessages.length > maxMessages) {
                filteredMessages = filteredMessages.slice(-maxMessages);
            }
            if (outputFormat === 'array') {
                processArrayOutput(returnData, filteredMessages, loadedData.roles, loadedData.lastUpdated, simplifyOutput);
            }
            else if (outputFormat === 'object') {
                processObjectOutput(returnData, filteredMessages, loadedData.roles, loadedData.lastUpdated, simplifyOutput);
            }
            else if (outputFormat === 'conversationHistory') {
                const includeSystemPrompt = executeFunctions.getNodeParameter('includeSystemPrompt', 0, false);
                const systemPromptPosition = includeSystemPrompt
                    ? executeFunctions.getNodeParameter('systemPromptPosition', 0, 'start')
                    : 'none';
                const systemPrompt = includeSystemPrompt
                    ? executeFunctions.getNodeParameter('systemPrompt', 0, '')
                    : '';
                const llmPlatform = executeFunctions.getNodeParameter('llmPlatform', 0, 'generic');
                if (llmPlatform === 'openai') {
                    formatOpenAIConversation(returnData, filteredMessages, systemPrompt, includeSystemPrompt, systemPromptPosition, loadedData.lastUpdated, simplifyOutput, loadedData.roles);
                }
                else if (llmPlatform === 'anthropic') {
                    formatAnthropicConversation(returnData, filteredMessages, systemPrompt, includeSystemPrompt, loadedData.lastUpdated, simplifyOutput);
                }
                else if (llmPlatform === 'google') {
                    formatGoogleConversation(returnData, filteredMessages, systemPrompt, includeSystemPrompt, systemPromptPosition, loadedData.lastUpdated, simplifyOutput, loadedData.roles);
                }
                else {
                    formatGenericConversation(returnData, filteredMessages, systemPrompt, includeSystemPrompt, systemPromptPosition, loadedData.lastUpdated, simplifyOutput, loadedData.roles);
                }
            }
            if (returnData.length === 0) {
                returnData.push({
                    json: {
                        messages: [],
                        messageCount: 0,
                        lastUpdated: new Date().toISOString(),
                        info: 'No messages found in storage'
                    },
                });
            }
        }
        else if (mode === 'clear') {
            const result = await storageManager.storeToBinary([], getDefaultRoles(), 3);
            returnData.push({
                json: {
                    success: true,
                    operation: 'clear',
                    storageId,
                    info: 'All messages cleared',
                },
                binary: (result.binary || {}),
            });
        }
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