"use client";

import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Download,
  FileText,
  ImageIcon,
  Loader2,
  Plus,
  Send,
  Trash2,
  Type
} from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";

type SectionType = "header" | "paragraph" | "form";
type LogoAlignment = "left" | "center" | "right";
type FieldType =
  | "text"
  | "number"
  | "email"
  | "password"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox";

type FormField = {
  id: string;
  type: FieldType;
  label: string;
  placeholder: string;
  required: boolean;
  options: string;
  min: string;
  max: string;
  minLength: string;
  maxLength: string;
  pattern: string;
};

type BaseSection = {
  id: string;
  type: SectionType;
};

type HeaderSection = BaseSection & {
  type: "header";
  title: string;
  subtitle: string;
  logoUrl: string;
  logoAlignment: LogoAlignment;
  logoSize: number;
};

type ParagraphSection = BaseSection & {
  type: "paragraph";
  heading: string;
  body: string;
};

type FormSection = BaseSection & {
  type: "form";
  title: string;
  description: string;
  submitLabel: string;
  fields: FormField[];
};

type BuilderSection = HeaderSection | ParagraphSection | FormSection;

type TelegramSettings = {
  enabled: boolean;
  botToken: string;
  chatId: string;
};

const fieldTypes: { value: FieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "email", label: "Email" },
  { value: "password", label: "Password" },
  { value: "textarea", label: "Textarea" },
  { value: "select", label: "Select dropdown" },
  { value: "radio", label: "Radio buttons" },
  { value: "checkbox", label: "Checkboxes" }
];

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const createField = (label = "New field", type: FieldType = "text"): FormField => ({
  id: makeId(),
  type,
  label,
  placeholder: "",
  required: false,
  options: "Option A, Option B, Option C",
  min: "",
  max: "",
  minLength: "",
  maxLength: "",
  pattern: ""
});

const initialSections: BuilderSection[] = [
  {
    id: makeId(),
    type: "header",
    title: "Customer Intake",
    subtitle: "Tell us what you need and our team will follow up.",
    logoUrl: "",
    logoAlignment: "center",
    logoSize: 96
  },
  {
    id: makeId(),
    type: "paragraph",
    heading: "Before you begin",
    body: "Please complete the form below with accurate contact details and any notes that help us understand your request."
  },
  {
    id: makeId(),
    type: "form",
    title: "Intake form",
    description: "Required fields are marked automatically by the browser.",
    submitLabel: "Send response",
    fields: [
      { ...createField("Name", "text"), placeholder: "Jane Smith", required: true },
      { ...createField("Phone", "number"), placeholder: "5551234567" },
      { ...createField("Notes", "textarea"), placeholder: "Share anything important..." }
    ]
  }
];

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const safeScriptJson = (value: unknown) =>
  JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");

const parseOptions = (options: string) =>
  options
    .split(",")
    .map((option) => option.trim())
    .filter(Boolean);

const clampLogoSize = (size: number) => Math.min(220, Math.max(40, Number.isFinite(size) ? size : 96));

const fieldName = (field: FormField) => `field-${field.id.replace(/[^a-zA-Z0-9_-]/g, "")}`;

const validationAttributes = (field: FormField) => {
  const attrs: string[] = [];

  if (field.required && field.type !== "checkbox") attrs.push("required");
  if (field.placeholder) attrs.push(`placeholder="${escapeHtml(field.placeholder)}"`);
  if (field.type === "number") {
    if (field.min) attrs.push(`min="${escapeHtml(field.min)}"`);
    if (field.max) attrs.push(`max="${escapeHtml(field.max)}"`);
  }
  if (["text", "email", "password", "textarea"].includes(field.type)) {
    if (field.minLength) attrs.push(`minlength="${escapeHtml(field.minLength)}"`);
    if (field.maxLength) attrs.push(`maxlength="${escapeHtml(field.maxLength)}"`);
    if (field.pattern) attrs.push(`pattern="${escapeHtml(field.pattern)}"`);
  }

  return attrs.join(" ");
};

const renderFieldHtml = (field: FormField) => {
  const name = fieldName(field);
  const label = escapeHtml(field.label || "Untitled field");
  const attrs = validationAttributes(field);
  const requiredMark = field.required ? '<span aria-hidden="true">*</span>' : "";

  if (field.type === "textarea") {
    return `<label class="field"><span>${label} ${requiredMark}</span><textarea name="${name}" ${attrs}></textarea></label>`;
  }

  if (field.type === "select") {
    const options = parseOptions(field.options);
    const renderedOptions = options
      .map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`)
      .join("");
    return `<label class="field"><span>${label} ${requiredMark}</span><select name="${name}" ${attrs}><option value="">Choose an option</option>${renderedOptions}</select></label>`;
  }

  if (field.type === "radio" || field.type === "checkbox") {
    const options = parseOptions(field.options);
    const renderedOptions = options
      .map((option, index) => {
        const optionId = `${name}-${index}`;
        const required = field.type === "radio" && field.required && index === 0 ? "required" : "";
        return `<label class="choice" for="${optionId}"><input id="${optionId}" type="${field.type}" name="${name}" value="${escapeHtml(option)}" ${required} /> <span>${escapeHtml(option)}</span></label>`;
      })
      .join("");
    const checkboxValidation =
      field.type === "checkbox" && field.required ? `data-required-checkbox="${name}"` : "";
    return `<fieldset class="field choice-group" ${checkboxValidation}><legend>${label} ${requiredMark}</legend>${renderedOptions}</fieldset>`;
  }

  return `<label class="field"><span>${label} ${requiredMark}</span><input type="${field.type}" name="${name}" ${attrs} /></label>`;
};

const buildStandaloneHtml = (sections: BuilderSection[], telegram: TelegramSettings) => {
  const formDefinitions = sections
    .filter((section): section is FormSection => section.type === "form")
    .map((section) => ({
      formId: `form-${section.id}`,
      title: section.title,
      fields: section.fields.map((field) => ({
        name: fieldName(field),
        label: field.label || "Untitled field",
        type: field.type
      }))
    }));

  const renderedSections = sections
    .map((section) => {
      if (section.type === "header") {
        const alignment = section.logoAlignment;
        const logo = section.logoUrl
          ? `<div class="logo-row ${alignment}"><img src="${escapeHtml(section.logoUrl)}" alt="Logo" style="max-width:${clampLogoSize(section.logoSize)}px" /></div>`
          : "";
        return `<section class="hero">${logo}<h1>${escapeHtml(section.title)}</h1><p>${escapeHtml(section.subtitle)}</p></section>`;
      }

      if (section.type === "paragraph") {
        return `<section class="card"><h2>${escapeHtml(section.heading)}</h2><p>${escapeHtml(section.body)}</p></section>`;
      }

      const fields = section.fields.map(renderFieldHtml).join("");
      const submitLabel = section.submitLabel || "Submit";
      return `<section class="card"><form data-builder-form-id="form-${section.id}" novalidate><div class="form-heading"><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.description)}</p></div>${fields}<button type="submit" data-submit-label="${escapeHtml(submitLabel)}">${escapeHtml(submitLabel)}</button><p class="form-status" role="status" aria-live="polite"></p></form></section>`;
    })
    .join("\n");

  const pageTitle =
    sections.find((section): section is HeaderSection => section.type === "header")?.title ||
    "Generated Page";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(pageTitle)}</title>
  <style>
    :root { color-scheme: light; --bg: #f4f7fb; --card: #ffffff; --text: #0f172a; --muted: #64748b; --primary: #2563eb; --primary-dark: #1d4ed8; --danger: #dc2626; --success: #15803d; --border: #dbe3ef; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: radial-gradient(circle at top, rgba(37, 99, 235, 0.18), transparent 30rem), var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.5; }
    main { width: min(920px, calc(100% - 32px)); margin: 0 auto; padding: 48px 0; }
    section { margin-bottom: 20px; }
    .hero, .card { background: rgba(255,255,255,0.94); border: 1px solid var(--border); border-radius: 28px; box-shadow: 0 24px 70px rgba(15, 23, 42, 0.08); padding: clamp(24px, 5vw, 48px); }
    .hero { text-align: center; }
    .hero h1 { margin: 16px 0 10px; font-size: clamp(2.25rem, 7vw, 4.8rem); letter-spacing: -0.07em; line-height: 0.95; }
    .hero p, .card p { color: var(--muted); font-size: 1.05rem; margin: 0; white-space: pre-wrap; }
    h2 { margin: 0 0 12px; font-size: clamp(1.5rem, 3vw, 2.25rem); letter-spacing: -0.04em; }
    .logo-row { display: flex; width: 100%; }
    .logo-row.left { justify-content: flex-start; }
    .logo-row.center { justify-content: center; }
    .logo-row.right { justify-content: flex-end; }
    .logo-row img { height: auto; border-radius: 18px; object-fit: contain; }
    form { display: grid; gap: 18px; }
    .form-heading { margin-bottom: 6px; }
    .field { display: grid; gap: 8px; font-weight: 650; }
    .field span span, legend span { color: var(--danger); }
    input, textarea, select { width: 100%; border: 1px solid var(--border); border-radius: 14px; background: #fff; color: var(--text); padding: 13px 14px; outline: none; transition: border-color 0.18s, box-shadow 0.18s; }
    textarea { min-height: 132px; resize: vertical; }
    input:focus, textarea:focus, select:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.14); }
    fieldset { border: 0; padding: 0; margin: 0; }
    legend { margin-bottom: 8px; font-weight: 650; }
    .choice-group { display: grid; gap: 10px; }
    .choice { display: flex; gap: 10px; align-items: center; color: var(--text); font-weight: 500; }
    .choice input { width: auto; }
    button { border: 0; border-radius: 999px; background: var(--primary); color: #fff; padding: 14px 20px; font-weight: 800; transition: background 0.18s, transform 0.18s; }
    button:hover { background: var(--primary-dark); transform: translateY(-1px); }
    button:disabled { opacity: 0.65; cursor: wait; transform: none; }
    .form-status { min-height: 1.5em; font-weight: 700; }
    .form-status.success { color: var(--success); }
    .form-status.error { color: var(--danger); }
    @media (max-width: 640px) { main { width: min(100% - 20px, 920px); padding: 20px 0; } .hero, .card { border-radius: 22px; padding: 24px; } }
  </style>
</head>
<body>
  <main>
${renderedSections}
  </main>
  <script>
    const TELEGRAM_ENABLED = ${telegram.enabled && telegram.botToken.trim() && telegram.chatId.trim() ? "true" : "false"};
    const TELEGRAM_BOT_TOKEN = ${safeScriptJson(telegram.botToken.trim())};
    const TELEGRAM_CHAT_ID = ${safeScriptJson(telegram.chatId.trim())};
    const FORM_DEFINITIONS = ${safeScriptJson(formDefinitions)};

    function valueForField(formData, field) {
      const allValues = formData.getAll(field.name).filter(Boolean);
      if (field.type === "checkbox") {
        return allValues.length ? allValues.join(", ") : "Not selected";
      }
      return allValues[0] ? String(allValues[0]) : "Not provided";
    }

    document.querySelectorAll("form[data-builder-form-id]").forEach((form) => {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const status = form.querySelector(".form-status");
        const button = form.querySelector("button[type='submit']");
        status.textContent = "";
        status.className = "form-status";

        if (!form.checkValidity()) {
          form.reportValidity();
          status.textContent = "Please fix the highlighted fields and try again.";
          status.classList.add("error");
          return;
        }

        const missingRequiredCheckbox = Array.from(form.querySelectorAll("[data-required-checkbox]"))
          .find((group) => !group.querySelector("input[type='checkbox']:checked"));
        if (missingRequiredCheckbox) {
          status.textContent = "Please select at least one required checkbox option.";
          status.classList.add("error");
          missingRequiredCheckbox.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }

        const definition = FORM_DEFINITIONS.find((item) => item.formId === form.dataset.builderFormId);
        const formData = new FormData(form);
        const lines = (definition?.fields || []).map((field) => field.label + ": " + valueForField(formData, field));
        const message = "New submission from " + document.title + "\\n\\n" + lines.join("\\n");

        button.disabled = true;
        button.textContent = "Sending...";

        try {
          if (TELEGRAM_ENABLED) {
            const response = await fetch("https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendMessage", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
            });
            if (!response.ok) {
              throw new Error("Telegram rejected the submission.");
            }
          }

          form.reset();
          status.textContent = TELEGRAM_ENABLED
            ? "Success! Thank you - your response was sent."
            : "Success! Thank you - your response was captured locally.";
          status.classList.add("success");
        } catch (error) {
          status.textContent = "We could not submit the form. Please try again.";
          status.classList.add("error");
        } finally {
          button.disabled = false;
          button.textContent = button.dataset.submitLabel || "Submit";
        }
      });
    });
  </script>
</body>
</html>`;
};

export default function Home() {
  const [sections, setSections] = useState<BuilderSection[]>(initialSections);
  const [telegram, setTelegram] = useState<TelegramSettings>({
    enabled: false,
    botToken: "",
    chatId: ""
  });
  const [testState, setTestState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });

  const sectionCount = sections.length;
  const fieldCount = useMemo(
    () =>
      sections.reduce(
        (count, section) => (section.type === "form" ? count + section.fields.length : count),
        0
      ),
    [sections]
  );

  const updateSection = <T extends BuilderSection>(id: string, updater: (section: T) => T) => {
    setSections((current) =>
      current.map((section) => (section.id === id ? updater(section as T) : section))
    );
  };

  const addSection = (type: SectionType) => {
    const section: BuilderSection =
      type === "header"
        ? {
            id: makeId(),
            type: "header",
            title: "New page title",
            subtitle: "Add a concise subtitle for visitors.",
            logoUrl: "",
            logoAlignment: "center",
            logoSize: 96
          }
        : type === "paragraph"
          ? {
              id: makeId(),
              type: "paragraph",
              heading: "Section heading",
              body: "Write supporting copy, instructions, or context for the page."
            }
          : {
              id: makeId(),
              type: "form",
              title: "Custom form",
              description: "Collect the information you need.",
              submitLabel: "Submit",
              fields: [createField("Email", "email")]
            };

    setSections((current) => [...current, section]);
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    setSections((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const deleteSection = (id: string) => {
    setSections((current) => current.filter((section) => section.id !== id));
  };

  const updateField = (sectionId: string, fieldId: string, updater: (field: FormField) => FormField) => {
    updateSection<FormSection>(sectionId, (section) => ({
      ...section,
      fields: section.fields.map((field) => (field.id === fieldId ? updater(field) : field))
    }));
  };

  const addField = (sectionId: string, type: FieldType = "text") => {
    updateSection<FormSection>(sectionId, (section) => ({
      ...section,
      fields: [...section.fields, createField("New field", type)]
    }));
  };

  const deleteField = (sectionId: string, fieldId: string) => {
    updateSection<FormSection>(sectionId, (section) => ({
      ...section,
      fields: section.fields.filter((field) => field.id !== fieldId)
    }));
  };

  const moveField = (sectionId: string, index: number, direction: -1 | 1) => {
    updateSection<FormSection>(sectionId, (section) => {
      const next = [...section.fields];
      const target = index + direction;
      if (target < 0 || target >= next.length) return section;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...section, fields: next };
    });
  };

  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>, sectionId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateSection<HeaderSection>(sectionId, (section) => ({
        ...section,
        logoUrl: String(reader.result || "")
      }));
    };
    reader.readAsDataURL(file);
  };

  const testTelegramConnection = async () => {
    if (!telegram.botToken.trim()) {
      setTestState({ status: "error", message: "Enter a Telegram bot token first." });
      return;
    }

    setTestState({ status: "loading", message: "Checking Telegram bot..." });
    try {
      const getMeResponse = await fetch(
        `https://api.telegram.org/bot${encodeURIComponent(telegram.botToken.trim())}/getMe`
      );
      const getMePayload = await getMeResponse.json();
      if (!getMeResponse.ok || !getMePayload.ok) {
        throw new Error("Telegram could not verify this bot token.");
      }

      if (telegram.chatId.trim()) {
        const chatResponse = await fetch(
          `https://api.telegram.org/bot${encodeURIComponent(telegram.botToken.trim())}/getChat?chat_id=${encodeURIComponent(
            telegram.chatId.trim()
          )}`
        );
        const chatPayload = await chatResponse.json();
        if (!chatResponse.ok || !chatPayload.ok) {
          throw new Error("The bot token works, but the chat ID could not be verified.");
        }
      }

      setTestState({
        status: "success",
        message: `Connected to @${getMePayload.result?.username || "your bot"}.`
      });
    } catch (error) {
      setTestState({
        status: "error",
        message: error instanceof Error ? error.message : "Telegram connection failed."
      });
    }
  };

  const downloadHtml = () => {
    const html = buildStandaloneHtml(sections, telegram);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "index.html";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-2xl shadow-slate-200/70 backdrop-blur md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                <FileText className="h-4 w-4" />
                Self-contained HTML export
              </div>
              <h1 className="max-w-3xl text-4xl font-black tracking-[-0.06em] text-slate-950 md:text-6xl">
                Page & Form Builder
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-slate-600">
                Build branded landing pages, compose dynamic forms, and download a single HTML
                file that can submit directly to Telegram without a backend.
              </p>
            </div>
            <div className="grid gap-3 rounded-3xl bg-slate-950 p-4 text-white sm:min-w-72">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Sections" value={sectionCount} />
                <Stat label="Fields" value={fieldCount} />
              </div>
              <button
                type="button"
                onClick={downloadHtml}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 py-3 font-black text-white transition hover:bg-blue-400"
              >
                <Download className="h-5 w-5" />
                Download HTML
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1fr_460px]">
          <section className="rounded-[2rem] border border-white/70 bg-white/70 p-4 shadow-xl shadow-slate-200/70 backdrop-blur sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-[-0.04em]">Live preview</h2>
                <p className="text-sm text-slate-500">This mirrors the structure of the export.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <AddSectionButton icon={<ImageIcon className="h-4 w-4" />} onClick={() => addSection("header")}>
                  Header
                </AddSectionButton>
                <AddSectionButton icon={<Type className="h-4 w-4" />} onClick={() => addSection("paragraph")}>
                  Text
                </AddSectionButton>
                <AddSectionButton icon={<FileText className="h-4 w-4" />} onClick={() => addSection("form")}>
                  Form
                </AddSectionButton>
              </div>
            </div>
            <div className="rounded-[1.75rem] bg-slate-100 p-3 sm:p-6">
              <div className="mx-auto max-w-3xl space-y-4">
                {sections.map((section) => (
                  <PreviewSection key={section.id} section={section} />
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <TelegramPanel
              telegram={telegram}
              setTelegram={setTelegram}
              testState={testState}
              onTest={testTelegramConnection}
            />
            {sections.map((section, index) => (
              <SectionEditor
                key={section.id}
                section={section}
                index={index}
                total={sections.length}
                onMove={moveSection}
                onDelete={deleteSection}
                onUpdate={updateSection}
                onLogoUpload={handleLogoUpload}
                onAddField={addField}
                onUpdateField={updateField}
                onDeleteField={deleteField}
                onMoveField={moveField}
              />
            ))}
          </aside>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <div className="text-2xl font-black">{value}</div>
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">{label}</div>
    </div>
  );
}

function AddSectionButton({
  children,
  icon,
  onClick
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
    >
      {icon}
      {children}
    </button>
  );
}

function PreviewSection({ section }: { section: BuilderSection }) {
  if (section.type === "header") {
    return (
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-7 text-center shadow-sm">
        {section.logoUrl ? (
          <div
            className={`mb-5 flex ${
              section.logoAlignment === "left"
                ? "justify-start"
                : section.logoAlignment === "right"
                  ? "justify-end"
                  : "justify-center"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={section.logoUrl}
              alt="Uploaded logo preview"
              className="h-auto rounded-2xl object-contain"
              style={{ maxWidth: clampLogoSize(section.logoSize) }}
            />
          </div>
        ) : null}
        <h2 className="text-4xl font-black tracking-[-0.06em] text-slate-950 md:text-5xl">
          {section.title}
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-slate-600">{section.subtitle}</p>
      </div>
    );
  }

  if (section.type === "paragraph") {
    return (
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-7 shadow-sm">
        <h3 className="text-2xl font-black tracking-[-0.04em]">{section.heading}</h3>
        <p className="mt-3 whitespace-pre-wrap text-slate-600">{section.body}</p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-7 shadow-sm">
      <h3 className="text-2xl font-black tracking-[-0.04em]">{section.title}</h3>
      <p className="mt-2 whitespace-pre-wrap text-slate-600">{section.description}</p>
      <div className="mt-6 grid gap-4">
        {section.fields.map((field) => (
          <PreviewField key={field.id} field={field} />
        ))}
        <button
          type="button"
          className="rounded-full bg-blue-600 px-5 py-3 font-black text-white"
        >
          {section.submitLabel || "Submit"}
        </button>
      </div>
    </div>
  );
}

function PreviewField({ field }: { field: FormField }) {
  const label = (
    <span className="text-sm font-black text-slate-800">
      {field.label || "Untitled field"} {field.required ? <span className="text-red-600">*</span> : null}
    </span>
  );
  const baseClass =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-500 outline-none";

  if (field.type === "textarea") {
    return (
      <label className="grid gap-2">
        {label}
        <textarea className={`${baseClass} min-h-28`} placeholder={field.placeholder} readOnly />
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label className="grid gap-2">
        {label}
        <select className={baseClass} defaultValue="">
          <option value="">Choose an option</option>
          {parseOptions(field.options).map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "radio" || field.type === "checkbox") {
    return (
      <fieldset className="grid gap-2">
        {label}
        <div className="grid gap-2">
          {parseOptions(field.options).map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input type={field.type} readOnly />
              {option}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <label className="grid gap-2">
      {label}
      <input className={baseClass} placeholder={field.placeholder} type={field.type} readOnly />
    </label>
  );
}

function TelegramPanel({
  telegram,
  setTelegram,
  testState,
  onTest
}: {
  telegram: TelegramSettings;
  setTelegram: React.Dispatch<React.SetStateAction<TelegramSettings>>;
  testState: { status: "idle" | "loading" | "success" | "error"; message: string };
  onTest: () => void;
}) {
  return (
    <section className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-slate-200/70 backdrop-blur">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
            <Send className="h-3.5 w-3.5" />
            Telegram
          </div>
          <h2 className="mt-3 text-xl font-black tracking-[-0.04em]">Integration settings</h2>
        </div>
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <input
            type="checkbox"
            checked={telegram.enabled}
            onChange={(event) =>
              setTelegram((current) => ({ ...current, enabled: event.target.checked }))
            }
          />
          Enabled
        </label>
      </div>
      <div className="grid gap-3">
        <Input
          label="Telegram Bot Token"
          value={telegram.botToken}
          onChange={(value) => setTelegram((current) => ({ ...current, botToken: value }))}
          placeholder="123456:ABC..."
          type="password"
        />
        <Input
          label="Telegram Chat ID"
          value={telegram.chatId}
          onChange={(value) => setTelegram((current) => ({ ...current, chatId: value }))}
          placeholder="-1001234567890"
        />
        <button
          type="button"
          onClick={onTest}
          disabled={testState.status === "loading"}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 font-black text-white transition hover:bg-slate-800 disabled:opacity-70"
        >
          {testState.status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Test Connection
        </button>
        {testState.message ? (
          <p
            className={`rounded-2xl px-3 py-2 text-sm font-bold ${
              testState.status === "success"
                ? "bg-emerald-50 text-emerald-700"
                : testState.status === "error"
                  ? "bg-red-50 text-red-700"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            {testState.message}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function SectionEditor({
  section,
  index,
  total,
  onMove,
  onDelete,
  onUpdate,
  onLogoUpload,
  onAddField,
  onUpdateField,
  onDeleteField,
  onMoveField
}: {
  section: BuilderSection;
  index: number;
  total: number;
  onMove: (index: number, direction: -1 | 1) => void;
  onDelete: (id: string) => void;
  onUpdate: <T extends BuilderSection>(id: string, updater: (section: T) => T) => void;
  onLogoUpload: (event: ChangeEvent<HTMLInputElement>, sectionId: string) => void;
  onAddField: (sectionId: string, type?: FieldType) => void;
  onUpdateField: (sectionId: string, fieldId: string, updater: (field: FormField) => FormField) => void;
  onDeleteField: (sectionId: string, fieldId: string) => void;
  onMoveField: (sectionId: string, index: number, direction: -1 | 1) => void;
}) {
  return (
    <section className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-slate-200/70 backdrop-blur">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            {section.type} section
          </p>
          <h3 className="mt-1 text-lg font-black tracking-[-0.04em]">Section {index + 1}</h3>
        </div>
        <div className="flex gap-1">
          <IconButton label="Move section up" disabled={index === 0} onClick={() => onMove(index, -1)}>
            <ArrowUp className="h-4 w-4" />
          </IconButton>
          <IconButton
            label="Move section down"
            disabled={index === total - 1}
            onClick={() => onMove(index, 1)}
          >
            <ArrowDown className="h-4 w-4" />
          </IconButton>
          <IconButton label="Delete section" onClick={() => onDelete(section.id)} destructive>
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      {section.type === "header" ? (
        <div className="grid gap-3">
          <Input
            label="Title"
            value={section.title}
            onChange={(value) =>
              onUpdate<HeaderSection>(section.id, (current) => ({ ...current, title: value }))
            }
          />
          <Textarea
            label="Subtitle"
            value={section.subtitle}
            onChange={(value) =>
              onUpdate<HeaderSection>(section.id, (current) => ({ ...current, subtitle: value }))
            }
          />
          <Input
            label="Logo URL"
            value={section.logoUrl}
            onChange={(value) =>
              onUpdate<HeaderSection>(section.id, (current) => ({ ...current, logoUrl: value }))
            }
            placeholder="https://example.com/logo.png"
          />
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Upload logo
            <input
              type="file"
              accept="image/*"
              onChange={(event) => onLogoUpload(event, section.id)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Alignment
              <select
                value={section.logoAlignment}
                onChange={(event) =>
                  onUpdate<HeaderSection>(section.id, (current) => ({
                    ...current,
                    logoAlignment: event.target.value as LogoAlignment
                  }))
                }
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </label>
            <Input
              label="Logo size (px)"
              type="number"
              value={String(section.logoSize)}
              onChange={(value) =>
                onUpdate<HeaderSection>(section.id, (current) => ({
                  ...current,
                  logoSize: clampLogoSize(Number(value))
                }))
              }
            />
          </div>
        </div>
      ) : null}

      {section.type === "paragraph" ? (
        <div className="grid gap-3">
          <Input
            label="Heading"
            value={section.heading}
            onChange={(value) =>
              onUpdate<ParagraphSection>(section.id, (current) => ({ ...current, heading: value }))
            }
          />
          <Textarea
            label="Body"
            value={section.body}
            onChange={(value) =>
              onUpdate<ParagraphSection>(section.id, (current) => ({ ...current, body: value }))
            }
          />
        </div>
      ) : null}

      {section.type === "form" ? (
        <div className="grid gap-4">
          <Input
            label="Form title"
            value={section.title}
            onChange={(value) =>
              onUpdate<FormSection>(section.id, (current) => ({ ...current, title: value }))
            }
          />
          <Textarea
            label="Description"
            value={section.description}
            onChange={(value) =>
              onUpdate<FormSection>(section.id, (current) => ({ ...current, description: value }))
            }
          />
          <Input
            label="Submit button label"
            value={section.submitLabel}
            onChange={(value) =>
              onUpdate<FormSection>(section.id, (current) => ({ ...current, submitLabel: value }))
            }
          />
          <div className="rounded-3xl bg-slate-50 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="font-black">Fields</h4>
              <FieldTypeSelector onAdd={(type) => onAddField(section.id, type)} />
            </div>
            <div className="grid gap-3">
              {section.fields.map((field, fieldIndex) => (
                <FieldEditor
                  key={field.id}
                  field={field}
                  index={fieldIndex}
                  total={section.fields.length}
                  onMove={(direction) => onMoveField(section.id, fieldIndex, direction)}
                  onDelete={() => onDeleteField(section.id, field.id)}
                  onUpdate={(updater) => onUpdateField(section.id, field.id, updater)}
                />
              ))}
              {section.fields.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm font-semibold text-slate-500">
                  Add at least one field to collect form data.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function FieldTypeSelector({ onAdd }: { onAdd: (type: FieldType) => void }) {
  const [type, setType] = useState<FieldType>("text");

  return (
    <div className="flex gap-2">
      <select
        value={type}
        onChange={(event) => setType(event.target.value as FieldType)}
        className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-bold"
      >
        {fieldTypes.map((fieldType) => (
          <option key={fieldType.value} value={fieldType.value}>
            {fieldType.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onAdd(type)}
        className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-2 text-sm font-black text-white transition hover:bg-blue-500"
      >
        <Plus className="h-4 w-4" />
        Add
      </button>
    </div>
  );
}

function FieldEditor({
  field,
  index,
  total,
  onMove,
  onDelete,
  onUpdate
}: {
  field: FormField;
  index: number;
  total: number;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
  onUpdate: (updater: (field: FormField) => FormField) => void;
}) {
  const supportsOptions = ["select", "radio", "checkbox"].includes(field.type);
  const supportsTextValidation = ["text", "email", "password", "textarea"].includes(field.type);
  const supportsNumberValidation = field.type === "number";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-950">{field.label || "Untitled field"}</p>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{field.type}</p>
        </div>
        <div className="flex gap-1">
          <IconButton label="Move field up" disabled={index === 0} onClick={() => onMove(-1)}>
            <ArrowUp className="h-4 w-4" />
          </IconButton>
          <IconButton label="Move field down" disabled={index === total - 1} onClick={() => onMove(1)}>
            <ArrowDown className="h-4 w-4" />
          </IconButton>
          <IconButton label="Delete field" onClick={onDelete} destructive>
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Label"
            value={field.label}
            onChange={(value) => onUpdate((current) => ({ ...current, label: value }))}
          />
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Type
            <select
              value={field.type}
              onChange={(event) =>
                onUpdate((current) => ({ ...current, type: event.target.value as FieldType }))
              }
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2"
            >
              {fieldTypes.map((fieldType) => (
                <option key={fieldType.value} value={fieldType.value}>
                  {fieldType.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {!supportsOptions ? (
          <Input
            label="Placeholder"
            value={field.placeholder}
            onChange={(value) => onUpdate((current) => ({ ...current, placeholder: value }))}
          />
        ) : null}
        {supportsOptions ? (
          <Textarea
            label="Options (comma-separated)"
            value={field.options}
            onChange={(value) => onUpdate((current) => ({ ...current, options: value }))}
          />
        ) : null}
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(event) => onUpdate((current) => ({ ...current, required: event.target.checked }))}
          />
          Required field
        </label>
        {supportsNumberValidation ? (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Min value"
              type="number"
              value={field.min}
              onChange={(value) => onUpdate((current) => ({ ...current, min: value }))}
            />
            <Input
              label="Max value"
              type="number"
              value={field.max}
              onChange={(value) => onUpdate((current) => ({ ...current, max: value }))}
            />
          </div>
        ) : null}
        {supportsTextValidation ? (
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Min length"
                type="number"
                value={field.minLength}
                onChange={(value) => onUpdate((current) => ({ ...current, minLength: value }))}
              />
              <Input
                label="Max length"
                type="number"
                value={field.maxLength}
                onChange={(value) => onUpdate((current) => ({ ...current, maxLength: value }))}
              />
            </div>
            <Input
              label="Pattern"
              value={field.pattern}
              onChange={(value) => onUpdate((current) => ({ ...current, pattern: value }))}
              placeholder="^[A-Za-z ]+$"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function IconButton({
  children,
  label,
  disabled,
  destructive,
  onClick
}: {
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl border p-2 transition disabled:cursor-not-allowed disabled:opacity-40 ${
        destructive
          ? "border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700"
      }`}
    >
      {children}
    </button>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-24 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}
