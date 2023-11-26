function Button({ children, icon, small, ghost, ...props }) {
  const classes = ["btn"];

  if (icon) classes.push("btn-icon");

  if (ghost) classes.push("btn-ghost");
  else classes.push("btn-solid");

  if (small) classes.push("btn-small");

  if (props.className) {
    classes.push(props.className);
  }

  return (
    <button {...props} className={classes.join(" ")}>
      {children}
    </button>
  );
}

export default Button;
