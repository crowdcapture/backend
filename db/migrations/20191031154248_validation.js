exports.up = async function(knex) {
    await knex.schema.createTable('user_validation', (table) => {
        table.uuid('id').primary().notNullable();
        table.uuid('user').notNullable();
        table.foreign('user').references('user.id');
        table.string('validation_token', 16).notNullable().unique();
        table.datetime('validation_token_created').notNullable();
        table.datetime('validated_on');
    });
};

exports.down = async function(knex) {
    await knex.schema.table('user_validation', (table) => {
        table.dropForeign('user');
    });

    await knex.schema.dropTable('user_validation');
};
