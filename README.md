# n8n-nodes-roundrobin

This is a custom n8n node that implements a round-robin storage mechanism for messages, particularly designed for LLM conversation loops with multiple personas.

## Features

- Store messages from different personas in a round-robin fashion
- Configure the number of spots and roles for each spot
- Track each persona's messages
- Display all round-robin inputs upon completion
- Supports multiple independent round-robin storage instances in a single workflow

## Installation

### Local Installation

1. Clone this repository
2. Navigate to the project directory: `cd n8n-nodes-roundrobin`
3. Install dependencies: `npm install`
4. Build the code: `npm run build`
5. Link to your n8n installation:
   - Create a symbolic link: `npm link`
   - In your n8n installation directory: `npm link n8n-nodes-roundrobin`

### Global Installation (via npm)

```
npm install -g n8n-nodes-roundrobin
```

### n8n Community Nodes (Recommended)

1. Open your n8n instance
2. Go to Settings > Community Nodes
3. Search for "round-robin"
4. Click Install

## Detailed Usage Instructions

### Basic Configuration

1. Add the "Round Robin" node to your workflow
2. Configure the node with one of three operation modes:
   - **Store Message**: Saves a message at a specific position in the round-robin
   - **Retrieve All Messages**: Gets all stored messages
   - **Clear All Messages**: Resets the storage

### Important Parameters

- **Round Robin ID**: A unique identifier if you're using multiple round-robin nodes in your workflow
- **Number of Spots**: How many different personas/roles are in your conversation loop
- **Roles**: Define custom names for each position in the round-robin
- **Spot Index**: Which position (0-indexed) to store the current message in
- **Input Field**: The field name in your data that contains the message text
- **Output Format**: How to structure the retrieved messages (array or object)

### Example: LLM Conversation Loop

1. **Setup**: Create an LLM workflow with multiple personas (critic, creator, analyst)
2. **Store**: Connect each LLM output to a Round Robin node in "Store" mode
   - Set different spot indexes for each persona (0, 1, 2...)
   - Configure the input field that contains the LLM message
3. **Loop**: Use a Loop node to iterate through personas
4. **Retrieve**: At the end of your workflow, use a Round Robin node in "Retrieve" mode
   - Choose your preferred output format
   - Access all messages from all personas

## Workflow Examples

### Basic Round-Robin Storage

```
[Initial Input] → [Set Variable] → [Round Robin: Store (index 0)]
                               → [Round Robin: Store (index 1)]
                               → [Round Robin: Store (index 2)]
                               → [Round Robin: Retrieve]
```

### LLM Conversation Loop

```
[Initial Topic] → [Loop Start]
                  → [LLM Call with Dynamic Persona]
                  → [Round Robin: Store (matching spot index)]
                  → [Loop End]
                → [Round Robin: Retrieve] → [Format Output]
```

## Troubleshooting

### Common Issues:

1. **Missing Messages**: Ensure you're using the same "Round Robin ID" for store and retrieve operations
2. **Invalid Spot Index**: Confirm your spot index is less than the total number of spots
3. **Context Errors**: Make sure you're using n8n version 1.0.0 or newer which supports flow context

## License

MIT
