// Copied from the dashboard's src/lib/oauthScopeLabels.ts. There, msg() marks
// a string for gt-next's dictionary and useMessages() reads the translation
// back; the port has no dictionary, so the label is the message itself.

import {
  WILDCARD_TOKEN_SCOPE,
  type OAuthScope,
} from '@/components/plate/lib/oauthProviderConfig';

const msg = (text: string) => text;

/** `gt:*` has no description: it renders as a single line on consent screens. */
export const OAUTH_SCOPE_LABELS: Record<
  OAuthScope,
  { label: string; description?: string }
> = {
  [WILDCARD_TOKEN_SCOPE]: {
    label: msg('Same access as your account in the dashboard'),
  },
  openid: {
    label: msg('Verify your identity'),
    description: msg(
      'Confirm which General Translation account you are using.'
    ),
  },
  profile: {
    label: msg('View your basic profile'),
    description: msg('View your name and profile information.'),
  },
  offline_access: {
    label: msg('Maintain access while you are away'),
    description: msg(
      'Stay connected after your current General Translation session ends.'
    ),
  },
  'org:projects:create': {
    label: msg('Create projects'),
    description: msg('Create projects in organizations you can manage.'),
  },
  'project:api_keys:write': {
    label: msg('Create project API keys'),
    description: msg(
      'Create API keys for projects where you can manage keys, limited to permissions you approve.'
    ),
  },
  'project:write': {
    label: msg('Manage project settings'),
    description: msg('Update project settings such as the default locale.'),
  },
  'project:context:read': {
    label: msg('View project context'),
    description: msg('Read context used to guide project translations.'),
  },
  'project:context:write': {
    label: msg('Manage project context'),
    description: msg('Create and update context used by project translations.'),
  },
  'project:files:read': {
    label: msg('View project files'),
    description: msg('View source content and download translated files.'),
  },
  'project:files:write': {
    label: msg('Manage project files'),
    description: msg('Upload and update source content in the project.'),
  },
  'project:translations:generate': {
    label: msg('Generate translations'),
    description: msg('Translate project content on demand.'),
  },
  'project:translations:enqueue': {
    label: msg('Queue translation jobs'),
    description: msg('Start background translation jobs for project files.'),
  },
};
