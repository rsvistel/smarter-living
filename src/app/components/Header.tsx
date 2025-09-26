import { Bell, Menu } from "lucide-react";

export default function Header() {
  return (
    <div className="flex items-center justify-between gap-3 p-4 backdrop-blur-md fixed top-0 right-0 left-0 border-b border-neutral-900 z-1">
      <img
        alt=""
        src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        className="inline-block size-8 rounded-full ring-2 ring-gray-900 outline -outline-offset-1 outline-white/10"
      />
      <div className="flex gap-3">
        <Bell />
        <Menu />
      </div>
    </div>
  )
}