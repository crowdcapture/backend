exports.up = async function(knex) {
    await knex.schema.alterTable('validation', (table) => {
        table.uuid('rejection_reason').nullable().alter();
    });
};

exports.down = async function() {};
