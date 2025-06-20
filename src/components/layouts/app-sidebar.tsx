"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "ui/sidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getStorageManager } from "lib/browser-stroage";
import { AppSidebarMenus } from "./app-sidebar-menus";
import { AppSidebarProjects } from "./app-sidebar-projects";
import { AppSidebarThreads } from "./app-sidebar-threads";
import { AppSidebarUser } from "./app-sidebar-user";
import { isShortcutEvent, Shortcuts } from "lib/keyboard-shortcuts";
import Image from "next/image";

const browserSidebarStorage = getStorageManager<boolean>("sidebar_state");

export function AppSidebar() {
  const { open, toggleSidebar } = useSidebar();
  // const { resolvedTheme } = useTheme();
  const router = useRouter();

  // persist sidebar state
  useEffect(() => {
    browserSidebarStorage.set(open);
  }, [open]);

  // global shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isShortcutEvent(e, Shortcuts.openNewChat)) {
        e.preventDefault();
        router.push("/");
        router.refresh();
      }
      if (isShortcutEvent(e, Shortcuts.toggleSidebar)) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, toggleSidebar]);

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <Link
          href={`/`}
          onClick={(e) => {
            e.preventDefault();
            router.push("/");
            router.refresh();
          }}
          className="flex items-center justify-center w-full text-black dark:text-white"
        >
          <Image
            src={"/brand/slyyyde-logo.png"}
            alt="Slyyyde AI"
            width={1000}
            height={1000}
            className="w-full  h-28 object-cover  text-black"
            priority
          />
        </Link>
        {/* <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-center py-4">
            <SidebarMenuButton asChild>
              <Link
                href={`/`}
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/");
                  router.refresh();
                }}
                className="flex items-center justify-center w-full"
              >
                <Image
                  src={"/brand/slyyyde-logo.png"}
                  alt="Slyyyde AI"
                  width={180}
                  height={90}
                  className="h-40 w-auto object-contain transition-transform hover:scale-105"
                  priority
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu> */}
      </SidebarHeader>

      <SidebarContent className="mt-6">
        <AppSidebarMenus isOpen={open} />
        <AppSidebarProjects />
        <AppSidebarThreads />
      </SidebarContent>

      <SidebarFooter className="flex flex-col items-stretch space-y-2">
        <AppSidebarUser />
      </SidebarFooter>
    </Sidebar>
  );
}
