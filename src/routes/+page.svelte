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
			logo: '해시태그'
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
			logo: 'Hashtag'
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
		<header class="app-header">
			<div class="header-content">
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

				<div class="header-actions">
					<button class="mode-switch" on:click={toggleDarkMode} title="Toggle Theme">
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
								<circle cx="12" cy="12" r="5" />
								<path
									d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
								/>
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
								<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
							</svg>
						{/if}
					</button>

					<div class="language-menu">
						<button class="language-button">
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
								<path d="M6 9l6 6 6-6" />
							</svg>
						</button>
						<div class="language-dropdown">
							{#each languageList as lang}
								<button on:click={() => changeLanguage(lang.code)}>{lang.name}</button>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</header>

		<section class="content">
			<div class="search-wrapper">
				<h1>{translations[currentLang].title}</h1>

				<div class="search-container">
					<div class="input-wrapper">
						<span class="hashtag-symbol">#</span>
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
									<circle cx="11" cy="11" r="8" />
									<path d="M21 21l-4.35-4.35" />
								</svg>
							{/if}
							<span>{translations[currentLang].search}</span>
						</button>
					</div>
				</div>

				{#if loading}
					<div class="loading-container">
						<div class="loading-spinner"></div>
					</div>
				{:else if errorMessage}
					<div class="error">
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
							<circle cx="12" cy="12" r="10" />
							<line x1="12" y1="8" x2="12" y2="12" />
							<line x1="12" y1="16" x2="12.01" y2="16" />
						</svg>
						<p>{translations[currentLang].error} {errorMessage}</p>
					</div>
				{:else if mediaCount !== null}
					<div class="results">
						<div class="result-card">
							<div class="result-header">
								<h2>{translations[currentLang].postCount}</h2>
								<span class="post-count">{mediaCount.toLocaleString()}</span>
							</div>

							<div class="result-content">
								<h2>{translations[currentLang].relatedHashtags}</h2>
								<ul class="related-hashtags">
									{#each relatedHashtags as tag}
										<li>#{tag}</li>
									{/each}
								</ul>
							</div>

							<div class="result-footer">
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
											<path d="M20 6L9 17l-5-5" />
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
											<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
											<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
										</svg>
										<span>{translations[currentLang].copyHashtags}</span>
									{/if}
								</button>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</section>
	</div>
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family:
			'Inter',
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			Helvetica,
			Arial,
			sans-serif;
		min-height: 100vh;
		transition:
			background-color 0.3s,
			color 0.3s;
	}

	:global(body.dark-mode) {
		--bg-color: #121212;
		--card-bg: #1f1f1f;
		--text-color: #f5f5f5;
		--border-color: #333;
		--primary-color: #7494ec;
		--secondary-color: #4f3ff0;
		--error-bg: rgba(220, 38, 38, 0.1);
		--error-color: #f87171;
		--input-bg: #2a2a2a;
		--hashtag-color: #888;
		--placeholder-color: #888;
		--icon-color: #eee;
		--tag-bg: #333;
		--tag-color: #eee;
		--header-bg: #1a1a1a;
		--dropdown-bg: #2a2a2a;
		--hover-bg: #333;
	}

	main {
		--bg-color: #f9f9f9;
		--card-bg: #ffffff;
		--text-color: #333;
		--border-color: #e0e0e0;
		--primary-color: #4267b2;
		--secondary-color: #4f3ff0;
		--error-bg: rgba(220, 38, 38, 0.1);
		--error-color: #dc2626;
		--input-bg: #fff;
		--hashtag-color: #777;
		--placeholder-color: #888;
		--icon-color: #555;
		--tag-bg: #f0f2f5;
		--tag-color: #333;
		--header-bg: #fff;
		--dropdown-bg: #fff;
		--hover-bg: #f5f5f5;

		background-color: var(--bg-color);
		color: var(--text-color);
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	main.dark-mode {
		--bg-color: #121212;
		--card-bg: #1f1f1f;
		--text-color: #f5f5f5;
		--border-color: #333;
		--primary-color: #7494ec;
		--secondary-color: #4f3ff0;
		--error-bg: rgba(220, 38, 38, 0.1);
		--error-color: #f87171;
		--input-bg: #2a2a2a;
		--hashtag-color: #888;
		--placeholder-color: #888;
		--icon-color: #eee;
		--tag-bg: #333;
		--tag-color: #eee;
		--header-bg: #1a1a1a;
		--dropdown-bg: #2a2a2a;
		--hover-bg: #333;
	}

	.app-container {
		max-width: 1280px;
		margin: 0 auto;
		width: 100%;
	}

	/* Header Styles */
	.app-header {
		background: var(--header-bg);
		padding: 16px 24px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logo {
		display: flex;
		align-items: center;
		font-size: 18px;
		font-weight: 600;
		color: var(--primary-color);
		background: none;
		border: none;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.logo svg {
		margin-right: 10px;
		stroke: var(--primary-color);
	}

	.logo:hover {
		opacity: 0.8;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.mode-switch {
		background: none;
		border: none;
		color: var(--icon-color);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 8px;
		border-radius: 50%;
		transition: background-color 0.2s;
	}

	.mode-switch:hover {
		background-color: var(--hover-bg);
	}

	.language-menu {
		position: relative;
	}

	.language-button {
		display: flex;
		align-items: center;
		gap: 6px;
		background: none;
		border: none;
		color: var(--text-color);
		cursor: pointer;
		font-size: 14px;
		padding: 8px 12px;
		border-radius: 6px;
		transition: background-color 0.2s;
	}

	.language-button:hover {
		background-color: var(--hover-bg);
	}

	.language-dropdown {
		display: none;
		position: absolute;
		right: 0;
		top: 100%;
		background-color: var(--dropdown-bg);
		border-radius: 8px;
		min-width: 120px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		overflow: hidden;
		z-index: 20;
		margin-top: 8px;
	}

	.language-dropdown button {
		display: block;
		width: 100%;
		padding: 10px 16px;
		text-align: left;
		border: none;
		background: none;
		color: var(--text-color);
		cursor: pointer;
		font-size: 14px;
		transition: background-color 0.2s;
	}

	.language-dropdown button:hover {
		background-color: var(--hover-bg);
	}

	.language-menu:hover .language-dropdown {
		display: block;
	}

	/* Content Styles */
	.content {
		flex-grow: 1;
		padding: 40px 20px;
	}

	.search-wrapper {
		max-width: 700px;
		margin: 0 auto;
	}

	h1 {
		text-align: center;
		font-size: 32px;
		font-weight: 700;
		margin-bottom: 40px;
		color: var(--primary-color);
	}

	.search-container {
		margin-bottom: 32px;
	}

	.input-wrapper {
		position: relative;
		display: flex;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		border-radius: 12px;
		overflow: hidden;
	}

	.input-wrapper input {
		flex-grow: 1;
		padding: 16px 16px 16px 42px;
		border: 1px solid var(--border-color);
		border-right: none;
		border-radius: 12px 0 0 12px;
		font-size: 16px;
		background-color: var(--input-bg);
		color: var(--text-color);
		transition: border-color 0.3s;
	}

	.input-wrapper input:focus {
		outline: none;
		border-color: var(--primary-color);
	}

	.input-wrapper input::placeholder {
		color: var(--placeholder-color);
	}

	.hashtag-symbol {
		position: absolute;
		left: 16px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--hashtag-color);
		font-size: 18px;
		pointer-events: none;
	}

	.search-button {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 0 24px;
		background-color: var(--primary-color);
		color: white;
		border: none;
		border-radius: 0 12px 12px 0;
		font-size: 16px;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	.search-button:hover {
		background-color: var(--secondary-color);
	}

	.search-button:disabled {
		background-color: #ccc;
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

	/* Loading Styles */
	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100px;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid rgba(0, 0, 0, 0.1);
		border-radius: 50%;
		border-top-color: var(--primary-color);
		animation: spin 1s linear infinite;
	}

	/* Error Styles */
	.error {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		background-color: var(--error-bg);
		border-radius: 8px;
		color: var(--error-color);
		margin-bottom: 24px;
	}

	.error svg {
		stroke: var(--error-color);
		flex-shrink: 0;
	}

	.error p {
		margin: 0;
		font-size: 14px;
	}

	/* Results Styles */
	.results {
		padding: 20px 0;
	}

	.result-card {
		background-color: var(--card-bg);
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.result-header {
		padding: 20px;
		background-color: var(--primary-color);
		color: white;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.result-header h2 {
		font-size: 18px;
		font-weight: 600;
		margin: 0;
	}

	.post-count {
		font-size: 24px;
		font-weight: 700;
	}

	.result-content {
		padding: 20px;
	}

	.result-content h2 {
		font-size: 18px;
		font-weight: 600;
		margin: 0 0 16px 0;
		color: var(--text-color);
	}

	.related-hashtags {
		list-style-type: none;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin: 0 0 20px 0;
	}

	.related-hashtags li {
		background-color: var(--tag-bg);
		color: var(--tag-color);
		padding: 8px 16px;
		border-radius: 30px;
		font-size: 14px;
		font-weight: 500;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
	}

	.related-hashtags li:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.result-footer {
		padding: 16px 20px;
		border-top: 1px solid var(--border-color);
		display: flex;
		justify-content: flex-end;
	}

	.copy-button {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 20px;
		background-color: var(--primary-color);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	.copy-button:hover {
		background-color: var(--secondary-color);
	}

	/* Responsive Styles */
	@media (max-width: 768px) {
		.app-header {
			padding: 12px 16px;
		}

		h1 {
			font-size: 28px;
			margin-bottom: 30px;
		}

		.content {
			padding: 30px 16px;
		}

		.input-wrapper {
			flex-direction: column;
			border-radius: 12px;
		}

		.input-wrapper input {
			border-radius: 12px 12px 0 0;
			border-right: 1px solid var(--border-color);
			border-bottom: none;
			padding: 14px 14px 14px 42px;
		}

		.search-button {
			border-radius: 0 0 12px 12px;
			padding: 14px;
			justify-content: center;
		}

		.result-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 8px;
		}

		.related-hashtags li {
			padding: 6px 12px;
			font-size: 13px;
		}
	}
</style>
