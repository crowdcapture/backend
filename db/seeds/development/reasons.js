
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('rejection_reason').del()
    .then(() => {
      // Inserts seed entries
      return knex('rejection_reason').insert([
        { 
          id: '5502e9fc-b278-4248-888e-5a6be8c43145', 
          reason: 'The image does not adhere to the instruction given in the project.',
          created: new Date()
        },
        { 
          id: 'dab4d7f6-0870-4168-90cc-0a39a09b69ce', 
          reason: 'The image violates one of the rules stated in the general rules, such as pornographic or violent content.',
          created: new Date()
        },
        { 
          id: 'ce1bf180-5f56-4c67-9190-472190aa4037', 
          reason: 'The image is too blurry, pixelated, stretched or otherwise not suitable to be judged.',
          created: new Date()
        }
      ]);
    });
};
