"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeClasses = exports.RoundRobin = void 0;
const RoundRobin_node_1 = require("./nodes/RoundRobin/RoundRobin.node");
Object.defineProperty(exports, "RoundRobin", { enumerable: true, get: function () { return RoundRobin_node_1.RoundRobin; } });
// Export the nodesInformation array containing our node
exports.nodeClasses = [
    new RoundRobin_node_1.RoundRobin(),
];
//# sourceMappingURL=index.js.map