import Link from "next/link";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "ghost";
type Size = "small" | "normal";

type BaseProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: React.ReactNode;
};

type ButtonAsButton = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = BaseProps & { href: string };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "normal", fullWidth, children } = props;
  const className = [styles.btn, styles[variant], size === "small" ? styles.small : "", fullWidth ? styles.fullWidth : ""]
    .filter(Boolean)
    .join(" ");

  const label = <span className={styles.label}>{children}</span>;

  if ("href" in props && props.href !== undefined) {
    return (
      <Link href={props.href} className={className}>
        {label}
      </Link>
    );
  }

  const { variant: _v, size: _s, fullWidth: _f, children: _c, ...rest } = props as ButtonAsButton;
  return (
    <button className={className} {...rest}>
      {label}
    </button>
  );
}
