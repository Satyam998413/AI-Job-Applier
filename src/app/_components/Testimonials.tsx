import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/Icon";
import styles from "./Testimonials.module.css";

type Story = {
  quote: string;
  name: string;
  role: string;
  initials: string;
  result: string;
};

const stories: Story[] = [
  {
    quote:
      "I went from sending 80 resumes a month with zero replies to four onsite loops in a fortnight. The match score told me which roles were actually worth my time.",
    name: "Priya Iyer",
    role: "Senior Engineer · Bengaluru",
    initials: "PI",
    result: "4 onsites in 14 days",
  },
  {
    quote:
      "The tailored resumes don't read like AI slop — they read like me, but the sharpest version of me. Three recruiters asked who wrote them.",
    name: "Marcus Chen",
    role: "Product Designer · Berlin",
    initials: "MC",
    result: "Offer in 3 weeks",
  },
  {
    quote:
      "I'd been laid off for six months and was running out of energy. This stopped me from spraying applications and made me focus on the ones I could actually win.",
    name: "Anna Kowalski",
    role: "Data Scientist · Warsaw",
    initials: "AK",
    result: "47% reply rate",
  },
];

export function Testimonials() {
  return (
    <section id="stories" className={styles.section}>
      <Reveal>
        <span className={styles.eyebrow}>Reader stories</span>
      </Reveal>
      <Reveal delay={80}>
        <h2 className={styles.heading}>
          Loved by people who&apos;d <span className={styles.gradient}>given up on job boards</span>
        </h2>
      </Reveal>

      <div className={styles.grid}>
        {stories.map((s, i) => (
          <Reveal key={s.name} delay={i * 100}>
            <article className={styles.card}>
              <span className={styles.quoteMark} aria-hidden>
                &ldquo;
              </span>
              <p className={styles.quote}>{s.quote}</p>
              <div className={styles.result}>
                <Icon name="check" size={14} />
                {s.result}
              </div>
              <footer className={styles.footer}>
                <span className={styles.avatar}>{s.initials}</span>
                <span className={styles.who}>
                  <span className={styles.name}>{s.name}</span>
                  <span className={styles.role}>{s.role}</span>
                </span>
              </footer>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
