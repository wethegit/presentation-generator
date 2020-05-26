import React from "react";

import { classnames } from "../../utils/helpers";

import styles from "./alert.module.scss";

export default function Alert({ type, children }) {
  return (
    <p className={classnames([styles.Alert, styles[`Alert--${type}`]])}>
      {children}
    </p>
  );
}
