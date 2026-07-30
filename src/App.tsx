import { BrowserRouter } from 'react-router-dom'
import { ProveedorSesion } from './nucleo/sesion'
import { ProveedorFamilia } from './familias/contexto'
import { Rutas } from './rutas'

export default function App() {
  return (
    <ProveedorSesion>
      <ProveedorFamilia>
        <BrowserRouter>
          <Rutas />
        </BrowserRouter>
      </ProveedorFamilia>
    </ProveedorSesion>
  )
}
