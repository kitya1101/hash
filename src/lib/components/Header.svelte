<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	export let language;
	export let translations;
	export let languageList;

	let currentLang;

	language.subscribe((value) => {
		currentLang = value;
	});

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
</script>

<header class="app-header">
	<div class="header-top">
		<div class="container">
			<button class="logo" on:click={goToHome} on:keydown={goToHome} aria-label="홈 페이지로 이동">
				로고
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
	<div class="divider"></div>
	<div class="header-bottom">
		<div class="container">
			<nav class="submenu">
				<a href="/" class="submenu-item active">홈</a>
				<a href="/about" class="submenu-item">소개</a>
				<a href="/popular" class="submenu-item">인기 해시태그</a>
				<a href="/guide" class="submenu-item">이용 가이드</a>
			</nav>
		</div>
	</div>
</header>

<style>
	/* 헤더 전체 스타일 */
	.app-header {
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
		color: #ffffff;
		width: 100%;
	}

	/* 헤더 상단 부분 - 높이 축소 */
	.header-top {
		padding: 12px 0;
	}

	/* 구분선 */
	.divider {
		height: 1px;
		background-color: rgba(255, 255, 255, 0.15);
		width: 100%;
	}

	/* 헤더 하단 부분 - 높이 축소 */
	.header-bottom {
		padding: 10px 0 12px;
	}

	.container {
		margin: 0 auto;
		padding: 0 24px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 1300px;
	}

	/* 로고 타이포그래피 - 크기 축소 */
	.logo {
		font-family: 'Pretendard', sans-serif;
		font-size: 28px; /* 폰트 크기 축소 */
		font-weight: 700;
		color: #ffffff;
		cursor: pointer;
		background: none;
		border: none;
		padding: 6px 0; /* 패딩 축소 */
		line-height: 1.2;
		letter-spacing: -0.5px;
	}

	.logo:hover {
		opacity: 0.9;
		transform: scale(1.02);
		transition: transform 0.2s ease-in-out;
	}

	/* 언어 메뉴 */
	.language-menu {
		position: relative;
		display: inline-block;
	}

	.language-button {
		background: rgba(255, 255, 255, 0.15);
		border: none;
		color: white;
		cursor: pointer;
		font-size: 16px; /* 폰트 크기 축소 */
		padding: 8px 16px; /* 패딩 축소 */
		display: flex;
		align-items: center;
		border-radius: 50px;
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
		letter-spacing: -0.3px;
	}

	.language-dropdown button:hover {
		background-color: #f5f7ff;
	}

	.language-menu:hover .language-dropdown {
		display: block;
	}

	/* 서브메뉴 스타일 - 크기 축소 */
	.submenu {
		display: flex;
		gap: 20px; /* 간격 축소 */
		width: 100%;
	}

	.submenu-item {
		color: #ffffff;
		text-decoration: none;
		font-size: 16px; /* 폰트 크기 축소 */
		font-weight: 500;
		padding: 6px 14px; /* 패딩 축소 */
		border-radius: 50px;
		transition: all 0.3s ease;
		letter-spacing: -0.3px;
	}

	.submenu-item:hover {
		background-color: rgba(255, 255, 255, 0.15);
	}

	.submenu-item.active {
		background-color: rgba(255, 255, 255, 0.25);
		font-weight: 600;
	}

	/* 반응형 스타일 */
	@media (max-width: 768px) {
		.header-top,
		.header-bottom {
			padding: 15px 0;
		}

		.logo {
			font-size: 28px;
		}

		.language-button {
			padding: 10px 15px;
			font-size: 16px;
		}

		.submenu {
			gap: 12px;
			overflow-x: auto;
			padding-bottom: 5px;
			-ms-overflow-style: none;
			scrollbar-width: none;
		}

		.submenu::-webkit-scrollbar {
			display: none;
		}

		.submenu-item {
			font-size: 16px;
			padding: 8px 12px;
			white-space: nowrap;
		}
	}
</style>
