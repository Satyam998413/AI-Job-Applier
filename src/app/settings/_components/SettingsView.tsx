"use client";

import { useState, useEffect } from "react";
import { Reveal } from "@/components/Reveal";
import { TabLoader } from "@/components/TabLoader";
import { ProfileSection } from "./ProfileSection";
import { AiProvidersSection } from "./AiProvidersSection";
import { JsearchSection } from "./JsearchSection";
import { ConnectedEmailSection } from "./ConnectedEmailSection";
import { AutoApplyTab } from "./AutoApplyTab";
import { AiInterviewTab } from "./AiInterviewTab";
import { EmailTemplatesTab } from "./EmailTemplatesTab";
import { ResumeTab } from "./ResumeTab";
import styles from "./SettingsView.module.css";

type TabKey = "general" | "autoApply" | "resume" | "aiInterview" | "emailTemplates";

const TABS: { key: TabKey; label: string }[] = [
  { key: "general", label: "General" },
  { key: "autoApply", label: "Auto Apply" },
  { key: "resume", label: "Resume" },
  { key: "aiInterview", label: "AI Interview" },
  { key: "emailTemplates", label: "Email Templates" },
];

export function SettingsView() {
  const [active, setActive] = useState<TabKey>("general");
  const [loading, setLoading] = useState(false);

  // Show brief loader when switching tabs
  function handleTabChange(tab: TabKey) {
    setLoading(true);
    setActive(tab);
    // Hide loader after 300ms (allows content to render)
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [active]);

  return (
    <div className={styles.wrap}>
      <TabLoader visible={loading} />
      
      <Reveal>
        <header className={styles.header}>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>
            Manage your profile, automation, resumes, AI interviews, and email templates.
          </p>
        </header>
      </Reveal>

      <Reveal delay={60}>
        <nav className={styles.tabs} role="tablist" aria-label="Settings sections">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={active === t.key}
              className={active === t.key ? styles.tabActive : styles.tab}
              onClick={() => handleTabChange(t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </Reveal>

      {active === "general" && (
        <>
          <Reveal delay={120}><ProfileSection /></Reveal>
          <Reveal delay={180}><ConnectedEmailSection /></Reveal>
          <Reveal delay={240}><AiProvidersSection /></Reveal>
          <Reveal delay={300}><JsearchSection /></Reveal>
        </>
      )}

      {/* {active === "profile" && (
        <Reveal delay={120}><ProfileSettingsTab /></Reveal>
      )} */}

      {active === "aiInterview" && (
        <Reveal delay={120}><AiInterviewTab /></Reveal>
      )}

      {active === "autoApply" && (
        <Reveal delay={120}><AutoApplyTab /></Reveal>
      )}

      {active === "resume" && (
        <Reveal delay={120}><ResumeTab /></Reveal>
      )}


      {active === "emailTemplates" && (
        <Reveal delay={120}><EmailTemplatesTab /></Reveal>
      )}
    </div>
  );
}
