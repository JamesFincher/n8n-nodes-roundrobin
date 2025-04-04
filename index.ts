import { INodeType } from 'n8n-workflow';

import { RoundRobin } from './nodes/RoundRobin/RoundRobin.node';

export { RoundRobin };

// Export the nodes the package provides
export const nodeTypes = [
  {
    class: RoundRobin,
    description: {
      displayName: 'Round Robin',
      name: 'roundRobin',
      icon: 'file:nodes/RoundRobin/roundrobin.svg',
      group: ['transform'],
      version: 1,
      description: 'Store and retrieve messages in a round-robin fashion for LLM conversation loops',
    },
  }
]; 