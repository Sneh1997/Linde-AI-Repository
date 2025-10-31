document.addEventListener('DOMContentLoaded', () => {
  // Floating chatbot logic
  const openBtn = document.getElementById('openChatbot');
  const closeBtn = document.getElementById('closeChatbot');
  const chatbotWindow = document.getElementById('chatbotWindow');
  openBtn.addEventListener('click', () => {
    chatbotWindow.style.display = '';
    openBtn.style.display = 'none';
  });
  closeBtn.addEventListener('click', () => {
    chatbotWindow.style.display = 'none';
    openBtn.style.display = '';
  });
  // Chatbot message logic
  const chatWindow = document.getElementById('chatWindow');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  chatForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const msg = chatInput.value.trim();
    if (!msg) return;
    appendMessage('You', msg);
    chatInput.value = '';
    // Call OpenAI ChatGPT API
    appendMessage('Bot', '<span style="color:#888;">Thinking...</span>');
    try {
      const response = await fetch('https://genailab.tcs.in/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-4_4iZ1BnGwyWo9CUU19img'
        },
        body: JSON.stringify({
          model: 'azure_ai/genailab-maas-DeepSeek-V3-0324',
          messages: [{role: 'user', content: msg}]
        })
      });
      if (!response.ok) throw new Error('ChatGPT API error');
      const data = await response.json();
      const botMsg = data.choices?.[0]?.message?.content || 'No response.';
      appendMessage('Bot', botMsg);

       setTimeout(() => {
      const fullText = document.getElementById('globalSearchResult').innerText;
      const startMarker = 'Sample Product Description:';
      const endMarker = 'Why Parents Love It:';
      const start = fullText.indexOf(startMarker);
      const end = fullText.indexOf(endMarker);
      if (start !== -1 && end !== -1 && end > start) {
        const description = fullText.substring(start + startMarker.length, end).trim();
        document.getElementById('productDescriptionBox').innerText = description;
      }
    }, 500);
    } catch (err) {
      appendMessage('Bot', `<span style='color:red;'>Error: ${err.message}</span>`);
    }
  });
  function appendMessage(sender, text) {
    const div = document.createElement('div');
    div.innerHTML = `<strong>${sender}:</strong> ${text}`;
    div.style.marginBottom = '0.5em';
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
  // Product search by image logic
  const imageInput = document.getElementById('imageInput');
  const imagePreview = document.getElementById('imagePreview');
  const imageSearchForm = document.getElementById('imageSearchForm');
  const searchResult = document.getElementById('searchResult');
  let uploadedImageFile = null;
  imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    uploadedImageFile = file;
    const reader = new FileReader();
    reader.onload = function(ev) {
      imagePreview.innerHTML = `<img src='${ev.target.result}' alt='Uploaded' style='max-width:180px;border-radius:8px;border:1px solid #eee;' />`;
      searchResult.innerHTML = '';
    };
    reader.readAsDataURL(file);
  });
  imageSearchForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!uploadedImageFile) {
      searchResult.innerHTML = '<span style="color:red;">Please upload an image first.</span>';
      return;
    }
    searchResult.innerHTML = '<span style="color:#888;">Fetching product details from ChatGPT...</span>';
    // Convert image to base64
    const reader = new FileReader();
    reader.onload = async function(ev) {
      const base64Image = ev.target.result;
      try {
        const response = await fetch('https://genailab.tcs.in/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer sk-4_4iZ1BnGwyWo9CUU19img'
          },
          body: JSON.stringify({
            model: 'azure_ai/genailab-maas-DeepSeek-V3-0324',
            messages: [
              {role: 'system', content: 'You are a product expert for kids products. Only return information about kids products.'},
              {role: 'user', content: `Given this image (base64): ${base64Image}, identify the kids product and provide detailed product information including product name, category, specification, ingredient list, marketing guidelines, and a sample product description.`}
            ]
          })
        });
        if (!response.ok) throw new Error('ChatGPT API error');
        const data = await response.json();
        const botMsg = data.choices?.[0]?.message?.content || '';
        if (!botMsg || botMsg.toLowerCase().includes('no product') || botMsg.trim().length < 10) {
          searchResult.innerHTML = `<span style='color:red;'>Please check product that you entered.</span>`;
        } else {
          searchResult.innerHTML = `<div style='background:#fff6fb;border-radius:12px;padding:1em;box-shadow:0 1px 6px rgba(61,21,95,0.08);'>${botMsg.replace(/\n/g,'<br>')}</div>`;
        }
      } catch (err) {
        searchResult.innerHTML = `<span style='color:red;'>Error: ${err.message}</span>`;
      }
    };
    reader.readAsDataURL(uploadedImageFile);
  });
  // Global search logic
  const globalSearchForm = document.getElementById('globalSearchForm');
  const globalSearchInput = document.getElementById('globalSearchInput');
  const globalSearchResult = document.getElementById('globalSearchResult');
  const productDetailModal = document.getElementById('productDetailModal');
  const productDetailContent = document.getElementById('productDetailContent');
  const closeProductModal = document.getElementById('closeProductModal');
  closeProductModal.addEventListener('click', () => {
    productDetailModal.style.display = 'none';
  });
  globalSearchForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const query = globalSearchInput.value.trim();
    if (!query) return;
    globalSearchResult.style.display = '';
    globalSearchResult.innerHTML = `<span style='color:#888;'>Fetching product details from ChatGPT...</span>`;
    // Fetch product details from ChatGPT (kids products only)
    try {
      const response = await fetch('https://genailab.tcs.in/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-4_4iZ1BnGwyWo9CUU19img'
        },
        body: JSON.stringify({
          model: 'azure_ai/genailab-maas-DeepSeek-V3-0324',
          messages: [
            {role: 'system', content: 'You are a product expert for kids products. Only return information about kids products.'},
            {role: 'user', content: `Give me detailed product information for: ${query}. Include product name, category, specification, ingredient list, marketing guidelines, and a sample product description.`}
          ]
        })
      });
      if (!response.ok) throw new Error('ChatGPT API error');
      const data = await response.json();
      const botMsg = data.choices?.[0]?.message?.content || '';
      if (!botMsg || botMsg.toLowerCase().includes('no product') || botMsg.trim().length < 10) {
        globalSearchResult.innerHTML = `<span style='color:red;'>Please check product that you entered.</span>`;
      } else {
        globalSearchResult.innerHTML = `<div style='background:#fff6fb;border-radius:12px;padding:1em;box-shadow:0 1px 6px rgba(61,21,95,0.08);'>${botMsg.replace(/\n/g,'<br>')}</div>`;
      }
      setTimeout(() => { globalSearchResult.scrollIntoView({behavior:'smooth'}); }, 100);
    } catch (err) {
      globalSearchResult.innerHTML = `<span style='color:red;'>Error: ${err.message}</span>`;
    }
  });
  // Tab navigation logic
  const tabLinks = document.querySelectorAll('.tab-link');
  const tabSections = document.querySelectorAll('.tab-section');
  tabLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const tab = link.getAttribute('data-tab');
      tabSections.forEach(sec => {
        sec.style.display = sec.id === tab ? '' : 'none';
      });
      if (tab === 'account') {
        // Simulate logged-in user info
        const accountSection = document.getElementById('account');
        accountSection.innerHTML = `
          <h2>My Account</h2>
          <div style='background:#fff6fb;padding:1em;border-radius:8px;max-width:400px;'>
            <strong>Name:</strong> Jane Doe<br>
            <strong>Email:</strong> jane.doe@example.com<br>
            <strong>Member Since:</strong> Jan 2024<br>
            <strong>Recent Product Searches:</strong>
            <ul style='margin-top:.5em;'>
              <li>Kid Joy Baby Bottle</li>
              <li>Diaper Cream</li>
              <li>Organic Baby Lotion</li>
            </ul>
          </div>
        `;
      }
    });
  });
  // Category icons click logic
  function fetchCategoryProducts(category, container) {
    container.innerHTML = `<span style='color:#888;'>Fetching ${category} products from ChatGPT...</span>`;
    fetch('https://genailab.tcs.in/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-4_4iZ1BnGwyWo9CUU19img'
      },
      body: JSON.stringify({
        model: 'azure_ai/genailab-maas-DeepSeek-V3-0324',
        messages: [
          {role: 'system', content: 'You are a product expert for kids products. Only return information about kids products.'},
          {role: 'user', content: `List 10 kids ${category} products with name, description, and specification. Format as HTML list.`}
        ]
      })
    })
    .then(response => response.json())
    .then(data => {
      const botMsg = data.choices?.[0]?.message?.content || '';
      if (!botMsg || botMsg.toLowerCase().includes('no product') || botMsg.trim().length < 10) {
        container.innerHTML = `<span style='color:red;'>Please check category or try again.</span>`;
      } else {
        container.innerHTML = `<div style='background:#fff6fb;border-radius:12px;padding:1em;box-shadow:0 1px 6px rgba(61,21,95,0.08);'>${botMsg.replace(/\n/g,'<br>')}</div><button id='moreBtn' style='margin-top:1em;'>More</button>`;
        const moreBtn = container.querySelector('#moreBtn');
        if (moreBtn) {
          moreBtn.addEventListener('click', () => {
            fetch('https://genailab.tcs.in/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sk-4_4iZ1BnGwyWo9CUU19img'
              },
              body: JSON.stringify({
                model: 'azure_ai/genailab-maas-DeepSeek-V3-0324',
                messages: [
                  {role: 'system', content: 'You are a product expert for kids products. Only return information about kids products.'},
                  {role: 'user', content: `List 10 more kids ${category} products with name, description, and specification. Format as HTML list.`}
                ]
              })
            })
            .then(response => response.json())
            .then(data => {
              const moreMsg = data.choices?.[0]?.message?.content || '';
              if (!moreMsg || moreMsg.toLowerCase().includes('no product') || moreMsg.trim().length < 10) {
                moreBtn.insertAdjacentHTML('beforebegin', `<span style='color:red;'>No more products found.</span>`);
              } else {
                moreBtn.insertAdjacentHTML('beforebegin', `<div style='background:#fff6fb;border-radius:12px;padding:1em;box-shadow:0 1px 6px rgba(61,21,95,0.08);margin-top:1em;'>${moreMsg.replace(/\n/g,'<br>')}</div>`);
              }
            });
          });
        }
      }
    });
  }
  // Add click listeners to category icons
  document.querySelectorAll('.category-icons > div').forEach((iconDiv, idx) => {
    const categories = ['clothing', 'hair care', 'skin care'];
    iconDiv.style.cursor = 'pointer';
    iconDiv.addEventListener('click', function() {
      const main = document.getElementById('main');
      let resultContainer = document.getElementById('categoryResult');
      if (!resultContainer) {
        resultContainer = document.createElement('div');
        resultContainer.id = 'categoryResult';
        resultContainer.style.margin = '2em auto';
        resultContainer.style.maxWidth = '700px';
        main.appendChild(resultContainer);
      }
      fetchCategoryProducts(categories[idx], resultContainer);
      resultContainer.scrollIntoView({behavior:'smooth'});
    });
  });
});
