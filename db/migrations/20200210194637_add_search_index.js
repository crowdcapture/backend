exports.up = async function(knex) {
    await knex.schema.raw("CREATE INDEX project_idx_title ON project USING GIN (to_tsvector('english', title));");
    await knex.schema.raw("CREATE INDEX project_idx_description ON project USING GIN (to_tsvector('english', description));");
};

exports.down = async function(knex) {
    await knex.schema.alterTable('project', (table) => {
        table.dropIndex('title', 'project_idx_title');
        table.dropIndex('description', 'project_idx_description');
    });
};
