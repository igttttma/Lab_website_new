import type { LabContent } from './types'

export const defaultContent: LabContent = {
  identity: {
    title: 'Optoelectronic HCI Lab',
    shortName: 'PHOENIX Lab',
    tagline: 'Light-Driven Matter, Interfaces, and Future Technologies',
    introduction:
      'Phoenix Lab takes an interdisciplinary approach to exploring optical technologies as a generative medium for reimagining matter, interfaces, energy, and future interactive systems. At the intersection of Optical Technologies and Human-Computer Interaction, we create programmable materials, physical interfaces, robotic and energy systems, and AI-enabled experiences that reshape how people interact with and through the physical world.',
    leaderLine:
      'Phoenix Lab is led by Prof. Yuhua Jin at The Chinese University of Hong Kong, Shenzhen.',
  },
  navigation: ['Home', 'Projects', 'People', 'Publications', 'Teaching', 'Join Us', 'Contact'],
  news: [
    {
      id: 'website-under-construction',
      date: '2026.06',
      text: 'PHOENIX Lab website is under construction.',
    },
  ],
  projects: [
    {
      id: 'photo-chromeleon',
      title: 'Photo-Chromeleon',
      punchline: 'Recolor physical objects like a chameleon using light.',
      description:
        'A reprogrammable color-changing material system that allows physical objects to be digitally recolored after fabrication. By projecting light onto coated objects, users can write, erase, and update color patterns on real-world surfaces.',
      tags: ['Programmable Matter', 'Color-Changing Materials', 'Optical Fabrication', 'HCI'],
      links: [
        { label: 'Video', href: '#' },
        { label: 'Paper', href: '#' },
        { label: 'PDF', href: '#' },
        { label: 'DOI', href: '#' },
        { label: 'Media', href: '#' },
      ],
      featured: true,
      mediaKind: 'placeholder',
      mediaUrl: '',
    },
    {
      id: 'blimpmate',
      title: 'BlimpMate',
      punchline: 'A quiet flying display for soft, situated interaction.',
      description:
        'A quiet, long-endurance flying display that explores soft, situated, and embodied interaction in physical space.',
      tags: ['Flying Display', 'Robotics', 'HCI'],
      links: [
        { label: 'Project', href: '#' },
        { label: 'Paper', href: '#' },
        { label: 'Video', href: '#' },
      ],
      featured: true,
      mediaKind: 'placeholder',
      mediaUrl: '',
    },
    {
      id: 'laser-powered-interaction',
      title: 'Laser-Powered Interaction',
      punchline: 'Battery-free tactile devices powered and controlled by light.',
      description:
        'Wireless interactive devices powered and controlled by light, enabling battery-free tactile and physical interfaces.',
      tags: ['Laser Power', 'Tactile Interfaces', 'UbiComp'],
      links: [
        { label: 'Project', href: '#' },
        { label: 'Paper', href: '#' },
      ],
      featured: true,
      mediaKind: 'placeholder',
      mediaUrl: '',
    },
  ],
  people: [
    {
      id: 'yuhua-jin',
      name: 'Prof. Yuhua Jin',
      role: 'Assistant Professor, School of Science and Engineering',
      affiliation: 'The Chinese University of Hong Kong, Shenzhen',
      bio: 'Researcher in optoelectronic HCI, programmable materials, physical interfaces, and light-driven future technologies, with prior work including Photo-Chromeleon at MIT.',
      email: 'yuhuajin@cuhk.edu.cn',
      website: '#',
      photoUrl: '',
      group: 'Professor',
    },
    {
      id: 'member-placeholder',
      name: 'Name',
      role: 'Postdoc',
      affiliation: 'Materials',
      bio: 'Profile coming soon.',
      photoUrl: '',
      group: 'Postdoc',
    },
  ],
  publications: [
    {
      id: 'publications-placeholder',
      title: 'Selected publications will be added soon.',
      venue: 'PHOENIX Lab',
      year: '2026',
      links: [{ label: 'Reference', href: 'https://tangible.media.mit.edu/papers/' }],
    },
  ],
  teaching: [
    {
      id: 'teaching-placeholder',
      title: 'Teaching information coming soon.',
      description: 'Course pages and teaching materials will be added here.',
      links: [{ label: 'Reference', href: 'https://hcie.csail.mit.edu/classes.html' }],
    },
  ],
  join: {
    title: 'Join PHOENIX Lab',
    intro:
      'PHOENIX Lab welcomes curious, creative, and hands-on researchers who are excited about light-driven matter, interfaces, energy systems, and future interactive technologies. We welcome people from HCI, computer science, optical engineering, electronic engineering, materials science, mechanical engineering, robotics, design, and related fields.',
    sections: [
      {
        id: 'postdocs',
        title: 'Postdoctoral Researchers',
        body:
          'We are recruiting postdoctoral researchers interested in interdisciplinary research related to light-driven materials, programmable matter, optical systems, physical interfaces, robotic systems, energy systems, fabrication, AI-enabled interactive systems, and human-computer interaction.',
      },
      {
        id: 'phd-mphil',
        title: 'PhD and MPhil Students',
        body:
          'We welcome prospective PhD and MPhil students interested in creating future physical and interactive technologies at the intersection of optical technologies and human-computer interaction.',
      },
      {
        id: 'research-assistants-interns',
        title: 'Research Assistants & Interns',
        body:
          'We welcome research assistants, visiting students, undergraduate interns, and master’s interns interested in hands-on interdisciplinary research across experiments, prototypes, hardware, software, AI-enabled interaction, user studies, and visual documentation.',
      },
      {
        id: 'wildcard',
        title: 'Wildcard',
        body:
          'If your background is not listed but you see a strong and creative connection with PHOENIX Lab, please feel free to reach out.',
      },
      {
        id: 'how-to-apply',
        title: 'How to Apply',
        body:
          'Interested applicants may email Prof. Yuhua Jin with a brief introduction, CV, representative publications or portfolios, transcripts if applicable, and a short explanation of why they are interested in PHOENIX Lab.',
      },
    ],
    applyEmail: 'yuhuajin@cuhk.edu.cn',
  },
  contact: {
    labName: 'PHOENIX Lab',
    addressLines: [
      'Research Complex 625',
      'School of Science and Engineering',
      'The Chinese University of Hong Kong, Shenzhen',
      '2001 Longxiang Boulevard, Longgang District',
      'Shenzhen, Guangdong, China',
    ],
    contactName: 'Prof. Yuhua Jin',
    email: 'yuhuajin@cuhk.edu.cn',
    note:
      'For prospective students, postdoctoral researchers, research assistants, and interns, please visit the Join Us page before contacting us.',
    links: [
      { label: 'Google Map', href: '#' },
      { label: 'Campus Map', href: '#' },
    ],
  },
}
