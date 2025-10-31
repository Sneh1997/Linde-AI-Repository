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
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-4_4iZ1BnGwyWo9CUU19img'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{role: 'user', content: msg}]
        })
      });
      if (!response.ok) throw new Error('ChatGPT API error');
      const data = await response.json();
      const botMsg = data.choices?.[0]?.message?.content || 'No response.';
      appendMessage('Bot', botMsg);
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
    searchResult.innerHTML = '<span style="color:#888;">Searching product with Gemini AI...</span>';
    // Send image to backend Gemini API
    const formData = new FormData();
    formData.append('image', uploadedImageFile);
    try {
      const response = await fetch('/api/gemini-image-search', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('AI search failed');
      const data = await response.json();
      // Expecting: { product, category, specification, ingredients, marketing, description, image_url }
      searchResult.innerHTML = `<div style='display:flex;align-items:center;gap:1em;'>
        <img src='${data.image_url || ''}' alt='Result' style='max-width:80px;border-radius:8px;border:1px solid #eee;' />
        <div>
          <strong>Product:</strong> ${data.product}<br>
          <strong>Category:</strong> ${data.category}<br>
          <strong>Product Specification:</strong> ${data.specification}<br>
          <strong>Ingredient List:</strong> ${data.ingredients}<br>
          <strong>Marketing Guidelines:</strong> ${data.marketing}<br>
          <strong>Sample Product Description:</strong> ${data.description}
        </div>
      </div>`;
    } catch (err) {
      searchResult.innerHTML = `<span style='color:red;'>Error: ${err.message}</span>`;
    }
  });
  // Global search logic
  const globalSearchForm = document.getElementById('globalSearchForm');
  const globalSearchInput = document.getElementById('globalSearchInput');
  const globalSearchResult = document.getElementById('globalSearchResult');
  globalSearchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const query = globalSearchInput.value.trim();
    if (!query) return;
    // Simulate search result
    globalSearchResult.style.display = '';
    globalSearchResult.innerHTML = `<div style='background:#fff6fb;border-radius:12px;padding:1em;box-shadow:0 1px 6px rgba(61,21,95,0.08);'>
      <strong>Search results for:</strong> <span style='color:var(--accent);'>${query}</span><br><br>
      <img src='https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=200&q=80' alt='Baby Product' style='max-width:80px;border-radius:8px;border:1px solid #eee;margin-right:1em;' />
      <span>
        <strong>Product:</strong> Baby Bottle<br>
        <strong>Category:</strong> Feeding<br>
        <strong>Product Specification:</strong> BPA-free, anti-colic, 250ml capacity<br>
        <strong>Ingredient List:</strong> BPA-free plastic, silicone nipple<br>
        <strong>Marketing Guidelines:</strong> Emphasize safety, ease of cleaning, and comfort for babies. Use reassuring language and clean visuals.<br>
        <strong>Sample Product Description:</strong> "The Kid Joy Baby Bottle is designed for comfort and safety, featuring an anti-colic system and BPA-free materials. Perfect for feeding your baby with peace of mind."
      </span>
    </div>`;
    setTimeout(() => { globalSearchResult.scrollIntoView({behavior:'smooth'}); }, 100);
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
});
