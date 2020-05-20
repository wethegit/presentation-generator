import React from "react";

import styles from "./page.module.scss";

export default function PageLayout({ children, ...props }) {
  return (
    <div className={styles.PageLayout} {...props}>
      {children}
    </div>
  );
}
