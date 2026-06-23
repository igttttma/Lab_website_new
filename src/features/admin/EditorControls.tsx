import type { LinkItem } from '../../content/types'

type FieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function TextField({ label, value, onChange, placeholder }: FieldProps) {
  return (
    <label className="cms-field">
      <span>{label}</span>
      <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

export function TextAreaField({ label, value, onChange, placeholder }: FieldProps) {
  return (
    <label className="cms-field">
      <span>{label}</span>
      <textarea value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

export function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="cms-check">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: T[]
  onChange: (value: T) => void
}) {
  return (
    <label className="cms-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

export function StringListField({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}) {
  return (
    <div className="cms-nested">
      <span>{label}</span>
      {values.map((value, index) => (
        <div className="cms-inline-row" key={`${value}-${index}`}>
          <input
            value={value}
            placeholder={placeholder}
            onChange={(event) => onChange(values.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))}
          />
          <button type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}>
            Delete
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...values, ''])}>
        Add
      </button>
    </div>
  )
}

export function LinksField({ links, onChange }: { links: LinkItem[]; onChange: (links: LinkItem[]) => void }) {
  const update = (index: number, patch: Partial<LinkItem>) => {
    onChange(links.map((link, linkIndex) => (linkIndex === index ? { ...link, ...patch } : link)))
  }

  return (
    <div className="cms-nested">
      <span>Links</span>
      {links.map((link, index) => (
        <div className="cms-link-row" key={`${link.label}-${index}`}>
          <input value={link.label} placeholder="Label" onChange={(event) => update(index, { label: event.target.value })} />
          <input value={link.href} placeholder="URL" onChange={(event) => update(index, { href: event.target.value })} />
          <button type="button" onClick={() => onChange(links.filter((_, linkIndex) => linkIndex !== index))}>
            Delete
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...links, { label: 'Link', href: '#' }])}>
        Add Link
      </button>
    </div>
  )
}
