export type AdminPersonSearchResult = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
};

export type AdminEnquirySearchResult = {
  id: string;
  name: string;
  email: string;
  school: string;
  status: string;
  createdAt: string;
};

export type AdminCourseSearchResult = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  updatedAt: string;
};

type ResultGroup<T> = {
  items: T[];
  hasMore: boolean;
};

export type AdminSearchState = {
  query: string;
  searched: boolean;
  people: ResultGroup<AdminPersonSearchResult>;
  enquiries: ResultGroup<AdminEnquirySearchResult>;
  courses: ResultGroup<AdminCourseSearchResult>;
};

export const EMPTY_ADMIN_SEARCH_STATE: AdminSearchState = {
  query: '',
  searched: false,
  people: { items: [], hasMore: false },
  enquiries: { items: [], hasMore: false },
  courses: { items: [], hasMore: false },
};
