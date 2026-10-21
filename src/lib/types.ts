/**
 * Types for the JSON files in src/data/en and src/data/it.
 * Source: DataSchema_v1 (2026-10-09). Same types for every language.
 */

// ---------- Shared ----------

export type Lang = 'en' | 'it'

/** Lowercase id with a number: proj-001, pers-001, news-001, part-001, schol-001. */
export type Id = string

/** Date as YYYY-MM-DD. */
export type IsoDate = string

/** Path under /images/. */
export type ImagePath = string

/** Internal route ("/projects", "/about#background") or external URL or "#". */
export type Link = string

/** A theme code. The list of themes is in SiteData.filters.theme.options. */
export type ThemeId = string

export interface Cta {
  label: string
  link: Link
}

// ---------- site.json ----------

export interface NavChild {
  id: Id
  label: string
  link: Link
}

export interface DynamicChildren {
  /** The dropdown shows the newest items of this file. */
  source: 'projects' | 'news'
  limit: number
  viewAll: Cta
}

interface NavItemBase {
  id: Id
  label: string
  link: Link
}

/** A menu entry has a fixed list of children (may be empty) or dynamicChildren. */
export type NavItem =
  | (NavItemBase & { children: NavChild[]; dynamicChildren?: never })
  | (NavItemBase & { dynamicChildren: DynamicChildren; children?: never })

export interface FilterOption<V extends string = string> {
  value: V
  label: string
}

export interface FilterGroup<V extends string = string> {
  label: string
  options: FilterOption<V>[]
}

export interface SiteData {
  logo: { text: string; link: Link }
  nav: NavItem[]
  search: { label: string; placeholder?: string; enabled: boolean }
  languageSwitch: {
    label: string
    options: { code: Lang; label: string }[]
  }
  footer: {
    description: string
    contact: { title: string; address: string; email: string; phone: string }
    quickLinks: { title: string; items: Cta[] }
    social: { id: Id; icon: string; label: string; link: Link }[]
    university: { label: string; link: Link }
    copyright: string
  }
  filters: {
    all: string
    status: FilterGroup<Status>
    theme: FilterGroup<ThemeId>
    type: FilterGroup<NewsType>
    year: { label: string }
    language: FilterGroup<NewsLanguage>
  }
  groups: FilterOption<PersonGroup>[]
  notFound: { title: string; text: string; cta: Cta }
}

/** Short name used by the components. */
export type Site = SiteData

// ---------- home.json ----------

export interface Feature {
  id: Id
  /** Key that the FeatureGrid maps to an icon. */
  icon: string
  title: string
  description: string
  link: Link
}

export interface HomeData {
  hero: {
    title: string
    mission: string
    image: ImagePath
    imageAlt: string
    ctas: Cta[]
  }
  features: [Feature, Feature, Feature, Feature]
  mission: {
    image: ImagePath
    imageAlt: string
    title: string
    sentences: [string, string, string]
    readMore: Cta
  }
  latest: {
    title: string
    seeAll: Cta
    /** How many of the newest news and events are shown. */
    count: number
  }
}

// ---------- about.json ----------

export interface AboutData {
  title: string
  intro: string
  image: ImagePath
  imageAlt: string
  missionVision: {
    anchor: string
    title: string
    intro: string
    items: { id: Id; title: string; text: string; points: string[] }[]
  }
  background: { anchor: string; title: string; paragraphs: string[] }
  regulations: {
    anchor: string
    title: string
    description: string
    file: {
      label: string
      path: string
      type: 'pdf'
      /** Size in bytes. */
      size: number
    }
    downloadLabel: string
  }
  cta: { title: string; text: string; label: string; link: Link }
}

// ---------- Lists (people.json, projects.json, news.json) ----------

/** A list page: its texts and its items. */
export interface ListData<T> {
  title: string
  intro: string
  /** Shown when no item matches the filters. */
  emptyState: string
  items: T[]
}

// ---------- people.json ----------

export type PersonGroup = 'board' | 'committee' | 'members'

export interface Person {
  id: Id
  name: string
  role: string
  department: string
  topics: ThemeId[]
  photo: ImagePath
  email: string
  /** External page of the person, opened in a new tab. No value = no Profile button. */
  profilelink?: Link
  group: PersonGroup
}

// ---------- networking.json ----------

export interface Partner {
  id: Id
  name: string
  text: string
  logo: ImagePath
  tags: string[]
  link: Link
}

export interface Scholar {
  id: Id
  name: string
  role: string
  institution: string
  period: string
  photo: ImagePath
  link: Link
}

export interface NetworkingData {
  title: string
  intro: string
  partners: { anchor: string; title: string; items: Partner[] }
  scholars: {
    anchor: string
    title: string
    items: Scholar[]
    apply: { title: string; text: string; label: string; link: Link }
  }
}

// ---------- projects.json ----------

export type Status = 'planned' | 'active' | 'completed' | 'cancelled'

export interface Project {
  id: Id
  title: string
  summary: string
  theme: ThemeId
  status: Status
  year: number
  /** Ids of people.json. */
  people: Id[]
  image: ImagePath
  link: Link
  featured: boolean
}

// ---------- news.json ----------

export type NewsType = 'news' | 'event'

/** Language of the item: shown as EN, IT, EN + IT. */
export type NewsLanguage = 'en' | 'it' | 'both'

export interface NewsItem {
  id: Id
  type: NewsType
  title: string
  date: IsoDate
  location: string
  summary: string
  image: ImagePath
  link: Link
  language: NewsLanguage
}

// ---------- contact.json ----------

export interface FormField {
  id: string
  type: 'text' | 'email' | 'textarea'
  label: string
  placeholder: string
  required: boolean
  /** Shown under the field when it is empty (required) or not a valid email. Empty when the field is optional. */
  errorMessage: string
}

export interface ContactData {
  title: string
  intro: string
  details: { title: string; address: string; email: string; phone: string }
  map: { title: string; placeholder: string; link: Link }
  form: {
    id: string
    title: string
    fields: FormField[]
    submit: string
    success: string
    error: string
  }
  joinUs: {
    anchor: string
    title: string
    intro: string
    steps: [JoinStep, JoinStep, JoinStep]
    cta: Cta
  }
}

export interface JoinStep {
  id: Id
  title: string
  description: string
}

// ---------- File map ----------

/** File name (without .json) -> type of its content. */
export interface DataFiles {
  site: SiteData
  home: HomeData
  about: AboutData
  people: ListData<Person>
  networking: NetworkingData
  projects: ListData<Project>
  news: ListData<NewsItem>
  contact: ContactData
}

export type FileName = keyof DataFiles
