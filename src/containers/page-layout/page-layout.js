import React from "react";

import Navigation from "../../components/navigation/navigation.js";
import Footer from "../../components/footer/footer.js";

import { classnames } from "../../utils/helpers.js";

import styles from "./page.module.scss";

export default function PageLayout({
  children,
  className,
  innerClassName,
  noNavigation,
  noFooter,
  ...props
}) {
  return (
    <div className={classnames([styles.PageLayout, className])}>
      {!noNavigation && <Navigation />}
      <div
        className={classnames([
          "wrapper",
          styles.PageLayout__children,
          innerClassName,
        ])}
      >
        {children}
      </div>
      {!noFooter && <Footer />}
    </div>
  );
}
