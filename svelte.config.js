import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			// Vercel의 서버리스 함수를 사용하기 위한 설정
			runtime: 'nodejs18.x'
		})
	}
};

export default config;
