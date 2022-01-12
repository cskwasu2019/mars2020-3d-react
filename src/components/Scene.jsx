import { createContext, useCallback, useEffect, useRef, useState } from 'react'
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Color,
  Fog,
  GridHelper,
  Group,
  PerspectiveCamera,
  Scene as ThreeScene,
  WebGLRenderer,
  CubeTexture,
  Clock,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { loadAndCacheModel, animateFunc, getModelWikiLink } from '../models'
import Swal from 'sweetalert2'
import prettyMS from 'pretty-ms'

import Loading from './Loading'
import '../css/info-card.css'
import '../css/loading-overlay.css'

const sceneContext = createContext(null)

const Scene = ({ children }) => {
  const sceneCanvasRef = useRef(null)
  const threeRef = useRef(null)
  const [currentModel, setCurrentModel] = useState(null)
  const [currentState, setCurrentState] = useState('initial')
  const [animState, setAnimState] = useState('playing')
  const [modelWiki, setModelWiki] = useState(null)
  const [durations, setDurations] = useState(null)

  useEffect(() => {
    const canvas = sceneCanvasRef.current
    const three = initScene(canvas)
    threeRef.current = three
    return () => three.clean
  }, [threeRef])

  useEffect(() => {
    const three = threeRef.current
    if (!currentModel) {
      return
    }

    setCurrentState('loading')
    loadAndCacheModel(currentModel).then(({ wiki, gltf }) => {
      three.setAnimFunc(animateFunc(currentModel, gltf.scene))
      three.setModel(gltf.scene)
      setModelWiki(wiki)
      setCurrentState('loaded')
    })
  }, [threeRef, currentModel, setModelWiki, setCurrentState])

  useEffect(() => {
    if (modelWiki) {
      const wiki = modelWiki
      const date = new Date(
        wiki.infobox
          .find((info) => info[0] === 'Deployed')[1]
          .replace(/^(.*?)UTC.*$/, '$1UTC')
      )

      const intervalID = setInterval(() => {
        const now = Date.now() - date.getTime()
        const timeE = prettyMS(now, {
          secondsDecimalDigits: '0',
          unitCount: 3,
          verbose: true,
        })

        setDurations({
          earth: timeE,
        })
      }, 1000)

      return () => clearInterval(intervalID)
    }
  }, [modelWiki])

  useEffect(() => {
    const three = threeRef.current
    three.setAnimState(animState === 'playing' ? true : false)
  }, [animState])

  const setModel = useCallback(async (model) => {
    setCurrentState('loading')
    try {
      await loadAndCacheModel(model)
      setCurrentModel(model)
    } catch (err) {
      Swal.fire({
        title: 'Error Occured',
        text: 'An error occured while loading model',
        icon: 'error',
        customClass: {
          confirmButton: 'error-bg-color',
        },
      }).then(() => {
        window.location.reload()
      })
    }
  }, [])

  return (
    <div className="flex-1 min-h-0 min-w-0 bg-gray-400 relative">
      <div className="w-full h-full relative">
        <canvas className="w-full h-full" ref={sceneCanvasRef}></canvas>
        <sceneContext.Provider value={{ setModel }}>
          <div className="hidden">{children}</div>
        </sceneContext.Provider>
      </div>
      <div
        className="absolute bottom-0 left-0 flex flex-col py-4 w-full gap-2 uppercase items-center text-primary-darker font-bold"
        style={{
          background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
        }}
      >
        <button
          onClick={() => {
            setAnimState(animState === 'playing' ? 'pause' : 'playing')
          }}
        >
          {animState === 'playing' && (
            <span className="icon-pause-circled text-6xl"></span>
          )}
          {animState === 'pause' && (
            <span className="icon-play-circled text-6xl"></span>
          )}
        </button>
        <h2 className="text-white text-2xl uppercase font-montserrat">
          {modelWiki && modelWiki.title}
        </h2>
        <span className="font-bebas-neue">
          {durations && `Mission duration: ${durations.earth}`}
        </span>
      </div>
      <ul className="info-card">
        {modelWiki && (
          <>
            {modelWiki.infobox
              .map((info, index) => {
                if (VISIBLE_INFO.indexOf(info[0]) !== -1) {
                  return (
                    <li key={index}>
                      {info[0]}: {info[1]}
                    </li>
                  )
                } else {
                  return null
                }
              })
              .filter((value) => value !== null)}
          </>
        )}
      </ul>
      <button
        className="absolute right-10 top-10 text-4xl opacity-70 text-gray-100"
        disabled={modelWiki == null}
        onClick={() => {
          Swal.fire({
            title: 'About',
            text: modelWiki.extract,
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: 'More Info',
            icon: 'info',
            customClass: {
              content: 'swal-content-small',
            },
          }).then(({ isConfirmed }) => {
            if (isConfirmed) {
              window.open(getModelWikiLink(currentModel), '_blank')
            }
          })
        }}
      >
        <span className="icon-help-circled"></span>
      </button>
      {currentState === 'loading' && (
        <div className="loading-overlay">
          <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
            <path d="M 250 479.196 C 123.419 479.196 20.804 376.581 20.804 250 C 20.804 123.419 123.419 20.804 250 20.804 C 376.581 20.804 479.196 123.419 479.196 250"></path>
          </svg>
        </div>
      )}
      {currentState !== 'loaded' && currentModel == null && <Loading />}
    </div>
  )
}

const CLEAR_COLOR = 0xd9c7b2
const initScene = (canvas) => {
  const container = canvas.parentElement
  canvas.width = container.clientWidth
  canvas.height = container.clientHeight

  let state = 'init'
  let animState = 'play'
  let animFunc

  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
  })
  renderer.physicallyCorrectLights = true
  renderer.toneMapping = ACESFilmicToneMapping

  const camera = new PerspectiveCamera(
    45,
    canvas.width / canvas.height,
    0.1,
    1000
  )
  camera.position.set(0, 4, -5)

  const modelGroup = new Group()
  modelGroup.position.y = -0.5
  modelGroup.rotateY(Math.PI)

  const grid = new GridHelper(100, 100)
  grid.position.y = -0.5

  const scene = new ThreeScene()
  scene.background = new Color(CLEAR_COLOR)
  scene.environment = generateCubemapTexture(CLEAR_COLOR)
  scene.fog = new Fog(CLEAR_COLOR, 0.1, 60)
  scene.add(new AmbientLight(0xffffff, 2))
  scene.add(camera)
  scene.add(grid)
  scene.add(modelGroup)

  const controls = new OrbitControls(camera, canvas)
  controls.maxDistance = 50

  const clock = new Clock()

  const render = () => {
    if (state === 'exit') {
      return
    }
    requestAnimationFrame(render)
    const delta = clock.getDelta()

    if (animState === 'play' && animFunc) {
      animFunc(delta)
    }
    renderer.render(scene, camera)

    controls.update()
  }

  const handleResize = () => {
    canvas.width = container.clientWidth
    canvas.height = container.clientHeight

    renderer.setSize(canvas.width, canvas.height)
    camera.aspect = canvas.width / canvas.height
    camera.updateProjectionMatrix()
  }

  window.addEventListener('resize', handleResize)
  render()

  return {
    clean() {
      window.removeEventListener('resize', handleResize)
      scene.clear()
      state = 'exit'
    },
    setAnimFunc(func) {
      animFunc = func
    },
    setAnimState(isPlaying) {
      animState = isPlaying ? 'play' : 'pause'
    },
    setModel(scene) {
      if (state !== 'exit') {
        modelGroup.clear()
        modelGroup.add(scene)
      }
    },
  }
}

function generateCubemapTexture(color) {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128

  const r = (color >> 16) & 255,
    g = (color >> 8) & 255,
    b = color & 255

  const context = canvas.getContext('2d')
  context.fillStyle = `rgb(${r}, ${g}, ${b})`
  context.fillRect(0, 0, 128, 128)

  const texture = new CubeTexture(new Array(6).fill(canvas))
  texture.needsUpdate = true
  return texture
}

const VISIBLE_INFO = [
  'Dimensions',
  'Dry mass',
  'Power',
  'Deployed',
  'Location',
  'Travelled',
]

export default Scene
export { sceneContext }
