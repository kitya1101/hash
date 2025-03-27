<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	const language = writable('ko');
	const translations = {
		ko: {
			title: '해시태그 검색기',
			placeholder: '해시태그 입력...',
			search: '검색',
			error: '오류:',
			fetchError: '요청이 너무 많습니다. 나중에 다시 시도해주세요.',
			debugInfo: '디버그 정보',
			postCount: '게시물 수:',
			relatedHashtags: '관련 해시태그:',
			copyHashtags: '해시태그 복사',
			copySuccess: '복사 완료!',
			logo: '해시태그 검색기'
		},
		en: {
			title: 'Hashtag Searcher',
			placeholder: 'Enter hashtag...',
			search: 'Search',
			error: 'Error:',
			fetchError: 'Too many requests. Please try again later.',
			debugInfo: 'Debug Info',
			postCount: 'Post Count:',
			relatedHashtags: 'Related Hashtags:',
			copyHashtags: 'Copy Hashtags',
			copySuccess: 'Copy Success!',
			logo: 'Hashtag Searcher'
		}
		// ... 다른 언어에 대한 번역
	};

	const languageList = [
		{ code: 'ko', name: '한국어' },
		{ code: 'en', name: 'English' }
		// ... 다른 언어 목록
	];

	let query = '';
	let loading = false;
	let errorKey = null;
	let mediaCount = null;
	let relatedHashtags = [];
	let debugInfo = null;
	let copySuccess = false;
	let currentLang;
	let buttonDisabled = false;
	let cooldownTimer = 0;
	const debugMode = false;
	let isDarkMode = false;
	let sidebarVisible = false;

	language.subscribe((value) => {
		currentLang = value;
	});

	async function searchHashtag() {
		if (!query || buttonDisabled) return;
		loading = true;
		errorKey = null;
		copySuccess = false;
		mediaCount = null;
		relatedHashtags = [];
		buttonDisabled = true;

		console.log('검색 시작:', query);

		try {
			const apiUrl = `https://hashtag-api.kitya1101.workers.dev/api/search?query=${encodeURIComponent(query.replace('#', ''))}&debugMode=${debugMode}`;
			console.log('API 요청 URL:', apiUrl);

			const response = await fetch(apiUrl);
			console.log('응답 상태:', response.status);

			const data = await response.json();
			console.log('응답 데이터:', data);

			if (response.ok) {
				mediaCount = data.media_count;
				relatedHashtags = data.related_hashtags;
				console.log('데이터 처리 완료:', { mediaCount, relatedHashtags });
			} else {
				errorKey = 'fetchError';
				console.error('API 오류:', data.error || '알 수 없는 오류');
			}
		} catch (err) {
			errorKey = 'fetchError';
			console.error('예외 발생:', err);
		} finally {
			loading = false;
			setTimeout(() => {
				buttonDisabled = false;
			}, 3000);
		}
	}

	function startCooldown() {
		buttonDisabled = true;
		cooldownTimer = 3;
		const interval = setInterval(() => {
			cooldownTimer--;
			if (cooldownTimer <= 0) {
				clearInterval(interval);
				buttonDisabled = false;
			}
		}, 1000);
	}

	function handleKeyDown(event) {
		if (event.key === 'Enter') {
			searchHashtag();
		}
	}

	function handleInput(event) {
		const input = event.target;
		let value = input.value;
		value = value.replace(/#/g, '');
		input.value = value;
		query = '#' + value;
		input.setSelectionRange(value.length, value.length);
	}

	function copyHashtags() {
		const hashtagString = relatedHashtags.map((tag) => `#${tag}`).join(' ');
		navigator.clipboard.writeText(hashtagString).then(
			() => {
				copySuccess = true;
				setTimeout(() => (copySuccess = false), 2000);
			},
			(err) => {
				console.error('텍스트를 복사할 수 없습니다: ', err);
			}
		);
	}

	function goToHome(event) {
		if (
			event.type === 'click' ||
			(event.type === 'keydown' && (event.key === 'Enter' || event.key === ' '))
		) {
			console.log('홈 페이지로 이동');
		}
	}

	function changeLanguage(lang) {
		language.set(lang);
	}

	function toggleDarkMode() {
		isDarkMode = !isDarkMode;
		if (isDarkMode) {
			document.body.classList.add('dark-mode');
		} else {
			document.body.classList.remove('dark-mode');
		}
	}

	function toggleSidebar() {
		sidebarVisible = !sidebarVisible;
	}

	onMount(() => {
		const searchInput = document.getElementById('search-input');
		if (searchInput) {
			searchInput.value = '';
			searchInput.focus();
		}
	});

	$: errorMessage = errorKey ? translations[currentLang][errorKey] : null;
</script>

<main class={isDarkMode ? 'dark-mode' : ''}>
	<div class="app-container">
		<!-- Sidebar -->
		<div id="sidebar" class={sidebarVisible ? 'active' : ''}>
			<div class="sidebar-header">
				<button
					class="logo"
					on:click={goToHome}
					on:keydown={goToHome}
					aria-label="홈 페이지로 이동"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" />
					</svg>
					<span>{translations[currentLang].logo}</span>
				</button>
				<button class="close-sidebar" on:click={toggleSidebar}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>

			<ul class="sidebar-menu">
				<li class="active">
					<a href="#">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
							<polyline points="9 22 9 12 15 12 15 22"></polyline>
						</svg>
						<span>홈</span>
					</a>
				</li>
				<li>
					<a href="#">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
						</svg>
						<span>인기 해시태그</span>
					</a>
				</li>
				<li>
					<a href="#">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
						</svg>
						<span>북마크</span>
					</a>
				</li>
				<li>
					<a href="#">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<circle cx="12" cy="12" r="3"></circle>
							<path
								d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
							></path>
						</svg>
						<span>설정</span>
					</a>
				</li>
			</ul>

			<div class="sidebar-footer">
				<div class="language-switcher">
					{#each languageList as lang}
						<button
							class={currentLang === lang.code ? 'active' : ''}
							on:click={() => changeLanguage(lang.code)}
						>
							{lang.name}
						</button>
					{/each}
				</div>

				<button class="theme-toggle" on:click={toggleDarkMode}>
					{#if isDarkMode}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<circle cx="12" cy="12" r="5"></circle>
							<line x1="12" y1="1" x2="12" y2="3"></line>
							<line x1="12" y1="21" x2="12" y2="23"></line>
							<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
							<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
							<line x1="1" y1="12" x2="3" y2="12"></line>
							<line x1="21" y1="12" x2="23" y2="12"></line>
							<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
							<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
						</svg>
						<span>라이트 모드</span>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
						</svg>
						<span>다크 모드</span>
					{/if}
				</button>
			</div>
		</div>

		<!-- Main Content -->
		<div id="content">
			<!-- Header -->
			<nav class="navbar">
				<div class="navbar-left">
					<button class="menu-btn" on:click={toggleSidebar}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<line x1="3" y1="12" x2="21" y2="12"></line>
							<line x1="3" y1="6" x2="21" y2="6"></line>
							<line x1="3" y1="18" x2="21" y2="18"></line>
						</svg>
					</button>
					<div class="logo-text">{translations[currentLang].logo}</div>
				</div>

				<div class="navbar-right">
					<button class="action-btn theme-toggle-btn" on:click={toggleDarkMode}>
						{#if isDarkMode}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<circle cx="12" cy="12" r="5"></circle>
								<line x1="12" y1="1" x2="12" y2="3"></line>
								<line x1="12" y1="21" x2="12" y2="23"></line>
								<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
								<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
								<line x1="1" y1="12" x2="3" y2="12"></line>
								<line x1="21" y1="12" x2="23" y2="12"></line>
								<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
								<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
							</svg>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
							</svg>
						{/if}
					</button>

					<div class="language-dropdown">
						<button class="action-btn language-btn">
							{languageList.find((lang) => lang.code === currentLang).name}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<polyline points="6 9 12 15 18 9"></polyline>
							</svg>
						</button>
						<div class="dropdown-menu">
							{#each languageList as lang}
								<button
									class={currentLang === lang.code ? 'active' : ''}
									on:click={() => changeLanguage(lang.code)}
								>
									{lang.name}
								</button>
							{/each}
						</div>
					</div>

					<button class="action-btn">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<circle cx="11" cy="11" r="8"></circle>
							<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
						</svg>
					</button>

					<button class="action-btn">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
							<path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
						</svg>
						<span class="notification-badge">3</span>
					</button>

					<button class="profile-btn">
						<div class="avatar">
							<img src="https://placehold.co/100" alt="Profile" />
						</div>
					</button>
				</div>
			</nav>

			<!-- Main Content -->
			<main class="main-content">
				<div class="main-header">
					<h1>{translations[currentLang].title}</h1>
				</div>

				<div class="search-section">
					<div class="search-container">
						<div class="search-input-wrapper">
							<span class="hashtag-prefix">#</span>
							<input
								id="search-input"
								type="text"
								on:input={handleInput}
								on:keydown={handleKeyDown}
								placeholder={translations[currentLang].placeholder}
								autocomplete="off"
							/>
							<button
								on:click={searchHashtag}
								class="search-button"
								disabled={loading || !query || buttonDisabled}
							>
								{#if loading}
									<div class="spinner"></div>
								{:else}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<circle cx="11" cy="11" r="8"></circle>
										<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
									</svg>
								{/if}
								<span>{translations[currentLang].search}</span>
							</button>
						</div>
					</div>

					{#if loading}
						<div class="loading-container">
							<div class="pulse-loader">
								<div></div>
								<div></div>
								<div></div>
							</div>
						</div>
					{:else if errorMessage}
						<div class="error-container">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<circle cx="12" cy="12" r="10"></circle>
								<line x1="12" y1="8" x2="12" y2="12"></line>
								<line x1="12" y1="16" x2="12.01" y2="16"></line>
							</svg>
							<p>{translations[currentLang].error} {errorMessage}</p>
						</div>
					{:else if mediaCount !== null}
						<div class="results-section">
							<!-- Bento Grid Layout -->
							<div class="bento-grid">
								<div class="bento-item media-count-card">
									<div class="card-content">
										<h3>미디어 통계</h3>
										<div class="count-box">
											<div class="count-label">{translations[currentLang].postCount}</div>
											<div class="count-value">{mediaCount.toLocaleString()}</div>
										</div>
									</div>
								</div>

								<div class="bento-item hashtag-list-card">
									<div class="card-content">
										<h3>{translations[currentLang].relatedHashtags}</h3>
										<ul class="hashtag-list">
											{#each relatedHashtags as tag}
												<li>
													<span class="hashtag-icon">#</span>
													{tag}
												</li>
											{/each}
										</ul>
										<button class="copy-button" on:click={copyHashtags}>
											{#if copySuccess}
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="20"
													height="20"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
												>
													<path d="M20 6L9 17l-5-5"></path>
												</svg>
												<span>{translations[currentLang].copySuccess}</span>
											{:else}
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="20"
													height="20"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
												>
													<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
													<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
												</svg>
												<span>{translations[currentLang].copyHashtags}</span>
											{/if}
										</button>
									</div>
								</div>

								<div class="bento-item search-info-card">
									<div class="card-content">
										<h3>검색 개요</h3>
										<div class="search-details">
											<div class="search-detail-item">
												<span class="detail-label">검색 태그:</span>
												<span class="detail-value">{query}</span>
											</div>
											<div class="search-detail-item">
												<span class="detail-label">연관 태그:</span>
												<span class="detail-value">{relatedHashtags.length}개</span>
											</div>
											<div class="search-detail-item">
												<span class="detail-label">분석 시간:</span>
												<span class="detail-value">{new Date().toLocaleTimeString()}</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</main>
		</div>
	</div>
</main>

<style>
	/* Base Styles & Variables */
	:global(body) {
		margin: 0;
		padding: 0;
		font-family:
			'Poppins',
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			sans-serif;
		min-height: 100vh;
		transition:
			background-color 0.3s,
			color 0.3s;
	}

	:root {
		--bg-primary: #f9f9f9;
		--bg-secondary: #ffffff;
		--color-primary: #333333;
		--color-secondary: #666666;
		--color-accent: #4f3ff0;
		--color-accent-light: #6f5fff;
		--color-accent-gradient: linear-gradient(45deg, #4f3ff0, #7b68ee);
		--border-color: #e0e0e0;
		--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
		--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
		--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
		--radius-sm: 8px;
		--radius-md: 12px;
		--radius-lg: 20px;
		--header-height: 70px;
		--sidebar-width: 270px;
		--input-bg: #f5f5f5;
		--card-bg-1: #e9e7fd;
		--card-bg-2: #fee4cb;
		--card-bg-3: #dbf6fd;
		--error-color: #dc2626;
		--error-bg: #fee2e2;
		--hashtag-color: #555;
		--notification-color: #fff;
		--notification-bg: #f44336;
	}

	.dark-mode {
		--bg-primary: #1f1d2b;
		--bg-secondary: #252836;
		--color-primary: #f5f5f5;
		--color-secondary: #a0a0a0;
		--color-accent: #6f5fff;
		--color-accent-light: #8a7bff;
		--color-accent-gradient: linear-gradient(45deg, #6f5fff, #8a7bff);
		--border-color: #2d303e;
		--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.2);
		--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
		--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.3);
		--input-bg: #2d303e;
		--card-bg-1: #34306f;
		--card-bg-2: #623d20;
		--card-bg-3: #1a4a5e;
		--error-color: #f87171;
		--error-bg: #7f1d1d;
		--hashtag-color: #aaa;
	}

	main {
		background-color: var(--bg-primary);
		color: var(--color-primary);
		min-height: 100vh;
		display: flex;
	}

	.app-container {
		display: flex;
		width: 100%;
		position: relative;
	}

	/* Sidebar Styles */
	#sidebar {
		width: var(--sidebar-width);
		background-color: var(--bg-secondary);
		height: 100vh;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 999;
		box-shadow: var(--shadow-md);
		display: flex;
		flex-direction: column;
		transition: transform 0.3s ease;
	}

	@media (max-width: 992px) {
		#sidebar {
			transform: translateX(-100%);
		}

		#sidebar.active {
			transform: translateX(0);
		}
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px;
		border-bottom: 1px solid var(--border-color);
	}

	.sidebar-header .logo {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 18px;
		font-weight: 600;
		color: var(--color-primary);
		background: none;
		border: none;
		cursor: pointer;
	}

	.sidebar-header .logo svg {
		color: var(--color-accent);
	}

	.close-sidebar {
		background: none;
		border: none;
		color: var(--color-secondary);
		cursor: pointer;
		display: none;
	}

	@media (max-width: 992px) {
		.close-sidebar {
			display: block;
		}
	}

	.sidebar-menu {
		list-style: none;
		padding: 20px 0;
		margin: 0;
		flex-grow: 1;
	}

	.sidebar-menu li {
		margin-bottom: 5px;
	}

	.sidebar-menu li a {
		display: flex;
		align-items: center;
		padding: 12px 20px;
		color: var(--color-secondary);
		text-decoration: none;
		transition: all 0.3s;
		border-radius: 8px;
		margin: 0 10px;
		gap: 12px;
	}

	.sidebar-menu li a:hover,
	.sidebar-menu li.active a {
		background-color: var(--bg-primary);
		color: var(--color-accent);
	}

	.sidebar-menu li.active a {
		font-weight: 600;
	}

	.sidebar-menu li a svg {
		color: currentColor;
	}

	.sidebar-footer {
		padding: 20px;
		border-top: 1px solid var(--border-color);
	}

	.language-switcher {
		display: flex;
		gap: 8px;
		margin-bottom: 15px;
	}

	.language-switcher button {
		flex: 1;
		padding: 8px;
		border: 1px solid var(--border-color);
		background: var(--bg-primary);
		color: var(--color-secondary);
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.3s;
	}

	.language-switcher button.active {
		background: var(--color-accent);
		color: white;
		border-color: var(--color-accent);
	}

	.theme-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		padding: 10px;
		gap: 10px;
		border: none;
		background: var(--bg-primary);
		color: var(--color-secondary);
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.3s;
	}

	.theme-toggle:hover {
		background: var(--color-accent-light);
		color: white;
	}

	/* Main Content Styles */
	#content {
		flex: 1;
		margin-left: var(--sidebar-width);
		transition: margin 0.3s ease;
	}

	@media (max-width: 992px) {
		#content {
			margin-left: 0;
		}
	}

	/* Navbar Styles */
	.navbar {
		height: var(--header-height);
		background-color: var(--bg-secondary);
		box-shadow: var(--shadow-sm);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 20px;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.navbar-left {
		display: flex;
		align-items: center;
		gap: 15px;
	}

	.menu-btn {
		background: none;
		border: none;
		color: var(--color-primary);
		cursor: pointer;
		display: none;
	}

	@media (max-width: 992px) {
		.menu-btn {
			display: block;
		}
	}

	.logo-text {
		font-size: 18px;
		font-weight: 600;
		color: var(--color-primary);
	}

	.navbar-right {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.action-btn {
		background: none;
		border: none;
		color: var(--color-secondary);
		cursor: pointer;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s;
		position: relative;
	}

	.action-btn:hover {
		background-color: var(--bg-primary);
		color: var(--color-accent);
	}

	.notification-badge {
		position: absolute;
		top: 0;
		right: 0;
		background-color: var(--notification-bg);
		color: var(--notification-color);
		font-size: 10px;
		font-weight: 600;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.language-btn {
		display: flex;
		align-items: center;
		gap: 5px;
		width: auto;
		padding: 0 12px;
		border-radius: 20px;
	}

	.language-dropdown {
		position: relative;
	}

	.dropdown-menu {
		position: absolute;
		top: 45px;
		right: 0;
		background-color: var(--bg-secondary);
		border-radius: var(--radius-sm);
		box-shadow: var(--shadow-md);
		width: 120px;
		display: none;
		overflow: hidden;
		z-index: 10;
	}

	.language-dropdown:hover .dropdown-menu {
		display: block;
	}

	.dropdown-menu button {
		width: 100%;
		padding: 10px 15px;
		text-align: left;
		background: none;
		border: none;
		color: var(--color-secondary);
		cursor: pointer;
		transition: all 0.3s;
	}

	.dropdown-menu button:hover,
	.dropdown-menu button.active {
		background-color: var(--bg-primary);
		color: var(--color-accent);
	}

	.profile-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
	}

	.avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		overflow: hidden;
		background-color: var(--bg-primary);
	}

	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Main Content Area */
	.main-content {
		padding: 30px;
		max-width: 1200px;
		margin: 0 auto;
	}

	.main-header {
		margin-bottom: 30px;
	}

	.main-header h1 {
		font-size: 28px;
		font-weight: 600;
		color: var(--color-primary);
		text-align: center;
		margin: 0;
	}

	/* Search Section */
	.search-section {
		margin-bottom: 40px;
	}

	.search-container {
		max-width: 700px;
		margin: 0 auto 30px;
	}

	.search-input-wrapper {
		display: flex;
		align-items: center;
		background-color: var(--bg-secondary);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-md);
		overflow: hidden;
		position: relative;
	}

	.hashtag-prefix {
		position: absolute;
		left: 20px;
		color: var(--hashtag-color);
		font-size: 18px;
		font-weight: 600;
	}

	#search-input {
		flex-grow: 1;
		border: none;
		padding: 16px 16px 16px 40px;
		font-size: 16px;
		background-color: transparent;
		color: var(--color-primary);
	}

	#search-input:focus {
		outline: none;
	}

	#search-input::placeholder {
		color: var(--color-secondary);
	}

	.search-button {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 16px 24px;
		border: none;
		background: var(--color-accent-gradient);
		color: white;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s;
	}

	.search-button:hover {
		background: var(--color-accent);
	}

	.search-button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.spinner {
		width: 20px;
		height: 20px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: white;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Loading Animation */
	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 200px;
	}

	.pulse-loader {
		display: flex;
		gap: 6px;
	}

	.pulse-loader div {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background-color: var(--color-accent);
		animation: pulse 1.5s ease infinite;
	}

	.pulse-loader div:nth-child(2) {
		animation-delay: 0.2s;
	}

	.pulse-loader div:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.3);
			opacity: 0.7;
		}
	}

	/* Error Container */
	.error-container {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		background-color: var(--error-bg);
		color: var(--error-color);
		border-radius: var(--radius-md);
		margin-bottom: 20px;
	}

	.error-container p {
		margin: 0;
	}

	/* Results Section - Bento Grid */
	.results-section {
		margin-top: 40px;
	}

	.bento-grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		gap: 20px;
	}

	.bento-item {
		border-radius: var(--radius-md);
		overflow: hidden;
		box-shadow: var(--shadow-md);
		transition:
			transform 0.3s,
			box-shadow 0.3s;
	}

	.bento-item:hover {
		transform: translateY(-5px);
		box-shadow: var(--shadow-lg);
	}

	.media-count-card {
		grid-column: span 4;
		background-color: var(--card-bg-1);
	}

	.hashtag-list-card {
		grid-column: span 5;
		background-color: var(--card-bg-2);
	}

	.search-info-card {
		grid-column: span 3;
		background-color: var(--card-bg-3);
	}

	@media (max-width: 992px) {
		.media-count-card,
		.hashtag-list-card,
		.search-info-card {
			grid-column: span 12;
		}
	}

	.card-content {
		padding: 20px;
	}

	.card-content h3 {
		font-size: 18px;
		font-weight: 600;
		margin-top: 0;
		margin-bottom: 15px;
		color: var(--color-primary);
	}

	/* Media Count Card */
	.count-box {
		padding: 20px;
		background-color: rgba(255, 255, 255, 0.2);
		border-radius: var(--radius-sm);
		text-align: center;
	}

	.count-label {
		font-size: 14px;
		margin-bottom: 10px;
		color: var(--color-primary);
	}

	.count-value {
		font-size: 36px;
		font-weight: 700;
		color: var(--color-primary);
	}

	/* Hashtag List Card */
	.hashtag-list {
		list-style: none;
		padding: 0;
		margin: 0 0 20px 0;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.hashtag-list li {
		padding: 8px 12px;
		background-color: rgba(255, 255, 255, 0.2);
		border-radius: 20px;
		font-size: 14px;
		display: flex;
		align-items: center;
		gap: 4px;
		transition: all 0.3s;
	}

	.hashtag-list li:hover {
		background-color: rgba(255, 255, 255, 0.4);
		transform: translateY(-2px);
	}

	.hashtag-icon {
		color: var(--color-accent);
		font-weight: 600;
	}

	.copy-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		padding: 10px;
		background: rgba(0, 0, 0, 0.1);
		border: none;
		border-radius: var(--radius-sm);
		color: var(--color-primary);
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s;
	}

	.copy-button:hover {
		background: rgba(0, 0, 0, 0.2);
	}

	/* Search Info Card */
	.search-details {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.search-detail-item {
		padding: 10px;
		background-color: rgba(255, 255, 255, 0.2);
		border-radius: var(--radius-sm);
	}

	.detail-label {
		font-size: 12px;
		color: var(--color-secondary);
		display: block;
		margin-bottom: 4px;
	}

	.detail-value {
		font-weight: 600;
		color: var(--color-primary);
	}

	/* Responsive Adjustments */
	@media (max-width: 768px) {
		.main-content {
			padding: 20px 15px;
		}

		.search-input-wrapper {
			flex-direction: column;
			align-items: stretch;
		}

		#search-input {
			width: 100%;
			padding: 15px 15px 15px 40px;
			border-radius: var(--radius-md) var(--radius-md) 0 0;
		}

		.search-button {
			border-radius: 0 0 var(--radius-md) var(--radius-md);
			width: 100%;
			justify-content: center;
		}
	}
</style>
