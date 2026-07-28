import { BrowserRouter } from 'react-router-dom'
import { ProveedorSesion } from './nucleo/sesion'
import { Rutas } from './rutas'

export default function App() {
  return (
    <ProveedorSesion>
      <BrowserRouter>
        <Rutas />
      </BrowserRouter>
    </ProveedorSesion>
  )
}
