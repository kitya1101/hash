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
			// 새로운 번역 추가
			recentSearches: '최근 검색어',
			clearAll: '전체 삭제',
			recommendedTags: '추천 해시태그',
			popular: '인기',
			siteIntro: '해시태그 검색기는 인스타그램에서 인기있는 해시태그를 빠르게 찾아주는 도구입니다.',
			siteDesc: '원하는 해시태그를 입력하면 관련된 인기 해시태그와 게시물 수를 확인할 수 있습니다.',
			howToUse: '사용 방법',
			step1: '1. 검색창에 해시태그를 입력하세요 (# 기호는 자동으로 추가됩니다)',
			step2: '2. 검색 버튼을 클릭하거나 Enter 키를 누르세요',
			step3: '3. 관련 해시태그와 게시물 수를 확인하세요',
			step4: '4. 원하는 해시태그를 복사하여 사용하세요',
			footerAbout: '소개',
			footerPrivacy: '개인정보 처리방침',
			footerTerms: '이용약관',
			footerContact: '문의하기',
			footerCopyright: '© 2024 해시태그 검색기. All rights reserved.',
			tryTheseTags: '이런 해시태그는 어떨까요?'
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
			// 새로운 번역 추가
			recentSearches: 'Recent Searches',
			clearAll: 'Clear All',
			recommendedTags: 'Recommended Tags',
			popular: 'Popular',
			siteIntro: 'Hashtag Searcher is a tool to quickly find popular hashtags on Instagram.',
			siteDesc: 'Enter your desired hashtag to see related popular hashtags and post counts.',
			howToUse: 'How to Use',
			step1: '1. Enter a hashtag in the search box (# symbol is added automatically)',
			step2: '2. Click the search button or press Enter',
			step3: '3. Check related hashtags and post counts',
			step4: '4. Copy and use the hashtags you want',
			footerAbout: 'About',
			footerPrivacy: 'Privacy Policy',
			footerTerms: 'Terms of Use',
			footerContact: 'Contact Us',
			footerCopyright: '© 2024 Hashtag Searcher. All rights reserved.',
			tryTheseTags: 'Try these hashtags'
		}
	};

	const languageList = [
		{ code: 'ko', name: '한국어' },
		{ code: 'en', name: 'English' }
	];

	// 변수 설정
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

	// 최근 검색어 기능 추가
	let recentSearches = [];
	const MAX_RECENT_SEARCHES = 5; // 최대 보여줄 최근 검색어 수

	// 추천 해시태그 목록
	const recommendedTagsKo = [
		{ tag: '여행', count: '6,700만+' },
		{ tag: '맛집', count: '5,200만+' },
		{ tag: '일상', count: '8,100만+' },
		{ tag: '인스타그램', count: '2억+' },
		{ tag: '셀카', count: '3,500만+' },
		{ tag: '데일리룩', count: '4,300만+' }
	];

	const recommendedTagsEn = [
		{ tag: 'travel', count: '67M+' },
		{ tag: 'food', count: '52M+' },
		{ tag: 'daily', count: '81M+' },
		{ tag: 'instagram', count: '200M+' },
		{ tag: 'selfie', count: '35M+' },
		{ tag: 'ootd', count: '43M+' }
	];

	// 추천 태그 가져오기 (언어에 따라)
	$: recommendedTags = currentLang === 'ko' ? recommendedTagsKo : recommendedTagsEn;

	// 언어 설정 구독
	language.subscribe((value) => {
		currentLang = value;
	});

	// 최근 검색어에 추가하는 함수
	function addToRecentSearches(searchQuery) {
		// # 문자 제거
		const cleanQuery = searchQuery.replace(/^#/, '');

		// 이미 있는 검색어는 제거
		recentSearches = recentSearches.filter((item) => item !== cleanQuery);

		// 맨 앞에 새 검색어 추가
		recentSearches = [cleanQuery, ...recentSearches].slice(0, MAX_RECENT_SEARCHES);

		// 로컬 스토리지에 저장
		try {
			localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
		} catch (e) {
			console.error('로컬 스토리지 저장 실패:', e);
		}
	}

	// 최근 검색어 모두 삭제
	function clearRecentSearches() {
		recentSearches = [];
		try {
			localStorage.removeItem('recentSearches');
		} catch (e) {
			console.error('로컬 스토리지 삭제 실패:', e);
		}
	}

	// 최근 검색어를 이용해 검색
	function searchWithTag(tag) {
		query = '#' + tag;
		searchHashtag();
	}

	// 추천 태그로 검색
	function searchWithRecommendedTag(tag) {
		query = '#' + tag;
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

		console.log('검색 시작:', query);

		// 최근 검색어에 추가
		addToRecentSearches(query);

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

		// 로컬 스토리지에서 최근 검색어 불러오기
		try {
			const savedSearches = localStorage.getItem('recentSearches');
			if (savedSearches) {
				recentSearches = JSON.parse(savedSearches);
			}
		} catch (e) {
			console.error('로컬 스토리지 로드 실패:', e);
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
		<!-- 사이트 설명 섹션 추가 -->
		<div class="site-intro">
			<h2>{translations[currentLang].siteIntro}</h2>
			<p>{translations[currentLang].siteDesc}</p>
		</div>

		<div class="search-section">
			<!-- 메인 검색 컨테이너 -->
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

				<!-- 최근 검색어 섹션 -->
				{#if recentSearches.length > 0}
					<div class="recent-searches-container">
						<div class="recent-header">
							<h3>{translations[currentLang].recentSearches}</h3>
							<button class="clear-button" on:click={clearRecentSearches}>
								{translations[currentLang].clearAll}
							</button>
						</div>
						<div class="recent-tags">
							{#each recentSearches as tag}
								<button class="tag-button" on:click={() => searchWithTag(tag)}>#{tag}</button>
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

			<!-- 사이드 컨텐츠: 추천 해시태그 -->
			<div class="side-content">
				<!-- 추천 해시태그 섹션 -->
				<div class="recommended-tags-container">
					<div class="section-header">
						<h3>{translations[currentLang].recommendedTags}</h3>
						<span class="popular-badge">{translations[currentLang].popular}</span>
					</div>
					<div class="recommended-tags">
						{#each recommendedTags as item}
							<div class="recommended-tag">
								<button class="tag-name" on:click={() => searchWithRecommendedTag(item.tag)}>
									#{item.tag}
								</button>
								<span class="tag-count">{item.count}</span>
							</div>
						{/each}
					</div>
				</div>

				<!-- 사용 방법 섹션 -->
				<div class="how-to-use">
					<h3>{translations[currentLang].howToUse}</h3>
					<ol class="steps">
						<li>{translations[currentLang].step1}</li>
						<li>{translations[currentLang].step2}</li>
						<li>{translations[currentLang].step3}</li>
						<li>{translations[currentLang].step4}</li>
					</ol>
				</div>

				<!-- 추천 태그 사용 제안 -->
				<div class="try-these">
					<h3>{translations[currentLang].tryTheseTags}</h3>
					<div class="tag-suggestions">
						{#each recommendedTags.slice(0, 3) as item}
							<button class="suggestion-tag" on:click={() => searchWithRecommendedTag(item.tag)}>
								#{item.tag}
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- 푸터 추가 -->
	<footer class="footer">
		<div class="footer-container">
			<div class="footer-links">
				<a href="#about">{translations[currentLang].footerAbout}</a>
				<a href="#privacy">{translations[currentLang].footerPrivacy}</a>
				<a href="#terms">{translations[currentLang].footerTerms}</a>
				<a href="#contact">{translations[currentLang].footerContact}</a>
			</div>
			<div class="footer-copyright">
				{translations[currentLang].footerCopyright}
			</div>
		</div>
	</footer>
</main>

<style>
	/* 전체 폰트 업데이트 - 더 현대적인 한국 2024 타이포그래피 */
	:global(body) {
		margin: 0;
		padding: 0;
		background-color: #f8f9fa;
		font-family: 'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		font-weight: 400;
		letter-spacing: -0.3px; /* 한국어에 최적화된 자간 */
	}

	.instagram-style {
		color: #333333;
		flex-grow: 1;
		display: flex;
		flex-direction: column;
	}

	/* 그라데이션 앱바 업데이트 - 더 부드러운 그라데이션과 높이 증가 */
	.app-bar {
		background: linear-gradient(
			45deg,
			#4e62cc,
			#6457da,
			#8c45c4,
			#c13584,
			#e1306c,
			#fd1d1d,
			#f56040,
			#f77737,
			#fcaf45,
			#ffdc80
		);
		padding: 24px 0; /* 더 큰 패딩 */
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
		border-radius: 0; /* 모서리 직선으로 변경 */
	}

	.app-bar .container {
		margin: 0 auto;
		padding: 0 24px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 1200px; /* 최대 너비 제한 */
	}

	/* 로고 타이포그래피 업데이트 */
	.logo {
		font-family: 'Pretendard', sans-serif;
		font-size: 32px;
		font-weight: 700;
		color: #ffffff;
		cursor: pointer;
		background: none;
		border: none;
		padding: 10px 0;
		line-height: 1.2;
		letter-spacing: -0.5px; /* 한국어 타이포에 맞는 자간 */
	}

	.logo:hover {
		opacity: 0.9;
		transform: scale(1.02); /* 살짝 확대 효과 */
		transition: transform 0.2s ease-in-out;
	}

	.content {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 30px 24px; /* 패딩 조정 */
		box-sizing: border-box;
	}

	/* 사이트 소개 섹션 */
	.site-intro {
		width: 100%;
		max-width: 1200px;
		text-align: center;
		margin-bottom: 30px;
		padding: 0 20px;
	}

	.site-intro h2 {
		font-size: 26px;
		font-weight: 700;
		color: #333333;
		margin-bottom: 12px;
		letter-spacing: -0.5px;
	}

	.site-intro p {
		font-size: 18px;
		line-height: 1.6;
		color: #666666;
		max-width: 700px;
		margin: 0 auto;
	}

	/* 검색 섹션 레이아웃 */
	.search-section {
		width: 100%;
		max-width: 1200px;
		display: flex;
		gap: 30px;
		justify-content: center;
	}

	/* 검색 컨테이너 업데이트 - 더 큰 라운드 코너 */
	.search-wrapper {
		flex: 1;
		max-width: 800px; /* 더 넓게 */
		min-height: 220px;
		background-color: #ffffff;
		border-radius: 24px; /* 더 둥글게 */
		box-shadow: 0 5px 30px rgba(0, 0, 0, 0.06);
		padding: 48px; /* 더 큰 패딩 */
		box-sizing: border-box;
		transition: transform 0.3s ease;
	}

	.search-wrapper:hover {
		transform: translateY(-5px); /* 살짝 떠오르는 효과 */
		box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);
	}

	/* 제목 타이포그래피 업데이트 */
	h1 {
		text-align: center;
		color: #2254a3;
		margin-bottom: 45px;
		font-size: 44px; /* 더 큰 폰트 */
		font-weight: 700;
		letter-spacing: -1px; /* 한국어 타이포에 맞는 자간 */
	}

	.search-container {
		display: flex;
		margin-bottom: 30px;
		gap: 12px; /* 간격 추가 */
	}

	/* 인풋 스타일 업데이트 - 더 둥글고 크게 */
	.input-wrapper {
		position: relative;
		flex-grow: 1;
	}

	input {
		width: 100%;
		padding: 18px 18px 18px 54px; /* 더 큰 패딩 */
		border: 2px solid #e8e8e8;
		border-radius: 18px; /* 더 둥글게 */
		font-size: 18px;
		font-weight: 500;
		outline: none;
		box-sizing: border-box;
		caret-color: #405de6;
		color: #333333;
		transition: all 0.3s ease;
		box-shadow: 0 0 0 rgba(64, 93, 230, 0);
	}

	input:focus {
		border-color: #405de6;
		box-shadow: 0 0 0 4px rgba(64, 93, 230, 0.1);
	}

	input::placeholder {
		color: #aab0bc;
		font-weight: 400;
	}

	.input-wrapper::before {
		content: '#';
		position: absolute;
		left: 22px;
		top: 50%;
		transform: translateY(-50%);
		color: #aab0bc;
		font-size: 26px;
		pointer-events: none;
		font-weight: 600;
	}

	/* 버튼 스타일 업데이트 - 더 둥글고 큼직하게 */
	.search-button {
		padding: 18px 32px;
		background: #405de6;
		color: white;
		border: none;
		border-radius: 18px; /* 더 둥글게 */
		cursor: pointer;
		font-size: 18px;
		font-weight: 600;
		transition: all 0.3s ease;
		box-shadow: 0 5px 15px rgba(64, 93, 230, 0.25);
		letter-spacing: -0.5px; /* 한국어 타이포에 맞는 자간 */
	}

	.search-button:hover {
		background: #5262e9;
		box-shadow: 0 8px 20px rgba(64, 93, 230, 0.35);
		transform: translateY(-2px);
	}

	.search-button:active {
		transform: translateY(1px);
		box-shadow: 0 2px 10px rgba(64, 93, 230, 0.3);
	}

	.search-button:disabled {
		background-color: #ccd3f8;
		cursor: not-allowed;
		box-shadow: none;
		transform: none;
	}

	/* 최근 검색어 섹션 */
	.recent-searches-container {
		margin-bottom: 30px;
		background-color: #f8f9fb;
		border-radius: 16px;
		padding: 20px;
	}

	.recent-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15px;
	}

	.recent-header h3 {
		font-size: 18px;
		font-weight: 600;
		color: #333333;
		margin: 0;
	}

	.clear-button {
		background: none;
		border: none;
		color: #666666;
		font-size: 14px;
		cursor: pointer;
		padding: 5px 10px;
		transition: color 0.2s ease;
	}

	.clear-button:hover {
		color: #405de6;
	}

	.recent-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.tag-button {
		background-color: #ffffff;
		color: #405de6;
		padding: 8px 16px;
		border-radius: 50px;
		font-size: 15px;
		font-weight: 500;
		border: 1px solid #e8e8e8;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.tag-button:hover {
		background-color: #f0f3ff;
		border-color: #405de6;
		transform: translateY(-2px);
		box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
	}

	/* 로딩 애니메이션 업데이트 */
	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 120px;
	}

	.loading-dots {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.loading-dots div {
		width: 14px;
		height: 14px;
		margin: 0 7px;
		background-color: #e1306c;
		border-radius: 50%;
		animation: bounce 0.6s infinite alternate;
	}

	.loading-dots div:nth-child(2) {
		background-color: #c13576;
		animation-delay: 0.15s;
	}

	.loading-dots div:nth-child(3) {
		background-color: #b03ab4;
		animation-delay: 0.3s;
	}

	@keyframes bounce {
		to {
			transform: translateY(-15px);
		}
	}

	/* 에러 메시지 업데이트 */
	.error {
		color: #ff3a6e;
		font-weight: 600;
		padding: 16px;
		border-radius: 16px;
		background-color: #fff1f5;
		margin-bottom: 20px;
		text-align: center;
		font-size: 16px;
		box-shadow: 0 4px 12px rgba(255, 58, 110, 0.1);
	}

	/* 결과 섹션 업데이트 - 더 둥글고 큼직하게 */
	.results {
		background-color: #fafafa;
		border-radius: 20px; /* 더 둥글게 */
		padding: 32px;
		margin-bottom: 25px;
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.04);
	}

	.results h2 {
		color: #333333;
		font-size: 28px;
		margin-bottom: 20px;
		font-weight: 700;
		letter-spacing: -0.5px; /* 한국어 타이포에 맞는 자간 */
	}

	.media-count {
		font-weight: 700;
		font-size: 22px;
		color: #333333;
		margin-bottom: 30px;
		padding: 12px 18px;
		background-color: #f2f5ff;
		border-radius: 15px;
		display: inline-block;
	}

	/* 관련 해시태그 스타일 업데이트 */
	.related-hashtags {
		list-style-type: none;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 14px;
		margin-bottom: 30px;
	}

	.related-hashtags li {
		background-color: #f1f3f9;
		color: #405de6;
		padding: 12px 22px;
		border-radius: 50px; /* 완전한 원형으로 */
		font-size: 17px;
		font-weight: 600;
		transition: all 0.3s ease;
		box-shadow: 0 3px 8px rgba(0, 0, 0, 0.03);
		letter-spacing: -0.5px; /* 한국어 타이포에 맞는 자간 */
	}

	.related-hashtags li:hover {
		background-color: #e8ebf8;
		box-shadow: 0 5px 12px rgba(0, 0, 0, 0.06);
		transform: translateY(-2px);
	}

	/* 복사 버튼 업데이트 */
	.copy-button {
		width: 100%;
		background: #405de6;
		color: white;
		border: none;
		border-radius: 18px; /* 더 둥글게 */
		padding: 18px 0;
		cursor: pointer;
		font-size: 18px;
		font-weight: 600;
		transition: all 0.3s ease;
		box-shadow: 0 5px 15px rgba(64, 93, 230, 0.25);
		letter-spacing: -0.5px; /* 한국어 타이포에 맞는 자간 */
	}

	.copy-button:hover {
		background: #5262e9;
		box-shadow: 0 8px 20px rgba(64, 93, 230, 0.35);
		transform: translateY(-2px);
	}

	.copy-button:active {
		transform: translateY(1px);
		box-shadow: 0 2px 10px rgba(64, 93, 230, 0.3);
	}

	/* 사이드 컨텐츠 스타일 */
	.side-content {
		width: 300px;
		display: flex;
		flex-direction: column;
		gap: 25px;
	}

	/* 추천 해시태그 섹션 */
	.recommended-tags-container {
		background-color: #ffffff;
		border-radius: 24px;
		padding: 25px;
		box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	.section-header h3 {
		font-size: 20px;
		font-weight: 700;
		color: #333333;
		margin: 0;
		letter-spacing: -0.5px;
	}

	.popular-badge {
		background-color: #ff3a6e;
		color: white;
		padding: 5px 10px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 700;
	}

	.recommended-tags {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.recommended-tag {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 15px;
		background-color: #f8f9fb;
		border-radius: 14px;
		transition: all 0.2s ease;
	}

	.recommended-tag:hover {
		background-color: #f0f3ff;
		transform: translateY(-2px);
	}

	.tag-name {
		background: none;
		border: none;
		color: #405de6;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		padding: 0;
		text-align: left;
	}

	.tag-count {
		color: #777777;
		font-size: 14px;
		font-weight: 500;
	}

	/* 사용 방법 섹션 */
	.how-to-use {
		background-color: #ffffff;
		border-radius: 24px;
		padding: 25px;
		box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
	}

	.how-to-use h3 {
		font-size: 20px;
		font-weight: 700;
		color: #333333;
		margin: 0 0 20px 0;
		letter-spacing: -0.5px;
	}

	.steps {
		padding-left: 20px;
		margin: 0;
	}

	.steps li {
		margin-bottom: 12px;
		color: #555555;
		line-height: 1.6;
		font-size: 15px;
	}

	/* 추천 태그 사용 제안 */
	.try-these {
		background-color: #ffffff;
		border-radius: 24px;
		padding: 25px;
		box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
	}

	.try-these h3 {
		font-size: 20px;
		font-weight: 700;
		color: #333333;
		margin: 0 0 20px 0;
		letter-spacing: -0.5px;
	}

	.tag-suggestions {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.suggestion-tag {
		background-color: #f0f3ff;
		color: #405de6;
		padding: 10px 20px;
		border-radius: 50px;
		font-size: 16px;
		font-weight: 600;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.suggestion-tag:hover {
		background-color: #e0e7ff;
		transform: translateY(-2px);
		box-shadow: 0 4px 10px rgba(64, 93, 230, 0.15);
	}

	/* 언어 메뉴 업데이트 */
	.language-menu {
		position: relative;
		display: inline-block;
	}

	.language-button {
		background: rgba(255, 255, 255, 0.15);
		border: none;
		color: white;
		cursor: pointer;
		font-size: 18px;
		padding: 12px 18px;
		display: flex;
		align-items: center;
		border-radius: 50px; /* 완전한 원형으로 */
		backdrop-filter: blur(5px);
		transition: all 0.3s ease;
	}

	.language-button:hover {
		background: rgba(255, 255, 255, 0.25);
	}

	.language-button::before {
		content: '';
		display: inline-block;
		width: 22px;
		height: 22px;
		background-image: url('/src/lib/image/lang.svg');
		background-size: cover;
		margin-right: 8px;
		margin-top: 1px;
	}

	.language-dropdown {
		display: none;
		position: absolute;
		right: 0;
		top: 100%;
		background-color: #ffffff;
		border-radius: 18px;
		min-width: 180px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
		z-index: 1;
		overflow: hidden;
		margin-top: 10px;
	}

	.language-dropdown button {
		color: #333333;
		padding: 14px 20px;
		text-decoration: none;
		display: block;
		width: 100%;
		text-align: left;
		border: none;
		background: none;
		cursor: pointer;
		font-size: 16px;
		font-weight: 500;
		transition: background-color 0.2s ease;
		letter-spacing: -0.3px; /* 한국어 타이포에 맞는 자간 */
	}

	.language-dropdown button:hover {
		background-color: #f5f7ff;
	}

	.language-menu:hover .language-dropdown {
		display: block;
	}

	/* 푸터 스타일 */
	.footer {
		background-color: #f2f3f7;
		padding: 40px 0;
		margin-top: 50px;
	}

	.footer-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 24px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
	}

	.footer-links {
		display: flex;
		gap: 30px;
		flex-wrap: wrap;
		justify-content: center;
	}

	.footer-links a {
		color: #555555;
		text-decoration: none;
		font-size: 16px;
		font-weight: 500;
		transition: color 0.2s ease;
	}

	.footer-links a:hover {
		color: #405de6;
	}

	.footer-copyright {
		color: #888888;
		font-size: 14px;
	}

	/* 반응형 스타일 업데이트 */
	@media (max-width: 1100px) {
		.search-section {
			flex-direction: column;
		}

		.side-content {
			width: 100%;
			max-width: 800px;
		}

		.recommended-tags {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
			gap: 15px;
		}
	}

	@media (max-width: 768px) {
		.search-wrapper {
			padding: 30px;
			max-width: 100%;
			border-radius: 20px; /* 모바일에서 약간 작게 */
		}

		h1 {
			font-size: 36px;
			margin-bottom: 35px;
		}

		.search-container {
			flex-direction: column;
			gap: 15px; /* 모바일에서 간격 늘림 */
		}

		.input-wrapper,
		.search-button {
			width: 100%;
		}

		input {
			font-size: 16px;
			padding: 16px 16px 16px 48px;
			border-radius: 16px; /* 모바일에서 약간 작게 */
		}

		.input-wrapper::before {
			font-size: 22px;
			left: 18px;
		}

		.search-button {
			margin-top: 5px;
			border-radius: 16px; /* 모바일에서 약간 작게 */
			padding: 16px 0;
		}

		.related-hashtags li {
			font-size: 15px;
			padding: 10px 18px;
		}

		.copy-button {
			font-size: 16px;
			padding: 16px 0;
			border-radius: 16px; /* 모바일에서 약간 작게 */
		}

		.app-bar {
			padding: 20px 0;
			border-radius: 0; /* 모바일에서도 직선으로 유지 */
		}

		.app-bar .container {
			flex-direction: row; /* 변경: 로고와 언어 선택을 같은 줄에 유지 */
			align-items: center;
		}

		.language-menu {
			margin-top: 0; /* 기존 -49px 제거 */
		}

		.logo {
			font-size: 28px;
		}

		.language-button {
			padding: 10px 15px;
			font-size: 16px;
		}

		.site-intro h2 {
			font-size: 22px;
		}

		.site-intro p {
			font-size: 16px;
		}

		.footer-links {
			gap: 20px;
		}

		.footer-links a {
			font-size: 14px;
		}
	}
</style>
