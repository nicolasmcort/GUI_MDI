import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import { Plus, Info, MapPin } from "lucide-react";

// Simula un hook global para tareas. Reemplaza con tu propio hook/contexto/estado global real.
const useTaskData = () => {
  const [allTasks] = useState([
    { id: 1, name: "Design UI mockups", duration: 5, unit: "Horas", priority: "High", dependencies: "Ninguna" },
    { id: 2, name: "Implement backend API", duration: 8, unit: "Horas", priority: "High", dependencies: "1" },
    { id: 3, name: "Frontend development", duration: 12, unit: "Minutos", priority: "Medium", dependencies: "1, 2" },
    { id: 4, name: "Testing and QA", duration: 4, unit: "Horas", priority: "High", dependencies: "3" },
    { id: 5, name: "Deploy to production", duration: 2, unit: "Minutos", priority: "Critical", dependencies: "4, 3, 1" },
  ]);
  return { allTasks };
};

interface Route {
  id: number;
  type: "critical" | "alternative";
  name: string;
  path: string;
  duration: string;
  color: string;
}

// Detecta ciclos en el grafo de dependencias
function detectCycles(tasks: { id: number; dependencies: string }[]): string[] {
  const graph: Record<number, number[]> = {};
  tasks.forEach((task) => {
    const deps = (task.dependencies === "Ninguna" || !task.dependencies.trim())
      ? []
      : task.dependencies.split(",").map(x => parseInt(x.trim(), 10)).filter(x => !isNaN(x));
    graph[task.id] = deps;
  });

  const visited: Set<number> = new Set();
  const stack: Set<number> = new Set();
  const cycles: Set<string> = new Set();

  function dfs(node: number, path: number[]) {
    if (stack.has(node)) {
      const cycleStart = path.indexOf(node);
      const cycle = path.slice(cycleStart).concat(node);
      const cycleStr = cycle.map(n => n).join(" → ");
      let minIdx = 0;
      for (let i = 1; i < cycle.length - 1; i++) {
        if (cycle[i] < cycle[minIdx]) minIdx = i;
      }
      const rotated = [...cycle.slice(minIdx), ...cycle.slice(0, minIdx), cycle[minIdx]];
      const rotatedStr = rotated.join(" → ");
      cycles.add(rotatedStr);
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    stack.add(node);
    for (const neighbor of graph[node]) {
      dfs(neighbor, [...path, node]);
    }
    stack.delete(node);
  }

  Object.keys(graph).forEach(k => {
    const n = parseInt(k, 10);
    dfs(n, []);
  });

  return Array.from(cycles);
}

export default function CriticalPathAnalysis() {
  const { allTasks } = useTaskData();

  const allRoutes: Route[] = [
    { id: 1, type: "critical", name: "Ruta Crítica", path: "A → B → D → F", duration: "25 horas", color: "bg-destructive" },
    { id: 2, type: "alternative", name: "Ruta Alternativa", path: "A → C → E → F", duration: "1300 minutos", color: "bg-info" },
    { id: 3, type: "alternative", name: "Ruta Alternativa", path: "A → B → E → F", duration: "20 horas", color: "bg-info" },
    { id: 4, type: "alternative", name: "Ruta Alternativa", path: "A → C → D → F", duration: "1200 minutos", color: "bg-info" },
    { id: 5, type: "alternative", name: "Ruta Alternativa", path: "A → B → C → F", duration: "18 horas", color: "bg-info" },
    { id: 6, type: "critical", name: "Ruta Crítica Secundaria", path: "A → D → E → F", duration: "24 horas", color: "bg-destructive" },
    { id: 7, type: "alternative", name: "Ruta Alternativa", path: "A → E → D → F", duration: "900 minutos", color: "bg-info" },
    { id: 8, type: "alternative", name: "Ruta Alternativa", path: "A → C → B → F", duration: "19 horas", color: "bg-info" },
  ];

  const cyclicDependencies: string[] = useMemo(
    () => detectCycles(allTasks),
    [allTasks]
  );

  const [selectedRoute, setSelectedRoute] = useState<number | null>(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Paginación de rutas
  const itemsPerPage = 3;
  const totalPages = Math.max(1, Math.ceil(allRoutes.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRoutes = allRoutes.slice(startIndex, endIndex);

  // ---- RESUMEN DEL ANÁLISIS DINÁMICO ----

  const parseToHours = (durationStr: string) => {
    if (durationStr.toLowerCase().includes("minuto")) {
      const min = parseFloat(durationStr);
      if (isNaN(min)) return 0;
      return min / 60;
    }
    if (durationStr.toLowerCase().includes("hora")) {
      const hr = parseFloat(durationStr);
      if (isNaN(hr)) return 0;
      return hr;
    }
    return 0;
  };

  const totalProjectDurationHours = useMemo(() => {
    const route = allRoutes.find(r => r.id === selectedRoute);
    return route ? parseToHours(route.duration) : 0;
  }, [allRoutes, selectedRoute]);

  const criticalTasksCount = useMemo(
    () =>
      allTasks
        ? allTasks.filter(
            t =>
              t.priority === "Crítica" ||
              t.priority === "Critical"
          ).length
        : 0,
    [allTasks]
  );

  const routesDetectedCount = allRoutes.length;

  // rightContent eliminado

  return (
    <Layout title="Análisis de Ruta Crítica (CPM)">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 mb-6">
        {/* Dependency Graph */}
        <div className="taskflow-card rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-5 h-5 text-primary">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3C2 2.44772 2.44772 2 3 2H17C17.5523 2 18 2.44772 18 3C18 3.55228 17.5523 4 17 4H3C2.44772 4 2 3.55228 2 3ZM2 7C2 6.44772 2.44772 6 3 6H17C17.5523 6 18 6.44772 18 7C18 7.55228 17.5523 8 17 8H3C2.44772 8 2 7.55228 2 7ZM3 10C2.44772 10 2 10.4477 2 11C2 11.5523 2.44772 12 3 12H17C17.5523 12 18 11.5523 18 11C18 10.4477 17.5523 10 17 10H3ZM3 14C2.44772 14 2 14.4477 2 15C2 15.5523 2.44772 16 3 16H17C17.5523 16 18 15.5523 18 15C18 14.4477 17.5523 14 17 14H3Z" />
              </svg>
            </div>
            <h3 className="text-foreground text-base font-semibold">
              Grafo de Dependencias
            </h3>
          </div>

          <div className="taskflow-input border rounded h-80 flex flex-col items-center justify-center bg-input-background">
            <div className="w-16 h-16 rounded-lg bg-border flex items-center justify-center mb-4">
              <Plus className="text-muted-foreground" size={32} />
            </div>
            <h4 className="text-muted-foreground text-sm font-medium text-center mb-2">
              Grafo Generado por Python
            </h4>
            <p className="text-muted-foreground text-xs text-center max-w-64 leading-relaxed">
              El grafo de dependencias se generará automáticamente y se mostrará
              aquí una vez procesado
            </p>
          </div>
        </div>

        {/* Analysis Summary */}
        <div className="taskflow-card rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Info className="text-primary" size={20} />
            <h3 className="text-foreground text-base font-semibold">
              Resumen del Análisis
            </h3>
          </div>
          <div className="space-y-4">
            <div className="taskflow-input border rounded p-4 flex items-center justify-between bg-input-background">
              <span className="text-muted-foreground text-xs font-medium">
                Duración Total del Proyecto
              </span>
              <span className="text-primary text-lg font-bold">
                {totalProjectDurationHours.toFixed(2)} horas
              </span>
            </div>
            <div className="taskflow-input border rounded p-4 flex items-center justify-between bg-input-background">
              <span className="text-muted-foreground text-xs font-medium">
                Número de Tareas Críticas
              </span>
              <span className="text-warning text-lg font-bold">
                {criticalTasksCount}
              </span>
            </div>
            <div className="taskflow-input border rounded p-4 flex items-center justify-between bg-input-background">
              <span className="text-muted-foreground text-xs font-medium">
                Rutas Posibles Detectadas
              </span>
              <span className="text-info text-lg font-bold">
                {routesDetectedCount}
              </span>
            </div>
            <div className="taskflow-input border rounded p-4 flex items-center justify-between bg-input-background">
              <span className="text-muted-foreground text-xs font-medium">
                Dependencias Cíclicas
              </span>
              <span className="text-destructive text-lg font-bold">
                {cyclicDependencies.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Dependencias Cíclicas */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-4 h-4 rounded-full bg-primary"></div>
          <h3 className="text-foreground text-base font-semibold">
            Dependencias Cíclicas
          </h3>
        </div>
        <div className="taskflow-card rounded-lg border p-6">
          {cyclicDependencies.length > 0 ? (
            <ul className="space-y-3">
              {cyclicDependencies.map((dependency, idx) => (
                <li
                  key={idx}
                  tabIndex={0}
                  className={`
                    group p-4 rounded border cursor-pointer select-none transition-all
                    border-info bg-info/10 text-info font-medium text-sm outline-none
                    hover:bg-info/20 hover:border-info
                    focus:bg-info/20 focus:border-info
                    active:bg-info/30
                  `}
                  style={{
                    position: "relative",
                  }}
                  aria-label="Dependencia cíclica"
                >
                  {dependency}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                No se detectaron dependencias cíclicas.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rutas de Ejecución Detectadas */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="text-primary" size={20} />
          <h3 className="text-foreground text-base font-semibold">
            Rutas de Ejecución Detectadas
          </h3>
        </div>
        <p className="text-muted-foreground text-xs mb-4">
          Seleccionar Ruta para Análisis
        </p>
        <div className="space-y-3">
          {currentRoutes.map((route) => (
            <div
              key={route.id}
              className={`w-full p-4 rounded border transition-all duration-200 cursor-pointer hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary ${
                selectedRoute === route.id
                  ? "border-info bg-info/20 shadow-lg"
                  : "border-border bg-card hover:bg-card/80"
              }`}
              onClick={() => setSelectedRoute(route.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Número de ruta en azul SIEMPRE */}
                  <div className="w-5 h-5 rounded flex items-center justify-center bg-info">
                    <span className="text-white text-xs font-medium">
                      {route.id}
                    </span>
                  </div>
                  <div className="text-left">
                    <h4 className="text-foreground text-sm font-medium">
                      {route.name}
                    </h4>
                    <p className="text-muted-foreground text-xs">
                      {route.path}
                    </p>
                  </div>
                </div>
                <span className="text-primary text-xs font-medium">
                  {route.duration}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-border">
        <div />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`text-xs px-3 py-1 ${
              currentPage === 1
                ? "text-muted-foreground cursor-not-allowed"
                : "text-foreground hover:text-primary"
            }`}
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`text-xs px-2 py-1 rounded ${
                currentPage === page
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:text-primary"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`text-xs px-3 py-1 ${
              currentPage === totalPages
                ? "text-muted-foreground cursor-not-allowed"
                : "text-foreground hover:text-primary"
            }`}
          >
            Siguiente
          </button>
        </div>
        <div className="text-muted-foreground text-xs">
          Página {currentPage} de {totalPages}
        </div>
      </div>
      <style>{`
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(8px);}
        to { opacity: 1; transform: translateY(0);}
      }
      .animate-fade-in {
        animation: fade-in 0.3s;
      }
      `}</style>
    </Layout>
  );
}