import { Connection, Node } from "../../generated/prisma/client";
import toposort from "toposort";

export const topologicalSort = (nodes: Node[], connections: Connection[]) => {
  const edges: [string, string][] = connections.map((connection) => [
    connection.fromNodeId,
    connection.toNodeId,
  ]);

  const nodeIds = nodes.map((node) => node.id);

  let sortedNodes: string[];

  try {
    sortedNodes = toposort.array(nodeIds, edges);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cyclic")) {
      throw new Error("Cyclic nodes detected");
    }
    throw error;
  }

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  return sortedNodes.map((nodeId) => {
    const node = nodeMap.get(nodeId);

    if (!node) throw new Error(`nodeId: ${nodeId} not found`);
    return node;
  });
};
