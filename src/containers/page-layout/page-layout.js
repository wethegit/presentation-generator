import React from "react";

import Navigation from "../../components/navigation/navigation.js";

import { classnames } from "../../utils/helpers.js";

import styles from "./page.module.scss";

export default function PageLayout({
  children,
  className,
  noNavigation,
  ...props
}) {
  return (
    <div className={classnames([styles.PageLayout, className])} {...props}>
      {!noNavigation && <Navigation />}
      {children}
    </div>
  );
}
