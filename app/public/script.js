document.addEventListener('DOMContentLoaded', () => {
  const output = document.getElementById('output');

  const fetchEndpoint = async (url) => {
    output.textContent = 'Loading...';
    try {
      const res = await fetch(url);
      const data = await res.json();
      output.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      output.textContent = 'Error: ' + err.message;
    }
  };

  document.getElementById('btnData').addEventListener('click', () => fetchEndpoint('/api/data'));
  document.getElementById('btnSlow').addEventListener('click', () => fetchEndpoint('/api/slow'));
  document.getElementById('btnCpu').addEventListener('click', () => fetchEndpoint('/api/cpu'));
});