import type { ReactNode } from 'react'

type SectionProps = {
  eyebrow?: string
  title: string
  id: string
  children: ReactNode
}

export function Section({ eyebrow, title, id, children }: SectionProps) {
  return (
    <section className="section" id={id}>
      <div className="section-heading">
        {eyebrow ? <span>{eyebrow}</span> : null}
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  )
}
