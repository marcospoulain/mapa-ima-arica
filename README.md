# Mapa IMA - Property Map Application

Una aplicación web interactiva para visualizar propiedades inmobiliarias en un mapa.

## 🚀 Características

- **Mapa interactivo** con visualización de propiedades
- **Panel de administración** para gestionar propiedades
- **Búsqueda y filtros** avanzados
- **Vista detallada** de propiedades con galería de imágenes
- **Autenticación** de usuarios
- **Base de datos en tiempo real** con Supabase
- **Diseño responsive** para dispositivos móviles y desktop

## 🛠️ Tecnologías utilizadas

- **React** con TypeScript
- **Leaflet** para mapas interactivos
- **Semantic UI React** para componentes de interfaz
- **Supabase** (Database, Storage, Auth)
- **CSS3** para estilos personalizados

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/mapa-ima.git
cd mapa-ima
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura Supabase:
   - Crea un proyecto en [Supabase](https://supabase.com)
   - Crea una tabla `properties` con la estructura definida en `src/types/supabase.ts`
   - Crea un bucket de Storage llamado `property-images`
   - Copia `.env.example` a `.env` y completa con tus credenciales de Supabase

4. Inicia el servidor de desarrollo:
```bash
npm start
```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🌐 Deployment

### Opción 1: Vercel (Recomendado)
1. Conecta tu repositorio GitHub con [Vercel](https://vercel.com)
2. Configura las variables de entorno en Vercel Dashboard
3. Deploy automático en cada push a main

### Opción 2: Netlify
1. Conecta tu repositorio con [Netlify](https://netlify.com)
2. Configura build command: `npm run build`
3. Configura publish directory: `build`
4. Agrega variables de entorno



## 🔧 Configuración de Supabase

### Variables de entorno requeridas:
```env
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu_clave_anon_aqui
```

### Configuración de la base de datos:
1. Crea una tabla llamada `properties` con la siguiente estructura:
   - id: uuid (primary key)
   - title: text
   - type: text
   - price: numeric
   - location: text
   - description: text
   - bedrooms: integer
   - bathrooms: integer
   - area: numeric
   - coordinates: jsonb (lat, lng)
   - image_url: text
   - features: jsonb (array)
   - status: text
   - created_at: timestamp with time zone
   - updated_at: timestamp with time zone

2. Configura las políticas de seguridad según tus necesidades

### Configuración de Storage:
1. Crea un bucket llamado `property-images`
2. Configura las políticas de acceso público para las imágenes

## 🏗️ Scripts disponibles

- `npm start` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm test` - Ejecuta las pruebas
- `npm run eject` - Expone la configuración de webpack

## 📁 Estructura del proyecto

```
src/
├── components/
│   ├── AdminPanel/     # Panel de administración
│   ├── Auth/          # Autenticación
│   ├── LandingPage/   # Página principal
│   ├── Layout/        # Header y Footer
│   ├── Map/           # Componentes del mapa
│   ├── Property/      # Detalles de propiedades
│   ├── Search/        # Búsqueda y filtros
│   └── Stats/         # Estadísticas
├── context/           # Context API de React
├── supabase/          # Configuración y servicios de Supabase
├── types/            # Definiciones de TypeScript
└── utils/            # Utilidades y migración de datos
```

## 📊 Migración de datos

Para migrar datos desde Excel a Supabase:
1. Usa el componente PropertyCreator en el panel de administración
2. O utiliza la función `migrateExcelDataToSupabase` en `src/utils/supaMigration.ts`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Contacto

Tu Nombre - tu-email@ejemplo.com

Link del proyecto: [https://github.com/tu-usuario/mapa-ima](https://github.com/tu-usuario/mapa-ima)