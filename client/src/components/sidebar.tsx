import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Upload, 
  Bot, 
  TrendingUp, 
  FileText, 
  Settings,
  User
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'upload', label: 'Upload Data', icon: Upload },
    { id: 'insights', label: 'AI Reports', icon: Bot },
    { id: 'forecasts', label: 'Forecasts', icon: TrendingUp },
    { id: 'reports', label: 'Export Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="text-white text-sm" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">FinSight AI</h1>
            <p className="text-xs text-slate-500">Financial Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    activeTab === item.id 
                      ? 'sidebar-nav-active' 
                      : 'sidebar-nav-item'
                  }`}
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
            <User className="text-slate-600 text-sm" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">John Smith</p>
            <p className="text-xs text-slate-500">Financial Analyst</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
