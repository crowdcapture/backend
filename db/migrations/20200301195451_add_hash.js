exports.up = async function(knex) {
    await knex.schema.table('image', (table) => {
        table.string('hash', 4);
    });
};

exports.down = async function(knex) {
    await knex.schema.table('image', (table) => {
        table.dropColumn('hash');
    });
};
