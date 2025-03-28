// Hashtagy API를 이용한 해시태그 정보 조회 함수
async function fetchHashtagInfo(query, apiKey) {
	try {
		// # 기호 제거
		const cleanQuery = query.replace(/^#/, '').trim();
		console.log(`[로그] 정제된 해시태그: ${cleanQuery}`);

		// Hashtagy API 호출 - 하나의 엔드포인트로 모든 정보 가져오기
		const hashtagResponse = await fetch(
			`https://hashtagy-generate-hashtags.p.rapidapi.com/v1/insta/tags?keyword=${encodeURIComponent(cleanQuery)}&include_tags_info=true`,
			{
				method: 'GET',
				headers: {
					'x-rapidapi-key': apiKey,
					'x-rapidapi-host': 'hashtagy-generate-hashtags.p.rapidapi.com'
				}
			}
		);

		console.log(`[로그] 해시태그 정보 응답 상태: ${hashtagResponse.status}`);

		if (!hashtagResponse.ok) {
			const errorStatus = hashtagResponse.status;
			const errorBody = await hashtagResponse.text().catch(() => '');
			console.error(`[로그] 해시태그 정보 오류: ${errorStatus} - ${errorBody}`);

			// 402 또는 429 오류 처리 (API 호출 한도 등)
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

			throw new Error(`Hashtagy API 오류: ${errorStatus} - ${errorBody}`);
		}

		// API 응답 파싱
		const responseData = await hashtagResponse.json();
		console.log(`[로그] 해시태그 정보 응답 데이터:`, responseData);

		// 응답 유효성 검사
		if (
			responseData.status !== 'ok' ||
			!responseData.data ||
			!Array.isArray(responseData.data.hashtags)
		) {
			console.error(`[로그] 유효하지 않은 API 응답:`, responseData);
			throw new Error('유효하지 않은 API 응답');
		}

		// 결과 데이터 추출 및 가공
		const hashtagsData = responseData.data.hashtags;

		// 검색한 해시태그에 대한 정보 추출
		const mainHashtagInfo = hashtagsData.find(
			(tag) => tag.hashtag.toLowerCase() === cleanQuery.toLowerCase()
		);

		// 게시물 수 (media_count) 추출
		const mediaCount = mainHashtagInfo ? mainHashtagInfo.total_posts : 0;

		// 관련 해시태그 목록 추출 (원본 해시태그 제외)
		const relatedHashtagsList = hashtagsData
			.filter((tag) => tag.hashtag.toLowerCase() !== cleanQuery.toLowerCase())
			.map((tag) => tag.hashtag)
			.filter(Boolean);

		console.log(`[로그] 최종 결과:`, {
			media_count: mediaCount,
			related_hashtags: relatedHashtagsList
		});

		return {
			media_count: mediaCount,
			related_hashtags: relatedHashtagsList
		};
	} catch (error) {
		console.error('[로그] 해시태그 정보 조회 중 오류 발생:', error);
		throw error;
	}
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
					console.log(`[로그] Hashtagy API 호출 시작`);
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

		// 다른 경로에 대한 처리
		console.log(`[로그] 일치하는 경로 없음`);
		return new Response(JSON.stringify({ error: 'Not found' }), {
			status: 404,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	}
};
