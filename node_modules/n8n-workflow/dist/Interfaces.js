"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeConnectionTypes = exports.NodeConnectionTypes = exports.Node = exports.ICredentialsHelper = exports.ICredentials = void 0;
class ICredentials {
    constructor(nodeCredentials, type, data) {
        this.id = nodeCredentials.id ?? undefined;
        this.name = nodeCredentials.name;
        this.type = type;
        this.data = data;
    }
}
exports.ICredentials = ICredentials;
class ICredentialsHelper {
}
exports.ICredentialsHelper = ICredentialsHelper;
class Node {
}
exports.Node = Node;
exports.NodeConnectionTypes = {
    AiAgent: 'ai_agent',
    AiChain: 'ai_chain',
    AiDocument: 'ai_document',
    AiEmbedding: 'ai_embedding',
    AiLanguageModel: 'ai_languageModel',
    AiMemory: 'ai_memory',
    AiOutputParser: 'ai_outputParser',
    AiRetriever: 'ai_retriever',
    AiTextSplitter: 'ai_textSplitter',
    AiTool: 'ai_tool',
    AiVectorStore: 'ai_vectorStore',
    Main: 'main',
};
exports.nodeConnectionTypes = [
    exports.NodeConnectionTypes.AiAgent,
    exports.NodeConnectionTypes.AiChain,
    exports.NodeConnectionTypes.AiDocument,
    exports.NodeConnectionTypes.AiEmbedding,
    exports.NodeConnectionTypes.AiLanguageModel,
    exports.NodeConnectionTypes.AiMemory,
    exports.NodeConnectionTypes.AiOutputParser,
    exports.NodeConnectionTypes.AiRetriever,
    exports.NodeConnectionTypes.AiTextSplitter,
    exports.NodeConnectionTypes.AiTool,
    exports.NodeConnectionTypes.AiVectorStore,
    exports.NodeConnectionTypes.Main,
];
//# sourceMappingURL=Interfaces.js.map