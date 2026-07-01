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
  mediaKind: 'placeholder' | 'image'
  mediaUrl: string
  gifUrl?: string
}

export type NewsItem = {
  id: string
  date: string
  text: string
}

export type Person = {
  id: string
  name: string
  major: string
  role: string
  affiliation: string
  photoUrl?: string
  profileUrl: string
}

export type Publication = {
  id: string
  title: string
  venue: string
  year: string
  abstract: string
  doiHref: string
  links: LinkItem[]
}

export type TeachingItem = {
  id: string
  title: string
  description: string
  mediaKind: 'placeholder' | 'image' | 'gif' | 'video'
  mediaUrl: string
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
    introduction: string
    leaderLine: string
    heroMediaKind: 'placeholder' | 'image' | 'gif' | 'video'
    heroMediaUrl: string
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
