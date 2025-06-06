import React, { useEffect, useState } from 'react';

function App() {
  const [names, setNames] = useState([]);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetch('/api/list-names')
      .then((res) => res.json())
      .then((data) => setNames(data))
      .catch((err) => console.error('Erro ao buscar nomes:', err));
  }, []);

  const handleAddName = async () => {
    if (!newName.trim()) return;

    try {
      const response = await fetch('/api/add-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });

      if (response.ok) {
        setNames([...names, { name: newName }]);
        setNewName('');
      } else {
        alert('Erro ao adicionar nome');
      }
    } catch (error) {
      console.error('Erro ao adicionar nome:', error);
      alert('Erro ao adicionar nome');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Lista de Nomes</h1>
      <ul>
        {names.map((n, index) => (
          <li key={index}>{n.name}</li>
        ))}
      </ul>

      <div style={{ marginTop: '1rem' }}>
        <input
          type="text"
          placeholder="Novo nome"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button onClick={handleAddName}>Adicionar Nome</button>
      </div>
    </div>
  );
}

export default App;
