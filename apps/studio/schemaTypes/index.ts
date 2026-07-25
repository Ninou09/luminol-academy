import { defineField, defineType, type SchemaTypeDefinition } from 'sanity';

const schoolOptions = [
  { title: 'Psychology', value: 'psychology' },
  { title: 'Languages', value: 'languages' },
  { title: 'Professional Training', value: 'training' },
] as const;

const programme = defineType({
  name: 'programme',
  title: 'Programme',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().min(3).max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'school',
      title: 'School',
      type: 'string',
      options: { list: [...schoolOptions], layout: 'radio' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      description: 'A concise public description used on programme cards.',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().min(20).max(320),
    }),
    defineField({
      name: 'body',
      title: 'Programme details',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'outcomes',
      title: 'Learning outcomes',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (rule) => rule.max(12),
    }),
    defineField({
      name: 'audience',
      title: 'Intended audience',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (rule) => rule.max(12),
    }),
    defineField({
      name: 'delivery',
      title: 'Delivery format',
      type: 'string',
      options: {
        list: [
          { title: 'In person', value: 'In person' },
          { title: 'Online', value: 'Online' },
          { title: 'Hybrid', value: 'Hybrid' },
          { title: 'Flexible', value: 'Flexible' },
        ],
      },
    }),
    defineField({
      name: 'image',
      title: 'Purposeful programme image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          validation: (rule) => rule.required().max(180),
        }),
      ],
    }),
    defineField({
      name: 'featured',
      title: 'Featured programme',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'active',
      title: 'Visible on the public website',
      type: 'boolean',
      initialValue: false,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      initialValue: 100,
      validation: (rule) => rule.integer().min(0).max(10_000),
    }),
  ],
  orderings: [
    {
      title: 'School and display order',
      name: 'schoolOrder',
      by: [
        { field: 'school', direction: 'asc' },
        { field: 'order', direction: 'asc' },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      school: 'school',
      active: 'active',
      media: 'image',
    },
    prepare({ title, school, active, media }) {
      return {
        title,
        subtitle: `${school ?? 'No school'} · ${active ? 'Public' : 'Draft'}`,
        media,
      };
    },
  },
});

const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Public site title',
      type: 'string',
      initialValue: 'Luminol Academy',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: 'mission',
      title: 'Mission',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.max(600),
    }),
    defineField({
      name: 'vision',
      title: 'Vision',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.max(600),
    }),
    defineField({
      name: 'enquiryResponse',
      title: 'Enquiry response guidance',
      description: 'Internal guidance for the team handling new enquiries.',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.max(1_000),
    }),
  ],
});

const teamMember = defineType({
  name: 'teamMember',
  title: 'Team Member',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'school',
      title: 'School',
      type: 'string',
      options: { list: [...schoolOptions] },
    }),
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'text',
      rows: 6,
      validation: (rule) => rule.max(1_200),
    }),
    defineField({
      name: 'portrait',
      title: 'Approved portrait',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          validation: (rule) => rule.required().max(180),
        }),
      ],
    }),
    defineField({
      name: 'active',
      title: 'Visible on the public website',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      initialValue: 100,
      validation: (rule) => rule.integer().min(0).max(10_000),
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'portrait' },
  },
});

const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'quote',
      title: 'Approved quote',
      type: 'text',
      rows: 5,
      validation: (rule) => rule.required().min(20).max(600),
    }),
    defineField({
      name: 'personName',
      title: 'Public name or approved attribution',
      type: 'string',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: 'context',
      title: 'Context',
      description: 'For example: English learner or Leadership participant.',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'school',
      title: 'School',
      type: 'string',
      options: { list: [...schoolOptions] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'consentConfirmed',
      title: 'Publication consent confirmed',
      description:
        'Only enable this after written permission to publish the quote and attribution.',
      type: 'boolean',
      initialValue: false,
      validation: (rule) =>
        rule
          .required()
          .custom((value) =>
            value === true
              ? true
              : 'Written publication consent must be confirmed.',
          ),
    }),
    defineField({
      name: 'active',
      title: 'Visible on the public website',
      type: 'boolean',
      initialValue: false,
    }),
  ],
});

export const schemaTypes: SchemaTypeDefinition[] = [
  programme,
  siteSettings,
  teamMember,
  testimonial,
];
