export const ACTIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete"
};

export const METHOD_ACTION_MAP: Record<string, string> = {
  POST: ACTIONS.CREATE,
  GET: ACTIONS.READ,
  PUT: ACTIONS.UPDATE,
  PATCH: ACTIONS.UPDATE,
  DELETE: ACTIONS.DELETE
};