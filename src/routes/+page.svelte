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
			logo: '로고',
			popularTags: '인기 해시태그',
			insights: '인사이트',
			proFeaturesTitle: '프로 기능',
			proFeatures: '더 많은 기능 이용하기',
			trendingNow: '지금 뜨는 해시태그',
			recent: '최근 검색',
			clear: '지우기',
			saveSearch: '검색 저장',
			savedSearches: '저장된 검색',
			moreInfo: '자세히 보기',
			darkMode: '다크 모드',
			lightMode: '라이트 모드'
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
			logo: 'Logo',
			popularTags: 'Popular Tags',
			insights: 'Insights',
			proFeaturesTitle: 'Pro Features',
			proFeatures: 'Get More Features',
			trendingNow: 'Trending Now',
			recent: 'Recent Searches',
			clear: 'Clear',
			saveSearch: 'Save Search',
			savedSearches: 'Saved Searches',
			moreInfo: 'Learn More',
			darkMode: 'Dark Mode',
			lightMode: 'Light Mode'
		}
	};

	const languageList = [
		{ code: 'ko', name: '한국어' },
		{ code: 'en', name: 'English' }
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
	let recentSearches = [];
	let savedSearches = [];
	let popularTags = ['여행', '맛집', '일상', '패션', '데일리', '뷰티', 'ootd', '셀카'];
	let trendingTags = ['주말플랜', '신상템', '홈트', '꿀팁공유', '제주여행'];

	language.subscribe((value) => {
		currentLang = value;
	});

	function toggleTheme() {
		isDarkMode = !isDarkMode;
		document.body.classList.toggle('dark-theme', isDarkMode);
	}

	function addToRecentSearches(tag) {
		// 중복 검색어 제거 후 맨 앞에 추가
		recentSearches = [tag, ...recentSearches.filter((item) => item !== tag)].slice(0, 5);
	}

	function clearRecentSearches() {
		recentSearches = [];
	}

	function saveCurrentSearch() {
		if (query && !savedSearches.includes(query)) {
			savedSearches = [...savedSearches, query].slice(0, 10);
		}
	}

	function useRecentSearch(tag) {
		query = tag;
		searchHashtag();
	}

	async function searchHashtag() {
		if (!query || buttonDisabled) return;
		loading = true;
		errorKey = null;
		copySuccess = false;
		mediaCount = null;
		relatedHashtags = [];
		buttonDisabled = true;

		// 최근 검색어에 추가
		if (query) {
			addToRecentSearches(query);
		}

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

	onMount(() => {
		const searchInput = document.getElementById('search-input');
		if (searchInput) {
			searchInput.value = '';
			searchInput.focus();
		}
	});

	$: errorMessage = errorKey ? translations[currentLang][errorKey] : null;
</script>

<main class="instagram-style {isDarkMode ? 'dark-theme' : ''}">
	<nav class="app-bar">
		<div class="container">
			<button class="logo" on:click={goToHome} on:keydown={goToHome} aria-label="홈 페이지로 이동">
				{translations[currentLang].logo}
			</button>
			<div class="nav-controls">
				<button class="theme-toggle" on:click={toggleTheme} aria-label="테마 전환">
					{isDarkMode ? translations[currentLang].lightMode : translations[currentLang].darkMode}
				</button>
				<div class="language-menu">
					<button class="language-button">
						{languageList.find((lang) => lang.code === currentLang).name}
					</button>
					<div class="language-dropdown">
						{#each languageList as lang}
							<button on:click={() => changeLanguage(lang.code)}>{lang.name}</button>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</nav>

	<div class="content">
		<div class="search-wrapper">
			<div class="intro-badge">해시태그 파워서치</div>
			<h1>{translations[currentLang].title}</h1>

			<div class="search-container">
				<div class="input-wrapper">
					<input
						id="search-input"
						type="text"
						on:input={handleInput}
						on:keydown={handleKeyDown}
						placeholder={translations[currentLang].placeholder}
						autocomplete="off"
					/>
				</div>
				<button
					on:click={searchHashtag}
					class="search-button"
					disabled={loading || !query || buttonDisabled}
				>
					{translations[currentLang].search}
				</button>
			</div>

			{#if recentSearches.length > 0}
				<div class="recent-searches">
					<div class="recent-header">
						<h3>{translations[currentLang].recent}</h3>
						<button class="clear-button" on:click={clearRecentSearches}
							>{translations[currentLang].clear}</button
						>
					</div>
					<div class="recent-tags">
						{#each recentSearches as tag}
							<button class="recent-tag" on:click={() => useRecentSearch(tag)}>{tag}</button>
						{/each}
					</div>
				</div>
			{/if}

			{#if loading}
				<div class="loading-container">
					<div class="loading-dots">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
			{:else if errorMessage}
				<div class="error">
					<p>{translations[currentLang].error} {errorMessage}</p>
				</div>
			{:else if mediaCount !== null}
				<div class="results">
					<div class="result-header">
						<p class="media-count">
							{translations[currentLang].postCount}
							{mediaCount.toLocaleString()}
						</p>
						<button class="save-button" on:click={saveCurrentSearch}>
							{translations[currentLang].saveSearch}
						</button>
					</div>

					<h2>{translations[currentLang].relatedHashtags}</h2>
					<ul class="related-hashtags">
						{#each relatedHashtags as tag}
							<li>#{tag}</li>
						{/each}
					</ul>
					<button class="copy-button" on:click={copyHashtags}>
						{copySuccess
							? translations[currentLang].copySuccess
							: translations[currentLang].copyHashtags}
					</button>
				</div>
			{/if}
		</div>

		<!-- 사이드 패널 추가 -->
		<div class="side-panel">
			<!-- 인기 해시태그 섹션 -->
			<div class="panel-section">
				<div class="panel-header">
					<h3>{translations[currentLang].popularTags}</h3>
					<span class="trending-badge">HOT</span>
				</div>
				<div class="popular-tags">
					{#each popularTags as tag}
						<button
							class="popular-tag"
							on:click={() => {
								query = `#${tag}`;
								searchHashtag();
							}}>#{tag}</button
						>
					{/each}
				</div>
			</div>

			<!-- 트렌딩 섹션 -->
			<div class="panel-section">
				<div class="panel-header">
					<h3>{translations[currentLang].trendingNow}</h3>
					<span class="trending-up-icon">↑</span>
				</div>
				<div class="trending-list">
					{#each trendingTags as tag, i}
						<div class="trending-item">
							<span class="trending-rank">{i + 1}</span>
							<span class="trending-tag">#{tag}</span>
							<span class="trending-stat">+{Math.floor(Math.random() * 50) + 20}%</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- 프로 기능 홍보 섹션 -->
			<div class="pro-promo">
				<div class="promo-content">
					<h3>{translations[currentLang].proFeaturesTitle}</h3>
					<ul class="pro-features-list">
						<li>✓ 무제한 검색</li>
						<li>✓ 인사이트 대시보드</li>
						<li>✓ 맞춤 추천</li>
					</ul>
					<button class="pro-button">{translations[currentLang].proFeatures}</button>
				</div>
			</div>
		</div>
	</div>

	<!-- 하단 배너 추가 -->
	<div class="bottom-banner">
		<div class="banner-content">
			<div class="banner-text">
				<h3>해시태그로 더 많은 팔로워를 얻으세요</h3>
				<p>인플루언서들이 사용하는 똑같은 도구</p>
			</div>
			<button class="banner-button">{translations[currentLang].moreInfo}</button>
		</div>
	</div>
</main>

<style>
	/* 기존 스타일 유지 */
	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100px;
	}

	.loading-dots {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.loading-dots div {
		width: 10px;
		height: 10px;
		margin: 0 5px;
		background-color: #e1306c; /* Pink color */
		border-radius: 50%;
		animation: bounce 0.5s infinite alternate;
	}

	.loading-dots div:nth-child(2) {
		background-color: #c13576; /* Orange color */
		animation-delay: 0.1s;
	}

	.loading-dots div:nth-child(3) {
		background-color: #b03ab4; /* Yellow color */
		animation-delay: 0.2s;
	}

	@keyframes bounce {
		to {
			transform: translateY(-10px);
		}
	}
	:global(body) {
		margin: 0;
		padding: 0;
		background-color: #f9fafb;
		font-family:
			'Pretendard',
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			Helvetica,
			Arial,
			sans-serif;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		letter-spacing: -0.3px;
		transition:
			background-color 0.3s ease,
			color 0.3s ease;
	}

	:global(body.dark-theme) {
		background-color: #111827;
		color: #f3f4f6;
	}

	.instagram-style {
		color: #111827;
		flex-grow: 1;
		display: flex;
		flex-direction: column;
	}

	.dark-theme {
		color: #f3f4f6;
	}

	/* 앱 바 스타일 */
	.app-bar {
		background: linear-gradient(45deg, #4f46e5, #6366f1, #8b5cf6, #a855f7);
		padding: 20px 0;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	}

	.app-bar .container {
		margin: 0 auto;
		padding: 0 24px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 1280px;
	}

	.nav-controls {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.logo {
		font-family: 'Pretendard', sans-serif;
		font-size: 28px;
		font-weight: 800;
		color: #ffffff;
		cursor: pointer;
		background: none;
		border: none;
		padding: 10px 0;
		line-height: 1.2;
		letter-spacing: -0.5px;
	}

	.logo:hover {
		opacity: 0.9;
	}

	/* 테마 토글 */
	.theme-toggle {
		background: rgba(255, 255, 255, 0.15);
		border: none;
		color: white;
		cursor: pointer;
		padding: 10px 16px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		transition: background-color 0.2s ease;
	}

	.theme-toggle:hover {
		background: rgba(255, 255, 255, 0.25);
	}

	/* 메인 컨텐츠 레이아웃 */
	.content {
		flex-grow: 1;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		padding: 40px 24px;
		box-sizing: border-box;
		gap: 24px;
		max-width: 1280px;
		margin: 0 auto;
		width: 100%;
	}

	/* 검색 래퍼 */
	.search-wrapper {
		flex: 1;
		min-width: 0;
		max-width: 750px;
		background-color: #ffffff;
		border-radius: 16px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
		padding: 32px;
		box-sizing: border-box;
		position: relative;
	}

	.dark-theme .search-wrapper {
		background-color: #1f2937;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
	}

	/* 인트로 배지 */
	.intro-badge {
		position: absolute;
		top: -12px;
		left: 50%;
		transform: translateX(-50%);
		background: #4f46e5;
		color: white;
		padding: 6px 14px;
		border-radius: 20px;
		font-size: 14px;
		font-weight: 700;
		letter-spacing: -0.3px;
		box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
	}

	h1 {
		text-align: center;
		color: #111827;
		margin-bottom: 32px;
		font-size: 32px;
		font-weight: 700;
		letter-spacing: -0.6px;
	}

	.dark-theme h1 {
		color: #f3f4f6;
	}

	.search-container {
		display: flex;
		margin-bottom: 24px;
		gap: 8px;
	}

	.input-wrapper {
		position: relative;
		flex-grow: 1;
	}

	input {
		width: 100%;
		padding: 16px 16px 16px 40px;
		border: 2px solid #e5e7eb;
		border-radius: 12px;
		font-size: 16px;
		font-weight: 500;
		outline: none;
		box-sizing: border-box;
		caret-color: #4f46e5;
		color: #111827;
		transition: all 0.2s ease;
	}

	.dark-theme input {
		background-color: #374151;
		border-color: #4b5563;
		color: #f3f4f6;
	}

	input:focus {
		border-color: #4f46e5;
		box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
	}

	input::placeholder {
		color: #9ca3af;
		font-weight: 400;
	}

	.dark-theme input::placeholder {
		color: #9ca3af;
	}

	.input-wrapper::before {
		content: '#';
		position: absolute;
		left: 16px;
		top: 50%;
		transform: translateY(-50%);
		color: #9ca3af;
		font-size: 20px;
		pointer-events: none;
		font-weight: 600;
	}

	.dark-theme .input-wrapper::before {
		color: #d1d5db;
	}

	/* 버튼 스타일 */
	.search-button {
		padding: 0 24px;
		background: #4f46e5;
		color: white;
		border: none;
		border-radius: 12px;
		cursor: pointer;
		font-size: 16px;
		font-weight: 600;
		letter-spacing: -0.3px;
		transition: all 0.2s ease;
	}

	.search-button:hover {
		background: #4338ca;
	}

	.search-button:disabled {
		background-color: #a5b4fc;
		cursor: not-allowed;
	}

	/* 최근 검색어 스타일 */
	.recent-searches {
		margin-bottom: 24px;
		background-color: #f3f4f6;
		border-radius: 12px;
		padding: 16px;
	}

	.dark-theme .recent-searches {
		background-color: #2d3748;
	}

	.recent-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.recent-header h3 {
		font-size: 16px;
		font-weight: 600;
		margin: 0;
		color: #111827;
	}

	.dark-theme .recent-header h3 {
		color: #f3f4f6;
	}

	.clear-button {
		background: none;
		border: none;
		color: #6b7280;
		font-size: 14px;
		cursor: pointer;
		padding: 4px 8px;
	}

	.dark-theme .clear-button {
		color: #9ca3af;
	}

	.clear-button:hover {
		color: #4f46e5;
	}

	.recent-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.recent-tag {
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 6px 12px;
		font-size: 14px;
		color: #4f46e5;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.dark-theme .recent-tag {
		background: #374151;
		border-color: #4b5563;
		color: #a5b4fc;
	}

	.recent-tag:hover {
		background: #eff6ff;
		border-color: #4f46e5;
	}

	.dark-theme .recent-tag:hover {
		background: #312e81;
		border-color: #6366f1;
	}

	/* 결과 스타일링 */
	.error {
		color: #ef4444;
		font-weight: 500;
		padding: 16px;
		border-radius: 12px;
		background-color: #fee2e2;
		margin-bottom: 16px;
		text-align: center;
	}

	.dark-theme .error {
		background-color: rgba(239, 68, 68, 0.2);
	}

	.results {
		background-color: #f9fafb;
		border-radius: 12px;
		padding: 24px;
		margin-bottom: 16px;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.dark-theme .results {
		background-color: #1f2937;
	}

	.result-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	.results h2 {
		color: #111827;
		font-size: 20px;
		margin-bottom: 16px;
		font-weight: 700;
		letter-spacing: -0.3px;
	}

	.dark-theme .results h2 {
		color: #f3f4f6;
	}

	.media-count {
		font-weight: 700;
		font-size: 16px;
		color: #111827;
		margin: 0;
	}

	.dark-theme .media-count {
		color: #f3f4f6;
	}

	.save-button {
		background: none;
		border: 1px solid #4f46e5;
		color: #4f46e5;
		padding: 6px 12px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.dark-theme .save-button {
		border-color: #6366f1;
		color: #6366f1;
	}

	.save-button:hover {
		background-color: #eff6ff;
	}

	.dark-theme .save-button:hover {
		background-color: rgba(99, 102, 241, 0.1);
	}

	/* 관련 해시태그 스타일링 */
	.related-hashtags {
		list-style-type: none;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-bottom: 24px;
	}

	.related-hashtags li {
		background-color: #ffffff;
		color: #4f46e5;
		padding: 8px 16px;
		border-radius: 8px;
		font-size: 15px;
		font-weight: 600;
		letter-spacing: -0.3px;
		border: 1px solid #e5e7eb;
		transition: all 0.2s ease;
	}

	.dark-theme .related-hashtags li {
		background-color: #374151;
		border-color: #4b5563;
		color: #a5b4fc;
	}

	.related-hashtags li:hover {
		background-color: #eff6ff;
		border-color: #4f46e5;
		transform: translateY(-2px);
	}

	.dark-theme .related-hashtags li:hover {
		background-color: #312e81;
		border-color: #6366f1;
	}

	/* 복사 버튼 */
	.copy-button {
		width: 100%;
		background: #4f46e5;
		color: white;
		border: none;
		border-radius: 12px;
		padding: 14px 0;
		cursor: pointer;
		font-size: 16px;
		font-weight: 600;
		letter-spacing: -0.3px;
		transition: all 0.2s ease;
	}

	.copy-button:hover {
		background: #4338ca;
		transform: translateY(-2px);
	}

	/* 사이드 패널 스타일 */
	.side-panel {
		width: 300px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.panel-section {
		background-color: #ffffff;
		border-radius: 16px;
		padding: 20px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
	}

	.dark-theme .panel-section {
		background-color: #1f2937;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.panel-header h3 {
		font-size: 16px;
		font-weight: 700;
		margin: 0;
		color: #111827;
	}

	.dark-theme .panel-header h3 {
		color: #f3f4f6;
	}

	.trending-badge {
		background-color: #ef4444;
		color: white;
		padding: 4px 8px;
		border-radius: 6px;
		font-size: 12px;
		font-weight: 700;
	}

	.trending-up-icon {
		color: #10b981;
		font-size: 18px;
		font-weight: 700;
	}

	.popular-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.popular-tag {
		background: #f3f4f6;
		border: none;
		border-radius: 8px;
		padding: 8px 12px;
		font-size: 14px;
		color: #4f46e5;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.dark-theme .popular-tag {
		background: #374151;
		color: #a5b4fc;
	}

	.popular-tag:hover {
		background: #eff6ff;
	}

	.dark-theme .popular-tag:hover {
		background: #312e81;
	}

	.trending-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.trending-item {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.trending-rank {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f3f4f6;
		border-radius: 4px;
		font-weight: 700;
		font-size: 14px;
		color: #4b5563;
	}

	.dark-theme .trending-rank {
		background: #374151;
		color: #d1d5db;
	}

	.trending-tag {
		flex: 1;
		font-size: 14px;
		font-weight: 500;
	}

	.trending-stat {
		color: #10b981;
		font-size: 14px;
		font-weight: 600;
	}

	/* 프로모션 섹션 스타일 */
	.pro-promo {
		background: linear-gradient(135deg, #4f46e5, #7c3aed);
		border-radius: 16px;
		padding: 20px;
		color: white;
		box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
	}

	.promo-content {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.promo-content h3 {
		font-size: 18px;
		font-weight: 700;
		margin: 0;
	}

	.pro-features-list {
		list-style-type: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.pro-features-list li {
		font-size: 14px;
		font-weight: 500;
	}

	.pro-button {
		background: rgba(255, 255, 255, 0.2);
		border: none;
		border-radius: 8px;
		padding: 10px 0;
		color: white;
		font-weight: 600;
		cursor: pointer;
		margin-top: 8px;
		transition: all 0.2s ease;
	}

	.pro-button:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	/* 하단 배너 스타일 */
	.bottom-banner {
		background: #f3f4f6;
		padding: 24px;
		margin-top: 40px;
	}

	.dark-theme .bottom-banner {
		background: #1f2937;
	}

	.banner-content {
		max-width: 1280px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.banner-text h3 {
		font-size: 18px;
		font-weight: 700;
		margin: 0 0 8px 0;
		color: #111827;
	}

	.dark-theme .banner-text h3 {
		color: #f3f4f6;
	}

	.banner-text p {
		font-size: 14px;
		color: #6b7280;
		margin: 0;
	}

	.dark-theme .banner-text p {
		color: #9ca3af;
	}

	.banner-button {
		background: #4f46e5;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 8px 16px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.banner-button:hover {
		background: #4338ca;
	}
</style>
