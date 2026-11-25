// Links that open GitHub with a ready-to-fill file (used by the private "+ Add" buttons).
import { site } from '../data/site';

const today = () => new Date().toISOString().slice(0, 10);
const newFile = (dir: string, filename: string, value: string) =>
  `https://github.com/${site.repo}/new/main/${dir}?filename=${encodeURIComponent(filename)}&value=${encodeURIComponent(value)}`;

export const templates = {
  project: () => `---
title: My Project
summary: One sentence about what it does.
year: ${new Date().getFullYear()}
role: Student developer
category: Other   # Web | AI | Networking | Mobile | Other
tech: [Python]
github: https://github.com/${site.repo.split('/')[0]}/
# desktopImage: /images/my-project.png
featured: true
order: 1
accent: burgundy   # burgundy | blue | espresso | mocha
---

## The idea
What is it and why did you build it?

## How I built it
The steps, tools and decisions.

## What I learned
`,
  course: (platform: string, provider: string) => `---
title: Course Name
platform: ${platform}
provider: ${provider}
completed: ${today()}
hours: 20
topics: [Topic one, Topic two]
# certificate: certificate-file-name   (without .md)
# link: https://
---
One or two sentences about what the course covered.
`,
  certificate: () => `---
title: Certificate Name
issuer: Who issued it
platform: cisco   # cisco | coursera | other
issued: ${today()}
credentialId: ABC-123
verifyUrl: https://
# image: /images/certs/my-certificate.jpg
skills: [Skill one, Skill two]
# course: course-file-name   (without .md)
---
`,
};

export const addUrl = {
  project: () => newFile('src/content/projects', 'my-project.md', templates.project()),
  cisco: () => newFile('src/content/courses', 'cisco-course-name.md', templates.course('cisco', 'Cisco Networking Academy')),
  coursera: () => newFile('src/content/courses', 'coursera-course-name.md', templates.course('coursera', 'University or company')),
  other: () => newFile('src/content/courses', 'course-name.md', templates.course('other', 'Platform name')),
  certificate: () => newFile('src/content/certificates', 'certificate-name.md', templates.certificate()),
  upload: (dir = 'public/images') => `https://github.com/${site.repo}/upload/main/${dir}`,
  editDetails: () => `https://github.com/${site.repo}/edit/main/src/data/site.ts`,
};
