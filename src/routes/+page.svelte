<main class="app-container">
	<nav class="app-header">
		<div class="header-container">
			<button
				class="logo-btn"
				on:click={goToHome}
				on:keydown={goToHome}
				aria-label="홈 페이지로 이동"
			>
				{translations[currentLang].logo}
			</button>
			<div class="language-selector">
				<button class="language-btn">
					{languageList.find((lang) => lang.code === currentLang).name}
				</button>
				<div class="language-options">
					{#each languageList as lang}
						<button on:click={() => changeLanguage(lang.code)}>{lang.name}</button>
					{/each}
				</div>
			</div>
		</div>
	</nav>

	<div class="main-content">
		<div class="search-box">
			<h1 class="app-title">{translations[currentLang].title}</h1>

			<div class="search-bar">
				<div class="input-container">
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
					class="search-btn"
					disabled={loading || !query || buttonDisabled}
				>
					{translations[currentLang].search}
				</button>
			</div>

			{#if loading}
				<div class="loader">
					<div class="loader-dots">
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
			{:else if errorMessage}
				<div class="error-message">
					<p>{translations[currentLang].error} {errorMessage}</p>
				</div>
			{:else if mediaCount !== null}
				<div class="results-container">
					<p class="post-count">
						{translations[currentLang].postCount}
						<span>{mediaCount.toLocaleString()}</span>
					</p>
					<h2 class="related-title">{translations[currentLang].relatedHashtags}</h2>
					<ul class="hashtag-list">
						{#each relatedHashtags as tag}
							<li>#{tag}</li>
						{/each}
					</ul>
					<button class="copy-btn" on:click={copyHashtags}>
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
	/* 기본 리셋 및 글로벌 스타일 */
	:global(body) {
		margin: 0;
		padding: 0;
		background-color: #f8f9fa;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	/* 메인 컨테이너 */
	.app-container {
		color: #262626;
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	/* 헤더 */
	.app-header {
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
		padding: 15px 0;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.header-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logo-btn {
		font-family:
			'Instagram Sans',
			-apple-system,
			BlinkMacSystemFont,
			sans-serif;
		font-size: 26px;
		font-weight: 600;
		color: #ffffff;
		cursor: pointer;
		background: none;
		border: none;
		padding: 8px 0;
		line-height: 1.2;
		transition: opacity 0.2s;
	}

	.logo-btn:hover {
		opacity: 0.85;
	}

	/* 언어 선택 */
	.language-selector {
		position: relative;
		display: inline-block;
	}

	.language-btn {
		background: rgba(255, 255, 255, 0.2);
		border: none;
		border-radius: 20px;
		color: white;
		cursor: pointer;
		font-size: 16px;
		padding: 8px 16px;
		display: flex;
		align-items: center;
		transition: background 0.2s;
	}

	.language-btn:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.language-options {
		display: none;
		position: absolute;
		right: 0;
		top: 110%;
		background-color: #ffffff;
		border-radius: 12px;
		min-width: 150px;
		box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
		z-index: 101;
		overflow: hidden;
	}

	.language-options button {
		color: #333;
		padding: 12px 16px;
		text-decoration: none;
		display: block;
		width: 100%;
		text-align: left;
		border: none;
		background: none;
		cursor: pointer;
		transition: background 0.2s;
	}

	.language-options button:hover {
		background-color: #f5f5f5;
	}

	.language-selector:hover .language-options {
		display: block;
		animation: fadeIn 0.2s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* 메인 컨텐츠 */
	.main-content {
		flex-grow: 1;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		padding: 30px 20px;
		box-sizing: border-box;
	}

	.search-box {
		width: 100%;
		max-width: 760px;
		background-color: #ffffff;
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		padding: 30px;
		box-sizing: border-box;
		transition:
			transform 0.3s,
			box-shadow 0.3s;
	}

	.search-box:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
	}

	.app-title {
		text-align: center;
		color: #3b5998;
		margin-bottom: 30px;
		font-size: 36px;
		font-weight: 600;
		letter-spacing: -0.5px;
	}

	/* 검색 바 */
	.search-bar {
		display: flex;
		margin-bottom: 30px;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
	}

	.input-container {
		position: relative;
		flex-grow: 1;
	}

	.input-container::before {
		content: '#';
		position: absolute;
		left: 18px;
		top: 50%;
		transform: translateY(-50%);
		color: #a8a8a8;
		font-size: 22px;
		pointer-events: none;
		z-index: 1;
	}

	.search-bar input {
		width: 100%;
		padding: 16px 16px 16px 42px;
		border: 1px solid #eaeaea;
		border-right: none;
		border-radius: 8px 0 0 8px;
		font-size: 16px;
		outline: none;
		box-sizing: border-box;
		caret-color: #405de6;
		color: #333;
		transition:
			border 0.2s,
			box-shadow 0.2s;
	}

	.search-bar input:focus {
		border-color: #405de6;
		box-shadow: inset 0 0 0 1px #405de6;
	}

	.search-bar input::placeholder {
		color: #aaa;
	}

	.search-btn {
		padding: 0 25px;
		background: #405de6;
		color: white;
		border: none;
		cursor: pointer;
		font-size: 16px;
		font-weight: 600;
		transition: background 0.2s;
		min-width: 100px;
	}

	.search-btn:hover:not(:disabled) {
		background: #3951cc;
	}

	.search-btn:disabled {
		background: #b2dffc;
		cursor: not-allowed;
	}

	/* 로딩 애니메이션 */
	.loader {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 80px;
		margin: 20px 0;
	}

	.loader-dots {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.loader-dots div {
		width: 12px;
		height: 12px;
		margin: 0 6px;
		background-color: #e1306c;
		border-radius: 50%;
		animation: bounce 0.6s infinite alternate;
		opacity: 0.7;
	}

	.loader-dots div:nth-child(2) {
		animation-delay: 0.2s;
		background-color: #c13584;
	}

	.loader-dots div:nth-child(3) {
		animation-delay: 0.4s;
		background-color: #833ab4;
	}

	@keyframes bounce {
		to {
			transform: translateY(-8px);
			opacity: 1;
		}
	}

	/* 에러 메시지 */
	.error-message {
		color: #e74c3c;
		font-weight: 500;
		padding: 16px;
		border-radius: 8px;
		background-color: #fef2f2;
		margin-bottom: 20px;
		text-align: center;
		border-left: 4px solid #e74c3c;
	}

	/* 결과 컨테이너 */
	.results-container {
		background-color: #f8f9fa;
		border-radius: 12px;
		padding: 25px;
		margin-top: 10px;
		animation: fadeIn 0.3s ease;
		border: 1px solid #eee;
	}

	.post-count {
		font-weight: 600;
		font-size: 18px;
		color: #333;
		margin-bottom: 20px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.post-count span {
		color: #405de6;
		font-size: 20px;
		font-weight: 700;
	}

	.related-title {
		color: #333;
		font-size: 22px;
		margin-bottom: 16px;
		font-weight: 600;
	}

	.hashtag-list {
		list-style-type: none;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-bottom: 25px;
	}

	.hashtag-list li {
		background-color: #efefef;
		color: #405de6;
		padding: 8px 16px;
		border-radius: 50px;
		font-size: 15px;
		font-weight: 500;
		transition: all 0.2s;
		border: 1px solid #e0e0e0;
	}

	.hashtag-list li:hover {
		background-color: #e6e6e6;
		transform: translateY(-2px);
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	}

	.copy-btn {
		width: 100%;
		background: #405de6;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 14px 0;
		cursor: pointer;
		font-size: 16px;
		font-weight: 600;
		transition:
			background 0.2s,
			transform 0.2s;
	}

	.copy-btn:hover {
		background: #3951cc;
		transform: translateY(-2px);
	}

	/* 반응형 디자인 */
	@media (max-width: 768px) {
		.header-container {
			padding: 0 15px;
		}

		.search-box {
			padding: 20px;
			margin: 0 10px;
		}

		.app-title {
			font-size: 28px;
			margin-bottom: 20px;
		}

		.search-bar {
			flex-direction: column;
			border-radius: 8px;
			overflow: visible;
			box-shadow: none;
		}

		.input-container {
			margin-bottom: 10px;
		}

		.search-bar input {
			border-radius: 8px;
			border: 1px solid #eaeaea;
			padding: 14px 14px 14px 36px;
			font-size: 15px;
		}

		.input-container::before {
			font-size: 18px;
			left: 15px;
		}

		.search-btn {
			width: 100%;
			padding: 14px 0;
			border-radius: 8px;
		}

		.hashtag-list li {
			font-size: 14px;
			padding: 7px 12px;
		}

		.results-container {
			padding: 20px;
		}

		.copy-btn {
			padding: 12px 0;
			font-size: 15px;
		}
	}

	@media (max-width: 480px) {
		.app-title {
			font-size: 24px;
		}

		.main-content {
			padding: 20px 15px;
		}

		.search-box {
			padding: 15px;
		}

		.search-bar input {
			font-size: 14px;
			padding: 12px 12px 12px 32px;
		}

		.input-container::before {
			font-size: 16px;
			left: 12px;
		}

		.search-btn {
			font-size: 14px;
			padding: 12px 0;
		}

		.results-container {
			padding: 15px;
		}

		.post-count {
			font-size: 16px;
		}

		.related-title {
			font-size: 18px;
		}

		.hashtag-list {
			gap: 8px;
		}

		.hashtag-list li {
			font-size: 13px;
			padding: 6px 10px;
		}

		.copy-btn {
			font-size: 14px;
			padding: 10px 0;
		}
	}
</style>
