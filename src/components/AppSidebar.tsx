import * as React from "react";
import { NavLink } from "react-router-dom";
import {
  Bell,
  Home,
  MoreHorizontal,
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

// Icon + new-notification dot. Used by desktop and mobile nav.
function NavIcon({
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

  const { data: currUser, isLoading } = useQuery({
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
      await fetchEventSource("http://localhost:3000/user/notification/status", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        onmessage: (event) => {
          console.log(event.data);
          const data: { isNotificationRead: boolean } = JSON.parse(event.data);
          setHasNewNotifications(!data.isNotificationRead);
        },
        onerror: (error) => {
          console.log(error);
        },
      });
    };
    hasNotifications(user, setHasNewNotifications);
  }, []);

  if (isLoading) return <div>Loading...</div>;

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
                  Creative curation
                </span>
              </div>
            )}
            <SidebarTrigger className="text-[#666666]" />
          </SidebarHeader>

          <SidebarContent className="px-3 pt-6">
            <SidebarMenu className="gap-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="h-11 gap-4 rounded-xl px-3 text-base hover:bg-surface-warm"
                  >
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) => {
                        const active = isActive && item.url !== "#";
                        return `flex items-center gap-x-4 w-full py-4 ${linkColor(active)} ${
                          active ? "bg-surface-warm font-medium" : ""
                        }`;
                      }}
                    >
                      <NavIcon
                        icon={item.icon}
                        showDot={item.hasDot && hasNewNotifications}
                      />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="gap-4 border-t border-border-subtle p-4">
            {!collapsed && <CreatePost />}

            <div
              className={`flex items-center gap-3 ${
                collapsed ? "justify-center" : "px-2"
              }`}
            >
              <img
                src={currUser?.pfpUrl}
                alt={currUser?.displayName}
                className="size-8 shrink-0 rounded-full object-cover"
              />
              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#1A1A1A]">
                      {currUser?.displayName}
                    </p>
                    <p className="truncate text-[13px] text-[#666666]/70">
                      @{currUser?.username}
                    </p>
                  </div>
                  <MoreHorizontal className="size-4 shrink-0 text-[#666666]" />
                </>
              )}
            </div>
          </SidebarFooter>
        </Sidebar>
      </div>

      {/* Mobile: bottom navigation */}
      <section className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-x-6 border-t border-border-subtle bg-[#FDFDFB]/80 px-4 py-2 backdrop-blur-[20px] md:hidden">
        {navItems.map((item, i) => (
          <React.Fragment key={item.title}>
            {i === 2 && <CreatePost view="mobile" />}
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
