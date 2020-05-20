import React from "react";
import { NavLink } from "react-router-dom";

const items = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
];

export default function Navigation() {
  return (
    <nav>
      {items.map((item) => (
        <NavLink to={item.href} key={item.label}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
