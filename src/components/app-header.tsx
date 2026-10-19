import { SidebarTrigger } from "./ui/sidebar";

export const AppHeader = () => {
  return (
    <div className="bg-background flex items-center p-4 h-14 border-b">
      <SidebarTrigger />
    </div>
  );
};
