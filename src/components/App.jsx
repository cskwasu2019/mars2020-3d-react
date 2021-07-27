import { HashRouter, Route, Switch } from 'react-router-dom'
import { Ingenuity, Perseverance } from '../models'
import Model from './Model'
import Nav from './Nav'
import Scene from './Scene'

const Layout = () => {
  return (
    <div className="w-full h-full relative flex flex-col lg:flex-row">
      <Nav />
      <Scene>
        <Switch>
          <Route path="/" exact>
            <Model path={Perseverance} />
          </Route>
          <Route path="/ingenuity">
            <Model path={Ingenuity} />
          </Route>
        </Switch>
      </Scene>
    </div>
  )
}

const App = () => {
  return (
    <HashRouter>
      <Layout />
    </HashRouter>
  )
}

export default App
