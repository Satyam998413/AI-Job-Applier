import styles from "./LogosStrip.module.css";

const brands = [
  "TechCrunch",
  "Product Hunt",
  "Hacker News",
  "The Verge",
  "Fast Company",
  "Wired",
  "Forbes",
];

export function LogosStrip() {
  const loop = [...brands, ...brands];
  return (
    <section className={styles.wrap} aria-label="As featured in">
      <p className={styles.caption}>
        Trusted by job seekers featured in
      </p>
      <div className={styles.track} aria-hidden>
        <div className={styles.row}>
          {loop.map((b, i) => (
            <span key={`${b}-${i}`} className={styles.brand}>
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
