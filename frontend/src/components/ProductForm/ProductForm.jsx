import { useState, useEffect } from "react";
import styles from "./ProductForm.module.css";

export default function ProductForm({
  initialData = {},
  onSubmit,
  submitText = "Salvar"
}) {

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState(0);
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setPrice(initialData.price || "");
      setStockQuantity(initialData.stock_quantity || 0);
      setSku(initialData.sku || "");
      setCategory(initialData.category || "");
      setIsActive(initialData.is_active ?? true);
    }
  }, [initialData]);

  function handleSubmit(e) {
    e.preventDefault();

    onSubmit({
      name,
      description,
      price: parseFloat(price),
      stock_quantity: parseInt(stockQuantity),
      sku,
      category,
      is_active: isActive
    });
  }

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>

      <h2 className={styles.title}>Produto</h2>

      <div className={styles.formGroup}>
        <label>Nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>Descrição</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className={styles.formRow}>

        <div className={styles.formGroup}>
          <label>Preço</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Estoque</label>
          <input
            type="number"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            required
          />
        </div>

      </div>

      <div className={styles.formRow}>

        <div className={styles.formGroup}>
          <label>SKU</label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Categoria</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

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

      <button className={styles.submitButton} type="submit">
        {submitText}
      </button>

    </form>
  );
}