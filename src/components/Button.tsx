import Link from "next/link";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "ghost";

type BaseProps = {
  variant?: Variant;
  fullWidth?: boolean;
  children: React.ReactNode;
};

type ButtonAsButton = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = BaseProps & { href: string };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", fullWidth, children } = props;
  const className = [styles.btn, styles[variant], fullWidth ? styles.fullWidth : ""]
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

  const { variant: _v, fullWidth: _f, children: _c, ...rest } = props as ButtonAsButton;
  return (
    <button className={className} {...rest}>
      {label}
    </button>
  );
}
