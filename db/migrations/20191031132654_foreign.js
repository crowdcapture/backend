exports.up = async function(knex) {
    await knex.schema.table('project', (table) => {
        table.foreign('created_by').references('user.id');
        table.foreign('banned_by').references('user.id');
    });

    await knex.schema.table('user', (table) => {
        table.foreign('banned_by').references('user.id');
    });

    await knex.schema.table('image', (table) => {
        table.foreign('created_by').references('user.id');
        table.foreign('project').references('project.id');
    });

    await knex.schema.table('validation', (table) => {
        table.foreign('image').references('image.id');
        table.foreign('user').references('user.id');
        table.foreign('rejection_reason').references('rejection_reason.id');
    });

    await knex.schema.table('project_tags', (table) => {
        table.foreign('tag').references('tag.id');
        table.foreign('project').references('project.id');
    });
};

exports.down = async function(knex) {
    await knex.schema.table('project', (table) => {
        table.dropForeign('created_by');
        table.dropForeign('banned_by');
    });

    await knex.schema.table('user', (table) => {
        table.dropForeign('banned_by');
    });

    await knex.schema.table('image', (table) => {
        table.dropForeign('created_by');
        table.dropForeign('project');
    });

    await knex.schema.table('validation', (table) => {
        table.dropForeign('image');
        table.dropForeign('user');
        table.dropForeign('rejection_reason');
    });

    await knex.schema.table('project_tags', (table) => {
        table.dropForeign('tag');
        table.dropForeign('project');
    });
};
