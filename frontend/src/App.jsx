import React from 'react';
import { Outlet } from 'react-router-dom';

function App() {
  // El Outlet renderizará LoginPage, LayoutJefe, o LayoutAdmin
  return <Outlet />;
}

export default App;
