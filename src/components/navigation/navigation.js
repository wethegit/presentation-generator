import React from "react";
import { NavLink } from "react-router-dom";

import useAuth from "../../hooks/use-auth";

const items = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
];

export default function Navigation() {
  const { signOut, user } = useAuth();

  return (
    <>
      <nav>
        <ul>
          {items.map((item) => (
            <li key={item.label}>
              <NavLink to={item.href}>{item.label}</NavLink>
            </li>
          ))}
          {user.isAdmin && (
            <li>
              <NavLink to="/admin">Admin</NavLink>
            </li>
          )}
        </ul>
        <button onClick={signOut}>Sign out</button>
      </nav>
      <hr />
    </>
  );
}
