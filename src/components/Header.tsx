import React from 'react';
import { PiggyBank } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <PiggyBank size={36} className="mr-3" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Financial Planner</h1>
              <p className="text-blue-100">Plan your retirement investment strategy</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;