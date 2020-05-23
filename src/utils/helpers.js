export const classnames = function (namesArray) {
  return namesArray
    .filter((v) => v != "")
    .join(" ")
    .trim();
};
