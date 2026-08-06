import type { ApiPayloadValue, SearchFilter } from "@/types";

type ApiType = "string" | "array<string>" | "boolean" | "integer" | "number" | "object";

interface ParameterRule {
  apiKey: string | null;
  type: ApiType;
}

export interface MappedApolloPayload {
  normalizedParameters: Record<string, ApiPayloadValue>;
  payload: Record<string, ApiPayloadValue>;
  warnings: string[];
  errors: string[];
}

const PARAMETER_RULES: Record<string, ParameterRule> = {
  page: { apiKey: "page", type: "integer" },
  perPage: { apiKey: "per_page", type: "integer" },
  per_page: { apiKey: "per_page", type: "integer" },
  personTitles: { apiKey: "person_titles", type: "array<string>" },
  personSeniorities: { apiKey: "person_seniorities", type: "array<string>" },
  personLocations: { apiKey: "person_locations", type: "array<string>" },
  organizationLocations: { apiKey: "organization_locations", type: "array<string>" },
  organizationNumEmployeesRanges: { apiKey: "organization_num_employees_ranges", type: "array<string>" },
  organizationIds: { apiKey: "organization_ids", type: "array<string>" },
  qOrganizationDomainsList: { apiKey: "q_organization_domains_list", type: "array<string>" },
  contactEmailStatus: { apiKey: "contact_email_status", type: "array<string>" },
  emailStatus: { apiKey: "contact_email_status", type: "array<string>" },
  departments: { apiKey: "person_departments", type: "array<string>" },
  functions: { apiKey: "person_functions", type: "array<string>" },
  industries: { apiKey: "organization_industry_tag_ids", type: "array<string>" },
  technologies: { apiKey: "currently_using_any_of_technology_uids", type: "array<string>" },
  currentlyUsingAnyOfTechnologyUids: { apiKey: "currently_using_any_of_technology_uids", type: "array<string>" },
  currentlyUsingAllOfTechnologyUids: { apiKey: "currently_using_all_of_technology_uids", type: "array<string>" },
  qKeywords: { apiKey: "q_keywords", type: "string" },
  qOrganizationKeywordTags: { apiKey: "q_organization_keyword_tags", type: "array<string>" },
  includeSimilarTitles: { apiKey: "include_similar_titles", type: "boolean" },
  revenueRange: { apiKey: "revenue_range", type: "object" },
  organizationNumJobsRange: { apiKey: "organization_num_jobs_range", type: "object" },
  recommendationConfigId: { apiKey: null, type: "string" }
};

export class ApolloApiMapper {
  map(filters: SearchFilter[], overrides: Record<string, ApiPayloadValue> = {}): MappedApolloPayload {
    const warnings: string[] = [];
    const errors: string[] = [];
    const normalizedParameters: Record<string, ApiPayloadValue> = {};
    const payload: Record<string, ApiPayloadValue> = {};

    for (const filter of filters) {
      const bracket = this.extractBracketPath(filter.key);
      const rule = PARAMETER_RULES[bracket.base] ?? this.fallbackRule(filter);

      if (rule.apiKey === null) {
        warnings.push(`Ignored UI-only Apollo parameter: ${filter.key}`);
        continue;
      }

      const value = this.coerce(filter, rule.type);
      normalizedParameters[rule.apiKey] = value;

      if (bracket.child) {
        const current = payload[rule.apiKey];
        const objectValue = typeof current === "object" && current !== null && !Array.isArray(current) ? current as Record<string, string | number | boolean> : {};
        objectValue[bracket.child] = this.scalar(value);
        payload[rule.apiKey] = objectValue;
      } else {
        payload[rule.apiKey] = value;
      }

      this.validate(rule.apiKey, payload[rule.apiKey], rule.type, errors);
    }

    Object.assign(payload, overrides);
    Object.assign(normalizedParameters, overrides);
    for (const [key, value] of Object.entries(overrides)) {
      const type: ApiType = Number.isInteger(value) ? "integer" : typeof value === "number" ? "number" : typeof value === "boolean" ? "boolean" : Array.isArray(value) ? "array<string>" : "string";
      this.validate(key, value, type, errors);
    }

    return { normalizedParameters, payload, warnings, errors };
  }

  private fallbackRule(filter: SearchFilter): ParameterRule {
    return { apiKey: this.toSnakeCase(filter.key), type: filter.isArray ? "array<string>" : "string" };
  }

  private coerce(filter: SearchFilter, type: ApiType): ApiPayloadValue {
    switch (type) {
      case "array<string>":
        return filter.values;
      case "boolean":
        return /^(true|1|yes)$/i.test(filter.values[0] ?? "");
      case "integer":
        return Number.parseInt(filter.values[0] ?? "0", 10);
      case "number":
        return Number(filter.values[0] ?? 0);
      case "object":
        return filter.isArray ? filter.values : filter.values[0] ?? "";
      case "string":
      default:
        return filter.isArray ? filter.values : filter.values[0] ?? "";
    }
  }

  private validate(key: string, value: ApiPayloadValue, type: ApiType, errors: string[]): void {
    if (type === "array<string>" && (!Array.isArray(value) || value.some((item) => typeof item !== "string"))) {
      errors.push(`${key} requires an array of strings.`);
    }
    if (type === "integer" && (!Number.isInteger(value) || Number.isNaN(value))) {
      errors.push(`${key} requires an integer.`);
    }
    if (type === "number" && (typeof value !== "number" || Number.isNaN(value))) {
      errors.push(`${key} requires a number.`);
    }
    if (type === "boolean" && typeof value !== "boolean") {
      errors.push(`${key} requires a boolean.`);
    }
  }

  private scalar(value: ApiPayloadValue): string | number | boolean {
    return Array.isArray(value) ? String(value[0] ?? "") : typeof value === "object" ? JSON.stringify(value) : value;
  }

  private extractBracketPath(key: string): { base: string; child?: string } {
    const match = key.match(/^(.+)\[([^\]]+)\]$/);
    return match ? { base: match[1], child: match[2] } : { base: key };
  }

  private toSnakeCase(key: string): string {
    return key
      .replace(/\[\]$/, "")
      .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
      .replace(/[\s-]+/g, "_")
      .toLowerCase();
  }
}
