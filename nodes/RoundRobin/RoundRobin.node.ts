import { 
  NodeOperationError,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
  IBinaryKeyData
} from 'n8n-workflow';
import { createStorageManager, ExternalStorageManager } from './ExternalStorage';

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
  // Generate a consistent prefix using workflow ID for true global scope within the workflow
  static getPrefix(workflowId: string): string {
    // Ensure workflowId is a valid string, fallback if necessary (though should always exist)
    const safeWorkflowId = String(workflowId || 'default_workflow').replace(/[^a-zA-Z0-9]/g, '_');
    return `rr_wf_${safeWorkflowId}`;
  }
  
  // Storage keys using Workflow ID
  static getMessagesKey(workflowId: string): string {
    return `${this.getPrefix(workflowId)}_messages`;
  }
  
  static getRolesKey(workflowId: string): string {
    return `${this.getPrefix(workflowId)}_roles`;
  }
  
  static getSpotCountKey(workflowId: string): string {
    return `${this.getPrefix(workflowId)}_spotCount`;
  }
  
  static getLastUpdatedKey(workflowId: string): string {
    return `${this.getPrefix(workflowId)}_lastUpdated`;
  }
  
  static getRoundCountKey(workflowId: string): string {
    return `${this.getPrefix(workflowId)}_roundCount`;
  }
  
  static getMaxRoundsKey(workflowId: string): string {
    return `${this.getPrefix(workflowId)}_maxRounds`;
  }
  
  // Helper functions for accessing storage data using Workflow ID
  static getMessages(staticData: IDataObject, workflowId: string): IRoundRobinMessage[] {
    const key = this.getMessagesKey(workflowId);
    // Log what key is being used for retrieval
    console.log(`[Storage] Getting messages with key: ${key}`);
    return (staticData[key] as IRoundRobinMessage[]) || [];
  }
  
  static setMessages(staticData: IDataObject, workflowId: string, messages: IRoundRobinMessage[]): void {
    const key = this.getMessagesKey(workflowId);
    // Log what key is being used for setting
    console.log(`[Storage] Setting messages with key: ${key}, Count: ${messages.length}`);
    staticData[key] = messages;
  }
  
  static getRoles(staticData: IDataObject, workflowId: string): IRoundRobinRole[] {
    const key = this.getRolesKey(workflowId);
    console.log(`[Storage] Getting roles with key: ${key}`);
    return (staticData[key] as IRoundRobinRole[]) || [];
  }
  
  static setRoles(staticData: IDataObject, workflowId: string, roles: IRoundRobinRole[]): void {
    const key = this.getRolesKey(workflowId);
    console.log(`[Storage] Setting roles with key: ${key}, Count: ${roles.length}`);
    staticData[key] = roles;
  }
  
  static getSpotCount(staticData: IDataObject, workflowId: string): number {
    const key = this.getSpotCountKey(workflowId);
    console.log(`[Storage] Getting spot count with key: ${key}`);
    return (staticData[key] as number) || 0;
  }
  
  static setSpotCount(staticData: IDataObject, workflowId: string, count: number): void {
    const key = this.getSpotCountKey(workflowId);
    console.log(`[Storage] Setting spot count with key: ${key}, Count: ${count}`);
    staticData[key] = count;
  }
  
  static getLastUpdated(staticData: IDataObject, workflowId: string): number {
    const key = this.getLastUpdatedKey(workflowId);
    console.log(`[Storage] Getting last updated with key: ${key}`);
    return (staticData[key] as number) || Date.now();
  }
  
  static setLastUpdated(staticData: IDataObject, workflowId: string, timestamp: number): void {
    const key = this.getLastUpdatedKey(workflowId);
    console.log(`[Storage] Setting last updated with key: ${key}, Timestamp: ${timestamp}`);
    staticData[key] = timestamp;
  }
  
  static getRoundCount(staticData: IDataObject, workflowId: string): number {
    const key = this.getRoundCountKey(workflowId);
    console.log(`[Storage] Getting round count with key: ${key}`);
    return (staticData[key] as number) || 0;
  }
  
  static setRoundCount(staticData: IDataObject, workflowId: string, count: number): void {
    const key = this.getRoundCountKey(workflowId);
    console.log(`[Storage] Setting round count with key: ${key}, Count: ${count}`);
    staticData[key] = count;
  }
  
  static getMaxRounds(staticData: IDataObject, workflowId: string): number {
    const key = this.getMaxRoundsKey(workflowId);
    console.log(`[Storage] Getting max rounds with key: ${key}`);
    return (staticData[key] as number) || 0;
  }
  
  static setMaxRounds(staticData: IDataObject, workflowId: string, maxRounds: number): void {
    const key = this.getMaxRoundsKey(workflowId);
    console.log(`[Storage] Setting max rounds with key: ${key}, Max: ${maxRounds}`);
    staticData[key] = maxRounds;
  }
  
  // Initialize storage for a workflow
  static initializeStorage(staticData: IDataObject, workflowId: string): void {
    const existingMessages = this.getMessages(staticData, workflowId);
    if (existingMessages.length === 0) {
      console.log(`[Storage Init] No messages found for workflow ${workflowId}. Initializing.`);
      this.setMessages(staticData, workflowId, []);
    } else {
      console.log(`[Storage Init] Found ${existingMessages.length} existing messages for workflow ${workflowId}. No initialization needed.`);
    }
    
    const existingRoles = this.getRoles(staticData, workflowId);
    if (existingRoles.length === 0) {
       console.log(`[Storage Init] No roles found for workflow ${workflowId}. Initializing.`);
      this.setRoles(staticData, workflowId, []); // Initialize empty, let store mode add defaults later if needed
    } else {
       console.log(`[Storage Init] Found ${existingRoles.length} existing roles for workflow ${workflowId}. No initialization needed.`);
    }
    
    const existingSpotCount = this.getSpotCount(staticData, workflowId); // This getter already defaults to 0
    if (existingSpotCount === 0 && !staticData[this.getSpotCountKey(workflowId)]) { // Check if it was explicitly 0 or just defaulted
       console.log(`[Storage Init] No spot count found for workflow ${workflowId}. Initializing to 0.`);
      this.setSpotCount(staticData, workflowId, 0);
    } else {
       console.log(`[Storage Init] Found existing spot count (${existingSpotCount}) for workflow ${workflowId}. No initialization needed.`);
    }
    
    // Initialize round count if not set
    if (!staticData[this.getRoundCountKey(workflowId)]) {
      console.log(`[Storage Init] No round count found for workflow ${workflowId}. Initializing to 0.`);
      this.setRoundCount(staticData, workflowId, 0);
    }
    
    // Always update last updated timestamp during initialization check
    console.log(`[Storage Init] Setting/Updating last updated timestamp for workflow ${workflowId}.`);
    this.setLastUpdated(staticData, workflowId, Date.now());
  }

  static verifyStoragePersistence(staticData: IDataObject, workflowId: string): void {
    // Verify messages were saved
    const messages = this.getMessages(staticData, workflowId);
    console.log(`[Storage Verify] Message count after save: ${messages.length}. Storage key: ${this.getMessagesKey(workflowId)}`);
    
    // Verify all key/value pairs
    console.log(`[Storage Verify] staticData keys: ${Object.keys(staticData).join(', ')}`);
    
    // Log full diagnostic info about storage
    console.log(`[Storage Verify] Storage diagnostics:`, {
      messagesKey: this.getMessagesKey(workflowId),
      rolesKey: this.getRolesKey(workflowId),
      spotCountKey: this.getSpotCountKey(workflowId),
      lastUpdatedKey: this.getLastUpdatedKey(workflowId),
      roundCountKey: this.getRoundCountKey(workflowId),
      maxRoundsKey: this.getMaxRoundsKey(workflowId),
      hasMessagesInStorage: staticData[this.getMessagesKey(workflowId)] !== undefined,
      messagesCount: messages.length,
      rolesCount: this.getRoles(staticData, workflowId).length,
      roundCount: this.getRoundCount(staticData, workflowId),
      maxRounds: this.getMaxRounds(staticData, workflowId),
      staticDataSize: JSON.stringify(staticData).length,
    });
  }
  
  // Calculate the current round count based on messages
  static calculateRoundCount(messages: IRoundRobinMessage[], spotCount: number): number {
    if (!messages.length || !spotCount) return 0;
    
    // Group messages by spotIndex to see how many complete rounds we have
    const messagesBySpot: { [key: number]: number } = {};
    messages.forEach(msg => {
      if (messagesBySpot[msg.spotIndex] === undefined) {
        messagesBySpot[msg.spotIndex] = 0;
      }
      messagesBySpot[msg.spotIndex]++;
    });
    
    // Find the minimum count of messages in any spot
    // This represents how many complete rounds we have
    const spotsWithMessages = Object.keys(messagesBySpot).length;
    
    // If we don't have messages for all spots, we don't have a complete round yet
    if (spotsWithMessages < spotCount) return 0;
    
    // Find the minimum count of messages across all spots
    const minCount = Math.min(...Object.values(messagesBySpot));
    return minCount;
  }
  
  // Check if the round limit has been reached
  static hasReachedRoundLimit(messages: IRoundRobinMessage[], spotCount: number, maxRounds: number): boolean {
    if (maxRounds <= 0) return false; // No limit set
    
    const currentRounds = this.calculateRoundCount(messages, spotCount);
    return currentRounds >= maxRounds;
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
    description: 'Manage conversational loops between multiple participants for LLM workflows',
    defaults: {
      name: 'Round Robin',
      color: '#ff9900',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      // MODE SELECTION
      {
        displayName: 'Operation Mode',
        name: 'mode',
        type: 'options',
        options: [
          {
            name: 'Store Message',
            value: 'store',
            description: 'Add a new message to the conversation',
          },
          {
            name: 'Retrieve Conversation',
            value: 'retrieve',
            description: 'Get the stored conversation history',
          },
          {
            name: 'Clear Conversation',
            value: 'clear',
            description: 'Reset the conversation history',
          },
        ],
        default: 'store',
        description: 'Select the operation you want to perform',
      },
      
      // PERSISTENCE SECTION
      {
        displayName: 'Storage Method',
        name: 'storagePersistence',
        type: 'options',
        options: [
          {
            name: 'Binary Storage (Recommended)',
            value: 'binary',
            description: 'Store conversations in binary data - most reliable method across executions',
          },
          {
            name: 'Static Data Storage (Legacy)',
            value: 'staticData',
            description: 'Store in n8n internal static data - requires activated workflow with trigger',
          },
        ],
        default: 'binary',
        description: 'Choose how conversation data should be stored between workflow runs',
      },
      {
        displayName: 'Persistence Information',
        name: 'storageNotice',
        type: 'notice',
        default: '<b>Binary Storage:</b> Passes conversation data between nodes for reliable storage but requires connecting compatible nodes.<br><b>Static Data Storage:</b> Only persists when workflow is activated and started by a trigger node. Manual test executions cannot save data with this method.',
        description: 'Important information about storage persistence between executions'
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
        description: 'Name of the binary property containing the conversation data',
        placeholder: 'data',
        hint: 'This must match the binary output property name from previous Round Robin nodes'
      },
      {
        displayName: 'Conversation ID',
        name: 'storageId',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            mode: ['store', 'retrieve', 'clear'],
          },
        },
        description: 'Optional: Use a consistent ID to maintain multiple separate conversations in the same workflow',
        placeholder: 'my-support-chat',
        hint: 'Leave empty to use workflow ID as default (most common scenario)'
      },
      
      // STORE MODE PARAMETERS
      {
        displayName: 'Conversation Setup',
        name: 'conversationSetupHeading',
        type: 'notice',
        default: 'Define the participants and structure of your conversation loop',
        displayOptions: {
          show: {
            mode: ['store'],
          },
        },
      },
      {
        displayName: 'Number of Participants',
        name: 'spotCount',
        type: 'number',
        default: 3,
        required: true,
        displayOptions: {
          show: {
            mode: ['store'],
          },
        },
        description: 'How many different roles or participants in this conversation',
        hint: 'For a typical AI chat, use 3 for User+Assistant+System'
      },
      {
        displayName: 'Maximum Conversation Rounds',
        name: 'maxRounds',
        type: 'number',
        default: 0,
        displayOptions: {
          show: {
            mode: ['store'],
          },
        },
        description: 'Optional: Limit the number of full conversation loops (0 = unlimited)',
        hint: 'Each round consists of one message from each participant'
      },
      {
        displayName: 'Participant Roles',
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
        description: 'Define the roles for each participant in the conversation',
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
                description: 'Name of this participant (e.g., User, Assistant, System)',
                required: true,
                placeholder: 'Assistant'
              },
              {
                displayName: 'Description',
                name: 'description',
                type: 'string',
                typeOptions: {
                  rows: 2,
                },
                default: '',
                description: 'Optional description of this role',
                placeholder: 'The AI helper that responds to user queries'
              },
              {
                displayName: 'Color',
                name: 'color',
                type: 'color',
                default: '#ff9900',
                description: 'Color for visual identification in the workflow',
              },
              {
                displayName: 'System Prompt Template',
                name: 'systemPrompt',
                type: 'string',
                typeOptions: {
                  rows: 3,
                },
                default: '',
                description: 'Optional system prompt to guide this role (most useful for System role)',
                placeholder: 'You are a helpful AI assistant that responds concisely.'
              },
              {
                displayName: 'Enabled',
                name: 'isEnabled',
                type: 'boolean',
                default: true,
                description: 'Whether this role is active in the conversation',
              },
            ],
          },
        ],
      },
      {
        displayName: 'Current Participant',
        name: 'spotIndex',
        type: 'number',
        default: 0,
        displayOptions: {
          show: {
            mode: ['store'],
          },
        },
        description: 'Which participant is sending this message (0-based index)',
        required: true,
        hint: '0 = first role, 1 = second role, etc.'
      },
      {
        displayName: 'Message Content Field',
        name: 'inputField',
        type: 'string',
        default: 'output',
        displayOptions: {
          show: {
            mode: ['store'],
          },
        },
        description: 'Name of the input field containing the message to store',
        required: true,
        placeholder: 'output',
        hint: 'Usually "output" from AI nodes or "message" from user inputs'
      },
      {
        displayName: 'Usage Example',
        name: 'storeExample',
        type: 'notice',
        default: '<b>Typical ChatGPT Conversation Setup:</b><br>• User (index 0): Human inputs<br>• Assistant (index 1): AI responses<br>• System (index 2): Instructions to guide the AI',
        displayOptions: {
          show: {
            mode: ['store'],
          },
        }
      },
      
      // RETRIEVE MODE PARAMETERS
      {
        displayName: 'Output Configuration',
        name: 'retrieveHeading',
        type: 'notice',
        default: 'Configure how the conversation history should be formatted',
        displayOptions: {
          show: {
            mode: ['retrieve'],
          },
        },
      },
      {
        displayName: 'Output Format',
        name: 'outputFormat',
        type: 'options',
        options: [
          {
            name: 'Conversation History for LLM',
            value: 'conversationHistory',
            description: 'Format suitable for sending directly to AI models',
          },
          {
            name: 'Message Array',
            value: 'array',
            description: 'Simple array of all messages with role and content',
          },
          {
            name: 'Grouped by Role',
            value: 'object',
            description: 'Messages organized by participant role',
          },
        ],
        default: 'conversationHistory',
        displayOptions: {
          show: {
            mode: ['retrieve'],
          },
        },
        description: 'How to structure the output data',
      },
      {
        displayName: 'LLM Platform',
        name: 'llmPlatform',
        type: 'options',
        options: [
          {
            name: 'OpenAI (ChatGPT)',
            value: 'openai',
            description: 'Format compatible with OpenAI models (GPT-3.5, GPT-4, etc.)',
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
            description: 'Basic format compatible with most LLMs',
          },
        ],
        default: 'openai',
        displayOptions: {
          show: {
            mode: ['retrieve'],
            outputFormat: ['conversationHistory'],
          },
        },
        description: 'Which AI model provider this conversation will be sent to',
      },
      {
        displayName: 'Include System Instructions',
        name: 'includeSystemPrompt',
        type: 'boolean',
        default: true,
        displayOptions: {
          show: {
            mode: ['retrieve'],
            outputFormat: ['conversationHistory'],
          },
        },
        description: 'Whether to include system role messages in the conversation history',
      },
      {
        displayName: 'System Instructions Position',
        name: 'systemPromptPosition',
        type: 'options',
        options: [
          {
            name: 'Start of Conversation',
            value: 'start',
            description: 'Place system instructions at the beginning (recommended)',
          },
          {
            name: 'End of Conversation',
            value: 'end',
            description: 'Place system instructions at the end',
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
        description: 'Where to position system instructions in the conversation',
      },
      {
        displayName: 'Simplified Output',
        name: 'simplifyOutput',
        type: 'boolean',
        default: true,
        displayOptions: {
          show: {
            mode: ['retrieve'],
          },
        },
        description: 'Whether to provide clean output with just essential fields (recommended)'
      },
      {
        displayName: 'Maximum Messages',
        name: 'maxMessages',
        type: 'number',
        default: 0,
        displayOptions: {
          show: {
            mode: ['retrieve'],
          },
        },
        description: 'Maximum number of recent messages to include (0 = all messages)',
        hint: 'Useful for limiting token usage with large conversation histories'
      },
    ],
  };

  // Helper method to log persistence info
  private static logPersistenceInfo(): void {
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

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    // Log persistence info at the start
    RoundRobin.logPersistenceInfo();
    
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const mode = this.getNodeParameter('mode', 0) as string;
    const storagePersistence = this.getNodeParameter('storagePersistence', 0, 'binary') as string;
    
    try {
      // Get node name (still useful for logging) and workflow ID
      const nodeName = this.getNode().name;
      let workflowId = this.getWorkflow()?.id; // Get the workflow ID using optional chaining
      console.log(`[Execution] Raw Workflow ID: ${workflowId}`);

      // Ensure workflowId is a valid string before using it for storage keys
      if (!workflowId) {
        // This case should be rare, but log a warning and fallback to nodeName
        // Note: Falling back to nodeName might reintroduce persistence issues if node names differ
        console.warn(`[Execution] Warning: Workflow ID is undefined. Falling back to node name ('${nodeName}') for storage key. Check n8n environment if persistence issues occur.`);
        workflowId = nodeName; 
      } else {
        // Ensure it's treated as a string type
        workflowId = String(workflowId);
      }
      
      // Check if user provided a custom storage ID
      const userStorageId = this.getNodeParameter('storageId', 0, '') as string;
      if (userStorageId) {
        console.log(`[Execution] Using user-provided Storage ID: "${userStorageId}" instead of workflow ID`);
        workflowId = userStorageId;
      }
      
      console.log(`[Execution] Using effective ID for storage: ${workflowId}`);
      console.log(`[Execution] Storage persistence mode: ${storagePersistence}`);
      
      // BINARY STORAGE MODE
      if (storagePersistence === 'binary') {
        await RoundRobin.handleBinaryStorageExecution(this, items, returnData, mode, workflowId);
        return [returnData];
      }
      
      // STATIC DATA MODE (Original behavior)
      // Get workflow static data with global context
      const staticData = this.getWorkflowStaticData('global');
      
      // Initialize storage using Workflow ID
      RoundRobinStorage.initializeStorage(staticData, workflowId);
      
      // Log initial state for debugging
      console.log('RoundRobin node executing in mode:', mode);
      console.log(`Node instance: ${nodeName}`); // Keep logging node name for clarity
      
      // Get current data values using Workflow ID
      const messages = RoundRobinStorage.getMessages(staticData, workflowId);
      const roles = RoundRobinStorage.getRoles(staticData, workflowId);
      const spotCount = RoundRobinStorage.getSpotCount(staticData, workflowId);
      const lastUpdated = RoundRobinStorage.getLastUpdated(staticData, workflowId);
      
      console.log('Current message count:', messages.length);
      console.log('Current roles count:', roles.length);
      
      // Mode specific operations
      if (mode === 'store') {
        const newSpotCount = this.getNodeParameter('spotCount', 0) as number;
        const spotIndex = this.getNodeParameter('spotIndex', 0) as number;
        const inputField = this.getNodeParameter('inputField', 0) as string;
        const maxRounds = this.getNodeParameter('maxRounds', 0, 0) as number;
        
        // Update spot count in storage using Workflow ID
        RoundRobinStorage.setSpotCount(staticData, workflowId, newSpotCount);
        RoundRobinStorage.setMaxRounds(staticData, workflowId, maxRounds);
        
        // Check if we've reached the maximum rounds limit
        if (maxRounds > 0) {
          const hasReachedLimit = RoundRobinStorage.hasReachedRoundLimit(messages, newSpotCount, maxRounds);
          if (hasReachedLimit) {
            console.log(`[Round Limit] Maximum rounds (${maxRounds}) reached. Not adding new messages.`);
            returnData.push({
              json: {
                status: 'limit_reached',
                message: `Maximum conversation rounds (${maxRounds}) reached. Consider clearing the conversation to start over.`,
                roundCount: RoundRobinStorage.calculateRoundCount(messages, newSpotCount),
                maxRounds: maxRounds,
                messageCount: messages.length
              }
            });
            return [returnData];
          }
        }
        
        // Get roles if defined
        const rolesCollection = this.getNodeParameter('roles', 0) as {
          values?: Array<{ name: string; description: string; color?: string; tone?: string; expertise?: string; systemPrompt?: string; isEnabled?: boolean }>;
        };
        
        // Process and update roles using Workflow ID
        const updatedRoles: IRoundRobinRole[] = processRoles(rolesCollection);
        // Only update roles if new ones are provided OR if no roles exist yet (use defaults)
        const currentRolesForInitCheck = RoundRobinStorage.getRoles(staticData, workflowId);
        if (updatedRoles.length > 0) {
          RoundRobinStorage.setRoles(staticData, workflowId, updatedRoles);
        } else if (currentRolesForInitCheck.length === 0) {
          // Initialize with default roles if not set and none exist
          const defaultRoles = getDefaultRoles();
          RoundRobinStorage.setRoles(staticData, workflowId, defaultRoles);
        }
        
        // Get current roles after possible update using Workflow ID
        const currentRoles = RoundRobinStorage.getRoles(staticData, workflowId);
        
        // Validate spot index
        if (spotIndex < 0 || spotIndex >= newSpotCount) {
          throw new NodeOperationError(this.getNode(), `Spot index must be between 0 and ${newSpotCount - 1}`);
        }
        
        // Process all input items
        // Read current messages again right before modification in case of concurrent runs
        const currentMessages = RoundRobinStorage.getMessages(staticData, workflowId);
        const updatedMessages = [...currentMessages]; // Use the most recent read
        
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
          
          // Calculate the current round count
          const currentRounds = RoundRobinStorage.calculateRoundCount(updatedMessages, newSpotCount);
          
          // Pass through the item with additional metadata
          returnData.push({
            json: {
              ...item.json,
              roundRobinRole: roleName,
              roundRobinSpotIndex: spotIndex,
              roundRobinStored: true,
              messageCount: updatedMessages.length,
              roundCount: currentRounds,
              maxRounds: maxRounds,
              roundsRemaining: maxRounds > 0 ? Math.max(0, maxRounds - currentRounds) : null,
            },
            pairedItem: {
              item: i,
            },
          });
        }
        
        // Update messages in storage using Workflow ID
        RoundRobinStorage.setMessages(staticData, workflowId, updatedMessages);
        RoundRobinStorage.setLastUpdated(staticData, workflowId, Date.now());
        
        // Calculate and update the round count
        const updatedRoundCount = RoundRobinStorage.calculateRoundCount(updatedMessages, newSpotCount);
        RoundRobinStorage.setRoundCount(staticData, workflowId, updatedRoundCount);
        
        // Verify storage after saving to ensure data persisted within the staticData object
        RoundRobinStorage.verifyStoragePersistence(staticData, workflowId);
      } else if (mode === 'retrieve') {
        const outputFormat = this.getNodeParameter('outputFormat', 0) as string;
        const maxMessages = this.getNodeParameter('maxMessages', 0, 0) as number;
        const simplifyOutput = this.getNodeParameter('simplifyOutput', 0, true) as boolean;
        
        // Debug messages
        console.log('Retrieving messages from storage');
        // messages, roles, lastUpdated were fetched using workflowId at the start
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
          return [returnData]; // Exit early if no messages
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
            this, // Pass the execution context
            returnData,
            messagesToProcess,
            roles,
            lastUpdated,
            simplifyOutput
          );
        }
      } else if (mode === 'clear') {
        // Reset messages but keep roles, using Workflow ID
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
      
      // Final debug log to confirm data persistence using Workflow ID
      console.log('Final storage state - message count:', RoundRobinStorage.getMessages(staticData, workflowId).length);
      
      // Verify storage persistence after execution
      if (storagePersistence === 'staticData') {
        RoundRobinStorage.verifyStoragePersistence(staticData, workflowId);
      }
      
      return [returnData];
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
  }

  // New method to handle binary storage execution
  private static async handleBinaryStorageExecution(
    executeFunctions: IExecuteFunctions,
    items: INodeExecutionData[], 
    returnData: INodeExecutionData[], 
    mode: string,
    storageId: string
  ): Promise<void> {
    const storageManager = createStorageManager(executeFunctions, 'binary', storageId);
    
    if (mode === 'store') {
      const newSpotCount = executeFunctions.getNodeParameter('spotCount', 0) as number;
      const spotIndex = executeFunctions.getNodeParameter('spotIndex', 0) as number;
      const inputField = executeFunctions.getNodeParameter('inputField', 0) as string;
      const maxRounds = executeFunctions.getNodeParameter('maxRounds', 0, 0) as number;
      
      // Get roles if defined
      const rolesCollection = executeFunctions.getNodeParameter('roles', 0) as {
        values?: Array<{ name: string; description: string; color?: string; tone?: string; expertise?: string; systemPrompt?: string; isEnabled?: boolean }>;
      };
      
      // Process roles
      const updatedRoles = processRoles(rolesCollection);
      const finalRoles = updatedRoles.length > 0 ? updatedRoles : getDefaultRoles();
      
      // Check if we have binary input data to load existing data
      let existingMessages: any[] = [];
      let existingRoles = finalRoles;
      let roundCount = 0;
      
      if (items[0]?.binary) {
        try {
          const binaryInputProperty = executeFunctions.getNodeParameter('binaryInputProperty', 0, 'data') as string;
          const loadedData = await storageManager.loadFromBinary(items[0].binary as IDataObject);
          existingMessages = loadedData.messages || [];
          
          // Only use loaded roles if we don't have new ones and there are existing ones
          if (updatedRoles.length === 0 && loadedData.roles && loadedData.roles.length > 0) {
            existingRoles = loadedData.roles;
          }
        } catch (error) {
          console.log(`[Binary Storage] Could not load existing data: ${error.message}`);
        }
      }
      
      // Check if we've reached the maximum rounds limit
      if (maxRounds > 0) {
        // Calculate current round count
        roundCount = RoundRobinStorage.calculateRoundCount(existingMessages, newSpotCount);
        const hasReachedLimit = RoundRobinStorage.hasReachedRoundLimit(existingMessages, newSpotCount, maxRounds);
        
        if (hasReachedLimit) {
          console.log(`[Round Limit] Maximum rounds (${maxRounds}) reached. Not adding new messages.`);
          returnData.push({
            json: {
              status: 'limit_reached',
              message: `Maximum conversation rounds (${maxRounds}) reached. Consider clearing the conversation to start over.`,
              roundCount: roundCount,
              maxRounds: maxRounds,
              messageCount: existingMessages.length
            }
          });
          return;
        }
      }
      
      // Validate spot index
      if (spotIndex < 0 || spotIndex >= newSpotCount) {
        throw new NodeOperationError(executeFunctions.getNode(), `Spot index must be between 0 and ${newSpotCount - 1}`);
      }
      
      // Process all input items
      const updatedMessages = [...existingMessages]; // Start with existing messages
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Extract message content from the item
        const messageContent = extractMessageContent(item, inputField, i, executeFunctions);
        
        // Get role name based on spot index
        const roleName = spotIndex < existingRoles.length 
          ? existingRoles[spotIndex].name 
          : `Role ${spotIndex + 1}`;
        
        // Create the message object
        const newMessage = {
          role: roleName,
          content: messageContent,
          spotIndex,
          timestamp: Date.now(),
        };
        
        // Add to messages
        updatedMessages.push(newMessage);
        
        console.log(`[Binary Storage] Stored message for role "${roleName}":`, newMessage);
      }
      
      // Calculate the updated round count
      const updatedRoundCount = RoundRobinStorage.calculateRoundCount(updatedMessages, newSpotCount);
      
      // Store data in binary
      const result = await storageManager.storeToBinary(
        updatedMessages, 
        existingRoles, 
        newSpotCount, 
        {
          roundCount: updatedRoundCount,
          maxRounds: maxRounds
        }
      );
      
      // Add round count information to the result
      const resultWithRounds = {
        ...result,
        json: {
          ...(result as INodeExecutionData).json,
          roundCount: updatedRoundCount,
          maxRounds: maxRounds,
          roundsRemaining: maxRounds > 0 ? Math.max(0, maxRounds - updatedRoundCount) : null,
        }
      };
      
      // Return the result with binary data
      returnData.push(resultWithRounds as INodeExecutionData);
      
    } else if (mode === 'retrieve') {
      // Check if we have binary input data
      if (!items[0]?.binary) {
        throw new NodeOperationError(executeFunctions.getNode(), 'No binary input data found. Please connect a node that provides binary data.');
      }
      
      const binaryInputProperty = executeFunctions.getNodeParameter('binaryInputProperty', 0, 'data') as string;
      const loadedData = await storageManager.loadFromBinary(items[0].binary as IDataObject);
      
      // Get retrieval parameters
      const outputFormat = executeFunctions.getNodeParameter('outputFormat', 0) as string;
      const simplifyOutput = executeFunctions.getNodeParameter('simplifyOutput', 0, true) as boolean;
      const maxMessages = executeFunctions.getNodeParameter('maxMessages', 0, 0) as number;
      
      // Filter messages if maxMessages is set
      let filteredMessages = loadedData.messages;
      if (maxMessages > 0 && filteredMessages.length > maxMessages) {
        filteredMessages = filteredMessages.slice(-maxMessages);
      }
      
      // Calculate round count information
      const spotCount = loadedData.spotCount || 3;
      const roundCount = RoundRobinStorage.calculateRoundCount(filteredMessages, spotCount);
      const maxRounds = loadedData.maxRounds || 0;
      
      // Format output based on outputFormat parameter
      if (outputFormat === 'array') {
        processArrayOutput(returnData, filteredMessages, loadedData.roles, loadedData.lastUpdated, simplifyOutput);
        // Add round information
        if (returnData.length > 0) {
          returnData[0].json.roundCount = roundCount;
          returnData[0].json.maxRounds = maxRounds;
          returnData[0].json.roundsRemaining = maxRounds > 0 ? Math.max(0, maxRounds - roundCount) : null;
        }
      } else if (outputFormat === 'object') {
        processObjectOutput(returnData, filteredMessages, loadedData.roles, loadedData.lastUpdated, simplifyOutput);
        // Add round information
        if (returnData.length > 0) {
          returnData[0].json.roundCount = roundCount;
          returnData[0].json.maxRounds = maxRounds;
          returnData[0].json.roundsRemaining = maxRounds > 0 ? Math.max(0, maxRounds - roundCount) : null;
        }
      } else if (outputFormat === 'conversationHistory') {
        const includeSystemPrompt = executeFunctions.getNodeParameter('includeSystemPrompt', 0, false) as boolean;
        const systemPromptPosition = includeSystemPrompt 
          ? executeFunctions.getNodeParameter('systemPromptPosition', 0, 'start') as string
          : 'none';
        const systemPrompt = includeSystemPrompt 
          ? executeFunctions.getNodeParameter('systemPrompt', 0, '') as string
          : '';
        
        const llmPlatform = executeFunctions.getNodeParameter('llmPlatform', 0, 'generic') as string;
        
        if (llmPlatform === 'openai') {
          formatOpenAIConversation(returnData, filteredMessages, systemPrompt, includeSystemPrompt, systemPromptPosition, loadedData.lastUpdated, simplifyOutput, loadedData.roles);
        } else if (llmPlatform === 'anthropic') {
          formatAnthropicConversation(returnData, filteredMessages, systemPrompt, includeSystemPrompt, loadedData.lastUpdated, simplifyOutput);
        } else if (llmPlatform === 'google') {
          formatGoogleConversation(returnData, filteredMessages, systemPrompt, includeSystemPrompt, systemPromptPosition, loadedData.lastUpdated, simplifyOutput, loadedData.roles);
        } else {
          formatGenericConversation(returnData, filteredMessages, systemPrompt, includeSystemPrompt, systemPromptPosition, loadedData.lastUpdated, simplifyOutput, loadedData.roles);
        }
        
        // Add round information
        if (returnData.length > 0) {
          returnData[0].json.roundCount = roundCount;
          returnData[0].json.maxRounds = maxRounds;
          returnData[0].json.roundsRemaining = maxRounds > 0 ? Math.max(0, maxRounds - roundCount) : null;
        }
      }
      
      // If there were no messages, add a default output
      if (returnData.length === 0) {
        returnData.push({
          json: {
            messages: [],
            messageCount: 0,
            lastUpdated: new Date().toISOString(),
            roundCount: 0,
            maxRounds: maxRounds,
            info: 'No messages found in storage'
          },
        });
      }
      
    } else if (mode === 'clear') {
      // Create an empty storage
      const result = await storageManager.storeToBinary([], getDefaultRoles(), 3, { roundCount: 0, maxRounds: 0 });
      
      // Return the result with binary data
      returnData.push({
        json: {
          success: true,
          operation: 'clear',
          timestamp: new Date().toISOString(),
          roundCount: 0,
          maxRounds: 0,
        },
        binary: (result as INodeExecutionData).binary,
      });
    }
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