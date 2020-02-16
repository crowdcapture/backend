exports.up = async function(knex) {
    await knex.schema.table('image', (table) => {
        table.text('urlSmall');
        table.integer('heightSmall');
        table.integer('widthSmall');
    });
};

exports.down = async function(knex) {
    await knex.schema.table('image', (table) => {
        table.dropColumn('urlSmall');
        table.dropColumn('heightSmall');
        table.dropColumn('widthSmall');
    });
};
