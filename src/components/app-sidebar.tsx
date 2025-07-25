import * as React from "react"
import {
  Plus,
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"

const data = {
  navMain: [
    {
      title: "Add Media",
      url: "/add-media",
      icon: Plus,
      isActive: false,
      items: [],
    },
  ],
}

export function AppSidebar({ user, ...props }: { user: { name: string; email: string; avatar?: string } } & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex-1 text-left text-lg font-bold leading-tight truncate">Media Project</div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: user.name,
          email: user.email,
          avatar: user.avatar || "/avatars/default.jpg"
        }} />
      </SidebarFooter>
    </Sidebar>
  )
}
