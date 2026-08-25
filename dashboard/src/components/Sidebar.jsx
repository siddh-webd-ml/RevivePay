import {
  LayoutDashboard,
  Brain,
  Bot,
  ShieldCheck,
  Zap,
  BarChart3,
  ClipboardList,
  Circle
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {

  const navigation = [
    {
      label: "Overview",
      path: "/",
      icon: LayoutDashboard
    },
    {
      label: "ML Recovery Engine",
      path: "/ml",
      icon: Brain
    },
    {
      label: "AI Diagnosis",
      path: "/ai",
      icon: Bot
    },
    {
      label: "Policy Engine",
      path: "/policy",
      icon: ShieldCheck
    },
    {
      label: "Recovery Simulator",
      path: "/recovery",
      icon: Zap
    },
    {
      label: "Analytics",
      path: "/analytics",
      icon: BarChart3
    },
    {
      label: "Audit Trail",
      path: "/audit",
      icon: ClipboardList
    }
  ];

  return (
    <aside className="sidebar">

      <div className="brand">

        <div className="brand-icon">
          <Zap size={18} />
        </div>

        <div>
          <h1>RevivePay</h1>
          <span>AI Revenue Recovery</span>
        </div>

      </div>


      <nav>

        {navigation.map((item) => {

          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >

              <Icon size={16} />

              <span>
                {item.label}
              </span>

            </NavLink>
          );

        })}

      </nav>


      <div className="system-status">

        <Circle
          size={8}
          fill="currentColor"
        />

        <div>
          <strong>System Live</strong>

          <small>
            All services operational
          </small>
        </div>

      </div>

    </aside>
  );
}

export default Sidebar;