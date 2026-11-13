import React from 'react'
import { createRoot } from 'react-dom/client'
import AvisosSistema from './components/ui/AvisosSistema.jsx'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(<React.StrictMode><App /><AvisosSistema /></React.StrictMode>)
