// The organization and project shapes the CLI wizard reads, as the
// dashboard's @generaltranslation/node AuthorizedOrg and AuthorizedProject
// types reduce to without Prisma: the columns the wizard lists, plus the
// fields the gallery's fixtures set so a fixture object typechecks as one.

/** Permission keys mapped to whether the account holds them. */
export type Permissions = Record<string, boolean | undefined>;

export type AuthorizedProject = {
  id: string;
  name: string;
  org_id: string;
  permissions: Permissions;
  settings: Record<string, string | number | boolean | null>;
};

export type AuthorizedOrg = {
  id: string;
  name: string;
  enterprise_id: string | null;
  preferred_ai_provider: string | null;
  billing_period: string | null;
  services: string[];
  serviceData: { services: Record<string, number> };
  permissions: Permissions;
  projects: AuthorizedProject[];
};
