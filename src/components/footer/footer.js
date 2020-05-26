import React, { useMemo } from "react";

import styles from "./footer.module.scss";

const QUOTES = [
  "Remember, you are awesome ❤️",
  "Build great stuff 👷‍♂️",
  "Got questions? Ask the 🍠",
  "🌶 Jalapeños are the worse!",
  "99% of the time things break it's a user error, the code is perfect 👌",
  "Are you thinking about food too? 🤤",
  "I need more ☕️",
];

export default function Footer() {
  const quote = useMemo(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)],
    []
  );

  return <p className={styles.Footer}>{quote}</p>;
}
