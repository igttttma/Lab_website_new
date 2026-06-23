import type { ReactNode } from 'react'

type SectionProps = {
  eyebrow?: string
  title: string
  id: string
  action?: ReactNode
  children: ReactNode
}

export function Section({ eyebrow, title, id, action, children }: SectionProps) {
  return (
    <section className="section" id={id}>
      <div className="section-heading">
        <div>
          {eyebrow ? <span>{eyebrow}</span> : null}
          <h2>{title}</h2>
        </div>
        {action ? <div className="section-action">{action}</div> : null}
      </div>
      {children}
    </section>
  )
}
