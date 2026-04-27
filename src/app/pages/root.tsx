import { Outlet, Link, useLocation } from 'react-router';
import { InventoryProvider } from '../context/inventory-context';
import { 
  LayoutDashboard, 
  Settings, 
  Edit, 
  ShoppingCart, 
  FileText,
  Package,
  RefreshCcw
} from 'lucide-react';

export default function Root() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/configuration', label: 'Configuration', icon: Settings },
    { path: '/manual-update', label: 'Manual Update', icon: Edit },
    { path: '/manifest-report', label: 'Manifest Report', icon: ShoppingCart },
    { path: '/inventory-report', label: 'Inventory Report', icon: FileText },
    { path: '/restore-inventory', label: 'Restore Inventory', icon: RefreshCcw },
  ];
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <InventoryProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Package className="size-8 text-blue-600" />
              <div>
                <h1 className="text-xl">Inventory Pro</h1>
                <p className="text-sm text-gray-500">Management System</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive(item.path)
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="size-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Inventory Management v1.0
            </p>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </InventoryProvider>
  );
}
