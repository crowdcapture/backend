exports.up = async function(knex) {
    await knex.schema.createTable('user', (table) => {
        table.uuid('id').primary().notNullable();
        table.string('username', 32).notNullable().unique();
        table.string('email', 254).notNullable().unique();
        table.string('password', 64).notNullable();
        table.string('token');
        table.datetime('created').notNullable();
        table.datetime('updated').notNullable();
        table.boolean('banned').notNullable();
        table.datetime('banned_on');
        table.uuid('banned_by');
        table.boolean('moderator').notNullable();
        table.boolean('validated').notNullable();
        table.datetime('validated_on');
    });

    await knex.schema.createTable('image', (table) => {
        table.uuid('id').primary().notNullable();
        table.string('filename', 64).notNullable();
        table.text('url').notNullable();
        table.uuid('project').notNullable();
        table.datetime('created').notNullable();
        table.uuid('created_by').notNullable();
        table.text('sha_256').notNullable();
        table.boolean('banned').notNullable();
        table.datetime('banned_on');
        table.boolean('validated').notNullable();
        table.datetime('validated_on');
    });

    await knex.schema.createTable('project', (table) => {
        table.uuid('id').primary().notNullable();
        table.string('title', 64).notNullable();
        table.text('description');
        table.text('instruction');
        table.datetime('created').notNullable();
        table.uuid('created_by').notNullable();
        table.datetime('updated').notNullable();
        table.boolean('banned').notNullable();
        table.datetime('banned_on');
        table.uuid('banned_by');
        table.integer('image_count').notNullable();
        table.text('latest_bundle_url');
        table.datetime('latest_bundle_created');
    });

    await knex.schema.createTable('project_tags', (table) => {
        table.uuid('id').primary().notNullable();
        table.uuid('tag').notNullable();
        table.uuid('project').notNullable();
    });

    await knex.schema.createTable('tag', (table) => {
        table.uuid('id').primary().notNullable();
        table.varchar('title', 32).notNullable();
        table.datetime('created').notNullable();
    });

    await knex.schema.createTable('validation', (table) => {
        table.uuid('id').primary().notNullable();
        table.uuid('image').notNullable();
        table.uuid('user').notNullable();
        table.boolean('rejected').notNullable();
        table.uuid('rejection_reason').notNullable();
    });

    await knex.schema.createTable('rejection_reason', (table) => {
        table.uuid('id').primary().notNullable();
        table.text('reason').notNullable();
        table.datetime('created').notNullable();
    });
};

exports.down = async function(knex) {
    await knex.schema.dropTable('project');
    await knex.schema.dropTable('user');
    await knex.schema.dropTable('image');
    await knex.schema.dropTable('project_tags');
    await knex.schema.dropTable('validation');
    await knex.schema.dropTable('rejection_reason');
    await knex.schema.dropTable('tag');
};
