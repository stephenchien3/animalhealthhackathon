/**
 * Sidebar navigation with links to Home, Summary, Database, and Map.
 * Collapsible to icon-only mode. Includes sign-out button in footer.
 */
import { NavLink, useLocation } from "react-router";
import { Home, BarChart3, Database, Map, Warehouse, LogOut, ShoppingCart, Wheat } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, SidebarSeparator,
} from "@/components/ui/sidebar";


const navItems = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/summary", label: "Summary", icon: BarChart3 },
  { to: "/database", label: "Database", icon: Database },
  { to: "/map", label: "Map", icon: Map },
  { to: "/marketplace", label: "Marketplace", icon: ShoppingCart },
  { to: "/farmerpage", label: "Farmer Portal", icon: Wheat },
];

export function AppSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Warehouse className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">CleanFeed</span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = item.to === "/dashboard"
                  ? location.pathname === "/dashboard"
                  : location.pathname.startsWith(item.to);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <NavLink to={item.to}>
                        <item.icon />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut()} tooltip="Sign Out">
              <LogOut />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
