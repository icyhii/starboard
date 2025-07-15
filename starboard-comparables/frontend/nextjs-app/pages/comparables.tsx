import React, { useState } from "react";
import axios from "axios";

export default function Comparables() {
  const [form, setForm] = useState({
    square_feet: "",
    zoning: "",
    year_built: ""
  });
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/comparable", {
        square_feet: Number(form.square_feet),
        zoning: form.zoning,
        year_built: Number(form.year_built),
        latitude: 0, // Add lat/lon if available
        longitude: 0
      });
      setResults(res.data);
    } catch (err) {
      alert("Error fetching comparables");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto" }}>
      <h2>Find Comparables</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
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
        <label style={{ marginLeft: 20 }}>
          Zoning
          <input
            type="text"
            name="zoning"
            value={form.zoning}
            onChange={handleChange}
            required
          />
        </label>
        <label style={{ marginLeft: 20 }}>
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
        <button type="submit" style={{ marginLeft: 20 }} disabled={loading}>
          {loading ? "Searching..." : "Find Comparables"}
        </button>
      </form>
      {results.length > 0 && (
        <table border={1} cellPadding={8} style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Address</th>
              <th>Size (sqft)</th>
              <th>Year Built</th>
              <th>Zoning</th>
              <th>Distance</th>
              <th>Confidence Score</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i}>
                <td>{r.property.address || "N/A"}</td>
                <td>{r.property.square_feet}</td>
                <td>{r.property.year_built}</td>
                <td>{r.property.zoning}</td>
                <td>{r.breakdown.location ? (1 - r.breakdown.location) * 10000 : "N/A"} m</td>
                <td>{(r.score * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
