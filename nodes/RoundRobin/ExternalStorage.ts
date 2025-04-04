import { IExecuteFunctions, IDataObject, NodeOperationError } from 'n8n-workflow';

// Define interfaces for the message and role objects (matching RoundRobin.node.ts)
export interface IRoundRobinExternalMessage {
  role: string;
  content: string;
  spotIndex: number;
  timestamp: number;
}

export interface IRoundRobinExternalRole {
  name: string;
  description: string;
  color?: string;
  icon?: string;
  tone?: string;
  expertise?: string[];
  systemPrompt?: string;
  isEnabled?: boolean;
}

// Interface for metrics and settings
export interface IRoundRobinMetrics {
  roundCount?: number;
  maxRounds?: number;
  [key: string]: any; // For future extensibility
}

/**
 * ExternalStorageManager provides alternative storage options for the RoundRobin node
 * to overcome n8n's limitation that static data only persists with trigger nodes.
 * 
 * Currently supported methods:
 * - n8n.binary: Store data in binary files attached to the workflow
 * - (future) External database via n8n credentials
 */
export class ExternalStorageManager {
  private executeFunctions: IExecuteFunctions;
  private storageType: string;
  private storageId: string;
  
  constructor(executeFunctions: IExecuteFunctions, storageType: string, storageId: string) {
    this.executeFunctions = executeFunctions;
    this.storageType = storageType;
    this.storageId = storageId;
  }
  
  /**
   * Store messages and roles in binary data attached to the workflow
   */
  async storeToBinary(
    messages: IRoundRobinExternalMessage[], 
    roles: IRoundRobinExternalRole[],
    spotCount: number,
    metrics?: IRoundRobinMetrics
  ): Promise<IDataObject> {
    try {
      // Create a data object with all necessary information
      const storageData = {
        messages,
        roles,
        spotCount,
        lastUpdated: Date.now(),
        roundCount: metrics?.roundCount || 0,
        maxRounds: metrics?.maxRounds || 0,
        // Include any other metrics for future expansion
        ...(metrics || {})
      };
      
      // Convert to JSON string
      const jsonData = JSON.stringify(storageData);
      
      // Store in binary property
      const binaryPropertyName = `data`;
      
      const newItem = {
        json: {
          success: true,
          storageType: 'binary',
          storageId: this.storageId,
          lastUpdated: new Date().toISOString(),
          messageCount: messages.length,
          rolesCount: roles.length,
          roundCount: metrics?.roundCount || 0,
          maxRounds: metrics?.maxRounds || 0,
          roundsRemaining: metrics?.maxRounds && metrics?.maxRounds > 0 
            ? Math.max(0, metrics.maxRounds - (metrics.roundCount || 0)) 
            : null,
        },
        binary: {
          [binaryPropertyName]: await this.executeFunctions.helpers.prepareBinaryData(
            Buffer.from(jsonData),
            `roundrobin_${this.storageId}.json`, 
            'application/json'
          ),
        },
      };
      
      return newItem;
    } catch (error) {
      throw new NodeOperationError(
        this.executeFunctions.getNode(), 
        `Failed to store data in binary: ${error.message}`
      );
    }
  }
  
  /**
   * Load messages and roles from binary data
   */
  async loadFromBinary(binaryData: IDataObject): Promise<{
    messages: IRoundRobinExternalMessage[],
    roles: IRoundRobinExternalRole[],
    spotCount: number,
    lastUpdated: number,
    roundCount?: number,
    maxRounds?: number
  }> {
    try {
      const binaryPropertyName = this.executeFunctions.getNodeParameter('binaryInputProperty', 0, 'data') as string;
      
      if (!binaryData || !binaryData[binaryPropertyName]) {
        return {
          messages: [],
          roles: [],
          spotCount: 0,
          lastUpdated: 0,
          roundCount: 0,
          maxRounds: 0
        };
      }
      
      // Get binary data
      const binaryProperty = binaryData[binaryPropertyName] as IDataObject;
      const binaryString = Buffer.from(binaryProperty.data as string, 'base64').toString();
      
      // Parse JSON
      const storageData = JSON.parse(binaryString);
      
      return {
        messages: storageData.messages || [],
        roles: storageData.roles || [],
        spotCount: storageData.spotCount || 0,
        lastUpdated: storageData.lastUpdated || 0,
        roundCount: storageData.roundCount || 0,
        maxRounds: storageData.maxRounds || 0
      };
    } catch (error) {
      throw new NodeOperationError(
        this.executeFunctions.getNode(),
        `Failed to load data from binary: ${error.message}`
      );
    }
  }
}

/**
 * Helper function to create a storage manager instance
 */
export function createStorageManager(
  executeFunctions: IExecuteFunctions,
  storageType = 'binary',
  storageId = 'default'
): ExternalStorageManager {
  return new ExternalStorageManager(executeFunctions, storageType, storageId);
} 