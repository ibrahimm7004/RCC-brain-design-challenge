import React from 'react';

interface CardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, description, icon }) => {
  return (
    <div className="group rounded-xl p-6 shadow-md cursor-pointer
                    flex flex-col h-full w-full 
                    bg-white/80 border border-light-gray hover:border-sage
                    dark:bg-white/5 dark:border-white/10 dark:hover:border-white/30 dark:hover:bg-white/10
                    backdrop-blur-sm transition-all duration-300">
      <div className="flex items-center gap-4 flex-grow">
        <div className="rounded-lg p-2 transition-all
                      bg-light-gray text-charcoal
                      dark:bg-white/10 dark:text-white dark:group-hover:bg-white/20">
          {icon}
        </div>
        <div className="flex-grow">
          <h3 className="font-bold text-charcoal dark:text-off-white">{title}</h3>
          <p className="text-sm text-medium-gray dark:text-slate-400">{description}</p>
        </div>
      </div>
    </div>
  );
};