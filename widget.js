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
    /* FIXED: Expanded max-width to make input field larger and prevent button overflow */
    #${containerId} {
      align-self: center !important;
      margin: 0 !important;
      padding: 0 !important;
      display: flex !important;
      flex-direction: column !important;
      width: 100% !important;
      max-width: 780px; /* BUMPED from 650px to enlarge input and balance right side */
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
    .collection-form-group button { 
      background-color: #111a3a; 
      color: #fff !important; 
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
      position: relative !important;
      margin-top: 12px !important; 
      width: 100% !important; /* Forces the green box to span the full width of form + button */
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

    /* THE SPECIFICITY NUKE: Forces EVERYTHING inside the success box to be dark green */
    #${containerId} .widget-success,
    #${containerId} .widget-success * { 
      background-color: #e8f5e9 !important; 
      color: #1b5e20 !important; 
      border-color: #c8e6c9 !important;
    }
    
    /* THE SPECIFICITY NUKE: Forces EVERYTHING inside the error box to be dark red */
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
        padding: 16px 25px; 
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
