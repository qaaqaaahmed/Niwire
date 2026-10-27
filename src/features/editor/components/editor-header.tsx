"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  useSuspenseWorkflow,
  useUpdateWorkflowName,
} from "@/features/workflows/hooks/use-workflows";

import { SaveIcon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

export const EditorSave = () => {
  return (
    <div>
      <Button size="sm">
        <SaveIcon className="size-4" />
        Save
      </Button>
    </div>
  );
};

// export const EditorInput = ({ workflowId }: { workflowId: string }) => {
//   const [isEditing, setIsEditing] = useState(false);
//   const { data } = useSuspenseWorkflow({ workflowId });
//   const updateWorkflowName = useUpdateWorkflowName();
//   const [inputValue, setInputValue] = useState(data.name);

//   const inputRef = useRef<HTMLInputElement | null>(null);

//   const handleUpdateWorkflowName = () => {
//     const trimmedValue = inputValue.trim();
//     if (trimmedValue === data.name) {
//       setIsEditing(false);
//       return;
//     } else if (trimmedValue === "") {
//       setIsEditing(false);
//       return;
//     }
//     updateWorkflowName.mutate({ name: trimmedValue, workflowId });
//     setIsEditing(false);
//   };

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "Escape") {
//       setIsEditing(false);
//     } else if (e.key === "Enter") {
//       e.preventDefault();
//       handleUpdateWorkflowName();
//     }
//   };

//   useEffect(() => {
//     if (inputRef.current) {
//       inputRef.current.focus();
//       inputRef.current.select();
//     }
//   }, [isEditing]);

//   if (isEditing) {
//     return (
//       <Input
//         value={inputValue}
//         onChange={(e) => setInputValue(e.target.value)}
//         className="max-w-[200px]"
//         ref={inputRef}
//         onBlur={handleUpdateWorkflowName}
//         onKeyDown={handleKeyDown}
//       />
//     );
//   }
//   return (
//     <BreadcrumbPage
//       className="font-semibold hover:cursor-pointer"
//       onClick={() => {
//         setIsEditing(true);
//         setInputValue(data.name);
//       }}
//     >
//       {data.name}
//     </BreadcrumbPage>
//   );
// };

export const EditorInput = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflow({ workflowId });
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(workflow.name);
  const updateWorkflowName = useUpdateWorkflowName();

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSave = async () => {
    const trimmedLocalName = name.trim();
    const trimmedWorkflowName = workflow.name.trim();

    if (!trimmedLocalName) {
      setName(workflow.name);
      setIsEditing(false);
      return;
    }

    if (trimmedLocalName === trimmedWorkflowName) {
      setName(name.trim());
      setIsEditing(false);
      return;
    }

    try {
      await updateWorkflowName.mutateAsync({
        workflowId,
        name: trimmedLocalName,
      });
      // The try can’t move on until mutateAsync resolves, and mutateAsync doesn’t resolve until onSuccess finishes.
      // So by the time finally closes the input, the cache already has the new name. thats why we have to await the invalidategetone
      // otherwise the finally runs react rerenders with the cache having stale data and you have a flash of the old data for a second
    } catch {
      setName(workflow.name);
    } finally {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setName(workflow.name);
    }
  };

  useEffect(() => {
    if (inputRef.current && isEditing) {
      inputRef.current.select();
      inputRef.current.focus();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <Input
        value={name}
        ref={inputRef}
        onChange={(e) => setName(e.target.value)}
        className="h-7 max-w-[200px] w-auto text-muted-foreground "
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={updateWorkflowName.isPending}
      />
    );
  }

  return (
    <BreadcrumbPage
      onClick={() => setIsEditing(true)}
      className="hover:cursor-pointer"
    >
      {workflow.name || "Untitled"}
    </BreadcrumbPage>
  );
};
export const EditorHeader = ({ workflowId }: { workflowId: string }) => {
  return (
    <div className="flex  items-center h-14 px-4  border-b border-border w-full">
      <div className="flex items-center justify-between gap-x-8 w-full">
        <div className="flex items-center gap-x-4">
          <SidebarTrigger />

          <Breadcrumb>
            <BreadcrumbList className="flex-nowrap">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/workflows`} prefetch>
                    Workflows
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="mt-0.5" />
              <BreadcrumbItem>
                <EditorInput workflowId={workflowId} />
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <EditorSave />
      </div>
    </div>
  );
};

//
// so the server sends html, but that html inside it has the elemnts like body h1 p div ul,
// as well as two scritpts, one for the rsc payload which is seralized and tells react what the page should look like as per server,
//  and js files which the browser loads and in it it find react nextjs runtime, <as well as the js code needed>
