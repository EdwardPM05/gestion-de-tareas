import React from 'react';
import ReactDOM from 'react-dom/client'; // Para React 18+
import './index.css'; // Estilos globales
import App from './App'; // Importa el componente principal

// Crea una raíz de renderizado para React
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderiza el componente App dentro de la raíz
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);