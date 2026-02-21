/**
 * Top header bar showing the current page title and corporation name.
 * Includes the sidebar toggle trigger for mobile.
 */
import { useLocation } from "react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useCorporation } from "@/hooks/useCorporation";

const pageTitles: Record<string, string> = {
  "/": "Home",
  "/summary": "Summary",
  "/database": "Database",
  "/map": "Map",
};

export default function Header() {
  const location = useLocation();
  const { data: corp } = useCorporation();
  const title = pageTitles[location.pathname] ?? "CleanFeed";

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-sm font-medium">{title}</h1>
        {corp?.name && (
          <span className="ml-auto text-sm text-muted-foreground">{corp.name}</span>
        )}
      </div>
    </header>
  );
}
