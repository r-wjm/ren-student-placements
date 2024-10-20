import React from 'react';
import { Link } from "react-router-dom";
import { IconData } from '../components/IconData';
import { getUserDetails } from '../API/Auth';
import '../styles/Navbar.css';
import { IconContext } from 'react-icons';

function Navbar() {
    let userRole = null;

    try {
        const userDetails = getUserDetails(); 
        userRole = userDetails.role; 
    } catch (error) {
        console.error('Error getting user details:', error.message);
    }

    return (
        <IconContext.Provider value={{ color: "#fff" }}>
            <nav className="nav-menu">
                <ul className="nav-menu-items">
                    {IconData.filter(item => item.title).map((item, index) => {
                
                        if (userRole === "Staff" && (item.title === "Placements" || item.title === "Support")) {
                            return (
                                <li key={index} className={item.cName}>
                                    <Link to={item.path}>
                                        {item.icon}
                                        <span>{item.title}</span>
                                    </Link>
                                </li>
                            );
                        }

                        if (userRole === "HQ" && item.title === "HQ") {
                            return (
                                <li key={index} className={item.cName}>
                                    <Link to={item.path}>
                                        {item.icon}
                                        <span>{item.title}</span>
                                    </Link>
                                </li>
                            );
                        }

                        return null;
                    })}
                </ul>
                <ul className="nav-menu-items">
                    <li className="nav-text">
                        <Link to={IconData.find(item => item.title === "LogOut").path}>
                            {IconData.find(item => item.title === "LogOut").icon}
                            <span>LogOut</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </IconContext.Provider>
    );
}

export default Navbar;
