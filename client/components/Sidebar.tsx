import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  return (
    <div
      className="w-[280px] h-screen flex flex-col shrink-0"
      style={{ backgroundColor: "#1A1A2E", borderRight: "1px solid #16213E" }}
    >
      {/* Header */}
      <div
        className="h-[101px] flex flex-col justify-center px-6"
        style={{ borderBottom: "1px solid #16213E" }}
      >
        <h1
          className="text-xl font-bold leading-[30px]"
          style={{ color: "#00D4AA", fontFamily: "Inter" }}
        >
          TaskFlow Pro
        </h1>
        <p
          className="text-xs leading-[18px]"
          style={{ color: "#9CA3AF", fontFamily: "Inter" }}
        >
          Critical Path Management System
        </p>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1"
        style={{ marginBottom: "120px", padding: "16px 16px 0" }}
      >
        <div className="space-y-1">
          {/* Gestión de Tareas - Active */}
          <Link
            to="/tasks"
            className="flex items-center gap-3 px-4 py-3 h-[37px] rounded-md text-sm font-medium"
            style={{
              backgroundColor:
                location.pathname === "/tasks" || location.pathname === "/"
                  ? "#16213E"
                  : "transparent",
              borderLeft:
                location.pathname === "/tasks" || location.pathname === "/"
                  ? "2px solid #00D4AA"
                  : "none",
              color:
                location.pathname === "/tasks" || location.pathname === "/"
                  ? "#00D4AA"
                  : "#9CA3AF",
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
                d="M7.2 1.60001C6.98783 1.60001 6.78435 1.68429 6.63432 1.83432C6.48429 1.98435 6.4 2.18783 6.4 2.40001C6.4 2.61218 6.48429 2.81566 6.63432 2.96569C6.78435 3.11572 6.98783 3.20001 7.2 3.20001H8.8C9.01217 3.20001 9.21566 3.11572 9.36569 2.96569C9.51572 2.81566 9.6 2.61218 9.6 2.40001C9.6 2.18783 9.51572 1.98435 9.36569 1.83432C9.21566 1.68429 9.01217 1.60001 8.8 1.60001H7.2Z"
                fill="currentColor"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.2 3.99999C3.2 3.57565 3.36857 3.16868 3.66863 2.86862C3.96869 2.56856 4.37565 2.39999 4.8 2.39999V3.19999C4.8 3.41217 4.88429 3.61565 5.03432 3.76568C5.18434 3.91571 5.38783 3.99999 5.6 3.99999C5.81217 3.99999 6.01566 3.91571 6.16569 3.76568C6.31572 3.61565 6.4 3.41217 6.4 3.19999V2.39999H9.6V3.19999C9.6 3.41217 9.68429 3.61565 9.83432 3.76568C9.98434 3.91571 10.1878 3.99999 10.4 3.99999C10.6122 3.99999 10.8157 3.91571 10.9657 3.76568C11.1157 3.61565 11.2 3.41217 11.2 3.19999V2.39999C11.6243 2.39999 12.0313 2.56856 12.3314 2.86862C12.6314 3.16868 12.8 3.57565 12.8 3.99999V8.79999C12.8 9.22434 12.6314 9.63131 12.3314 9.93136C12.0313 10.2314 11.6243 10.4 11.2 10.4H4.8C4.37565 10.4 3.96869 10.2314 3.66863 9.93136C3.36857 9.63131 3.2 9.22434 3.2 8.79999V3.99999Z"
                fill="currentColor"
              />
            </svg>
            Gestión de Tareas
          </Link>

          {/* Análisis CPM */}
          <Link
            to="/analysis"
            className="flex items-center gap-3 px-4 py-3 h-[37px] rounded-md text-sm font-medium"
            style={{
              backgroundColor:
                location.pathname === "/analysis" ? "#16213E" : "transparent",
              borderLeft:
                location.pathname === "/analysis"
                  ? "2px solid #00D4AA"
                  : "none",
              color: location.pathname === "/analysis" ? "#00D4AA" : "#9CA3AF",
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
                d="M2.4 2.39999C2.18783 2.39999 1.98434 2.48428 1.83431 2.63431C1.68429 2.78434 1.6 2.98782 1.6 3.19999C1.6 3.41217 1.68429 3.61565 1.83431 3.76568C1.98434 3.91571 2.18783 3.99999 2.4 3.99999V10.4C2.4 10.8243 2.56857 11.2313 2.86863 11.5314C3.16869 11.8314 3.57565 12 4 12H6.0688L5.0344 13.0344C4.95799 13.1082 4.89705 13.1965 4.85512 13.2941C4.81319 13.3917 4.79112 13.4966 4.7902 13.6029C4.78928 13.7091 4.80952 13.8144 4.84974 13.9128C4.88997 14.0111 4.94937 14.1004 5.02448 14.1755C5.0996 14.2506 5.18892 14.31 5.28724 14.3503C5.38555 14.3905 5.4909 14.4107 5.59712 14.4098C5.70334 14.4089 5.80832 14.3868 5.90592 14.3449C6.00353 14.3029 6.0918 14.242 6.1656 14.1656L8 12.3312L9.8344 14.1656C9.98528 14.3113 10.1874 14.392 10.3971 14.3901C10.6069 14.3883 10.8075 14.3042 10.9559 14.1558C11.1042 14.0075 11.1883 13.8069 11.1901 13.5971C11.192 13.3874 11.1113 13.1853 10.9656 13.0344L9.9312 12H12C12.4243 12 12.8313 11.8314 13.1314 11.5314C13.4314 11.2313 13.6 10.8243 13.6 10.4V3.99999C13.8122 3.99999 14.0157 3.91571 14.1657 3.76568C14.3157 3.61565 14.4 3.41217 14.4 3.19999C14.4 2.98782 14.3157 2.78434 14.1657 2.63431C14.0157 2.48428 13.8122 2.39999 13.6 2.39999H2.4ZM11.7656 6.16559C11.9113 6.01471 11.992 5.81263 11.9901 5.60287C11.9883 5.39312 11.9042 5.19247 11.7559 5.04414C11.6075 4.89581 11.4069 4.81168 11.1971 4.80985C10.9874 4.80803 10.7853 4.88867 10.6344 5.03439L8 7.66879L6.9656 6.63439C6.81472 6.48867 6.61264 6.40803 6.40288 6.40985C6.19312 6.41168 5.99247 6.49581 5.84415 6.64414C5.69582 6.79247 5.61168 6.99312 5.60986 7.20287C5.60804 7.41263 5.68867 7.61471 5.8344 7.76559L7.4344 9.36559C7.58442 9.51557 7.78787 9.59982 8 9.59982C8.21213 9.59982 8.41558 9.51557 8.5656 9.36559L11.7656 6.16559Z"
                fill="currentColor"
              />
            </svg>
            Análisis CPM
          </Link>
        </div>
      </nav>
    </div>
  );
}
