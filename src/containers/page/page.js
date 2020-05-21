import React from "react";

import Navigation from "../../components/navigation/navigation";

import styles from "./page.module.scss";

export default function PageLayout({ children, ...props }) {
  return (
    <div className={styles.PageLayout} {...props}>
      <Navigation />
      {children}
    </div>
  );
}
