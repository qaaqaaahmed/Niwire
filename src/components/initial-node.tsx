"use client";

import { PlusIcon } from "lucide-react";
import { PlaceholderNode } from "./react-flow/placeholder-node";
import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import { WorkflowNode } from "./workflow-node";
import { NodeSelector } from "./node-selector";

export const InitialNode = memo((props: NodeProps) => {
  const [openSidebar, setOpenSidebar] = useState(false);
  return (
    <NodeSelector open={openSidebar} setOpen={setOpenSidebar}>
      <WorkflowNode
        showToolbar
        name="Papi is live"
        description="Are you ready for papi? well put your hands together for papi"
      >
        <PlaceholderNode {...props} onClick={() => setOpenSidebar(true)}>
          <div className="flex items-center justify-center cursor-pointer">
            <PlusIcon className="size-4" />
          </div>
        </PlaceholderNode>
      </WorkflowNode>
    </NodeSelector>
  );
});

InitialNode.displayName = "InitialNode";
