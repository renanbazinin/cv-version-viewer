// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const GITHUB_REPO_OWNER = 'renanbazinin';
    const GITHUB_REPO_NAME = 'CV-RENAN';
    const FILE_PATH = 'CV-RenanBazinin.pdf';
    const BRANCHES_API = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/branches`;

    // DOM Elements
    const pdfContainer = document.getElementById('pdf-container');
    const pdfIframe = document.getElementById('pdf-iframe');
    const imageContainer = document.getElementById('image-container');
    const pdfCanvas = document.getElementById('pdf-canvas');
    const imageLoading = document.getElementById('image-loading');
    const viewerControls = document.getElementById('viewer-controls');
    const imageModeBtn = document.getElementById('image-mode-btn');
    const pdfModeBtn = document.getElementById('pdf-mode-btn');
    const timelineContainer = document.getElementById('timeline-container');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');
    
    // Image Viewer Elements (canvas-based)
    const imagePageNum = document.getElementById('image-page-num');
    const imagePageCount = document.getElementById('image-page-count');
    const imagePrevPageBtn = document.getElementById('image-prev-page');
    const imageNextPageBtn = document.getElementById('image-next-page');
    const imageZoomInBtn = document.getElementById('image-zoom-in');
    const imageZoomOutBtn = document.getElementById('image-zoom-out');
    const imageZoomLevel = document.getElementById('image-zoom-level');
    
    const branchSelector = document.getElementById('branch-selector');
    const branchStats = document.getElementById('branch-stats');
    const commitCountEl = document.getElementById('commit-count');

    let commitsData = [];
    let branchesData = [];
    let currentBranch = 'main';
    let pdfDoc = null;
    let currentPage = 1;
    let imageScale = 1.5;
    let viewMode = 'image'; // Default to image viewer
    let currentSha = null;

    // --- Helper Functions ---
    function getBranchClass(branchName) {
        const name = branchName.toLowerCase();
        if (name === 'main' || name === 'master') return 'branch-main';
        if (name.includes('develop')) return 'branch-develop';
        if (name.includes('feature') || name.includes('feat')) return 'branch-feature';
        return 'branch-default';
    }

    function getBranchBadgeClass(branchName) {
        const name = branchName.toLowerCase();
        if (name === 'main' || name === 'master') return 'main';
        if (name.includes('develop')) return 'develop';
        if (name.includes('feature') || name.includes('feat')) return 'feature';
        return 'default';
    }

    // --- Image Viewer Functions (Canvas-based like the original) ---
    async function renderImagePage(pageNumber) {
        if (!pdfDoc) return;
        
        imageLoading.classList.remove('hidden');
        
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale: imageScale });
        const context = pdfCanvas.getContext('2d');
        
        pdfCanvas.height = viewport.height;
        pdfCanvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };

        await page.render(renderContext).promise;
        
        imageLoading.classList.add('hidden');
        imagePageNum.textContent = pageNumber;
        imagePrevPageBtn.disabled = pageNumber <= 1;
        imageNextPageBtn.disabled = pageNumber >= pdfDoc.numPages;
    }

    async function loadImageView(sha) {
        try {
            const rawPdfUrl = `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/${sha}/${FILE_PATH}`;
            
            imageLoading.classList.remove('hidden');
            
            // Load PDF with CORS support
            const loadingTask = pdfjsLib.getDocument({
                url: rawPdfUrl,
                cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
                cMapPacked: true
            });
            
            pdfDoc = await loadingTask.promise;
            imagePageCount.textContent = pdfDoc.numPages;
            currentPage = 1;
            await renderImagePage(currentPage);
        } catch (error) {
            console.error('Error loading PDF for image view:', error);
            imageLoading.classList.add('hidden');
            alert('Failed to load PDF. Please try again.');
        }
    }

    // --- Native PDF Viewer Functions ---
    async function loadPdfView(sha) {
        try {
            const rawPdfUrl = `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/${sha}/${FILE_PATH}`;
            
            // Use Mozilla's PDF.js viewer which provides native PDF experience without download
            const pdfViewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(rawPdfUrl)}`;
            pdfIframe.src = pdfViewerUrl;
        } catch (error) {
            console.error('Error loading PDF:', error);
            alert('Failed to load PDF. Please try again.');
        }
    }

    // --- Main PDF Loading Function ---
    async function loadPdfFromCommit(sha) {
        currentSha = sha;
        
        if (viewMode === 'image') {
            await loadImageView(sha);
        } else {
            await loadPdfView(sha);
        }
    }

    // --- Viewer Mode Toggle ---
    function switchViewMode(mode) {
        viewMode = mode;
        
        if (mode === 'image') {
            imageModeBtn.classList.add('active');
            pdfModeBtn.classList.remove('active');
            imageContainer.classList.remove('hidden');
            pdfContainer.classList.add('hidden');
            if (currentSha) loadImageView(currentSha);
        } else {
            pdfModeBtn.classList.add('active');
            imageModeBtn.classList.remove('active');
            pdfContainer.classList.remove('hidden');
            imageContainer.classList.add('hidden');
            if (currentSha) loadPdfView(currentSha);
        }
    }

    imageModeBtn.addEventListener('click', () => switchViewMode('image'));
    pdfModeBtn.addEventListener('click', () => switchViewMode('pdf'));

    // --- Navigation Controls ---
    // Image Viewer Navigation
    imagePrevPageBtn.addEventListener('click', () => {
        if (currentPage <= 1) return;
        currentPage--;
        renderImagePage(currentPage);
    });

    imageNextPageBtn.addEventListener('click', () => {
        if (currentPage >= pdfDoc.numPages) return;
        currentPage++;
        renderImagePage(currentPage);
    });

    imageZoomInBtn.addEventListener('click', () => {
        imageScale += 0.25;
        imageZoomLevel.textContent = Math.round(imageScale * 100 / 1.5) + '%';
        renderImagePage(currentPage);
    });

    imageZoomOutBtn.addEventListener('click', () => {
        if (imageScale <= 0.5) return;
        imageScale -= 0.25;
        imageZoomLevel.textContent = Math.round(imageScale * 100 / 1.5) + '%';
        renderImagePage(currentPage);
    });

    // --- Fetch Branches ---
    async function fetchBranches() {
        try {
            const response = await fetch(BRANCHES_API);
            if (!response.ok) {
                throw new Error(`Failed to fetch branches: ${response.status}`);
            }
            branchesData = await response.json();
            
            // Populate branch selector
            branchSelector.innerHTML = '';
            branchesData.forEach(branch => {
                const option = document.createElement('option');
                option.value = branch.name;
                option.textContent = branch.name;
                branchSelector.appendChild(option);
            });

            // Set default branch (prefer main/master)
            const defaultBranch = branchesData.find(b => b.name === 'main' || b.name === 'master');
            if (defaultBranch) {
                currentBranch = defaultBranch.name;
                branchSelector.value = currentBranch;
            } else if (branchesData.length > 0) {
                currentBranch = branchesData[0].name;
                branchSelector.value = currentBranch;
            }

            return true;
        } catch (error) {
            console.error('Error fetching branches:', error);
            branchSelector.innerHTML = '<option>Error loading branches</option>';
            return false;
        }
    }

    // --- Fetch Commits for a Branch ---
    async function fetchCommitsForBranch(branchName) {
        try {
            const API_URL = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/commits?path=${FILE_PATH}&sha=${branchName}`;
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`GitHub API request failed: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching commits:', error);
            return [];
        }
    }

    // --- Main function to fetch and render data ---
    async function initialize() {
        try {
            // Fetch branches first
            const branchesLoaded = await fetchBranches();
            if (!branchesLoaded) {
                throw new Error("Failed to load branches");
            }

            // Fetch commits for the default branch
            commitsData = await fetchCommitsForBranch(currentBranch);

            if (commitsData && commitsData.length > 0) {
                renderTimeline(commitsData, currentBranch);
                // Load the PDF from the most recent commit by default
                await loadPdfFromCommit(commitsData[0].sha);
                // Highlight the first commit item
                        const firstItem = document.querySelector('.timeline-item');
                if (firstItem) firstItem.classList.add('active');
                loader.classList.add('hidden');
                viewerControls.classList.remove('hidden');
                imageContainer.classList.remove('hidden');
                branchStats.classList.remove('hidden');
                commitCountEl.textContent = commitsData.length;
            } else {
                throw new Error("No commits found for this file.");
            }
        } catch (error) {
            console.error('Error initializing app:', error);
            loader.classList.add('hidden');
            errorMessage.classList.remove('hidden');
        }
    }

    // --- Branch Selector Change Event ---
    branchSelector.addEventListener('change', async (e) => {
        const selectedBranch = e.target.value;
        if (selectedBranch === currentBranch) return;

        currentBranch = selectedBranch;
        
        // Show loading state
        timelineContainer.innerHTML = '<div class="text-center text-gray-400">Loading commits...</div>';
        
        // Fetch commits for selected branch
        commitsData = await fetchCommitsForBranch(selectedBranch);
        
        if (commitsData && commitsData.length > 0) {
            renderTimeline(commitsData, selectedBranch);
            await loadPdfFromCommit(commitsData[0].sha);
            const firstItem = document.querySelector('.timeline-item');
            if (firstItem) firstItem.classList.add('active');
            commitCountEl.textContent = commitsData.length;
        } else {
            timelineContainer.innerHTML = '<div class="text-center text-gray-400">No commits found for this branch.</div>';
            commitCountEl.textContent = 0;
        }
    });

    // --- Render the commit timeline ---
    function renderTimeline(commits, branchName) {
        timelineContainer.innerHTML = ''; // Clear previous content
        const branchClass = getBranchClass(branchName);
        const badgeClass = getBranchBadgeClass(branchName);
        
        commits.forEach((commitItem, index) => {
            const { commit, sha } = commitItem;
            const commitDate = new Date(commit.author.date);
            const formattedDate = commitDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            const formattedTime = commitDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });

            // Truncate commit message if too long
            const commitMessage = commit.message.length > 60 
                ? commit.message.substring(0, 60) + '...' 
                : commit.message;

            const timelineItem = document.createElement('div');
            timelineItem.className = `timeline-item relative pl-8 border-l-2 ${branchClass} transition-all duration-300 ease-in-out cursor-pointer hover:scale-105`;
            timelineItem.dataset.sha = sha;
            
            timelineItem.innerHTML = `
                <div class="branch-dot absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-gray-800 transition-all duration-300 shadow-lg"></div>
                <div class="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 hover:border-current transition-all duration-300">
                    <div class="flex items-start justify-between gap-2">
                        <p class="font-semibold text-blue-300 flex-1">${commitMessage}</p>
                        ${index === 0 ? `<span class="branch-badge ${badgeClass}">Latest</span>` : ''}
                    </div>
                    <p class="text-sm text-gray-400 mt-1">
                        <svg class="inline w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                        </svg>
                        ${commit.author.name}
                    </p>
                    <p class="text-xs text-gray-500 mt-2">
                        <svg class="inline w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        ${formattedDate} at ${formattedTime}
                    </p>
                    <p class="text-xs text-gray-600 mt-1 font-mono">
                        ${sha.substring(0, 7)}
                    </p>
                </div>
            `;
            
            timelineItem.addEventListener('click', () => handleCommitClick(sha));
            timelineContainer.appendChild(timelineItem);
        });
    }

    // --- Handle click on a commit item ---
    function handleCommitClick(sha) {
        // Update active state in the UI
        document.querySelectorAll('.timeline-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.sha === sha) {
                item.classList.add('active');
            }
        });
        loadPdfFromCommit(sha);
    }

    // Start the application
    initialize();
});
