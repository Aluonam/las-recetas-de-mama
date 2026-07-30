import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { RutaPrivada } from './autenticacion/RutaPrivada'
import { RutaConRecetario } from './familias/RutaConRecetario'
import { Marco } from './ui/Marco'
import { PaginaRecetario } from './recetas/paginas/PaginaRecetario'
import { PaginaVerReceta } from './recetas/paginas/PaginaVerReceta'
import { PaginaModoCocina } from './recetas/paginas/PaginaModoCocina'
import { PaginaEditarReceta } from './recetas/editor/PaginaEditarReceta'
import { PaginaAjustes } from './ajustes/PaginaAjustes'

/** Mapa de rutas. Un solo sitio donde mirar para saber qué pantallas hay. */

/** Privada, con recetario y dentro del marco: el caso normal. */
function Pantalla({ children }: { children: ReactNode }) {
  return (
    <RutaPrivada>
      <RutaConRecetario>
        <Marco>{children}</Marco>
      </RutaConRecetario>
    </RutaPrivada>
  )
}

export function Rutas() {
  return (
    <Routes>
      {/* Ya no hay pantalla de acceso: la sesión se abre sola y la
          bienvenida pide el código. /entrar se deja redirigiendo por si
          alguien tiene el enlace viejo guardado. */}
      <Route path="/entrar" element={<Navigate to="/" replace />} />

      {/* El modo cocina va a pantalla completa: sin cabecera ni pie. */}
      <Route
        path="/receta/:id/cocinar"
        element={
          <RutaPrivada>
            <RutaConRecetario>
              <PaginaModoCocina />
            </RutaConRecetario>
          </RutaPrivada>
        }
      />

      <Route
        path="/"
        element={
          <Pantalla>
            <PaginaRecetario />
          </Pantalla>
        }
      />
      <Route
        path="/ajustes"
        element={
          <Pantalla>
            <PaginaAjustes />
          </Pantalla>
        }
      />
      <Route
        path="/nueva"
        element={
          <Pantalla>
            <PaginaEditarReceta />
          </Pantalla>
        }
      />
      <Route
        path="/receta/:id"
        element={
          <Pantalla>
            <PaginaVerReceta />
          </Pantalla>
        }
      />
      <Route
        path="/receta/:id/editar"
        element={
          <Pantalla>
            <PaginaEditarReceta />
          </Pantalla>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
