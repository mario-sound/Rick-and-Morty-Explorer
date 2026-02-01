# Rick and Morty Explorer

Aplicación web interactiva para explorar personajes, episodios y localizaciones de la serie Rick and Morty.

**Proyecto de Evaluación Final** - Curso de JavaScript, ConquerBlocks

## 📋 Descripción

Esta es una aplicación de una sola página (SPA) que consume la [Rick and Morty API](https://rickandmortyapi.com/) para permitir a los usuarios navegar y explorar el universo de la serie de forma dinámica e intuitiva.

## ✨ Características

### Funcionalidades Implementadas

- **Búsqueda y Filtrado de Personajes**
  - Buscador por nombre
  - Filtros por estado (Alive, Dead, Unknown)
  - Filtro opcional por especie

- **Detalle de Personaje**
  - Información completa al seleccionar un personaje
  - Datos adicionales: localización, origen, episodios

- **Visualización de Episodios**
  - Sección dedicada a episodios
  - Información de emisión y personajes participantes
  - Enlaces entre personajes y episodios

- **Paginación**
  - Navegación entre páginas de resultados
  - Información de página actual

- **Sistema de Favoritos** (con LocalStorage)
  - Marcar personajes como favoritos
  - Persistencia de datos en el navegador
  - Sección independiente de favoritos

- **Manejo de Estados**
  - Indicadores de carga
  - Mensajes de error claros
  - Feedback visual al usuario

- **Diseño Responsivo**
  - Interfaz adaptada para móvil, tableta y desktop

## 🚀 Cómo Usar

1. **Abre la aplicación** en tu navegador

   ```
   Simplemente abre index.html en tu navegador web
   ```

2. **Explora personajes**
   - Navega por la pestaña "Explorar"
   - Usa los filtros para refinar búsquedas
   - Haz clic en un personaje para ver detalles

3. **Visualiza episodios**
   - Accede a la pestaña "Episodios"
   - Explora información de cada episodio

4. **Gestiona favoritos**
   - Haz clic en el corazón de un personaje para marcar como favorito
   - Visualiza todos tus favoritos en la pestaña "Favoritos"

## 🛠️ Tecnologías

- **HTML5** - Estructura semántica
- **CSS3** - Diseño y responsividad
- **JavaScript (Vanilla)** - Lógica y consumo de API
- **REST API** - Rick and Morty API
- **LocalStorage** - Persistencia de datos

## 📁 Estructura del Proyecto

```
├── index.html      # Estructura HTML
├── styles.css      # Estilos y diseño responsivo
├── app.js          # Lógica de la aplicación
├── README.md       # Este archivo
└── instructions.txt # Especificaciones del proyecto
```

## 🔧 Requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a Internet (para consumir la API)

## 📝 Notas

- Los favoritos se guardan localmente en tu navegador
- La aplicación no requiere servidor backend
- Es una aplicación completamente estática que funciona con fetch

## 👨‍💻 Autor

Proyecto realizado como ejercicio de evaluación final del Curso de JavaScript - ConquerBlocks

---

**API Base:** https://rickandmortyapi.com/
