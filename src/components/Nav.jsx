import { NavLink } from 'react-router-dom'
import '../css/nav.css'

/* eslint no-undef: off */
const VERSION = APP_VERSION

const Nav = () => {
  return (
    <header>
      <div>
        <h1>Mars2020</h1>
        <nav>
          <NavLink to="/" activeClassName="active" exact>
            Perseverance
          </NavLink>
          <NavLink to="/ingenuity" activeClassName="active">
            Ingenuity
          </NavLink>
        </nav>
        <span className="hidden lg:block lg:text-xs lg:text-gray-400 lg:text-right lg:mt-auto lg:px-4">
          version: {VERSION}
        </span>
      </div>
    </header>
  )
}

export default Nav
