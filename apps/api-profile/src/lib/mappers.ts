import type {
  About,
  Experience,
  Qualification,
  ResumeProject,
  Skill,
  Tables,
} from "@portfolio/shared-types/profile";

export function toAbout(row: Tables<"about">): About {
  return {
    bioShort: row.bio_short,
    bioLong: row.bio_long,
    targetRoles: row.target_roles,
    updatedAt: row.updated_at,
  };
}

export function toExperience(row: Tables<"v_experience">): Experience {
  return {
    id: String(row.id),
    title: row.title,
    company: row.company,
    employmentType: row.employment_type,
    location: row.location,
    locationType: row.location_type,
    description: row.description,
    achievements: row.achievements,
    startDate: row.start_date,
    endDate: row.end_date,
    displayOrder: row.display_order,
  };
}

export function toQualification(row: Tables<"v_qualifications">): Qualification {
  return {
    id: String(row.id),
    title: row.title,
    issuer: row.issuer,
    type: row.type,
    description: row.description,
    credentialId: row.credential_id,
    credentialUrl: row.credential_url,
    issueDate: row.issue_date,
    expiryDate: row.expiry_date,
    displayOrder: row.display_order,
  };
}

export function toSkill(row: Tables<"v_skills">): Skill {
  return {
    id: String(row.id),
    name: row.name,
    category: row.category,
    competencyLevel: row.competency_level,
    yearsOfExperience: row.years_of_experience,
    description: row.description,
    displayOrder: row.display_order,
  };
}

export function toResumeProject(row: Tables<"v_projects">): ResumeProject {
  return {
    id: String(row.id),
    title: row.title,
    type: row.type,
    status: row.status,
    description: row.description,
    highlights: row.highlights,
    repoUrl: row.repo_url,
    demoUrl: row.demo_url,
    startDate: row.start_date,
    endDate: row.end_date,
    displayOrder: row.display_order,
  };
}
