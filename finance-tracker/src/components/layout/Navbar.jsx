
// import React from 'react';
// import { Menu, Bell, User, PiggyBank } from 'lucide-react';
// import '../../styles/Navbar.css';
// import Community from '../NavComponents/Community';

// const NavItem = ({ text, active = false }) => (
//   <div className={`nav-item ${active ? 'active' : ''}`}>{text}</div>
// );

// const Navbar = ({ toggleSidebar }) => {
//   return (
//     <header className="navbar">
//       <div className="navbar-container">

//         {/* LEFT: toggle + logo */}
//         <div className="navbar-left">
//           <button className="menu-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
//             <Menu className="icon" />
//           </button>

//           <div className="logo">
//              <PiggyBank size={12} className="logo-icon" />
//              <span className="logo-text">MoniUp</span>
//           </div>

//         </div>

//         {/* CENTER: links */}
//         <nav className="nav-links" aria-label="Main navigation">
//           {/* <NavItem text="Home" /> */}
//           <NavItem text="Invest" />
//           <NavItem text="Learning" />
//           <NavItem text="Resources" />
//           <NavItem text="Community" to="/app/community" />
//         </nav>

//         {/* RIGHT: notifications + avatar */}
//         <div className="navbar-right">
//           <button className="icon-btn" aria-label="Notifications">
//             <Bell className="icon" />
//           </button>
//           <div className="avatar" title="Profile">
//             <User className="user-icon" />
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Navbar;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, User, PiggyBank } from 'lucide-react';
import '../../styles/Navbar.css'; 

const NavItem = ({ text, to, active = false }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    if (to) {
      navigate(to);
    }
  };

  if (to) {
    return (
      <a 
        href={to} 
        onClick={handleClick}
        className={`nav-item ${active ? 'active' : ''}`}
        style={{ cursor: 'pointer', textDecoration: 'none' }}
      >
        {text}
      </a>
    );
  }
  
  return (
    <div className={`nav-item ${active ? 'active' : ''}`}>
      {text}
    </div>
  );
};

const Navbar = ({ toggleSidebar }) => {
  return (
    <header className="navbar">
      <div className="navbar-container">

        {/* LEFT: toggle + logo */}
        <div className="navbar-left">
          <button className="menu-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
            <Menu className="icon" />
          </button>

          <div className="logo">
             <PiggyBank size={12} className="logo-icon" />
             <span className="logo-text">MoniUp</span>
          </div>

        </div>

        {/* CENTER: links */}
        <nav className="nav-links" aria-label="Main navigation">
          <NavItem text="Invest" to="/app/invest" />
          <NavItem text="Learning" to="/app/learning" />
          <NavItem text="Resources" to="/app/resources" />
          <NavItem text="Community" to="/app/community" />
        </nav>

        {/* RIGHT: notifications + avatar */}
        <div className="navbar-right">
          <button className="icon-btn" aria-label="Notifications">
            <Bell className="icon" />
          </button>
          <div className="avatar" title="Profile">
            <User className="user-icon" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;