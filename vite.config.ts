import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    /**
     * Aplicación instalable.
     *
     * El objetivo no es la etiqueta «PWA»: es que mamá tenga el recetario
     * como un icono más en la tablet, sin escribir direcciones, y que la
     * receta siga ahí cuando la wifi de la cocina no llega.
     */
    VitePWA({
      // Se actualiza sola. Nadie va a ir a una tienda a buscar la versión
      // nueva, y menos la persona que solo quiere ver una receta.
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'fondo-toile.jpg'],

      manifest: {
        name: 'Las Recetas de Mamá',
        short_name: 'Las Recetas',
        description:
          'El recetario de la familia: recetas, trucos e historias que no se pueden perder.',
        lang: 'es',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#f6f2ea',
        theme_color: '#dde5ce',
        categories: ['food', 'lifestyle'],
        icons: [
          { src: '/icono-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icono-512.png', sizes: '512x512', type: 'image/png' },
          {
            // Android recorta el icono a la forma que use el sistema, así
            // que este lleva el dibujo encogido para que no se decapite.
            src: '/icono-enmascarable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        // La app es una sola página: cualquier ruta la resuelve el índice.
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,png,jpg,svg,woff2}'],

        runtimeCaching: [
          {
            /**
             * Las recetas. Primero la red, para ver siempre lo último que
             * haya escrito la familia; si no hay cobertura, lo guardado.
             * Es lo que permite cocinar en el pueblo sin datos.
             */
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'recetas',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            /**
             * Fotos y audios. Una vez subidos no cambian nunca, así que
             * primero la caché: se ven al instante y no gastan datos.
             */
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fotos-y-audios',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },

      devOptions: {
        // Para poder probar la instalación sin compilar cada vez.
        enabled: true,
        type: 'module',
      },
    }),
  ],
})
