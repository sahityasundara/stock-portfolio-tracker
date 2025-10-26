import React from 'react';
import { ChartBarIcon, CogIcon } from './icons';

interface HeaderProps {
    onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  return (
    <header className="bg-slate-850 shadow-md sticky top-0 z-20">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-cyan-400" />
            <h1 className="ml-3 text-2xl font-bold text-slate-100 tracking-tight">
            Stock Portfolio Tracker
            </h1>
        </div>
        <div className="flex items-center space-x-2">
            <button 
                onClick={onSettingsClick} 
                className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-100 transition-colors"
                aria-label="Settings"
            >
                <CogIcon className="h-6 w-6" />
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;