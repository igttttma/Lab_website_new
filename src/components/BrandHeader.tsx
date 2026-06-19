type BrandHeaderProps = {
  navigation: string[]
  currentPath: string
  onNavigate: (path: string) => void
}

function navPath(label: string) {
  if (label === 'Home') {
    return '/'
  }

  return `/${label.toLowerCase().replaceAll(' ', '-')}`
}

export function BrandHeader({ navigation, currentPath, onNavigate }: BrandHeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a
          className="brand-lockup"
          href="/"
          aria-label="PHOENIX Lab home"
          onClick={(event) => {
            event.preventDefault()
            onNavigate('/')
          }}
        >
          <img className="brand-icon" src="/assets/brand/icon.svg" alt="" />
          <img className="brand-wordmark" src="/assets/brand/char_only.svg" alt="PHOENIX Lab" />
        </a>
        <nav className="nav-links" aria-label="Primary navigation">
          {navigation.map((item) => {
            const path = navPath(item)

            return (
              <a
                className={currentPath === path ? 'active' : ''}
                key={item}
                href={path}
                onClick={(event) => {
                  event.preventDefault()
                  onNavigate(path)
                }}
              >
                {item}
              </a>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
