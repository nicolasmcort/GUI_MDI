import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, CheckSquare, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      icon: Calendar,
      label: "Gestión de Tareas",
      path: "/tasks",
      active: location.pathname === "/tasks" || location.pathname === "/",
    },
    {
      icon: CheckSquare,
      label: "Análisis CPM",
      path: "/analysis",
      active: location.pathname === "/analysis",
    },
  ];

  return (
    <div className="lg:hidden">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="text-foreground"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile menu */}
      <div
        className={`fixed top-0 left-0 z-50 w-[280px] h-screen bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="h-[60px] border-b border-sidebar-border px-6 flex items-center justify-between">
          <div>
            <h1 className="text-sidebar-primary text-xl font-bold">
              TaskFlow Pro
            </h1>
            <p className="text-sidebar-foreground text-xs">
              Critical Path Management System
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-sidebar-foreground"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-sidebar-accent border-l-2 border-sidebar-primary text-sidebar-primary"
                      : "text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent/50"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-full border-t border-sidebar-border p-4">
          <div className="text-xs text-muted-foreground px-4">
            v.1.0 - Academic Edition
          </div>
        </div>
      </div>
    </div>
  );
}
