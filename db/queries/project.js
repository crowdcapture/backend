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

function getProjects() {
    return knex.select('project.id', 'title', 'image_count', 'created_by', 'user.username').from('project')
        .where({
            'project.banned': false
        })
        .innerJoin('user', 'project.created_by', 'user.id')
        .orderBy('image_count');
}

function getMyProjects(user_id) {
    return knex.select('project.id', 'title', 'image_count', 'created_by', 'user.username').from('project')
        .where({
            'project.banned': false,
            created_by: user_id
        })
        .innerJoin('user', 'project.created_by', 'user.id')
        .orderBy('image_count');
}

module.exports = {
    insertProject: insertProject,
    updateProject: updateProject,
    getProject: getProject,
    getProjects: getProjects,
    getMyProjects: getMyProjects
};