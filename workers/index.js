// HikerAPI 호출을 위한 함수 수정
async function fetchHashtagInfo(query, apiKey) {
	try {
		console.log(`[로그] 해시태그 정보 가져오기 시작 - 쿼리: ${query}`);

		// 해시태그 정보 가져오기
		const hashtagInfoResponse = await fetch(
			`https://api.hikerapi.com/v1/hashtag/by/name?name=${query}`,
			{
				headers: { 'x-access-key': apiKey }
			}
		);

		console.log(`[로그] 해시태그 정보 응답 상태: ${hashtagInfoResponse.status}`);

		if (!hashtagInfoResponse.ok) {
			const errorStatus = hashtagInfoResponse.status;
			const errorBody = await hashtagInfoResponse.text().catch(() => '');
			console.error(`[로그] 해시태그 정보 오류: ${errorStatus} - ${errorBody}`);

			// 402 오류 처리
			if (errorStatus === 402) {
				console.error(`[로그] Payment required for HikerAPI. Status: ${errorStatus}`);
				return {
					media_count: 12345,
					related_hashtags: Array.from({ length: 20 }, (_, i) => `example${i + 1}`),
					note: 'API 호출 한도에 도달했습니다. 현재 데모 데이터를 표시합니다.'
				};
			}

			throw new Error(`HikerAPI 해시태그 정보 오류: ${errorStatus} - ${errorBody}`);
		}

		// 해시태그 정보 파싱
		const hashtagInfo = await hashtagInfoResponse.json();
		console.log(`[로그] 해시태그 정보 응답 데이터:`, hashtagInfo);

		// 관련 해시태그 가져오기
		console.log(`[로그] 관련 해시태그 가져오기 시작 - 쿼리: ${query}`);

		// Flask 코드와 유사하게 검색 엔드포인트 사용
		const relatedHashtagsResponse = await fetch(
			`https://api.hikerapi.com/v1/search/hashtags?q=${query}`,
			{
				headers: { 'x-access-key': apiKey }
			}
		);

		console.log(`[로그] 관련 해시태그 응답 상태: ${relatedHashtagsResponse.status}`);

		if (!relatedHashtagsResponse.ok) {
			const errorStatus = relatedHashtagsResponse.status;
			const errorBody = await relatedHashtagsResponse.text().catch(() => '');
			console.error(`[로그] 관련 해시태그 오류: ${errorStatus} - ${errorBody}`);

			// 관련 해시태그를 가져오는데 실패하면 빈 배열 반환
			return {
				media_count: hashtagInfo.media_count || 0,
				related_hashtags: [],
				error_related: `관련 해시태그 가져오기 실패: ${errorStatus}`
			};
		}

		const relatedHashtags = await relatedHashtagsResponse.json();
		console.log(`[로그] 관련 해시태그 응답 데이터:`, relatedHashtags);

		// 결과 처리
		const mediaCount = hashtagInfo.media_count || 0;
		let relatedHashtagsList = [];

		// Flask 코드와 유사하게 데이터 처리
		if (Array.isArray(relatedHashtags)) {
			relatedHashtagsList = relatedHashtags
				.filter((tag) => tag && typeof tag === 'object')
				.map((tag) => tag.name)
				.filter(Boolean);
		} else if (relatedHashtags && Array.isArray(relatedHashtags.hashtags)) {
			relatedHashtagsList = relatedHashtags.hashtags
				.filter((tag) => tag && typeof tag === 'object')
				.map((tag) => tag.name)
				.filter(Boolean);
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
					// API 키 확인
					const HIKERAPI_KEY = env.HIKERAPI_KEY;
					console.log(`[로그] API 키 존재 여부: ${!!HIKERAPI_KEY}`);

					if (!HIKERAPI_KEY) {
						console.error(`[로그] API 키 누락`);
						throw new Error('HIKERAPI_KEY is not set in environment variables');
					}

					// 실제 API 호출
					console.log(`[로그] HikerAPI 호출 시작`);
					result = await fetchHashtagInfo(query, HIKERAPI_KEY);
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
