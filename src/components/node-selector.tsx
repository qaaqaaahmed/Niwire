import { GlobeIcon, MousePointerIcon } from "lucide-react";
import { NodeType } from "../../generated/prisma/enums";
import { createId } from "@paralleldrive/cuid2";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import Image from "next/image";
import { Separator } from "./ui/separator";
import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { toast } from "sonner";

type NodeTypeOptions = {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }> | string;
};

const triggerNodes: NodeTypeOptions[] = [
  {
    type: NodeType.MANUAL_TRIGGER,
    label: "Manual Trigger",
    description:
      "Runs the flow on clicking a button. Good for getting started quickly",
    icon: MousePointerIcon,
  },
];

const executionnodes: NodeTypeOptions[] = [
  {
    type: NodeType.HTTP_REQUEST,
    label: "HTTP Request",
    description: "Make a HTTP Request",
    icon: GlobeIcon,
  },
];

interface NodeSelectorProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  children: React.ReactNode;
}

export const NodeSelector = ({
  open,
  setOpen,
  children,
}: NodeSelectorProps) => {
  const { getNodes, setNodes, screenToFlowPosition } = useReactFlow();

  const handleNodeSelection = useCallback(
    (selection: NodeTypeOptions) => {
      const nodes = getNodes();
      if (selection.type === NodeType.MANUAL_TRIGGER) {
        // check if user has any manual triggers in the current nodes in the flow
        const hasManualTrigger = nodes.some(
          (node) => node.type === NodeType.MANUAL_TRIGGER,
        );
        if (hasManualTrigger) {
          toast.error("You can only select one manual trigger");
          return;
        }
      }

      setNodes((nodes) => {
        // if there is an initialNodeType, it means this is their first so we just remove all the nodes
        //and just return one node which is the new selection

        const hasInitialNodeType = nodes.some(
          (node) => node.type === NodeType.INITIAL,
        );

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const flowToPosition = screenToFlowPosition({
          x: centerX + (Math.random() - 0.5) * 200,
          y: centerY + (Math.random() - 0.5) * 200,
        });

        const newNode = {
          id: createId(),
          type: selection.type,
          position: flowToPosition,
          data: {},
        };

        if (hasInitialNodeType) {
          return [newNode];
        }
        return [...nodes, newNode];
      });
      setOpen(false);
    },

    [getNodes, setNodes, setOpen, screenToFlowPosition],
  );
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>What triggers this workflow</SheetTitle>
          <SheetDescription>
            A trigger is a step that starts your workflow
          </SheetDescription>
        </SheetHeader>

        <div>
          {triggerNodes.map((node) => {
            const Icon = node.icon;
            return (
              <div
                key={node.label}
                className="px-4 py-5 w-full h-auto border-l-2 hover:border-l-primary cursor-pointer justify-start"
                onClick={() => handleNodeSelection(node)}
              >
                <div className="flex items-center gap-6 overflow-hidden w-full">
                  {typeof Icon === "string" ? (
                    <Image src={Icon} alt={node.label} />
                  ) : (
                    <Icon className="size-5 object-contain rounded-sm" />
                  )}

                  <div className="flex flex-col text-left">
                    <p className="font-semibold">{node.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {node.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Separator className="space-y-4" />
        <div>
          {executionnodes.map((node) => {
            const Icon = node.icon;
            return (
              <div
                key={node.label}
                className="px-4 py-5 w-full h-auto border-l-2 hover:border-l-primary justify-start cursor-pointer"
                onClick={() => handleNodeSelection(node)}
              >
                <div className="flex items-center gap-6 w-full overflow-hidden">
                  {typeof Icon === "string" ? (
                    <Image src={Icon} alt={node.label} />
                  ) : (
                    <Icon />
                  )}

                  <div className="flex flex-col text-left">
                    <p className="font-semibold ">{node.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {node.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};
