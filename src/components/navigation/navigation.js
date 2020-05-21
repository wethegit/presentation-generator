import React from "react";
import { NavLink } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

const items = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
];

export default function Navigation() {
  const { signOut } = useAuth();

  return (
    <>
      <nav>
        <ul>
          {items.map((item) => (
            <li key={item.label}>
              <NavLink to={item.href}>{item.label}</NavLink>
            </li>
          ))}
        </ul>
        <button onClick={signOut}>Sign out</button>
      </nav>
      <hr />
    </>
  );
}
