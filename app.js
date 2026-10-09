/**
 * CAMPUS NOTIFY / X - Client Application Engine
 * Twitter / X Style Campus Social Media & Announcement Feed
 * Completely clean without fake/demo data.
 * Dynamic hashtag trending calculation, likes, reposts, replies, LocalStorage.
 */

class CampusXApp {
  constructor() {
    this.posts = [];
    this.userLikes = new Set();
    this.userReposts = new Set();
    this.userBookmarks = new Set();
    
    this.activeTab = 'all'; // 'all' | 'official' | 'trending' | 'bookmarks' | 'profile'
    this.searchQuery = '';
    this.activeTagFilter = null;
    this.composerUrgent = false;
    this.composerAttachment = '';
    this.activeReplyPost = null;

    this.currentUser = {
      name: "Maruti Atpadkar",
      handle: "@atp0925",
      avatarSeed: "MarutiAtpadkar"
    };

    this.init();
  }

  init() {
    this.loadState();
    this.bindDOM();
    this.bindEvents();
    this.render();
  }

  loadState() {
    try {
      // Clear any legacy demo/seed posts if present
      const storedPosts = localStorage.getItem('campus_x_posts');
      if (storedPosts) {
        const parsed = JSON.parse(storedPosts);
        // Only keep posts that were manually created by the user (IDs like post-17...)
        // Purge old demo seed posts (IDs like post-101, post-102, etc.)
        this.posts = Array.isArray(parsed) 
          ? parsed.filter(p => p.id && !p.id.startsWith('post-10') && !p.authorHandle.includes('@exam_cell') && !p.authorHandle.includes('@tpo_cell'))
          : [];
        this.savePosts();
      } else {
        this.posts = [];
        this.savePosts();
      }

      const storedLikes = localStorage.getItem('campus_x_likes');
      if (storedLikes) this.userLikes = new Set(JSON.parse(storedLikes));

      const storedReposts = localStorage.getItem('campus_x_reposts');
      if (storedReposts) this.userReposts = new Set(JSON.parse(storedReposts));

      const storedBookmarks = localStorage.getItem('campus_x_bookmarks');
      if (storedBookmarks) this.userBookmarks = new Set(JSON.parse(storedBookmarks));

      const storedTheme = localStorage.getItem('campus_x_theme') || 'dark';
      document.documentElement.setAttribute('data-theme', storedTheme);
    } catch (e) {
      console.warn("Storage load error:", e);
      this.posts = [];
    }
  }

  savePosts() {
    try {
      localStorage.setItem('campus_x_posts', JSON.stringify(this.posts));
    } catch (e) {
      console.error(e);
    }
  }

  saveInteractions() {
    try {
      localStorage.setItem('campus_x_likes', JSON.stringify([...this.userLikes]));
      localStorage.setItem('campus_x_reposts', JSON.stringify([...this.userReposts]));
      localStorage.setItem('campus_x_bookmarks', JSON.stringify([...this.userBookmarks]));
    } catch (e) {
      console.error(e);
    }
  }

  bindDOM() {
    this.dom = {
      feedContainer: document.getElementById('feedPostsContainer'),
      emptyFeed: document.getElementById('emptyFeedMessage'),
      emptyFeedPostBtn: document.getElementById('emptyFeedPostBtn'),
      headerTitle: document.getElementById('timelineHeaderTitle'),
      // Tabs
      tabForYou: document.getElementById('tabForYou'),
      tabOfficial: document.getElementById('tabOfficial'),
      tabTrending: document.getElementById('tabTrending'),
      feedTabs: document.querySelectorAll('.feed-tab'),
      // Composer
      composerText: document.getElementById('composerText'),
      composerCategory: document.getElementById('composerCategory'),
      toolAttachBtn: document.getElementById('toolAttachBtn'),
      toolUrgentBtn: document.getElementById('toolUrgentBtn'),
      submitPostBtn: document.getElementById('submitPostBtn'),
      charCounter: document.getElementById('charCounter'),
      composerAttachmentPreview: document.getElementById('composerAttachmentPreview'),
      previewFileName: document.getElementById('previewFileName'),
      removeAttachmentBtn: document.getElementById('removeAttachmentBtn'),
      // Navigation
      navHome: document.getElementById('navHome'),
      navExplore: document.getElementById('navExplore'),
      navOfficial: document.getElementById('navOfficial'),
      navBookmarks: document.getElementById('navBookmarks'),
      navProfile: document.getElementById('navProfile'),
      sidebarPostBtn: document.getElementById('sidebarPostBtn'),
      bookmarkCountBadge: document.getElementById('bookmarkCountBadge'),
      // Search & Trending
      rightSearchInput: document.getElementById('rightSearchInput'),
      trendingList: document.getElementById('trendingList'),
      activeFilterStrip: document.getElementById('activeFilterStrip'),
      filterStatusText: document.getElementById('filterStatusText'),
      clearFilterBtn: document.getElementById('clearFilterBtn'),
      // Theme Toggle
      themeToggleBtn: document.getElementById('themeToggleBtn'),
      // Reply Modal
      replyModalBackdrop: document.getElementById('replyModalBackdrop'),
      closeReplyModalBtn: document.getElementById('closeReplyModalBtn'),
      replyTargetPostContainer: document.getElementById('replyTargetPostContainer'),
      replyInputText: document.getElementById('replyInputText'),
      submitReplyBtn: document.getElementById('submitReplyBtn'),
      repliesListContainer: document.getElementById('repliesListContainer'),
      // Toast
      toastContainer: document.getElementById('toastContainer')
    };
  }

  bindEvents() {
    // Composer text input
    this.dom.composerText.addEventListener('input', () => {
      const len = this.dom.composerText.value.length;
      const remaining = 400 - len;
      this.dom.charCounter.textContent = remaining;
      this.dom.submitPostBtn.disabled = this.dom.composerText.value.trim().length === 0;
    });

    // Composer urgent button toggle
    this.dom.toolUrgentBtn.addEventListener('click', () => {
      this.composerUrgent = !this.composerUrgent;
      this.dom.toolUrgentBtn.classList.toggle('active-urgent', this.composerUrgent);
      this.showToast(this.composerUrgent ? "🚨 Flagged as Urgent Notice" : "Normal notice", "info");
    });

    // Composer attachment button
    this.dom.toolAttachBtn.addEventListener('click', () => {
      const fileName = prompt("Enter circular or attachment file name (e.g. Circular_Schedule.pdf):", "Notice_Document.pdf");
      if (fileName && fileName.trim()) {
        this.composerAttachment = fileName.trim();
        this.dom.previewFileName.textContent = this.composerAttachment;
        this.dom.composerAttachmentPreview.style.display = 'flex';
        this.showToast("Attachment linked", "info");
      }
    });

    // Remove attachment
    this.dom.removeAttachmentBtn.addEventListener('click', () => {
      this.composerAttachment = '';
      this.dom.composerAttachmentPreview.style.display = 'none';
    });

    // Submit Post
    this.dom.submitPostBtn.addEventListener('click', () => this.handleCreatePost());

    // Sidebar Post Button & Empty State CTA
    const focusComposer = () => {
      this.dom.composerText.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    this.dom.sidebarPostBtn.addEventListener('click', focusComposer);
    if (this.dom.emptyFeedPostBtn) {
      this.dom.emptyFeedPostBtn.addEventListener('click', focusComposer);
    }

    // Feed Tabs Click
    this.dom.feedTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.dom.feedTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeTab = tab.getAttribute('data-tab');
        this.activeTagFilter = null;
        this.searchQuery = '';
        this.updateFilterStrip();
        this.render();
      });
    });

    // Nav Menu Items
    this.dom.navHome.addEventListener('click', (e) => {
      e.preventDefault();
      this.setActiveNav(this.dom.navHome);
      this.activeTab = 'all';
      this.activeTagFilter = null;
      this.searchQuery = '';
      this.dom.headerTitle.textContent = "Home";
      this.updateFilterStrip();
      this.render();
    });

    this.dom.navExplore.addEventListener('click', (e) => {
      e.preventDefault();
      this.setActiveNav(this.dom.navExplore);
      this.dom.rightSearchInput.focus();
      this.showToast("Search posts or #tags", "info");
    });

    this.dom.navOfficial.addEventListener('click', (e) => {
      e.preventDefault();
      this.setActiveNav(this.dom.navOfficial);
      this.activeTab = 'official';
      this.dom.headerTitle.textContent = "Official Circulars";
      this.updateFilterStrip();
      this.render();
    });

    this.dom.navBookmarks.addEventListener('click', (e) => {
      e.preventDefault();
      this.setActiveNav(this.dom.navBookmarks);
      this.activeTab = 'bookmarks';
      this.dom.headerTitle.textContent = "Saved Bookmarks";
      this.updateFilterStrip();
      this.render();
    });

    this.dom.navProfile.addEventListener('click', (e) => {
      e.preventDefault();
      this.setActiveNav(this.dom.navProfile);
      this.activeTab = 'profile';
      this.dom.headerTitle.textContent = "My Campus Profile";
      this.updateFilterStrip();
      this.render();
    });

    // Search Box
    this.dom.rightSearchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.updateFilterStrip();
      this.render();
    });

    // Clear Filter
    this.dom.clearFilterBtn.addEventListener('click', () => {
      this.activeTagFilter = null;
      this.searchQuery = '';
      this.dom.rightSearchInput.value = '';
      this.updateFilterStrip();
      this.render();
    });

    // Theme Switch
    this.dom.themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('campus_x_theme', next);
      this.showToast(`Switched to ${next} mode`, "info");
    });

    // Reply Modal Close
    this.dom.closeReplyModalBtn.addEventListener('click', () => this.closeReplyModal());
    this.dom.replyModalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.dom.replyModalBackdrop) this.closeReplyModal();
    });

    // Reply Submit
    this.dom.submitReplyBtn.addEventListener('click', () => this.handleAddReply());
  }

  setActiveNav(el) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    el.classList.add('active');
  }

  updateFilterStrip() {
    if (this.activeTagFilter || this.searchQuery) {
      this.dom.activeFilterStrip.style.display = 'flex';
      this.dom.filterStatusText.textContent = `Showing results for: ${this.activeTagFilter || this.searchQuery}`;
    } else {
      this.dom.activeFilterStrip.style.display = 'none';
    }
  }

  handleCreatePost() {
    const text = this.dom.composerText.value.trim();
    if (!text) return;

    const category = this.dom.composerCategory.value;
    const isOfficial = this.composerUrgent || category === "Examination" || category === "Placement";

    const newPost = {
      id: "post-" + Date.now(),
      authorName: this.currentUser.name,
      authorHandle: this.currentUser.handle,
      avatarSeed: this.currentUser.avatarSeed,
      isVerified: true,
      isOfficial: isOfficial,
      isUrgent: this.composerUrgent,
      category: category,
      timeAgo: "Just now",
      text: text,
      attachment: this.composerAttachment,
      likes: 0,
      reposts: 0,
      repliesCount: 0,
      replies: []
    };

    this.posts.unshift(newPost);
    this.savePosts();

    // Reset composer
    this.dom.composerText.value = '';
    this.dom.charCounter.textContent = '400';
    this.dom.submitPostBtn.disabled = true;
    this.composerUrgent = false;
    this.dom.toolUrgentBtn.classList.remove('active-urgent');
    this.composerAttachment = '';
    this.dom.composerAttachmentPreview.style.display = 'none';

    this.showToast("Your post is live on campus! 🚀", "success");
    this.render();
  }

  toggleLike(postId, e) {
    e.stopPropagation();
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    if (this.userLikes.has(postId)) {
      this.userLikes.delete(postId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      this.userLikes.add(postId);
      post.likes += 1;
    }
    this.savePosts();
    this.saveInteractions();
    this.render();
  }

  toggleRepost(postId, e) {
    e.stopPropagation();
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    if (this.userReposts.has(postId)) {
      this.userReposts.delete(postId);
      post.reposts = Math.max(0, post.reposts - 1);
      this.showToast("Undo repost", "info");
    } else {
      this.userReposts.add(postId);
      post.reposts += 1;
      this.showToast("Reposted to your feed! 🔁", "success");
    }
    this.savePosts();
    this.saveInteractions();
    this.render();
  }

  toggleBookmark(postId, e) {
    e.stopPropagation();
    if (this.userBookmarks.has(postId)) {
      this.userBookmarks.delete(postId);
      this.showToast("Removed from Bookmarks", "info");
    } else {
      this.userBookmarks.add(postId);
      this.showToast("Saved to Bookmarks 🔖", "success");
    }
    this.saveInteractions();
    this.updateBookmarkBadge();
    this.render();
  }

  sharePost(postId, e) {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}#${postId}`;
    navigator.clipboard?.writeText(shareUrl).then(() => {
      this.showToast("Post link copied to clipboard! 📋", "success");
    }).catch(() => {
      this.showToast("Shared post link!", "info");
    });
  }

  openReplyModal(postId, e) {
    if (e) e.stopPropagation();
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    this.activeReplyPost = post;

    this.dom.replyTargetPostContainer.innerHTML = `
      <div class="tweet-card" style="border: none; padding: 0;">
        <div class="tweet-avatar">
          <img src="https://api.dicebear.com/7.x/identicon/svg?seed=${post.avatarSeed}" class="avatar-img" alt="Avatar">
        </div>
        <div class="tweet-body">
          <div class="author-info">
            <span class="author-name">${this.escapeHTML(post.authorName)}</span>
            <span class="author-handle">${this.escapeHTML(post.authorHandle)}</span>
            <span class="dot-separator">&bull;</span>
            <span class="tweet-time">${post.timeAgo}</span>
          </div>
          <p class="tweet-text" style="margin-top: 6px;">${this.formatTweetText(post.text)}</p>
        </div>
      </div>
    `;

    this.renderRepliesList(post);
    this.dom.replyInputText.value = '';
    this.dom.replyModalBackdrop.classList.add('open');
    this.dom.replyInputText.focus();
  }

  renderRepliesList(post) {
    if (!post.replies || post.replies.length === 0) {
      this.dom.repliesListContainer.innerHTML = `<p style="color: var(--text-secondary); font-size: 0.88rem; text-align: center; padding: 12px 0;">No replies yet. Join the conversation!</p>`;
      return;
    }

    this.dom.repliesListContainer.innerHTML = post.replies.map(r => `
      <div class="reply-item">
        <img src="https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(r.handle)}" class="avatar-img-sm" alt="Avatar">
        <div class="reply-item-content">
          <div class="reply-item-author">
            <span>${this.escapeHTML(r.author)}</span>
            <span style="color: var(--text-secondary); font-weight: 500; font-size: 0.8rem;">${this.escapeHTML(r.handle)} &bull; ${r.time}</span>
          </div>
          <div class="reply-item-text">${this.escapeHTML(r.text)}</div>
        </div>
      </div>
    `).join('');
  }

  handleAddReply() {
    if (!this.activeReplyPost) return;
    const text = this.dom.replyInputText.value.trim();
    if (!text) return;

    if (!this.activeReplyPost.replies) this.activeReplyPost.replies = [];

    this.activeReplyPost.replies.push({
      author: this.currentUser.name,
      handle: this.currentUser.handle,
      text: text,
      time: "Just now"
    });
    this.activeReplyPost.repliesCount = this.activeReplyPost.replies.length;

    this.savePosts();
    this.renderRepliesList(this.activeReplyPost);
    this.dom.replyInputText.value = '';
    this.showToast("Reply posted! 💬", "success");
    this.render();
  }

  closeReplyModal() {
    this.dom.replyModalBackdrop.classList.remove('open');
    this.activeReplyPost = null;
  }

  updateBookmarkBadge() {
    const count = this.userBookmarks.size;
    if (count > 0) {
      this.dom.bookmarkCountBadge.style.display = 'inline-block';
      this.dom.bookmarkCountBadge.textContent = count;
    } else {
      this.dom.bookmarkCountBadge.style.display = 'none';
    }
  }

  // Dynamically calculate trending hashtags from actual user posts
  updateTrendingWidget() {
    const hashtagMap = new Map();
    this.posts.forEach(post => {
      const matches = post.text.match(/#(\w+)/g);
      if (matches) {
        matches.forEach(tag => {
          const lower = tag.toLowerCase();
          hashtagMap.set(lower, (hashtagMap.get(lower) || 0) + 1);
        });
      }
    });

    if (hashtagMap.size === 0) {
      this.dom.trendingList.innerHTML = `
        <div style="color: var(--text-secondary); font-size: 0.84rem; padding: 6px 0; line-height: 1.45;">
          No trending topics yet.<br>Add <strong>#hashtags</strong> in your posts to start a campus trend!
        </div>
      `;
      return;
    }

    const sorted = [...hashtagMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

    this.dom.trendingList.innerHTML = sorted.map(([tag, count]) => `
      <div class="trending-item" data-tag="${tag.replace('#', '')}">
        <div class="trending-meta">Campus &bull; Trending</div>
        <div class="trending-name">${tag}</div>
        <div class="trending-count">${count} post${count > 1 ? 's' : ''}</div>
      </div>
    `).join('');

    // Attach click listeners to trending tags
    this.dom.trendingList.querySelectorAll('.trending-item').forEach(item => {
      item.addEventListener('click', () => {
        const tag = item.getAttribute('data-tag');
        this.activeTagFilter = `#${tag}`;
        this.dom.rightSearchInput.value = `#${tag}`;
        this.updateFilterStrip();
        this.render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  // Filter Computation
  getFilteredPosts() {
    return this.posts.filter(post => {
      // Tab Filters
      if (this.activeTab === 'official' && !post.isOfficial && !post.isUrgent) {
        return false;
      }
      if (this.activeTab === 'bookmarks' && !this.userBookmarks.has(post.id)) {
        return false;
      }
      if (this.activeTab === 'profile' && post.authorHandle !== this.currentUser.handle) {
        return false;
      }

      // Tag Filter
      if (this.activeTagFilter) {
        if (!post.text.toLowerCase().includes(this.activeTagFilter.toLowerCase())) {
          return false;
        }
      }

      // Search Query
      if (this.searchQuery) {
        const full = `${post.authorName} ${post.authorHandle} ${post.text} ${post.category}`.toLowerCase();
        if (!full.includes(this.searchQuery)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (this.activeTab === 'trending') {
        const engA = a.likes + a.reposts * 2 + (a.repliesCount || 0);
        const engB = b.likes + b.reposts * 2 + (b.repliesCount || 0);
        return engB - engA;
      }
      return 0; // Default chronological order
    });
  }

  render() {
    this.updateBookmarkBadge();
    this.updateTrendingWidget();
    const posts = this.getFilteredPosts();

    if (posts.length === 0) {
      this.dom.feedContainer.innerHTML = '';
      this.dom.emptyFeed.style.display = 'block';
      return;
    }

    this.dom.emptyFeed.style.display = 'none';

    this.dom.feedContainer.innerHTML = posts.map(post => {
      const isLiked = this.userLikes.has(post.id);
      const isReposted = this.userReposts.has(post.id);
      const isBookmarked = this.userBookmarks.has(post.id);

      return `
        <article class="tweet-card ${post.isUrgent ? 'is-urgent' : ''}" data-id="${post.id}">
          <div class="tweet-avatar">
            <img src="https://api.dicebear.com/7.x/identicon/svg?seed=${post.avatarSeed}" class="avatar-img" alt="${post.authorName}">
          </div>

          <div class="tweet-body">
            <div class="tweet-header">
              <div class="author-info">
                <span class="author-name">${this.escapeHTML(post.authorName)}</span>
                ${post.isVerified ? '<span class="verified-check" title="Verified Campus Member">✓</span>' : ''}
                <span class="author-handle">${this.escapeHTML(post.authorHandle)}</span>
                <span class="dot-separator">&bull;</span>
                <span class="tweet-time">${post.timeAgo}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                ${post.isUrgent ? '<span class="urgent-badge">URGENT</span>' : ''}
                <span class="category-tag" data-cat="${post.category}">${post.category}</span>
              </div>
            </div>

            <div class="tweet-text">${this.formatTweetText(post.text)}</div>

            ${post.attachment ? `
              <div class="tweet-attachment" data-file="${this.escapeHTML(post.attachment)}">
                <span>📎</span>
                <span>${this.escapeHTML(post.attachment)}</span>
              </div>
            ` : ''}

            <!-- Tweet Interactive Actions -->
            <div class="tweet-actions-bar">
              <button class="action-item action-reply" data-id="${post.id}" title="Reply">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <span>${post.repliesCount || 0}</span>
              </button>

              <button class="action-item action-repost ${isReposted ? 'reposted' : ''}" data-id="${post.id}" title="Repost">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 1l4 4-4 4"></path>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                  <path d="M7 23l-4-4 4-4"></path>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                </svg>
                <span>${post.reposts || 0}</span>
              </button>

              <button class="action-item action-like ${isLiked ? 'liked' : ''}" data-id="${post.id}" title="Like">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span>${post.likes || 0}</span>
              </button>

              <button class="action-item action-bookmark ${isBookmarked ? 'bookmarked' : ''}" data-id="${post.id}" title="Bookmark">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
              </button>

              <button class="action-item action-share" data-id="${post.id}" title="Share">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach Action Bar Listeners
    this.dom.feedContainer.querySelectorAll('.action-like').forEach(btn => {
      btn.addEventListener('click', (e) => this.toggleLike(btn.getAttribute('data-id'), e));
    });

    this.dom.feedContainer.querySelectorAll('.action-repost').forEach(btn => {
      btn.addEventListener('click', (e) => this.toggleRepost(btn.getAttribute('data-id'), e));
    });

    this.dom.feedContainer.querySelectorAll('.action-bookmark').forEach(btn => {
      btn.addEventListener('click', (e) => this.toggleBookmark(btn.getAttribute('data-id'), e));
    });

    this.dom.feedContainer.querySelectorAll('.action-reply').forEach(btn => {
      btn.addEventListener('click', (e) => this.openReplyModal(btn.getAttribute('data-id'), e));
    });

    this.dom.feedContainer.querySelectorAll('.action-share').forEach(btn => {
      btn.addEventListener('click', (e) => this.sharePost(btn.getAttribute('data-id'), e));
    });

    // Hashtag clicks
    this.dom.feedContainer.querySelectorAll('.tweet-hashtag').forEach(ht => {
      ht.addEventListener('click', (e) => {
        e.stopPropagation();
        const tag = ht.textContent.trim();
        this.activeTagFilter = tag;
        this.dom.rightSearchInput.value = tag;
        this.updateFilterStrip();
        this.render();
      });
    });

    // Attachment clicks
    this.dom.feedContainer.querySelectorAll('.tweet-attachment').forEach(att => {
      att.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showToast(`Downloading: ${att.getAttribute('data-file')}`, "info");
      });
    });

    // Category tag clicks
    this.dom.feedContainer.querySelectorAll('.category-tag').forEach(tag => {
      tag.addEventListener('click', (e) => {
        e.stopPropagation();
        const cat = tag.getAttribute('data-cat');
        this.searchQuery = cat.toLowerCase();
        this.dom.rightSearchInput.value = cat;
        this.updateFilterStrip();
        this.render();
      });
    });
  }

  formatTweetText(text) {
    if (!text) return '';
    const escaped = this.escapeHTML(text);
    return escaped.replace(/#(\w+)/g, '<span class="tweet-hashtag">#$1</span>');
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    this.dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => toast.remove(), 200);
    }, 2800);
  }

  escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.campusX = new CampusXApp();
});
