import ReactDOM from 'react-dom'
import Icon from '../icon.png'

import '../css/loading.css'

const elLoadingContainer = document.getElementById('loading-container')

const Loading = () => {
  return ReactDOM.createPortal(
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-gray-700 loading">
      <img src={Icon} alt="Model icon" className="w-20" />
      <svg className="w-20" viewBox="0 0 55 10">
        <line x1="0" x2="55" y1="0" y2="0" strokeDasharray="5, 5" />
      </svg>
      <em className="not-italic uppercase text-primary font-nunito-sans tracking-wider">
        Mars2020
      </em>
    </div>,
    elLoadingContainer
  )
}

export default Loading
