// RocketAPI Instagram 해시태그 검색 API 호출을 위한 함수
async function fetchHashtagInfo(query, apiKey) {
	try {
		// # 기호 제거
		const cleanQuery = query.replace(/^#/, '').trim();
		console.log(`[로그] 정제된 해시태그: ${cleanQuery}`);

		// RocketAPI 엔드포인트 설정
		const url = 'https://rocketapi-for-developers.p.rapidapi.com/instagram/hashtag/search';

		// 요청 옵션 설정
		const options = {
			method: 'POST',
			headers: {
				'x-rapidapi-key': apiKey,
				'x-rapidapi-host': 'rocketapi-for-developers.p.rapidapi.com',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ query: cleanQuery })
		};

		console.log(`[로그] API 요청 시작: ${url}`);

		// API 호출
		const response = await fetch(url, options);
		console.log(`[로그] API 응답 상태: ${response.status}`);

		if (!response.ok) {
			const errorStatus = response.status;
			const errorBody = await response.text().catch(() => '');
			console.error(`[로그] API 오류: ${errorStatus} - ${errorBody}`);

			// 402 또는 429 오류 처리 (API 한도 초과)
			if (errorStatus === 402 || errorStatus === 429) {
				console.error(
					`[로그] API 사용량 한도에 도달했거나 요금제가 필요합니다. Status: ${errorStatus}`
				);
				return {
					media_count: 12345,
					related_hashtags: Array.from({ length: 20 }, (_, i) => `example${i + 1}`),
					note: 'API 호출 한도에 도달했습니다. 현재 데모 데이터를 표시합니다.'
				};
			}

			throw new Error(`RocketAPI Instagram 해시태그 검색 오류: ${errorStatus} - ${errorBody}`);
		}

		// API 응답 처리
		const responseData = await response.json();
		console.log(`[로그] API 응답 데이터:`, responseData);

		// RocketAPI 응답 구조 파싱
		if (!responseData.status === 'done' || !responseData.response || !responseData.response.body) {
			throw new Error('API 응답 구조가 예상과 다릅니다.');
		}

		const apiResponseBody = responseData.response.body;

		// 미디어 수 가져오기 (메인 해시태그의 media_count 사용)
		let mediaCount = 0;
		if (apiResponseBody.hashtags && apiResponseBody.hashtags.length > 0) {
			// 첫 번째 해시태그는 일반적으로 검색어와 정확히 일치하는 태그
			const mainHashtag = apiResponseBody.hashtags.find((tag) => tag.name === cleanQuery);
			if (mainHashtag) {
				mediaCount = mainHashtag.media_count;
			} else if (apiResponseBody.hashtags[0]) {
				// 정확히 일치하는 해시태그가 없으면 첫 번째 결과 사용
				mediaCount = apiResponseBody.hashtags[0].media_count;
			}
		}

		// 관련 해시태그 목록 가져오기
		let relatedHashtagsList = [];
		if (apiResponseBody.hashtags && Array.isArray(apiResponseBody.hashtags)) {
			relatedHashtagsList = apiResponseBody.hashtags.map((tag) => tag.name).filter(Boolean);
		}

		console.log(`[로그] 최종 결과:`, {
			media_count: mediaCount,
			related_hashtags: relatedHashtagsList
		});

		return {
			media_count: mediaCount,
			related_hashtags: relatedHashtagsList
		};
	} catch (error) {
		console.error('[로그] Error fetching hashtag info:', error);
		throw error;
	}
}

// 새로 추가: 해시태그 상세 정보 API 함수
async function fetchHashtagDetailInfo(hashtag, apiKey) {
	try {
		// # 기호 제거
		const cleanHashtag = hashtag.replace(/^#/, '').trim();
		console.log(`[로그] 상세 정보 요청 해시태그: ${cleanHashtag}`);

		// RocketAPI 상세 정보 엔드포인트 설정
		const url = 'https://rocketapi-for-developers.p.rapidapi.com/instagram/hashtag/get_info';

		// 요청 옵션 설정
		const options = {
			method: 'POST',
			headers: {
				'x-rapidapi-key': apiKey,
				'x-rapidapi-host': 'rocketapi-for-developers.p.rapidapi.com',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ name: cleanHashtag })
		};

		console.log(`[로그] 상세 정보 API 요청 시작: ${url}`);

		// API 호출
		const response = await fetch(url, options);
		console.log(`[로그] 상세 정보 API 응답 상태: ${response.status}`);

		if (!response.ok) {
			const errorStatus = response.status;
			const errorBody = await response.text().catch(() => '');
			console.error(`[로그] 상세 정보 API 오류: ${errorStatus} - ${errorBody}`);

			// 402 또는 429 오류 처리 (API 한도 초과)
			if (errorStatus === 402 || errorStatus === 429) {
				console.error(
					`[로그] 상세 정보 API 사용량 한도에 도달했거나 요금제가 필요합니다. Status: ${errorStatus}`
				);
				return {
					is_trending: Math.random() > 0.5, // 랜덤 트렌딩 상태
					trend_data: generateSampleTrendData(),
					note: 'API 호출 한도에 도달했습니다. 현재 데모 데이터를 표시합니다.'
				};
			}

			throw new Error(`RocketAPI Instagram 해시태그 상세 정보 오류: ${errorStatus} - ${errorBody}`);
		}

		// API 응답 처리
		const responseData = await response.json();
		console.log(`[로그] 상세 정보 API 응답 데이터:`, responseData);

		// API 응답 구조 파싱
		if (responseData.status !== 'done' || !responseData.response || !responseData.response.body) {
			throw new Error('상세 정보 API 응답 구조가 예상과 다릅니다.');
		}

		const apiResponseBody = responseData.response.body;

		// 트렌딩 여부 확인
		const isTrending = apiResponseBody.is_trending || false;

		// 트렌드 데이터 추출 (실제 API에서는 이 데이터를 적절히 가공해야 함)
		// 여기서는 샘플 데이터 생성
		const trendData = generateSampleTrendData();

		const result = {
			is_trending: isTrending,
			trend_data: trendData
		};

		console.log(`[로그] 상세 정보 최종 결과:`, result);
		return result;
	} catch (error) {
		console.error('[로그] Error fetching hashtag detail info:', error);
		throw error;
	}
}

// 샘플 트렌드 데이터 생성 함수
function generateSampleTrendData() {
	// 샘플 트렌드 데이터 생성 (실제로는 API에서 가져와야 함)
	const baseValue = Math.floor(Math.random() * 500) + 500;
	return Array.from({ length: 7 }, (_, i) => {
		// 약간의 랜덤 변동성 추가
		const variation = Math.floor(Math.random() * 200) - 100;
		// 상승 트렌드 시뮬레이션
		const trend = i * 30;
		return baseValue + variation + trend;
	});
}

export default {
	async fetch(request, env, ctx) {
		console.log(`[로그] 요청 받음: ${request.url}`);

		// CORS 헤더 설정
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type'
		};

		// OPTIONS 요청 처리 (CORS preflight)
		if (request.method === 'OPTIONS') {
			console.log(`[로그] OPTIONS 요청 처리`);
			return new Response(null, { headers: corsHeaders });
		}

		const url = new URL(request.url);
		console.log(`[로그] 요청 경로: ${url.pathname}`);

		// /api/search 엔드포인트 처리
		if (url.pathname === '/api/search' && request.method === 'GET') {
			const query = url.searchParams.get('query');
			const debugMode = url.searchParams.get('debugMode') === 'true';

			console.log(`[로그] 검색 쿼리: ${query}, 디버그 모드: ${debugMode}`);

			if (!query) {
				console.log(`[로그] 쿼리 파라미터 누락`);
				return new Response(JSON.stringify({ error: 'Query parameter is required' }), {
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				});
			}

			try {
				let result;

				if (debugMode) {
					// 디버그 모드 처리
					console.log(`[로그] 디버그 모드 활성화`);
					await new Promise((resolve) => setTimeout(resolve, 3000));
					result = {
						media_count: 12345,
						related_hashtags: Array.from({ length: 20 }, (_, i) => `example${i + 1}`)
					};
				} else {
					// API 키 확인 - RapidAPI 키 사용
					const RAPIDAPI_KEY =
						env.RAPIDAPI_KEY || '86b90e5545msh81d89fe46e5d3b4p1093d4jsnae2aa72fe381';
					console.log(`[로그] API 키 존재 여부: ${!!RAPIDAPI_KEY}`);

					if (!RAPIDAPI_KEY) {
						console.error(`[로그] API 키 누락`);
						throw new Error('RAPIDAPI_KEY is not set in environment variables');
					}

					// 실제 API 호출
					console.log(`[로그] RocketAPI Instagram 해시태그 검색 호출 시작`);
					result = await fetchHashtagInfo(query, RAPIDAPI_KEY);
				}

				console.log(`[로그] 응답 반환:`, result);
				return new Response(JSON.stringify(result), {
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				});
			} catch (error) {
				const errorMessage = error.message || 'An unknown error occurred';
				console.error(`[로그] 오류 발생:`, errorMessage);
				return new Response(JSON.stringify({ error: errorMessage }), {
					status: 500,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				});
			}
		}

		// 새로 추가: /api/get_info 엔드포인트 처리
		if (url.pathname === '/api/get_info' && request.method === 'GET') {
			const query = url.searchParams.get('query');
			const debugMode = url.searchParams.get('debugMode') === 'true';

			console.log(`[로그] 상세 정보 쿼리: ${query}, 디버그 모드: ${debugMode}`);

			if (!query) {
				console.log(`[로그] 쿼리 파라미터 누락`);
				return new Response(JSON.stringify({ error: 'Query parameter is required' }), {
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				});
			}

			try {
				let result;

				if (debugMode) {
					// 디버그 모드 처리
					console.log(`[로그] 상세 정보 디버그 모드 활성화`);
					await new Promise((resolve) => setTimeout(resolve, 2000));
					result = {
						is_trending: Math.random() > 0.5, // 랜덤 트렌딩 상태
						trend_data: generateSampleTrendData()
					};
				} else {
					// API 키 확인 - RapidAPI 키 사용
					const RAPIDAPI_KEY =
						env.RAPIDAPI_KEY || '86b90e5545msh81d89fe46e5d3b4p1093d4jsnae2aa72fe381';
					console.log(`[로그] API 키 존재 여부: ${!!RAPIDAPI_KEY}`);

					if (!RAPIDAPI_KEY) {
						console.error(`[로그] API 키 누락`);
						throw new Error('RAPIDAPI_KEY is not set in environment variables');
					}

					// 실제 API 호출
					console.log(`[로그] RocketAPI Instagram 해시태그 상세 정보 호출 시작`);
					result = await fetchHashtagDetailInfo(query, RAPIDAPI_KEY);
				}

				console.log(`[로그] 상세 정보 응답 반환:`, result);
				return new Response(JSON.stringify(result), {
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				});
			} catch (error) {
				const errorMessage = error.message || 'An unknown error occurred';
				console.error(`[로그] 상세 정보 오류 발생:`, errorMessage);
				return new Response(JSON.stringify({ error: errorMessage }), {
					status: 500,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				});
			}
		}

		// 다른 경로에 대한 처리
		console.log(`[로그] 일치하는 경로 없음`);
		return new Response(JSON.stringify({ error: 'Not found' }), {
			status: 404,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	}
};
