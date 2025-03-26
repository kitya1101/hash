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
			logo: '로고'
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
			logo: 'Logo'
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

		console.log('🔍 검색 시작:', query);

		try {
			const apiUrl = `https://hashtag-api.kitya1101.workers.dev/api/search?query=${encodeURIComponent(query.replace('#', ''))}&debugMode=${debugMode}`;
			console.log('🌐 API 요청 URL:', apiUrl);

			const response = await fetch(apiUrl);
			console.log('📩 응답 상태:', response.status);

			const data = await response.json();
			console.log('📦 응답 데이터:', data);

			if (response.ok) {
				mediaCount = data.media_count;
				relatedHashtags = data.related_hashtags;
				console.log('✅ 데이터 처리 완료:', { mediaCount, relatedHashtags });
			} else {
				errorKey = 'fetchError';
				console.error('❌ API 오류:', data.error || '알 수 없는 오류');
			}
		} catch (err) {
			errorKey = 'fetchError';
			console.error('💥 예외 발생:', err);
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

<main class="instagram-style">
	<nav class="app-bar">
		<div class="container">
			<button class="logo" on:click={goToHome} on:keydown={goToHome} aria-label="홈 페이지로 이동">
				{translations[currentLang].logo}
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
	</nav>
	<div class="content">
		<div class="search-wrapper">
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
					<p class="media-count">
						{translations[currentLang].postCount}
						{mediaCount.toLocaleString()}
					</p>
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
	</div>
</main>

<style>
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
		background-color: #fafafa;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.instagram-style {
		color: #262626;
		flex-grow: 1;
		display: flex;
		flex-direction: column;
	}

	.app-bar {
		background: linear-gradient(
			45deg,
			#405de6,
			#5b51d8,
			#833ab4,
			#c13584,
			#e1306c,
			#fd1d1d,
			#f56040,
			#f77737,
			#fcaf45,
			#ffdc80
		);
		padding: 20px 0; /* 증가된 패딩 */
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.app-bar .container {
		margin: 0 auto;
		padding: 0 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logo {
		font-family: 'Instagram Sans', sans-serif;
		font-size: 28px;
		font-weight: 600;
		color: #ffffff;
		cursor: pointer;
		background: none;
		border: none;
		padding: 10px 0;
		line-height: 1.2;
	}

	.logo:hover {
		opacity: 0.8;
	}

	.content {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 40px 20px; /* 증가된 패딩 */
		box-sizing: border-box;
	}

	.search-wrapper {
		width: 100%;
		max-width: 700px; /* 증가된 최대 너비 */
		min-height: 200px;
		background-color: #ffffff;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		padding: 40px; /* 증가된 패딩 */
		box-sizing: border-box;
	}

	h1 {
		/*풀사이즈*/
		text-align: center;
		color: rgb(34, 84, 131);
		margin-bottom: 40px; /**/
		font-size: 40px; /* 증가된 폰트 크기 */
		font-weight: 500;
	}

	.search-container {
		display: flex;
		margin-bottom: 40px; /* */
	}

	.input-wrapper {
		position: relative;
		flex-grow: 1;
	}

	input {
		width: 100%;
		padding: 15px 15px 15px 45px; /* 증가된 패딩 */
		border: 1px solid #dbdbdb;
		border-radius: 3px 0 0 3px;
		font-size: 18px; /* 증가된 폰트 크기 */
		outline: none;
		box-sizing: border-box;
		caret-color: #262626;
		color: #262626;
	}

	input::placeholder {
		color: #8e8e8e;
	}

	.input-wrapper::before {
		content: '#';
		position: absolute;
		left: 18px; /* 조정된 위치 */
		top: 45%;
		transform: translateY(-50%);
		color: #c7c7c7;
		font-size: 24px; /* 증가된 폰트 크기 */
		pointer-events: none;
	}
	.search-button {
		padding: 15px 25px;
		background: #405ce6be; /* Original background color */
		color: white;
		border: none;
		border-radius: 0 3px 3px 0;
		cursor: pointer;
		font-size: 18px;
		font-weight: 600;
		transition: background-color 0.3s;
	}

	.search-button:hover {
		background: #5b6dec; /* Slightly lighter shade of the original color */
	}

	.search-button:disabled {
		background-color: #b2dffc;
		cursor: not-allowed;
	}

	.error {
		color: #ff2a2a; /* Instagram 스타일의 빨간색 */
		font-weight: bold;
		padding: 10px;
		border-radius: 5px;
		background-color: #ffebee; /* 연한 빨간색 배경 */
		margin-bottom: 15px;
	}

	.results {
		background-color: #fafafa;
		border-radius: 8px;
		padding: 25px;
		margin-bottom: 25px;
	}

	.results h2 {
		color: #262626; /* Instagram 스타일의 검정색 */
		font-size: 25px;
		margin-bottom: 15px;
	}

	.media-count {
		font-weight: bold;
		font-size: 20px; /* 증가된 폰트 크기 */
		color: #262626;
		margin-bottom: 25px; /* 증가된 마진 */
	}

	.related-hashtags {
		list-style-type: none;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 12px; /* 증가된 간격 */
		margin-bottom: 25px; /* 증가된 마진 */
	}

	.related-hashtags li {
		background-color: #efefef;
		color: #262626;
		padding: 10px 18px; /* 증가된 패딩 */
		border-radius: 20px;
		font-size: 16px; /* 증가된 폰트 크기 */
		font-weight: 600;
	}
	.copy-button {
		width: 100%;
		background: #405ce6be; /* Pink/Yellow gradient */
		color: white;
		border: none;
		border-radius: 3px;
		padding: 15px 0;
		cursor: pointer;
		font-size: 18px;
		font-weight: 600;
		transition: background-color 0.3s;
	}

	.copy-button:hover {
		background: #5b6dec; /* Adjusted hover gradient */
	}

	input {
		padding-left: 37px; /* 패딩 조정 */
	}

	@media (max-width: 768px) {
		/* 브레이크포인트를 768px로 변경 */
		.search-wrapper {
			padding: 25px;
			max-width: 100%;
		}

		h1 {
			font-size: 35px;
		}

		.search-container {
			flex-direction: column;
		}

		.input-wrapper,
		.search-button {
			width: 100%;
		}

		input,
		.search-button {
			border-radius: 3px;
			font-size: 16px;
			padding: 12px 15px;
		}

		.input-wrapper::before {
			font-size: 20px;
			top: 48%;
			left: 15px;
		}
		input {
			font-size: 14px; /* 모바일에서 더 작은 크기로 조정 */
			padding: 12px 15px 12px 29px; /* 패딩 조정 */
		}

		.search-button {
			margin-top: 10px;
		}

		.related-hashtags li {
			font-size: 14px;
			padding: 8px 15px;
		}

		.copy-button {
			font-size: 16px;
			padding: 12px 0;
		}
	}
	.language-menu {
		position: relative;
		display: inline-block;
	}

	.language-button {
		background: none;
		border: none;
		color: white;
		cursor: pointer;
		font-size: 20px;
		padding: 10px;
		display: flex;
		align-items: center;
	}

	.language-button::before {
		content: '';
		display: inline-block;
		width: 20px; /* Adjust the width as needed */
		height: 20px; /* Adjust the height as needed */
		background-image: url('/src/lib/image/lang.svg'); /* Provide the correct path to your image */
		background-size: cover;
		margin-right: 4px;
		margin-top: 1px;
	}

	.language-dropdown {
		display: none;
		position: absolute;
		right: 0;
		top: 100%;
		background-color: #ffffff;
		border-radius: 8px; /* 드롭다운에 둥근 테두리 추가 */
		min-width: 160px;
		box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
		z-index: 1;
		overflow: hidden; /* 테두리 밖으로 내용이 넘어가지 않도록 설정 */
	}

	.language-dropdown button {
		color: black;
		padding: 12px 16px;
		text-decoration: none;
		display: block;
		width: 100%;
		text-align: left;
		border: none;
		background: none;
		cursor: pointer;
	}

	.language-dropdown button:hover {
		background-color: #f1f1f1;
	}

	.language-menu:hover .language-dropdown {
		display: block;
	}

	@media (max-width: 768px) {
		.app-bar .container {
			flex-direction: column;
			align-items: flex-start;
		}

		.language-menu {
			align-self: flex-end;
			margin-top: -49px;
		}

		.search-button:disabled {
			background-color: #b2dffc;
			cursor: not-allowed;
		}
	}
</style>
