import { BrowserRouter } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { ProveedorSesion } from './nucleo/sesion'
import { ProveedorFamilia } from './familias/contexto'
import { Rutas } from './rutas'

export default function App() {
  return (
    <ProveedorSesion>
      <ProveedorFamilia>
        <BrowserRouter>
          <Rutas />

          {/**
           * Cuenta visitas y qué pantallas se ven.
           *
           * Sin cookies y sin identificar a nadie, así que no hace falta
           * banner de consentimiento. No registra qué recetas se leen ni
           * quién las lee: eso ya está en la base de datos, y ahí es
           * donde tiene que estar.
           *
           * Fuera de Vercel no hace nada: en local no envía nada.
           */}
          <Analytics />
        </BrowserRouter>
      </ProveedorFamilia>
    </ProveedorSesion>
  )
}
