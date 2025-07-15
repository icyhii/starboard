import { useState } from "react";

export default function PropertyInput() {
  const [form, setForm] = useState({
    square_feet: "",
    zoning: "",
    year_built: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: POST to backend /comparable endpoint
    alert(JSON.stringify(form, null, 2));
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h2>Property Input</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Square Footage
          <input
            type="number"
            name="square_feet"
            value={form.square_feet}
            onChange={handleChange}
            required
            min={0}
          />
        </label>
        <br />
        <label>
          Zoning
          <input
            type="text"
            name="zoning"
            value={form.zoning}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Year Built
          <input
            type="number"
            name="year_built"
            value={form.year_built}
            onChange={handleChange}
            required
            min={1900}
            max={new Date().getFullYear()}
          />
        </label>
        <br />
        <button type="submit">Find Comparables</button>
      </form>
    </div>
  );
}
