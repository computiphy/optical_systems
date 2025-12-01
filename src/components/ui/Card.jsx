import React from 'react';

const Card = ({ children, className = '' }) => {
    return (
        <div className={`bg-sol-base2 dark:bg-black/80 backdrop-blur-sm p-6 rounded-lg shadow-md border border-sol-base1 dark:border-sol-orange/50 transition-colors duration-300 ${className}`}>
            {children}
        </div>
    );
};

export default Card;
