import { INodeType } from 'n8n-workflow';
import { RoundRobin } from './nodes/RoundRobin/RoundRobin.node';

export { RoundRobin };

// Export the nodesInformation array containing our node
export const nodeClasses: INodeType[] = [
  new RoundRobin(),
]; 