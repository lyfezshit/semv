import { Routes, Route } from 'react-router-dom';
import { Page } from './new/page';


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Page />} />
      
    </Routes>
  );
}