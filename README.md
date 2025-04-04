# n8n-nodes-roundrobin

This is a custom n8n node that implements a round-robin storage mechanism for messages, particularly designed for LLM conversation loops with multiple personas.

## Features

- Store messages from different personas in a round-robin fashion
- Configure the number of spots and roles for each spot
- Track each persona's messages
- Display all round-robin inputs upon completion

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

## Usage

1. Add the "Round Robin" node to your workflow
2. Configure the number of spots (personas)
3. Define the role for each spot
4. Connect your LLM output nodes to this node
5. Use the node in a loop to collect messages from each persona
6. When the loop is complete, the node will output all collected messages

## Example Workflow

- Set up an LLM with multiple personas (e.g., critic, creator, analyst)
- Connect each LLM output to the Round Robin node
- The node will store each persona's message in its dedicated spot
- When all spots are filled or the process is complete, retrieve the entire conversation

## License

MIT
