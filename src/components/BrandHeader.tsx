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
  const isBlimpMate = currentPath === '/projects/blimpmate'

  return (
    <header className={`site-header${isBlimpMate ? ' site-header--blimpmate' : ''}`}>
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
            const isActive = currentPath === path || (item === 'Projects' && currentPath.startsWith('/projects/'))

            return (
              <a
                className={isActive ? 'active' : ''}
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
