"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Icon, type IconName } from "@/components/Icon";
import styles from "./ArtifactCard.module.css";

/** Generic markdown artifact panel (copy + download). Used for tailored resume + cover letter. */
export function ArtifactCard({
  title,
  icon = "document",
  content,
  filenamePrefix,
  jobTitle,
}: {
  title: string;
  icon?: IconName;
  content: string;
  filenamePrefix: string;
  jobTitle: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function download() {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const slug = jobTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    a.href = url;
    a.download = `${filenamePrefix}-${slug || "job"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card>
      <div className={styles.head}>
        <h2 className={styles.title}>
          <Icon name={icon} size={18} /> {title}
        </h2>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={copy}>
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button variant="secondary" onClick={download}>
            Download
          </Button>
        </div>
      </div>
      <pre className={styles.content}>{content}</pre>
    </Card>
  );
}
