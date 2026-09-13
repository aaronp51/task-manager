import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  CheckCircle2,
  Settings,
  Plus,
  User,
} from 'lucide-react';
import '../stylesheets/Sidebar.css';

function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <CheckCircle2 size={22} />
        </div>

        <div>
          <h1>TaskManager</h1>
          <p>Manage your day</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          <p className="nav-section-title">WORKSPACE</p>

          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            <ListTodo size={20} />
            <span>My Tasks</span>
          </NavLink>
        </div>

        <div className="nav-section">
          <p className="nav-section-title">ORGANIZE</p>

          <NavLink
            to="/completed"
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            <CheckCircle2 size={20} />
            <span>Completed</span>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;