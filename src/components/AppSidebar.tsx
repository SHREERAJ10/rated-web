import * as React from "react";
import { NavLink } from "react-router-dom";
import {
  Bell,
  Home,
  LogOut,
  Plus,
  Search,
  User2,
  type LucideIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { CreatePost } from "./CreatePost";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import type { User } from "firebase/auth";
import { AuthContext } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fetchUser } from "@/api/user.api";
import { logout } from "@/utils/AuthHandlers";
import { toast } from "sonner";

export function NavIcon({
  icon: Icon,
  showDot,
}: {
  icon: LucideIcon;
  showDot?: boolean;
}) {
  return (
    <span className="relative shrink-0">
      <Icon className="size-5" strokeWidth={1.75} />
      {showDot && (
        <span className="absolute -right-1 -top-0.5 size-2 rounded-full bg-[#ff4343]" />
      )}
    </span>
  );
}

const linkColor = (active: boolean) =>
  active ? "text-[#1A1A1A]" : "text-[#666666]";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = React.useContext(AuthContext);
  const [hasNewNotifications, setHasNewNotifications] = React.useState(false);
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const { data: currUser } = useQuery({
    queryKey: ["user"],
    queryFn: () => fetchUser(user!),
    enabled: !!user,
  });

  const navItems = [
    { title: "Home", url: "/", icon: Home },
    { title: "Search", url: "/search", icon: Search },
    { title: "Notifications", url: "/notifications", icon: Bell, hasDot: true },
    { title: "Profile", url: `/${currUser?.username}`, icon: User2 },
  ];

  React.useEffect(() => {
    const hasNotifications = async (
      user: User,
      setHasNewNotifications: React.Dispatch<React.SetStateAction<boolean>>,
    ) => {
      const accessToken = await user.getIdToken();
      await fetchEventSource(
        `${import.meta.env.VITE_BASE_URL}/user/notification/status`,
        {
          method: "GET",
          headers: {
            "Content-Type": "text/event-stream",
            Authorization: `Bearer ${accessToken}`,
          },
          openWhenHidden: true,
          onmessage: (event) => {
            const data: { isNotificationRead: boolean } = JSON.parse(
              event.data,
            );
            setHasNewNotifications(!data.isNotificationRead);
          },
        },
      );
    };
    hasNotifications(user as User, setHasNewNotifications);
  }, []);

  return (
    <>
      {/* Desktop: collapsible sidebar */}
      <div className="hidden md:block">
        <Sidebar
          {...props}
          collapsible="icon"
          className="fixed inset-y-0 border-border-subtle **:data-[sidebar=sidebar]:bg-white"
        >
          <SidebarHeader
            className={`flex-row items-start justify-between p-6 ${
              collapsed ? "justify-center p-2" : ""
            }`}
          >
            {!collapsed && (
              <div>
                <span className="block text-2xl font-medium tracking-[-0.01em] text-[#1A1A1A]">
                  Rated
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#666666]/70">
                  Rate Stuff... Ig.
                </span>
              </div>
            )}
            <SidebarTrigger className="text-[#666666]" />
          </SidebarHeader>

          <SidebarContent className="px-3 pt-6 group-data-[collapsible=icon]:px-2">
            <SidebarMenu className="gap-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton className="h-11 w-full gap-4 rounded-xl p-0! text-base hover:bg-surface-warm group-data-[collapsible=icon]:p-0!">
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) => {
                        const active = isActive && item.url !== "#";
                        return `flex h-full w-full items-center gap-x-4 rounded-xl px-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 ${linkColor(active)} ${
                          active ? "bg-surface-warm font-medium" : ""
                        }`;
                      }}
                    >
                      <NavIcon
                        icon={item.icon}
                        showDot={item.hasDot && hasNewNotifications}
                      />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <CreatePost
                  dialogTrigger={
                    <SidebarMenuButton className="cursor-pointer flex h-11 w-full gap-4 rounded-xl px-2.5 text-base hover:bg-surface-warm group-data-[collapsible=icon]:p-2! group-data-[collapsible=icon]:justify-center">
                      <div className="w-full flex h-full items-center gap-x-4 rounded-full text-[#666666]">
                        <NavIcon icon={Plus} showDot={false} />
                        <span className="group-data-[collapsible=icon]:hidden">
                          Create Post
                        </span>
                      </div>
                    </SidebarMenuButton>
                  }
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="gap-4 border-t border-border-subtle p-4 group-data-[collapsible=icon]:p-2 ">
            <SidebarMenu className="gap-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="flex items-center px-3 h-11 w-full gap-4 rounded-xl text-base hover:bg-surface-warm group-data-[collapsible=icon]:p-1.5! text-[#666666]"
                  onClick={async () => {
                    try {
                      await logout();
                    } catch {
                      toast.error("Something went wrong!");
                    }
                  }}
                >
                  <NavIcon icon={LogOut} showDot={false} />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Logout
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      </div>

      {/* Mobile: bottom navigation */}
      <section className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around gap-x-6 border-t border-border-subtle bg-[#FDFDFB]/80 px-4 py-2 backdrop-blur-[20px] md:hidden">
        {navItems.map((item, i) => (
          <React.Fragment key={item.title}>
            {i === 2 && (
              <CreatePost
                dialogTrigger={
                  <button className="flex items-center">
                    <NavIcon icon={Plus} showDot={false} />
                  </button>
                }
              />
            )}
            <NavLink
              to={item.url}
              end
              aria-label={item.title}
              className={({ isActive }) =>
                `px-4 py-3 ${linkColor(isActive && item.url !== "#")}`
              }
            >
              <NavIcon
                icon={item.icon}
                showDot={item.hasDot && hasNewNotifications}
              />
            </NavLink>
          </React.Fragment>
        ))}
      </section>
    </>
  );
}
