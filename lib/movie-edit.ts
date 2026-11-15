/** Update the visible value immediately and restore it if persistence fails. */
export async function saveMovieOptimistically(
  previousValue: string,
  nextValue: string,
  persist: (movie: string) => Promise<string>,
  onValueChange: (movie: string) => void
): Promise<string> {
  onValueChange(nextValue);
  try {
    const savedValue = await persist(nextValue);
    onValueChange(savedValue);
    return savedValue;
  } catch (error) {
    onValueChange(previousValue);
    throw error;
  }
}
