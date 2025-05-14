export async function tryCatch<T>(
  promise: PromiseLike<T>,
): Promise<[T, null] | [null, Error]> {
  try {
    const result = await promise;
    return [result, null];
  } catch (error) {
    return [null, error instanceof Error ? error : Error(String(error))];
  }
}
