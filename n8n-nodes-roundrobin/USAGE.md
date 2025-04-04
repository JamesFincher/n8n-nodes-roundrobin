# RoundRobin Node - Detailed Usage Guide

This document provides detailed instructions for setting up and using the RoundRobin node with Airtable storage.

## Airtable Setup

### 1. Create an Airtable Account

If you don't already have one, sign up for an Airtable account at [https://airtable.com/signup](https://airtable.com/signup).

### 2. Create a Base and Table

1. Create a new base or use an existing one
2. Add a new table (e.g., "RoundRobinMessages") with the following fields:
   - `workflowId` (Single line text)
   - `role` (Single line text)
   - `content` (Long text)
   - `spotIndex` (Number)
   - `timestamp` (Number)
   - `metadata` (Long text)

### 3. Get Your API Key and Base ID

1. **API Key**: 
   - Go to [https://airtable.com/account](https://airtable.com/account)
   - Under API section, either copy your API key or create a new one
   - Keep this key secure, as it provides access to all your bases

2. **Base ID**:
   - Open your base in the browser
   - Look at the URL, which will be in the format: `https://airtable.com/appXXXXXXXXXXXX/tblYYYYYYYYYY/viwZZZZZZZZZ`
   - The Base ID is the part that starts with "app" (e.g., `appXXXXXXXXXXXX`)

## Configuration in n8n

### 1. Add Credentials

1. In n8n, go to the **Credentials** tab
2. Click **Add Credential**
3. Select "Airtable API"
4. Enter your API key
5. Save the credential

### 2. Configure the RoundRobin Node

#### Store Mode

1. Add a RoundRobin node to your workflow
2. Set **Mode** to "Store"
3. Enter your **Airtable Base ID** and **Table Name**
4. Optionally, set a custom **Storage ID** if you want to share storage across multiple workflow instances
5. Set the **Number of Spots** (e.g., 3 for User, Assistant, System)
6. Configure the **Roles** with appropriate names, descriptions, and metadata
7. Set the **Input Message Field** to the field containing your message content
8. Set the **Spot Index** based on which role is sending the message

#### Retrieve Mode

1. Add a RoundRobin node to your workflow
2. Set **Mode** to "Retrieve"
3. Enter the same **Airtable Base ID**, **Table Name**, and **Storage ID** as your store node
4. Choose an **Output Format**:
   - **Array**: Simple array of messages
   - **Object**: Messages grouped by role 
   - **Conversation History**: Formatted for LLM input
5. If using **Conversation History**, select the appropriate **LLM Platform**
6. Configure system prompt options if needed

#### Clear Mode

1. Add a RoundRobin node to your workflow
2. Set **Mode** to "Clear"
3. Enter the same **Airtable Base ID**, **Table Name**, and **Storage ID** as your other nodes

## Example Workflows

### Basic Chatbot with OpenAI

**Workflow 1 (Store User Message)**:
```
HTTP Request → RoundRobin (store, spotIndex: 0, role: User)
```

**Workflow 2 (Generate Response)**:
```
HTTP Request → RoundRobin (retrieve, format: conversationHistory, platform: openai) → OpenAI → RoundRobin (store, spotIndex: 1, role: Assistant) → HTTP Response
```

### Multi-Turn Conversation with Memory

```
Webhook → 
Switch 
  - If first message: RoundRobin (clear) → Continue
  - Otherwise: Continue 
→ RoundRobin (store, spotIndex: 0, role: User) 
→ RoundRobin (retrieve, format: conversationHistory) 
→ OpenAI 
→ RoundRobin (store, spotIndex: 1, role: Assistant) 
→ HTTP Response
```

## Debugging Tips

If you encounter issues, check the following:

1. **Airtable Table Structure**: Ensure your table has all required fields with correct types
2. **API Key and Base ID**: Verify these are entered correctly
3. **Storage ID Consistency**: Make sure all nodes working with the same conversation use the same Storage ID
4. **Execution Logs**: Enable execution logs for detailed troubleshooting information

## Advanced Usage

### Working with Multiple Conversations

You can manage separate conversations by using different **Storage IDs**. For example:

- Use `customer_support_${userId}` for customer support conversations
- Use `content_creation_${projectId}` for content creation conversations

### Customizing Role Metadata

The **Roles** collection allows you to define rich persona information:

- **Color**: Visual identifier for the role
- **Tone**: Writing style (friendly, professional, etc.)
- **Expertise**: Areas of knowledge for this persona
- **System Prompt**: Role-specific instructions for AI models
- **Enabled**: Toggle to include/exclude specific roles 