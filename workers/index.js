// HikerAPI 호출을 위한 함수
async function fetchHashtagInfo(query, apiKey) {
	try {
		// 해시태그 정보 가져오기
		const hashtagInfoResponse = await fetch(
			`https://api.hikerapi.com/v1/hashtag/by/name?name=${query}`,
			{
				headers: { 'x-access-key': apiKey }
			}
		);

		if (!hashtagInfoResponse.ok) {
			const errorStatus = hashtagInfoResponse.status;
			const errorBody = await hashtagInfoResponse.text().catch(() => '');

			// 402 오류 처리
			if (errorStatus === 402) {
				console.error(
					`Payment required for HikerAPI. Status: ${errorStatus}, Response: ${errorBody}`
				);
				// 여기서 디버그 모드 결과를 반환하여 에러 발생하지 않도록 함
				return {
					media_count: 12345,
					related_hashtags: Array.from({ length: 20 }, (_, i) => `example${i + 1}`),
					note: 'API 호출 한도에 도달했습니다. 현재 데모 데이터를 표시합니다.'
				};
			}

			throw new Error(`HikerAPI 해시태그 정보 오류: ${errorStatus} - ${errorBody}`);
		}
		const relatedHashtags = await relatedHashtagsResponse.json();

		// 결과 처리
		const mediaCount = hashtagInfo.media_count || 0;
		let relatedHashtagsList = [];

		if (Array.isArray(relatedHashtags)) {
			relatedHashtagsList = relatedHashtags.map((tag) => tag.name).filter(Boolean);
		} else if (relatedHashtags && relatedHashtags.hashtags) {
			relatedHashtagsList = relatedHashtags.hashtags.map((tag) => tag.name).filter(Boolean);
		}

		return {
			media_count: mediaCount,
			related_hashtags: relatedHashtagsList
		};
	} catch (error) {
		console.error('Error fetching hashtag info:', error);
		throw error;
	}
}

// Worker 핸들러
export default {
	async fetch(request, env, ctx) {
		// CORS 헤더 설정
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type'
		};

		// OPTIONS 요청 처리 (CORS preflight)
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		const url = new URL(request.url);

		// /api/search 엔드포인트 처리
		if (url.pathname === '/api/search' && request.method === 'GET') {
			const query = url.searchParams.get('query');
			const debugMode = url.searchParams.get('debugMode') === 'true';

			if (!query) {
				return new Response(JSON.stringify({ error: 'Query parameter is required' }), {
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				});
			}

			try {
				let result;

				if (debugMode) {
					// 디버그 모드 처리
					await new Promise((resolve) => setTimeout(resolve, 3000));
					result = {
						media_count: 12345,
						related_hashtags: Array.from({ length: 20 }, (_, i) => `example${i + 1}`)
					};
				} else {
					// API 키 확인
					const HIKERAPI_KEY = env.HIKERAPI_KEY;

					if (!HIKERAPI_KEY) {
						throw new Error('HIKERAPI_KEY is not set in environment variables');
					}

					// 실제 API 호출
					result = await fetchHashtagInfo(query, HIKERAPI_KEY);
				}

				return new Response(JSON.stringify(result), {
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				});
			} catch (error) {
				const errorMessage = error.message || 'An unknown error occurred';
				return new Response(JSON.stringify({ error: errorMessage }), {
					status: 500,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' }
				});
			}
		}

		// 다른 경로에 대한 처리
		return new Response(JSON.stringify({ error: 'Not found' }), {
			status: 404,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	}
};
