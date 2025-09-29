import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Compass, User, BookOpen, Target, Home, CheckSquare, Briefcase, Users, GraduationCap, Building, Lock } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { User as UserEntity } from "@/entities/User";

const navigationItems = [
  { title: "Home", url: createPageUrl("Home"), icon: Home, stage: 0 },
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: Target, stage: 0 },
  { title: "Assessments", url: createPageUrl("Assessments"), icon: BookOpen, stage: 0 },
  { title: "My Profile", url: createPageUrl("Profile"), icon: User, stage: 0 },
  { title: "Career Match", url: createPageUrl("CareerRecommendations"), icon: Target, stage: 0 },
  { title: "Goals", url: createPageUrl("Goals"), icon: CheckSquare, stage: 0 },
  { title: "Portfolio", url: createPageUrl("Portfolio"), icon: Briefcase, stage: 0 },
  { title: "University Search", url: createPageUrl("UniversitySearch"), icon: GraduationCap, stage: 0 },
  { title: "Job Search", url: createPageUrl("JobSearch"), icon: Building, stage: 0 },
  { title: "Find a Mentor", url: createPageUrl("Mentors"), icon: Users, stage: 0 },
];

const NavItem = ({ item, isLocked, lockMessage }) => {
    const location = useLocation();
    const isActive = location.pathname === item.url;

    const buttonContent = (
        <SidebarMenuButton
            asChild
            className={`rounded-xl px-4 py-3 transition-all duration-200 w-full ${
                isActive ? 'text-white shadow-md' : 'text-gray-600'
            } ${isLocked ? 'cursor-not-allowed opacity-50' : 'hover:text-gray-900 hover:bg-gray-100'}`}
            style={isActive ? {backgroundColor: 'var(--sage)'} : {}}
        >
            <Link to={isLocked ? '#' : item.url} className="flex items-center gap-3">
                {isLocked ? <Lock className="w-5 h-5" /> : <item.icon className="w-5 h-5" />}
                <span className="font-medium">{item.title}</span>
            </Link>
        </SidebarMenuButton>
    );

    if (isLocked) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger className="w-full">{buttonContent}</TooltipTrigger>
                    <TooltipContent><p>{lockMessage}</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }
    return buttonContent;
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    UserEntity.me().then(setUser).catch(() => setUser(null));
  }, [location.pathname]);

  // Hide sidebar on home page
  if (location.pathname === createPageUrl("Home")) {
    return <div className="min-h-screen">{children}</div>;
  }

  const userStage = 0;

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --sage: #87A96B;
          --sage-dark: #6B8E4B;
          --cream: #FAF7F0;
          --coral: #F4A261;
          --charcoal: #2D3748;
        }
      `}</style>
      <div className="min-h-screen flex w-full" style={{backgroundColor: 'var(--cream)'}}>
        <Sidebar className="border-r border-gray-200">
          <SidebarHeader className="border-b border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--sage)'}}>
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl" style={{color: 'var(--charcoal)'}}>PathFinder</h2>
                <p className="text-sm text-gray-500">Discover Your Future</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-3">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <NavItem item={item} isLocked={false} lockMessage="" />
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold" style={{color: 'var(--charcoal)'}}>PathFinder</h1>
            </div>
          </header>
          
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}