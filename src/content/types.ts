export type LinkItem = {
  label: string
  href: string
}

export type Project = {
  id: string
  title: string
  punchline: string
  description: string
  tags: string[]
  links: LinkItem[]
  featured: boolean
  mediaKind: 'placeholder' | 'image' | 'video'
  mediaUrl: string
}

export type NewsItem = {
  id: string
  date: string
  text: string
}

export type PersonGroup =
  | 'Professor'
  | 'Postdoc'
  | 'PhD'
  | 'MPhil'
  | 'Research Assistant'
  | 'Intern'
  | 'Visiting Student'
  | 'Alumni'

export type Person = {
  id: string
  name: string
  role: string
  affiliation: string
  bio: string
  email?: string
  website?: string
  photoUrl?: string
  group: PersonGroup
}

export type Publication = {
  id: string
  title: string
  venue: string
  year: string
  links: LinkItem[]
}

export type TeachingItem = {
  id: string
  title: string
  description: string
  links: LinkItem[]
}

export type JoinSection = {
  id: string
  title: string
  body: string
}

export type LabContent = {
  identity: {
    title: string
    shortName: string
    tagline: string
    introduction: string
    leaderLine: string
  }
  navigation: string[]
  news: NewsItem[]
  projects: Project[]
  people: Person[]
  publications: Publication[]
  teaching: TeachingItem[]
  join: {
    title: string
    intro: string
    sections: JoinSection[]
    applyEmail: string
  }
  contact: {
    labName: string
    addressLines: string[]
    contactName: string
    email: string
    note: string
    links: LinkItem[]
  }
}
