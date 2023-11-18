function Button({ children, icon, small, ghost, ...props }) {
  const classes = ["btn"];

  if (icon) classes.push("btn-icon");
  if (ghost) classes.push("btn-ghost");
  if (small) classes.push("btn-small");

  return <button className={classes.join(" ")} {...props}>{children}</button>;
}

export default Button;
