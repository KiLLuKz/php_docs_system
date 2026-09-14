import React from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from "./ui/sidebar"
import { 
  FileText, 
  UploadCloud, 
  UserCircle, 
  Users, 
  ShieldCheck, 
  LogOut, 
  Home, 
  ChevronsUpDown,
  History,
  LayoutDashboard,
  FolderTree,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu"

export function AppSidebar() {
  const { user, logout } = useAuth()
  const { isMobile, setOpenMobile, state } = useSidebar()
  const location = useLocation()
  const navigate = useNavigate()

  const isCollapsed = state === "collapsed" && !isMobile

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const generalMenuItems = [
    { path: '/dashboard', icon: FileText, label: 'คลังเอกสารของฉัน' },
    { path: '/manage', icon: UploadCloud, label: 'จัดการเอกสาร' },
    { path: '/profile', icon: UserCircle, label: 'ข้อมูลส่วนตัว' },
  ]

  const adminMenuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'แดชบอร์ด' },
    { path: '/admin/documents', icon: FileText, label: 'จัดการเอกสารทั้งหมด' },
    { path: '/admin/categories', icon: FolderTree, label: 'จัดการหมวดหมู่' },
    { path: '/admin/logs', icon: History, label: 'ประวัติดาวน์โหลด' },
    { path: '/admin/users', icon: Users, label: 'จัดการผู้ใช้งาน' }
  ]

  const profileImageUrl = user?.profile_image 
    ? `/api/uploads/profiles/${user.profile_image}`
    : null

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-white/10 bg-[#161617] text-white select-none">
      {/* Header */}
      <SidebarHeader className="border-b border-white/5 p-2">
        <div className={`flex h-12 w-full items-center ${isCollapsed ? 'justify-center px-0' : 'px-2 gap-3'}`}>
          <div className="flex aspect-square w-9 h-9 shrink-0 items-center justify-center rounded-xl bg-[#0066cc] text-white shadow-sm">
            <ShieldCheck size={20} />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col gap-0.5 leading-none min-w-0 flex-1 overflow-hidden">
              <span className="font-semibold text-[18px] tracking-tight text-white truncate">Docsys</span>
              <span className="text-[13px] text-white/50 truncate">Download System</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      {/* Content */}
      <SidebarContent className={`py-3 ${isCollapsed ? 'px-0' : 'px-2'}`}>
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-white/40 text-[12px] px-2.5 font-medium tracking-wider uppercase mb-1">
              เมนูหลัก
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {generalMenuItems.map((item) => {
                const isActive = location.pathname === item.path
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.path} className={isCollapsed ? 'flex justify-center w-full' : ''}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.label}
                      className={`h-11 rounded-xl transition-all ${
                        isCollapsed 
                          ? 'w-11 !p-0 justify-center mx-auto' 
                          : 'w-full px-3.5 gap-3.5 justify-start'
                      } ${
                        isActive 
                          ? '!bg-[#0066cc]/20 !text-[#2997ff] font-medium' 
                          : 'text-white/70 hover:!bg-white/5 hover:!text-white'
                      }`}
                    >
                      <NavLink 
                        to={item.path} 
                        onClick={handleLinkClick}
                        className={`flex items-center w-full h-full ${isCollapsed ? 'justify-center' : 'gap-3.5'}`}
                      >
                        <div className="flex items-center justify-center w-6 h-6 shrink-0">
                          <Icon className={`w-[22px] h-[22px] ${isActive ? 'text-[#2997ff]' : 'text-white/60'}`} />
                        </div>
                        {!isCollapsed && (
                          <span className="truncate text-[17px] leading-none pt-[2px]">{item.label}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.role === 'admin' && (
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-white/40 text-[12px] px-2.5 font-medium tracking-wider uppercase mb-1">
                ผู้ดูแลระบบ
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {adminMenuItems.map((item) => {
                  const isActive = location.pathname === item.path
                  const Icon = item.icon

                  return (
                    <SidebarMenuItem key={item.path} className={isCollapsed ? 'flex justify-center w-full' : ''}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive}
                        tooltip={item.label}
                        className={`h-11 rounded-xl transition-all ${
                          isCollapsed 
                            ? 'w-11 !p-0 justify-center mx-auto' 
                            : 'w-full px-3.5 gap-3.5 justify-start'
                        } ${
                          isActive 
                            ? '!bg-[#0066cc]/20 !text-[#2997ff] font-medium' 
                            : 'text-white/70 hover:!bg-white/5 hover:!text-white'
                        }`}
                      >
                        <NavLink 
                          to={item.path} 
                          onClick={handleLinkClick}
                          className={`flex items-center w-full h-full ${isCollapsed ? 'justify-center' : 'gap-3.5'}`}
                        >
                          <div className="flex items-center justify-center w-6 h-6 shrink-0">
                            <Icon className={`w-[22px] h-[22px] ${isActive ? 'text-[#2997ff]' : 'text-white/60'}`} />
                          </div>
                          {!isCollapsed && (
                            <span className="truncate text-[17px] leading-none pt-[2px]">{item.label}</span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem className={isCollapsed ? 'flex justify-center w-full' : ''}>
                <SidebarMenuButton 
                  asChild 
                  tooltip="กลับไปหน้าหลัก" 
                  className={`h-11 rounded-xl text-white/50 hover:!bg-white/5 hover:!text-white ${
                    isCollapsed 
                      ? 'w-11 !p-0 justify-center mx-auto' 
                      : 'w-full px-3.5 gap-3.5 justify-start'
                  }`}
                >
                  <NavLink 
                    to="/" 
                    onClick={handleLinkClick}
                    className={`flex items-center w-full h-full ${isCollapsed ? 'justify-center' : 'gap-3.5'}`}
                  >
                    <div className="flex items-center justify-center w-6 h-6 shrink-0">
                      <Home className="w-[22px] h-[22px] text-white/50" />
                    </div>
                    {!isCollapsed && (
                      <span className="truncate text-[17px] leading-none pt-[2px]">กลับไปหน้าหลัก</span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer - User Profile */}
      <SidebarFooter className={`border-t border-white/5 p-2 ${isCollapsed ? 'flex justify-center items-center' : ''}`}>
        <SidebarMenu className={isCollapsed ? 'w-full flex justify-center' : ''}>
          <SidebarMenuItem className={isCollapsed ? 'flex justify-center w-full' : ''}>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className={`h-12 rounded-xl text-white/80 hover:!bg-white/5 hover:!text-white data-[state=open]:bg-white/10 ${
                      isCollapsed 
                        ? 'w-11 !p-0 justify-center mx-auto' 
                        : 'w-full p-2'
                    }`}
                  />
                }
              >
                <div className="flex aspect-square w-9 h-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white overflow-hidden border border-white/10 shadow-sm">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt={user?.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="uppercase text-xs font-semibold">{user?.username?.substring(0, 2)}</span>
                  )}
                </div>
                {!isCollapsed && (
                  <>
                    <div className="grid flex-1 text-left leading-tight min-w-0 ml-2.5">
                      <span className="truncate font-medium text-white text-[15px]">{user?.full_name}</span>
                      <span className="truncate text-[12px] text-white/40 capitalize">{user?.role}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 text-white/40" />
                  </>
                )}
              </DropdownMenuTrigger>

              <DropdownMenuContent 
                side={isMobile ? "bottom" : (isCollapsed ? "right" : "top")} 
                align={isCollapsed ? "start" : "end"} 
                sideOffset={10}
                className="w-64 rounded-2xl border border-white/10 bg-[#1c1c1e] text-white shadow-2xl p-2 backdrop-blur-2xl"
              >
                <div className="p-2 font-normal">
                  <div className="flex items-center gap-3 text-left">
                    <div className="flex aspect-square w-10 h-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white overflow-hidden border border-white/10">
                      {profileImageUrl ? (
                        <img src={profileImageUrl} alt={user?.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="uppercase text-sm font-semibold">{user?.username?.substring(0, 2)}</span>
                      )}
                    </div>
                    <div className="grid flex-1 text-left leading-tight min-w-0">
                      <span className="truncate font-semibold text-white text-[15px]">{user?.full_name}</span>
                      <span className="truncate text-[13px] text-white/50">{user?.email || user?.username}</span>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-white/10 my-1" />
                <DropdownMenuItem asChild>
                  <NavLink 
                    to="/profile" 
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-3 py-2.5 w-full text-[15px] text-white/80 hover:text-white rounded-xl"
                  >
                    <UserCircle className="size-5 text-white/60" />
                    <span>ข้อมูลส่วนตัว</span>
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10 my-1" />
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  variant="destructive"
                  className="cursor-pointer rounded-xl text-red-400 hover:!bg-red-500/10 hover:!text-red-400 text-[15px] flex items-center gap-3 px-3 py-2.5"
                >
                  <LogOut className="size-5" />
                  <span>ออกจากระบบ</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Rail for dragging / clicking to toggle */}
      <SidebarRail />
    </Sidebar>
  )
}
