export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export class InputValidator {
  validateApolloPeopleUrl(value: string): ValidationResult {
    const trimmed = value.trim();
    if (!trimmed) {
      return { valid: false, message: "Paste an Apollo People Search URL before starting." };
    }

    let url: URL;
    try {
      url = new URL(trimmed);
    } catch {
      return { valid: false, message: "Enter a valid URL, including https://." };
    }

    if (url.protocol !== "https:") {
      return { valid: false, message: "Apollo URLs must use https." };
    }

    if (url.hostname !== "app.apollo.io") {
      return { valid: false, message: "Enter a URL from app.apollo.io." };
    }

    const hashPath = url.hash.replace(/^#/, "");
    if (!hashPath.startsWith("/people")) {
      return { valid: false, message: "Enter an Apollo People Search URL that starts with /#/people." };
    }

    return { valid: true };
  }

  validateApiKey(value: string | undefined, environmentKeyAvailable = false): ValidationResult {
    if (value?.trim() || environmentKeyAvailable) {
      return { valid: true };
    }
    return { valid: false, message: "API mode requires an Apollo API key or APOLLO_API_KEY in the environment." };
  }
}
