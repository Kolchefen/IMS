// Utility for API calls to backend
export async function fetchInventoryData() {
  const res = await fetch('http://localhost:4000/api/data');
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
}

export async function saveInventoryData(data: any) {
  const res = await fetch('http://localhost:4000/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save data');
  return res.json();
}
