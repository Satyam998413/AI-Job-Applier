import { Icon } from "@/components/Icon";
import type { AssistantMessageDto } from "@/types";
import styles from "./MessageBubble.module.css";

export function MessageBubble({ message }: { message: AssistantMessageDto }) {
  const isAssistant = message.role === "assistant";
  return (
    <div className={[styles.row, isAssistant ? styles.left : styles.right].join(" ")}>
      {isAssistant ? (
        <span className={styles.avatar} aria-hidden>
          <Icon name="sparkles" size={14} />
        </span>
      ) : null}
      <div className={[styles.bubble, isAssistant ? styles.assistant : styles.user].join(" ")}>
        <p className={styles.content}>{message.content}</p>
      </div>
    </div>
  );
}
