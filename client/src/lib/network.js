import wretch from 'wretch';
export function getApi() {
    return wretch('http://localhost:3001/api')
        .customError(() => {
            throw new Error('Server not reachable');
        })
        .middlewares([
            (next) => {
                return async (url, opts) => {
                    try {
                        const response = await next(url, opts);
                        if (!response.ok) {
                            const json = await response.clone().json();
                            if (json.error) throw new Error(json.error);
                            else throw new Error('Unknown error');
                        }
                        return response;
                    } catch (err) {
                        throw err;
                    }
                };
            },
        ]);
}
