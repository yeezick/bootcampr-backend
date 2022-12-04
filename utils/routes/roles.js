/**
 * Checks if the title for this role type already exists
 * @param {object} project The project object to search
 * @param {string} roleType The type of role the title belongs to: "engineering", "design"
 * @param {*} roleTitle The title of the role to search for.
 * @returns boolean
 */
export const roleTitleExists = (project, roleType, newTitle) => {
  if (roleTypeExists(project, roleType)) {
    const listOfRoles = project.roles[roleType];
    for (const role of listOfRoles) {
      if (role.title === newTitle) return true;
    }
  }
  return false;
};

/**
 * Checks if this role type exists within the project
 * @param {object} project The project object to search
 * @param {string} roleType The type of role to search for: "engineering", "design"
 * @returns boolean
 */
export const roleTypeExists = (project, roleType) => {
  if (project.roles && roleType in project.roles) {
    return true;
  } else {
    return false;
  }
};
