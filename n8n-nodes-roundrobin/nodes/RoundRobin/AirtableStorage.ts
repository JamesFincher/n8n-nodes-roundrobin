import axios, { AxiosRequestConfig, Method } from 'axios';
import { IExecuteFunctions, IDataObject, NodeApiError, NodeOperationError } from 'n8n-workflow';

interface IAirtableMessage {
  id?: string;
  fields: {
    workflowId: string;
    role: string;
    content: string;
    spotIndex: number;
    timestamp: number;
    metadata?: string;
  };
}

interface IAirtableRecord {
  id: string;
  fields: {
    workflowId: string;
    role: string;
    content: string;
    spotIndex: number;
    timestamp: number;
    metadata?: string;
  };
}

interface IAirtableResponse {
  records: IAirtableRecord[];
}

export class AirtableStorage {
  private apiKey: string;
  private baseId: string;
  private tableName: string;
  private executeFunctions: IExecuteFunctions;

  constructor(executeFunctions: IExecuteFunctions, apiKey: string, baseId: string, tableName: string) {
    this.executeFunctions = executeFunctions;
    this.apiKey = apiKey;
    this.baseId = baseId;
    this.tableName = tableName;
  }

  /**
   * Make authenticated request to Airtable API
   */
  private async makeRequest(method: Method, endpoint: string, data?: any) {
    const url = `https://api.airtable.com/v0/${this.baseId}/${endpoint}`;
    
    try {
      const config: AxiosRequestConfig = {
        method,
        url,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        data,
      };
      
      const response = await axios(config);
      return response.data;
    } catch (error: any) {
      console.error('Airtable API error:', error.response?.data || error.message);
      
      if (error.response?.data?.error) {
        throw new NodeApiError(this.executeFunctions.getNode(), error.response.data);
      }
      
      throw new NodeOperationError(
        this.executeFunctions.getNode(),
        `Airtable API error: ${error.message}`
      );
    }
  }

  /**
   * Verify connection and create table if it doesn't exist
   */
  async initialize() {
    try {
      console.log(`[AirtableStorage] Initializing connection to base ${this.baseId}`);
      
      // First verify we can connect to the base
      await this.makeRequest('GET', `${this.tableName}?maxRecords=1`).catch(async (error) => {
        // If table doesn't exist, create it
        if (error.message.includes('not found') || error.message.includes('Table not found')) {
          console.log(`[AirtableStorage] Table "${this.tableName}" not found, will attempt to create it`);
          
          // Check if we can access the base first
          await this.makeRequest('GET', '');
          
          // Create the table with the required fields
          await this.createTable();
          return;
        }
        throw error;
      });
      
      console.log(`[AirtableStorage] Successfully connected to Airtable base and table`);
      return true;
    } catch (error: any) {
      console.error(`[AirtableStorage] Initialization error:`, error);
      throw new NodeOperationError(
        this.executeFunctions.getNode(),
        `Failed to initialize Airtable connection: ${error.message}. Please check your API key and base ID.`
      );
    }
  }

  /**
   * Create the messages table with required fields
   */
  private async createTable() {
    throw new NodeOperationError(
      this.executeFunctions.getNode(),
      `Table "${this.tableName}" does not exist in the Airtable base. Please create it manually with the following fields: workflowId (text), role (text), content (long text), spotIndex (number), timestamp (number), metadata (long text).`
    );
    
    // Note: Airtable API doesn't allow creating tables via API
    // Users must create the table manually in the Airtable web interface
  }

  /**
   * Store a message in Airtable
   */
  async storeMessage(workflowId: string, role: string, content: string, spotIndex: number, metadata?: IDataObject) {
    console.log(`[AirtableStorage] Storing message for workflow ${workflowId}, role ${role}`);
    
    const message: IAirtableMessage = {
      fields: {
        workflowId,
        role,
        content,
        spotIndex,
        timestamp: Date.now(),
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    };
    
    const data = {
      records: [message],
    };
    
    const result = await this.makeRequest('POST', this.tableName, data) as IAirtableResponse;
    console.log(`[AirtableStorage] Message stored successfully. Record ID: ${result.records[0].id}`);
    
    return result.records[0];
  }

  /**
   * Retrieve messages for a specific workflow
   */
  async getMessages(workflowId: string) {
    console.log(`[AirtableStorage] Retrieving messages for workflow ${workflowId}`);
    
    // Build filter formula to get only messages for this workflow
    const filterByFormula = encodeURIComponent(`{workflowId} = "${workflowId}"`);
    
    // Get all records for this workflow, sorted by timestamp
    const result = await this.makeRequest('GET', `${this.tableName}?filterByFormula=${filterByFormula}&sort%5B0%5D%5Bfield%5D=timestamp&sort%5B0%5D%5Bdirection%5D=asc`) as IAirtableResponse;
    
    console.log(`[AirtableStorage] Retrieved ${result.records.length} messages`);
    
    // Convert Airtable records to our internal format
    return result.records.map((record: IAirtableRecord) => ({
      id: record.id,
      role: record.fields.role,
      content: record.fields.content,
      spotIndex: record.fields.spotIndex,
      timestamp: record.fields.timestamp,
      metadata: record.fields.metadata ? JSON.parse(record.fields.metadata) : undefined,
    }));
  }

  /**
   * Delete all messages for a specific workflow
   */
  async clearMessages(workflowId: string) {
    console.log(`[AirtableStorage] Clearing messages for workflow ${workflowId}`);
    
    // First get all records for this workflow
    const messages = await this.getMessages(workflowId);
    
    if (messages.length === 0) {
      console.log(`[AirtableStorage] No messages to clear`);
      return 0;
    }
    
    // Prepare record IDs for deletion
    const recordIds = messages.map(msg => msg.id as string);
    
    // Airtable allows deleting up to 10 records at a time
    const chunks: string[][] = [];
    for (let i = 0; i < recordIds.length; i += 10) {
      chunks.push(recordIds.slice(i, i + 10));
    }
    
    // Delete each chunk
    let deletedCount = 0;
    for (const chunk of chunks) {
      const ids = chunk.map(id => encodeURIComponent(id)).join(',');
      await this.makeRequest('DELETE', `${this.tableName}?records=${ids}`);
      deletedCount += chunk.length;
    }
    
    console.log(`[AirtableStorage] Cleared ${deletedCount} messages`);
    return deletedCount;
  }
} 