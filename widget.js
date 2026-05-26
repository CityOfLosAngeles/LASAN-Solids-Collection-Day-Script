// widget.js - Hosted on GitHub / jsDelivr
(function() {
  const config = window._my_widget_config || {};
  const containerId = config.container || 'my-widget-container';
  const targetElement = document.getElementById(containerId);

  if (!targetElement) {
    console.error('Widget error: Container div not found.');
    return;
  }

  // 1. Inject responsive layout CSS
  const style = document.createElement('style');
  style.innerHTML = `
    .collection-form-group { 
      display: flex; 
      width: 100%; 
      max-width: 650px; 
      gap: 10px; 
      margin-top: 5px; 
      box-sizing: border-box;
    }
    .collection-form-group input { 
      flex-grow: 1; 
      width: 100%;
      padding: 14px 20px; 
      border: 1px solid #ccc; 
      border-radius: 4px; 
      outline: none; 
      font-size: 1.1rem; 
      font-family: inherit; 
      background-color: #ffffff; 
      color: #333333;
      box-sizing: border-box;
    }
    .collection-form-group button { 
      background-color: #111a3a; 
      color: #fff; 
      border: none; 
      border-radius: 4px; 
      padding: 14px 25px; 
      font-weight: 600; 
      font-size: 1.1rem; 
      cursor: pointer; 
      transition: background-color 0.2s; 
      font-family: inherit;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
    }
    .collection-form-group button:hover { 
      background-color: #080d1d; 
    }
    .widget-results { 
      padding: 15px 0; 
      width: 100%;
    }
    .widget-message { 
      padding: 15px; 
      border-radius: 4px; 
      margin-top: 10px; 
      font-size: 1.1rem; 
      box-sizing: border-box;
    }
    .widget-success { background-color: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
    .widget-error { background-color: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }
    .collection-day-highlight { font-weight: bold; font-size: 1.3rem; text-transform: uppercase; }
    
    /* Responsive Breakpoint for Mobile Devices */
    @media (max-width: 576px) { 
      .collection-form-group { 
        flex-direction: column; 
        max-width: 100%; 
        gap: 12px;
      }
      .collection-form-group button {
        width: 100%;
        padding: 16px 25px; /* Slightly taller target area for mobile thumbs */
      }
    }
  `;
  document.head.appendChild(style);

  // 2. Inject raw functional elements
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

    resultContainer.innerHTML = `<div class="widget-message">Searching GIS database...</div>`;

    const apiUrl = `https://gis.lacitysan.org/server/rest/services/CRM_Locator_V01/GeocodeServer/findAddressCandidates?outFields=*&f=json&Address=${encodeURIComponent(address)}`;

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        if (data.candidates && data.candidates.length > 0) {
          const bestMatch = data.candidates[0];
          const attributes = bestMatch.attributes;
          const collectionDay = attributes.LASAN_COLL_DAY || 'Not Found';

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

  addressInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      submitBtn.click();
    }
  });
})();
