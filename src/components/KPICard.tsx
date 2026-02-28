import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number; // positive or negative percentage
  trendLabel?: string;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, icon: Icon, trend, trendLabel, className }) => {
  return (
    <div className={cn("bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-semibold text-gray-900">{value}</h3>
        </div>
        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
          <Icon size={20} />
        </div>
      </div>
      
      {trend !== undefined && (
        <div className="mt-4 flex items-center text-sm">
          <span className={cn("font-medium", trend >= 0 ? "text-emerald-600" : "text-red-600")}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
          <span className="text-gray-400 ml-2">{trendLabel || 'vs last month'}</span>
        </div>
      )}
    </div>
  );
};
