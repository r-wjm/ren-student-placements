import React from 'react';
import '../styles/MainHeader.css';
import logo from '../RCBadge.png';

function MainHeader() {
    return (
        <header className="app-header">
            <div className="logo-container">
                <img src={logo} alt="RC Badge" className="header-logo" />
            </div>
            <div className="title-container">
                <h1>School Placements</h1>
            </div>
        </header>
    );
}

export default MainHeader;
