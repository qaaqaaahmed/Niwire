"use client";

import {
  EmptyEntity,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorState,
  LoadingState,
} from "@/components/entity-components";
import {
  useCreateWorkflow,
  useRemoveWorkflow,
  useSuspenseWorkflows,
} from "../hooks/use-workflows";
import { useRouter } from "next/navigation";
import { Workflow } from "../../../../generated/prisma/client";
import { formatDistanceToNow } from "date-fns";
import { WorkflowIcon } from "lucide-react";
import { useEntitySearch } from "../hooks/use-entity-search";
import { useWorkflowParams } from "../hooks/use-workflow-params";
import { inferRouterOutputs } from "@trpc/server";
import { trpc } from "@/trpc/server";
import { inferOutput } from "@trpc/tanstack-react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const WorkflowsHeader = () => {
  const createWorkflow = useCreateWorkflow();
  const router = useRouter();

  const handleCreateWorkflow = () => {
    createWorkflow.mutate(undefined, {
      onSuccess: (data) => {
        router.push(`/workflows/${data.id}`);
      },
      onError: () => {
        //
      },
    });
  };
  return (
    <EntityHeader
      title="Workflows"
      description="Create and manage workflows"
      buttonLabel="Create Workflow"
      onNew={handleCreateWorkflow}
      isCreating={createWorkflow.isPending}
      disabled={false}
    />
  );
};

export const WorkflowsList = () => {
  const workflows = useSuspenseWorkflows();

  return (
    <EntityList
      items={workflows.data.items}
      emptyView={<WorkflowsEmpty workflows={workflows.data} />}
      renderItem={(workflow) => <WorkflowItem data={workflow} />}
      getKey={(workflow) => workflow.id}
    />
  );
};

export const WorkflowItem = ({ data }: { data: Workflow }) => {
  const removeWorkflow = useRemoveWorkflow();

  const handleRemoveWorkflow = () => {
    removeWorkflow.mutate({ id: data.id });
  };

  return (
    <EntityItem
      href={`/workflows/${data.id}`}
      title={data.name}
      subtitle={
        <>
          Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
          &bull; Created{" "}
          {formatDistanceToNow(data.createdAt, { addSuffix: true })}
        </>
      }
      image={
        <div className="flex items-center justify-center size-8">
          <WorkflowIcon className="size-5 text-muted-foreground" />
        </div>
      }
      onRemove={handleRemoveWorkflow}
      isRemoving={removeWorkflow.isPending}
    />
  );
};

export const WorkflowsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<WorkflowsHeader />}
      search={<WorkflowsSearch />}
      pagination={
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <WorkflowsPagination />
          </Suspense>
        </ErrorBoundary>
      }
    >
      {children}
    </EntityContainer>
  );
};

export const WorkflowsSearch = () => {
  const [params, setParams] = useWorkflowParams();
  const { searchValue, onSearchValue } = useEntitySearch({ params, setParams });
  return (
    <EntitySearch
      placeholder="Search Workflows"
      value={searchValue}
      onValueChange={onSearchValue}
    />
  );
};

interface WorkflowsEmptyProps {
  workflows: inferOutput<typeof trpc.workflows.getMany>;
}

export const WorkflowsEmpty = ({ workflows }: WorkflowsEmptyProps) => {
  // for this component to be rendered, the items returned from the db based on the search and the params have to be zero
  // in that case.... we care about three cases:
  //  case 1: user did NOT TYPE ANYTHING and totalCount of the products for this user based on just the search was ZERO
  //  case 2: user typed SOMETHING but the totalCount of the products for this user based on just the search was ZERO
  // in the two cases above, we can understand that if totalCount is zero there can be a search or there can be no search:
  //              anything else means totalCount>0; Therefore👇👇
  //  case 3: which is the last case, at this point totalCount >  0 meaning some workflows were found in the db for the user
  //  so the only other option is the page > totalPages
  //         -- meaning they manually entered a page > totalPages but less than zod page.max validation, so in that case we use the params and just
  //set the page to the totalPages sent by the server

  const [params, setParams] = useWorkflowParams();
  const totalCount = workflows.totalCount;
  const createWorkflow = useCreateWorkflow();

  const page = workflows.page;
  const totalPages = workflows.totalPages;
  const search = workflows.search;

  const handleCreateWorkflow = () => {
    createWorkflow.mutate();
  };

  const handleGoback = () => {
    setParams({ ...params, page: totalPages });
  };

  if (totalCount === 0 && !search) {
    // meaning user didnt type a search, but still no results were found.... user has no workflows at all, cause empty search will return all workflows
    return (
      <EmptyEntity
        title="Hmmm how about you create your first workflow"
        message="You have not created any workflows. Please create workflow to enter the world of automations"
        action={{
          label: "Add Item",
          onClick: handleCreateWorkflow,
          disabled: createWorkflow.isPending,
        }}
      />
    );
  } else if (totalCount === 0 && search) {
    //meaning there was a search, but that search did not match any workflow they created
    return (
      <EmptyEntity
        title="No items found"
        message="We could not find items matching your search, please search for something else"
      />
    );
  } else if (page > totalPages) {
    // at this point we know total count was more than 0 because the above cases would catch them, so all we check is if page > totalPages
    // if page is less than total pages then totalCount of products is greater than 0 which means this empty component would not be rendered anyways
    const totalPagesMoreThanOne = totalPages > 1;
    return (
      <EmptyEntity
        title={`Page ${page} does not exist`}
        message={`There ${totalPagesMoreThanOne ? "are" : "is"} only ${totalPages} ${totalPagesMoreThanOne ? "pages" : "page"} `}
        action={{ label: "Go Back", onClick: handleGoback }}
      />
    );
  }
};

export const WorkflowsPagination = () => {
  const [params, setParams] = useWorkflowParams();
  const workflows = useSuspenseWorkflows();

  return (
    <EntityPagination
      page={workflows.data.page}
      totalPages={workflows.data.totalPages}
      onPageChange={(page) => setParams({ ...params, page })}
      isDisabled={workflows.isFetching}
      pageSize={workflows.data.pageSize}
      onPageSizeChange={(pageSize) =>
        setParams({ ...params, pageSize: pageSize, page: 1 })
      }
    />
  );
};

export const WorkflowsLoading = () => {
  return <LoadingState message="Loading... This may take a few seconds" />;
};

export const WorkflowsError = () => {
  return <ErrorState message="Something went wrong, please try again later" />;
};
