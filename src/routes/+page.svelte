<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import Header from '$lib/components/Header.svelte';
	import { Line } from 'svelte-chartjs';
	import { Chart, registerables } from 'chart.js';

	// Chart.js 등록
	Chart.register(...registerables);

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
			trending: '트렌딩 🔥',
			trendChart: '인기 추이',
			trendChartDesc: '최근 7일간 해시태그 인기도 변화'
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
			trending: 'Trending 🔥',
			trendChart: 'Popularity Trend',
			trendChartDesc: 'Hashtag popularity changes in the last 7 days'
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

	// 새로 추가된 상태 변수들
	let isTrending = false;
	let trendData = null;
	let chartData = {
		labels: [],
		datasets: [
			{
				label: 'Popularity',
				data: [],
				borderColor: '#405de6',
				backgroundColor: 'rgba(64, 93, 230, 0.2)',
				fill: true,
				tension: 0.4
			}
		]
	};

	let chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			y: {
				beginAtZero: false,
				grid: {
					display: true,
					color: 'rgba(0, 0, 0, 0.05)'
				},
				ticks: {
					font: {
						family: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
						size: 13,
						weight: 500
					},
					color: '#666'
				}
			},
			x: {
				grid: {
					display: false
				},
				ticks: {
					font: {
						family: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
						size: 13,
						weight: 500
					},
					color: '#666'
				}
			}
		},
		plugins: {
			legend: {
				display: false
			},
			tooltip: {
				backgroundColor: 'rgba(255, 255, 255, 0.95)',
				titleColor: '#333',
				bodyColor: '#333',
				bodyFont: {
					family: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
					weight: 600
				},
				titleFont: {
					family: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
					weight: 700
				},
				borderColor: 'rgba(0, 0, 0, 0.05)',
				borderWidth: 1,
				cornerRadius: 16,
				padding: 16,
				boxPadding: 6
			}
		},
		elements: {
			point: {
				radius: 6,
				hoverRadius: 8,
				backgroundColor: 'white',
				borderWidth: 3
			}
		}
	};

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
		isTrending = false;
		trendData = null;
		buttonDisabled = true;

		console.log('검색 시작:', query);

		try {
			// 기본 해시태그 검색 API 호출
			const searchApiUrl = `https://hashtag-api.kitya1101.workers.dev/api/search?query=${encodeURIComponent(query.replace('#', ''))}&debugMode=${debugMode}`;
			console.log('검색 API 요청 URL:', searchApiUrl);

			const searchResponse = await fetch(searchApiUrl);
			console.log('검색 응답 상태:', searchResponse.status);

			const searchData = await searchResponse.json();
			console.log('검색 응답 데이터:', searchData);

			if (searchResponse.ok) {
				mediaCount = searchData.media_count;
				relatedHashtags = searchData.related_hashtags;

				// 해시태그 상세 정보 API 호출
				const infoApiUrl = `https://hashtag-api.kitya1101.workers.dev/api/get_info?query=${encodeURIComponent(query.replace('#', ''))}&debugMode=${debugMode}`;
				console.log('상세 정보 API 요청 URL:', infoApiUrl);

				const infoResponse = await fetch(infoApiUrl);
				console.log('상세 정보 응답 상태:', infoResponse.status);

				if (infoResponse.ok) {
					const infoData = await infoResponse.json();
					console.log('상세 정보 응답 데이터:', infoData);

					// 트렌딩 정보 추출
					isTrending = infoData.is_trending || false;

					// 트렌드 차트 데이터 생성
					const lastWeek = Array.from({ length: 7 }, (_, i) => {
						const date = new Date();
						date.setDate(date.getDate() - (6 - i));
						return date.toLocaleDateString(currentLang === 'ko' ? 'ko-KR' : 'en-US', {
							month: 'short',
							day: 'numeric'
						});
					});

					// 실제 API에서 데이터를 받아와야 하지만, 현재는 예시 데이터 사용
					const popularityData = infoData.trend_data || [];

					chartData = {
						labels: lastWeek,
						datasets: [
							{
								label: translations[currentLang].trendChart,
								data: popularityData,
								borderColor: '#405de6',
								backgroundColor: 'rgba(64, 93, 230, 0.2)',
								fill: true,
								tension: 0.4
							}
						]
					};

					console.log('차트 데이터 생성 완료:', chartData);
				}
			} else {
				errorKey = 'fetchError';
				console.error('API 오류:', searchData.error || '알 수 없는 오류');
			}
		} catch (err) {
			errorKey = 'fetchError';
			console.error('예외 발생:', err);
		} finally {
			loading = false;
			setTimeout(() => {
				buttonDisabled = false;
			}, 1000); // 버튼 비활성화 시간 감소
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
	<Header {language} {translations} {languageList} />

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
					<div class="results-header">
						<p class="media-count">
							{translations[currentLang].postCount}
							{mediaCount.toLocaleString()}
						</p>
						{#if isTrending}
							<span class="trending-badge">{translations[currentLang].trending}</span>
						{/if}
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

					<!-- 트렌드 차트 섹션 - 브루탈리즘 UI 업데이트 -->
					{#if chartData.datasets[0].data.length > 0}
						<div class="trend-chart-section">
							<h2>{translations[currentLang].trendChart}</h2>
							<p class="chart-description">{translations[currentLang].trendChartDesc}</p>
							<div class="chart-wrapper">
								<Line data={chartData} options={chartOptions} />
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
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

	.content {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 50px 24px; /* 더 큰 패딩 */
		box-sizing: border-box;
	}

	/* 검색 컨테이너 업데이트 - 더 큰 라운드 코너 */
	.search-wrapper {
		width: 100%;
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
		margin-bottom: 45px;
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

	/* 결과 헤더 (게시물 수와 트렌딩 배지) */
	.results-header {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 12px;
		margin-bottom: 30px;
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
		margin: 0;
		padding: 12px 18px;
		background-color: #f2f5ff;
		border-radius: 15px;
		display: inline-block;
	}

	/* 트렌딩 배지 스타일 - 브루탈리즘 업데이트 */
	.trending-badge {
		background-color: #ff4c38;
		color: white;
		padding: 10px 20px;
		border-radius: 30px;
		font-size: 16px;
		font-weight: 700;
		display: inline-flex;
		align-items: center;
		box-shadow: 0 4px 12px rgba(255, 76, 56, 0.2);
		animation: pulse 2s infinite;
		letter-spacing: -0.5px;
	}

	@keyframes pulse {
		0% {
			box-shadow: 0 0 0 0 rgba(255, 76, 56, 0.4);
		}
		70% {
			box-shadow: 0 0 0 8px rgba(255, 76, 56, 0);
		}
		100% {
			box-shadow: 0 0 0 0 rgba(255, 76, 56, 0);
		}
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

	/* 트렌드 차트 섹션 - 브루탈리즘 UI 스타일로 업데이트 */
	.trend-chart-section {
		margin-top: 45px;
		background-color: white;
		border-radius: 24px;
		padding: 32px;
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.04);
		position: relative;
		overflow: hidden;
	}

	.trend-chart-section h2 {
		font-size: 32px;
		margin-bottom: 12px;
		color: #222;
	}

	.chart-description {
		color: #666;
		font-size: 16px;
		margin-bottom: 30px;
		font-weight: 500;
		letter-spacing: -0.3px;
	}

	.chart-wrapper {
		height: 300px;
		width: 100%;
		position: relative;
		border-radius: 20px;
		overflow: hidden;
	}

	/* 반응형 스타일 업데이트 */
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

		.trend-chart-section {
			padding: 24px;
			border-radius: 20px;
		}

		.trend-chart-section h2 {
			font-size: 26px;
		}

		.chart-description {
			font-size: 14px;
			margin-bottom: 25px;
		}

		.chart-wrapper {
			height: 220px;
		}
	}
</style>
