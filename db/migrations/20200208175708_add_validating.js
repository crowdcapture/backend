exports.up = async function(knex) {
    await knex.schema.table('image', (table) => {
        table.datetime('validating');
    });
};

exports.down = async function(knex) {
    await knex.schema.table('image', (table) => {
        table.dropColumn('validating');
    });
};
