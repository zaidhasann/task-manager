import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const [focusTask, setFocusTask] = useState(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    dueDate: ""
  });

  useEffect(() => {
    fetchTasks();
  }, []);


  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title) {
      setError("Title is required");
      return;
    }

    try {
      const res = await api.post("/tasks", formData);
      setTasks([res.data, ...tasks]);
      setFormData({
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        dueDate: ""
      });
    } catch {
      setError("Failed to create task");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await api.put(`/tasks/${id}`, { status });
      setTasks(tasks.map(t => (t._id === id ? res.data : t)));
    } catch {
      setError("Failed to update task");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
    } catch {
      setError("Failed to delete task");
    }
  };

  const filteredTasks =
    (filter === "all"
      ? tasks
      : tasks.filter(task => task.status === filter)
    ).sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

  const isOverdue = (task) =>
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "completed";

  return (
    <>
      <Navbar />

      <div style={styles.wrapper}>
        <h1 style={styles.heading}>My Tasks</h1>

        {focusTask && (
          <div style={styles.focusOverlay}>
            <h2>Focus Mode</h2>
            <h3>{focusTask.title}</h3>
            <p>{focusTask.description}</p>

            <div style={styles.timer}>
              {formatTime(timeLeft)}
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                style={styles.addBtn}
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? "Pause" : "Start"}
              </button>

              <button
                style={styles.deleteBtn}
                onClick={() => {
                  setTimeLeft(25 * 60);
                  setIsRunning(false);
                }}
              >
                Reset
              </button>

              <button
                style={styles.filterBtn}
                onClick={() => {
                  setFocusTask(null);
                  setIsRunning(false);
                }}
              >
                Exit
              </button>
            </div>
          </div>
        )}

        {/* FILTER TABS */}
        <div style={styles.filters}>
          {["all", "pending", "in-progress", "completed"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...styles.filterBtn,
                background:
                  filter === f ? "var(--primary)" : "transparent",
                color: filter === f ? "#fff" : "var(--text)"
              }}
            >
              {f.replace("-", " ").toUpperCase()}
            </button>
          ))}
        </div>

        {/* ADD TASK */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="title"
            placeholder="Task title"
            value={formData.title}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            style={styles.input}
          />

          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <button type="submit" style={{ ...styles.addBtn, ...styles.btnBase }}>
            Add Task
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}
        {loading && <p>Loading tasks...</p>}

        {/* TASK GRID */}
        <div style={styles.grid}>
          {!focusTask &&
            filteredTasks.map(task => (
              <div
                key={task._id}
                style={{
                  ...styles.card,
                  borderLeft: isOverdue(task)
                    ? "4px solid #ef4444"
                    : "4px solid transparent"
                }}
              >
                <h3>{task.title}</h3>
                <p style={styles.desc}>{task.description}</p>

                <p style={{ fontSize: "12px" }}>
                  {task.dueDate &&
                    `📅 ${new Date(task.dueDate).toLocaleDateString()}`}
                  <span style={styles.priority(task.priority)}>
                    {task.priority?.toUpperCase()}
                  </span>
                </p>

                <select
                  value={task.status}
                  onChange={e =>
                    handleStatusChange(task._id, e.target.value)
                  }
                  style={styles.statusSelect}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                
                <button
                  style={{ ...styles.addBtn, marginTop: "8px" }}
                  onClick={() => {
                    setFocusTask(task);
                    setTimeLeft(25 * 60);
                    setIsRunning(false);
                  }}
                >
                  Focus
                </button>

                <button
                  onClick={() => handleDelete(task._id)}
                  style={{ ...styles.deleteBtn, ...styles.btnBase }}
                >
                  Delete
                </button>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}

const styles = {
  wrapper: {
    padding: "40px",
    maxWidth: "1200px",
    margin: "0 auto",
    animation: "fadeInUp 0.3s ease"
  },
  heading: {
    marginBottom: "16px"
  },
  filters: {
    display: "flex",
    gap: "10px",
    marginBottom: "25px"
  },
  filterBtn: {
    padding: "8px 14px",
    borderRadius: "20px",
    border: "1px solid var(--muted)",
    cursor: "pointer"
  },
  form: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "25px"
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid var(--muted)",
    flex: "1",
    background: "var(--card)",
    color: "var(--text)"
  },
  select: {
    padding: "10px",
    borderRadius: "6px",
    background: "var(--card)",
    color: "var(--text)"
  },
  addBtn: {
    background: "var(--primary)",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px"
  },
  card: {
    padding: "20px",
    borderRadius: "12px",
    background: "var(--card)",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    transition: "all 0.2s ease",
    animation: "fadeInUp 0.25s ease"
  },
  desc: {
    fontSize: "14px",
    color: "var(--muted)"
  },
  statusSelect: {
    marginTop: "10px",
    padding: "6px",
    borderRadius: "6px",
    width: "100%",
    background: "var(--card)",
    color: "var(--text)"
  },
  deleteBtn: {
    marginTop: "12px",
    background: "var(--danger)",
    border: "none",
    color: "#fff",
    padding: "8px",
    borderRadius: "6px",
    width: "100%",
    cursor: "pointer"
  },
  btnBase: {
    transition: "transform 0.15s ease, opacity 0.15s ease"
  },
  error: {
    color: "red",
    marginBottom: "10px"
  },
  priority: (level) => ({
    marginLeft: "8px",
    padding: "2px 8px",
    borderRadius: "10px",
    fontSize: "10px",
    color: "#fff",
    background:
      level === "high"
        ? "#ef4444"
        : level === "medium"
        ? "#f59e0b"
        : "#10b981"
  }),

  
  focusOverlay: {
    padding: "40px",
    borderRadius: "16px",
    background: "var(--card)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    textAlign: "center",
    marginBottom: "30px"
  },
  timer: {
    fontSize: "48px",
    fontWeight: "bold",
    margin: "20px 0"
  }
};
