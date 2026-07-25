import { defineField, defineType, type SchemaTypeDefinition } from 'sanity';
const programme = defineType({
  name: 'programme',
  title: 'Programme',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'school',
      title: 'School',
      type: 'string',
      options: {
        list: ['Psychology', 'Languages', 'Professional Development'],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'summary', title: 'Summary', type: 'text' }),
  ],
});
export const schemaTypes: SchemaTypeDefinition[] = [programme];
