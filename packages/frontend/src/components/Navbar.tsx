import { useState } from 'react';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import { Link } from 'react-router-dom'; // to navigate between pages
import './AdminStyle/nav.css';
import { IconContext } from 'react-icons';
import { NavData } from './NavData'; // contains the items for the navbar

function Navbar() {
  const [sidebar, setSidebar] = useState<boolean>(false);

  const showSidebar = (): void => setSidebar(!sidebar);

  return (
    <>
      <IconContext.Provider value={{ color: '#fff' }}>
        <div className="navbar">
          {/* Hamburger menu icon */}
          <Link to="#" className="menu-bars">
            <FaIcons.FaBars onClick={showSidebar} />
          </Link>
        </div>

        {/* Sidebar menu */}
        {/* If the sidebar is open (sidebar = true), apply the 'active' class to the sidebar for styling, else apply 'nav-menu' */}
        <nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
          <ul className="nav-menu-items" onClick={showSidebar}>
            <li className="navbar-toggle">
              <Link to="#" className="menu-bars">
                <AiIcons.AiOutlineClose />
              </Link>
            </li>

            {/* Loop through each item in the NavData array to render the main navbar items creating a link for each */}

            {NavData.map((item, index) => (
              <li key={index} className={item.cName}>
                <Link to={item.path} className="nav-item">
                  <div className="nav-icon">{item.icon}</div>
                  <div className="nav-text">{item.title}</div>
                </Link>
                {item.subItems && ( // if sub-items exist , render them
                  <ul className="sub-menu">
                    {item.subItems.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <Link to={subItem.path} className="nav-item">
                          <div className="nav-text">{subItem.title}</div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </IconContext.Provider>
    </>
  );
}

export default Navbar;
