/**
 * Domain types for the profile/CV brain (reasume_api schema).
 *
 * These represent the resolved shapes returned by apps/api-profile.
 * The database has no i18n JSONB fields — all text is plain.
 */

export type About = {
  bioShort: string | null;
  bioLong: string | null;
  targetRoles: string[];
  updatedAt: string;
};

export type Experience = {
  id: string;
  title: string;
  company: string;
  employmentType: string | null;
  location: string | null;
  locationType: string | null;
  description: string | null;
  achievements: string[];
  startDate: string;
  endDate: string | null;
  displayOrder: number;
};

export type Qualification = {
  id: string;
  title: string;
  issuer: string;
  type: string;
  description: string | null;
  credentialId: string | null;
  credentialUrl: string | null;
  issueDate: string;
  expiryDate: string | null;
  displayOrder: number;
};

export type Skill = {
  id: string;
  name: string;
  category: string;
  competencyLevel: string | null;
  yearsOfExperience: number | null;
  description: string | null;
  displayOrder: number;
};

export type ResumeProject = {
  id: string;
  title: string;
  type: string | null;
  status: string;
  description: string | null;
  highlights: string[];
  repoUrl: string | null;
  demoUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  displayOrder: number;
};
