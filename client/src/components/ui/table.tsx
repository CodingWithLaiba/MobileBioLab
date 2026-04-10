import React from "react"
import { cn } from "@/lib/utils"

/* Main Table */
export function Table({ className, ...props }: any) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn("w-full text-sm", className)} {...props} />
    </div>
  )
}

/* Table Parts */
export function TableHeader({ className, ...props }: any) {
  return <thead className={cn("border-b", className)} {...props} />
}

export function TableBody({ className, ...props }: any) {
  return <tbody className={className} {...props} />
}

export function TableRow({ className, ...props }: any) {
  return (
    <tr
      className={cn("border-b hover:bg-muted/50", className)}
      {...props}
    />
  )
}

export function TableHead({ className, ...props }: any) {
  return (
    <th
      className={cn("px-4 py-2 text-left text-muted-foreground", className)}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }: any) {
  return <td className={cn("px-4 py-2", className)} {...props} />
}
