import React from 'react';
import { ChartBarIcon, BookOpenIcon, HomeIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/solid';
// Fix: Import the centralized Page type from types.ts.
import { Page } from '../../types';

// Fix: Removed local Page type definition to avoid conflicts.

interface SidebarProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  currentPage: Page;
  isExpanded: boolean;
  setExpanded: (expanded: boolean) => void;
}

const NavItem: React.FC<{
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isExpanded: boolean;
}> = ({ icon: Icon, label, isActive, onClick, isExpanded }) => {
  const activeClass = isActive ? 'bg-brand-accent text-white' : 'text-brand-gray hover:bg-brand-light-blue hover:text-white';
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors duration-200 ${activeClass}`}
    >
      <Icon className="h-6 w-6 shrink-0" />
      <span className={`font-semibold whitespace-nowrap overflow-hidden transition-all duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
    </button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, onLogout, currentPage, isExpanded, setExpanded }) => {
  return (
    <aside 
        className={`bg-brand-dark-blue h-screen p-4 flex flex-col justify-between sticky top-0 transition-width duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20'}`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
    >
      <div>
        <div className="flex items-center space-x-3 h-10 mb-10 pl-1">
            <div className="bg-brand-dark flex-shrink-0 p-2 rounded-lg">
               <svg className="h-6 w-6 text-brand-profit" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
            </div>
            <h1 className={`text-2xl font-poppins font-bold text-white whitespace-nowrap overflow-hidden transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                BankRoLL
            </h1>
        </div>
        <nav className="space-y-2">
          <NavItem 
            icon={HomeIcon} 
            label="Dashboard" 
            isActive={currentPage === 'dashboard' || currentPage === 'day-journal'} 
            onClick={() => onNavigate('dashboard')}
            isExpanded={isExpanded} 
          />
          <NavItem 
            icon={BookOpenIcon} 
            label="Log Trade" 
            isActive={currentPage === 'journal'} 
            onClick={() => onNavigate('journal')}
            isExpanded={isExpanded} 
          />
          <NavItem 
            icon={ChartBarIcon} 
            label="Analytics" 
            isActive={currentPage === 'analytics'} 
            onClick={() => onNavigate('analytics')} 
            isExpanded={isExpanded}
          />
        </nav>
      </div>
      <div>
        <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-brand-gray hover:bg-brand-light-blue hover:text-white transition-colors duration-200"
        >
            <ArrowLeftOnRectangleIcon className="h-6 w-6 shrink-0" />
            <span className={`font-semibold whitespace-nowrap overflow-hidden transition-all duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>Logout</span>
        </button>
      </div>
    </aside>
  );
};