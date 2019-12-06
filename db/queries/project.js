const knex = require('../knex');

function insertProject(project) {
    return knex('project')
        .returning('id')
        .insert(
            project
        );
}

function updateProject(project, project_id) {
    return knex('project')
        .where({id: project_id})
        .update(project);
}

function getProject(project_id) {
    return knex('project')
        .where({
            id: project_id
        });
}

module.exports = {
    insertProject: insertProject,
    updateProject: updateProject,
    getProject: getProject
};