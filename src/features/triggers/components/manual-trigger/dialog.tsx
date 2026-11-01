import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}
export const ManualTriggerDialog = ({ open, onOpenChange }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manual Trigger</DialogTitle>
          <DialogDescription>
            Configure settings for the manual trigger node
          </DialogDescription>
        </DialogHeader>

        <div className="text-sm text-muted-foreground py-4">
          Used to manually configure a workflow. No configuration available
        </div>
      </DialogContent>
    </Dialog>
  );
};
