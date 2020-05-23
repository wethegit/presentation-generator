import React from "react";

import { classnames } from "../../utils/helpers";

import styles from "./button.module.scss";

export default function Button({ tag, className, children, ...props }) {
  const Tag = "button";

  return (
    <Tag className={classnames([styles.Button, className])} {...props}>
      {children}
    </Tag>
  );
}
