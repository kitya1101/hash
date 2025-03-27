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
			logo: 'HashTag'
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
			logo: 'HashTag'
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
	let darkMode = false;

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
		darkMode = !darkMode;
		document.body.classList.toggle('dark-mode');
	}

	onMount(() => {
		const searchInput = document.getElementById('search-input');
		if (searchInput) {
			searchInput.value = '';
			searchInput.focus();
		}

		// Check for system preference
		const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
		if (prefersDarkMode) {
			darkMode = true;
			document.body.classList.add('dark-mode');
		}
	});

	$: errorMessage = errorKey ? translations[currentLang][errorKey] : null;
</script>

<div class="app-container {darkMode ? 'dark' : ''}">
	<header class="app-header">
		<div class="app-header-left">
			<span class="app-icon">#</span>
			<p class="app-name" on:click={goToHome} on:keydown={goToHome} tabindex="0">
				{translations[currentLang].logo}
			</p>
		</div>
		<div class="app-header-right">
			<button class="mode-switch" title="다크모드 전환" on:click={toggleDarkMode}>
				{#if darkMode}
					<svg
						class="sun"
						fill="none"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						width="24"
						height="24"
						viewBox="0 0 24 24"
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
						class="moon"
						fill="none"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						width="24"
						height="24"
						viewBox="0 0 24 24"
					>
						<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
					</svg>
				{/if}
			</button>
			<div class="language-dropdown">
				<button class="language-btn">
					{languageList.find((lang) => lang.code === currentLang).name}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="12"
						height="12"
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
				<div class="language-menu">
					{#each languageList as lang}
						<button
							on:click={() => changeLanguage(lang.code)}
							class={currentLang === lang.code ? 'active' : ''}
						>
							{lang.name}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</header>

	<div class="app-content">
		<div class="search-section">
			<div class="search-header">
				<h1>{translations[currentLang].title}</h1>
			</div>

			<div class="search-box">
				<div class="search-wrapper">
					<i class="hashtag-icon">#</i>
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
						{translations[currentLang].search}
					</button>
				</div>
			</div>

			{#if loading}
				<div class="loading-container">
					<div class="loading-dots">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
			{:else if errorMessage}
				<div class="error-message">
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
				<div class="results-container">
					<div class="media-count-card">
						<div class="card-icon">
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
								<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
								<circle cx="8.5" cy="8.5" r="1.5"></circle>
								<polyline points="21 15 16 10 5 21"></polyline>
							</svg>
						</div>
						<div class="card-content">
							<p class="card-label">{translations[currentLang].postCount}</p>
							<p class="card-value">{mediaCount.toLocaleString()}</p>
						</div>
					</div>

					<div class="hashtags-section">
						<h2>{translations[currentLang].relatedHashtags}</h2>

						<div class="hashtags-container">
							{#each relatedHashtags as tag}
								<div class="hashtag-item">#{tag}</div>
							{/each}
						</div>

						<button class="copy-button" on:click={copyHashtags}>
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
								class="copy-icon"
							>
								<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
								<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
							</svg>
							{copySuccess
								? translations[currentLang].copySuccess
								: translations[currentLang].copyHashtags}
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family:
			'DM Sans',
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			Helvetica,
			Arial,
			sans-serif;
		background-color: #f3f6fd;
		min-height: 100vh;
		transition:
			background-color 0.3s,
			color 0.3s;
	}

	:global(body.dark-mode) {
		background-color: #1f1d2b;
		color: #fff;
	}

	* {
		box-sizing: border-box;
	}

	.app-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		transition: all 0.3s ease;
	}

	.app-container.dark {
		--main-color: #fff;
		--secondary-color: rgba(255, 255, 255, 0.8);
		--app-background: #1f1d2b;
		--card-background: #2c2e3f;
		--input-background: #252836;
		--input-border: #34364d;
		--button-background: #6c5ecf;
		--hashtag-background: #353746;
		--error-background: #482935;
		--copy-button-background: #6c5ecf;
		--loading-dot-color: #6c5ecf;
	}

	.app-container:not(.dark) {
		--main-color: #1f1c2e;
		--secondary-color: #4a4a4a;
		--app-background: #f3f6fd;
		--card-background: #ffffff;
		--input-background: #ffffff;
		--input-border: #e0e0e0;
		--button-background: #405ce6;
		--hashtag-background: #eef0fb;
		--error-background: #ffebee;
		--copy-button-background: #405ce6;
		--loading-dot-color: #405ce6;
	}

	.app-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 24px;
		background: linear-gradient(90deg, var(--button-background), var(--button-background), #a78bfa);
		color: white;
		position: relative;
		box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
	}

	.app-header-left {
		display: flex;
		align-items: center;
	}

	.app-icon {
		width: 32px;
		height: 32px;
		background-color: white;
		color: var(--button-background);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		font-size: 20px;
		font-weight: bold;
	}

	.app-name {
		color: white;
		font-size: 22px;
		font-weight: 600;
		margin: 0 0 0 12px;
		cursor: pointer;
	}

	.app-header-right {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.mode-switch {
		background: transparent;
		border: none;
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
	}

	.language-dropdown {
		position: relative;
	}

	.language-btn {
		background: rgba(255, 255, 255, 0.2);
		border: none;
		color: white;
		padding: 8px 16px;
		border-radius: 20px;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 14px;
	}

	.language-menu {
		position: absolute;
		right: 0;
		top: 120%;
		background: white;
		border-radius: 8px;
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
		min-width: 120px;
		display: none;
		z-index: 10;
		overflow: hidden;
	}

	.language-dropdown:hover .language-menu {
		display: block;
	}

	.language-menu button {
		width: 100%;
		text-align: left;
		padding: 8px 16px;
		border: none;
		background: none;
		cursor: pointer;
		color: var(--main-color);
		transition: background 0.2s;
	}

	.language-menu button:hover,
	.language-menu button.active {
		background: #f5f5f5;
	}

	.app-content {
		flex-grow: 1;
		padding: 32px 20px;
		background-color: var(--app-background);
		display: flex;
		justify-content: center;
	}

	.search-section {
		width: 100%;
		max-width: 800px;
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.search-header {
		text-align: center;
	}

	.search-header h1 {
		color: var(--main-color);
		font-size: 32px;
		font-weight: 600;
		margin: 0 0 16px 0;
	}

	.search-box {
		background-color: var(--card-background);
		border-radius: 16px;
		padding: 24px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	}

	.search-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.hashtag-icon {
		position: absolute;
		left: 16px;
		font-size: 18px;
		color: #9e9e9e;
		font-style: normal;
		pointer-events: none;
	}

	input {
		flex: 1;
		border: 1px solid var(--input-border);
		background-color: var(--input-background);
		height: 50px;
		border-radius: 25px;
		padding: 0 24px 0 40px;
		font-size: 16px;
		color: var(--main-color);
		transition:
			border-color 0.3s,
			box-shadow 0.3s;
	}

	input:focus {
		outline: none;
		border-color: var(--button-background);
		box-shadow: 0 0 0 3px rgba(64, 92, 230, 0.1);
	}

	input::placeholder {
		color: #9e9e9e;
	}

	.search-button {
		margin-left: 12px;
		background-color: var(--button-background);
		color: white;
		border: none;
		height: 50px;
		border-radius: 25px;
		padding: 0 24px;
		font-weight: 600;
		font-size: 16px;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	.search-button:hover {
		background-color: #364fd0;
	}

	.search-button:disabled {
		background-color: #b2b2b2;
		cursor: not-allowed;
	}

	.loading-container {
		display: flex;
		justify-content: center;
		padding: 32px 0;
	}

	.loading-dots {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.loading-dots div {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background-color: var(--loading-dot-color);
		animation: bounce 0.6s infinite alternate;
	}

	.loading-dots div:nth-child(2) {
		animation-delay: 0.2s;
	}

	.loading-dots div:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes bounce {
		0% {
			transform: translateY(0);
		}
		100% {
			transform: translateY(-10px);
		}
	}

	.error-message {
		display: flex;
		align-items: center;
		gap: 12px;
		background-color: var(--error-background);
		padding: 16px 20px;
		border-radius: 12px;
		color: #e53935;
		margin-top: 16px;
	}

	.error-message svg {
		flex-shrink: 0;
		stroke: #e53935;
	}

	.error-message p {
		margin: 0;
		font-size: 15px;
	}

	.results-container {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.media-count-card {
		background-color: var(--card-background);
		border-radius: 16px;
		padding: 20px;
		display: flex;
		align-items: center;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	}

	.card-icon {
		width: 48px;
		height: 48px;
		background-color: rgba(64, 92, 230, 0.1);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 16px;
	}

	.card-icon svg {
		color: var(--button-background);
	}

	.card-content {
		flex: 1;
	}

	.card-label {
		margin: 0;
		font-size: 14px;
		color: var(--secondary-color);
	}

	.card-value {
		margin: 4px 0 0 0;
		font-size: 24px;
		font-weight: 600;
		color: var(--main-color);
	}

	.hashtags-section {
		background-color: var(--card-background);
		border-radius: 16px;
		padding: 24px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	}

	.hashtags-section h2 {
		margin: 0 0 20px 0;
		font-size: 18px;
		font-weight: 600;
		color: var(--main-color);
	}

	.hashtags-container {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-bottom: 24px;
	}

	.hashtag-item {
		background-color: var(--hashtag-background);
		color: var(--main-color);
		border-radius: 20px;
		padding: 8px 16px;
		font-size: 14px;
		font-weight: 500;
	}

	.copy-button {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		background-color: var(--copy-button-background);
		color: white;
		border: none;
		height: 48px;
		border-radius: 24px;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	.copy-button:hover {
		background-color: #364fd0;
	}

	.copy-icon {
		stroke: white;
	}

	@media (max-width: 768px) {
		.app-header {
			padding: 16px;
		}

		.search-box {
			padding: 16px;
		}

		.search-wrapper {
			flex-direction: column;
			gap: 12px;
		}

		.search-button {
			margin-left: 0;
			width: 100%;
		}

		.hashtags-container {
			gap: 8px;
		}

		.hashtag-item {
			padding: 6px 12px;
			font-size: 13px;
		}

		.media-count-card {
			padding: 16px;
		}

		.card-value {
			font-size: 20px;
		}
	}
</style>
