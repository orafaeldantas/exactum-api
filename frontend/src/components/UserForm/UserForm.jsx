import { useState, useEffect } from "react";
import styles from "./UserForm.module.css";

export default function UserForm({ initialData = {}, onSubmit, submitText }) {

  const [username, setUsername] = useState("");
  const [role, setRole] = useState("user");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialData) {
      setUsername(initialData.username || "");
      setRole(initialData.role || "user");
      setIsActive(initialData.is_active ?? true);
    }
  }, [initialData]);

  function handleSubmit(e) {
    e.preventDefault();

    onSubmit({
      username,
      role,
      is_active: isActive
    });
  }

  return (

    <form className={styles.formContainer} onSubmit={handleSubmit}>
  
      <div className={styles.formGroup}>
        <label>Usuário</label>
  
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
  
      <div className={styles.formGroup}>
        <label>Tipo de usuário</label>
  
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">Usuário</option>
          <option value="admin">Administrador</option>
        </select>
      </div>
  
      <div className={styles.formGroup}>
        <label>Status</label>
  
        <select
          value={isActive}
          onChange={(e) => setIsActive(e.target.value === "true")}
        >
          <option value="true">Ativo</option>
          <option value="false">Inativo</option>
        </select>
      </div>
  
      <button className={styles.formButton} type="submit">
        {submitText}
      </button>
  
    </form>

  );
}