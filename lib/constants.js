// The list of websites your boss can publish an article to.
// To add a new website later, just add another { value, label } entry here.
export const WEBSITE_TYPES = [
  { value: "job-hiring", label: "Job Hiring" },
  { value: "sanfiley", label: "Sanfiley" },
  { value: "hosppi-solution", label: "Hosppi Solution" },
  { value: "hosppi", label: "Hosppi" },
  { value: "eitech", label: "Eitech" },
];

export const WEBSITE_TYPE_MAP = Object.fromEntries(
  WEBSITE_TYPES.map((w) => [w.value, w.label])
);

export function websiteLabel(value) {
  return WEBSITE_TYPE_MAP[value] || value;
}

export const STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];
