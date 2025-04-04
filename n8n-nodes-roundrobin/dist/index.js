"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeTypes = exports.RoundRobin = void 0;
const RoundRobin_node_1 = require("./nodes/RoundRobin/RoundRobin.node");
Object.defineProperty(exports, "RoundRobin", { enumerable: true, get: function () { return RoundRobin_node_1.RoundRobin; } });
exports.nodeTypes = [
    {
        class: RoundRobin_node_1.RoundRobin,
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
//# sourceMappingURL=index.js.map