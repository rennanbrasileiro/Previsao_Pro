import { BrowserRouter as Router, Routes, Route } from "react-router";
import Layout from "@/react-app/components/Layout";
import Dashboard from "@/react-app/pages/Dashboard";
import Balancetes from "@/react-app/pages/Balancetes";
import Previsoes from "@/react-app/pages/Previsoes";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/previsoes" element={<Previsoes />} />
          <Route path="/balancetes" element={<Balancetes />} />
          <Route path="/condominios" element={<Dashboard />} />
          <Route path="/relatorios" element={<Dashboard />} />
          <Route path="/configuracoes" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}
