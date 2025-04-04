import {
  NodeOperationError,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';

interface IRoundRobinMessage {
  role: string;
  content: string;
  spotIndex: number;
  timestamp: number;
}

// Enhanced persona interface with additional metadata
interface IRoundRobinRole {
  name: string;
  description: string;
  // Enhanced persona properties
  color?: string;
  icon?: string;
  tone?: string;
  expertise?: string[];
  systemPrompt?: string;
  isEnabled?: boolean;
}

// Static data functions to ensure consistent property naming
export class RoundRobinStorage {
  // Generate a consistent prefix for this node instance
  static getPrefix(nodeName: string): string {
    return `rr_${nodeName.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }
  
  // Storage keys
  static getMessagesKey(nodeName: string): string {
    return `${this.getPrefix(nodeName)}_messages`;
  }
  
  static getRolesKey(nodeName: string): string {
    return `${this.getPrefix(nodeName)}_roles`;
  }
  
  static getSpotCountKey(nodeName: string): string {
    return `${this.getPrefix(nodeName)}_spotCount`;
  }
  
  static getLastUpdatedKey(nodeName: string): string {
    return `${this.getPrefix(nodeName)}_lastUpdated`;
  }
  
  // Helper functions for accessing storage data
  static getMessages(staticData: IDataObject, nodeName: string): IRoundRobinMessage[] {
    const key = this.getMessagesKey(nodeName);
    return (staticData[key] as IRoundRobinMessage[]) || [];
  }
  
  static setMessages(staticData: IDataObject, nodeName: string, messages: IRoundRobinMessage[]): void {
    const key = this.getMessagesKey(nodeName);
    staticData[key] = messages;
  }
  
  static getRoles(staticData: IDataObject, nodeName: string): IRoundRobinRole[] {
    const key = this.getRolesKey(nodeName);
    return (staticData[key] as IRoundRobinRole[]) || [];
  }
  
  static setRoles(staticData: IDataObject, nodeName: string, roles: IRoundRobinRole[]): void {
    const key = this.getRolesKey(nodeName);
    staticData[key] = roles;
  }
  
  static getSpotCount(staticData: IDataObject, nodeName: string): number {
    const key = this.getSpotCountKey(nodeName);
    return (staticData[key] as number) || 0;
  }
  
  static setSpotCount(staticData: IDataObject, nodeName: string, count: number): void {
    const key = this.getSpotCountKey(nodeName);
    staticData[key] = count;
  }
  
  static getLastUpdated(staticData: IDataObject, nodeName: string): number {
    const key = this.getLastUpdatedKey(nodeName);
    return (staticData[key] as number) || Date.now();
  }
  
  static setLastUpdated(staticData: IDataObject, nodeName: string, timestamp: number): void {
    const key = this.getLastUpdatedKey(nodeName);
    staticData[key] = timestamp;
  }
  
  // Initialize storage for a node
  static initializeStorage(staticData: IDataObject, nodeName: string): void {
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

// Define interfaces for our output data
interface IMessageOutputSimple {
  role: string;
  content: string;
}

interface IArrayOutput {
  messages: IMessageOutputSimple[] | IRoundRobinMessage[];
  messageCount: number;
  lastUpdated: string;
  roles?: IRoundRobinRole[];
}

interface IObjectOutput {
  messagesByRole: { [key: string]: any[] };
  messageCount: number;
  lastUpdated: string;
  roles?: IRoundRobinRole[];
}

interface IConversationHistoryOutput {
  conversationHistory: IMessageOutputSimple[];
  messageCount: number;
  lastUpdated?: string;
}

export class RoundRobin implements INodeType {
  description: INodeTypeDescription = {
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
    inputs: ['main'] as any,
    outputs: ['main'] as any,
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
      // Notice to explain storage limitations
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
      // Store mode parameters
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
      // Example to help users understand the node
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
      // Retrieve mode parameters
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
      // LLM Platform Selection
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
      // System Prompt Options
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

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const mode = this.getNodeParameter('mode', 0) as string;
    
    try {
      // Get node name for storage isolation
      const nodeName = this.getNode().name;
      
      // Get workflow static data with correct context
      const staticData = this.getWorkflowStaticData('node');
      
      // Initialize storage for this node instance
      RoundRobinStorage.initializeStorage(staticData, nodeName);
      
      // Log initial state for debugging
      console.log('RoundRobin node executing in mode:', mode);
      console.log(`Node instance: ${nodeName}`);
      
      // Get current data values
      const messages = RoundRobinStorage.getMessages(staticData, nodeName);
      const roles = RoundRobinStorage.getRoles(staticData, nodeName);
      const spotCount = RoundRobinStorage.getSpotCount(staticData, nodeName);
      const lastUpdated = RoundRobinStorage.getLastUpdated(staticData, nodeName);
      
      console.log('Current message count:', messages.length);
      console.log('Current roles count:', roles.length);
      
      // Mode specific operations
      if (mode === 'store') {
        const newSpotCount = this.getNodeParameter('spotCount', 0) as number;
        const spotIndex = this.getNodeParameter('spotIndex', 0) as number;
        const inputField = this.getNodeParameter('inputField', 0) as string;
        
        // Update spot count in storage
        RoundRobinStorage.setSpotCount(staticData, nodeName, newSpotCount);
        
        // Get roles if defined
        const rolesCollection = this.getNodeParameter('roles', 0) as {
          values?: Array<{ name: string; description: string; color?: string; tone?: string; expertise?: string; systemPrompt?: string; isEnabled?: boolean }>;
        };
        
        // Process and update roles
        const updatedRoles: IRoundRobinRole[] = processRoles(rolesCollection);
        if (updatedRoles.length > 0) {
          RoundRobinStorage.setRoles(staticData, nodeName, updatedRoles);
        } else if (roles.length === 0) {
          // Initialize with default roles if not set
          const defaultRoles = getDefaultRoles();
          RoundRobinStorage.setRoles(staticData, nodeName, defaultRoles);
        }
        
        // Get current roles after possible update
        const currentRoles = RoundRobinStorage.getRoles(staticData, nodeName);
        
        // Validate spot index
        if (spotIndex < 0 || spotIndex >= newSpotCount) {
          throw new NodeOperationError(this.getNode(), `Spot index must be between 0 and ${newSpotCount - 1}`);
        }
        
        // Process all input items
        const updatedMessages = [...messages];
        
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          
          // Extract message content from the item
          const messageContent = extractMessageContent(item, inputField, i, this);
          
          // Get role name based on spot index
          const roleName = spotIndex < currentRoles.length 
            ? currentRoles[spotIndex].name 
            : `Role ${spotIndex + 1}`;
          
          // Create the message object
          const newMessage: IRoundRobinMessage = {
            role: roleName,
            content: messageContent,
            spotIndex,
            timestamp: Date.now(),
          };
          
          // Add to messages
          updatedMessages.push(newMessage);
          
          console.log(`Stored message for role "${roleName}":`, newMessage);
          console.log(`Total messages stored: ${updatedMessages.length}`);
          
          // Pass through the item with additional metadata
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
        
        // Update messages in storage
        RoundRobinStorage.setMessages(staticData, nodeName, updatedMessages);
        RoundRobinStorage.setLastUpdated(staticData, nodeName, Date.now());
        
      } else if (mode === 'retrieve') {
        const outputFormat = this.getNodeParameter('outputFormat', 0) as string;
        const maxMessages = this.getNodeParameter('maxMessages', 0, 0) as number;
        const simplifyOutput = this.getNodeParameter('simplifyOutput', 0, true) as boolean;
        
        // Debug messages
        console.log('Retrieving messages from storage');
        console.log('Total messages stored:', messages.length);
        
        if (messages.length === 0) {
          // No messages stored yet
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
        
        // Create a copy of messages for processing
        let messagesToProcess = [...messages];
        
        // Apply maximum message limit if specified
        if (maxMessages > 0 && messagesToProcess.length > maxMessages) {
          messagesToProcess = messagesToProcess.slice(-maxMessages);
        }
        
        // Process based on output format
        if (outputFormat === 'array') {
          processArrayOutput(returnData, messagesToProcess, roles, lastUpdated, simplifyOutput);
        } else if (outputFormat === 'object') {
          processObjectOutput(returnData, messagesToProcess, roles, lastUpdated, simplifyOutput);
        } else if (outputFormat === 'conversationHistory') {
          processConversationHistoryOutput(
            this,
            returnData,
            messagesToProcess,
            roles,
            lastUpdated,
            simplifyOutput
          );
        }
      } else if (mode === 'clear') {
        // Reset messages but keep roles
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
      
      // Final debug log to confirm data persistence
      console.log('Final storage state - message count:', RoundRobinStorage.getMessages(staticData, nodeName).length);
      
    } catch (error) {
      if (error instanceof NodeOperationError) {
        throw error;
      }
      
      // Handle other errors and provide useful information
      throw new NodeOperationError(
        this.getNode(), 
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
    
    return [returnData];
  }
}

// Helper functions

function processRoles(rolesCollection: { values?: any[] }): IRoundRobinRole[] {
  if (!rolesCollection.values || !rolesCollection.values.length) {
    return [];
  }
  
  return rolesCollection.values.map(role => ({
    name: role.name,
    description: role.description || '',
    color: role.color || '#ff9900',
    tone: role.tone || 'neutral',
    expertise: typeof role.expertise === 'string' 
      ? role.expertise.split(',').map((item: string) => item.trim()) 
      : (Array.isArray(role.expertise) ? role.expertise : []),
    systemPrompt: role.systemPrompt || '',
    isEnabled: role.isEnabled !== undefined ? role.isEnabled : true,
  }));
}

function getDefaultRoles(): IRoundRobinRole[] {
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

function extractMessageContent(
  item: INodeExecutionData, 
  inputField: string, 
  itemIndex: number,
  executeFunctions: IExecuteFunctions
): string {
  try {
    // First, check if the field exists directly
    if (item.json[inputField] !== undefined) {
      return String(item.json[inputField]);
    } 
    // Then check if it's a JSON path expression
    else if (inputField.includes('$json')) {
      // Try to extract field name from expression like {{ $json.output }}
      const fieldMatch = inputField.match(/\{\{\s*\$json\.([a-zA-Z0-9_]+)\s*\}\}/);
      if (fieldMatch && fieldMatch[1] && item.json[fieldMatch[1]] !== undefined) {
        return String(item.json[fieldMatch[1]]);
      } else {
        // If we can't find the field by path, try the first available property
        const keys = Object.keys(item.json);
        if (keys.length > 0) {
          return String(item.json[keys[0]]);
        } else {
          throw new Error(`No data available in item #${itemIndex + 1}`);
        }
      }
    } 
    // Finally, try the first field as a fallback
    else {
      const keys = Object.keys(item.json);
      if (keys.length > 0) {
        return String(item.json[keys[0]]);
      } else {
        throw new Error(`Item #${itemIndex + 1} does not contain any data`);
      }
    }
  } catch (error) {
    throw new NodeOperationError(
      executeFunctions.getNode(),
      `Failed to extract input data: ${error.message}`
    );
  }
}

function processArrayOutput(
  returnData: INodeExecutionData[],
  messages: IRoundRobinMessage[],
  roles: IRoundRobinRole[],
  lastUpdated: number,
  simplifyOutput: boolean
): void {
  const outputJson: IDataObject = {
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

function processObjectOutput(
  returnData: INodeExecutionData[],
  messages: IRoundRobinMessage[],
  roles: IRoundRobinRole[],
  lastUpdated: number,
  simplifyOutput: boolean
): void {
  const messagesByRole: { [key: string]: any[] } = {};
  
  for (const message of messages) {
    const roleName = message.role || `Role ${message.spotIndex + 1}`;
    if (!messagesByRole[roleName]) {
      messagesByRole[roleName] = [];
    }
    
    if (simplifyOutput) {
      messagesByRole[roleName].push(message.content);
    } else {
      messagesByRole[roleName].push(message);
    }
  }
  
  const outputJson: IDataObject = {
    messagesByRole,
    messageCount: messages.length,
    lastUpdated: new Date(lastUpdated).toISOString(),
  };
  
  if (!simplifyOutput) {
    outputJson.roles = roles;
  }
  
  returnData.push({ json: outputJson });
}

function processConversationHistoryOutput(
  executeFunctions: IExecuteFunctions,
  returnData: INodeExecutionData[],
  messages: IRoundRobinMessage[],
  roles: IRoundRobinRole[],
  lastUpdated: number,
  simplifyOutput: boolean
): void {
  try { // Add try/catch to better handle errors
    // Get parameters with explicit type casting and default values
    const llmPlatform = String(executeFunctions.getNodeParameter('llmPlatform', 0, 'openai'));
    const includeSystemPrompt = Boolean(executeFunctions.getNodeParameter('includeSystemPrompt', 0, true));
    const systemPromptPosition = String(executeFunctions.getNodeParameter('systemPromptPosition', 0, 'start'));
    
    // Find system role data
    const systemRole = roles.find(role => role.name.toLowerCase() === 'system');
    const systemPrompt = systemRole?.systemPrompt || 'You are a helpful, friendly AI assistant.';
    
    // Filter out disabled roles if needed
    const enabledMessages = messages.filter(msg => {
      const role = roles.find(r => r.name === msg.role);
      return role?.isEnabled !== false; // If not explicitly disabled, include it
    });
    
    // Format based on LLM platform
    if (llmPlatform === 'openai') {
      formatOpenAIConversation(
        returnData,
        enabledMessages,
        systemPrompt,
        includeSystemPrompt,
        systemPromptPosition,
        lastUpdated,
        simplifyOutput,
        roles
      );
    } else if (llmPlatform === 'anthropic') {
      formatAnthropicConversation(
        returnData,
        enabledMessages,
        systemPrompt,
        includeSystemPrompt,
        lastUpdated,
        simplifyOutput
      );
    } else if (llmPlatform === 'google') {
      formatGoogleConversation(
        returnData,
        enabledMessages,
        systemPrompt,
        includeSystemPrompt,
        systemPromptPosition,
        lastUpdated,
        simplifyOutput,
        roles
      );
    } else {
      formatGenericConversation(
        returnData,
        enabledMessages,
        systemPrompt,
        includeSystemPrompt,
        systemPromptPosition,
        lastUpdated,
        simplifyOutput,
        roles
      );
    }
  } catch (error) {
    // Provide better error message with context
    if (error instanceof Error) {
      throw new NodeOperationError(
        executeFunctions.getNode(),
        `Error in conversation history processing: ${error.message}`
      );
    }
    throw error;
  }
}

function formatOpenAIConversation(
  returnData: INodeExecutionData[],
  messages: IRoundRobinMessage[],
  systemPrompt: string,
  includeSystemPrompt: boolean,
  systemPromptPosition: string,
  lastUpdated: number,
  simplifyOutput: boolean,
  roles: IRoundRobinRole[]
): void {
  let conversationHistory: any[] = [];
  
  if (includeSystemPrompt && systemPromptPosition === 'start') {
    conversationHistory.push({
      role: 'system',
      content: systemPrompt,
    });
  }
  
  conversationHistory = [
    ...conversationHistory,
    ...messages.map(message => {
      // Map role names to OpenAI expected format
      let role = message.role.toLowerCase();
      if (role === 'user' || role === 'human') role = 'user';
      if (role === 'assistant' || role === 'ai') role = 'assistant';
      if (role === 'system' || role === 'instructions') role = 'system';
      
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
  
  const outputJson: IDataObject = {
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

function formatAnthropicConversation(
  returnData: INodeExecutionData[],
  messages: IRoundRobinMessage[],
  systemPrompt: string,
  includeSystemPrompt: boolean,
  lastUpdated: number,
  simplifyOutput: boolean
): void {
  // Anthropic Claude format: textual format with \n\nHuman: and \n\nAssistant:
  let claudeFormat = '';
  
  if (includeSystemPrompt) {
    claudeFormat += `\n\nSystem: ${systemPrompt}\n\n`;
  }
  
  for (const message of messages) {
    let role = message.role.toLowerCase();
    if (role === 'user' || role === 'human') role = 'Human';
    else if (role === 'assistant' || role === 'ai') role = 'Assistant';
    else if (role === 'system') continue; // Skip system messages in the main loop for Claude
    
    claudeFormat += `\n\n${role}: ${message.content}`;
  }
  
  // For Claude, return a different structure
  const outputJson: IDataObject = {
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

function formatGoogleConversation(
  returnData: INodeExecutionData[],
  messages: IRoundRobinMessage[],
  systemPrompt: string,
  includeSystemPrompt: boolean,
  systemPromptPosition: string,
  lastUpdated: number,
  simplifyOutput: boolean,
  roles: IRoundRobinRole[]
): void {
  let conversationHistory: any[] = [];
  
  if (includeSystemPrompt && systemPromptPosition === 'start') {
    conversationHistory.push({
      role: 'system',
      content: systemPrompt,
    });
  }
  
  conversationHistory = [
    ...conversationHistory,
    ...messages.map(message => {
      // Map role names to Google expected format
      let role = message.role.toLowerCase();
      if (role === 'user' || role === 'human') role = 'user';
      if (role === 'assistant' || role === 'ai' || role === 'bot') role = 'model';
      if (role === 'system' || role === 'instructions') role = 'system';
      
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
  
  const outputJson: IDataObject = {
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

function formatGenericConversation(
  returnData: INodeExecutionData[],
  messages: IRoundRobinMessage[],
  systemPrompt: string,
  includeSystemPrompt: boolean,
  systemPromptPosition: string,
  lastUpdated: number,
  simplifyOutput: boolean,
  roles: IRoundRobinRole[]
): void {
  let conversationHistory: any[] = [];
  
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
  
  const outputJson: IDataObject = {
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