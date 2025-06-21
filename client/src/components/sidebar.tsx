import { Button } from "@/components/ui/button";
import { VTALogo } from "@/components/vta-logo";
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
    <aside className="w-64 bg-gradient-to-b from-[#0f0f23] via-[#1a1a2e] to-[#16213e] shadow-2xl border-r border-slate-800 flex flex-col">
      {/* VTA Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <VTALogo size="md" showText={true} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#00f3ff]/20 to-[#0066ff]/20 text-[#00f3ff] border-l-2 border-[#00f3ff] rounded-l-none' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
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
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#00f3ff] to-[#0066ff] rounded-full flex items-center justify-center">
            <User className="text-white text-sm" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Financial Analyst</p>
            <p className="text-xs text-slate-400">VTA Platform User</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
