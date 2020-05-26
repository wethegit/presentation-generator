import React from "react";
import { NavLink } from "react-router-dom";

import useAuth from "../../hooks/use-auth";

import { classnames } from "../../utils/helpers";

import styles from "./navigation.module.scss";

const items = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
];

export default function Navigation() {
  const { signOut, user } = useAuth();

  return (
    <nav className={styles.Navigation}>
      <div className={classnames(["wrapper", styles.Navigation__wrapper])}>
        <ul className={styles.Navigation__list}>
          {items.map((item) => (
            <li className={styles.Navigation__item} key={item.label}>
              <NavLink to={item.href}>{item.label}</NavLink>
            </li>
          ))}
          {user.isAdmin && (
            <li className={styles.Navigation__item}>
              <NavLink to="/admin">Admin</NavLink>
            </li>
          )}
        </ul>
        <button className={styles.Navigation__signout} onClick={signOut}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
