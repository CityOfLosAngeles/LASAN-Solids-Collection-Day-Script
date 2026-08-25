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
    #${containerId} {
      align-self: center !important;
      margin: 0 !important;
      padding: 0 !important;
      display: flex !important;
      flex-direction: column !important;
      width: 100% !important;
      max-width: 780px; 
      box-sizing: border-box;
    }

    .collection-form-group { 
      display: flex; 
      width: 100%; 
      gap: 12px; 
      margin: 0; 
      box-sizing: border-box;
      align-items: center; 
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
      color: #333333 !important; 
      box-sizing: border-box;
    }
    
    /* Custom styled button with brand color #1C2B60 */
    .collection-form-group button { 
      background-color: #1C2B60 !important; 
      color: #ffffff !important; 
      border: 1px solid rgba(255, 255, 255, 0.85) !important; 
      border-radius: 6px !important; 
      padding: 12px 28px !important; 
      font-size: 1.15rem !important; 
      font-weight: 500 !important; 
      font-family: inherit !important; 
      cursor: pointer !important; 
      transition: all 0.2s ease-in-out !important; 
      white-space: nowrap !important; 
      display: inline-flex !important; 
      align-items: center !important; 
      justify-content: center !important; 
      box-sizing: border-box !important; 
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3) !important;
    }
    .collection-form-group button:hover { 
      background-color: #142048 !important; 
      border-color: #ffffff !important;
      box-shadow: 0 6px 8px rgba(0, 0, 0, 0.4) !important;
    }
    .collection-form-group button:active {
      background-color: #0e1633 !important;
      transform: translateY(1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
    }
    
    .widget-results { 
      position: relative !important;
      margin-top: 12px !important; 
      width: 100% !important; 
      display: none; 
      box-sizing: border-box;
    }
    .widget-message { 
      padding: 15px; 
      border-radius: 4px; 
      margin: 0 !important; 
      font-size: 1.1rem; 
      box-sizing: border-box;
      white-space: nowrap; 
    }

    /* Forced specificity rules for status boxes */
    #${containerId} .widget-success,
    #${containerId} .widget-success * { 
      background-color: #e8f5e9 !important; 
      color: #1b5e20 !important; 
      border-color: #c8e6c9 !important;
    }
    
    #${containerId} .widget-error,
    #${containerId} .widget-error * { 
      background-color: #ffebee !important; 
      color: #b71c1c !important; 
      border-color: #ffcdd2 !important;
    }

    .collection-day-highlight { 
      font-weight: bold; 
      font-size: 1.2rem; 
      text-transform: uppercase; 
    }

    /* Responsive Breakpoint for Mobile Devices */
    @media (max-width: 576px) { 
      .collection-form-group { 
        flex-direction: column; 
        max-width: 100%; 
        gap: 12px;
      }
      .collection-form-group button {
        width: 100%;
        padding: 16px 25px !important; 
      }
      .widget-message {
        white-space: normal; 
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
    
    resultContainer.style.display = 'block';
    
    if (!address) {
      resultContainer.innerHTML = `
        <div class="widget-message" style="background-color: #ffebee !important; color: #b71c1c !important; border: 1px solid #ffcdd2 !important;">
          Please enter an address.
        </div>`;
      return;
    }

    resultContainer.innerHTML = `<div class="widget-message" style="color: #ffffff !important;">Searching GIS database...</div>`;

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
            <div class="widget-message" style="background-color: #e8f5e9 !important; color: #1b5e20 !important; border: 1px solid #c8e6c9 !important;">
              Your collection day for <strong style="color: #1b5e20 !important; font-weight: bold;">${bestMatch.address}</strong> is <span class="collection-day-highlight" style="color: #1b5e20 !important; font-weight: bold; text-transform: uppercase;">${collectionDay}</span>
            </div>
          `;
        } else {
          resultContainer.innerHTML = `
            <div class="widget-message" style="background-color: #ffebee !important; color: #b71c1c !important; border: 1px solid #ffcdd2 !important;">
              Address not found. Please try formatting it differently.
            </div>`;
        }
      })
      .catch(error => {
        console.error('Widget API Error:', error);
        resultContainer.innerHTML = `
          <div class="widget-message" style="background-color: #ffebee !important; color: #b71c1c !important; border: 1px solid #ffcdd2 !important;">
            Error connecting to the GIS server. Please try again later.
          </div>`;
      });
  });

  addressInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      submitBtn.click();
    }
  });
})();
