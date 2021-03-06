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

function getPopularProjects() {
    return knex.select('id', 'title', 'image_count').from('project')
        .where({
            popular: true
        });
}

function getProject(project_id) {
    return knex.select('project.id', 'image_count', 'latest_bundle_url', 'title', 'description', 'instruction', 'minWidth', 'minHeight', 'created_by', 'user.username').from('project')
        .where({
            'project.id': project_id
        })
        .innerJoin('user', 'project.created_by', 'user.id');
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

function search(query) {
    return knex('project')
        .where({
            banned: false
        })
        .whereRaw("to_tsvector(title || ' ' || description) @@ plainto_tsquery(?)", [query])
        .limit(20);
}

function searchByUser(query, user_id) {
    return knex('project')
        .where({
            created_by: user_id,
            banned: false
        })
        .whereRaw("to_tsvector(title || ' ' || description) @@ plainto_tsquery(?)", [query])
        .limit(20);
}

module.exports = {
    insertProject: insertProject,
    updateProject: updateProject,
    getProject: getProject,
    getProjects: getProjects,
    getMyProjects: getMyProjects,
    getPopularProjects: getPopularProjects,
    search,
    searchByUser
};