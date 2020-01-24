exports.up = async function(knex) {
    await knex.schema.table('project', (table) => {
        table.integer('minWidth');
        table.integer('minHeight');
    });
};

exports.down = async function(knex) {
    await knex.schema.table('project', (table) => {
        table.dropColumn('minWidth');
        table.dropColumn('minHeight');
    });
};
