import Project from '../models/project.js';
import User from '../models/user.js';
import Role from '../models/Role.js';
import { roleTitleExists, roleTypeExists } from '../utils/routes/roles.js';
import { respondWithError } from '../utils/routes/any.js';

// TODO: move to corresponding api handleer
/**
 * Create a new role within a given project.
 * @param {object} newRole  New role packaged as an object. Reference backend/models/projects for structure.
 * @param {string} roleType Define role as either "engineering" or "design".
 */
export const createRole = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { newRole, roleType } = req.body;

    // TODO: not ideal or scalable. Shoul be able to dynamically return all missing reqs.
    // TODO: potential to turn in to a reusable function to be used with any route
    if (!newRole) {
      respondWithError(res, 'Missing body requirements: newRole', 400);
      return;
    } else if (!roleType) {
      respondWithError(res, 'Missing body requirements: roleType', 400);
      return;
    }

    const project = await Project.findById(projectId).lean();
    if (!project) {
      respondWithError(res, 'Project not found.', 406);
      return;
    }

    if (roleTitleExists(project, roleType, newRole.title)) {
      respondWithError(
        res,
        'Role already exists, avoiding a duplicate. Edit the existing role or choose a new title.',
        409,
      );
      return;
    }

    /* TODO: simplify this. there has to be another way of updating DB instances */
    // if there are existing role types, spread them out
    // otherwise create the new role type
    // if there are roles in this roleType, spread them out
    // otherwise spread out the other roleTypes and create the new one.
    const { roles } = project;
    // todo: if newBody is not properly formed, creating the new role would fail. Error handling here would be good.
    const createdRole = new Role(newRole);
    let updatedRoles;
    if (roleTypeExists(project, roleType)) {
      if (roles[roleType].length > 0) {
        updatedRoles = {
          ...roles,
          [roleType]: [...roles[roleType], createdRole],
        };
      } else {
        updatedRoles = { ...roles, [roleType]: [createdRole] };
      }
    } else {
      updatedRoles = { ...roles, [roleType]: [createdRole] };
    }
    let updatedProject = {};
    updatedProject = {
      ...project,
      roles: { ...updatedRoles },
    };
    console.log('roles\n', updatedRoles);
    console.log('project\n', updatedProject.roles);
    updatedProject = await Project.findByIdAndUpdate(projectId, updatedProject, { new: true }).populate({
      path: 'roles.design',
    });
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
