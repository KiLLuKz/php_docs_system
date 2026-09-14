import * as React from "react"
import { Avatar as BaseAvatar } from "@base-ui/react"
import { cn } from "../../lib/utils"

const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <BaseAvatar.Root
    ref={ref}
    className={cn(
      "relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-[#1c1c1e]",
      className
    )}
    {...props}
  />
))
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef(({ className, ...props }, ref) => (
  <BaseAvatar.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
))
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <BaseAvatar.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-zinc-800 text-white text-[10px] font-medium",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = "AvatarFallback"

const AvatarGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center -space-x-2 mr-3", className)}
    {...props}
  />
))
AvatarGroup.displayName = "AvatarGroup"

const AvatarGroupCount = React.forwardRef(({ className, ...props }, ref) => (
  <Avatar ref={ref} className={cn("bg-zinc-800 text-white", className)}>
    <AvatarFallback className="bg-zinc-800">{props.children}</AvatarFallback>
  </Avatar>
))
AvatarGroupCount.displayName = "AvatarGroupCount"

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount }
