"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { type AiProviderName } from "@/types";
import styles from "./ApiKeyHelpModal.module.css";

type ApiKeyGuide = {
  title: string;
  description: string;
  steps: string[];
  url: string;
  urlLabel: string;
};

const GUIDES: Record<AiProviderName, ApiKeyGuide> = {
  gemini: {
    title: "Google Gemini",
    description: "Get a free Gemini API key for resume parsing and AI matching.",
    steps: [
      "Visit https://aistudio.google.com/apikey",
      "Sign in with your Google account",
      "Click 'Create API key'",
      "Copy the key and paste it in the field above",
      "Free tier: 20 requests/day (gemini-2.5-flash model)",
    ],
    url: "https://aistudio.google.com/apikey",
    urlLabel: "Get Gemini API Key",
  },
  openai: {
    title: "OpenAI",
    description: "Use GPT-4o or GPT-4 Turbo for AI tasks (paid).",
    steps: [
      "Visit https://platform.openai.com/api/keys",
      "Sign in with your OpenAI account (create one if needed)",
      "Click 'Create new secret key'",
      "Copy the key (starts with sk-) and paste it above",
      "Add billing: https://platform.openai.com/account/billing/overview",
      "Pricing: ~$0.01-0.10 per request depending on model",
    ],
    url: "https://platform.openai.com/api/keys",
    urlLabel: "Get OpenAI API Key",
  },
  claude: {
    title: "Anthropic Claude",
    description: "Use Claude 3.x models for structured AI outputs (paid).",
    steps: [
      "Visit https://console.anthropic.com/keys",
      "Sign in with your account (create one if needed)",
      "Click 'Create Key'",
      "Copy the key (starts with sk-ant-) and paste it above",
      "Set up billing at https://console.anthropic.com/settings/billing",
      "Pricing: ~$0.003-0.03 per request depending on model",
    ],
    url: "https://console.anthropic.com/keys",
    urlLabel: "Get Claude API Key",
  },
  groq: {
    title: "Groq API",
    description: "Ultra-fast inference - FREE with unlimited requests!",
    steps: [
      "Visit https://console.groq.com/keys",
      "Sign in with your email (create account if needed)",
      "Click 'Create New API Key'",
      "Copy the key and paste it above",
      "FREE tier: Unlimited requests (truly free, no credit card needed)",
      "Perfect for: Development, testing, and production",
    ],
    url: "https://console.groq.com/keys",
    urlLabel: "Get Groq API Key (FREE)",
  },
  ollama: {
    title: "Ollama (Local)",
    description: "Run AI models locally on your machine - completely free.",
    steps: [
      "Visit https://ollama.ai and download",
      "Install for Mac, Windows, or Linux",
      "Open terminal and run: ollama run mistral",
      "Your app talks to http://localhost:11434 (no API key needed)",
      "Models available: mistral, llama2, neural-chat, and more",
      "No quota limits, no internet connection required (mostly)",
    ],
    url: "https://ollama.ai",
    urlLabel: "Download Ollama",
  },
};

export type ApiKeyHelpModalProps = {
  provider: AiProviderName;
  onClose: () => void;
};

export function ApiKeyHelpModal({ provider, onClose }: ApiKeyHelpModalProps) {
  const guide = GUIDES[provider];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>{guide.title}</h2>
          <Button variant="ghost" size="small" onClick={onClose}>
            ✕
          </Button>
        </header>

        <div className={styles.content}>
          <p className={styles.description}>{guide.description}</p>

          <div className={styles.steps}>
            <h3 className={styles.stepsTitle}>Steps to Get Your API Key:</h3>
            <ol className={styles.stepsList}>
              {guide.steps.map((step, i) => (
                <li key={i} className={styles.step}>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.actions}>
            <a
              href={guide.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              <Button>
                <Icon name="external" size={14} /> {guide.urlLabel}
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
