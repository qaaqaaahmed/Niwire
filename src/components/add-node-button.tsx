import { PlusIcon } from "lucide-react";
import { Button } from "./ui/button";
import { NodeSelector } from "./node-selector";
import { useState } from "react";

export const AddNodeButton = () => {
  const [open, setOpen] = useState(false);
  return (
    <NodeSelector open={open} setOpen={setOpen}>
      <Button
        size="icon"
        variant="outline"
        className="bg-background"
        onClick={() => setOpen(true)}
      >
        <PlusIcon className="size-4" />
      </Button>
    </NodeSelector>
  );
};
