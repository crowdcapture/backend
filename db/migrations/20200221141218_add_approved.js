exports.up = async function(knex) {
    await knex.schema.table('image', (table) => {
        table.boolean('approved');
    });
};

exports.down = async function(knex) {
    await knex.schema.table('image', (table) => {
        table.dropColumn('approved');
    });
};
