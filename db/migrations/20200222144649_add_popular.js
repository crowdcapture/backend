exports.up = async function(knex) {
    await knex.schema.table('project', (table) => {
        table.boolean('popular');
    });
};

exports.down = async function(knex) {
    await knex.schema.table('project', (table) => {
        table.dropColumn('popular');
    });
};
