const PROFILE_COMPLETION_FIELDS = [
  "name",
  "email",
  "phone",
  "address",
  "bio",
  "expertise",
  "profile_picture",
];

export function calculateProfileCompletion(user) {
  const completedFields = PROFILE_COMPLETION_FIELDS.filter((field) => {
    const value = user?.[field];
    return value != null && String(value).trim() !== "";
  }).length;

  return Math.round((completedFields / PROFILE_COMPLETION_FIELDS.length) * 100);
}
