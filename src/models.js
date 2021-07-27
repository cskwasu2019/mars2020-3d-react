/* eslint import/no-webpack-loader-syntax: off */
import ModelPerseveranceGZ from '!!file-loader?name=perseverance-[contenthash].glb.gz&outputPath=static/models!./assets/models/perseverance.glb.gz'
import ModelIngenuityGZ from '!!file-loader?name=ingenuity-[contenthash].glb.gz&outputPath=static/models!./assets/models/ingenuity.glb.gz'

import wikipedia from 'wikipedia'
import { gunzip } from 'fflate'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import cheerio from 'cheerio'

const MODEL_WIKIS = {
  [ModelPerseveranceGZ]: 'Perseverance_(rover)',
  [ModelIngenuityGZ]: 'Ingenuity_(helicopter)',
}

const STORE_WIKIS_KEY = 'wikis'

const CACHE_NAME = 'models_cache'
const gltfLoader = new GLTFLoader()
const MODELS = {}
const WIKIS = {}

const getModelWikiLink = (model) =>
  `https://en.wikipedia.org/wiki/${MODEL_WIKIS[model]}`

const loadModelWiki = async (model, name) => {
  if (model in WIKIS) {
    return WIKIS[model]
  }

  let values

  try {
    const wiki = await wikipedia(MODEL_WIKIS[model])
    const html = await wiki.html()
    const $ = cheerio.load(html)

    const elInfobox = $('table.infobox')
    const infobox = []
    $('tr .infobox-label', elInfobox).each(function () {
      const key = $(this)
      let value = $(this.next)
      $('sup', value).each(function () {
        $(this).remove()
      })

      value = cheerio.load(value.html().replace(/&\S+;/g, ''))
      infobox.push([key.text().trim(), value.text().trim()])
    })

    const summary = await wiki.summary()
    values = {
      title: summary.title,
      extract: summary.extract,
      infobox,
    }

    const store = JSON.parse(localStorage.getItem(STORE_WIKIS_KEY)) || {}
    localStorage.setItem(
      STORE_WIKIS_KEY,
      JSON.stringify({
        ...store,
        [name]: values,
      })
    )
  } catch (err) {
    const store = JSON.parse(localStorage.getItem(STORE_WIKIS_KEY))
    if (store && name in store) {
      values = store[name]
    }
  }

  if (!values) {
    throw new Error('Unable to fetch model wiki')
  }
  WIKIS[model] = values
  return values
}

const loadAndCacheModel = async (model) => {
  if (model in MODELS) {
    return MODELS[model]
  }
  const filename = model.split('/').pop()
  const name = filename.split('-')[0]

  const wiki = await loadModelWiki(model, name)

  const cache = await caches.open(CACHE_NAME)
  let res = await cache.match(model)

  if (!res) {
    const keys = await cache.keys()
    keys.forEach(async (keyRes) => {
      const rFilename = keyRes.url.split('/').pop()
      const rName = rFilename.split('-')[0]

      if (rName === name) {
        console.info('Deleting Stale Cached Model:', rFilename)
        await cache.delete(keyRes)
      }
    })

    res = await fetch(model)
    if (!res.ok) {
      throw new Error('Model request response not valid')
    }
    cache.put(model, res.clone())
  }

  const data = await new Promise(async (resolve, reject) => {
    const buffer = await res.arrayBuffer()
    gunzip(new Uint8Array(buffer), (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })

  const gltf = await new Promise((resolve, reject) => {
    gltfLoader.parse(data.buffer, '/', resolve, reject)
  })

  const values = {
    wiki,
    gltf,
  }

  MODELS[model] = values
  return values
}

const animateFunc = (model, scene) => {
  switch (model) {
    case ModelPerseveranceGZ: {
      const wheelFR = scene.getObjectByName('Wheels-F_R')
      const wheelMR = scene.getObjectByName('Wheels-M_R')
      const wheelRR = scene.getObjectByName('Wheels-R_R')
      const wheelFL = scene.getObjectByName('Wheels-F_L')
      const wheelML = scene.getObjectByName('Wheels-M_L')
      const wheelRL = scene.getObjectByName('Wheels-R_L')
      const P_ANIM_SPEED = 5

      return (delta) => {
        wheelFR.rotation.x =
          wheelFL.rotation.x =
          wheelML.rotation.x =
          wheelMR.rotation.x +=
            P_ANIM_SPEED * delta
        wheelRR.rotation.x = wheelRL.rotation.x += -P_ANIM_SPEED * delta
      }
    }
    case ModelIngenuityGZ: {
      const rotor1 = scene.getObjectByName('rotors_01')
      const rotor2 = scene.getObjectByName('rotors_02')
      const I_ANIM_SPEED = 10
      return (delta) => {
        rotor1.rotation.x += I_ANIM_SPEED * delta
        rotor2.rotation.x += -I_ANIM_SPEED * delta
      }
    }
    default:
      throw new Error('Invalid Model')
  }
}

export { loadAndCacheModel, animateFunc, getModelWikiLink }
export { ModelPerseveranceGZ as Perseverance, ModelIngenuityGZ as Ingenuity }
