import PropTypes from 'prop-types'
import { useContext, useEffect } from 'react'
import { sceneContext } from './Scene'

const Model = ({ path }) => {
  const { setModel } = useContext(sceneContext)

  useEffect(() => {
    setModel(path)
  }, [path, setModel])

  return null
}

Model.propTypes = {
  path: PropTypes.string.isRequired,
}

export default Model
