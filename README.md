# Mapa IMA - Property Map Application

Una aplicación web interactiva para visualizar propiedades inmobiliarias en un mapa.

## 🚀 Características

- **Mapa interactivo** con visualización de propiedades
- **Panel de administración** para gestionar propiedades
- **Búsqueda y filtros** avanzados
- **Vista detallada** de propiedades con galería de imágenes
- **Autenticación** de usuarios
- **Base de datos en tiempo real** con Firebase
- **Diseño responsive** para dispositivos móviles y desktop

## 🛠️ Tecnologías utilizadas

- **React** con TypeScript
- **Leaflet** para mapas interactivos
- **Semantic UI React** para componentes de interfaz
- **Firebase** (Firestore, Storage, Auth)
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

3. Configura Firebase:
   - Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
   - Habilita Firestore Database, Storage y Authentication
   - Copia `.env.example` a `.env` y completa con tus credenciales de Firebase

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

### Opción 2: Firebase Hosting
1. Instala Firebase CLI: `npm install -g firebase-tools`
2. Inicia sesión: `firebase login`
3. Inicializa: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

### Opción 3: Netlify
1. Conecta tu repositorio con [Netlify](https://netlify.com)
2. Configura build command: `npm run build`
3. Configura publish directory: `build`
4. Agrega variables de entorno

## 🔧 Configuración de Firebase

### Variables de entorno requeridas:
```env
REACT_APP_FIREBASE_API_KEY=tu_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=tu_proyecto_id
REACT_APP_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### Configuración de Firestore:
1. Crea una colección llamada `properties`
2. Configura las reglas de seguridad según tus necesidades

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
├── firebase/          # Configuración y servicios de Firebase
├── types/            # Definiciones de TypeScript
└── utils/            # Utilidades y migración de datos
```

## 📊 Migración de datos

Para migrar datos desde Excel a Firebase:
1. Usa el componente PropertyCreator en el panel de administración
2. O utiliza la función `migrateExcelDataToFirebase` en `src/utils/firebaseMigration.ts`

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