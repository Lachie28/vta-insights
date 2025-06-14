import { Button } from "@/components/ui/button";
import { 
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

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType | React.ReactNode;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <img src="/assets/logo.svg" alt="VTA Insights" className="w-4 h-4" /> },
    { id: 'upload', label: 'Upload Data', icon: Upload },
    { id: 'insights', label: 'AI Reports', icon: Bot },
    { id: 'forecasts', label: 'Forecasts', icon: TrendingUp },
    { id: 'reports', label: 'Export Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white shadow-md border-r border-border-color flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border-color">
        <div className="flex items-center space-x-4 bg-gradient-to-br from-primary-cyan via-secondary-blue to-accent-purple rounded-xl p-4">
          <div className="w-12 h-12">
            <img src="/assets/logo.svg" alt="VTA Insights logo" className="w-full h-full" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">VTA</h1>
            <p className="text-sm font-medium text-white">Financial Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 border-t border-border-color">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start px-4 py-3 rounded-lg transition-all duration-300 ${
                    activeTab === item.id 
                      ? 'bg-gradient-to-br from-secondary-blue to-accent-purple text-white' 
                      : 'text-text-primary hover:bg-gray-50'
                  }`}
                  onClick={() => onTabChange(item.id)}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  {typeof Icon === 'function' ? <Icon className="h-4 w-4" /> : Icon}
                  <span className="font-medium ml-3">{item.label}</span>
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
