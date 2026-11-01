class ShowManagerApplet {
  constructor() {
    this.library = [];
    this.init();
  }
  
  init() {
    // DOM Elements
    this.loadLibraryBtn = document.getElementById('loadLibraryBtn');
    this.createLibraryBtn = document.getElementById('createLibraryBtn');
    this.libraryFile = document.getElementById('libraryFile');
    this.addShowForm = document.getElementById('addShowForm');
    this.showForm = document.getElementById('showForm');
    this.libraryPreview = document.getElementById('libraryPreview');
    this.exportLibraryBtn = document.getElementById('exportLibraryBtn');
    this.downloadLink = document.getElementById('downloadLink');
    this.currentLibrary = document.getElementById('currentLibrary');
    this.showsList = document.getElementById('showsList');
    this.showCount = document.getElementById('showCount');
    this.formMessage = document.getElementById('formMessage');
    
    // Event Listeners
    this.loadLibraryBtn.addEventListener('click', () => this.libraryFile.click());
    this.createLibraryBtn.addEventListener('click', () => this.createNewLibrary());
    this.libraryFile.addEventListener('change', (e) => this.handleFileSelect(e));
    this.showForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    this.exportLibraryBtn.addEventListener('click', () => this.exportLibrary());
    
    // Check if we have a library in localStorage (for convenience)
    this.checkLocalStorage();
  }
  
  checkLocalStorage() {
    const savedLibrary = localStorage.getItem('cshow_library');
    if (savedLibrary) {
      try {
        this.library = JSON.parse(savedLibrary);
        this.updateLibraryStatus(`Loaded ${this.library.length} shows from browser storage`);
        this.showAddForm();
        this.updateLibraryPreview();
      } catch (e) {
        console.error('Error loading library from localStorage:', e);
      }
    }
  }
  
  handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        this.library = JSON.parse(e.target.result);
        this.updateLibraryStatus(`Loaded ${this.library.length} shows from "${file.name}"`);
        localStorage.setItem('cshow_library', JSON.stringify(this.library));
        this.showAddForm();
        this.updateLibraryPreview();
      } catch (error) {
        this.updateLibraryStatus(`Error: Invalid JSON file`, true);
        console.error('Error parsing JSON:', error);
      }
    };
    reader.readAsText(file);
  }
  
  createNewLibrary() {
    this.library = [];
    this.updateLibraryStatus('Created new empty library');
    localStorage.setItem('cshow_library', JSON.stringify(this.library));
    this.showAddForm();
    this.updateLibraryPreview();
  }
  
  showAddForm() {
    this.addShowForm.style.display = 'block';
    this.libraryPreview.style.display = 'block';
  }
  
  handleFormSubmit(event) {
    event.preventDefault();
    
    const titleInput = document.getElementById('title');
    const genreInput = document.getElementById('genre');
    
    const title = titleInput.value.trim();
    const genre = genreInput.value;
    
    // Validation
    if (!title) {
      this.showMessage('Please enter a show title', true);
      return;
    }
    
    if (!genre) {
      this.showMessage('Please select a genre', true);
      return;
    }
    
    // Check for duplicates (case-insensitive)
    const duplicate = this.library.find(show => 
      show.title.toLowerCase() === title.toLowerCase()
    );
    
    if (duplicate) {
      this.showMessage(`"${title}" already exists in the library`, true);
      return;
    }
    
    // Add to library
    const newShow = {
      id: Date.now(), // Simple unique ID
      title: title,
      genre: genre,
      addedDate: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    };
    
    this.library.push(newShow);
    this.library.sort((a, b) => a.title.localeCompare(b.title));
    
    // Save to localStorage
    localStorage.setItem('cshow_library', JSON.stringify(this.library));
    
    // Clear form
    titleInput.value = '';
    genreInput.value = '';
    
    // Update UI
    this.showMessage(`Added "${title}" to library successfully!`, false);
    this.updateLibraryPreview();
    this.updateLibraryStatus(`Library updated: ${this.library.length} shows`);
  }
  
  updateLibraryPreview() {
    this.showsList.innerHTML = '';
    this.showCount.textContent = this.library.length;
    
    if (this.library.length === 0) {
      this.showsList.innerHTML = '<p>No shows in library yet.</p>';
      return;
    }
    
    this.library.forEach(show => {
      const showElement = document.createElement('div');
      showElement.className = 'show-item';
      showElement.innerHTML = `
        <strong>${show.title}</strong> - ${show.genre}
        ${show.addedDate ? `<br><small>Added: ${show.addedDate}</small>` : ''}
      `;
      this.showsList.appendChild(showElement);
    });
  }
  
  exportLibrary() {
    const libraryData = {
      metadata: {
        version: "1.0",
        exportDate: new Date().toISOString(),
        totalShows: this.library.length,
        source: "CShow Manager Applet"
      },
      shows: this.library
    };
    
    const jsonStr = JSON.stringify(libraryData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    this.downloadLink.href = url;
    this.downloadLink.download = `cshow-library-${new Date().toISOString().split('T')[0]}.json`;
    this.downloadLink.click();
    
    URL.revokeObjectURL(url);
    
    this.showMessage(`Library exported with ${this.library.length} shows`, false);
  }
  
  updateLibraryStatus(message, isError = false) {
    this.currentLibrary.textContent = message;
    this.currentLibrary.style.color = isError ? '#ff6666' : '#b3b3e6';
  }
  
  showMessage(message, isError = false) {
    this.formMessage.textContent = message;
    this.formMessage.style.color = isError ? '#ff6666' : '#4CAF50';
    
    setTimeout(() => {
      this.formMessage.textContent = '';
    }, 3000);
  }
}

// Initialize applet when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ShowManagerApplet();
});