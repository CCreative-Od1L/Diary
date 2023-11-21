export function OnDbRequestError(request: IDBOpenDBRequest, callback: (ev: Event) => {}) {
    request.addEventListener('error', callback);
}