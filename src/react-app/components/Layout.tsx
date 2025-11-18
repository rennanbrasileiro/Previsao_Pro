import { Building2, BarChart3, FileText, Settings, Download, DollarSign } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useState } from 'react';
import AlertsWidget from './AlertsWidget';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Previsões', href: '/previsoes', icon: FileText },
    { name: 'Pagamentos', href: '/pagamentos', icon: DollarSign },
    { name: 'Balancetes', href: '/balancetes', icon: Download },
    { name: 'Condomínios', href: '/condominios', icon: Building2 },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                PrevisãoPro
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-600">
                Sistema Completo de Previsão de Custos Condominiais e Balancetes
              </div>
              <AlertsWidget competenciaId={1} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <nav className="w-64 flex-shrink-0">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6">
              <ul className="space-y-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                            : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
