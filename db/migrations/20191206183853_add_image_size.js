exports.up = async function(knex) {
    await knex.schema.table('image', (table) => {
        table.integer('height');
        table.integer('width');
    });
};

exports.down = async function(knex) {
    await knex.schema.table('image', (table) => {
        table.dropColumn('height');
        table.dropColumn('width');
    });
};
