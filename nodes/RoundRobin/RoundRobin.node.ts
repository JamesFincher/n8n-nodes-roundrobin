import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

interface IRoundRobinStorage {
	messages: Array<{
		role: string;
		message: string;
		spotIndex: number;
	}>;
	roles: string[];
	spotCount: number;
}

export class RoundRobin implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Round Robin',
		name: 'roundRobin',
		group: ['transform'],
		version: 1,
		description: 'Store and retrieve messages in a round-robin fashion',
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
					},
					{
						name: 'Retrieve',
						value: 'retrieve',
						description: 'Retrieve all messages from the round-robin',
					},
					{
						name: 'Clear',
						value: 'clear',
						description: 'Clear all stored messages',
					},
				],
				default: 'store',
				noDataExpression: true,
				required: true,
				description: 'The operation to perform',
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
				typeOptions: {
					multipleValues: true,
					multipleValueButtonText: 'Add Role',
				},
				type: 'fixedCollection',
				default: {},
				displayOptions: {
					show: {
						mode: ['store'],
					},
				},
				description: 'Define the roles for each spot in the round-robin',
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
								description: 'Name of the role/persona',
							},
							{
								displayName: 'Role Description',
								name: 'description',
								type: 'string',
								default: '',
								description: 'Description of the role/persona',
							},
						],
					},
				],
			},
			{
				displayName: 'Input Field',
				name: 'inputField',
				type: 'string',
				default: 'message',
				displayOptions: {
					show: {
						mode: ['store'],
					},
				},
				description: 'The name of the field containing the message to store',
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
				description: 'Specify which spot to store the current message in (0-based index)',
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
				],
				default: 'array',
				displayOptions: {
					show: {
						mode: ['retrieve'],
					},
				},
				description: 'Format of the retrieved messages',
			},
		],
	};

	// The function to execute
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const mode = this.getNodeParameter('mode', 0) as string;

		// Initialize storage context from function context or create a new one
		let storageData: IRoundRobinStorage;
		if (this.getContext('roundRobinStorage') !== undefined) {
			storageData = this.getContext('roundRobinStorage') as IRoundRobinStorage;
		} else {
			storageData = {
				messages: [],
				roles: [],
				spotCount: 0,
			};
		}

		// Mode specific operations
		if (mode === 'store') {
			// Get parameters
			const spotCount = this.getNodeParameter('spotCount', 0) as number;
			const spotIndex = this.getNodeParameter('spotIndex', 0) as number;
			const inputField = this.getNodeParameter('inputField', 0) as string;
			
			// Update spot count in storage
			storageData.spotCount = spotCount;
			
			// Get roles if defined
			const rolesCollection = this.getNodeParameter('roles', 0) as { roleValues?: Array<{ name: string }> };
			if (rolesCollection.roleValues && rolesCollection.roleValues.length) {
				storageData.roles = rolesCollection.roleValues.map(role => role.name);
			} else if (storageData.roles.length === 0) {
				// Initialize with default roles if not set
				storageData.roles = Array(spotCount).fill('').map((_, i) => `Role ${i + 1}`);
			}
			
			// Validate spot index
			if (spotIndex < 0 || spotIndex >= spotCount) {
				throw new NodeOperationError(
					this.getNode(),
					`Spot index must be between 0 and ${spotCount - 1}`,
				);
			}
			
			// Store messages from all items
			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				const message = item.json[inputField];
				
				if (message === undefined) {
					throw new NodeOperationError(
						this.getNode(),
						`Input field '${inputField}' not found in item #${i + 1}`,
					);
				}
				
				// Store the message
				storageData.messages.push({
					role: storageData.roles[spotIndex],
					message,
					spotIndex,
				});
				
				// Pass through the item
				returnData.push({
					json: {
						...item.json,
						roundRobinRole: storageData.roles[spotIndex],
						roundRobinSpotIndex: spotIndex,
						roundRobinStored: true,
					},
				});
			}
		} else if (mode === 'retrieve') {
			const outputFormat = this.getNodeParameter('outputFormat', 0) as string;
			
			if (outputFormat === 'array') {
				// Return messages as an array
				returnData.push({
					json: {
						messages: storageData.messages,
						roles: storageData.roles,
						spotCount: storageData.spotCount,
					},
				});
			} else {
				// Return messages as an object grouped by roles
				const messagesByRole: Record<string, string[]> = {};
				
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
					message: 'Round-robin storage cleared',
				},
			});
		}
		
		// Save storage context
		this.setContext('roundRobinStorage', storageData);
		
		return [returnData];
	}
}
