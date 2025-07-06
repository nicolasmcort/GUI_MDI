import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";

interface Task {
  id: number;
  name: string;
  duration: number;
  unit: "Horas" | "Minutos";
  priority: "High" | "Medium" | "Low" | "Critical";
  dependencies: string;
}

const PRIORITY_MAP: { [k: string]: Task["priority"] } = {
  Baja: "Low",
  Media: "Medium",
  Alta: "High",
  Crítica: "Critical",
};

const REVERSE_PRIORITY_MAP: { [k in Task["priority"]]: string } = {
  Low: "Baja",
  Medium: "Media",
  High: "Alta",
  Critical: "Crítica",
};

export default function TaskManagement() {
  const navigate = useNavigate();
  const itemsPerPage = 5;

  const [allTasks, setAllTasks] = useState<Task[]>([
    {
      id: 1,
      name: "Design UI mockups",
      duration: 5,
      unit: "Horas",
      priority: "High",
      dependencies: "Ninguna",
    },
    {
      id: 2,
      name: "Implement backend API",
      duration: 8,
      unit: "Horas",
      priority: "High",
      dependencies: "1",
    },
    {
      id: 3,
      name: "Frontend development",
      duration: 12,
      unit: "Minutos",
      priority: "Medium",
      dependencies: "1, 2",
    },
    {
      id: 4,
      name: "Testing and QA",
      duration: 4,
      unit: "Horas",
      priority: "High",
      dependencies: "3",
    },
    {
      id: 5,
      name: "Deploy to production",
      duration: 2,
      unit: "Minutos",
      priority: "Critical",
      dependencies: "4",
    },
  ]);

  // Calcula las páginas automáticamente al cargar y cada vez que cambian las tareas
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(allTasks.length / itemsPerPage));

  // Form state
  const [taskName, setTaskName] = useState("");
  const [duration, setDuration] = useState("");
  const [unit, setUnit] = useState<"Horas" | "Minutos">("Horas");
  const [priority, setPriority] = useState<"Baja" | "Media" | "Alta" | "Crítica">("Baja");
  const [dependencies, setDependencies] = useState("");
  const [searchId, setSearchId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"error" | "success">("success");
  const [lastTaskId, setLastTaskId] = useState<number | null>(null);

  // Pagination helpers
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTasks = allTasks.slice(startIndex, endIndex);

  // Show message and auto-clear
  function showMessage(msg: string, type: "success" | "error") {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(null), 3000);
  }

  // Parse dependencias, retorna array de IDs válidos y mensaje de error si hay alguno inválido
  function parseDependencies(input: string, excludeId?: number): {ids: number[], error?: string} {
    const cleaned = input.replace(/\s/g, "");
    if (!cleaned) return { ids: [] };
    if (cleaned === "Ninguna") return { ids: [] };
    const ids = cleaned.split(",").filter(Boolean).map(Number);
    // Solo números enteros positivos
    if (ids.some(id => !Number.isInteger(id) || id < 1)) {
      return { ids: [], error: "Las dependencias deben ser IDs numéricos mayores que 0." };
    }
    // Verificar existencia (excluyendo el propio ID si se actualiza)
    const validIds = allTasks.map(t => t.id);
    if (excludeId) {
      const idx = validIds.indexOf(excludeId);
      if (idx !== -1) validIds.splice(idx, 1);
    }
    const invalid = ids.filter(id => !validIds.includes(id));
    if (invalid.length > 0) {
      return { ids: [], error: `Las siguientes dependencias no existen: ${invalid.join(", ")}.` };
    }
    // Quitar repetidos
    return { ids: [...new Set(ids)] };
  }

  // Add Task
  function handleAddTask() {
    if (!taskName.trim()) {
      showMessage("El campo 'Nombre de la Tarea' es obligatorio.", "error");
      return;
    }
    if (!duration.trim() || isNaN(Number(duration)) || Number(duration) < 1) {
      showMessage("La duración debe ser un número mayor que cero.", "error");
      return;
    }
    if (allTasks.some(t => t.name === taskName.trim())) {
      showMessage("Ya existe una tarea con ese nombre.", "error");
      return;
    }
    const { ids, error } = parseDependencies(dependencies);
    if (error) {
      showMessage(error, "error");
      return;
    }
    const newId = allTasks.length ? Math.max(...allTasks.map(t => t.id)) + 1 : 1;
    const task: Task = {
      id: newId,
      name: taskName.trim(),
      duration: Number(duration),
      unit,
      priority: PRIORITY_MAP[priority],
      dependencies: ids.length ? ids.join(", ") : "Ninguna",
    };
    setAllTasks(prev => {
      const updated = [...prev, task];
      return updated;
    });
    setLastTaskId(newId);
    showMessage(`Tarea agregada. El ID es ${newId}.`, "success");
    setTaskName("");
    setDuration("");
    setDependencies("");
    setSearchId("");
  }

  // Update Task
  function handleUpdateTask() {
    if (!searchId.trim() || isNaN(Number(searchId))) {
      showMessage("Ingrese un ID válido para actualizar.", "error");
      return;
    }
    const id = Number(searchId);
    const idx = allTasks.findIndex(t => t.id === id);
    if (idx === -1) {
      showMessage("No existe una tarea con ese ID.", "error");
      return;
    }
    if (!taskName.trim()) {
      showMessage("El campo 'Nombre de la Tarea' es obligatorio para actualizar.", "error");
      return;
    }
    if (!duration.trim() || isNaN(Number(duration)) || Number(duration) < 1) {
      showMessage("La duración debe ser un número mayor que cero.", "error");
      return;
    }
    const { ids, error } = parseDependencies(dependencies, id);
    if (error) {
      showMessage(error, "error");
      return;
    }
    const updated: Task = {
      id,
      name: taskName.trim(),
      duration: Number(duration),
      unit,
      priority: PRIORITY_MAP[priority],
      dependencies: ids.length ? ids.join(", ") : "Ninguna",
    };
    setAllTasks(prev => {
      const arr = [...prev];
      arr[idx] = updated;
      return arr;
    });
    setLastTaskId(id);
    showMessage(`Tarea actualizada correctamente (ID ${id}).`, "success");
    setTaskName("");
    setDuration("");
    setDependencies("");
    setSearchId("");
  }

  // Delete Task
  function handleDeleteTask() {
    if (!searchId.trim() || isNaN(Number(searchId))) {
      showMessage("Ingrese un ID válido para eliminar.", "error");
      return;
    }
    const id = Number(searchId);
    if (!allTasks.some(t => t.id === id)) {
      showMessage("No existe una tarea con ese ID.", "error");
      return;
    }
    setAllTasks(prev => {
      // Elimina la tarea
      let updated = prev.filter(t => t.id !== id);
      // Quitar referencias a este ID en dependencias de otras tareas
      updated = updated.map(t => {
        if (t.dependencies === "Ninguna") return t;
        const depArr = t.dependencies.split(",").map(d => d.trim()).filter(Boolean);
        const newDeps = depArr.filter(depId => depId !== String(id));
        return {
          ...t,
          dependencies: newDeps.length ? newDeps.join(", ") : "Ninguna",
        };
      });
      return updated;
    });
    setLastTaskId(null);
    showMessage(`Tarea eliminada correctamente (ID ${id}).`, "success");
    setTaskName("");
    setDuration("");
    setDependencies("");
    setUnit("Horas");
    setPriority("Baja");
    setSearchId("");
  }

  // Search Task by ID (lupa)
  function handleSearchTask() {
    if (!searchId.trim() || isNaN(Number(searchId))) {
      showMessage("Ingrese un ID válido para buscar.", "error");
      return;
    }
    const id = Number(searchId);
    const task = allTasks.find(t => t.id === id);
    if (!task) {
      showMessage("No existe una tarea con ese ID.", "error");
      return;
    }
    setTaskName(task.name);
    setDuration(task.duration.toString());
    setUnit(task.unit);
    setPriority(REVERSE_PRIORITY_MAP[task.priority] as "Baja" | "Media" | "Alta" | "Crítica");
    setDependencies(task.dependencies !== "Ninguna" ? task.dependencies : "");
    setLastTaskId(id);
    showMessage("Tarea cargada en el formulario.", "success");
  }

  const rightContent = (
    <div
      className="flex items-center gap-2 text-xs"
      style={{ color: "#9CA3AF" }}
    >
      <span>Total:</span>
      <span style={{ color: "#00D4AA", fontWeight: 500 }}>
        {allTasks.length}
      </span>
      <span>tareas</span>
      <div
        className="w-2 h-2 rounded-full ml-2"
        style={{ backgroundColor: "#00D4AA", opacity: 0.838 }}
      ></div>
    </div>
  );

  return (
    <Layout title="Panel de Control de Tareas" rightContent={rightContent}>
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Task Entry Form */}
        <div
          className="rounded-lg border p-6"
          style={{ backgroundColor: "#16213E", borderColor: "#374151" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 2C10.2652 2 10.5196 2.10536 10.7071 2.29289C10.8946 2.48043 11 2.73478 11 3V9H17C17.2652 9 17.5196 9.10536 17.7071 9.29289C17.8946 9.48043 18 9.73478 18 10C18 10.2652 17.8946 10.5196 17.7071 10.7071C17.5196 10.8946 17.2652 11 17 11H11V17C11 17.2652 10.8946 17.5196 10.7071 17.7071C10.5196 17.8946 10.2652 18 10 18C9.73478 18 9.48043 17.8946 9.29289 17.7071C9.10536 17.5196 9 17.2652 9 17V11H3C2.73478 11 2.48043 10.8946 2.29289 10.7071C2.10536 10.5196 2 10.2652 2 10C2 9.73478 2.10536 9.48043 2.29289 9.29289C2.48043 9.10536 2.73478 9 3 9H9V3C9 2.73478 9.10536 2.48043 9.29289 2.29289C9.48043 2.10536 9.73478 2 10 2Z"
                fill="#00D4AA"
              />
            </svg>
            <h3
              className="text-base font-semibold"
              style={{ color: "#E5E7EB", fontFamily: "Inter" }}
            >
              Entrada de Tareas
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label
                className="text-xs font-medium block mb-2"
                style={{ color: "#9CA3AF", fontFamily: "Inter" }}
              >
                Nombre de la Tarea
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={taskName}
                  onChange={e => setTaskName(e.target.value)}
                  className="w-full h-[39px] px-3 rounded border text-sm"
                  style={{
                    backgroundColor: "#0F0F23",
                    borderColor: "#374151",
                    color: "#FFF",
                    fontFamily: "Inter",
                  }}
                  placeholder="Ingrese el nombre de la tarea..."
                />
              </div>
              {lastTaskId && (
                <div className="text-xs mt-1" style={{ color: "#00D4AA" }}>
                  ID de la última tarea añadida o editada: <b>{lastTaskId}</b>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="text-xs font-medium block mb-2"
                  style={{ color: "#9CA3AF", fontFamily: "Inter" }}
                >
                  Duración
                </label>
                <input
                  type="number"
                  min={1}
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full h-[39px] px-3 rounded border text-sm"
                  style={{
                    backgroundColor: "#0F0F23",
                    borderColor: "#374151",
                    color: "#999",
                    fontFamily: "Inter",
                  }}
                  placeholder="0"
                />
              </div>
              <div>
                <label
                  className="text-xs font-medium block mb-2"
                  style={{ color: "#9CA3AF", fontFamily: "Inter" }}
                >
                  Unidad
                </label>
                <select
                  value={unit}
                  onChange={e => setUnit(e.target.value as "Horas" | "Minutos")}
                  className="w-full h-[37px] px-3 rounded border text-sm"
                  style={{
                    backgroundColor: "#0F0F23",
                    borderColor: "#374151",
                    color: "#FFF",
                    fontFamily: "Inter",
                  }}
                >
                  <option value="Horas">Horas</option>
                  <option value="Minutos">Minutos</option>
                </select>
              </div>
            </div>

            <div>
              <label
                className="text-xs font-medium block mb-2"
                style={{ color: "#9CA3AF", fontFamily: "Inter" }}
              >
                Prioridad
              </label>
              <select
                value={priority}
                onChange={e =>
                  setPriority(e.target.value as "Baja" | "Media" | "Alta" | "Crítica")
                }
                className="w-full h-[37px] px-3 rounded border text-sm"
                style={{
                  backgroundColor: "#0F0F23",
                  borderColor: "#374151",
                  color: "#FFF",
                  fontFamily: "Inter",
                }}
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Crítica">Crítica</option>
              </select>
            </div>

            <div>
              <label
                className="text-xs font-medium block mb-2"
                style={{ color: "#9CA3AF", fontFamily: "Inter" }}
              >
                Dependencias (IDs separados por comas)
              </label>
              <input
                type="text"
                value={dependencies}
                onChange={e => setDependencies(e.target.value)}
                className="w-full h-[39px] px-3 rounded border text-sm"
                style={{
                  backgroundColor: "#0F0F23",
                  borderColor: "#374151",
                  color: "#999",
                  fontFamily: "Inter",
                }}
                placeholder="1, 2, 3"
              />
            </div>

            <button
              type="button"
              onClick={handleAddTask}
              className="w-full h-[40px] rounded flex items-center justify-center gap-2 text-base font-semibold"
              style={{
                backgroundColor: "#00D4AA",
                color: "#0F0F23",
                fontFamily: "Inter",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.00001 1.60001C8.21218 1.60001 8.41566 1.68429 8.56569 1.83432C8.71572 1.98435 8.80001 2.18783 8.80001 2.40001V7.20001H13.6C13.8122 7.20001 14.0157 7.28429 14.1657 7.43432C14.3157 7.58435 14.4 7.78783 14.4 8.00001C14.4 8.21218 14.3157 8.41566 14.1657 8.56569C14.0157 8.71572 13.8122 8.80001 13.6 8.80001H8.80001V13.6C8.80001 13.8122 8.71572 14.0157 8.56569 14.1657C8.41566 14.3157 8.21218 14.4 8.00001 14.4C7.78783 14.4 7.58435 14.3157 7.43432 14.1657C7.28429 14.0157 7.20001 13.8122 7.20001 13.6V8.80001H2.40001C2.18783 8.80001 1.98435 8.71572 1.83432 8.56569C1.68429 8.41566 1.60001 8.21218 1.60001 8.00001C1.60001 7.78783 1.68429 7.58435 1.83432 7.43432C1.98435 7.28429 2.18783 7.20001 2.40001 7.20001H7.20001V2.40001C7.20001 2.18783 7.28429 1.98435 7.43432 1.83432C7.58435 1.68429 7.78783 1.60001 8.00001 1.60001Z"
                  fill="black"
                />
              </svg>
              Agregar Tarea
            </button>
            {message && (
              <div
                className="text-xs mt-2"
                style={{
                  color: messageType === "error" ? "#DC2626" : "#00D4AA",
                  fontFamily: "Inter",
                }}
              >
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Search and Management */}
        <div
          className="rounded-lg border p-6"
          style={{ backgroundColor: "#16213E", borderColor: "#374151" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8 4C6.93913 4 5.92172 4.42143 5.17157 5.17158C4.42143 5.92172 4 6.93914 4 8C4 9.06087 4.42143 10.0783 5.17157 10.8284C5.92172 11.5786 6.93913 12 8 12C9.06087 12 10.0783 11.5786 10.8284 10.8284C11.5786 10.0783 12 9.06087 12 8C12 6.93914 11.5786 5.92172 10.8284 5.17158C10.0783 4.42143 9.06087 4 8 4ZM2 8C2 5.23858 4.23858 3 8 3C11.7614 3 14 5.23858 14 8C14 10.7614 11.7614 13 8 13C4.23858 13 2 10.7614 2 8Z"
                fill="#00D4AA"
              />
            </svg>
            <h3
              className="text-base font-semibold"
              style={{ color: "#E5E7EB", fontFamily: "Inter" }}
            >
              Gestión y Búsqueda
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label
                className="text-xs font-medium block mb-2"
                style={{ color: "#9CA3AF", fontFamily: "Inter" }}
              >
                ID de Tarea para Gestión
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchId}
                  onChange={e => setSearchId(e.target.value)}
                  className="flex-1 h-[39px] px-3 rounded border text-sm"
                  style={{
                    backgroundColor: "#0F0F23",
                    borderColor: "#374151",
                    color: "#999",
                    fontFamily: "Inter",
                  }}
                  placeholder="Ingrese ID..."
                />
                <div
                  className="w-[40px] h-[39px] rounded border flex items-center justify-center cursor-pointer"
                  style={{
                    backgroundColor: "#374151",
                    borderColor: "#374151",
                  }}
                  title="Buscar tarea por ID"
                  onClick={handleSearchTask}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M6.39998 3.19999C5.55128 3.19999 4.73735 3.53714 4.13723 4.13725C3.53712 4.73737 3.19998 5.5513 3.19998 6.39999C3.19998 7.24869 3.53712 8.06262 4.13723 8.66274C4.73735 9.26285 5.55128 9.59999 6.39998 9.59999C7.24867 9.59999 8.0626 9.26285 8.66272 8.66274C9.26283 8.06262 9.59998 7.24869 9.59998 6.39999C9.59998 5.5513 9.26283 4.73737 8.66272 4.13725C8.0626 3.53714 7.24867 3.19999 6.39998 3.19999ZM1.59998 6.39999C1.59998 4.09316 4.09315 1.59999 6.39998 1.59999C8.70681 1.59999 11.2 4.09316 11.2 6.39999C11.2 8.70682 8.70681 11.2 6.39998 11.2C4.09315 11.2 1.59998 8.70682 1.59998 6.39999ZM10.5781 10.5781C10.8349 10.3213 11.248 10.3213 11.5048 10.5781L14.5048 13.5781C14.7616 13.8349 14.7616 14.248 14.5048 14.5048C14.248 14.7616 13.8349 14.7616 13.5781 14.5048L10.5781 11.5048C10.3213 11.248 10.3213 10.8349 10.5781 10.5781Z"
                      fill="white"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleUpdateTask}
                className="h-[34px] rounded text-xs font-medium flex items-center justify-center"
                style={{
                  backgroundColor: "#2563EB",
                  color: "#FFF",
                  fontFamily: "Inter",
                }}
              >
                Actualizar Tarea 
              </button>
              <button
                onClick={handleDeleteTask}
                className="h-[34px] rounded text-xs font-medium flex items-center justify-center"
                style={{
                  backgroundColor: "#DC2626",
                  color: "#FFF",
                  fontFamily: "Inter",
                }}
              >
                Eliminar Tarea
              </button>
            </div>

            <button
              onClick={() => navigate("/analysis")}
              className="w-full h-[40px] rounded flex items-center justify-center gap-2 text-base font-semibold"
              style={{
                background: "linear-gradient(90deg, #A855F7 100%, #7C3AED 0%)",
                color: "#FFF",
                fontFamily: "Inter",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M2.39998 2.39999C2.1878 2.39999 1.98432 2.48428 1.83429 2.63431C1.68426 2.78434 1.59998 2.98782 1.59998 3.19999C1.59998 3.41217 1.68426 3.61565 1.83429 3.76568C1.98432 3.9157 2.1878 3.99999 2.39998 3.99999H13.6C13.8122 3.99999 14.0157 3.9157 14.1657 3.76568C14.3157 3.61565 14.4 3.41217 14.4 3.19999C14.4 2.98782 14.3157 2.78434 14.1657 2.63431C14.0157 2.48428 13.8122 2.39999 13.6 2.39999H2.39998ZM2.39998 7.19999C2.1878 7.19999 1.98432 7.28428 1.83429 7.43431C1.68426 7.58434 1.59998 7.78782 1.59998 7.99999C1.59998 8.21217 1.68426 8.41565 1.83429 8.56568C1.98432 8.7157 2.1878 8.79999 2.39998 8.79999H13.6C13.8122 8.79999 14.0157 8.7157 14.1657 8.56568C14.3157 8.41565 14.4 8.21217 14.4 7.99999C14.4 7.78782 14.3157 7.58434 14.1657 7.43431C14.0157 7.28428 13.8122 7.19999 13.6 7.19999H2.39998ZM1.59998 12C1.59998 11.7878 1.68426 11.5843 1.83429 11.4343C1.98432 11.2843 2.1878 11.2 2.39998 11.2H13.6C13.8122 11.2 14.0157 11.2843 14.1657 11.4343C14.3157 11.5843 14.4 11.7878 14.4 12C14.4 12.2122 14.3157 12.4157 14.1657 12.5657C14.0157 12.7157 13.8122 12.8 13.6 12.8H2.39998C2.1878 12.8 1.98432 12.7157 1.83429 12.5657C1.68426 12.4157 1.59998 12.2122 1.59998 12Z"
                  fill="white"
                />
              </svg>
              Generar Plan / Calcular Ruta Crítica
            </button>
          </div>
        </div>
      </div>

      {/* Task Visualization Table */}
      <div
        className="rounded-lg border"
        style={{ backgroundColor: "#16213E", borderColor: "#374151" }}
      >
        <div className="p-6 border-b" style={{ borderColor: "#374151" }}>
          <div className="flex items-center gap-3">
            <svg
              width="21"
              height="21"
              viewBox="0 0 21 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.20605 4.50586C3.20605 4.24064 3.31141 3.98629 3.49895 3.79875C3.68648 3.61122 3.94084 3.50586 4.20605 3.50586H16.2061C16.4713 3.50586 16.7256 3.61122 16.9132 3.79875C17.1007 3.98629 17.2061 4.24064 17.2061 4.50586V16.5059C17.2061 16.7711 17.1007 17.0255 16.9132 17.213C16.7256 17.4006 16.4713 17.5059 16.2061 17.5059H4.20605C3.94084 17.5059 3.68648 17.4006 3.49895 17.213C3.31141 17.0255 3.20605 16.7711 3.20605 16.5059V4.50586Z"
                fill="#00D4AA"
              />
            </svg>
            <h3
              className="text-base font-semibold"
              style={{ color: "#E5E7EB", fontFamily: "Inter" }}
            >
              Visualización de Tareas
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b" style={{ borderColor: "#374151" }}>
              <tr className="text-xs font-medium" style={{ color: "#9CA3AF" }}>
                <th className="text-left p-4" style={{ fontFamily: "Inter" }}>
                  ID
                </th>
                <th className="text-left p-4" style={{ fontFamily: "Inter" }}>
                  Nombre
                </th>
                <th className="text-left p-4" style={{ fontFamily: "Inter" }}>
                  Duración
                </th>
                <th className="text-left p-4" style={{ fontFamily: "Inter" }}>
                  Unidad
                </th>
                <th className="text-left p-4" style={{ fontFamily: "Inter" }}>
                  Prioridad
                </th>
                <th className="text-left p-4" style={{ fontFamily: "Inter" }}>
                  Dependencias
                </th>
              </tr>
            </thead>
            <tbody>
              {currentTasks.map((task) => (
                <tr key={task.id} className="border-b border-black">
                  <td
                    className="p-4 text-sm"
                    style={{ color: "#E5E7EB", fontFamily: "Inter" }}
                  >
                    {task.id}
                  </td>
                  <td
                    className="p-4 text-sm"
                    style={{ color: "#E5E7EB", fontFamily: "Inter" }}
                  >
                    {task.name}
                  </td>
                  <td className="p-4 text-sm" style={{ fontFamily: "Inter" }}>
                    <span style={{ color: "#E5E7EB" }}>{task.duration}</span>
                  </td>
                  <td className="p-4 text-sm" style={{ fontFamily: "Inter", color: "#9CA3AF" }}>
                    {task.unit}
                  </td>
                  <td className="p-4">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium text-white"
                      style={{
                        backgroundColor:
                          task.priority === "High"
                            ? "#EA580C"
                            : task.priority === "Medium"
                              ? "#2563EB"
                              : task.priority === "Critical"
                                ? "#DC2626"
                                : "#6B7280",
                        fontFamily: "Inter",
                      }}
                    >
                      {REVERSE_PRIORITY_MAP[task.priority]}
                    </span>
                  </td>
                  <td
                    className="p-4 text-sm"
                    style={{ color: "#9CA3AF", fontFamily: "Inter" }}
                  >
                    {task.dependencies}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          className="flex items-center justify-between p-4 border-t"
          style={{ borderColor: "#374151" }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="text-xs px-3 py-1"
              style={{
                color: currentPage === 1 ? "#6B7280" : "#E5E7EB",
                fontFamily: "Inter",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor:
                    currentPage === page ? "#00D4AA" : "transparent",
                  color: currentPage === page ? "#0F0F23" : "#E5E7EB",
                  fontFamily: "Inter",
                  border: currentPage === page ? "none" : "1px solid #374151",
                }}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="text-xs px-3 py-1"
              style={{
                color: currentPage === totalPages ? "#6B7280" : "#E5E7EB",
                fontFamily: "Inter",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Siguiente
            </button>
          </div>
          <div
            className="text-xs"
            style={{ color: "#9CA3AF", fontFamily: "Inter" }}
          >
            Página {currentPage} de {totalPages}
          </div>
        </div>
      </div>
    </Layout>
  );
}