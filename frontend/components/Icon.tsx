import React from 'react';
import type { Theme } from '../App';

const AppIcon: React.FC<{ className?: string; theme: Theme }> = ({ className, theme }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 100 100"
        className={className}
    >
        {/* Background - Changes with theme */}
        <rect width="100" height="100" rx="20" fill={theme === 'dark' ? '#1E4620' : '#F0FFF4'}/>
        
        {/* Chat Bubble - Changes with theme for better contrast */}
        <path fill={theme === 'dark' ? '#4CAF50' : '#388E3C'} d="M84,20 H26 C22.7,20 20,22.7 20,26 V62 C20,65.3 22.7,68 26,68 H38 V78 L50,68 H84 C87.3,68 90,65.3 90,62 V26 C90,22.7 87.3,20 84,20 Z"/>

        {/* Wheat Sheaf - White */}
        <g stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(0, -2)">
            <path d="M55 70 V 40" />
            <path d="M55 60 C 70 55 70 45 55 40" />
            <path d="M55 60 C 40 55 40 45 55 40" />
            <path d="M55 50 C 65 47 65 42 55 40" />
            <path d="M55 50 C 45 47 45 42 55 40" />
        </g>
    </svg>
);

export default AppIcon;