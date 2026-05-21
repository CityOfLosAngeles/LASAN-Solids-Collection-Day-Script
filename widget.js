// widget.js - Hosted on GitHub / jsDelivr
(function() {
  const config = window._my_widget_config || {};
  const containerId = config.container || 'my-widget-container';
  const targetElement = document.getElementById(containerId);

  if (!targetElement) {
    console.error('Widget error: Container div not found.');
    return;
  }

  // 1. Inject minimal CSS (Layout only, wrapper styling removed)
  const style = document.createElement('style');
  style.innerHTML = `
    .collection-form-group { display: flex; width: 100%; max-width: 500px; gap: 10px; margin-top: 5px; }
    .collection-form-group input { flex-grow: 1; padding: 10px 15px; border: 1px solid #ccc; border-radius: 4px; outline: none; font-size: 1rem; font-family: inherit; background-color: #ffffff; color: #333333; }
    .collection-form-group button { background-color: #111a3a; color: #fff; border: none; border-radius: 4px; padding: 10px 20px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: background-color 0.2s; font-family: inherit; }
    .collection-form-group button:hover { background-color: #080d1d; }
    .widget-results { padding: 15px 0; }
    .widget-message { padding: 15px; border-radius: 4px; margin-top: 10px; font-size: 1.1rem; }
    .widget-success { background-color: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
    .widget-error { background-color: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }
    .collection-day-highlight { font-weight: bold; font-size: 1.3rem; text-transform: uppercase; }
    @media (max-width: 768px) { .collection-form-group { flex-direction: column; max-width: 100%; } }
  `;
  document.head.appendChild(style);

  // 2. Inject the HTML (Stripped down to just the form group and results)
  targetElement.innerHTML = `
    <div class="collection-form-group">
      <input type="text" id="widget-address-input" placeholder="Enter address (e.g. 1149 S Broadway 90012)">
      <button type="button" id="widget-submit-btn">Submit</button>
    </div>
    <div id="widget-result-container" class="widget-results"></div>
  `;

  // 3. Handle the API Fetch
  const submitBtn = document.getElementById('widget-submit-btn');
  const addressInput = document.getElementById('widget-address-input');
  const resultContainer = document.getElementById('widget-result-container');

  submitBtn.addEventListener('click', function() {
    const address = addressInput.value.trim();
    
    if (!address) {
      resultContainer.innerHTML = `<div class="widget-message widget-error">Please enter an address.</div>`;
      return;
    }

    // Show loading state
    resultContainer.innerHTML = `<div class="widget-message">Searching GIS database...</div>`;

    // Construct the LA City SAN Geocode API URL
    const apiUrl = `https://gis.lacitysan.org/server/rest/services/CRM_Locator_V01/GeocodeServer/findAddressCandidates?outFields=*&f=json&Address=${encodeURIComponent(address)}`;

    // Fetch data from the API
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        if (data.candidates && data.candidates.length > 0) {
          
          const bestMatch = data.candidates[0];
          const attributes = bestMatch.attributes;
          
          // Extract the specific LASAN_COLL_DAY field
          const collectionDay = attributes.LASAN_COLL_DAY || 'Not Found';

          // Build the success UI
          resultContainer.innerHTML = `
            <div class="widget-message widget-success">
              Your collection day for <strong>${bestMatch.address}</strong> is:<br>
              <span class="collection-day-highlight">${collectionDay}</span>
            </div>
          `;
        } else {
          resultContainer.innerHTML = `<div class="widget-message widget-error">Address not found. Please try formatting it differently.</div>`;
        }
      })
      .catch(error => {
        console.error('Widget API Error:', error);
        resultContainer.innerHTML = `<div class="widget-message widget-error">Error connecting to the GIS server. Please try again later.</div>`;
      });
  });

  // Allow pressing "Enter" in the input field to submit
  addressInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      submitBtn.click();
    }
  });

})();
