import React from 'react';
import { Shield, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export function Header({ darkMode, setDarkMode }: HeaderProps) {
  return (
    <Card className="mb-8 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 text-white">
            <Shield size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              SecureWipe Pro
            </h1>
            <p className="text-sm text-muted-foreground">Professional Data Sanitization Tool</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">DEMO MODE</p>
            <p className="text-xs text-muted-foreground">Safe testing environment</p>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-full hover:bg-blue-100 dark:hover:bg-gray-700"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        </div>
      </div>
    </Card>
  );
}