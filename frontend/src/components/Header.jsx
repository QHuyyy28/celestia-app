import React from 'react';

export const Header = ({ title, subtitle }) => {
    return (
        <div className="bg-light py-4 mb-5">
            <div className="container">
                <h1 className="display-5 fw-bold mb-2">{title}</h1>
                {subtitle && <p className="text-muted lead">{subtitle}</p>}
            </div>
        </div>
    );
};