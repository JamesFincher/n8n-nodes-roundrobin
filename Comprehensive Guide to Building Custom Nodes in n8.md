<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# Comprehensive Guide to Building Custom Nodes in n8n

Before diving into the technical aspects of node building, it's important to understand that custom nodes in n8n allow you to extend the platform's capabilities by integrating with additional services or implementing custom functionality. This guide covers everything you need to know about creating custom nodes, from planning to implementation to sharing.

## Prerequisites for Node Building

To successfully build custom nodes for n8n, you should have:

- Basic knowledge of JavaScript and TypeScript
- Familiarity with your development environment, including git
- Understanding of npm package management
- Experience with n8n workflows, data structures, and item linking[^5]


## Planning Your Node

Before writing any code, proper planning will ensure your node is well-designed and maintainable. Consider:

- Which type of node you need to build
- Which node building approach best suits your needs
- The API you're integrating with (if applicable)


### Choosing Your Node Building Approach

n8n offers different approaches to node building:

1. **Programmatic style**: Traditional approach giving full control over execution flow
2. **Declarative style**: Simplified approach focusing on configuration rather than code

Your choice depends on the complexity of your integration and your familiarity with n8n's architecture.

## Node Building Fundamentals

### File Organization

A typical n8n node consists of several files:

- Main node file
- Credentials file (if connecting to external services)
- Description files
- Test files

Organizing these files properly enhances maintainability and readability.

### TypeScript Importance

All n8n code is written in TypeScript, which provides type safety and helps catch errors during development rather than at runtime[^3].

```typescript
// Example of TypeScript usage in node building
interface NodeParameters {
  resource: string;
  operation: string;
  id?: string;
}
```


## Node UI Elements

n8n provides a comprehensive set of UI components that can be configured using JSON to create intuitive interfaces for your nodes[^2][^6].

### String Fields

Basic string input fields are fundamental UI elements:

```typescript
{
  displayName: 'Name',
  name: 'name',
  type: 'string',
  default: '',
  placeholder: 'Enter your name',
  description: 'The name of the user',
}
```

For password input, you can use:

```typescript
{
  displayName: 'Password',
  name: 'password',
  type: 'string',
  typeOptions: {
    password: true,
  },
  default: '',
}
```

For multi-line text, you can configure:

```typescript
{
  displayName: 'Description',
  name: 'description',
  type: 'string',
  typeOptions: {
    rows: 4,
  },
  default: '',
}
```


### Support for Drag and Drop

To enable field mapping via drag and drop, add the requiresDataPath option:

```typescript
{
  // For single string
  requiresDataPath: 'single'
  
  // For comma-separated lists
  requiresDataPath: 'multiple'
}
```


### Numeric Fields

For numeric input:

```typescript
{
  displayName: 'Quantity',
  name: 'quantity',
  type: 'number',
  default: 1,
  description: 'Number of items to process',
}
```


### Boolean Toggle

For true/false options:

```typescript
{
  displayName: 'Active',
  name: 'active',
  type: 'boolean',
  default: true,
  description: 'Whether the user is active',
}
```


### Date and Time Selection

```typescript
{
  displayName: 'Start Date',
  name: 'startDate',
  type: 'dateTime',
  default: '',
  description: 'The start date of the event',
}
```


### Color Selector

```typescript
{
  displayName: 'Background Color',
  name: 'backgroundColor',
  type: 'color',
  default: '#ff0000',
}
```


### Options and Multi-Options

For single-selection dropdown:

```typescript
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  options: [
    {
      name: 'Active',
      value: 'active',
    },
    {
      name: 'Inactive',
      value: 'inactive',
    },
  ],
  default: 'active',
}
```

For multi-selection:

```typescript
{
  displayName: 'Categories',
  name: 'categories',
  type: 'multiOptions',
  options: [
    {
      name: 'Sales',
      value: 'sales',
    },
    {
      name: 'Marketing',
      value: 'marketing',
    },
  ],
  default: [],
}
```


### Collections and Fixed Collections

Collections allow optional fields:

```typescript
{
  displayName: 'Additional Fields',
  name: 'additionalFields',
  type: 'collection',
  placeholder: 'Add Field',
  default: {},
  options: [
    {
      displayName: 'Address',
      name: 'address',
      type: 'string',
      default: '',
    },
    {
      displayName: 'Phone',
      name: 'phone',
      type: 'string',
      default: '',
    },
  ],
}
```

Fixed collections group related fields:

```typescript
{
  displayName: 'Contact Information',
  name: 'contactInformation',
  type: 'fixedCollection',
  default: {},
  options: [
    {
      displayName: 'Primary Contact',
      name: 'primaryContact',
      values: [
        {
          displayName: 'Name',
          name: 'name',
          type: 'string',
          default: '',
        },
        {
          displayName: 'Email',
          name: 'email',
          type: 'string',
          default: '',
        },
      ],
    },
  ],
}
```


### Resource Locator

For finding specific resources in external services:

```typescript
{
  displayName: 'Card',
  name: 'card',
  type: 'resourceLocator',
  default: { mode: 'list', value: '' },
  modes: [
    {
      displayName: 'From List',
      name: 'list',
      type: 'list',
      placeholder: 'Select a card',
      typeOptions: {
        searchListMethod: 'searchCards',
        searchFilterRequired: true,
      },
    },
    {
      displayName: 'By ID',
      name: 'id',
      type: 'string',
      placeholder: 'Enter card ID',
    },
    {
      displayName: 'By URL',
      name: 'url',
      type: 'string',
      placeholder: 'Enter card URL',
    },
  ],
}
```


### Resource Mapper

For mapping and transforming data to match external service requirements:

```typescript
{
  displayName: 'Fields to Send',
  name: 'fieldsToSend',
  type: 'resourceMapper',
  default: {
    mappingMode: 'defineBelow',
    value: {},
  },
  typeOptions: {
    loadOptionsDependsOn: ['resource'],
    resourceMapper: {
      resourceMapperMethod: 'getFieldsToSend',
      mode: 'add',
    },
  },
}
```


### Filter Component

For evaluating or filtering data:

```typescript
{
  displayName: 'Conditions',
  name: 'conditions',
  type: 'filter',
  default: {},
  typeOptions: {
    // Filter configuration
  },
}
```


### JSON Editor

```typescript
{
  displayName: 'Data',
  name: 'data',
  type: 'json',
  default: '{}',
  description: 'The data to process in JSON format',
}
```


### HTML Editor

```typescript
{
  displayName: 'HTML',
  name: 'html',
  type: 'string',
  typeOptions: {
    editor: 'htmlEditor',
  },
  default: '<p>Hello World</p>',
}
```


### Notices and Hints

To provide guidance to users:

```typescript
{
  displayName: 'Notice',
  name: 'notice',
  type: 'notice',
  default: 'This is important information about using this node.',
}
```

You can add parameter hints:

```typescript
{
  displayName: 'API Key',
  name: 'apiKey',
  type: 'string',
  default: '',
  hint: 'You can find this in your account settings',
}
```

Or node hints:

```typescript
hints: {
  tip: [
    {
      title: 'Setting up credentials',
      content: 'To connect to the service, you need to create an API key...',
    },
  ],
}
```


## Code Standards and Best Practices

### Using the Linter

n8n provides a node linter to automatically check your node against coding standards. Always ensure your code passes these checks before publishing[^3].

### Resources and Operations Structure

When a node can perform multiple operations on different resources, standardize the parameter names:

```typescript
{
  displayName: 'Resource',
  name: 'resource',
  type: 'options',
  options: [
    {
      name: 'User',
      value: 'user',
    },
    {
      name: 'Order',
      value: 'order',
    },
  ],
  default: 'user',
}

{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['user'],
    },
  },
  options: [
    {
      name: 'Create',
      value: 'create',
    },
    {
      name: 'Get',
      value: 'get',
    },
  ],
  default: 'create',
}
```


### Parameter Name Reuse

For preserving user data when switching operations, reuse internal parameter names:

```typescript
// For 'Get' operation
{
  displayName: 'User ID',
  name: 'userId', // Same internal name
  type: 'string',
  default: '',
  displayOptions: {
    show: {
      operation: ['get'],
    },
  },
}

// For 'Delete' operation
{
  displayName: 'User ID',
  name: 'userId', // Same internal name
  type: 'string',
  default: '',
  displayOptions: {
    show: {
      operation: ['delete'],
    },
  },
}
```


### Data Handling in Programmatic Nodes

Never modify incoming data directly:

```typescript
// Incorrect
const items = this.getInputData();
items.forEach(item =&gt; {
  item.json.modified = true;
});

// Correct
const items = this.getInputData();
const newItems = items.map(item =&gt; {
  const newItem = {...item.json};
  newItem.modified = true;
  return {
    json: newItem,
    binary: item.binary,
  };
});
```


### Using Built-in Request Library

Avoid external dependencies for HTTP requests:

```typescript
// Recommended approach
import { IExecuteFunctions } from 'n8n-core';

export class MyNode implements IExecuteFunctions {
  async execute() {
    const response = await this.helpers.httpRequest({
      method: 'GET',
      url: 'https://example.com/api',
      headers: {
        'Authorization': `Bearer ${this.getCredentials('myCredentials')?.apiKey}`,
      },
    });
    
    return [this.helpers.returnJsonArray(response)];
  }
}
```


## Conclusion

Building custom nodes for n8n requires understanding various UI components, following code standards, and implementing best practices. By following this comprehensive guide, you can create high-quality nodes that extend n8n's functionality and integrate with external services seamlessly.

When designing your nodes, prioritize user experience with intuitive interfaces, clear documentation, and robust error handling. Test thoroughly before sharing, and consider contributing to the n8n community by publishing your nodes.

For more detailed information on specific topics, refer to the official n8n documentation or join the n8n community to connect with other node builders.

<div>⁂</div>

[^1]: https://docs.n8n.io/integrations/creating-nodes/build/reference/

[^2]: https://docs.n8n.io/integrations/creating-nodes/build/reference/ui-elements/

[^3]: https://docs.n8n.io/integrations/creating-nodes/build/reference/code-standards/

[^4]: https://docs.n8n.io/integrations/creating-nodes/build/reference/

[^5]: https://docs.n8n.io/integrations/creating-nodes/overview/

[^6]: https://docs.n8n.io/integrations/creating-nodes/build/reference/ui-elements/

[^7]: https://docs.n8n.io/integrations/creating-nodes/deploy/install-private-nodes/

[^8]: https://docs.n8n.io/integrations/creating-nodes/build/reference/code-standards/

[^9]: https://community.n8n.io/t/installing-custom-node/12547

[^10]: https://docs.n8n.io/integrations/creating-nodes/plan/node-types/

[^11]: https://community.n8n.io/t/issues-creating-custom-nodes/81250

[^12]: https://docs.n8n.io/integrations/creating-nodes/plan/choose-node-method/

[^13]: https://www.youtube.com/watch?v=nX_8OVhUVSY

[^14]: https://docs.n8n.io/integrations/creating-nodes/build/reference/paired-items/

[^15]: https://community.n8n.io/t/building-custom-nodes/58148

[^16]: https://docs.n8n.io/integrations/creating-nodes/build/reference/http-helpers/

[^17]: https://www.youtube.com/watch?v=OI6zHJ56eW0

[^18]: https://docs.n8n.io/integrations/creating-nodes/build/reference/node-codex-files/

[^19]: https://docs.n8n.io/integrations/creating-nodes/build/

[^20]: https://www.youtube.com/watch?v=bq4n0LsY2S8

[^21]: https://community.n8n.io/t/n8n-custom-node-tutorial/27144

