export const toSkillsText = (skills?: string[]) => (skills ?? []).join(", ");

export const getItemId = (item: { id?: string; _id?: string }) =>
  item.id ?? item._id ?? "";
