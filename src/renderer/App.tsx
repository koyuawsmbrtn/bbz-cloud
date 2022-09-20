import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Main from './Main';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
      </Routes>
    </Router>
  );
}
