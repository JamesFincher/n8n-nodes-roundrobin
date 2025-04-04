# n8n-nodes-roundrobin

This is a node for [n8n](https://n8n.io/) that provides a round-robin messaging system, particularly useful for creating conversation loops with multiple personas in LLM workflows.

## Key Features

- **Persistent Storage**: Messages are stored in Airtable and persist across n8n restarts or workflow updates
- **Conversation History**: Retrieve messages in formats compatible with various LLM platforms
- **Role Management**: Define custom personas with properties like name, color, tone, and system prompts
- **Flexible Output Formats**: Multiple output options for different use cases

## Installation

Follow these steps to install this custom node in your n8n instance:

1. Open your n8n instance
2. Go to **Settings > Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-roundrobin` and click **Install**

Alternatively, you can install it manually via npm:

```bash
npm install n8n-nodes-roundrobin
```

## Setup

### 1. Create Airtable Base and Table

Before using this node, you need to create a table in Airtable with the following fields:

- `workflowId` (Single line text)
- `role` (Single line text)
- `content` (Long text)
- `spotIndex` (Number)
- `timestamp` (Number)
- `metadata` (Long text)

### 2. Configure Node Credentials

Add your Airtable API key in the node credentials tab. You'll need to:

1. Get your Airtable API key from https://airtable.com/account
2. Add it to n8n credentials
3. Configure the Base ID and Table Name in the node settings

## Usage Modes

The node has three operation modes:

### 1. Store Mode

Stores a message in the round-robin system with a specific role.

- Choose a spot index (0, 1, 2, etc.) corresponding to different personas
- Define roles with names, descriptions, and other properties
- Specify which field from input items contains the message content

### 2. Retrieve Mode

Retrieves all stored messages, with options for formatting:

- **Array**: Messages in a simple array format
- **Object**: Messages grouped by role
- **Conversation History**: Formatted specifically for LLM platforms (OpenAI, Anthropic, Google)

### 3. Clear Mode

Deletes all stored messages.

## Example Workflow

Here's a basic example of using the RoundRobin node:

1. **Create a workflow that stores user messages:**
   - **Webhook** (trigger) → **RoundRobin** (mode: store, spotIndex: 0)

2. **Create a workflow that retrieves conversation:**
   - **Webhook** (trigger) → **RoundRobin** (mode: retrieve, format: conversationHistory) → **OpenAI**

## Why Airtable Storage?

We implemented Airtable storage because:

1. **True Persistence**: Data survives across n8n restarts and server redeployments
2. **Reliability**: Works with all execution types, including manual testing
3. **Visibility**: Easily view and manage your conversation data in Airtable's interface
4. **No Size Limits**: Handles large conversations without the limitations of workflow static data

## Version History

- **v0.9.0** - Added Airtable-based persistent storage
- **v0.8.4** - Enhanced conversation history formatting 
- **v0.8.3** - Added additional metadata for roles
- **v0.8.2** - Bug fixes and improvements
- **v0.8.1** - Initial public release

## License

[MIT](LICENSE.md)

## Author

James Fincher 